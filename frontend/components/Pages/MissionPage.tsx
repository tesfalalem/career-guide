import React from 'react';
import { Target, Heart, Rocket, Users, Award, Zap, GraduationCap } from 'lucide-react';

const MissionPage: React.FC = () => {
  return (
    <div className="pt-32 pb-20 bg-white dark:bg-slate-950">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="max-w-3xl mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800">
            <Target size={14} className="text-teal-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-400">
              Our Purpose
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8">
            Empowering the next generation of <span className="text-careermap-teal">tech leaders.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            CareerGuide was born out of a simple observation: BiT students have the talent, but often lack the roadmap to global opportunities. We're here to bridge that gap using cutting-edge AI.
          </p>
        </div>

        {/* Mission Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: Rocket,
              title: "Accelerated Growth",
              desc: "We use AI to identify skill gaps and provide personalized learning paths that fast-track career entry.",
              color: "blue"
            },
            {
              icon: Heart,
              title: "Student-First",
              desc: "Every feature we build is designed to reduce the friction between learning and getting hired.",
              color: "rose"
            },
            {
              icon: Zap,
              title: "AI Precision",
              desc: "Moving beyond generic advice. Our system analyzes real-time market trends to keep your roadmap relevant.",
              color: "amber"
            }
          ].map((item, i) => (
            <div 
              key={i}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-teal-500/30 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} className="text-careermap-teal" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Vision Statement */}
        <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-24 bg-careermap-navy text-center animate-fade-in-up">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10">
            Our Vision
          </h2>
          <p className="text-xl md:text-2xl text-teal-100/80 max-w-4xl mx-auto leading-relaxed font-medium relative z-10">
            "To become the definitive intelligence layer for technical education in Ethiopia, where every BiT student has a clear, data-backed path from their first day of class to their dream global career."
          </p>
        </div>

        {/* Team/Values */}
        <div className="mt-32 grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">Guided by Core Values</h2>
            <div className="space-y-8">
              {[
                { title: "Accessibility", text: "Quality career guidance should never be behind a paywall for students.", icon: Users },
                { title: "Excellence", text: "We strive for world-class technical accuracy in our AI-generated roadmaps.", icon: Award },
              ].map((val, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                    <val.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{val.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{val.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-teal-400 to-blue-600 overflow-hidden shadow-2xl">
               {/* Replace with actual image later if available */}
               <div className="w-full h-full flex items-center justify-center text-white/20">
                  <GraduationCap size={200} />
               </div>
            </div>
            <div className="absolute -bottom-10 -left-10 p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 max-w-xs">
              <p className="text-2xl font-black text-careermap-teal mb-1">100%</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">BiT Focused</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MissionPage;
