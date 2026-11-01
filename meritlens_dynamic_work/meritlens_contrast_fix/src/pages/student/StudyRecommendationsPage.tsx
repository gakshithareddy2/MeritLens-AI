import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Student, StudyGoal, StudyRecommendation } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import { GeminiStudyModal } from '../../components/ui/GeminiStudyModal';
import {
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Filter,
  Calendar,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Brain,
  Send,
  HelpCircle,
  Check,
  Target,
  RefreshCw
} from 'lucide-react';

export const StudyRecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [subjectCatalogue, setSubjectCatalogue] = useState<string[]>(['Mathematics', 'Science', 'English', 'History', 'Study Skills']);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [savedPlanEdits, setSavedPlanEdits] = useState<Record<string, { title: string; subject: string; minutes: number }>>({});
  const [draftPlanEdits, setDraftPlanEdits] = useState<Record<string, { title: string; subject: string; minutes: number }>>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // AI Modal
  const [activeAiRec, setActiveAiRec] = useState<StudyRecommendation | null>(null);

  // Quick tutor prompt
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorAnswer, setTutorAnswer] = useState<string | null>(null);

  const loadData = async (showLoading = true) => {
    if (!user?.studentId) return;
    if (showLoading) setLoading(true);
    try {
      const [stu, recs, studentGoals, catalogue] = await Promise.all([
        api.getStudentById(user.studentId),
        api.getRecommendations(user.studentId),
        api.getGoals(user.studentId),
        api.getSubjects()
      ]);
      setStudent(stu);
      setRecommendations(recs);
      setGoals(studentGoals);
      setSubjectCatalogue([...new Set([...catalogue, 'Study Skills', ...recs.map((r) => r.subject), ...studentGoals.map((g) => g.subject)])]);
    } catch (err) {
      console.error('Failed to load study recommendations:', err);
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

  const handleToggleComplete = async (rec: StudyRecommendation) => {
    const nextStatus = rec.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      // Optimistic update
      setRecommendations(prev =>
        prev.map(r => r.id === rec.id ? { ...r, status: nextStatus, completedAt: nextStatus === 'Completed' ? new Date().toISOString() : undefined } : r)
      );
      await api.updateRecommendationStatus(rec.id, nextStatus);
      window.dispatchEvent(new Event('meritlens-data-changed'));
    } catch (err: any) {
      alert(`Could not update recommendation status: ${err.message}`);
      loadData();
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim() || tutorLoading) return;
    setTutorLoading(true);
    try {
      const res = await api.askTutor({
        question: tutorQuery,
        subject: student ? student.subjects[0]?.subject : 'General',
      });
      setTutorAnswer(res.reply);
    } catch {
      setTutorAnswer('Break down the problem into individual steps, check the governing formula, and verify with a textbook example.');
    } finally {
      setTutorLoading(false);
    }
  };

  // Derive strongest and weakest subjects
  const sortedSubjects = student
    ? [...student.subjects].sort((a, b) => a.score - b.score)
    : [];
  const weakestSubject = sortedSubjects[0];
  const strongestSubject = sortedSubjects[sortedSubjects.length - 1];

  // Filtering
  const filteredRecommendations = recommendations.filter(r => {
    if (statusFilter === 'pending' && r.status === 'Completed') return false;
    if (statusFilter === 'completed' && r.status !== 'Completed') return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    if (subjectFilter !== 'all' && r.subject !== subjectFilter) return false;
    return true;
  });
  // Study goals are included in the same task list so new goals appear immediately.
  const filteredGoals = goals.filter(g => {
    if (statusFilter === 'pending' && g.status === 'Completed') return false;
    if (statusFilter === 'completed' && g.status !== 'Completed') return false;
    if (priorityFilter !== 'all') return false;
    if (subjectFilter !== 'all' && g.subject !== subjectFilter) return false;
    return true;
  });
  const completedCount = recommendations.filter(r => r.status === 'Completed').length + goals.filter(g => g.status === 'Completed').length;
  const totalCount = recommendations.length + goals.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleGoalDone = async (goal: StudyGoal) => {
    const nextProgress = goal.status === 'Completed' || goal.progress >= 100 ? 0 : 100;
    try {
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, progress: nextProgress, status: nextProgress >= 100 ? 'Completed' : 'Active' } : g));
      await api.updateGoal(goal.id, { progress: nextProgress, status: nextProgress >= 100 ? 'Completed' : 'Active' });
      window.dispatchEvent(new Event('meritlens-data-changed'));
    } catch (err: any) {
      alert(`Could not update goal: ${err.message}`);
      await loadData();
    }
  };

  // Build the weekly plan from the student's saved goals and study recommendations.
  // This keeps the plan in sync when a goal or task is added/updated.
  const weekDays = [
    { day: 'Mon', color: 'border-[#8B5CF6]/30' },
    { day: 'Tue', color: 'border-[#22D3EE]/30' },
    { day: 'Wed', color: 'border-[#F472B6]/30' },
    { day: 'Thu', color: 'border-slate-200' },
    { day: 'Fri', color: 'border-emerald-500/30' },
    { day: 'Sat', color: 'border-amber-500/30' },
    { day: 'Sun', color: 'border-slate-200' },
  ];
  const activeGoals = goals.filter(g => g.status !== 'Completed');
  const openRecommendations = recommendations.filter(r => r.status !== 'Completed');
  const dynamicPlanItems = [
    ...activeGoals.map(g => ({ title: g.title, subject: g.subject || 'General Study', kind: 'Goal', minutes: g.durationMinutes || 30, targetDate: g.targetDate })),
    ...openRecommendations.map(r => ({ title: r.topic, subject: r.subject || 'General Study', kind: 'Task', minutes: r.suggestedTimeMinutes, targetDate: '' })),
  ];
  const weeklyPlan = weekDays.map((day, index) => {
    const item = dynamicPlanItems[index % Math.max(dynamicPlanItems.length, 1)];
    if (!item) {
      const fallback = [
        { title: 'Review class notes', subject: 'Study Skills', minutes: 30 },
        { title: 'Practise questions', subject: 'Mathematics', minutes: 40 },
        { title: 'Revise key concepts', subject: 'Science', minutes: 35 },
        { title: 'Write a short summary', subject: 'English', minutes: 30 },
        { title: 'Review mistakes', subject: 'Study Skills', minutes: 25 },
        { title: 'Focus on a difficult topic', subject: 'Study Skills', minutes: 45 },
        { title: 'Weekly review and reset', subject: 'Study Skills', minutes: 30 },
      ][index];
      return { ...day, ...fallback, kind: 'Suggested' };
    }
    return { ...day, ...item };
  });
  const editableWeeklyPlan = weeklyPlan.map(item => ({
    ...item,
    ...(savedPlanEdits[item.day] || {}),
  }));

  useEffect(() => {
    if (!user?.studentId) return;
    try {
      const raw = localStorage.getItem(`meritlens-weekly-plan-${user.studentId}`);
      if (raw) setSavedPlanEdits(JSON.parse(raw));
    } catch (error) {
      console.warn('Could not load saved weekly plan edits', error);
    }
  }, [user?.studentId]);

  const startEditingPlan = () => {
    const drafts: Record<string, { title: string; subject: string; minutes: number }> = {};
    editableWeeklyPlan.forEach(item => {
      drafts[item.day] = { title: item.title, subject: item.subject, minutes: item.minutes };
    });
    setDraftPlanEdits(drafts);
    setIsEditingPlan(true);
  };

  const saveWeeklyPlan = () => {
    setSavedPlanEdits(draftPlanEdits);
    try {
      if (user?.studentId) localStorage.setItem(`meritlens-weekly-plan-${user.studentId}`, JSON.stringify(draftPlanEdits));
    } catch (error) {
      console.warn('Could not save weekly plan edits', error);
    }
    setIsEditingPlan(false);
  };

  if (loading || !student) {
    return (
      <div className="py-16 text-center text-slate-600">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading your study tips...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Mission */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-[#8B5CF6]" />
              <span>My Study Tips</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold uppercase">
              Highest Priority
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Targeted revision tasks and practice actions generated from your actual assessment data and learning diagnostics
          </p>
        </div>

        {/* Refresh current tasks and goals after changes on other pages */}
        <button
          onClick={loadData}
          disabled={loading}
          className="self-start md:self-auto px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-50 text-xs font-semibold flex items-center gap-2 transition-colors"
          title="Reload your latest study tasks and goals"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Tasks & Goals
        </button>

        {/* Academic Diagnostics Capsule */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {weakestSubject && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Subject to Practise: <strong>{weakestSubject.subject} ({weakestSubject.score}%)</strong></span>
            </div>
          )}
          {strongestSubject && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Best Subject: <strong>{strongestSubject.subject} ({strongestSubject.score}%)</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Progress Summary Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#151B2E] via-[#1B233D] to-[#151B2E] border border-slate-200 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE]">
              Weekly Progress Summary
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              {completedCount} of {totalCount} Study Tasks Completed ({completionPercentage}%)
            </h3>
          </div>

          <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <span>Current Marks: <strong className="text-white">{student.currentScore}%</strong></span>
            <span>•</span>
            <span>Study Time: <strong className="text-white">{student.studyHoursWeek}h/wk</strong></span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-emerald-400 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-300">
          Check off tasks as you complete practice problem sets. Changes are saved permanently to your learning record.
        </p>
      </div>

      {/* Editable Weekly Study Plan */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <span>Your Weekly Study Plan</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-600">
              Target: {student.studyHoursWeek} hrs/week
            </span>
            {isEditingPlan ? (
              <>
                <button onClick={() => setIsEditingPlan(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200">Cancel</button>
                <button onClick={saveWeeklyPlan} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-slate-900 text-xs font-semibold hover:bg-emerald-700">Save Plan</button>
              </>
            ) : (
              <button onClick={startEditingPlan} className="px-3 py-1.5 rounded-lg bg-violet-600 text-slate-900 text-xs font-semibold hover:bg-violet-700">Edit Plan</button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-600">
          Edit each day's activity, subject, and time. Your changes are saved for this student on this browser.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 pt-1 text-xs">
          {editableWeeklyPlan.map((item, idx) => {
            const draft = draftPlanEdits[item.day] || { title: item.title, subject: item.subject, minutes: item.minutes };
            return (
              <div key={`${item.day}-${idx}`} className={`p-3 rounded-xl bg-slate-50 border ${item.day === 'Mon' ? 'border-violet-200' : item.day === 'Tue' ? 'border-cyan-200' : item.day === 'Wed' ? 'border-pink-200' : item.day === 'Fri' ? 'border-emerald-200' : item.day === 'Sat' ? 'border-amber-200' : 'border-slate-200'} space-y-2 min-w-0`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.day}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">{item.kind}</span>
                </div>
                {isEditingPlan ? (
                  <>
                    <input aria-label={`${item.day} activity`} value={draft.title} onChange={e => setDraftPlanEdits(prev => ({ ...prev, [item.day]: { ...draft, title: e.target.value } }))} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-900" placeholder="Study activity" />
                    <input aria-label={`${item.day} subject`} value={draft.subject} onChange={e => setDraftPlanEdits(prev => ({ ...prev, [item.day]: { ...draft, subject: e.target.value } }))} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-900" placeholder="Subject" />
                    <label className="block text-[10px] text-slate-600">Minutes
                      <input aria-label={`${item.day} minutes`} type="number" min="5" max="240" value={draft.minutes} onChange={e => setDraftPlanEdits(prev => ({ ...prev, [item.day]: { ...draft, minutes: Math.max(5, Number(e.target.value) || 5) } }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-900" />
                    </label>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-slate-900 text-[11px] leading-tight break-words">{item.title}</p>
                    <span className="text-[10px] text-slate-600 block break-words">{item.subject}</span>
                    <span className="text-[10px] font-mono text-cyan-700 block">{item.minutes}m</span>
                    {'targetDate' in item && item.targetDate && <span className="text-[9px] text-slate-500 block">Due: {item.targetDate}</span>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 text-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-50">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-[#8B5CF6] text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tasks ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === 'pending' ? 'bg-[#8B5CF6] text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Priority & Subject Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="all">All Tasks</option>
            <option value="High">Do First</option>
            <option value="Medium">Do Soon</option>
            <option value="Low">Can Wait</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="all">All Subjects</option>
            {subjectCatalogue.map(subject => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 && filteredGoals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-600">
            No study recommendations matching this filter.
          </div>
        ) : (
          filteredRecommendations.map((rec) => {
            const isDone = rec.status === 'Completed';
            return (
              <div
                key={rec.id}
                className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white border transition-all ${
                  isDone
                    ? 'border-emerald-500/25 bg-white/70 opacity-85'
                    : rec.priority === 'High'
                    ? 'border-rose-500/30 glow-purple'
                    : 'border-slate-200 hover:border-white/15'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Task Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold">
                        {rec.subject}
                      </span>
                      <Badge variant={rec.priority as any} />
                      <Badge variant={rec.status as any} />
                      <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
                        Estimated Time: <strong>{rec.suggestedTimeMinutes} mins</strong>
                      </span>
                      {rec.completedAt && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Completed on {new Date(rec.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold tracking-tight ${isDone ? 'text-slate-700 line-through' : 'text-slate-900'}`}>
                      {rec.topic}
                    </h3>

                    {/* Diagnostic Reason */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <p className="font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Why This Was Recommended
                      </p>
                      <p className="leading-relaxed">{rec.reason}</p>
                    </div>

                    {/* Action Step */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-slate-200 text-xs">
                      <p className="font-bold text-[#22D3EE] uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />
                        Recommended Practice Activity
                      </p>
                      <p className="text-slate-700 leading-relaxed font-medium">{rec.action}</p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-2 sm:pt-0">
                    {/* Mark as Done Toggle Button */}
                    <button
                      onClick={() => handleToggleComplete(rec)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 hover:opacity-95 shadow-md shadow-[#8B5CF6]/20'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Task Done</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>Mark as Done</span>
                        </>
                      )}
                    </button>

                    {/* Ask Gemini AI to explain button */}
                    <button
                      onClick={() => setActiveAiRec(rec)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#8B5CF6] hover:text-slate-900 border border-slate-200 transition-all text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                      <span>Explain with AI</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {filteredGoals.map((goal) => {
          const isDone = goal.progress >= 100 || goal.status === 'Completed';
          return (
            <div key={`goal-task-${goal.id}`} className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white border ${isDone ? 'border-emerald-300 bg-emerald-50/40' : 'border-violet-200 hover:border-violet-300'} transition-all`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">{goal.subject}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold">Study Goal</span>
                    <Badge variant={isDone ? 'Completed' : 'Active'} />
                    <span className="text-xs text-slate-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-600" />Estimated Time: <strong>{goal.durationMinutes || 30} mins</strong></span>
                  </div>
                  <h3 className={`text-lg font-bold tracking-tight ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{goal.title}</h3>
                  <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100 text-xs text-slate-700">
                    <p className="font-bold text-violet-700 uppercase text-[10px] tracking-wider mb-1">Your goal</p>
                    <p>{goal.notes?.trim() || `Work on ${goal.subject} and track your progress toward this goal.`}</p>
                    <p className="mt-1 text-slate-600">Target date: {goal.targetDate || 'No date set'} · Progress: {goal.progress}%</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[145px]">
                  <button onClick={() => handleGoalDone(goal)} className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${isDone ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200' : 'bg-gradient-to-r from-violet-500 to-cyan-400 text-white hover:brightness-110 shadow-violet-500/20'}`}>
                    <Check className="w-4 h-4" />{isDone ? 'Reopen Goal' : 'Mark as Done'}
                  </button>
                  <button onClick={() => setActiveAiRec({ id: goal.id, studentId: goal.studentId, studentName: student?.name || '', subject: goal.subject, topic: goal.title, reason: goal.notes || `Help me achieve this goal by ${goal.targetDate}.`, action: `Create a practical study plan for ${goal.title} in ${goal.durationMinutes || 30} minutes.`, suggestedTimeMinutes: goal.durationMinutes || 30, priority: 'Medium', status: 'Pending', createdAt: goal.createdAt })} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-violet-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Explain with AI
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Study Goals: shown separately from AI-generated study tasks */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Target className="w-4 h-4 text-[#22D3EE]" />
            <span>My Study Goals</span>
            <span className="px-2 py-0.5 rounded-full bg-[#22D3EE]/10 text-[#22D3EE] text-[10px]">{goals.length}</span>
          </div>
          <span className="text-[11px] text-slate-600">Your own goals stay active until you mark them done</span>
        </div>
        {goals.length === 0 ? (
          <p className="text-xs text-slate-600">No goals yet. Open <strong>My Progress</strong> and choose <strong>Add a Study Goal</strong>.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map(goal => (
              <div key={goal.id} className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{goal.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{goal.subject} · Target: {goal.targetDate || 'No date set'}</p>
                  </div>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-1 ${goal.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-[#8B5CF6]/15 text-[#B9A0FF]'}`}>{goal.status}</span>
                </div>
                {goal.notes && <p className="text-xs text-slate-600">{goal.notes}</p>}
                <div className="flex items-center justify-between text-[11px] text-slate-600"><span>Progress</span><strong className="text-[#22D3EE]">{goal.progress}%</strong></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" style={{ width: `${Math.max(0, Math.min(100, goal.progress))}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Instant AI Tutor Study Prompt Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Brain className="w-4 h-4 text-[#F472B6]" />
          <span>Ask the MeritLens Study Helper</span>
        </div>
        <p className="text-xs text-slate-600">
          Stuck on a tricky practice problem? Ask for an intuitive step-by-step conceptual explanation.
        </p>

        <form onSubmit={handleAskTutor} className="flex gap-2">
          <input
            type="text"
            value={tutorQuery}
            onChange={(e) => setTutorQuery(e.target.value)}
            placeholder="Example: How can I tell if a quadratic equation has real roots?"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
          />
          <button
            type="submit"
            disabled={tutorLoading || !tutorQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            {tutorLoading ? 'Solving...' : <Send className="w-4 h-4" />}
          </button>
        </form>

        {tutorAnswer && (
          <div className="p-4 rounded-xl bg-slate-50 border border-[#F472B6]/30 text-xs text-slate-700 animate-in fade-in space-y-1">
            <p className="font-bold text-[#F472B6]">Study Help:</p>
            <p className="leading-relaxed">{tutorAnswer}</p>
          </div>
        )}
      </div>

      {/* AI Explanation Modal */}
      <GeminiStudyModal
        isOpen={!!activeAiRec}
        onClose={() => setActiveAiRec(null)}
        recommendation={activeAiRec}
        studentName={student.name}
      />
    </div>
  );
};
