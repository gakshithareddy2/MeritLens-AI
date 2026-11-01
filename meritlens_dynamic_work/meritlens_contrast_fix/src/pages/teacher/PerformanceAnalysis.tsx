import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student, ClassMetrics } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import {
  LineChart as LineChartIcon,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar,
  CheckCircle2
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const PerformanceAnalysis: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>(['Mathematics', 'Science', 'English', 'History']);
  const [metrics, setMetrics] = useState<ClassMetrics | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getStudents(), api.getMetrics(), api.getSubjects()]).then(([s, m, subjects]) => {
      setStudents(s);
      setMetrics(m);
      setSubjectsList(subjects);
    }).catch(console.error);
  }, []);

  const filteredStudents = students.filter(s => {
    if (selectedClass !== 'All' && s.class !== selectedClass) return false;
    return true;
  });

  // Calculate improving vs declining students based on historical trends
  const studentTrajectories = filteredStudents.map(s => {
    const trends = s.historicalTrends;
    const firstScore = trends[0]?.score || s.previousMarks;
    const lastScore = trends[trends.length - 1]?.score || s.currentScore;
    const delta = Math.round((lastScore - firstScore) * 10) / 10;
    return {
      student: s,
      firstScore,
      lastScore,
      delta,
      trajectory: delta > 1.5 ? 'improving' : delta < -1.5 ? 'declining' : 'steady'
    };
  });

  const improvingCohort = studentTrajectories.filter(t => t.trajectory === 'improving');
  const decliningCohort = studentTrajectories.filter(t => t.trajectory === 'declining');

  // Radar chart data for multi-subject comparison
  const radarData = subjectsList.map(subName => {
    let totalScore = 0;
    let count = 0;
    filteredStudents.forEach(s => {
      const match = s.subjects.find(sub => sub.subject === subName);
      if (match) {
        totalScore += match.score;
        count++;
      }
    });
    return {
      subject: subName,
      average: count > 0 ? Math.round(totalScore / count) : 75,
      benchmark: 75
    };
  });

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Class', 'Current Marks', 'Predicted Score', 'Attendance %', 'Assignments %', 'Risk Level'];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name}"`,
      s.email,
      s.class,
      s.currentScore,
      s.predictedScore,
      s.attendance,
      s.assignmentCompletion,
      s.riskLevel
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MeritLens_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Performance audit report exported successfully (CSV).');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Filters */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Class Performance</span>
            <span className="w-2 h-2 rounded-full bg-[#22D3EE]" />
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Cross-cohort trajectory modeling, subject comparisons, and longitudinal growth tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-600">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-white">All Classes</option>
              <option value="Class 10-A" className="bg-white">Class 10-A</option>
              <option value="Class 10-B" className="bg-white">Class 10-B</option>
              <option value="Class 11-A" className="bg-white">Class 11-A</option>
              <option value="Class 12-Sci" className="bg-white">Class 12-Sci</option>
            </select>
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 hover:border-[#8B5CF6] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Download Report (CSV)</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Cohort Growth Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Improving Cohort */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Students Who Are Improving</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
              +{improvingCohort.length} Students
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {improvingCohort.map(({ student, firstScore, lastScore, delta }) => (
              <div
                key={student.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div aria-hidden="true" title={student.name} className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(student.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                  <div>
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    <p className="text-[10px] text-slate-600">{student.class} • Attendance: {student.attendance}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold font-mono">+{delta}%</span>
                  <span className="text-[10px] text-slate-600 block">{firstScore}% → {lastScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining Cohort */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Students Whose Marks Are Falling</h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10">
              {decliningCohort.length} Needs Attention
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {decliningCohort.length === 0 ? (
              <p className="text-xs text-slate-600 py-6 text-center">No students have falling marks right now.</p>
            ) : (
              decliningCohort.map(({ student, firstScore, lastScore, delta }) => (
                <div
                  key={student.id}
                  className="p-3 rounded-xl bg-slate-50 border border-rose-500/15 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div aria-hidden="true" title={student.name} className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(student.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <p className="text-[10px] text-slate-600">{student.class} • Attendance: {student.attendance}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-400 font-bold font-mono">{delta}%</span>
                    <span className="text-[10px] text-slate-600 block">{firstScore}% → {lastScore}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Advanced Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar: Subject Mastery vs Benchmark */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Subject Comparison</h3>
            <p className="text-xs text-slate-600">Class average compared with the 75% target</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[40, 100]} stroke="#64748B" fontSize={10} />
                <Radar name="Cohort Average" dataKey="average" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.35} />
                <Radar name="Department Benchmark" dataKey="benchmark" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} strokeDasharray="3 3" />
                <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-slate-700">{val}</span>} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Term Progression Comparison */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Attendance and Marks Over Time</h3>
            <p className="text-xs text-slate-600">Compare class attendance and marks over time</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.historicalPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="term" stroke="#64748B" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px' }} />
                <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-slate-700">{val}</span>} />
                <Bar dataKey="averageMarks" name="Avg Marks (%)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="averageAttendance" name="Average Attendance (%)" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
