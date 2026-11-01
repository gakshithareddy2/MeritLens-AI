import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student, StudyGoal, StudyRecommendation, LearningMemoryRecord } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Calendar,
  Sparkles,
  Award
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
  Line,
  Legend
} from 'recharts';

export const ProgressTrackingPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [interventions, setInterventions] = useState<LearningMemoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getStudents(),
      api.getGoals(),
      api.getRecommendations(),
      api.getLearningMemory()
    ]).then(([s, g, r, i]) => {
      setStudents(s);
      setGoals(g);
      setRecommendations(r);
      setInterventions(i);
      setLoading(false);
    }).catch(err => {
      console.error('Progress tracking data error:', err);
      setLoading(false);
    });
  }, []);

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'Completed' || g.progress >= 100).length;
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const totalRecs = recommendations.length;
  const completedRecs = recommendations.filter(r => r.status === 'Completed').length;
  const recCompletionRate = totalRecs > 0 ? Math.round((completedRecs / totalRecs) * 100) : 0;

  const resolvedInterventions = interventions.filter(i => i.outcome === 'Resolved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Student Progress & Goals</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          See how students are reaching their goals and improving in each subject.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-600">Goal Completion</span>
            <Target className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{goalCompletionRate}%</span>
            <span className="text-xs text-slate-600">({completedGoals}/{totalGoals} goals)</span>
          </div>
          <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
            <div className="bg-[#8B5CF6] h-full rounded-full transition-all duration-500" style={{ width: `${goalCompletionRate}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-600">Recommendations Done</span>
            <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{recCompletionRate}%</span>
            <span className="text-xs text-slate-600">({completedRecs}/{totalRecs} tasks)</span>
          </div>
          <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
            <div className="bg-[#22D3EE] h-full rounded-full transition-all duration-500" style={{ width: `${recCompletionRate}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-600">Students Helped</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{resolvedInterventions}</span>
            <span className="text-xs text-slate-600">of {interventions.length} logged</span>
          </div>
          <p className="text-[11px] text-emerald-400">Positive outcome remediation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-600">Active Students</span>
            <TrendingUp className="w-4 h-4 text-[#F472B6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{students.length}</span>
            <span className="text-xs text-slate-600">tracking milestones</span>
          </div>
          <p className="text-[11px] text-slate-600">100% telemetry coverage</p>
        </div>
      </div>

      {/* Active Study Goals Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-[#8B5CF6]" />
              <span>Student Study Goals</span>
            </h3>
            <p className="text-xs text-slate-600">Active personal study objectives set by students</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-4">Goal Name</th>
                <th className="py-3 px-4">Progress (%)</th>
                <th className="py-3 px-3">Target Date</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {goals.map((g) => {
                const student = students.find(s => s.id === g.studentId);
                return (
                  <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {student && <div aria-hidden="true" title={student.name} className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(student.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>}
                        <span className="font-semibold text-slate-900">{student ? student.name : g.studentId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{g.subject}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">{g.title}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-50 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${g.progress >= 100 ? 'bg-emerald-400' : 'bg-[#8B5CF6]'}`}
                            style={{ width: `${g.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-700">{g.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{g.targetDate}</td>
                    <td className="py-3 px-3 text-right">
                      <Badge variant={g.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
