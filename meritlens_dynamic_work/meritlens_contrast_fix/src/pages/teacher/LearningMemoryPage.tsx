import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LearningMemoryRecord, Student } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  BrainCircuit,
  Lock,
  Plus,
  Filter,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';

export const LearningMemoryPage: React.FC = () => {
  const [logs, setLogs] = useState<LearningMemoryRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // New Log Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    studentId: '',
    category: 'Academic' as 'Academic' | 'Attendance' | 'Behavioral' | 'Counseling',
    observation: '',
    actionTaken: '',
    followUpDate: '',
    outcome: 'Ongoing' as 'Resolved' | 'Ongoing' | 'Escalated',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [allLogs, allStudents] = await Promise.all([
        api.getLearningMemory(),
        api.getStudents()
      ]);
      setLogs(allLogs);
      setStudents(allStudents);
      if (allStudents.length > 0 && !formData.studentId) {
        setFormData(prev => ({
          ...prev,
          studentId: allStudents[0].id,
          followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
        }));
      }
    } catch (err) {
      console.error('Failed to load learning memory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesStudent = selectedStudentFilter === 'All' || log.studentId === selectedStudentFilter;
    const matchesCategory = selectedCategoryFilter === 'All' || log.category === selectedCategoryFilter;
    return matchesStudent && matchesCategory;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.observation || !formData.actionTaken) {
      alert('Please choose a student and fill in what you noticed and what you did.');
      return;
    }

    try {
      await api.createLearningMemory({
        studentId: formData.studentId,
        category: formData.category,
        observation: formData.observation,
        actionTaken: formData.actionTaken,
        followUpDate: formData.followUpDate,
        outcome: formData.outcome,
      });

      setIsModalOpen(false);
      setFormData({
        studentId: students[0]?.id || '',
        category: 'Academic',
        observation: '',
        actionTaken: '',
        followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        outcome: 'Ongoing',
      });
      await loadData();
    } catch (err: any) {
      alert(`Could not save the note: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#8B5CF6]" />
              <span>Student Support Notes</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Teacher Only
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Private notes about student problems, help given, and next check-in dates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/20 hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Note</span>
        </button>
      </div>

      {/* Security & System Status Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-700">
            <strong>Privacy Protection:</strong> Only teachers can see these private notes. Students cannot open this page.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
          <span>Saved in the local database</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white border border-slate-200 text-xs">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-600">Student:</span>
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="All" className="bg-white">All Students ({logs.length})</option>
            {students.map(s => (
              <option key={s.id} value={s.id} className="bg-white">
                {s.name} ({s.class})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-600">Category:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="All" className="bg-white">All Categories</option>
            <option value="Academic" className="bg-white">Academic</option>
            <option value="Attendance" className="bg-white">Attendance</option>
            <option value="Behavioral" className="bg-white">Behavioral</option>
            <option value="Counseling" className="bg-white">Counseling</option>
          </select>
        </div>
      </div>

      {/* Memory Timeline List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-600">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Retrieving memory logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-600">
            No notes found. Try another filter or add a new note.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 hover:border-white/15 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{log.studentName}</span>
                  <span className="text-xs text-slate-600 font-mono">({log.studentId})</span>
                  <Badge variant={log.category as any} />
                  <Badge variant={log.outcome as any} />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {log.date}
                  </span>
                  <span>Added by: <strong className="text-slate-700">{log.teacherName}</strong></span>
                </div>
              </div>

              {/* Observation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <p className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Student Problem
                </p>
                <p className="leading-relaxed">{log.observation}</p>
              </div>

              {/* Action Taken & Next Follow-Up */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-slate-200 text-xs">
                <p className="font-semibold text-[#22D3EE] uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Help Given
                </p>
                <p className="text-slate-700 leading-relaxed">{log.actionTaken}</p>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#F472B6]" />
                    Next Check-in: <strong className="text-slate-900 font-mono">{log.followUpDate}</strong>
                  </span>
                  <span className="font-mono text-[10px]">Log Ref: {log.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Memory Record */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add a Student Support Note"
        subtitle="Record what happened and how the student was helped"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Student</label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id} • {s.class})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="Academic">Academic Deficiency</option>
                <option value="Attendance">Attendance & Punctuality</option>
                <option value="Behavioral">Student Behaviour</option>
                <option value="Counseling">Academic Counseling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Outcome Status</label>
              <select
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">What is the problem?</label>
            <textarea
              rows={3}
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="e.g. Student displayed significant fatigue during period 1 chemistry lab and struggled with multi-step stoichiometry calculation."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">What help was given?</label>
            <textarea
              rows={3}
              value={formData.actionTaken}
              onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
              placeholder="e.g. Held brief conference, assigned step-by-step scaffolding worksheet, contacted homeroom advisor."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Next Check-in Date</label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow hover:opacity-95 transition-opacity"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
