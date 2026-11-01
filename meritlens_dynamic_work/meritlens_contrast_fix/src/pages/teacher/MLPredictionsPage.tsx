import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MLPredictionInput, MLPredictionResult, Student } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import {
  Cpu,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  HelpCircle,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const MLPredictionsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [subjectCatalogue, setSubjectCatalogue] = useState<string[]>(['Mathematics', 'Science', 'English', 'History']);

  // Form inputs
  const [inputs, setInputs] = useState<MLPredictionInput>({
    previousMarks: 72,
    attendance: 78,
    assignmentCompletion: 70,
    studyHoursWeek: 9,
    mathScore: 68,
    scienceScore: 65,
    englishScore: 78,
    historyScore: 72,
    subjectScores: { Mathematics: 68, Science: 65, English: 78, History: 72 },
  });

  const [prediction, setPrediction] = useState<MLPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getStudents(), api.getSubjects()]).then(([loadedStudents, loadedSubjects]) => {
      setStudents(loadedStudents);
      setSubjectCatalogue(loadedSubjects);
      setInputs(current => ({ ...current, subjectScores: Object.fromEntries(loadedSubjects.map((name) => [name, current.subjectScores?.[name] ?? 70])) }));
    }).catch(console.error);
    // Run initial prediction
    handleRunPrediction(inputs);
  }, []);

  const handleRunPrediction = async (currentInputs: MLPredictionInput) => {
    setLoading(true);
    setPrescriptionSuccess(null);
    try {
      const res = await api.predictML(currentInputs);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (!studentId) return;
    const st = students.find(s => s.id === studentId);
    if (!st) return;

    const math = st.subjects.find(s => s.subject === 'Mathematics')?.score || 70;
    const science = st.subjects.find(s => s.subject === 'Science')?.score || 70;
    const english = st.subjects.find(s => s.subject === 'English')?.score || 75;
    const history = st.subjects.find(s => s.subject === 'History')?.score || 70;

    const loaded: MLPredictionInput = {
      previousMarks: st.previousMarks,
      attendance: st.attendance,
      assignmentCompletion: st.assignmentCompletion,
      studyHoursWeek: st.studyHoursWeek,
      mathScore: math,
      scienceScore: science,
      englishScore: english,
      historyScore: history,
      subjectScores: Object.fromEntries(subjectCatalogue.map((name) => [name, st.subjects.find((subject) => subject.subject === name)?.score ?? 0])),
    };
    setInputs(loaded);
    handleRunPrediction(loaded);
  };

  const handleApplyPreset = (type: 'atRisk' | 'average' | 'distinction') => {
    let preset: MLPredictionInput;
    if (type === 'atRisk') {
      preset = {
        previousMarks: 52,
        attendance: 64,
        assignmentCompletion: 55,
        studyHoursWeek: 5,
        mathScore: 48,
        scienceScore: 50,
        englishScore: 58,
        historyScore: 52,
      };
    } else if (type === 'average') {
      preset = {
        previousMarks: 74,
        attendance: 82,
        assignmentCompletion: 80,
        studyHoursWeek: 10,
        mathScore: 72,
        scienceScore: 70,
        englishScore: 78,
        historyScore: 74,
      };
    } else {
      preset = {
        previousMarks: 92,
        attendance: 96,
        assignmentCompletion: 98,
        studyHoursWeek: 18,
        mathScore: 94,
        scienceScore: 92,
        englishScore: 95,
        historyScore: 89,
      };
    }
    preset.subjectScores = Object.fromEntries(subjectCatalogue.map((name) => [name, ({ Mathematics: preset.mathScore, Science: preset.scienceScore, English: preset.englishScore, History: preset.historyScore } as Record<string, number>)[name] ?? 70]));
    setSelectedStudentId('');
    setInputs(preset);
    handleRunPrediction(preset);
  };

  const handlePrescribeIntervention = async (interventionText: string) => {
    if (!prediction) return;
    try {
      const targetStudent = students.find(s => s.id === selectedStudentId);
      const studentId = targetStudent ? targetStudent.id : students[0]?.id || 'STU001';

      await api.createRecommendation({
        studentId,
        subject: prediction.weakestSubject,
        topic: `${prediction.weakestSubject} Remedial Consolidation`,
        reason: `Generated from ML Prediction Model (Expected marks: ${prediction.predictedScore}%, Risk: ${prediction.riskLevel}).`,
        action: interventionText,
        suggestedTimeMinutes: 45,
        priority: prediction.riskLevel === 'Critical' || prediction.riskLevel === 'High' ? 'High' : 'Medium',
      });

      setPrescriptionSuccess(`Intervention successfully prescribed and dispatched to ${targetStudent ? targetStudent.name : 'student'} study queue.`);
    } catch (err: any) {
      alert(`Error prescribing intervention: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Machine Learning Performance Laboratory
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] font-mono text-[10px] font-bold">
              v2.4 Ensemble RF + GBR
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Holistic multi-factor predictive evaluation integrating attendance, coursework diligence, and self-study habits
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-600 font-semibold">Load Example:</span>
          <button
            onClick={() => handleApplyPreset('atRisk')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/20 text-xs font-medium hover:bg-rose-500/25 transition-colors"
          >
            Struggling (At Risk)
          </button>
          <button
            onClick={() => handleApplyPreset('average')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/20 text-xs font-medium hover:bg-amber-500/25 transition-colors"
          >
            Average (Pass/Merit)
          </button>
          <button
            onClick={() => handleApplyPreset('distinction')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/25 transition-colors"
          >
            High Performer (Distinction)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#8B5CF6]" />
                <span>Enter Student Details</span>
              </h3>

              {/* Student populate dropdown */}
              <select
                value={selectedStudentId}
                onChange={(e) => handleLoadStudent(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="">-- Load Enrolled Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {/* Previous Marks */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Previous Test Marks (Weight: 28%)</span>
                  <span className="font-mono font-bold text-[#8B5CF6]">{inputs.previousMarks}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={inputs.previousMarks}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...inputs, previousMarks: val };
                    setInputs(updated);
                    handleRunPrediction(updated);
                  }}
                  className="w-full accent-[#8B5CF6] cursor-pointer"
                />
              </div>

              {/* Attendance */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Attendance (%) (Weight: 18%)</span>
                  <span className={`font-mono font-bold ${inputs.attendance < 75 ? 'text-rose-400' : 'text-[#22D3EE]'}`}>
                    {inputs.attendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={inputs.attendance}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...inputs, attendance: val };
                    setInputs(updated);
                    handleRunPrediction(updated);
                  }}
                  className="w-full accent-[#22D3EE] cursor-pointer"
                />
              </div>

              {/* Assignments Done */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Assignments Completed (%) (Weight: 20%)</span>
                  <span className="font-mono font-bold text-[#F472B6]">{inputs.assignmentCompletion}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={inputs.assignmentCompletion}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...inputs, assignmentCompletion: val };
                    setInputs(updated);
                    handleRunPrediction(updated);
                  }}
                  className="w-full accent-[#F472B6] cursor-pointer"
                />
              </div>

              {/* Study Time This Week */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Study Time per Week (Weight: 12%)</span>
                  <span className="font-mono font-bold text-emerald-400">{inputs.studyHoursWeek} hrs/week</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={inputs.studyHoursWeek}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...inputs, studyHoursWeek: val };
                    setInputs(updated);
                    handleRunPrediction(updated);
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-600">Suggested target: 14 hours each week</span>
              </div>

              {/* Dynamic subject marks */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <p className="text-xs font-semibold text-slate-700">Marks by Subject</p>
                  <span className="text-[10px] text-cyan-300">{subjectCatalogue.length} subjects</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjectCatalogue.map((subject) => (
                    <div key={subject}>
                      <label className="text-[11px] text-slate-600 block mb-1">{subject}</label>
                      <input type="number" min="0" max="100" value={inputs.subjectScores?.[subject] ?? 0}
                        onChange={(e) => {
                          const scores = { ...(inputs.subjectScores || {}), [subject]: Math.max(0, Math.min(100, Number(e.target.value))) };
                          const updated = { ...inputs, subjectScores: scores };
                          setInputs(updated);
                          handleRunPrediction(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">The prediction uses the average of the subjects listed here. Add or remove subjects in Teacher Settings.</p>
              </div>
            </div>
          </div>

          {/* Model Specification Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Brain className="w-4 h-4 text-[#8B5CF6]" />
              <span>How the Prediction Model Works</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Trained via <strong>RandomForestClassifier</strong> (120 estimators, max depth 6) + <strong>GradientBoostingRegressor</strong>. Preprocessed via standard scaling with 80/20 train/test split.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-center">
              <div className="p-2 rounded bg-white/[0.02] border border-slate-200">
                <span className="text-slate-600 block">R² Score</span>
                <span className="text-[#22D3EE] font-bold text-xs">0.942</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-slate-200">
                <span className="text-slate-600 block">Accuracy</span>
                <span className="text-[#8B5CF6] font-bold text-xs">93.5%</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-slate-200">
                <span className="text-slate-600 block">Mean Sq Error</span>
                <span className="text-emerald-400 font-bold text-xs">4.12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Results & Prescriptions */}
        <div className="lg:col-span-7 space-y-5">
          {prediction && (
            <>
              {/* Primary Prediction Score Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#8B5CF6]/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Expected Marks Final Score
                    </span>
                    <div className="mt-1 flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        {prediction.predictedScore}%
                      </span>
                      <Badge variant={prediction.performanceCategory} size="md" />
                      <Badge variant={prediction.riskLevel} size="md" />
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Model Confidence: <span className="text-emerald-400 font-semibold font-mono">{(prediction.confidenceScore * 100).toFixed(0)}%</span> • Pacing Ratio: {prediction.studyPacingRatio}%
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[140px]">
                    <span className="text-[10px] uppercase font-bold text-slate-600">Subject to Improve</span>
                    <p className="text-sm font-bold text-rose-400 mt-1">{prediction.weakestSubject}</p>
                    <span className="text-[10px] text-slate-600 block mt-2">Best Subject</span>
                    <p className="text-xs font-semibold text-emerald-400">{prediction.strongestSubject}</p>
                  </div>
                </div>

                {prescriptionSuccess && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{prescriptionSuccess}</span>
                  </div>
                )}
              </div>

              {/* Contributing Factors Breakdown Chart */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#22D3EE]" />
                  <span>What Affects the Result</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Relative positive and negative weights contributing to the predicted outcome
                </p>

                <div className="space-y-2 pt-2">
                  {prediction.contributingFactors.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{f.factor}</span>
                          <span className="text-[10px] text-slate-600 font-mono">Weight: {(f.weight * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{f.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-xs ${f.status === 'positive' ? 'text-emerald-400' : f.status === 'neutral' ? 'text-amber-400' : 'text-rose-400'}`}>
                          {f.impactScore} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Learning Gaps */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Topics to Improve</span>
                </h3>
                <div className="space-y-2">
                  {prediction.learningGaps.map((gap, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Interventions & Direct Prescription */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Suggested Next Steps</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Targeted remediation actions calibrated by the recommendation engine
                </p>

                <div className="space-y-2.5 pt-1">
                  {prediction.suggestedInterventions.map((actionText, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-medium leading-relaxed">{actionText}</span>
                      </div>
                      <button
                        onClick={() => handlePrescribeIntervention(actionText)}
                        className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-slate-900 transition-all text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
                      >
                        Prescribe Action
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
