export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string; // Set when role is 'student'
  avatar: string;
  department?: string;
}

export interface SubjectScore {
  subject: string;
  score: number; // 0 - 100
  attendance: number; // 0 - 100
  assignments: number; // 0 - 100
  teacher: string;
}

export interface TermTrend {
  term: string;
  score: number;
  attendance: number;
}

export type PerformanceCategory = 'Distinction' | 'Merit' | 'Pass' | 'At Risk';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  avatar: string;
  attendance: number;
  assignmentCompletion: number;
  studyHoursWeek: number;
  previousMarks: number;
  currentScore: number;
  predictedScore: number;
  performanceCategory: PerformanceCategory;
  riskLevel: RiskLevel;
  subjects: SubjectScore[];
  historicalTrends: TermTrend[];
  strengths: string[];
  improvementAreas: string[];
  parentContact: string;
  joinedDate: string;
}

export type RecommendationPriority = 'High' | 'Medium' | 'Low';
export type RecommendationStatus = 'Pending' | 'In Progress' | 'Completed';

export interface StudyRecommendation {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  topic: string;
  reason: string;
  action: string;
  suggestedTimeMinutes: number;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  completedAt?: string;
  createdAt: string;
  aiGenerated?: boolean;
}

export type GoalStatus = 'Active' | 'Completed' | 'Behind';

export interface StudyGoal {
  id: string;
  studentId: string;
  title: string;
  subject: string;
  targetDate: string;
  progress: number; // 0 - 100
  status: GoalStatus;
  notes: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface LearningMemoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  date: string;
  category: 'Academic' | 'Attendance' | 'Behavioral' | 'Counseling';
  observation: string;
  actionTaken: string;
  followUpDate: string;
  outcome: 'Resolved' | 'Ongoing' | 'Escalated';
}

export interface MLPredictionInput {
  previousMarks: number;
  attendance: number;
  assignmentCompletion: number;
  studyHoursWeek: number;
  mathScore: number;
  scienceScore: number;
  englishScore: number;
  historyScore: number;
  subjectScores?: Record<string, number>;
}

export interface FactorContribution {
  factor: string;
  weight: number;
  impactScore: number;
  status: 'positive' | 'neutral' | 'negative';
  description: string;
}

export interface MLPredictionResult {
  predictedScore: number;
  performanceCategory: PerformanceCategory;
  riskLevel: RiskLevel;
  confidenceScore: number;
  weakestSubject: string;
  strongestSubject: string;
  learningGaps: string[];
  suggestedInterventions: string[];
  contributingFactors: FactorContribution[];
  studyPacingRatio: number;
}

export interface ClassMetrics {
  totalStudents: number;
  classAverageMarks: number;
  averageAttendance: number;
  assignmentCompletionRate: number;
  studentsAtRiskCount: number;
  studentsDistinctionCount: number;
  studentsMeritCount: number;
  studentsPassCount: number;
  subjectAverages: { subject: string; averageScore: number; passingRate: number }[];
  attendanceVsMarks: { studentName: string; attendance: number; marks: number; riskLevel: string }[];
  historicalPerformance: { term: string; averageMarks: number; averageAttendance: number }[];
}
