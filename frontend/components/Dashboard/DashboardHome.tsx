import React, { useState, useEffect } from 'react';
import {
  Zap, Trophy, BookOpen, Map as MapIcon,
  ClipboardCheck, ShieldCheck, ArrowRight, PlayCircle,
  CheckCircle, TrendingUp, ChevronRight, Sparkles,
  Target, Award, Clock, GraduationCap, BarChart3, Layers
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { User, Course } from '../../types';
import { getRecentActivity, getUserCourses } from '../../services/courseService';
import { DashboardHomeSkeleton } from '../common/Skeleton';

interface DashboardHomeProps {
  user: User;
  onNavigateToRoadmaps: () => void;
  onNavigateToAiGenerator: () => void;
  onNavigateToAssessments: () => void;
  onOpenCourse: (course: Course) => void;
  onNavigateToCareers?: () => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'lesson':     return <BookOpen size={16} className="text-careermap-teal" />;
    case 'assessment': return <ClipboardCheck size={16} className="text-green-500" />;
    case 'badge':      return <Award size={16} className="text-yellow-500" />;
    case 'roadmap':    return <MapIcon size={16} className="text-careermap-teal" />;
    default:           return <CheckCircle size={16} className="text-slate-400" />;
  }
};

const suggestedRoadmaps = [
  { title: 'Full Stack Developer', icon: '🌐', level: 'Intermediate', weeks: 16, color: 'from-careermap-navy/10 to-careermap-teal/10' },
  { title: 'Data Scientist',       icon: '📊', level: 'Advanced',     weeks: 20, color: 'from-emerald-500/10 to-cyan-500/10' },
  { title: 'Mobile Developer',     icon: '📱', level: 'Beginner',     weeks: 12, color: 'from-careermap-navy/10 to-careermap-teal/10' },
  { title: 'Cloud Engineer',       icon: '☁️', level: 'Intermediate', weeks: 14, color: 'from-amber-500/10 to-orange-500/10' },
];

const DashboardHome: React.FC<DashboardHomeProps> = ({
  user,
  onNavigateToRoadmaps,
  onNavigateToAiGenerator,
  onNavigateToAssessments,
  onOpenCourse,
  onNavigateToCareers,
}) => {
  const [loading, setLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [c, a] = await Promise.all([
          getUserCourses(user.id),
          getRecentActivity(user.id),
        ]);
        setRecentCourses(c || []);
        setActivityFeed(a || []);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const firstName = user.name?.split(' ')[0] ?? user.name;
  const activeCourse = recentCourses[0];
  const activeCourseProgress = activeCourse?.progress || 0;

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <DashboardHomeSkeleton />;

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* ── Page Background Image ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden">
        <img 
          src="/dashboard-bg.png" 
          alt="" 
          className="w-full h-full object-cover scale-110 blur-3xl"
        />
      </div>

      {/* ── BRAND-CONSISTENT HERO WELCOME ────────────────────── */}
      <div className="relative overflow-hidden rounded-[3rem] bg-careermap-navy border border-white/10 p-8 md:p-12 shadow-2xl group transition-all duration-500 hover:shadow-careermap-teal/10 z-10">
        {/* Animated Background Gradients & Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src="/dashboard-bg.png" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-careermap-navy via-careermap-navy/80 to-transparent" />
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-careermap-teal/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-careermap-teal/5 rounded-full blur-[100px]" />
        </div>
 
        <div className="relative z-10 flex flex-col items-center text-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tighter leading-none mb-4">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">{firstName}</span>
            </h1>
            <p className="text-white/40 font-medium text-lg italic">Ready to master your path today?</p>
          </div>
        </div>
      </div>


      {/* ── AI SETUP / FIRST RECOMMENDATION ────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Decorative AI Background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
           <Sparkles size={400} className="absolute -right-20 -top-20 text-careermap-teal" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-serif font-black text-careermap-navy dark:text-white mb-6 leading-tight">
              “Explore existing roadmaps or generate your own”
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
              Start by browsing our curated collection of technical paths, or use our AI to build a step-by-step roadmap tailored specifically for your BiT department.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button 
                onClick={onNavigateToRoadmaps}
                className="w-full sm:w-auto px-10 py-5 bg-careermap-navy hover:bg-[#023058] text-white rounded-2xl font-black text-lg shadow-2xl shadow-careermap-navy/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <MapIcon size={20} className="text-teal-400" />
                Explore Existing
              </button>
              <button 
                onClick={onNavigateToAiGenerator}
                className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-careermap-navy dark:text-white border-2 border-teal-500/30 hover:border-teal-500 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Zap size={20} className="text-teal-500" />
                Generate Roadmap
              </button>
            </div>
          </div>
          
        </div>
      </div>



      {/* ── QUICK ACTIONS ──────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-careermap-navy/5 dark:bg-careermap-navy/20 rounded-lg flex items-center justify-center">
            <Layers size={16} className="text-careermap-navy dark:text-careermap-teal" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Roadmap Library',  desc: 'Curated paths', icon: BookOpen,      color: 'text-careermap-navy dark:text-careermap-teal',  bg: 'bg-careermap-navy/5 dark:bg-careermap-navy/20',  hoverBorder: 'hover:border-careermap-teal dark:hover:border-careermap-teal', action: onNavigateToRoadmaps },
            { label: 'Generate Roadmap',  desc: 'AI-powered plan', icon: MapIcon,       color: 'text-careermap-teal dark:text-careermap-teal', bg: 'bg-careermap-teal/10 dark:bg-careermap-teal/20', hoverBorder: 'hover:border-careermap-teal dark:hover:border-careermap-teal', action: onNavigateToAiGenerator },
            { label: 'Browse Careers',    desc: 'Explore paths', icon: GraduationCap,   color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-900/20', hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700', action: onNavigateToCareers ?? onNavigateToRoadmaps },
            { label: 'Take Assessment',   desc: 'Test your skills', icon: ClipboardCheck,color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',  hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700', action: onNavigateToAssessments },
          ].map(({ label, desc, icon: Icon, color, bg, hoverBorder, action }) => (
            <button
              key={label}
              onClick={action}
              className={`bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 ${hoverBorder} rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-center`}
            >
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className={color} />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block leading-tight">{label}</span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">{desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── ACTIVITY ─────────────────────────────── */}
      <div className="grid gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <BarChart3 size={18} className="text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white">Recent Activity</h3>
            </div>

          </div>
          <div className="space-y-2">
            {activityFeed.length > 0 ? (
              activityFeed.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      {item.date ? formatDistanceToNow(new Date(item.date), { addSuffix: true }) : 'Recently'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock size={24} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No activity yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Complete lessons to see your progress here</p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default DashboardHome;
