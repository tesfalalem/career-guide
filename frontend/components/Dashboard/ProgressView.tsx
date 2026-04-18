
import React, { useEffect, useState } from 'react';
import { Activity, Target, Award, Shield, CheckCircle2, Star, BookOpen } from 'lucide-react';
import { getStudentStats, getUserCourses } from '../../services/courseService';
import { Course } from '../../types';

interface ProgressViewProps {
  userId: string;
}

const ProgressView: React.FC<ProgressViewProps> = ({ userId }) => {
  const [stats, setStats] = useState({ coursesEnrolled: 0, totalXP: 0, completedLessons: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, c] = await Promise.all([
           getStudentStats(userId),
           getUserCourses(userId)
        ]);
        setStats(s);
        setCourses(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  // Derived level from XP (1000 XP per level)
  const level = Math.floor(stats.totalXP / 1000) + 1;
  const xpForNextLevel = 1000 - (stats.totalXP % 1000);
  const progressPercent = ((stats.totalXP % 1000) / 1000) * 100;

  return (
    <div className="animate-reveal max-w-7xl mx-auto pb-20">
      <div className="mb-16">
        <h1 className="text-5xl font-extrabold text-primary dark:text-white tracking-tight mb-3">Performance Analytics</h1>
        <p className="text-slate-400 dark:text-slate-500 font-medium text-lg">Tracking your growth across {courses.length} active learning paths.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Skill Distribution (Mapped from Courses) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-[3rem] shadow-sm">
            <h3 className="text-2xl font-extrabold text-primary dark:text-white mb-12 flex items-center gap-4">
              <Activity className="text-careermap-teal" /> Active Focus Areas
            </h3>
            <div className="space-y-10">
              {courses.length > 0 ? courses.map((course, i) => (
                <div key={course.id}>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-lg font-bold text-primary dark:text-slate-200">{course.title}</span>
                    <span className="text-sm font-black text-careermap-teal uppercase tracking-[0.2em]">{course.level}</span>
                  </div>
                  <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-3">
                    <div className={`h-3 rounded-full bg-indigo-500 transition-all duration-1000 shadow-md`} style={{ width: `${course.progress || 0}%` }} /> 
                  </div>
                </div>
              )) : (
                <p className="text-slate-400">No active courses found. Start a roadmap to track skills.</p>
              )}
            </div>
          </div>

          {/* Achievement Grid - Still hardcoded for now as we don't have badges system yet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-[3rem] shadow-sm">
            <h3 className="text-2xl font-extrabold text-primary dark:text-white mb-12 flex items-center gap-4">
              <Award className="text-careermap-teal" /> Institutional Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: 'Student Hub Verified', org: 'BiT Admin', date: 'Active', status: 'Verified' },
                { title: 'Early Adopter', org: 'CareerGuide', date: '2024', status: 'Badge' },
              ].map((c, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl flex items-center gap-6 group hover:bg-careermap-navy hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-700 hover:border-careermap-navy">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-careermap-teal shadow-md shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-black group-hover:text-white mb-1 leading-tight">{c.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] group-hover:text-white/60">{c.org} • {c.date} • {c.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Points/Level System */}
          <div className="bg-careermap-navy dark:bg-slate-900 text-white p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group border border-transparent dark:border-slate-800">
            <div className="absolute inset-0 bg-careermap-teal/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
              <Star className="text-careermap-teal" size={48} fill="currentColor" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.5em] text-white/40 mb-3">Overall Technical Level</p>
            <h2 className="text-6xl font-black mb-6 tracking-tighter">Level {level}</h2>
            <p className="text-base font-medium text-white/60 mb-10">Total XP: {stats.totalXP}</p>
            <div className="w-full bg-white/5 rounded-full h-2.5 mb-3">
              <div className="bg-careermap-teal h-2.5 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)]" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{xpForNextLevel} XP remaining to Level {level + 1}</p>
          </div>

          {/* Goals Checklist - Mock for now but clearer */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-[3rem] shadow-sm">
            <h3 className="text-2xl font-extrabold text-primary dark:text-white mb-10 flex items-center gap-4">
              <Target className="text-careermap-teal" /> Weekly Sprint
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Complete 3 Lessons', done: stats.completedLessons > 0 },
                { label: 'Create a Course', done: courses.length > 0 },
                { label: 'Visit Dashboard', done: true },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-5 p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer">
                  <div className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 ${g.done ? 'bg-careermap-teal border-careermap-teal' : 'border-slate-200 dark:border-slate-700'}`}>
                    {g.done && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <span className={`text-base font-bold transition-all ${g.done ? 'text-slate-300 dark:text-slate-600 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
