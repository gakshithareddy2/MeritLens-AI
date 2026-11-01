import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Student, StudyRecommendation, StudyGoal } from '../../types/index';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { GeminiStudyModal } from '../../components/ui/GeminiStudyModal';
import {
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  BookOpenCheck,
  AlertCircle,
  TrendingUp,
  Brain,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface StudentDashboardProps {
  onNavigateToRecommendations: () => void;
  onNavigateToProgress: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateToRecommendations,
  onNavigateToProgress
}) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAiRec, setSelectedAiRec] = useState<StudyRecommendation | null>(null);

  const loadStudentData = async (showLoading = true) => {
    if (!user?.studentId) return;
    if (showLoading) setLoading(true);
    try {
      const [stu, recs, g] = await Promise.all([
        api.getStudentById(user.studentId),
        api.getRecommendations(user.studentId),
        api.getGoals(user.studentId)
      ]);
      setStudent(stu);
      setRecommendations(recs);
      setGoals(g);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
    const refresh = () => { void loadStudentData(false); };
    window.addEventListener('meritlens-data-changed', refresh);
    window.addEventListener('focus', refresh);
    const syncTimer = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('meritlens-data-changed', refresh);
      window.removeEventListener('focus', refresh);
      window.clearInterval(syncTimer);
    };
  }, [user?.studentId]);

  const pendingRecommendations = recommendations.filter(r => r.status !== 'Completed');
  const highPriorityRec = pendingRecommendations.find(r => r.priority === 'High') || pendingRecommendations[0];

  const completedRecs = recommendations.filter(r => r.status === 'Completed').length;
  const completedGoals = goals.filter(g => g.status === 'Completed').length;
  const completedItems = completedRecs + completedGoals;
  const totalItems = recommendations.length + goals.length;
  const progressRatio = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (loading || !student) {
    return (
      <div className="py-16 text-center text-slate-600">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-[#191b3a] via-[#151D32] to-[#102b3a] border border-violet-400/20 shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#8B5CF6]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-violet-200">
                {student.class}
              </span>
              <Badge variant={student.performanceCategory} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Welcome back, {student.name.split(' ')[0]}!
            </h2>
            <p className="text-xs text-slate-300 max-w-lg">
              Here is your study progress. MeritLens AI shows what you are doing well and what you can practise next.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1020]/80 border border-white/10 text-center min-w-[150px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Marks</p>
            <p className="text-3xl font-black text-cyan-700 mt-0.5">{student.currentScore}%</p>
            <p className="text-[10px] text-slate-400 mt-1">Expected marks: {student.predictedScore}%</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${student.attendance}%`}
          subtitle="Try to keep attendance at 75% or more"
          icon={<CalendarCheck className="w-5 h-5 text-[#22D3EE]" />}
          accentColor={student.attendance >= 75 ? 'cyan' : 'amber'}
        />
        <StatCard
          title="Assignments Done"
          value={`${student.assignmentCompletion}%`}
          subtitle="Assignments submitted"
          icon={<FileCheck2 className="w-5 h-5 text-emerald-400" />}
          accentColor={student.assignmentCompletion >= 80 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Study Time This Week"
          value={`${student.studyHoursWeek}h`}
          subtitle="Time spent studying"
          icon={<Clock className="w-5 h-5 text-[#8B5CF6]" />}
          accentColor="purple"
        />
        <StatCard
          title="Study Tasks"
          value={`${completedItems}/${totalItems}`}
          subtitle={`${progressRatio}% tasks and goals done`}
          icon={<BookOpenCheck className="w-5 h-5 text-[#F472B6]" />}
          accentColor="pink"
        />
      </div>

      {/* Personal insights: practical actions students can take without exposing the ML console */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-400/20 bg-[#151D32] p-5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 text-rose-300"><Target className="w-4 h-4"/><h3 className="text-sm font-bold">Focus area</h3></div>
          {student.subjects.length > 0 ? (() => { const weak = [...student.subjects].sort((a, b) => Number(a.score) - Number(b.score))[0]; return <><p className="mt-3 text-lg font-extrabold text-white">{weak.subject}</p><p className="mt-1 text-sm text-slate-300">Current mark: {weak.score}%. Spend your next study session revising one difficult topic and answering 5 practice questions.</p></>; })() : <p className="mt-3 text-sm text-slate-300">Ask your teacher to add subject marks to get a useful focus area.</p>}
        </div>
        <div className="rounded-2xl border border-amber-400/20 bg-[#151D32] p-5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 text-amber-300"><Lightbulb className="w-4 h-4"/><h3 className="text-sm font-bold">A small improvement</h3></div>
          <p className="mt-3 text-lg font-extrabold text-white">{student.attendance < 75 ? 'Improve attendance' : student.assignmentCompletion < 80 ? 'Finish assignments' : 'Keep a steady routine'}</p>
          <p className="mt-1 text-sm text-slate-300">{student.attendance < 75 ? `Your attendance is ${student.attendance}%. Aim to attend every available class this week.` : student.assignmentCompletion < 80 ? `${student.assignmentCompletion}% of assignments are complete. Finish one pending assignment before starting another.` : 'Study in focused 25-minute sessions and review what you learned at the end of each session.'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-[#151D32] p-5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="w-4 h-4"/><h3 className="text-sm font-bold">What is going well</h3></div>
          <p className="mt-3 text-lg font-extrabold text-white">{student.attendance >= 75 ? 'Attendance on track' : 'You can improve this'}</p>
          <p className="mt-1 text-sm text-slate-300">Attendance: {student.attendance}% · Assignments: {student.assignmentCompletion}% · Study time: {student.studyHoursWeek} hours this week. Use My Progress to set a clear goal and check it off when you finish.</p>
        </div>
      </section>

      {/* Priority Action Highlight */}
      {highPriorityRec && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#191b3a] to-[#102b3a] border border-violet-400/20 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-200">
                What to Study Next ({highPriorityRec.subject})
              </span>
              <Badge variant={highPriorityRec.priority as any} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedAiRec(highPriorityRec)}
                className="px-3 py-1.5 rounded-lg bg-violet-400/15 text-violet-200 hover:bg-violet-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain with AI</span>
              </button>
              <button
                onClick={onNavigateToRecommendations}
                className="text-xs font-semibold text-cyan-700 hover:underline flex items-center gap-1"
              >
                <span>See All Study Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1020]/70 border border-white/10 space-y-2">
            <h3 className="text-base font-bold text-white">{highPriorityRec.topic}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{highPriorityRec.action}</p>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
              <span>Why this helps: {highPriorityRec.reason}</span>
              <span className="font-mono text-[#22D3EE] font-semibold">{highPriorityRec.suggestedTimeMinutes} mins</span>
            </div>
          </div>
        </div>
      )}

      {/* Subject Performance Breakdown & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Scores Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#151D32] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Your Subject Mastery</h3>
              <p className="text-xs text-slate-400">Assessment marks across current curriculum</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1020] text-[#22D3EE]">
              {student.subjects.length} Subjects Active
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={student.subjects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="score" name="Your Marks (%)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Goals Widget */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#151D32] border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#22D3EE]" />
                <span>Active Study Goals</span>
              </h3>
              <button
                onClick={onNavigateToProgress}
                className="text-xs font-semibold text-[#8B5CF6] hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No active goals yet. Create one in My Progress!</p>
              ) : (
                goals.slice(0, 3).map(g => (
                  <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 truncate max-w-[180px]">{g.title}</span>
                      <span className="font-mono text-slate-600 text-[10px]">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.progress >= 100 ? 'bg-emerald-400' : 'bg-[#22D3EE]'}`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Overall completion:</span>
            <span className="font-bold text-slate-900">{completedItems} tasks and goals done</span>
          </div>
        </div>
      </div>

      {/* AI Explanation Modal */}
      <GeminiStudyModal
        isOpen={!!selectedAiRec}
        onClose={() => setSelectedAiRec(null)}
        recommendation={selectedAiRec}
        studentName={student.name}
      />
    </div>
  );
};
