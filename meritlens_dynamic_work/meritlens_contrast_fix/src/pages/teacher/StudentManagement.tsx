import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
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
  Line
} from 'recharts';

interface StudentManagementProps {
  initialSelectedStudentId?: string | null;
  onClearInitialStudent?: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  initialSelectedStudentId,
  onClearInitialStudent
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectCatalogue, setSubjectCatalogue] = useState<string[]>(['Mathematics', 'Science', 'English', 'History']);
  const [classCatalogue, setClassCatalogue] = useState<string[]>(['Class 10-A', 'Class 10-B', 'Class 11-A', 'Class 12-Sci']);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals state
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class: classCatalogue[0] || 'Class 10-A',
    attendance: 85,
    assignmentCompletion: 80,
    studyHoursWeek: 12,
    mathScore: 78,
    scienceScore: 80,
    englishScore: 82,
    historyScore: 75,
    subjectScores: { Mathematics: 78, Science: 80, English: 82, History: 75 } as Record<string, number>,
  });

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    api.getSubjects().then(setSubjectCatalogue).catch(console.error);
    api.getClasses().then(setClassCatalogue).catch(console.error);
  }, []);

  // Handle deep-link to student if passed from dashboard
  useEffect(() => {
    if (initialSelectedStudentId && students.length > 0) {
      const found = students.find(s => s.id === initialSelectedStudentId);
      if (found) {
        setViewStudent(found);
      }
      if (onClearInitialStudent) onClearInitialStudent();
    }
  }, [initialSelectedStudentId, students]);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'All' || s.class === selectedClass;
    const matchesStatus = selectedStatus === 'All' || s.performanceCategory === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      class: classCatalogue[0] || 'Class 10-A',
      attendance: 85,
      assignmentCompletion: 80,
      studyHoursWeek: 12,
      mathScore: 75,
      scienceScore: 75,
      englishScore: 80,
      historyScore: 70,
      subjectScores: Object.fromEntries(subjectCatalogue.map((name) => [name, ({ Mathematics: 75, Science: 75, English: 80, History: 70 } as Record<string, number>)[name] ?? 0])),
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    const math = student.subjects.find(s => s.subject === 'Mathematics')?.score || 70;
    const science = student.subjects.find(s => s.subject === 'Science')?.score || 70;
    const english = student.subjects.find(s => s.subject === 'English')?.score || 70;
    const history = student.subjects.find(s => s.subject === 'History')?.score || 70;

    setFormData({
      name: student.name,
      email: student.email,
      class: student.class,
      attendance: student.attendance,
      assignmentCompletion: student.assignmentCompletion,
      studyHoursWeek: student.studyHoursWeek,
      mathScore: math,
      scienceScore: science,
      englishScore: english,
      historyScore: history,
      subjectScores: Object.fromEntries(subjectCatalogue.map((name) => [name, student.subjects.find((sub) => sub.subject === name)?.score ?? 0])),
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSub = subjectCatalogue.map((subject) => ({ subject, score: Number(formData.subjectScores?.[subject] ?? 0), attendance: Number(formData.attendance), assignments: Number(formData.assignmentCompletion), teacher: 'Unassigned' }));

      await api.createStudent({
        name: formData.name,
        email: formData.email,
        class: formData.class,
        attendance: Number(formData.attendance),
        assignmentCompletion: Number(formData.assignmentCompletion),
        studyHoursWeek: Number(formData.studyHoursWeek),
        subjects: newSub,
      });

      setIsAddModalOpen(false);
      window.dispatchEvent(new Event('meritlens-data-changed'));
      await loadStudents();
    } catch (err: any) {
      alert(`Error creating student: ${err.message}`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;
    try {
      const updatedSub = subjectCatalogue.map((subject) => ({ subject, score: Number(formData.subjectScores?.[subject] ?? studentToEdit.subjects.find((item) => item.subject === subject)?.score ?? 0), attendance: Number(formData.attendance), assignments: Number(formData.assignmentCompletion), teacher: studentToEdit.subjects.find((item) => item.subject === subject)?.teacher || 'Unassigned' }));
      const currentScore = updatedSub.length ? Math.round(updatedSub.reduce((sum, item) => sum + item.score, 0) / updatedSub.length * 10) / 10 : 0;

      await api.updateStudent(studentToEdit.id, {
        name: formData.name,
        email: formData.email,
        class: formData.class,
        attendance: Number(formData.attendance),
        assignmentCompletion: Number(formData.assignmentCompletion),
        studyHoursWeek: Number(formData.studyHoursWeek),
        currentScore,
        subjects: updatedSub,
      });

      setIsEditModalOpen(false);
      setStudentToEdit(null);
      window.dispatchEvent(new Event('meritlens-data-changed'));
      await loadStudents();
    } catch (err: any) {
      alert(`Error updating student: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await api.deleteStudent(studentToDelete.id);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      await loadStudents();
    } catch (err: any) {
      alert(`Error removing student: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Student Academic Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] font-mono">
              {filteredStudents.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Holistic student database with behavioral tracking, subject marks, and ML risk flags
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/20 hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID (e.g., STU001), or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-600">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="All" className="bg-white">All Classes</option>
            {Array.from(new Set([...classCatalogue, ...students.map((student) => student.class)])).sort().map((className) => <option key={className} value={className} className="bg-white">{className}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-600">Tier:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="All" className="bg-white">All Tiers</option>
            <option value="Distinction" className="bg-white">Distinction (85%+)</option>
            <option value="Merit" className="bg-white">Merit (72-84%)</option>
            <option value="Pass" className="bg-white">Pass (60-71%)</option>
            <option value="At Risk" className="bg-white">At Risk (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider bg-slate-50/40">
                <th className="py-3.5 px-4">Student ID & Name</th>
                <th className="py-3.5 px-3">Class</th>
                <th className="py-3.5 px-3">Current Marks</th>
                <th className="py-3.5 px-3">Attendance</th>
                <th className="py-3.5 px-3">Assignments</th>
                <th className="py-3.5 px-3">Study Hrs/Wk</th>
                <th className="py-3.5 px-3">Performance Tier</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-600">
                    <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading student records...</span>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-600">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div aria-hidden="true" title={student.name} className="w-9 h-9 rounded-full border border-slate-200 flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(student.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-[#22D3EE] transition-colors">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-600 font-mono">{student.id} • {student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">{student.class}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 text-sm">{student.currentScore}%</span>
                      <span className="text-[10px] text-slate-600 block font-mono">Pred: {student.predictedScore}%</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${student.attendance < 75 ? 'text-rose-400 font-bold' : 'text-slate-700'}`}>
                          {student.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-medium ${student.assignmentCompletion < 70 ? 'text-amber-400 font-bold' : 'text-slate-700'}`}>
                        {student.assignmentCompletion}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-mono">
                      {student.studyHoursWeek} hrs
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={student.performanceCategory} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewStudent(student)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-white/15 text-slate-700 hover:text-slate-900 transition-colors"
                          title="View Comprehensive Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-lg bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] transition-colors"
                          title="Edit Student Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: View Full Student Profile */}
      {viewStudent && (
        <Modal
          isOpen={!!viewStudent}
          onClose={() => setViewStudent(null)}
          title={viewStudent.name}
          subtitle={`Student ID: ${viewStudent.id} • ${viewStudent.class}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Profile Summary Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div aria-hidden="true" title={viewStudent.name} className="w-16 h-16 rounded-full border-2 border-[#8B5CF6] flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(viewStudent.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-lg font-bold text-slate-900">{viewStudent.name}</h4>
                  <Badge variant={viewStudent.performanceCategory} />
                  <Badge variant={viewStudent.riskLevel} />
                </div>
                <p className="text-xs text-slate-600">{viewStudent.email} • Enrolled: {viewStudent.joinedDate}</p>
                <p className="text-xs text-slate-600">Parent Contact: {viewStudent.parentContact}</p>
              </div>

              <div className="flex items-center gap-4 text-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-600">Current Marks</p>
                  <p className="text-xl font-extrabold text-[#22D3EE]">{viewStudent.currentScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-600">Expected Marks</p>
                  <p className="text-xl font-extrabold text-[#8B5CF6]">{viewStudent.predictedScore}%</p>
                </div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-600">Attendance</p>
                <p className="text-base font-bold text-slate-900 mt-1">{viewStudent.attendance}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-600">Assignments</p>
                <p className="text-base font-bold text-slate-900 mt-1">{viewStudent.assignmentCompletion}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-600">Weekly Study</p>
                <p className="text-base font-bold text-slate-900 mt-1">{viewStudent.studyHoursWeek} hrs/wk</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-600">Previous Marks</p>
                <p className="text-base font-bold text-slate-900 mt-1">{viewStudent.previousMarks}%</p>
              </div>
            </div>

            {/* Subject-Wise Marks Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Subject Performance Audit
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {viewStudent.subjects.map((sub, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{sub.subject}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Teacher: {sub.teacher}</p>
                      <div className="flex gap-2 text-[10px] text-slate-600 mt-1">
                        <span>Att: {sub.attendance}%</span>
                        <span>•</span>
                        <span>Assign: {sub.assignments}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black ${sub.score >= 85 ? 'text-emerald-400' : sub.score >= 70 ? 'text-[#22D3EE]' : sub.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {sub.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Term Progression Chart */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Multi-Term Score Trajectory
              </h4>
              <div className="h-44 w-full p-2 rounded-xl bg-slate-50 border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewStudent.historicalTrends} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="term" stroke="#64748B" fontSize={10} />
                    <YAxis domain={[40, 100]} stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strengths and Improvement Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Identified Academic Strengths
                </h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {viewStudent.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Target Areas for Revision
                </h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {viewStudent.improvementAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Add Student */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student Record"
        subtitle="Registers student and initializes automated ML prediction baseline"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jordan Miller"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jordan.miller@student.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Cohort</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              >
                {Array.from(new Set([...classCatalogue, formData.class])).filter(Boolean).map((className) => <option key={className} value={className}>{className}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.assignmentCompletion}
                onChange={(e) => setFormData({ ...formData, assignmentCompletion: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Study Time per Week (Hours)</label>
            <input
              type="number"
              min="0"
              max="40"
              value={formData.studyHoursWeek}
              onChange={(e) => setFormData({ ...formData, studyHoursWeek: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

                    <div className="pt-3 border-t border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Subject Marks (0–100)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjectCatalogue.map((subject) => <div key={subject}>
                <label className="block text-xs text-slate-400 mb-1">{subject}</label>
                <input type="number" min="0" max="100" value={formData.subjectScores?.[subject] ?? 0}
                  onChange={(e) => setFormData({ ...formData, subjectScores: { ...(formData.subjectScores || {}), [subject]: Math.max(0, Math.min(100, Number(e.target.value))) } })}
                  className="w-full bg-[#0b1020] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-violet-500" required />
              </div>)}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow hover:opacity-95 transition-opacity"
            >
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Edit Student */}
      {studentToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Student: ${studentToEdit.name}`}
          subtitle={`Student ID: ${studentToEdit.id}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
                >
                  {Array.from(new Set([...classCatalogue, formData.class])).filter(Boolean).map((className) => <option key={className} value={className}>{className}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignments (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.assignmentCompletion}
                  onChange={(e) => setFormData({ ...formData, assignmentCompletion: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Study Time / Week</label>
              <input
                type="number"
                min="0"
                max="40"
                value={formData.studyHoursWeek}
                onChange={(e) => setFormData({ ...formData, studyHoursWeek: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                required
              />
            </div>

                        <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Subject Marks (0–100)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjectCatalogue.map((subject) => <div key={subject}>
                  <label className="block text-xs text-slate-400 mb-1">{subject}</label>
                  <input type="number" min="0" max="100" value={formData.subjectScores?.[subject] ?? 0}
                    onChange={(e) => setFormData({ ...formData, subjectScores: { ...(formData.subjectScores || {}), [subject]: Math.max(0, Math.min(100, Number(e.target.value))) } })}
                    className="w-full bg-[#0b1020] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-violet-500" required />
                </div>)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow hover:opacity-95 transition-opacity"
              >
                Update Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 4: Delete Confirmation */}
      {studentToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Student Removal"
          subtitle="This action permanently deletes the student record and associated recommendations."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-rose-300">
                <p className="font-bold">Are you sure you want to remove this record?</p>
                <p className="mt-1 text-slate-700">
                  Student: <strong className="text-slate-900">{studentToDelete.name}</strong> ({studentToDelete.id})
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Associated recommendations and active study goals will also be unlinked.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-900 text-xs font-bold uppercase tracking-wider shadow transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
