import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { StudyRecommendation } from '../../types/index';
import { api } from '../../services/api';
import { Sparkles, Brain, Clock, HelpCircle, CheckCircle2, AlertCircle, Send, ArrowRight } from 'lucide-react';

interface GeminiStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: StudyRecommendation | null;
  studentName?: string;
}

export const GeminiStudyModal: React.FC<GeminiStudyModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  studentName
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [source, setSource] = useState<string>('');
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick tutor question inside modal
  const [chatQuestion, setChatQuestion] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !recommendation) {
      setExplanation(null);
      setError(null);
      setChatAnswer(null);
      return;
    }

    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.explainRecommendation({
          subject: recommendation.subject,
          topic: recommendation.topic,
          reason: recommendation.reason,
          action: recommendation.action,
          studentName: studentName || recommendation.studentName
        });
        setSource(res.source);
        setExplanation(res.explanation);
      } catch (err: any) {
        setError(err.message || 'Sorry, study help could not be created.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [isOpen, recommendation, studentName]);

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || chatLoading) return;
    setChatLoading(true);
    try {
      const res = await api.askTutor({
        question: chatQuestion,
        subject: recommendation?.subject,
        topic: recommendation?.topic
      });
      setChatAnswer(res.reply);
    } catch {
      setChatAnswer('Review the main idea, draw a simple picture, and try the question again.');
    } finally {
      setChatLoading(false);
    }
  };

  if (!recommendation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your AI Study Guide"
      subtitle={`${recommendation.subject} • ${recommendation.topic}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Source banner */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-slate-700 font-medium">Educational Guidance Engine:</span>
            <span className="text-[#22D3EE] font-mono uppercase font-semibold">
              {source.includes('gemini') ? 'AI Study Help Ready' : 'Study Help'}
            </span>
          </div>
          <span className="text-slate-600 text-[11px]">Notice: Generative study assistance, not predictive ML</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-700 font-medium">Synthesizing personalized revision strategy...</p>
            <p className="text-xs text-slate-600">Analyzing curriculum topics and optimal recall intervals</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Notice</p>
              <p className="text-xs text-rose-400/90 mt-1">{error}</p>
            </div>
          </div>
        ) : explanation ? (
          <div className="space-y-6">
            {/* 1. Why this matters */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#8B5CF6] mb-2">
                <Brain className="w-4 h-4" />
                <h4>Why Master This Concept?</h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{explanation.overview}</p>
            </div>

            {/* 2. Common Stumbling Blocks */}
            {explanation.stumblingBlocks && explanation.stumblingBlocks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Common Misconceptions to Watch For
                </h4>
                <div className="grid gap-2">
                  {explanation.stumblingBlocks.map((block: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{block}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Structured 45-Minute Revision Protocol */}
            {explanation.strategy45Min && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#22D3EE]" />
                  Recommended 45-Minute Revision Protocol
                </h4>
                <div className="grid gap-2 sm:grid-cols-3">
                  {explanation.strategy45Min.map((step: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-[#22D3EE]/20 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#22D3EE] px-2 py-0.5 rounded bg-[#22D3EE]/10">
                          {step.step}
                        </span>
                        <h5 className="font-semibold text-xs text-[#F1F5F9] mt-2 mb-1">{step.title}</h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Knowledge Check Questions */}
            {explanation.knowledgeCheckQuestions && explanation.knowledgeCheckQuestions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Self-Check Diagnostic Questions
                </h4>
                <div className="space-y-2">
                  {explanation.knowledgeCheckQuestions.map((q: any, idx: number) => (
                    <details
                      key={idx}
                      className="group rounded-lg bg-slate-50/70 border border-slate-200 p-3 text-xs text-slate-700 transition-colors hover:border-slate-200"
                    >
                      <summary className="font-medium text-[#F1F5F9] cursor-pointer list-none flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{q.question}</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 group-open:hidden">Show Hint</span>
                      </summary>
                      <div className="mt-2 pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                        <strong className="text-emerald-400">Hint: </strong>
                        {q.hint}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Interactive Tutor Prompt */}
            <div className="pt-3 border-t border-slate-200">
              <form onSubmit={handleAskTutor} className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                  Have a specific question on this topic?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder={`e.g., How does pressure alter dynamic equilibrium in this example?`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatQuestion.trim()}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-semibold hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 transition-opacity"
                  >
                    {chatLoading ? 'Thinking...' : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>

              {chatAnswer && (
                <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-[#F472B6]/30 text-xs text-slate-700 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-[#F472B6] font-semibold mb-1">
                    <Brain className="w-3.5 h-3.5" />
                    <span>AI Study Help:</span>
                  </div>
                  <p className="leading-relaxed">{chatAnswer}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 text-xs font-medium text-slate-900 hover:bg-white/15 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </Modal>
  );
};
