import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Loader2, GraduationCap, ArrowRight } from 'lucide-react';

const API = 'http://localhost:8000/api';
const token = () => localStorage.getItem('auth_token') || '';

interface Course {
  id: number; title: string; description: string;
  category: string; level: string; duration: string;
  modules: any[]; teachers?: string;
}

interface TeacherCourseSelectionProps {
  teacherName: string;
  onSelected: () => void;
}

const TeacherCourseSelection: React.FC<TeacherCourseSelectionProps> = ({ teacherName, onSelected }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/course-assignments/available`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => setCourses(Array.isArray(d) ? d : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/course-assignments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ course_id: selectedId })
      });
      if (res.ok) onSelected();
      else alert('Failed to submit request. Please try again.');
    } catch { alert('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const levelCls = (l: string) =>
    l === 'Advanced' ? 'bg-purple-100 text-purple-700' :
    l === 'Intermediate' ? 'bg-orange-100 text-orange-700' :
    'bg-green-100 text-green-700';



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-careermap-navy rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-navy-500/20">
            <GraduationCap className="text-careermap-teal" size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-careermap-navy dark:text-white mb-4 tracking-tight">Welcome, {teacherName}</h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">Commence your leadership journey. Select your primary curriculum sector for administrative validation.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-careermap-teal" size={48} /></div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-semibold">No courses available yet.</p>
            <p className="text-slate-400 text-sm mt-1">BiT admin hasn't created any courses. Check back later.</p>
            <button onClick={onSelected} className="mt-6 px-8 py-3 bg-careermap-navy text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition-all">
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {courses.map(course => (
                <button key={course.id} onClick={() => setSelectedId(course.id)}
                  className={`group text-left p-8 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden ${selectedId === course.id ? 'border-careermap-teal bg-careermap-teal/5 shadow-2xl shadow-teal-500/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-careermap-teal/30 hover:shadow-xl'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${levelCls(course.level).replace('100', '50').replace('700', '600')}`}>{course.level}</span>
                    {selectedId === course.id && <CheckCircle size={24} className="text-careermap-teal animate-fade-in-up" />}
                  </div>
                  <h3 className={`font-serif font-black text-xl mb-2 transition-colors ${selectedId === course.id ? 'text-careermap-navy dark:text-careermap-teal' : 'text-careermap-navy dark:text-white group-hover:text-careermap-navy dark:group-hover:text-careermap-teal'}`}>{course.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">{course.description}</p>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md"><Clock size={12} className="text-careermap-teal" /> {course.duration || 'Flexible'}</span>
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md"><BookOpen size={12} className="text-careermap-teal" /> {course.modules?.length || 0} SECTORS</span>
                  </div>
                  {course.teachers && (
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Faculty: <span className="text-careermap-navy dark:text-slate-300">{course.teachers}</span></p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={!selectedId || submitting}
              className="w-full py-6 bg-careermap-teal text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-teal-500/20">
              {submitting ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
              {submitting ? 'Synchronizing Directives...' : 'Submit Curriculum Commission'}
            </button>
            <p className="text-center text-slate-400 text-sm mt-3">You can only teach one course at a time</p>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseSelection;
