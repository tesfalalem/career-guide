import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, Clock, CheckCircle, XCircle,
  Loader2, AlertCircle, ArrowRight, ArrowLeft, Trophy
} from 'lucide-react';

interface AssessmentViewProps { userId: string; }

interface Assessment {
  id: number; title: string; description: string;
  time_limit: number; course_title: string; level: string;
  question_count: number; attempt_count: number; last_score: number | null;
}

interface Question {
  id: number; question: string; options: string[];
}

interface QuizResult {
  score: number; total: number; percentage: number; passed: boolean;
  results: { question_id: number; selected: number; correct_answer: number; is_correct: boolean; explanation: string }[];
}

const API = 'http://localhost:8000/api';
const token = () => localStorage.getItem('auth_token');

const AssessmentView: React.FC<AssessmentViewProps> = ({ userId }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<{ id: number; title: string; questions: Question[] } | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    fetch(`${API}/assessments`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => setAssessments(Array.isArray(d) ? d : []))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const startQuiz = async (id: number, title: string) => {
    setLoadingQuiz(true);
    try {
      const res = await fetch(`${API}/assessments/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setActiveAssessment({ id, title, questions: data.questions || [] });
      setAnswers({});
      setCurrentQ(0);
      setResult(null);
    } catch { alert('Failed to load quiz'); }
    finally { setLoadingQuiz(false); }
  };

  const submitQuiz = async () => {
    if (!activeAssessment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data);
    } catch { alert('Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const resetQuiz = () => { setActiveAssessment(null); setResult(null); setAnswers({}); };

  // ── Result Screen ──
  if (result && activeAssessment) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className={`rounded-[2.5rem] p-10 text-center ${result.passed ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800'}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {result.passed ? <Trophy size={40} className="text-emerald-500" /> : <XCircle size={40} className="text-red-500" />}
          </div>
          <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white mb-2">
            {result.passed ? 'Assessment Conquered!' : 'Attempt Completed'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">{activeAssessment.title}</p>
          <div className="text-6xl font-serif font-black mb-4" style={{ color: result.passed ? '#10b981' : '#ef4444' }}>
            {result.percentage}%
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{result.score} / {result.total} Correct · {result.passed ? 'Platinum Badge Earned' : 'Threshold: 70%'}</p>
          {result.passed && <p className="text-emerald-500 font-black text-sm mt-4 uppercase tracking-[0.2em]">+{result.score * 10} Mastery XP</p>}
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-3">
          {result.results.map((r, i) => {
            const q = activeAssessment.questions[i];
            return (
              <div key={i} className={`p-6 rounded-[2rem] border ${r.is_correct ? 'border-emerald-100 bg-emerald-50/30 dark:bg-emerald-900/5' : 'border-red-100 bg-red-50/30 dark:bg-red-900/5'}`}>
                <div className="flex items-start gap-4">
                  {r.is_correct ? <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-careermap-navy dark:text-white leading-relaxed">{q?.question}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Your answer: <span className={r.is_correct ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{q?.options[r.selected] ?? 'Not answered'}</span>
                      {!r.is_correct && <> · Correct: <span className="text-green-600 font-bold">{q?.options[r.correct_answer]}</span></>}
                    </p>
                    {r.explanation && <p className="text-xs text-slate-400 mt-1 italic">{r.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={resetQuiz} className="w-full py-5 rounded-2xl bg-careermap-navy text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-navy-500/20">
          Return to Deck
        </button>
      </div>
    );
  }

  // ── Active Quiz ──
  if (activeAssessment) {
    const q = activeAssessment.questions[currentQ];
    const total = activeAssessment.questions.length;
    const allAnswered = activeAssessment.questions.every(q => answers[q.id] !== undefined);

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="flex items-center justify-between">
          <button onClick={resetQuiz} className="flex items-center gap-2 text-slate-400 hover:text-careermap-navy transition-all text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={16} /> Abandon Session
          </button>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentQ + 1} OF {total}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-careermap-teal transition-all duration-500 ease-out" style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm">
          <h3 className="text-xl md:text-2xl font-serif font-black text-careermap-navy dark:text-white mb-8 leading-tight">{q?.question}</h3>
          <div className="space-y-4">
            {q?.options.map((opt, oi) => (
              <button key={oi} type="button"
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                className={`w-full text-left px-6 py-5 rounded-[1.5rem] border-2 font-bold text-sm transition-all duration-300 ${answers[q.id] === oi ? 'border-careermap-teal bg-careermap-teal/5 text-careermap-navy dark:text-careermap-teal' : 'border-slate-100 dark:border-slate-800 hover:border-careermap-teal/30 text-slate-600 dark:text-slate-400'}`}>
                <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg mr-4 transition-colors ${answers[q.id] === oi ? 'bg-careermap-teal text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>{String.fromCharCode(65 + oi)}</span>{opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <button disabled={currentQ === 0} onClick={() => setCurrentQ(i => i - 1)}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-xs uppercase tracking-widest text-slate-400 disabled:opacity-20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <ArrowLeft size={16} /> Previous
          </button>
          {currentQ < total - 1 ? (
            <button onClick={() => setCurrentQ(i => i + 1)}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-careermap-navy text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-navy-500/10">
              Advance <ArrowRight size={16} />
            </button>
          ) : (
            <button disabled={!allAnswered || submitting} onClick={submitQuiz}
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-careermap-teal text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50">
              {submitting ? <><Loader2 className="animate-spin" size={16} /> Finalizing...</> : <>Complete Deck <CheckCircle size={16} /></>}
            </button>
          )}
        </div>
        {!allAnswered && currentQ === total - 1 && (
          <p className="text-xs text-amber-500 text-center font-semibold">Answer all questions before submitting</p>
        )}
      </div>
    );
  }

  // ── Assessment List ──
  return (
    <div className="space-y-8 pb-20">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-careermap-navy dark:text-white mb-3 tracking-tight">Assessment Center</h1>
        <p className="text-lg text-slate-500 font-medium font-sans">Validate your expertise and earn mastery certificates</p>
      </header>

      {loading || loadingQuiz ? (
        <div className="flex justify-center p-32"><Loader2 className="animate-spin text-careermap-teal" size={48} /></div>
      ) : assessments.length === 0 ? (
        <div className="text-center p-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-500">No Assessments Available</h3>
          <p className="text-slate-400 text-sm mt-1">Enroll in a course that has an assessment to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assessments.map(a => (
            <div key={a.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-careermap-teal hover:shadow-[0_30px_60px_-15px_rgba(20,184,166,0.15)] transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="w-20 h-20 rounded-3xl bg-careermap-navy/5 text-careermap-navy dark:text-careermap-teal flex items-center justify-center shrink-0 group-hover:bg-careermap-teal group-hover:text-white transition-all duration-500 shadow-sm">
                  <ClipboardCheck size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-serif font-black text-careermap-navy dark:text-white text-2xl group-hover:text-careermap-navy dark:group-hover:text-careermap-teal transition-colors mb-2">{a.title}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full"><Clock size={12} className="text-careermap-teal" /> {a.time_limit} MIN Sesssion</span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full">{a.question_count} Milestones</span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-careermap-teal/10 text-careermap-teal rounded-full">{a.level} Level</span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-careermap-navy/5 text-careermap-navy rounded-full">{a.course_title}</span>
                  </div>
                  {a.last_score !== null && (
                    <p className="text-xs text-slate-400 mt-4 font-bold flex items-center gap-2 justify-center md:justify-start">
                      Performance Index: <span className={`px-2 py-0.5 rounded-md ${a.last_score >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{a.last_score}%</span>
                      {' '}· Attempt {a.attempt_count}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => startQuiz(a.id, a.title)}
                className="flex items-center gap-3 px-8 py-5 bg-careermap-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shrink-0 shadow-xl shadow-navy-500/10">
                {a.attempt_count > 0 ? 'Recalibrate' : 'Initiate'} <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentView;
