import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudyRecommendation, Student } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { GeminiStudyModal } from '../../components/ui/GeminiStudyModal';
import {
  BookOpenCheck,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const TeacherRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedAiRec, setSelectedAiRec] = useState<StudyRecommendation | null>(null);

  // New recommendation form
  const [formData, setFormData] = useState({
    studentId: '',
    subject: 'Mathematics',
    topic: '',
    reason: '',
    action: '',
    suggestedTimeMinutes: 45,
    priority: 'High' as 'High' | 'Medium' | 'Low',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, stus] = await Promise.all([
        api.getRecommendations(),
        api.getStudents()
      ]);
      setRecommendations(recs);
      setStudents(stus);
      if (stus.length > 0 && !formData.studentId) {
        setFormData(prev => ({ ...prev, studentId: stus[0].id }));
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecommendations = recommendations.filter(r => {
    const matchesStudent = selectedStudentFilter === 'All' || r.studentId === selectedStudentFilter;
    const matchesPriority = selectedPriorityFilter === 'All' || r.priority === selectedPriorityFilter;
    const matchesStatus = selectedStatusFilter === 'All' || r.status === selectedStatusFilter;
    return matchesStudent && matchesPriority && matchesStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.topic || !formData.action) {
      alert('Please fill out student, topic, and required action.');
      return;
    }

    try {
      await api.createRecommendation({
        studentId: formData.studentId,
        subject: formData.subject,
        topic: formData.topic,
        reason: formData.reason || 'Instructor diagnostic recommendation for curriculum mastery.',
        action: formData.action,
        suggestedTimeMinutes: Number(formData.suggestedTimeMinutes),
        priority: formData.priority,
      });

      setIsAddModalOpen(false);
      setFormData({
        studentId: students[0]?.id || '',
        subject: 'Mathematics',
        topic: '',
        reason: '',
        action: '',
        suggestedTimeMinutes: 45,
        priority: 'High',
      });
      await loadData();
    } catch (err: any) {
      alert(`Error creating recommendation: ${err.message}`);
    }
  };

  const handleToggleStatus = async (rec: StudyRecommendation) => {
    const nextStatus = rec.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.updateRecommendationStatus(rec.id, nextStatus);
      await loadData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Class-Wide Personalized Recommendations</span>
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Prescribe, monitor, and evaluate student-specific revision tasks derived from data diagnostics
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/20 hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Prescribe Recommendation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-slate-200 text-xs">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-600">Student:</span>
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="All" className="bg-white">All Students ({recommendations.length})</option>
            {students.map(s => (
              <option key={s.id} value={s.id} className="bg-white">
                {s.name} ({s.class})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-600">Priority:</span>
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="All" className="bg-white">All Tasks</option>
            <option value="High" className="bg-white">Do First</option>
            <option value="Medium" className="bg-white">Do Soon</option>
            <option value="Low" className="bg-white">Can Wait</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-600">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="All" className="bg-white">All Statuses</option>
            <option value="Pending" className="bg-white">Pending</option>
            <option value="In Progress" className="bg-white">In Progress</option>
            <option value="Completed" className="bg-white">Completed</option>
          </select>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-600">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading study recommendations...</span>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-600">
            No study recommendations match the specified filters.
          </div>
        ) : (
          filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                rec.status === 'Completed'
                  ? 'border-emerald-500/20 opacity-80'
                  : rec.priority === 'High'
                  ? 'border-rose-500/30'
                  : 'border-slate-200 hover:border-white/15'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold">
                      {rec.subject}
                    </span>
                    <Badge variant={rec.priority as any} />
                    <Badge variant={rec.status as any} />
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      {rec.studentName}
                    </span>
                    {rec.aiGenerated && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22D3EE]/15 text-[#22D3EE] font-bold">
                        AI Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{rec.topic}</h3>

                  {/* Reason Callout Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <p className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider mb-1">
                      Diagnostic Reason
                    </p>
                    <p className="leading-relaxed">{rec.reason}</p>
                  </div>

                  {/* Action Steps */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-slate-200 text-xs">
                    <p className="font-semibold text-[#22D3EE] uppercase text-[10px] tracking-wider mb-1">
                      Prescribed Action Protocol
                    </p>
                    <p className="text-slate-700 leading-relaxed">{rec.action}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <span>{rec.suggestedTimeMinutes} mins</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedAiRec(rec)}
                      className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-slate-900 transition-all text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Breakdown</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(rec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        rec.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-slate-200 text-slate-900 hover:bg-white/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{rec.status === 'Completed' ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Prescribe Recommendation */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Prescribe Study Recommendation"
        subtitle="Creates an actionable task dispatched directly to the student’s study dashboard"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Study Skills">Study Skills / Time Management</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="High">Do First</option>
                <option value="Medium">Do Soon</option>
                <option value="Low">Can Wait</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Curriculum Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g. Quadratic Equation Factoring & Complex Roots"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Reason ("Why this was generated")</label>
            <textarea
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Recent term exam indicated difficulties with discriminant formulas under timed conditions."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Action to Take (Actionable Steps)</label>
            <textarea
              rows={3}
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="e.g. Review concept chapter, solve 15 problem sets from worksheet A, verify step signs."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Suggested Time (Minutes)</label>
            <input
              type="number"
              min="15"
              max="120"
              step="5"
              value={formData.suggestedTimeMinutes}
              onChange={(e) => setFormData({ ...formData, suggestedTimeMinutes: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8B5CF6]"
              required
            />
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
              Dispatch Recommendation
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Explanation Modal */}
      <GeminiStudyModal
        isOpen={!!selectedAiRec}
        onClose={() => setSelectedAiRec(null)}
        recommendation={selectedAiRec}
      />
    </div>
  );
};
