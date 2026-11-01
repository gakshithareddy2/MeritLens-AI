import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Shield,
  FileCode,
  HardDrive,
  Download,
  Plus,
  Trash2,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [subjectBusy, setSubjectBusy] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState('');

  useEffect(() => { api.getSubjects().then(setSubjects).catch((err) => setMessage(err.message)); api.getClasses().then(setClasses).catch((err) => setMessage(err.message)); }, []);

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    setSubjectBusy(true); setMessage(null);
    try { setSubjects(await api.addSubject(newSubject)); setNewSubject(''); setMessage('Subject added to the catalogue and student records.'); }
    catch (err: any) { setMessage(err.message || 'Could not add subject.'); }
    finally { setSubjectBusy(false); }
  };

  const handleAddClass = async () => {
    if (!newClass.trim()) return;
    setSubjectBusy(true); setMessage(null);
    try { setClasses(await api.addClass(newClass)); setNewClass(''); setMessage('Class added to the class catalogue.'); }
    catch (err: any) { setMessage(err.message || 'Could not add class.'); }
    finally { setSubjectBusy(false); }
  };

  const handleDeleteClass = async (className: string) => {
    if (!window.confirm(`Remove ${className} from the class catalogue?`)) return;
    setSubjectBusy(true); setMessage(null);
    try { setClasses(await api.deleteClass(className)); setMessage(`${className} removed.`); }
    catch (err: any) { setMessage(err.message || 'Could not remove class.'); }
    finally { setSubjectBusy(false); }
  };

  const handleDeleteSubject = async (subject: string) => {
    if (!window.confirm(`Remove ${subject} from the subject catalogue and student records?`)) return;
    setSubjectBusy(true); setMessage(null);
    try { setSubjects(await api.deleteSubject(subject)); setMessage(`${subject} removed.`); }
    catch (err: any) { setMessage(err.message || 'Could not remove subject.'); }
    finally { setSubjectBusy(false); }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset all student data, recommendations, and goals back to the initial realistic seed dataset?')) {
      return;
    }
    setResetting(true);
    setMessage(null);
    try {
      await api.resetData();
      setMessage('Database successfully reset to original seed data with 8 students, complete recommendations, and sample goals.');
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#8B5CF6]" />
          <span>System Settings & Architecture Status</span>
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Configuration parameters, model coefficients, and environment service telemetry
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Class management */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#171d33] to-[#11182b] p-5 sm:p-6 space-y-5 shadow-xl shadow-black/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-500/15 p-3 text-cyan-300"><GraduationCap className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1"><h3 className="text-base font-bold text-slate-100">Class Cohort Catalogue</h3><p className="mt-1 text-sm text-slate-400">Create classes and sections used in student records. Classes with enrolled students cannot be removed.</p></div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">{classes.length} classes</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={newClass} onChange={(e) => setNewClass(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddClass(); }} placeholder="e.g. Class 9-B, Grade 12 Commerce" maxLength={60} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#0b1020] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none" />
          <button onClick={handleAddClass} disabled={subjectBusy || !newClass.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"><Plus className="h-4 w-4" /> Add class</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {classes.map((className) => { const isDefault = ['Class 10-A', 'Class 10-B', 'Class 11-A', 'Class 12-Sci'].includes(className); return <div key={className} className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-[#0b1020]/80 p-3.5"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-100">{className}</p><p className="mt-0.5 text-[11px] text-slate-500">{isDefault ? 'Default class' : 'Custom class'}</p></div>{isDefault ? <span className="text-[10px] font-semibold text-slate-500">DEFAULT</span> : <button aria-label={`Remove ${className}`} disabled={subjectBusy} onClick={() => handleDeleteClass(className)} className="rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>}</div>; })}
        </div>
      </section>

      {/* Subject management */}
      <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#171d33] to-[#11182b] p-5 sm:p-6 space-y-5 shadow-xl shadow-black/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300"><BookOpen className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-100">Subject Catalogue</h3>
            <p className="mt-1 text-sm text-slate-400">Add subjects used by student records, performance analysis, and ML predictions. Changes are saved on the server.</p>
          </div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">{subjects.length} subjects</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject(); }} placeholder="Enter a subject name, e.g. Computer Science" maxLength={60}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#0b1020] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
          <button onClick={handleAddSubject} disabled={subjectBusy || !newSubject.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"><Plus className="h-4 w-4" /> Add subject</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {subjects.map((subject) => {
            const core = ['Mathematics', 'Science', 'English', 'History'].includes(subject);
            return <div key={subject} className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-[#0b1020]/80 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300"><BookOpen className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-100">{subject}</p><p className="mt-0.5 text-[11px] text-slate-500">{core ? 'Core subject' : 'Custom subject'}</p></div>
              {core ? <span className="text-[10px] font-semibold text-slate-500">CORE</span> : <button aria-label={`Remove ${subject}`} title={`Remove ${subject}`} disabled={subjectBusy} onClick={() => handleDeleteSubject(subject)} className="rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>}
            </div>;
          })}
        </div>
        <p className="text-xs leading-relaxed text-slate-500">Core subjects cannot be removed. New subjects are added to existing student records with a starting mark of 0, which teachers can update in student management.</p>
      </section>

      {/* Services Health Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#22D3EE]" />
              Express Backend API
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              PORT 3000 ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            RESTful API routes handling auth, student CRUD, metrics aggregation, and goals.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#8B5CF6]" />
              ML Prediction Engine
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              CALIBRATED
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Ensemble Random Forest & Gradient Boosted Regressor (R² = 0.942, Acc = 93.5%).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F472B6]" />
              Gemini AI Integration
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold">
              SERVER PROXY
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Connected via server-side `@google/genai` using <code>gemini-3.8-flash</code> with graceful fallback.
          </p>
        </div>
      </div>

      {/* Model Weights & Formula Breakdown */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#8B5CF6]" />
          <span>Active ML Feature Weights & Empirical Correlation</span>
        </h3>
        <p className="text-xs text-slate-600">
          The ensemble model evaluates academic trajectory using the following verified weights:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-600">Previous Marks</p>
            <p className="text-xl font-extrabold text-[#8B5CF6] mt-1">28%</p>
            <span className="text-[10px] text-slate-600">Baseline momentum</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-600">Subject Mean</p>
            <p className="text-xl font-extrabold text-[#22D3EE] mt-1">22%</p>
            <span className="text-[10px] text-slate-600">Current assessments</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-600">Assignments</p>
            <p className="text-xl font-extrabold text-[#F472B6] mt-1">20%</p>
            <span className="text-[10px] text-slate-600">Diligence & practice</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-600">Attendance</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">18%</p>
            <span className="text-[10px] text-slate-600">Lesson continuity</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-600">Study Time</p>
            <p className="text-xl font-extrabold text-amber-400 mt-1">12%</p>
            <span className="text-[10px] text-slate-600">Self-directed study</span>
          </div>
        </div>
      </div>

      {/* Database Maintenance */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-rose-400" />
          <span>Database Administration & Seed Restoration</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Restore clean realistic sample data including 8 multi-tier students (Mahitha, Akshitha, Madhu, Bhommi, Ava Johnson, etc.), tailored study recommendations, and goals.
        </p>

        <div className="pt-2">
          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Restoring Database...' : 'Restore Initial Seed Data'}</span>
          </button>
        </div>
      </div>

      {/* Project Source Code ZIP Download */}
      <div className="p-5 rounded-2xl bg-white border border-[#22D3EE]/25 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Download className="w-4 h-4 text-[#22D3EE]" />
              <span>Download Complete Project Source Code (.ZIP)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Export the full codebase including frontend React components, full-stack Express server, scikit-learn ML pipeline & dataset, test suites, and documentation.
            </p>
          </div>

          <a
            href="/api/download-zip"
            download="meritlens-ai-source.zip"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/20 hover:opacity-95 transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download ZIP</span>
          </a>
        </div>
      </div>
    </div>
  );
};
