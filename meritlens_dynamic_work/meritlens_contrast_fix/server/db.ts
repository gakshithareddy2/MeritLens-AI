import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Student,
  StudyRecommendation,
  StudyGoal,
  LearningMemoryRecord
} from '../src/types/index';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  students: Student[];
  recommendations: StudyRecommendation[];
  goals: StudyGoal[];
  interventions: LearningMemoryRecord[];
}

const DB_MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
// Anchor persistence to the project directory, not the terminal's current folder.
const DATA_DIR = path.resolve(DB_MODULE_DIR, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'meritlens_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialSeedData(): DatabaseSchema {
  const users: (User & { passwordHash: string })[] = [
    {
      id: 'USR-TEACHER-01',
      email: 'teacher@meritlens.edu',
      name: 'Dr. Evelyn Vance',
      role: 'teacher',
      department: 'Department of STEM & Academic Success',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      passwordHash: 'admin123'
    },
    {
      id: 'USR-STUDENT-01',
      email: 'mahitha@student.edu',
      name: 'Mahitha',
      role: 'student',
      studentId: 'STU001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      passwordHash: 'student123'
    },
    {
      id: 'USR-STUDENT-02',
      email: 'akshitha@student.edu',
      name: 'Akshitha',
      role: 'student',
      studentId: 'STU002',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      passwordHash: 'student123'
    },
    {
      id: 'USR-STUDENT-03',
      email: 'madhu@student.edu',
      name: 'Madhu',
      role: 'student',
      studentId: 'STU003',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      passwordHash: 'student123'
    },
    {
      id: 'USR-STUDENT-04',
      email: 'bhommi@student.edu',
      name: 'Bhommi',
      role: 'student',
      studentId: 'STU004',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      passwordHash: 'student123'
    }
  ];

  const students: Student[] = [
    {
      id: 'STU001',
      name: 'Mahitha',
      email: 'mahitha@student.edu',
      class: 'Class 10-A',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      attendance: 94.5,
      assignmentCompletion: 98.0,
      studyHoursWeek: 16.5,
      previousMarks: 88.0,
      currentScore: 90.5,
      predictedScore: 92.5,
      performanceCategory: 'Distinction',
      riskLevel: 'Low',
      subjects: [
        { subject: 'Mathematics', score: 92, attendance: 95, assignments: 98, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 89, attendance: 93, assignments: 96, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 95, attendance: 97, assignments: 100, teacher: 'Ms. Albright' },
        { subject: 'History', score: 86, attendance: 93, assignments: 98, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 85, attendance: 92 },
        { term: 'Term 2', score: 88, attendance: 94 },
        { term: 'Mid-Term', score: 89, attendance: 93 },
        { term: 'Term 3', score: 91, attendance: 96 },
        { term: 'Pre-Board', score: 90.5, attendance: 94.5 }
      ],
      strengths: ['Verbal reasoning and analytical writing', 'Autonomous time management', 'Consistent classroom engagement'],
      improvementAreas: ['History chronological source synthesis', 'Advanced calculus limit derivations'],
      parentContact: 'john.watson@parent.edu (+1-555-0192)',
      joinedDate: '2025-08-15'
    },
    {
      id: 'STU002',
      name: 'Akshitha',
      email: 'akshitha@student.edu',
      class: 'Class 10-A',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      attendance: 72.0,
      assignmentCompletion: 65.0,
      studyHoursWeek: 7.0,
      previousMarks: 68.0,
      currentScore: 65.0,
      predictedScore: 63.8,
      performanceCategory: 'Pass',
      riskLevel: 'Moderate',
      subjects: [
        { subject: 'Mathematics', score: 62, attendance: 70, assignments: 60, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 58, attendance: 68, assignments: 55, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 74, attendance: 78, assignments: 75, teacher: 'Ms. Albright' },
        { subject: 'History', score: 66, attendance: 72, assignments: 70, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 70, attendance: 78 },
        { term: 'Term 2', score: 67, attendance: 75 },
        { term: 'Mid-Term', score: 66, attendance: 73 },
        { term: 'Term 3', score: 64, attendance: 71 },
        { term: 'Pre-Board', score: 65.0, attendance: 72.0 }
      ],
      strengths: ['Strong creative writing intuition', 'Good visual problem solving in geometry'],
      improvementAreas: ['Science lab report deadlines', 'Attendance consistency in morning STEM blocks', 'Daily revision habits'],
      parentContact: 'mei.chen@parent.edu (+1-555-0188)',
      joinedDate: '2025-08-15'
    },
    {
      id: 'STU003',
      name: 'Madhu',
      email: 'madhu@student.edu',
      class: 'Class 10-B',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      attendance: 91.0,
      assignmentCompletion: 92.0,
      studyHoursWeek: 14.0,
      previousMarks: 84.0,
      currentScore: 85.2,
      predictedScore: 87.0,
      performanceCategory: 'Merit',
      riskLevel: 'Low',
      subjects: [
        { subject: 'Mathematics', score: 86, attendance: 92, assignments: 90, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 88, attendance: 94, assignments: 95, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 82, attendance: 89, assignments: 90, teacher: 'Ms. Albright' },
        { subject: 'History', score: 85, attendance: 89, assignments: 93, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 80, attendance: 88 },
        { term: 'Term 2', score: 82, attendance: 90 },
        { term: 'Mid-Term', score: 84, attendance: 91 },
        { term: 'Term 3', score: 85, attendance: 92 },
        { term: 'Pre-Board', score: 85.2, attendance: 91.0 }
      ],
      strengths: ['Analytical laboratory chemistry experimental technique', 'High homework adherence'],
      improvementAreas: ['English literature close reading analysis', 'Speed on timed multi-choice math sections'],
      parentContact: 'carlos.rodriguez@parent.edu (+1-555-0144)',
      joinedDate: '2025-08-15'
    },
    {
      id: 'STU004',
      name: 'Bhommi',
      email: 'bhommi@student.edu',
      class: 'Class 10-B',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      attendance: 64.0,
      assignmentCompletion: 55.0,
      studyHoursWeek: 5.5,
      previousMarks: 58.0,
      currentScore: 54.0,
      predictedScore: 52.4,
      performanceCategory: 'At Risk',
      riskLevel: 'High',
      subjects: [
        { subject: 'Mathematics', score: 52, attendance: 62, assignments: 50, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 50, attendance: 60, assignments: 48, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 60, attendance: 68, assignments: 62, teacher: 'Ms. Albright' },
        { subject: 'History', score: 54, attendance: 66, assignments: 60, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 62, attendance: 75 },
        { term: 'Term 2', score: 59, attendance: 70 },
        { term: 'Mid-Term', score: 57, attendance: 66 },
        { term: 'Term 3', score: 55, attendance: 65 },
        { term: 'Pre-Board', score: 54.0, attendance: 64.0 }
      ],
      strengths: ['Hands-on engineering workshop projects', 'Inquisitive class participation when present'],
      improvementAreas: ['Persistent attendance shortfall', 'Severe backlog in Science assignments', 'Exam anxiety'],
      parentContact: 'priya.patel@parent.edu (+1-555-0163)',
      joinedDate: '2025-08-15'
    },
    {
      id: 'STU005',
      name: 'Ava Johnson',
      email: 'ava.johnson@student.edu',
      class: 'Class 11-A',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      attendance: 96.0,
      assignmentCompletion: 95.0,
      studyHoursWeek: 18.0,
      previousMarks: 91.0,
      currentScore: 92.8,
      predictedScore: 94.1,
      performanceCategory: 'Distinction',
      riskLevel: 'Low',
      subjects: [
        { subject: 'Mathematics', score: 94, attendance: 98, assignments: 95, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 96, attendance: 96, assignments: 98, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 89, attendance: 94, assignments: 92, teacher: 'Ms. Albright' },
        { subject: 'History', score: 92, attendance: 96, assignments: 95, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 89, attendance: 95 },
        { term: 'Term 2', score: 91, attendance: 96 },
        { term: 'Mid-Term', score: 92, attendance: 96 },
        { term: 'Term 3', score: 93, attendance: 97 },
        { term: 'Pre-Board', score: 92.8, attendance: 96.0 }
      ],
      strengths: ['Exceptional mathematical problem solving', 'High academic rigor'],
      improvementAreas: ['Work-life-study balance', 'Stress mitigation'],
      parentContact: 'sarah.johnson@parent.edu (+1-555-0177)',
      joinedDate: '2024-08-20'
    },
    {
      id: 'STU006',
      name: 'Lucas Martin',
      email: 'lucas.martin@student.edu',
      class: 'Class 11-A',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      attendance: 81.0,
      assignmentCompletion: 80.0,
      studyHoursWeek: 9.5,
      previousMarks: 72.0,
      currentScore: 74.2,
      predictedScore: 76.0,
      performanceCategory: 'Merit',
      riskLevel: 'Moderate',
      subjects: [
        { subject: 'Mathematics', score: 75, attendance: 82, assignments: 80, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 70, attendance: 79, assignments: 78, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 78, attendance: 84, assignments: 82, teacher: 'Ms. Albright' },
        { subject: 'History', score: 74, attendance: 79, assignments: 80, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 71, attendance: 80 },
        { term: 'Term 2', score: 72, attendance: 81 },
        { term: 'Mid-Term', score: 73, attendance: 82 },
        { term: 'Term 3', score: 75, attendance: 82 },
        { term: 'Pre-Board', score: 74.2, attendance: 81.0 }
      ],
      strengths: ['Consistent steady progression', 'Collaborative peer engagement'],
      improvementAreas: ['Science laboratory experiment writeups', 'Targeted weekend revision schedule'],
      parentContact: 'david.martin@parent.edu (+1-555-0129)',
      joinedDate: '2024-08-20'
    },
    {
      id: 'STU007',
      name: 'Mia Tanaka',
      email: 'mia.tanaka@student.edu',
      class: 'Class 12-Sci',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      attendance: 88.5,
      assignmentCompletion: 85.0,
      studyHoursWeek: 11.0,
      previousMarks: 79.0,
      currentScore: 81.0,
      predictedScore: 82.5,
      performanceCategory: 'Merit',
      riskLevel: 'Low',
      subjects: [
        { subject: 'Mathematics', score: 82, attendance: 89, assignments: 86, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 80, attendance: 87, assignments: 84, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 84, attendance: 90, assignments: 88, teacher: 'Ms. Albright' },
        { subject: 'History', score: 78, attendance: 88, assignments: 82, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 78, attendance: 87 },
        { term: 'Term 2', score: 79, attendance: 88 },
        { term: 'Mid-Term', score: 80, attendance: 89 },
        { term: 'Term 3', score: 81, attendance: 89 },
        { term: 'Pre-Board', score: 81.0, attendance: 88.5 }
      ],
      strengths: ['Active listener', 'Consistently thorough notes', 'Strong grammatical grasp'],
      improvementAreas: ['Independent study hours increase', 'Historical document interpretation'],
      parentContact: 'kenji.tanaka@parent.edu (+1-555-0111)',
      joinedDate: '2023-09-01'
    },
    {
      id: 'STU008',
      name: 'Ethan Davis',
      email: 'ethan.davis@student.edu',
      class: 'Class 12-Sci',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      attendance: 58.0,
      assignmentCompletion: 48.0,
      studyHoursWeek: 4.0,
      previousMarks: 50.0,
      currentScore: 50.0,
      predictedScore: 47.8,
      performanceCategory: 'At Risk',
      riskLevel: 'Critical',
      subjects: [
        { subject: 'Mathematics', score: 45, attendance: 55, assignments: 42, teacher: 'Mr. Harrison' },
        { subject: 'Science', score: 48, attendance: 56, assignments: 45, teacher: 'Dr. Evelyn Vance' },
        { subject: 'English', score: 55, attendance: 62, assignments: 54, teacher: 'Ms. Albright' },
        { subject: 'History', score: 52, attendance: 59, assignments: 51, teacher: 'Mr. Sterling' }
      ],
      historicalTrends: [
        { term: 'Term 1', score: 56, attendance: 68 },
        { term: 'Term 2', score: 53, attendance: 64 },
        { term: 'Mid-Term', score: 51, attendance: 60 },
        { term: 'Term 3', score: 49, attendance: 58 },
        { term: 'Pre-Board', score: 50.0, attendance: 58.0 }
      ],
      strengths: ['Practical athletics engagement', 'Positive peer rapport'],
      improvementAreas: ['Chronic absenteeism in first period', 'Unfinished assignment load', 'Fundamental math gaps'],
      parentContact: 'karen.davis@parent.edu (+1-555-0155)',
      joinedDate: '2023-09-01'
    }
  ];

  const recommendations: StudyRecommendation[] = [
    // Mahitha (STU001)
    {
      id: 'REC-001',
      studentId: 'STU001',
      studentName: 'Mahitha',
      subject: 'History',
      topic: 'Primary Source Historiography & Cause-Effect Chains',
      reason: 'Recent score of 86% in History shows room for growth in primary document synthesis to reach distinction grade.',
      action: 'Read excerpts from 3 industrial revolution manifestos and write a 250-word synthesis noting bias and socio-economic context.',
      suggestedTimeMinutes: 45,
      priority: 'Medium',
      status: 'Pending',
      createdAt: '2026-10-28T09:00:00Z',
      aiGenerated: false
    },
    {
      id: 'REC-002',
      studentId: 'STU001',
      studentName: 'Mahitha',
      subject: 'Science',
      topic: 'Thermodynamics & Enthalpy Calculation Drills',
      reason: 'Missed full marks on 2 quantitative reaction questions on the mid-term paper.',
      action: 'Solve 10 enthalpy change problem sets using Hess’s Law. Verify signs on exothermic vs endothermic steps.',
      suggestedTimeMinutes: 35,
      priority: 'Medium',
      status: 'Completed',
      completedAt: '2026-10-30T16:20:00Z',
      createdAt: '2026-10-25T11:30:00Z',
      aiGenerated: false
    },
    {
      id: 'REC-003',
      studentId: 'STU001',
      studentName: 'Mahitha',
      subject: 'Mathematics',
      topic: 'Vector Projections and 3D Planes',
      reason: 'Exemplary 92% performance in Mathematics makes Emma an ideal candidate for math competition extension modules.',
      action: 'Explore British Mathematical Olympiad vector geometry challenges (Problems 1 & 2).',
      suggestedTimeMinutes: 50,
      priority: 'Low',
      status: 'In Progress',
      createdAt: '2026-10-29T14:15:00Z',
      aiGenerated: true
    },

    // Akshitha (STU002) - Do First recommendations
    {
      id: 'REC-004',
      studentId: 'STU002',
      studentName: 'Akshitha',
      subject: 'Science',
      topic: 'Chemical Equilibrium & Le Chatelier’s Principle',
      reason: 'Recent marks (58%) indicate severe misconception around dynamic equilibria and equilibrium constants.',
      action: 'Watch 15-minute concept animation, diagram 4 stress shifts (temperature, pressure, concentration), and complete 12 guided flashcards.',
      suggestedTimeMinutes: 45,
      priority: 'High',
      status: 'Pending',
      createdAt: '2026-10-27T08:30:00Z',
      aiGenerated: false
    },
    {
      id: 'REC-005',
      studentId: 'STU002',
      studentName: 'Akshitha',
      subject: 'Mathematics',
      topic: 'Quadratic Formulas and Discriminant Classification',
      reason: 'Current score of 62% shows confusion between real, repeated, and complex roots under time constraints.',
      action: 'Work through 15 quadratic equations using b² - 4ac breakdown steps. Verify solutions by graphing.',
      suggestedTimeMinutes: 40,
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-10-28T10:00:00Z',
      aiGenerated: false
    },
    {
      id: 'REC-006',
      studentId: 'STU002',
      studentName: 'Akshitha',
      subject: 'Study Skills',
      topic: 'Pomodoro Study Blocking & Assignment Backlog Recovery',
      reason: 'Assignment completion rate is at 65%, which directly reduces total coursework grade by 8-10 points.',
      action: 'Set up three 25-minute study intervals each evening before 8 PM to finish overdue Science and Math laboratory worksheets.',
      suggestedTimeMinutes: 30,
      priority: 'High',
      status: 'Pending',
      createdAt: '2026-10-29T08:00:00Z',
      aiGenerated: true
    },

    // Bhommi (STU004) - At Risk recommendations
    {
      id: 'REC-007',
      studentId: 'STU004',
      studentName: 'Bhommi',
      subject: 'Mathematics',
      topic: 'Linear Systems & Coordinate Geometry Essentials',
      reason: 'Score of 52% reflects unresolved foundation gaps in algebraic substitution and graphing linear intercepts.',
      action: 'Complete guided worksheet with step-by-step video accompaniment. Focus on solving 2-variable systems.',
      suggestedTimeMinutes: 50,
      priority: 'High',
      status: 'Pending',
      createdAt: '2026-10-26T14:00:00Z',
      aiGenerated: false
    },
    {
      id: 'REC-008',
      studentId: 'STU004',
      studentName: 'Bhommi',
      subject: 'Science',
      topic: 'Newton’s Laws of Motion & Free-Body Force Diagrams',
      reason: 'Assessment score of 50% shows difficulties resolving opposing forces in 1-dimension.',
      action: 'Draw 8 free-body diagrams for inclined planes and solve for net force F=ma with teacher support.',
      suggestedTimeMinutes: 45,
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-10-27T16:00:00Z',
      aiGenerated: false
    },

    // Madhu (STU003)
    {
      id: 'REC-009',
      studentId: 'STU003',
      studentName: 'Madhu',
      subject: 'English',
      topic: 'Poetry Analysis: Meter, Rhyme Scheme, and Metaphor',
      reason: 'Scored 82% in English; deepening figurative analysis will elevate marks to distinction territory.',
      action: 'Annotate two comparative Romantic period poems, highlighting stanza structural shifts and sensory imagery.',
      suggestedTimeMinutes: 40,
      priority: 'Medium',
      status: 'Pending',
      createdAt: '2026-10-28T12:00:00Z',
      aiGenerated: false
    }
  ];

  const goals: StudyGoal[] = [
    {
      id: 'GOL-001',
      studentId: 'STU001',
      title: 'Master Advanced Historiography Sources',
      subject: 'History',
      targetDate: '2026-11-15',
      progress: 75,
      status: 'Active',
      notes: 'Read 2 of 3 designated essays; outline drafts complete.',
      createdAt: '2026-10-20T10:00:00Z'
    },
    {
      id: 'GOL-002',
      studentId: 'STU001',
      title: 'Review Term 2 Chemistry Lab Portfolios',
      subject: 'Science',
      targetDate: '2026-11-05',
      progress: 100,
      status: 'Completed',
      notes: 'Checked all reaction equations and corrected sign errors with Dr. Vance.',
      createdAt: '2026-10-18T14:30:00Z'
    },
    {
      id: 'GOL-003',
      studentId: 'STU002',
      title: 'Reach 80% Assignment Submission by End of Month',
      subject: 'General Study',
      targetDate: '2026-11-10',
      progress: 45,
      status: 'Active',
      notes: 'Turned in 3 missing lab slips; need 4 more Math problem sets.',
      createdAt: '2026-10-22T09:00:00Z'
    },
    {
      id: 'GOL-004',
      studentId: 'STU002',
      title: 'Score 70%+ on Next Science Unit Quiz',
      subject: 'Science',
      targetDate: '2026-11-12',
      progress: 30,
      status: 'Behind',
      notes: 'Struggling with stoichiometry formulas; need tutoring session.',
      createdAt: '2026-10-23T11:00:00Z'
    },
    {
      id: 'GOL-005',
      studentId: 'STU004',
      title: 'Complete 100% of Pending Mathematics Worksheets',
      subject: 'Mathematics',
      targetDate: '2026-11-08',
      progress: 50,
      status: 'Active',
      notes: 'Attended after-school homework club on Tuesday.',
      createdAt: '2026-10-25T13:00:00Z'
    }
  ];

  const interventions: LearningMemoryRecord[] = [
    {
      id: 'INT-001',
      studentId: 'STU002',
      studentName: 'Akshitha',
      teacherId: 'USR-TEACHER-01',
      teacherName: 'Dr. Evelyn Vance',
      date: '2026-10-24',
      category: 'Attendance',
      observation: 'Liam missed 3 consecutive 8:00 AM Science lectures in two weeks, causing him to fall behind on equilibria concepts.',
      actionTaken: 'Held phone conference with parent Mrs. Mei Chen. Adjusted bus transit timing; paired Liam with Mahitha for morning peer check-in.',
      followUpDate: '2026-11-07',
      outcome: 'Ongoing'
    },
    {
      id: 'INT-002',
      studentId: 'STU004',
      studentName: 'Bhommi',
      teacherId: 'USR-TEACHER-01',
      teacherName: 'Dr. Evelyn Vance',
      date: '2026-10-22',
      category: 'Academic',
      observation: 'Scored 50% on forces exam. Expressed feelings of severe overwhelm and difficulty concentrating during silent timed tests.',
      actionTaken: 'Prescribed scaffolded worksheets with formula cheatsheet for the first 3 weeks. Recommended school counseling check for test anxiety accommodation.',
      followUpDate: '2026-11-05',
      outcome: 'Ongoing'
    },
    {
      id: 'INT-003',
      studentId: 'STU008',
      studentName: 'Ethan Davis',
      teacherId: 'USR-TEACHER-01',
      teacherName: 'Dr. Evelyn Vance',
      date: '2026-10-15',
      category: 'Counseling',
      observation: 'Student showing chronic disengagement across multiple subjects (attendance 58%). Athletic team schedule conflicts noted.',
      actionTaken: 'Convened joint meeting with athletic director, academic dean, and parents. Established minimum academic eligibility contract of 70% attendance.',
      followUpDate: '2026-11-01',
      outcome: 'Escalated'
    },
    {
      id: 'INT-004',
      studentId: 'STU001',
      studentName: 'Mahitha',
      teacherId: 'USR-TEACHER-01',
      teacherName: 'Dr. Evelyn Vance',
      date: '2026-10-12',
      category: 'Academic',
      observation: 'Student demonstrates exceptional capacity in algebra and analytical reading; needs intellectual extension beyond the standard syllabus.',
      actionTaken: 'Assigned mentorship role in peer study group and nominated for National Science Scholars Competition.',
      followUpDate: '2026-11-15',
      outcome: 'Resolved'
    }
  ];

  return {
    users,
    students,
    recommendations,
    goals,
    interventions
  };
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading database file, re-initializing seed data:', err);
    }
    const seed = getInitialSeedData();
    this.save(seed);
    return seed;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetToSeed(): DatabaseSchema {
    this.data = getInitialSeedData();
    this.save();
    return this.data;
  }

  // Auth & Users
  public getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public addUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Students
  private normalizeStudentRecord(student: Student): Student {
    const subjects = Array.isArray(student.subjects) ? student.subjects : [];
    const calculatedScore = subjects.length
      ? Math.round((subjects.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / subjects.length) * 10) / 10
      : Number(student.currentScore) || 0;
    const performanceCategory = calculatedScore >= 85 ? 'Distinction'
      : calculatedScore >= 72 ? 'Merit'
      : calculatedScore >= 60 ? 'Pass' : 'At Risk';
    return { ...student, currentScore: calculatedScore, performanceCategory };
  }

  public getStudents(): Student[] {
    return this.data.students.map((student) => this.normalizeStudentRecord(student));
  }

  public getStudentById(id: string): Student | undefined {
    const student = this.data.students.find(s => s.id === id);
    return student ? this.normalizeStudentRecord(student) : undefined;
  }

  public addStudent(studentData: Omit<Student, 'id'> & { id?: string }): Student {
    const id = studentData.id || `STU${String(this.data.students.length + 1).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id
    };
    this.data.students.push(newStudent);
    this.save();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.students[idx] = { ...this.data.students[idx], ...updates };
    this.save();
    return this.data.students[idx];
  }

  public deleteStudent(id: string): boolean {
    const initialLen = this.data.students.length;
    this.data.students = this.data.students.filter(s => s.id !== id);
    // Also cleanup student recommendations & goals
    this.data.recommendations = this.data.recommendations.filter(r => r.studentId !== id);
    this.data.goals = this.data.goals.filter(g => g.studentId !== id);
    this.save();
    return this.data.students.length < initialLen;
  }

  // Recommendations
  public getRecommendations(studentId?: string): StudyRecommendation[] {
    if (studentId) {
      return this.data.recommendations.filter(r => r.studentId === studentId);
    }
    return this.data.recommendations;
  }

  public getRecommendationById(id: string): StudyRecommendation | undefined {
    return this.data.recommendations.find(r => r.id === id);
  }

  public addRecommendation(rec: Omit<StudyRecommendation, 'id' | 'createdAt'>): StudyRecommendation {
    const newRec: StudyRecommendation = {
      ...rec,
      id: `REC-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.data.recommendations.unshift(newRec);
    this.save();
    return newRec;
  }

  public updateRecommendationStatus(
    id: string,
    status: 'Pending' | 'In Progress' | 'Completed'
  ): StudyRecommendation | null {
    const rec = this.data.recommendations.find(r => r.id === id);
    if (!rec) return null;
    rec.status = status;
    if (status === 'Completed') {
      rec.completedAt = new Date().toISOString();
    } else {
      delete rec.completedAt;
    }
    this.save();
    return rec;
  }

  // Goals
  public getGoals(studentId?: string): StudyGoal[] {
    if (studentId) {
      return this.data.goals.filter(g => g.studentId === studentId).map(g => ({ ...g, durationMinutes: g.durationMinutes || 30, progress: Number.isFinite(g.progress) ? g.progress : 0, status: g.progress >= 100 ? 'Completed' : (g.status === 'Completed' ? 'Completed' : 'Active') }));
    }
    return this.data.goals.map(g => ({ ...g, durationMinutes: g.durationMinutes || 30, progress: Number.isFinite(g.progress) ? g.progress : 0, status: g.progress >= 100 ? 'Completed' : (g.status === 'Completed' ? 'Completed' : 'Active') }));
  }

  public addGoal(goal: Omit<StudyGoal, 'id' | 'createdAt'>): StudyGoal {
    const newGoal: StudyGoal = {
      ...goal,
      id: `GOL-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.data.goals.unshift(newGoal);
    this.save();
    return newGoal;
  }

  public updateGoal(id: string, updates: Partial<StudyGoal>): StudyGoal | null {
    const goal = this.data.goals.find(g => g.id === id);
    if (!goal) return null;
    Object.assign(goal, updates);
    // Keep status and progress synchronized in both directions.
    // Reopened goals must not remain Completed when progress drops below 100.
    if (goal.progress >= 100) {
      goal.status = 'Completed';
    } else if (updates.status === 'Active' || (updates.progress !== undefined && updates.progress < 100)) {
      goal.status = 'Active';
    }
    this.save();
    return goal;
  }

  public deleteGoal(id: string): boolean {
    const initialLen = this.data.goals.length;
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    this.save();
    return this.data.goals.length < initialLen;
  }

  // Interventions / Learning Memory
  public getInterventions(studentId?: string): LearningMemoryRecord[] {
    if (studentId) {
      return this.data.interventions.filter(i => i.studentId === studentId);
    }
    return this.data.interventions;
  }

  public addIntervention(record: Omit<LearningMemoryRecord, 'id'>): LearningMemoryRecord {
    const newRec: LearningMemoryRecord = {
      ...record,
      id: `INT-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.interventions.unshift(newRec);
    this.save();
    return newRec;
  }
}

export const db = new Database();
