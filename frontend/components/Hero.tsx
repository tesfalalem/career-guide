import React, { useState, useEffect, useRef } from 'react';

const CAREERS = ['Software Engineer', 'Data Scientist', 'Full-Stack Developer', 'DevOps Engineer', 'Cybersecurity Analyst'];

const Hero: React.FC = () => {
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

  // Trigger entrance on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[95vh] flex items-center justify-center pt-32 pb-24 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500"
    >
      {/* ── Background Elements ── */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.png" 
          alt="Tech Background" 
          className="w-full h-full object-cover opacity-10 dark:opacity-20 scale-105 animate-float-slow grayscale"
          style={{ filter: 'brightness(1.1) contrast(0.9)' }}
        />
        {/* Light Theme Blobs (Matches Screenshot) */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-50/60 dark:bg-teal-900/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-50/50 dark:bg-cyan-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Subtle Overlays */}
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* ── Premium Content Container ── */}
          <div className="glass-light dark:glass p-8 md:p-12 lg:p-16 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl shadow-teal-500/5 backdrop-blur-md max-w-5xl animate-fade-in-up">
            
            {/* Headline */}
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-8 font-serif"
              style={{ animationDelay: '0.1s' }}
            >
              From student<br />
              to <span className="text-careermap-teal drop-shadow-[0_0_15px_rgba(20,184,166,0.2)]">professional.</span>
            </h1>

            {/* Typing career */}
            <div
              className="flex items-center justify-center gap-4 mb-10"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="h-[1px] w-12 bg-slate-300 dark:bg-teal-500/50 hidden md:block" />
              <span className="text-slate-500 dark:text-slate-300 text-xl md:text-2xl font-light tracking-wide italic">Your goal:</span>
              <span
                className="text-xl md:text-3xl font-bold text-careermap-teal cursor-blink transition-all duration-400"
                style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}
              >
                {CAREERS[careerIdx]}
              </span>
              <div className="h-[1px] w-12 bg-slate-300 dark:bg-teal-500/50 hidden md:block" />
            </div>

            {/* Sub-heading */}
            <p
              className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-lg md:text-2xl font-medium leading-relaxed mb-4"
              style={{ animationDelay: '0.3s' }}
            >
              CareerGuide helps BiT students discover tech careers, follow AI-generated learning roadmaps,
              enroll in curated courses, and get mentored by verified teachers — all in one platform.
            </p>

            {/* Subtle glow separator */}
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent mx-auto mt-12 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.2)]" />
          </div>

        </div>
      </div>

      {/* Scroll indicator decorative dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 h-1.5 rounded-full bg-teal-500/20"
            style={{ animation: 'pulse 2s infinite', animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
