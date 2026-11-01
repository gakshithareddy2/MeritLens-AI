import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/db.js';
import { runMLPrediction, ML_WEIGHTS, generateStudentRecommendations } from './server/mlEngine.js';
import {
  MLPredictionInput,
  ClassMetrics,
  UserRole
} from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';

app.use(express.json());

// Initialize Gemini API client if API key is present
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client init note:', err);
  }
}

// ----------------------------------------------------
// Authentication & Role-Based Middleware
// ----------------------------------------------------
interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  studentId?: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Simple token extractor (Format: "token-[userId]-[role]-[studentId or null]")
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token.startsWith('demo-token-')) {
    const parts = token.replace('demo-token-', '').split('__');
    const [userId, role, studentId] = parts;
    const user = db.getUserById(userId);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        name: user.name,
      };
    } else {
      req.user = {
        id: userId,
        email: 'user@meritlens.edu',
        role: role as UserRole,
        studentId: studentId !== 'none' ? studentId : undefined,
        name: role === 'teacher' ? 'Faculty Instructor' : 'Student Scholar',
      };
    }
  }
  next();
};

app.use(authMiddleware);

// Guard: Require authenticated user
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  next();
};

// Guard: Require Teacher role
const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Forbidden: Access restricted to authorized instructors.' });
  }
  next();
};

// ----------------------------------------------------
// REST API Routes
// ----------------------------------------------------

// 1. Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  const validPassword = user && (
    user.passwordHash.startsWith('scrypt$')
      ? (() => {
          const parts = user.passwordHash.split('$');
          const salt = parts[1];
          const expected = parts[2];
          const actual = crypto.scryptSync(password, salt, 64).toString('hex');
          return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
        })()
      : user.passwordHash === password
  );
  if (!user || !validPassword) {
    return res.status(401).json({ error: 'Invalid credentials. Check demo accounts.' });
  }

  const token = `demo-token-${user.id}__${user.role}__${user.studentId || 'none'}`;
  const { passwordHash, ...safeUser } = user;

  res.json({
    token,
    user: safeUser,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, studentId } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  let cleanStudentId = typeof studentId === 'string' ? studentId.trim() : '';
  if (!cleanName || !cleanEmail || !password) {
    return res.status(400).json({ error: 'Please enter your name, email, and password.' });
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Use a password with at least 8 characters.' });
  }
  if (db.getUserByEmail(cleanEmail)) {
    return res.status(409).json({ error: 'This email is already registered. Please sign in instead.' });
  }
  if (db.getStudents().some(s => s.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ error: 'This email is already linked to a student. Please sign in or contact your teacher.' });
  }
  if (!cleanStudentId) {
    const usedIds = new Set(db.getStudents().map(s => s.id));
    let next = db.getStudents().length + 1;
    do {
      cleanStudentId = `STU${String(next++).padStart(3, '0')}`;
    } while (usedIds.has(cleanStudentId));
  } else if (db.getStudentById(cleanStudentId)) {
    return res.status(409).json({ error: 'This student ID is already in use.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = `scrypt$${salt}$${crypto.scryptSync(String(password), salt, 64).toString('hex')}`;
  const student = db.addStudent({
    id: cleanStudentId,
    name: cleanName,
    email: cleanEmail,
    class: 'Not assigned',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    attendance: 0,
    assignmentCompletion: 0,
    studyHoursWeek: 0,
    previousMarks: 0,
    currentScore: 0,
    predictedScore: 0,
    performanceCategory: 'Pass',
    riskLevel: 'Moderate',
    subjects: [
      { subject: 'Mathematics', score: 0, attendance: 0, assignments: 0, teacher: 'Not assigned' },
      { subject: 'Science', score: 0, attendance: 0, assignments: 0, teacher: 'Not assigned' },
      { subject: 'English', score: 0, attendance: 0, assignments: 0, teacher: 'Not assigned' },
      { subject: 'History', score: 0, attendance: 0, assignments: 0, teacher: 'Not assigned' }
    ],
    historicalTrends: [],
    strengths: [],
    improvementAreas: ['Add your marks and attendance with your teacher'],
    parentContact: '',
    joinedDate: new Date().toISOString().split('T')[0]
  });

  const starterRecommendations = generateStudentRecommendations({
    id: student.id,
    name: student.name,
    attendance: student.attendance,
    assignmentCompletion: student.assignmentCompletion,
    studyHoursWeek: student.studyHoursWeek,
    subjects: student.subjects,
  });
  starterRecommendations.forEach((recommendation) => db.addRecommendation(recommendation));

  const user = db.addUser({
    id: `USR-${cleanStudentId}`,
    email: cleanEmail,
    name: cleanName,
    role: 'student',
    studentId: student.id,
    avatar: student.avatar,
    passwordHash
  });

  const token = `demo-token-${user.id}__${user.role}__${student.id}`;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return res.status(201).json({ token, user: safeUser });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = db.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// 2. Class Metrics (Teacher only)

// Teacher-managed subject catalogue. Saved separately so it survives restarts.
// Keep subject catalogue beside the project database even if started from another working directory.
const SUBJECTS_FILE = path.resolve(__dirname, 'data', 'subjects.json');
const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'History'];
function getSubjectCatalogue(): string[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(SUBJECTS_FILE, 'utf8'));
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) return parsed;
  } catch {}
  fs.mkdirSync(path.dirname(SUBJECTS_FILE), { recursive: true });
  fs.writeFileSync(SUBJECTS_FILE, JSON.stringify(DEFAULT_SUBJECTS, null, 2));
  return [...DEFAULT_SUBJECTS];
}
function saveSubjectCatalogue(subjects: string[]) {
  fs.writeFileSync(SUBJECTS_FILE, JSON.stringify(subjects, null, 2));
}
app.get('/api/subjects', requireAuth, (_req: Request, res: Response) => res.json(getSubjectCatalogue()));
app.post('/api/subjects', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  if (!name || name.length > 60) return res.status(400).json({ error: 'Enter a subject name up to 60 characters.' });
  const subjects = getSubjectCatalogue();
  if (subjects.some((item) => item.toLowerCase() === name.toLowerCase())) return res.status(409).json({ error: 'That subject already exists.' });
  subjects.push(name);
  saveSubjectCatalogue(subjects);
  // Add the subject to every existing student with an editable starting mark and refresh derived metrics.
  db.getStudents().forEach((student) => {
    if (!student.subjects.some((item) => item.subject.toLowerCase() === name.toLowerCase())) {
      recalculateStudentRecord(student, [...student.subjects, { subject: name, score: 0, attendance: student.attendance, assignments: student.assignmentCompletion, teacher: 'Unassigned' }]);
    }
  });
  res.status(201).json(subjects);
});
app.delete('/api/subjects/:name', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name).trim();
  const subjects = getSubjectCatalogue();
  if (DEFAULT_SUBJECTS.some((item) => item.toLowerCase() === name.toLowerCase())) return res.status(400).json({ error: 'Core subjects cannot be removed. You can edit their marks.' });
  const next = subjects.filter((item) => item.toLowerCase() !== name.toLowerCase());
  if (next.length === subjects.length) return res.status(404).json({ error: 'Subject not found.' });
  saveSubjectCatalogue(next);
  db.getStudents().forEach((student) => recalculateStudentRecord(student, student.subjects.filter((item) => item.subject.toLowerCase() !== name.toLowerCase())));
  res.json(next);
});

// Teacher-managed class catalogue. Existing classes are retained and new classes persist across restarts.
const CLASSES_FILE = path.resolve(__dirname, 'data', 'classes.json');
const DEFAULT_CLASSES = ['Class 10-A', 'Class 10-B', 'Class 11-A', 'Class 12-Sci'];
function getClassCatalogue(): string[] {
  try { const parsed = JSON.parse(fs.readFileSync(CLASSES_FILE, 'utf8')); if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) return parsed; } catch {}
  fs.mkdirSync(path.dirname(CLASSES_FILE), { recursive: true });
  fs.writeFileSync(CLASSES_FILE, JSON.stringify(DEFAULT_CLASSES, null, 2));
  return [...DEFAULT_CLASSES];
}
function saveClassCatalogue(classes: string[]) { fs.writeFileSync(CLASSES_FILE, JSON.stringify(classes, null, 2)); }
app.get('/api/classes', requireAuth, (_req: Request, res: Response) => res.json(getClassCatalogue()));
app.post('/api/classes', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  if (!name || name.length > 60) return res.status(400).json({ error: 'Enter a class name up to 60 characters.' });
  const classes = getClassCatalogue();
  if (classes.some((item) => item.toLowerCase() === name.toLowerCase())) return res.status(409).json({ error: 'That class already exists.' });
  classes.push(name); saveClassCatalogue(classes); res.status(201).json(classes);
});
app.delete('/api/classes/:name', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name).trim();
  if (DEFAULT_CLASSES.some((item) => item.toLowerCase() === name.toLowerCase())) return res.status(400).json({ error: 'Default classes cannot be removed.' });
  if (db.getStudents().some((student) => student.class.toLowerCase() === name.toLowerCase())) return res.status(409).json({ error: 'This class still has students. Move them to another class before removing it.' });
  const classes = getClassCatalogue(); const next = classes.filter((item) => item.toLowerCase() !== name.toLowerCase());
  if (next.length === classes.length) return res.status(404).json({ error: 'Class not found.' });
  saveClassCatalogue(next); res.json(next);
});

app.get('/api/metrics', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const students = db.getStudents();
  if (students.length === 0) {
    return res.json({
      totalStudents: 0,
      classAverageMarks: 0,
      averageAttendance: 0,
      assignmentCompletionRate: 0,
      studentsAtRiskCount: 0,
      studentsDistinctionCount: 0,
      studentsMeritCount: 0,
      studentsPassCount: 0,
      subjectAverages: [],
      attendanceVsMarks: [],
      historicalPerformance: [],
    });
  }

  const total = students.length;
  const avgMarks = Math.round((students.reduce((acc, s) => acc + s.currentScore, 0) / total) * 10) / 10;
  const avgAttendance = Math.round((students.reduce((acc, s) => acc + s.attendance, 0) / total) * 10) / 10;
  const avgAssignment = Math.round((students.reduce((acc, s) => acc + s.assignmentCompletion, 0) / total) * 10) / 10;

  const atRisk = students.filter(s => s.performanceCategory === 'At Risk').length;
  const distinction = students.filter(s => s.performanceCategory === 'Distinction').length;
  const merit = students.filter(s => s.performanceCategory === 'Merit').length;
  const pass = students.filter(s => s.performanceCategory === 'Pass').length;

  // Aggregate subjects
  const subjectMap: Record<string, { totalScore: number; count: number; passing: number }> = {};
  students.forEach(s => {
    s.subjects.forEach(sub => {
      if (!subjectMap[sub.subject]) {
        subjectMap[sub.subject] = { totalScore: 0, count: 0, passing: 0 };
      }
      subjectMap[sub.subject].totalScore += sub.score;
      subjectMap[sub.subject].count += 1;
      if (sub.score >= 60) subjectMap[sub.subject].passing += 1;
    });
  });

  const subjectAverages = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    averageScore: Math.round((data.totalScore / data.count) * 10) / 10,
    passingRate: Math.round((data.passing / data.count) * 100),
  }));

  const attendanceVsMarks = students.map(s => ({
    studentName: s.name,
    attendance: s.attendance,
    marks: s.currentScore,
    riskLevel: s.riskLevel,
  }));

  const historicalPerformance = [
    { term: 'Term 1', averageMarks: 73.2, averageAttendance: 84.1 },
    { term: 'Term 2', averageMarks: 74.8, averageAttendance: 83.5 },
    { term: 'Mid-Term', averageMarks: 75.6, averageAttendance: 82.9 },
    { term: 'Term 3', averageMarks: 76.4, averageAttendance: 83.8 },
    { term: 'Pre-Board', averageMarks: avgMarks, averageAttendance: avgAttendance },
  ];

  const metrics: ClassMetrics = {
    totalStudents: total,
    classAverageMarks: avgMarks,
    averageAttendance: avgAttendance,
    assignmentCompletionRate: avgAssignment,
    studentsAtRiskCount: atRisk,
    studentsDistinctionCount: distinction,
    studentsMeritCount: merit,
    studentsPassCount: pass,
    subjectAverages,
    attendanceVsMarks,
    historicalPerformance,
  };

  res.json(metrics);
});

// 3. Students Management
app.get('/api/students', requireAuth, (req: Request, res: Response) => {
  // If student role, they can only see themselves
  if (req.user?.role === 'student') {
    const student = db.getStudentById(req.user.studentId || '');
    return res.json(student ? [student] : []);
  }

  // Teacher role gets all students
  const students = db.getStudents();
  res.json(students);
});

app.get('/api/students/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;

  // Authorization enforcement: Students may ONLY view their own profile
  if (req.user?.role === 'student' && req.user.studentId !== id) {
    return res.status(403).json({ error: 'Forbidden: You are not authorized to view other students’ records.' });
  }

  const student = db.getStudentById(id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }
  res.json(student);
});

function categoryFromActualScore(score: number): 'Distinction' | 'Merit' | 'Pass' | 'At Risk' {
  if (score >= 85) return 'Distinction';
  if (score >= 72) return 'Merit';
  if (score >= 60) return 'Pass';
  return 'At Risk';
}

function recalculateStudentRecord(student: any, subjectList: any[]) {
  const safeSubjects = subjectList.map((item) => ({ ...item, score: Math.max(0, Math.min(100, Number(item.score) || 0)) }));
  const currentScore = safeSubjects.length ? Math.round((safeSubjects.reduce((sum, item) => sum + item.score, 0) / safeSubjects.length) * 10) / 10 : 0;
  const scores = Object.fromEntries(safeSubjects.map((item) => [item.subject, item.score]));
  const prediction = runMLPrediction({
    previousMarks: Number(student.previousMarks ?? currentScore),
    attendance: Math.max(0, Math.min(100, Number(student.attendance) || 0)),
    assignmentCompletion: Math.max(0, Math.min(100, Number(student.assignmentCompletion) || 0)),
    studyHoursWeek: Math.max(0, Number(student.studyHoursWeek) || 0),
    mathScore: scores.Mathematics ?? currentScore, scienceScore: scores.Science ?? currentScore,
    englishScore: scores.English ?? currentScore, historyScore: scores.History ?? currentScore,
    subjectScores: scores,
  });
  return db.updateStudent(student.id, {
    subjects: safeSubjects,
    currentScore,
    predictedScore: prediction.predictedScore,
    performanceCategory: categoryFromActualScore(currentScore),
    riskLevel: prediction.riskLevel,
    improvementAreas: prediction.learningGaps.slice(0, 3),
  });
}

app.post('/api/students', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const { name, email, class: studentClass, attendance, assignmentCompletion, studyHoursWeek, subjects } = req.body;

  if (!name || !email || !studentClass) {
    return res.status(400).json({ error: 'Name, email, and class are required.' });
  }

  // Calculate scores
  const mathScore = subjects?.find((s: any) => s.subject === 'Mathematics')?.score ?? 70;
  const scienceScore = subjects?.find((s: any) => s.subject === 'Science')?.score ?? 70;
  const englishScore = subjects?.find((s: any) => s.subject === 'English')?.score ?? 75;
  const historyScore = subjects?.find((s: any) => s.subject === 'History')?.score ?? 70;
  const subjectList = subjects && subjects.length ? subjects : [
    { subject: 'Mathematics', score: mathScore, attendance: attendance ?? 80, assignments: assignmentCompletion ?? 80, teacher: 'Mr. Harrison' },
    { subject: 'Science', score: scienceScore, attendance: attendance ?? 80, assignments: assignmentCompletion ?? 80, teacher: 'Dr. Evelyn Vance' },
    { subject: 'English', score: englishScore, attendance: attendance ?? 80, assignments: assignmentCompletion ?? 80, teacher: 'Ms. Albright' },
    { subject: 'History', score: historyScore, attendance: attendance ?? 80, assignments: assignmentCompletion ?? 80, teacher: 'Mr. Sterling' },
  ];

  const currentScore = Math.round((subjectList.reduce((sum: number, item: any) => sum + Number(item.score || 0), 0) / Math.max(1, subjectList.length)) * 10) / 10;

  // Run ML evaluation
  const mlRes = runMLPrediction({
    previousMarks: currentScore,
    attendance: attendance ?? 80,
    assignmentCompletion: assignmentCompletion ?? 80,
    studyHoursWeek: studyHoursWeek ?? 10,
    mathScore,
    scienceScore,
    englishScore,
    historyScore,
    subjectScores: Object.fromEntries(subjectList.map((item: any) => [item.subject, Number(item.score || 0)])),
  });

  const newStudent = db.addStudent({
    name,
    email,
    class: studentClass,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    attendance: attendance ?? 80,
    assignmentCompletion: assignmentCompletion ?? 80,
    studyHoursWeek: studyHoursWeek ?? 10,
    previousMarks: currentScore,
    currentScore,
    predictedScore: mlRes.predictedScore,
    performanceCategory: categoryFromActualScore(currentScore),
    riskLevel: mlRes.riskLevel,
    subjects: subjectList,
    historicalTrends: [
      { term: 'Term 1', score: currentScore - 2, attendance: (attendance ?? 80) - 2 },
      { term: 'Term 2', score: currentScore - 1, attendance: (attendance ?? 80) - 1 },
      { term: 'Mid-Term', score: currentScore, attendance: attendance ?? 80 },
    ],
    strengths: ['Analytical foundations', 'Class curiosity'],
    improvementAreas: mlRes.learningGaps.slice(0, 2),
    parentContact: `parent.${email}`,
    joinedDate: new Date().toISOString().split('T')[0],
  });

  // Automatically generate baseline study recommendations
  const initialRecs = generateStudentRecommendations({
    id: newStudent.id,
    name: newStudent.name,
    attendance: newStudent.attendance,
    assignmentCompletion: newStudent.assignmentCompletion,
    studyHoursWeek: newStudent.studyHoursWeek,
    subjects: newStudent.subjects,
  });

  initialRecs.forEach(r => db.addRecommendation(r));

  res.status(201).json(newStudent);
});

app.put('/api/students/:id', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getStudentById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const merged = { ...existing, ...req.body } as any;
  const subjects = Array.isArray(merged.subjects) ? merged.subjects.map((item: any) => ({ ...item, score: Math.max(0, Math.min(100, Number(item.score) || 0)) })) : existing.subjects;
  const currentScore = subjects.length ? Math.round((subjects.reduce((sum: number, item: any) => sum + item.score, 0) / subjects.length) * 10) / 10 : 0;
  const scores = Object.fromEntries(subjects.map((item: any) => [item.subject, item.score]));
  const prediction = runMLPrediction({
    previousMarks: Number(merged.previousMarks ?? existing.previousMarks ?? currentScore),
    attendance: Math.max(0, Math.min(100, Number(merged.attendance ?? existing.attendance))),
    assignmentCompletion: Math.max(0, Math.min(100, Number(merged.assignmentCompletion ?? existing.assignmentCompletion))),
    studyHoursWeek: Math.max(0, Number(merged.studyHoursWeek ?? existing.studyHoursWeek)),
    mathScore: scores.Mathematics ?? currentScore, scienceScore: scores.Science ?? currentScore,
    englishScore: scores.English ?? currentScore, historyScore: scores.History ?? currentScore,
    subjectScores: scores,
  });
  const updated = db.updateStudent(id, {
    ...req.body,
    subjects,
    currentScore,
    predictedScore: prediction.predictedScore,
    performanceCategory: categoryFromActualScore(currentScore),
    riskLevel: prediction.riskLevel,
    improvementAreas: prediction.learningGaps.slice(0, 3),
    historicalTrends: [...(existing.historicalTrends || []).slice(-4), { term: `Updated ${new Date().toLocaleDateString('en-GB')}`, score: currentScore, attendance: Number(merged.attendance ?? existing.attendance) }],
  });
  res.json(updated);
});

app.delete('/api/students/:id', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteStudent(id);
  if (!success) {
    return res.status(404).json({ error: 'Student not found or already deleted.' });
  }
  res.json({ message: 'Student successfully removed.', studentId: id });
});

// 4. ML Predictions Endpoint
app.post('/api/ml/predict', (req: Request, res: Response) => {
  const {
    previousMarks = 75,
    attendance = 80,
    assignmentCompletion = 75,
    studyHoursWeek = 10,
    mathScore = 70,
    scienceScore = 72,
    englishScore = 76,
    historyScore = 70,
  } = req.body;

  const input: MLPredictionInput = {
    previousMarks: Number(previousMarks),
    attendance: Number(attendance),
    assignmentCompletion: Number(assignmentCompletion),
    studyHoursWeek: Number(studyHoursWeek),
    mathScore: Number(mathScore),
    scienceScore: Number(scienceScore),
    englishScore: Number(englishScore),
    historyScore: Number(historyScore),
  };

  const result = runMLPrediction(input);
  res.json(result);
});

// 5. Study Recommendations (Highest Priority)
app.get('/api/recommendations', requireAuth, (req: Request, res: Response) => {
  // If student role, enforce scoping to their studentId
  if (req.user?.role === 'student') {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.json([]);
    }
    const recs = db.getRecommendations(studentId);
    return res.json(recs);
  }

  // Teacher can optionally filter by query param ?studentId=STU001
  const studentIdQuery = req.query.studentId as string | undefined;
  const recs = db.getRecommendations(studentIdQuery);
  res.json(recs);
});

app.post('/api/recommendations', requireAuth, (req: Request, res: Response) => {
  const { studentId, subject, topic, reason, action, suggestedTimeMinutes, priority } = req.body;
  if (!studentId || !subject || !topic || !action) {
    return res.status(400).json({ error: 'studentId, subject, topic, and action are required.' });
  }

  const student = db.getStudentById(studentId);
  const newRec = db.addRecommendation({
    studentId,
    studentName: student ? student.name : 'Enrolled Student',
    subject,
    topic,
    reason: reason || 'Teacher prescribed targeted improvement action.',
    action,
    suggestedTimeMinutes: Number(suggestedTimeMinutes) || 40,
    priority: priority || 'Medium',
    status: 'Pending',
    aiGenerated: req.body.aiGenerated || false,
  });

  res.status(201).json(newRec);
});

app.patch('/api/recommendations/:id/status', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Pending, In Progress, or Completed.' });
  }

  const rec = db.getRecommendationById(id);
  if (!rec) {
    return res.status(404).json({ error: 'Recommendation not found.' });
  }

  // If student role, verify ownership
  if (req.user?.role === 'student' && req.user.studentId !== rec.studentId) {
    return res.status(403).json({ error: 'Forbidden: You can only update your own recommendations.' });
  }

  const updated = db.updateRecommendationStatus(id, status);
  res.json(updated);
});

// 6. Study Goals
app.get('/api/goals', requireAuth, (req: Request, res: Response) => {
  if (req.user?.role === 'student') {
    const goals = db.getGoals(req.user.studentId);
    return res.json(goals);
  }

  const studentIdQuery = req.query.studentId as string | undefined;
  const goals = db.getGoals(studentIdQuery);
  res.json(goals);
});

app.post('/api/goals', requireAuth, (req: Request, res: Response) => {
  const { title, subject, targetDate, notes, durationMinutes } = req.body;
  const studentId = req.user?.role === 'student' ? req.user.studentId : req.body.studentId;

  if (!studentId || !title || !subject) {
    return res.status(400).json({ error: 'Title, subject, and student are required.' });
  }

  const newGoal = db.addGoal({
    studentId,
    title,
    subject,
    targetDate: targetDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    progress: 0,
    status: 'Active',
    notes: notes || '',
    durationMinutes: Math.max(1, Math.min(1440, Number(durationMinutes) || 30)),
  });

  res.status(201).json(newGoal);
});

app.patch('/api/goals/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const existingGoal = db.getGoals().find((goal) => goal.id === id);
  if (!existingGoal) return res.status(404).json({ error: 'Study goal not found.' });
  if (req.user?.role === 'student' && existingGoal.studentId !== req.user.studentId) return res.status(403).json({ error: 'You can only update your own goals.' });
  const { progress, status, notes } = req.body;
  const normalizedProgress = progress !== undefined ? Math.max(0, Math.min(100, Number(progress) || 0)) : (status === 'Completed' ? 100 : status === 'Active' ? 0 : existingGoal.progress);
  const normalizedStatus = normalizedProgress >= 100 ? 'Completed' : 'Active';
  const updated = db.updateGoal(id, { progress: normalizedProgress, status: normalizedStatus, notes });

  if (!updated) {
    return res.status(404).json({ error: 'Study goal not found.' });
  }
  res.json(updated);
});

app.delete('/api/goals/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteGoal(id);
  if (!success) {
    return res.status(404).json({ error: 'Goal not found.' });
  }
  res.json({ message: 'Goal removed.' });
});

// 7. Learning Memory / Interventions (Teacher Only)
app.get('/api/learning-memory', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const studentIdQuery = req.query.studentId as string | undefined;
  const logs = db.getInterventions(studentIdQuery);
  res.json(logs);
});

app.post('/api/learning-memory', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const { studentId, category, observation, actionTaken, followUpDate, outcome } = req.body;
  if (!studentId || !category || !observation || !actionTaken) {
    return res.status(400).json({ error: 'studentId, category, observation, and actionTaken are required.' });
  }

  const student = db.getStudentById(studentId);
  const log = db.addIntervention({
    studentId,
    studentName: student ? student.name : 'Student',
    teacherId: req.user!.id,
    teacherName: req.user!.name,
    date: new Date().toISOString().split('T')[0],
    category: category || 'Academic',
    observation,
    actionTaken,
    followUpDate: followUpDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    outcome: outcome || 'Ongoing',
  });

  res.status(201).json(log);
});

// 8. Gemini AI Integration Routes
app.post('/api/gemini/explain-recommendation', async (req: Request, res: Response) => {
  const { subject, topic, reason, action, studentName } = req.body;

  const defaultExplanation = {
    overview: `This topic was highlighted because concept mastery in ${topic} serves as a foundational building block for higher-order questions in ${subject}.`,
    stumblingBlocks: [
      'Confusing introductory formulas with specialized edge cases.',
      'Rushing through algebra steps without verifying intermediate signs.',
      'Limited deliberate practice under timed exam conditions.'
    ],
    strategy45Min: [
      { step: 'Minutes 0-10', title: 'Conceptual Reset', detail: 'Read concise summary sheets and review two fully-worked textbook examples.' },
      { step: 'Minutes 10-30', title: 'Active Problem Sets', detail: 'Attempt 5 foundational and 3 intermediate problems without looking at solutions.' },
      { step: 'Minutes 30-45', title: 'Error Reflection & Flashcards', detail: 'Document any missteps in a mistake journal and write quick-reference memory anchors.' }
    ],
    knowledgeCheckQuestions: [
      {
        question: `What is the primary condition required to correctly apply the fundamental theorem in ${topic}?`,
        hint: 'Review the boundary constraints and variable independence.'
      },
      {
        question: `How would you check that your numerical solution in ${subject} is physically reasonable?`,
        hint: 'Consider orders of magnitude and inverse unit operations.'
      }
    ]
  };

  if (!geminiClient) {
    return res.json({
      source: 'offline-fallback',
      explanation: defaultExplanation,
    });
  }

  try {
    const prompt = `You are an elite educational AI tutor for MeritLens AI.
Analyze this academic recommendation for student ${studentName || 'the student'}:
Subject: ${subject}
Topic: ${topic}
Pedagogical Reason: ${reason}
Current Action: ${action}

Provide an encouraging, clear, and deeply structured study breakdown formatted strictly in valid JSON with these keys:
{
  "overview": "2-3 sentences explaining why mastering this concept accelerates exam success",
  "stumblingBlocks": ["3 bullet items of common student misunderstandings"],
  "strategy45Min": [
    {"step": "0-10m", "title": "...", "detail": "..."},
    {"step": "10-30m", "title": "...", "detail": "..."},
    {"step": "30-45m", "title": "...", "detail": "..."}
  ],
  "knowledgeCheckQuestions": [
    {"question": "...", "hint": "..."},
    {"question": "...", "hint": "..."}
  ]
}
Return only valid JSON without markdown wrapping.`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      source: 'gemini-3.8-flash',
      explanation: parsed,
    });
  } catch (err) {
    console.warn('Gemini explanation fallback triggered:', err);
    return res.json({
      source: 'offline-fallback',
      explanation: defaultExplanation,
    });
  }
});

app.post('/api/gemini/tutor-chat', async (req: Request, res: Response) => {
  const { question, subject, topic } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  if (!geminiClient) {
    return res.json({
      source: 'offline-fallback',
      reply: `Great question regarding ${subject || 'your studies'}! When studying ${topic || 'this topic'}, remember to break the problem into known parameters, state the core governing rule, and test simple boundary values. For detailed guidance, review your teacher’s lecture slides and textbook chapter summaries.`,
    });
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are MeritLens AI Academic Tutor. Provide a friendly, concise, step-by-step conceptual answer to this student question:
Subject: ${subject || 'General Academic'}
Topic: ${topic || 'Core Curriculum'}
Student Question: ${question}

Keep response under 150 words. Focus on intuitive understanding and active recall.`,
    });

    return res.json({
      source: 'gemini-3.8-flash',
      reply: response.text || 'Unable to generate response at this time.',
    });
  } catch (err) {
    console.warn('Gemini chat fallback triggered:', err);
    return res.json({
      source: 'offline-fallback',
      reply: `When analyzing ${topic || 'this topic'}, verify formula assumptions first, sketch a physical or schematic diagram, and verify each algebraic step. You've got this!`,
    });
  }
});

// 9. Reset database endpoint (for test runs and evaluations)
app.post('/api/reset-data', requireAuth, requireTeacher, (req: Request, res: Response) => {
  const reset = db.resetToSeed();
  res.json({ message: 'Database successfully reset to initial seed state.', count: reset.students.length });
});

// 10. Zip Download Endpoint
app.get(['/api/download-zip', '/meritlens-ai-source.zip'], (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'meritlens-ai-source.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="meritlens-ai-source.zip"');
    return res.sendFile(zipPath);
  }
  const publicZip = path.resolve(__dirname, 'public', 'meritlens-ai-source.zip');
  if (fs.existsSync(publicZip)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="meritlens-ai-source.zip"');
    return res.sendFile(publicZip);
  }
  res.status(404).json({ error: 'Zip file not found' });
});

// ----------------------------------------------------
// Frontend Mounting (Vite in Dev, Dist in Prod)
// ----------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MeritLens AI] Full-stack server running at http://localhost:${PORT}`);
    console.log(`[MeritLens AI] If localhost does not open, try http://127.0.0.1:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
