import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Student, StudyGoal, StudyRecommendation } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { GeminiStudyModal } from '../../components/ui/GeminiStudyModal';
import {
  TrendingUp,
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpenCheck,
  Edit2,
  Trash2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const StudentProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal: Add Goal
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    subject: '',
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    notes: '',
    durationMinutes: 30,
  });
  const [activeGoalForAi, setActiveGoalForAi] = useState<StudyGoal | null>(null);

  const loadData = async (showLoading = true) => {
    if (!user?.studentId) return;
    if (showLoading) setLoading(true);
    try {
      const [stu, g, r] = await Promise.all([
        api.getStudentById(user.studentId),
        api.getGoals(user.studentId),
        api.getRecommendations(user.studentId)
      ]);
      setStudent(stu);
      setGoals(g);
      setRecommendations(r);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const refresh = () => { void loadData(false); };
    window.addEventListener('meritlens-data-changed', refresh);
    window.addEventListener('focus', refresh);
    const syncTimer = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('meritlens-data-changed', refresh);
      window.removeEventListener('focus', refresh);
      window.clearInterval(syncTimer);
    };
  }, [user?.studentId]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjectName = goalForm.subject.trim();
    if (!goalForm.title.trim() || !subjectName) return;
    try {
      await api.createGoal({
        title: goalForm.title.trim(),
        subject: subjectName,
        targetDate: goalForm.targetDate,
        notes: goalForm.notes,
        durationMinutes: Number(goalForm.durationMinutes),
        progress: 0,
        status: 'Active',
      });
      setIsAddGoalModalOpen(false);
      setGoalForm({
        title: '',
        subject: '',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: '',
        durationMinutes: 30,
      });
      window.dispatchEvent(new Event('meritlens-data-changed'));
      await loadData();
    } catch (err: any) {
      alert(`Error creating goal: ${err.message}`);
    }
  };

  const handleUpdateProgress = async (goal: StudyGoal, newProgress: number) => {
    try {
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, progress: newProgress, status: newProgress >= 100 ? 'Completed' : 'Active' } : g));
      await api.updateGoal(goal.id, { progress: newProgress });
      window.dispatchEvent(new Event('meritlens-data-changed'));
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
      loadData();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.deleteGoal(id);
      window.dispatchEvent(new Event('meritlens-data-changed'));
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading || !student) {
    return (
      <div className="py-16 text-center text-slate-600">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading your progress...</span>
      </div>
    );
  }

  const completedRecs = recommendations.filter(r => r.status === 'Completed');

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#22D3EE]" />
            <span>My Progress and Goals</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Track multi-term score progression, set weekly revision milestones, and record achievements
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add a Study Goal</span>
        </button>
      </div>

      {/* Marks Trend Chart */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Your Marks Over Time</h3>
            <p className="text-xs text-slate-600">See how your marks and attendance change over time</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#8B5CF6]">
            5 Recorded Assessments
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={student.historicalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="term" stroke="#64748B" fontSize={11} />
              <YAxis domain={[40, 100]} stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-slate-700">{val}</span>} />
              <Line type="monotone" dataKey="score" name="Your Assessment Score (%)" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="attendance" name="Class Attendance (%)" stroke="#22D3EE" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Study Goals Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-[#8B5CF6]" />
              <span>My Study Goals ({goals.length})</span>
            </h3>
            <p className="text-xs text-slate-600">
              Interactive milestone targets — slide to update your completion percentage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.length === 0 ? (
            <div className="md:col-span-2 py-8 text-center text-slate-600 text-xs">
              No active study goals set. Click "+ Add a Study Goal" to define your weekly milestone!
            </div>
          ) : (
            goals.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#22D3EE] px-2 py-0.5 rounded bg-[#22D3EE]/10">
                      {g.subject}
                    </span>
                    <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${g.progress >= 100 || g.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-cyan-500/10 text-cyan-300'}`}>
                      {g.progress >= 100 || g.status === 'Completed' ? 'Completed' : 'Active'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{g.title}</h4>
                    <span className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5 font-mono">
                      <Calendar className="w-3 h-3" />
                      Target Date: {g.targetDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge variant={g.status} />
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {g.notes && <p className="text-xs text-slate-700 italic">"{g.notes}"</p>}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Estimated time: {g.durationMinutes || 30} mins</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => handleUpdateProgress(g, g.progress >= 100 || g.status === 'Completed' ? 0 : 100)} className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 font-bold uppercase tracking-wide transition ${g.progress >= 100 || g.status === 'Completed' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-md hover:brightness-110'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {g.progress >= 100 || g.status === 'Completed' ? 'Reopen Goal' : 'Mark as Done'}
                    </button>
                    <button type="button" onClick={() => setActiveGoalForAi(g)} className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 font-semibold text-violet-700 hover:bg-violet-100">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Explain with AI
                    </button>
                  </div>
                </div>

                {/* Interactive Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 text-[11px]">Goal Progress</span>
                    <span className="font-mono font-bold text-slate-900">{g.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={g.progress}
                    onChange={(e) => handleUpdateProgress(g, Number(e.target.value))}
                    className="w-full accent-[#8B5CF6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0% Not Started</span>
                    <span>50% In Progress</span>
                    <span>100% Done</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Recommendations Archive */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Study Tasks You Finished ({completedRecs.length})</span>
        </h3>
        <p className="text-xs text-slate-600">
          Archived log of completed practice actions and diagnostic revisions
        </p>

        <div className="space-y-2">
          {completedRecs.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">You have not finished any study tasks yet. Mark a task as done when you finish it.</p>
          ) : (
            completedRecs.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rec.topic}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold font-mono">
                      {rec.subject}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{rec.action}</p>
                </div>
                <div className="text-right sm:text-right text-[11px] text-slate-600 font-mono">
                  {rec.completedAt ? `Finished ${new Date(rec.completedAt).toLocaleDateString()}` : 'Completed'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Add Goal */}
      <Modal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        title="Create a Study Goal"
        subtitle="Choose a clear goal for this week"
        maxWidth="md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
            <input
              type="text"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              placeholder="Example: Finish 10 maths questions"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={goalForm.subject}
                onChange={(e) => setGoalForm({ ...goalForm, subject: e.target.value })}
                placeholder="e.g., Deep Learning, DSA, Python"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#8B5CF6]"
                maxLength={80}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Study Time (minutes)</label>
            <input
              type="number" min="1" max="1440" step="1"
              value={goalForm.durationMinutes}
              onChange={(e) => setGoalForm({ ...goalForm, durationMinutes: Math.max(1, Number(e.target.value) || 1) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes or Plan</label>
            <textarea
              rows={2}
              value={goalForm.notes}
              onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
              placeholder="Example: Study for 30 minutes on Wednesday and Friday."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddGoalModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow hover:opacity-95 transition-opacity"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>
      <GeminiStudyModal
        isOpen={!!activeGoalForAi}
        onClose={() => setActiveGoalForAi(null)}
        studentName={student.name}
        recommendation={activeGoalForAi ? {
          id: activeGoalForAi.id, studentId: activeGoalForAi.studentId,
          studentName: student.name, subject: activeGoalForAi.subject,
          topic: activeGoalForAi.title,
          reason: activeGoalForAi.notes || `Help the student achieve this study goal by ${activeGoalForAi.targetDate}.`,
          action: `Create a practical study plan for ${activeGoalForAi.title} in ${activeGoalForAi.durationMinutes || 30} minutes.`,
          suggestedTimeMinutes: activeGoalForAi.durationMinutes || 30, priority: 'Medium',
          status: 'Pending', createdAt: activeGoalForAi.createdAt
        } : null}
      />
    </div>
  );
};
