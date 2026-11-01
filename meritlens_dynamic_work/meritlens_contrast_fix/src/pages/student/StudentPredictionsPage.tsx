import React, { useEffect, useState } from 'react';
import { Activity, BrainCircuit, RefreshCw, ShieldCheck, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { MLPredictionInput, MLPredictionResult, Student } from '../../types';

const panel = 'rounded-2xl border border-white/10 bg-[#151D32] p-5 shadow-lg shadow-black/10';

export const StudentPredictionsPage: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<MLPredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPrediction = async () => {
    setLoading(true);
    setError('');
    try {
      // Student-authenticated API returns only this student's record.
      const students = await api.getStudents();
      const own = students[0];
      if (!own) throw new Error('Your student record is not linked to this account yet. Please contact your teacher.');
      setStudent(own);
      const scores = Object.fromEntries((own.subjects || []).map((s) => [s.subject, Number(s.score) || 0]));
      const average = own.subjects?.length ? own.subjects.reduce((sum, s) => sum + (Number(s.score) || 0), 0) / own.subjects.length : own.currentScore || 0;
      const input: MLPredictionInput = {
        previousMarks: Number(own.previousMarks) || average,
        attendance: Number(own.attendance) || 0,
        assignmentCompletion: Number(own.assignmentCompletion) || 0,
        studyHoursWeek: Number(own.studyHoursWeek) || 0,
        mathScore: scores.Mathematics ?? average,
        scienceScore: scores.Science ?? average,
        englishScore: scores.English ?? average,
        historyScore: scores.History ?? average,
        subjectScores: scores,
      };
      const result = await api.predictML(input);
      setPrediction(result);
    } catch (e: any) {
      setError(e?.message || 'Could not load your prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPrediction(); }, []);

  const riskColor = prediction?.riskLevel === 'Low' ? 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20' : prediction?.riskLevel === 'Moderate' ? 'text-amber-300 bg-amber-400/10 border-amber-400/20' : 'text-rose-300 bg-rose-400/10 border-rose-400/20';

  return <div className="space-y-6 pb-10 text-slate-100">
    <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#1b2440] via-[#151d32] to-[#112a3a] p-6 sm:p-8">
      <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200"><BrainCircuit size={14}/> Your personal ML insight</div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">My Performance Prediction</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">A private view of your estimated result, based only on your own marks, attendance, assignments, and study time.</p>
          {student && <p className="mt-3 text-sm text-slate-400">Student: <span className="font-semibold text-white">{student.name}</span> <span className="mx-1 text-slate-600">•</span> {student.class}</p>}
        </div>
        <button onClick={() => void loadPrediction()} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-60"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>{loading ? 'Updating…' : 'Refresh prediction'}</button>
      </div>
    </section>

    {error && <div className="flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-200"><AlertTriangle size={18} className="mt-0.5 shrink-0"/><span>{error}</span></div>}
    {loading && <div className={`${panel} animate-pulse text-sm text-slate-300`}>Calculating your personal prediction…</div>}
    {!loading && prediction && student && <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`${panel} sm:col-span-2`}><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated marks</p><p className="mt-2 text-4xl font-black text-cyan-300">{Number(prediction.predictedScore).toFixed(1)}%</p><p className="mt-1 text-sm text-slate-400">Current marks: {Number(student.currentScore).toFixed(1)}%</p></div><div className="rounded-xl bg-cyan-300/10 p-3 text-cyan-300"><TrendingUp size={22}/></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300" style={{width:`${Math.max(0, Math.min(100, prediction.predictedScore))}%`}}/></div></div>
        <div className={panel}><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Performance band</p><p className="mt-3 text-xl font-extrabold text-violet-300">{prediction.performanceCategory}</p><p className="mt-2 text-xs text-slate-400">Based on the current prediction</p></div>
        <div className={panel}><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk level</p><span className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${riskColor}`}>{prediction.riskLevel}</span><p className="mt-2 text-xs text-slate-400">Use this as guidance, not a final grade.</p></div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={panel}><div className="mb-4 flex items-center gap-2"><Activity size={18} className="text-cyan-300"/><h2 className="font-bold">Your subject marks</h2></div><div className="space-y-4">{(student.subjects || []).map((subject, i) => <div key={`${subject.subject}-${i}`}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="font-medium text-slate-200">{subject.subject}</span><span className="font-mono font-bold text-cyan-200">{subject.score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300" style={{width:`${Math.max(0, Math.min(100, Number(subject.score)||0))}%`}}/></div></div>)}</div></div>
        <div className={panel}><div className="mb-4 flex items-center gap-2"><Sparkles size={18} className="text-violet-300"/><h2 className="font-bold">What to focus on</h2></div><div className="space-y-3"><div className="rounded-xl border border-rose-300/15 bg-rose-300/5 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Practice next</p><p className="mt-1 font-bold text-rose-200">{prediction.weakestSubject || 'Review your lowest-scoring subject'}</p></div><div className="rounded-xl border border-emerald-300/15 bg-emerald-300/5 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your strongest area</p><p className="mt-1 font-bold text-emerald-200">{prediction.strongestSubject || 'Keep up your regular practice'}</p></div>{(prediction.suggestedInterventions || []).slice(0,3).map((tip, i) => <div key={i} className="flex gap-2 text-sm leading-5 text-slate-300"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-cyan-300"/><span>{tip}</span></div>)}</div></div>
      </section>
      <p className="text-xs leading-5 text-slate-500">This is an estimate generated from the academic data currently saved for your account. Your teacher can update your marks and attendance, so refresh to see the latest result.</p>
    </>}
  </div>;
};
