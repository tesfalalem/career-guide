import React, { useEffect, useRef, useState } from 'react';
import { 
  Zap, Layers, Target, Globe, Activity, Shield, Brain, Users
} from 'lucide-react';

const featureList = [
  {
    title: 'AI Career Quiz',
    desc:  'Answer a guided set of questions and our Gemini-powered AI recommends the best tech career path for you.',
    icon:  Brain,
    color: 'text-violet-500',
    bg:    'bg-violet-50 dark:bg-violet-500/10',
  },
  {
    title: 'Personalized Roadmaps',
    desc:  'Get a step-by-step AI-generated learning roadmap tailored to your chosen career — saved and accessible anytime.',
    icon:  Layers,
    color: 'text-indigo-500',
    bg:    'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    title: 'Curated Courses',
    desc:  'Enroll in BiT-curated and AI-generated courses with structured modules, lessons, and knowledge checks.',
    icon:  Globe,
    color: 'text-blue-500',
    bg:    'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    title: 'Teacher Resources',
    desc:  'Access articles, videos, and tutorials uploaded by verified BiT teachers — matched to your roadmap topics.',
    icon:  Shield,
    color: 'text-emerald-500',
    bg:    'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    title: 'Progress Tracking',
    desc:  'Visual dashboards track your course completion, XP points, and learning streak — keeping you accountable.',
    icon:  Activity,
    color: 'text-rose-500',
    bg:    'bg-rose-50 dark:bg-rose-500/10',
  },
  {
    title: 'Teacher Mentorship',
    desc:  'Receive direct feedback from your assigned teacher, rate resources, and get notified on your progress.',
    icon:  Users,
    color: 'text-amber-500',
    bg:    'bg-amber-50 dark:bg-amber-500/10',
  },
];

const Features: React.FC = () => {
  const [active, setActive] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="roadmaps" ref={sectionRef} className="py-24 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-[11px] uppercase tracking-widest mb-5 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800">
            <Target size={13} /> What We Offer
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-5">
            Everything you need to{' '}
            <span className="text-careermap-teal">launch your career.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            From discovering your ideal tech role to completing courses and getting mentored — CareerGuide covers every step of your journey at BiT.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((f, i) => (
            <div
              key={i}
              className={`premium-card p-8 group transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon size={26} />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                {f.desc}
              </p>

              {/* Animated bottom accent line on hover */}
              <div className="mt-6 h-[2px] w-0 group-hover:w-full bg-teal-500/40 dark:bg-teal-400/40 rounded-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
