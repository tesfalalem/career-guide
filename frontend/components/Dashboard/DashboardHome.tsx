import React, { useState, useEffect } from 'react';
import {
  Zap, Flame, Trophy, BookOpen, Map as MapIcon,
  ClipboardCheck, ShieldCheck, ArrowRight, PlayCircle,
  CheckCircle, Star, TrendingUp, ChevronRight, Sparkles,
  Target, Award, Clock, GraduationCap, BarChart3, Layers
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { User, Course } from '../../types';
import { getStudentStats, getRecentActivity, getUserCourses } from '../../services/courseService';
import { DashboardHomeSkeleton } from '../common/Skeleton';

interface DashboardHomeProps {
  user: User;
  onNavigateToRoadmaps: () => void;
  onNavigateToAiGenerator: () => void;
  onNavigateToAssessments: () => void;
  onOpenCourse: (course: Course) => void;
  onNavigateToCareers?: () => void;
}

const XP_PER_LEVEL = 1000;

const getLevelInfo = (xp: number) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXP = xp % XP_PER_LEVEL;
  const nextLevelXP = XP_PER_LEVEL - currentLevelXP;
  const progress = (currentLevelXP / XP_PER_LEVEL) * 100;
  return { level, currentLevelXP, nextLevelXP, progress };
};

const getLeague = (level: number) => {
  if (level >= 10) return { name: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', gradient: 'from-cyan-500 to-blue-500' };
  if (level >= 7)  return { name: 'Gold',    color: 'text-yellow-500', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', gradient: 'from-yellow-500 to-amber-500' };
  if (level >= 4)  return { name: 'Silver',  color: 'text-slate-400',  bg: 'bg-slate-400/10', border: 'border-slate-400/20', gradient: 'from-slate-400 to-slate-500' };
  return                  { name: 'Bronze',  color: 'text-amber-600',  bg: 'bg-amber-600/10', border: 'border-amber-600/20', gradient: 'from-amber-500 to-orange-500' };
};

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
  const [stats, setStats] = useState({ coursesEnrolled: 0, totalXP: 0, completedLessons: 0 });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [s, c, a] = await Promise.all([
          getStudentStats(user.id),
          getUserCourses(user.id),
          getRecentActivity(user.id),
        ]);
        setStats(s);
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

  const xp = stats.totalXP || user.xp || 0;
  const streak = user.streak || 0;
  const { level, nextLevelXP, progress } = getLevelInfo(xp);
  const league = getLeague(level);
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
    <div className="space-y-8">

      {/* ── HERO WELCOME HEADER ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] gradient-careermap p-8 md:p-12 animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-careermap-teal/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-[15%] w-2 h-2 bg-white/20 rounded-full" />
          <div className="absolute top-[30%] right-[25%] w-1.5 h-1.5 bg-white/15 rounded-full" />
          <div className="absolute bottom-[35%] right-[10%] w-1 h-1 bg-white/25 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Greeting */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden shadow-lg">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-careermap-navy rounded-full" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{greetingTime()}</p>
              <h1 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight leading-tight">
                Welcome, {firstName}
              </h1>
            </div>
          </div>

          {/* Right: Streak + League */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl">
              <Flame size={18} className="text-orange-400 fill-orange-400" />
              <span className="font-bold text-white text-sm">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl">
              <Trophy size={16} className="text-teal-300" />
              <span className="font-bold text-white text-sm">{league.name}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Section */}
        <div className="relative z-10 mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Level {level}</span>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{xp} XP total</span>
                </div>
                <h2 className="text-3xl font-serif font-black text-white leading-none">{xp} <span className="text-white/40 text-sm font-bold uppercase tracking-widest">XP</span></h2>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="flex gap-6">
              {[
                { value: stats.coursesEnrolled, label: 'Courses' },
                { value: stats.completedLessons, label: 'Lessons' },
                { value: streak, label: 'Streak' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* XP Bar */}
          <div className="w-full bg-black/20 rounded-full h-3">
            <div
              className="bg-careermap-teal rounded-full h-3 transition-all duration-1000 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-3">{nextLevelXP} XP to Level {level + 1}</p>
        </div>
      </div>

      {/* ── AI SETUP / FIRST RECOMMENDATION ────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Decorative AI Background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
           <Sparkles size={400} className="absolute -right-20 -top-20 text-careermap-teal" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800">
               <Sparkles size={14} className="text-teal-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                 AI Setup / First Recommendation
               </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-careermap-navy dark:text-white mb-6 leading-tight">
              “Explore existing roadmaps or generate your own”
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Start by browsing our curated collection of technical paths, or use our AI to build a step-by-step roadmap tailored specifically for your BiT department.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
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
          
          <div className="hidden xl:flex w-72 flex-col gap-4">
             <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold mb-4">
                   <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                      <Target size={18} />
                   </div>
                   <span className="text-sm">Skill Matching</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div className="w-[85%] h-full bg-teal-500 rounded-full" />
                </div>
             </div>
             <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm ml-8">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold mb-4">
                   <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Zap size={18} />
                   </div>
                   <span className="text-sm">Accelerated</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div className="w-[95%] h-full bg-orange-500 rounded-full" />
                </div>
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

      {/* ── ACTIVITY + SUGGESTIONS ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <BarChart3 size={18} className="text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white">Recent Activity</h3>
            </div>
            <button className="text-[10px] uppercase tracking-widest text-careermap-teal font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all">
              View all <ArrowRight size={12} />
            </button>
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
                  {item.xp && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full flex-shrink-0">
                      +{item.xp} XP
                    </span>
                  )}
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

        {/* AI Suggested Roadmaps */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-careermap-navy/5 dark:bg-careermap-navy/20 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-careermap-navy dark:text-careermap-teal" />
              </div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-extrabold text-slate-900 dark:text-white">Suggested for You</h3>
                <span className="flex items-center gap-1 text-[9px] font-black text-careermap-teal bg-careermap-teal/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  <Sparkles size={8} /> AI
                </span>
              </div>
            </div>
            <button
              onClick={onNavigateToRoadmaps}
              className="text-[10px] uppercase tracking-widest text-careermap-teal font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              See all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {suggestedRoadmaps.map((r) => (
              <div
                key={r.title}
                onClick={onNavigateToRoadmaps}
                className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${r.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{r.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{r.level} · {r.weeks} weeks</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-careermap-teal group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;
