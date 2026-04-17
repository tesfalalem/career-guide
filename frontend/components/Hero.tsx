import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

const CAREERS = ['Software Engineer', 'Data Scientist', 'Full-Stack Developer', 'DevOps Engineer', 'Cybersecurity Analyst'];

interface HeroProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'onboarding' | 'dashboard') => void;
}

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [careerIdx, setCareerIdx] = useState(0);
  const [visible, setVisible]     = useState(false);
  const [fade, setFade]           = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Typing cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCareerIdx(i => (i + 1) % CAREERS.length);
        setFade(true);
      }, 400);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  // Trigger count-up & entrance on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const students  = useCountUp(2000, 1600, visible);
  const roadmaps  = useCountUp(50,   1400, visible);
  const successRate = useCountUp(98, 1200, visible);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center pt-28 pb-20 overflow-hidden bg-white dark:bg-slate-950"
    >
      {/* ── Floating background blobs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-teal-100/50 dark:bg-teal-900/20 rounded-full blur-[90px] animate-float-slow" />
        <div className="absolute bottom-0 -left-20 w-[380px] h-[380px] bg-cyan-100/40 dark:bg-cyan-900/15 rounded-full blur-[80px] animate-float" style={{ animationDelay: '1.5s' }} />
        {/* Decorative dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400/20 dark:bg-teal-400/10"
            style={{
              width: `${8 + i * 4}px`,
              height: `${8 + i * 4}px`,
              top: `${15 + i * 12}%`,
              right: `${5 + i * 5}%`,
              animation: `dotPulse ${2 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* ── Left: Messaging ── */}
          <div className="lg:col-span-7">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 animate-fade-in-up"
            >
              <Sparkles size={13} className="text-teal-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">
                Built for BiT Students
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-5 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              From student<br />
              to <span className="text-careermap-teal">professional.</span>
            </h1>

            {/* Typing career */}
            <div
              className="flex items-center gap-3 mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-slate-400 dark:text-slate-500 text-lg font-medium">Your goal:</span>
              <span
                className="text-lg md:text-xl font-bold text-careermap-teal dark:text-teal-400 cursor-blink transition-all duration-400"
                style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}
              >
                {CAREERS[careerIdx]}
              </span>
            </div>

            {/* Sub-heading */}
            <p
              className="max-w-xl text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium mb-10 animate-fade-in-up leading-relaxed"
              style={{ animationDelay: '0.25s' }}
            >
              CareerGuide helps BiT students discover tech careers, follow AI-generated learning roadmaps,
              enroll in curated courses, and get mentored by verified teachers — all in one platform.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <button
                className="group flex items-center gap-2 bg-careermap-navy hover:bg-[#023058] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                onClick={() => onNavigate('signup')}
              >
                Build My Roadmap
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* ── Stat counters ── */}
            <div className="flex flex-wrap gap-10 mt-14 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              {[
                { value: students,    suffix: '+', label: 'BiT Students'        },
                { value: roadmaps,    suffix: '+', label: 'Career Roadmaps'     },
                { value: successRate, suffix: '%', label: 'Course Completion'   },
              ].map(({ value, suffix, label }) => (
                <div key={label}>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {value.toLocaleString()}{suffix}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Path Visualization ── */}
          <div className="lg:col-span-5 hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative py-8 pl-4">
              {/* Animated connecting line */}
              <div className="absolute left-[35px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-slate-100 via-teal-200 to-slate-100 dark:from-slate-800 dark:via-teal-700/40 dark:to-slate-800" />

              <div className="space-y-10">
                {[
                  { num: '01', title: 'Map your path',    sub: 'Identify your ideal tech career.', active: false },
                  { num: '02', title: 'Master the skills', sub: 'Follow a verified BiT curriculum.', active: false },
                  { num: '03', title: 'Get hired',        sub: 'Connect with global tech partners.', active: true  },
                ].map(({ num, title, sub, active }, i) => (
                  <div
                    key={num}
                    className="flex items-start gap-6 relative group animate-fade-in-up"
                    style={{ animationDelay: `${0.5 + i * 0.15}s` }}
                  >
                    <div className={`w-[46px] h-[46px] shrink-0 rounded-full flex items-center justify-center z-10 transition-all
                      ${active
                        ? 'bg-careermap-navy shadow-lg shadow-teal-500/30'
                        : 'bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 group-hover:border-teal-400'
                      }`}
                    >
                      {active
                        ? <Check className="text-white" size={18} strokeWidth={3} />
                        : <span className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-400 group-hover:text-teal-500'}`}>{num}</span>
                      }
                    </div>
                    <div className="pt-2">
                      <h4 className={`text-lg font-bold mb-1 ${active ? 'text-careermap-teal dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>
                        {title}
                      </h4>
                      <p className="text-sm text-slate-400 font-medium">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative card behind steps */}
              <div className="absolute inset-0 -z-10 bg-slate-50/60 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 animate-float" style={{ animationDelay: '0.8s' }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
