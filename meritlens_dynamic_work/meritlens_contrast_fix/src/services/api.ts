import {
  User,
  Student,
  StudyRecommendation,
  StudyGoal,
  LearningMemoryRecord,
  ClassMetrics,
  MLPredictionInput,
  MLPredictionResult
} from '../types/index';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('meritlens_token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

export const api = {
  // Auth
  async registerStudent(payload: { name: string; studentId?: string; email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not create account');
    localStorage.setItem('meritlens_token', data.token);
    localStorage.setItem('meritlens_user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to authenticate');
    }
    const data = await res.json();
    localStorage.setItem('meritlens_token', data.token);
    localStorage.setItem('meritlens_user', JSON.stringify(data.user));
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  logout() {
    localStorage.removeItem('meritlens_token');
    localStorage.removeItem('meritlens_user');
  },

  // Metrics
  async getMetrics(): Promise<ClassMetrics> {
    const res = await fetch(`${API_BASE}/metrics`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to load metrics');
    return res.json();
  },

  // Teacher-managed class catalogue
  async getClasses(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/classes`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load classes');
    return res.json();
  },
  async addClass(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/classes`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ name }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not add class');
    return data;
  },
  async deleteClass(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/classes/${encodeURIComponent(name)}`, { method: 'DELETE', headers: getAuthHeader() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not delete class');
    return data;
  },

  // Teacher-managed subject catalogue
  async getSubjects(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/subjects`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load subjects');
    return res.json();
  },
  async addSubject(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/subjects`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ name }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not add subject');
    return data;
  },
  async deleteSubject(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/subjects/${encodeURIComponent(name)}`, { method: 'DELETE', headers: getAuthHeader() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not delete subject');
    return data;
  },

  // Students
  async getStudents(): Promise<Student[]> {
    const res = await fetch(`${API_BASE}/students`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to load students');
    return res.json();
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load student');
    }
    return res.json();
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(studentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update student');
    return res.json();
  },

  async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete student');
  },

  // ML Predictions
  async predictML(input: MLPredictionInput): Promise<MLPredictionResult> {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error('ML prediction calculation failed');
    return res.json();
  },

  // Study Recommendations
  async getRecommendations(studentId?: string): Promise<StudyRecommendation[]> {
    const url = studentId ? `${API_BASE}/recommendations?studentId=${studentId}` : `${API_BASE}/recommendations`;
    const res = await fetch(url, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to load recommendations');
    return res.json();
  },

  async createRecommendation(data: Partial<StudyRecommendation>): Promise<StudyRecommendation> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create recommendation');
    return res.json();
  },

  async updateRecommendationStatus(id: string, status: 'Pending' | 'In Progress' | 'Completed'): Promise<StudyRecommendation> {
    const res = await fetch(`${API_BASE}/recommendations/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update recommendation status');
    return res.json();
  },

  // Study Goals
  async getGoals(studentId?: string): Promise<StudyGoal[]> {
    const url = studentId ? `${API_BASE}/goals?studentId=${studentId}` : `${API_BASE}/goals`;
    const res = await fetch(url, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to load goals');
    return res.json();
  },

  async createGoal(data: Partial<StudyGoal>): Promise<StudyGoal> {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create goal');
    return res.json();
  },

  async updateGoal(id: string, updates: Partial<StudyGoal>): Promise<StudyGoal> {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },

  async deleteGoal(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete goal');
  },

  // Learning Memory (Teacher Only)
  async getLearningMemory(studentId?: string): Promise<LearningMemoryRecord[]> {
    const url = studentId ? `${API_BASE}/learning-memory?studentId=${studentId}` : `${API_BASE}/learning-memory`;
    const res = await fetch(url, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load learning memory');
    }
    return res.json();
  },

  async createLearningMemory(data: Partial<LearningMemoryRecord>): Promise<LearningMemoryRecord> {
    const res = await fetch(`${API_BASE}/learning-memory`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record learning memory');
    return res.json();
  },

  // Gemini AI features
  async explainRecommendation(payload: {
    subject: string;
    topic: string;
    reason: string;
    action: string;
    studentName?: string;
  }): Promise<{ source: string; explanation: any }> {
    const res = await fetch(`${API_BASE}/gemini/explain-recommendation`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI explanation failed');
    return res.json();
  },

  async askTutor(payload: {
    question: string;
    subject?: string;
    topic?: string;
  }): Promise<{ source: string; reply: string }> {
    const res = await fetch(`${API_BASE}/gemini/tutor-chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Tutor response failed');
    return res.json();
  },

  async resetData(): Promise<void> {
    const res = await fetch(`${API_BASE}/reset-data`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Reset failed');
  }
};
