import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ClassMetrics, Student } from '../../types/index';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  Brain,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface TeacherDashboardProps {
  onNavigateToStudent: (studentId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigateToStudent,
}) => {
  const [metrics, setMetrics] = useState<ClassMetrics | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<string>('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([api.getMetrics(), api.getStudents()]);
      setMetrics(m);
      setStudents(s);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = selectedClass === 'All'
    ? students
    : students.filter(s => s.class === selectedClass);

  const atRiskStudents = filteredStudents.filter(
    s => s.performanceCategory === 'At Risk' || s.riskLevel === 'High' || s.riskLevel === 'Critical'
  );

  const distributionData = metrics ? [
    { name: 'Distinction (85%+)', value: metrics.studentsDistinctionCount, color: '#10B981' },
    { name: 'Merit (72-84%)', value: metrics.studentsMeritCount, color: '#22D3EE' },
    { name: 'Pass (60-71%)', value: metrics.studentsPassCount, color: '#F59E0B' },
    { name: 'At Risk (<60%)', value: metrics.studentsAtRiskCount, color: '#F43F5E' },
  ] : [];

  if (loading || !metrics) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">Loading class details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Class Dashboard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time multi-factor performance indicators across active classes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-600">Cohort:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-white">All Classes ({students.length})</option>
              <option value="Class 10-A" className="bg-white">Class 10-A</option>
              <option value="Class 10-B" className="bg-white">Class 10-B</option>
              <option value="Class 11-A" className="bg-white">Class 11-A</option>
              <option value="Class 12-Sci" className="bg-white">Class 12-Sci</option>
            </select>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-white/20 transition-all"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={filteredStudents.length}
          subtitle="Students in class"
          icon={<Users className="w-5 h-5 text-[#8B5CF6]" />}
          accentColor="purple"
        />
        <StatCard
          title="Average Marks"
          value={`${metrics.classAverageMarks}%`}
          subtitle="Average across all tests"
          icon={<GraduationCap className="w-5 h-5 text-[#22D3EE]" />}
          trend={{ value: '+2.4%', positive: true }}
          accentColor="cyan"
        />
        <StatCard
          title="Average Attendance"
          value={`${metrics.averageAttendance}%`}
          subtitle="Students attending classes"
          icon={<CalendarCheck className="w-5 h-5 text-emerald-400" />}
          trend={{ value: '+1.1%', positive: true }}
          accentColor="emerald"
        />
        <StatCard
          title="Assignments Completed"
          value={`${metrics.assignmentCompletionRate}%`}
          subtitle="Assignments submitted"
          icon={<FileCheck2 className="w-5 h-5 text-[#F472B6]" />}
          accentColor="pink"
        />
        <StatCard
          title="Students Who Need Help"
          value={atRiskStudents.length}
          subtitle="Students who may need extra support"
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          trend={{ value: atRiskStudents.length > 2 ? 'Action' : 'Stable', positive: atRiskStudents.length <= 2 }}
          accentColor="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Subject-wise Averages */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Marks by Subject</h3>
              <p className="text-xs text-slate-600">Class average marks by subject (60% is the pass mark)</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#22D3EE]">
              Curriculum Audit
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.subjectAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="averageScore" name="Avg Score (%)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grade Tier Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Student Results</h3>
              <p className="text-xs text-slate-600">How many students are in each result group</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#8B5CF6]">
              Ensemble Classifier
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(val) => <span className="text-xs text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Attendance vs Performance Correlation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Attendance and Marks</h3>
              <p className="text-xs text-slate-600">Compare attendance with final marks</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-emerald-400">
              r = 0.82 High Correlation
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[50, 100]} stroke="#64748B" fontSize={11} />
                <YAxis type="number" dataKey="marks" name="Marks" unit="%" domain={[40, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 space-y-1">
                          <p className="font-bold text-[#22D3EE]">{data.studentName}</p>
                          <p>Attendance: {data.attendance}%</p>
                          <p>Marks: {data.marks}%</p>
                          <p className="capitalize">Risk: <span className="font-semibold text-rose-400">{data.riskLevel}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Students" data={metrics.attendanceVsMarks} fill="#22D3EE" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Historical Progression Over Terms */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Class Progress Over Time</h3>
              <p className="text-xs text-slate-600">How class marks change each term</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#F472B6]">
              5-Term History
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.historicalPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="term" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-slate-700">{val}</span>} />
                <Line type="monotone" dataKey="averageMarks" name="Avg Marks (%)" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="averageAttendance" name="Average Attendance (%)" stroke="#22D3EE" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Action Table: Students Needing Attention */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Students Who May Need Help</span>
            </h3>
            <p className="text-xs text-slate-600">
              Students identified by the ML model with acute learning gaps or deteriorating attendance
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Current Marks</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">Support Needed</th>
                <th className="py-3 px-4">Main Area to Improve</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {atRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-600">
                    No students currently flagged in high-risk categories for this cohort.
                  </td>
                </tr>
              ) : (
                atRiskStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div aria-hidden="true" title={student.name} className="w-8 h-8 rounded-full border border-slate-200 flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(student.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#22D3EE] transition-colors">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-600 font-mono">{student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{student.class}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900">{student.currentScore}%</span>
                      <span className="text-[10px] text-slate-600 block">Pred: {student.predictedScore}%</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${student.attendance < 75 ? 'text-rose-400' : 'text-slate-700'}`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={student.riskLevel} />
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {student.improvementAreas[0] || 'Requires structured study plan'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigateToStudent(student.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-slate-900 transition-all text-xs font-semibold"
                      >
                        Inspect Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
