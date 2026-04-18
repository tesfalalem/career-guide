import React from 'react';
import { Book, CheckCircle, Flag, Play, Layout, Compass, Award, Star } from 'lucide-react';

const UserGuidePage: React.FC = () => {
  const steps = [
    {
      title: "1. Create Your Account",
      icon: Layout,
      content: "Sign up using your BDU email. Choose your role: 'Student' for learners or 'Teacher' for content contributors.",
      details: ["Verification required for teacher accounts", "Fill in your academic year and department"]
    },
    {
      title: "2. Personalize Your Onboarding",
      icon: Compass,
      content: "Tell the AI about your interests (e.g., 'I want to be a Web Developer' or 'I love Data Science').",
      details: ["The AI uses these to build your initial path", "You can skip and explore curated roadmaps first"]
    },
    {
      title: "3. Master Your Roadmap",
      icon: Flag,
      content: "Follow the step-by-step modules. Each phase contains hand-picked courses and resources to master specific skills.",
      details: ["Track progress through visual milestones", "Enroll in courses linked to your career goal"]
    },
    {
      title: "4. Earn XP and Track Progress",
      icon: Award,
      content: "Complete lessons and quizzes to earn Experience Points (XP). Maintain your streak by learning daily.",
      details: ["Monitor your progress on the Dashboard", "Compare your standing with the BiT community"]
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-slate-950">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Hero Section */}
        <div className="text-center mb-24 animate-fade-in-up">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Book size={32} />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            User Guide
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Welcome to CareerGuide! This guide will walk you through everything you need to know to start engineering your future.
          </p>
        </div>

        {/* Quick Start Video Placeholder */}
        <div className="relative aspect-video rounded-[2.5rem] bg-slate-900 overflow-hidden mb-32 shadow-2xl animate-fade-in-up">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <button className="w-20 h-20 bg-careermap-teal hover:bg-teal-400 text-white rounded-full flex items-center justify-center mb-6 transition-all hover:scale-110 active:scale-95 shadow-xl shadow-teal-500/40">
                <Play size={32} fill="currentColor" />
              </button>
              <p className="text-white font-bold text-lg">Watch Quick Start Guide (Coming Soon)</p>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-500/10 to-transparent" />
        </div>

        {/* Step-by-Step Guide */}
        <div className="grid lg:grid-cols-2 gap-12 mb-32">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="p-10 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-sm text-careermap-teal">
                <step.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-lg">
                {step.content}
              </p>
              <div className="space-y-3">
                {step.details.map((detail, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <CheckCircle size={16} className="text-teal-500" />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tips */}
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-[3rem] p-12 md:p-16 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-amber-400 shadow-sm">
              <Star size={24} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Pro Tips for Success</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl shadow-sm border border-white dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Check the Library Often</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Teachers frequently upload slides, old exams, and practical resources that are specific to your BiT courses.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl shadow-sm border border-white dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3">Engage with Feedback</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                If a teacher provides feedback on your progress, check your notifications. It's the best way to improve.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserGuidePage;
