import React, { useState, useEffect } from 'react';
import { BookOpen, Users, TrendingUp, GraduationCap, Loader2, Map } from 'lucide-react';
import { bitService } from '../../../services/bitService';

interface Analytics {
  total_roadmaps: number;
  published_roadmaps: number;
  draft_roadmaps: number;
  total_courses: number;
  total_enrollments: number;
  total_students: number;
  popular_roadmaps: any[];
  recent_courses: any[];
}

interface BiTOverviewProps {
  onNavigate: (tab: string) => void;
}

const BiTOverview: React.FC<BiTOverviewProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bitService.getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="animate-spin text-careermap-teal" size={48} />
    </div>
  );

  const stats = [
    { label: 'Total Roadmaps', value: analytics?.total_roadmaps ?? 0, icon: Map, color: 'bg-careermap-navy', onClick: () => onNavigate('roadmaps') },
    { label: 'Published', value: analytics?.published_roadmaps ?? 0, icon: TrendingUp, color: 'bg-emerald-500', onClick: () => onNavigate('roadmaps') },
    { label: 'Official Courses', value: analytics?.total_courses ?? 0, icon: BookOpen, color: 'bg-careermap-teal', onClick: () => onNavigate('courses') },
    { label: 'Students', value: analytics?.total_students ?? 0, icon: Users, color: 'bg-cyan-600', onClick: () => onNavigate('roadmaps') },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero - Now with high-end Navy layout */}
      <div className="relative overflow-hidden bg-careermap-navy rounded-[3rem] p-12 text-white shadow-2xl border border-white/5">
        <div className="absolute -right-20 -top-20 p-4 opacity-5 pointer-events-none">
           <GraduationCap size={440} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-careermap-teal rounded-2xl flex items-center justify-center shadow-2xl shadow-careermap-teal/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <GraduationCap size={36} className="text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-serif font-black tracking-tight leading-none">Institute Hub</h2>
                <div className="text-[10px] text-careermap-teal font-black uppercase tracking-[0.3em] mt-2 opacity-80">Autonomous Academic Ecosystem</div>
              </div>
            </div>
            <p className="text-slate-300 text-xl leading-relaxed font-serif italic mb-2">
              Governing standardized curriculum for the Bahir Dar Institute of Technology.
            </p>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-widest opacity-60">System synchronization: LATENCY 14MS • PROTOCOL: SECURE</p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-4">
             <button onClick={() => onNavigate('roadmaps')} className="px-10 py-5 bg-careermap-teal text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-careermap-teal/30">
               Manage Tracks
             </button>
             <button onClick={() => onNavigate('courses')} className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-md">
               Browse Catalog
             </button>
          </div>
        </div>
      </div>

      {/* Stats - Standardized Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <button
            key={s.label}
            onClick={s.onClick}
            className="group relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 text-left hover:border-careermap-teal hover:shadow-[0_40px_80px_-15px_rgba(20,184,166,0.1)] transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
          >
            <div className="absolute -right-4 -top-4 opacity-0 group-hover:opacity-5 transition-opacity duration-700">
              <s.icon size={120} />
            </div>
            <div className={`w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-careermap-teal group-hover:text-white group-hover:rotate-12 transition-all duration-700`}>
              <s.icon size={28} />
            </div>
            <div className="text-5xl font-serif font-black text-careermap-navy dark:text-white mb-2 tracking-tighter">{s.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Roadmaps - Editorial Style */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
             <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white flex items-center gap-4">
               <div className="w-1.5 h-6 bg-careermap-teal rounded-full" /> High-Engagement Tracks
             </h3>
             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
               <TrendingUp size={20} className="text-emerald-500" />
             </div>
          </div>
          
          {analytics?.popular_roadmaps?.length ? (
            <div className="space-y-4">
              {analytics.popular_roadmaps.map((r: any, i: number) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-careermap-navy/5 text-careermap-navy dark:text-careermap-teal rounded-xl flex items-center justify-center font-serif font-bold">{i + 1}</div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-careermap-teal transition-colors">{r.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{r.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-careermap-teal bg-careermap-teal/10 px-3 py-1.5 rounded-full">
                      {r.enrollments || 0} Students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 opacity-30">
               <Map size={48} className="mx-auto mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest">No Active Tracks</p>
            </div>
          )}
        </div>

        {/* Recent Courses - Editorial Style */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm">
           <div className="flex items-center justify-between mb-12">
             <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white flex items-center gap-4">
               <div className="w-1.5 h-6 bg-careermap-teal rounded-full" /> Recent Additions
             </h3>
             <div className="w-4 h-4 rounded-full bg-careermap-teal/20 flex items-center justify-center">
               <div className="w-2 h-2 rounded-full bg-careermap-teal animate-ping" />
             </div>
          </div>

          {analytics?.recent_courses?.length ? (
            <div className="space-y-4">
              {analytics.recent_courses.map((c: any, i: number) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                       <BookOpen size={18} className="text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-careermap-teal transition-colors">{c.title}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-1">Author: {c.creator_name}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                    c.level === 'Beginner' ? 'bg-careermap-teal/10 text-careermap-teal' : 
                    c.level === 'Intermediate' ? 'bg-careermap-navy/10 text-careermap-navy' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {c.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 opacity-30">
               <BookOpen size={48} className="mx-auto mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest">Catalog Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiTOverview;
