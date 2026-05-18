
import React, { useEffect, useState } from 'react';
import { Activity, Target, Award, Shield, CheckCircle2, BookOpen } from 'lucide-react';
import { getStudentStats, getUserCourses } from '../../services/courseService';
import { Course } from '../../types';

interface ProgressViewProps {
  userId: string;
}

const ProgressView: React.FC<ProgressViewProps> = ({ userId }) => {
  const [stats, setStats] = useState({ coursesEnrolled: 0, completedLessons: 0 });
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


        </div>

        <div className="space-y-12">
          {/* Courses Summary */}
          <div className="bg-careermap-navy dark:bg-slate-900 text-white p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group border border-transparent dark:border-slate-800">
            <div className="absolute inset-0 bg-careermap-teal/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
              <BookOpen className="text-careermap-teal" size={48} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.5em] text-white/40 mb-3">Enrolled Courses</p>
            <h2 className="text-6xl font-black mb-6 tracking-tighter">{courses.length}</h2>
            <p className="text-base font-medium text-white/60">{stats.completedLessons} lessons completed</p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ProgressView;
