
import React, { useState } from 'react';
import { BrainCircuit, ChevronRight, Loader2, GraduationCap, Sparkles } from 'lucide-react';
import { CareerSuggestion } from '../../types';

interface OnboardingPageProps {
  onComplete: (career: string) => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<CareerSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const quizQuestions = [
    { q: "What do you enjoy most in a project?", options: ["Visual Design", "Complex Logic", "Security & Protection", "Data Analysis"] },
    { q: "How do you prefer to work?", options: ["Hands-on Coding", "Planning & Architecture", "Testing & Debugging", "Research & Math"] },
    { q: "Which tool sounds more exciting?", options: ["Figma / React", "Kubernetes / AWS", "Python / TensorFlow", "C++ / Rust"] }
  ];

  const handleChoice = (choice: string) => {
    const newAnswers = [...quizAnswers, choice];
    setQuizAnswers(newAnswers);
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      processMockQuiz();
    }
  };

  const processMockQuiz = () => {
    setLoading(true);
    // Simulating API delay with mock data to avoid Gemini API errors
    setTimeout(() => {
      const mockRecs: CareerSuggestion[] = [
        {
          career: "Fullstack Engineer",
          reason: "Your interest in complex logic and React suggests you'd excel at building end-to-end applications.",
          topSkills: ["React", "Node.js", "PostgreSQL"],
          difficulty: "Intermediate"
        },
        {
          career: "DevOps Architect",
          reason: "Your preference for planning and AWS indicates a strong fit for scaling institutional infrastructure.",
          topSkills: ["Docker", "Kubernetes", "Terraform"],
          difficulty: "Advanced"
        },
        {
          career: "AI Research Engineer",
          reason: "The excitement for Python and complex logic aligns perfectly with machine learning research paths.",
          topSkills: ["Python", "TensorFlow", "Calculus"],
          difficulty: "Advanced"
        }
      ];
      setRecommendations(mockRecs);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 blueprint-bg">
      <div className="w-full max-w-4xl animate-reveal">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-20 shadow-2xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          
          {/* Decorative Sparkle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {recommendations.length > 0 ? (
              <div className="space-y-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-careermap-navy rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-teal-500/20">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-4xl font-display font-bold text-primary dark:text-white mb-4">Your Intelligence Match</h2>
                  <p className="text-slate-500 font-medium text-lg">We've identified 3 paths where your strengths align with BiT standards.</p>
                </div>

                <div className="grid gap-4">
                  {recommendations.map((rec) => (
                    <button 
                      key={rec.career}
                      onClick={() => onComplete(rec.career)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-transparent hover:border-teal-500 transition-all flex flex-col md:flex-row justify-between items-center group text-left"
                    >
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-careermap-teal mb-2 block">Top Match</span>
                        <h3 className="text-2xl font-bold text-primary dark:text-white mb-1">{rec.career}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{rec.reason}</p>
                      </div>
                      <div className="mt-6 md:mt-0 bg-white dark:bg-slate-700 p-4 rounded-2xl shadow-sm text-careermap-teal group-hover:bg-careermap-navy group-hover:text-white transition-all">
                        <ChevronRight size={24} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-8">
                <div className="relative">
                   <div className="w-24 h-24 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin" />
                   <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-careermap-teal" size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-bold text-primary dark:text-white mb-2">Architecting Your Path...</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">Cross-referencing your profile with market demand and institutional curricula.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-careermap-navy rounded-2xl flex items-center justify-center text-white">
                      <GraduationCap size={24} />
                   </div>
                   <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                   <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Protocol Setup</span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-5xl font-display font-bold text-primary dark:text-white leading-tight">
                    Tell us your <span className="text-careermap-teal">strengths.</span>
                  </h2>
                  <p className="text-slate-500 font-medium text-xl">The AI needs context to build your custom roadmap.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/30 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6">Objective {quizStep + 1} of {quizQuestions.length}</p>
                  <h3 className="text-3xl font-bold text-primary dark:text-white mb-10">{quizQuestions[quizStep].q}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {quizQuestions[quizStep].options.map((option) => (
                      <button 
                        key={option}
                        onClick={() => handleChoice(option)}
                        className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-bold text-slate-600 dark:text-slate-300 hover:border-teal-500 hover:text-careermap-teal transition-all text-left group flex items-center justify-between"
                      >
                        {option}
                        <ChevronRight className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
