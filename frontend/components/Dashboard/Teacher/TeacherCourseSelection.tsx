import React, { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, Clock, Loader2,
  GraduationCap, ArrowRight, Users, Info
} from 'lucide-react';

const API = 'http://localhost/backup/careerguide/backend/api';
const token = () => localStorage.getItem('auth_token') || '';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  modules: any[];
  teachers?: string;
  creator_name?: string;
}

interface TeacherCourseSelectionProps {
  teacherName: string;
  onSelected: () => void;
}

const TeacherCourseSelection: React.FC<TeacherCourseSelectionProps> = ({ teacherName, onSelected }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch only BiT-created courses (not AI-generated)
    fetch(`${API}/course-assignments/available-bit`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(d => setCourses(Array.isArray(d) ? d : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleCourse = (id: number) => {
    setError(null);
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        // Deselect
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        setError('You can select at most 3 courses.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least 1 course.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/course-assignments/request-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ course_ids: selectedIds })
      });
      const data = await res.json();
      if (res.ok) {
        onSelected();
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const levelCls = (l: string) =>
    l === 'Advanced'     ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
    l === 'Intermediate' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' :
                           'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';

  const isSelected = (id: number) => selectedIds.includes(id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-careermap-navy rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-navy-500/20">
            <GraduationCap className="text-careermap-teal" size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-careermap-navy dark:text-white mb-4 tracking-tight">
            Welcome, {teacherName}
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Select the courses you want to teach. Your request will be reviewed by an admin.
          </p>

          {/* Selection counter */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-careermap-teal/10 border border-careermap-teal/20 rounded-full">
            <Info size={14} className="text-careermap-teal" />
            <span className="text-sm font-bold text-careermap-teal">
              {selectedIds.length === 0
                ? 'Select 1 to 3 courses'
                : `${selectedIds.length} of 3 selected`}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-careermap-teal" size={48} />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-semibold text-lg">No BiT courses available yet.</p>
            <p className="text-slate-400 text-sm mt-1">
              BiT admin hasn't created any official courses. Check back later.
            </p>
            <button
              onClick={onSelected}
              className="mt-6 px-8 py-3 bg-careermap-navy text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Course grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {courses.map(course => {
                const selected = isSelected(course.id);
                const disabled = !selected && selectedIds.length >= 3;
                return (
                  <button
                    key={course.id}
                    onClick={() => !disabled && toggleCourse(course.id)}
                    disabled={disabled}
                    className={`group text-left p-7 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden ${
                      selected
                        ? 'border-careermap-teal bg-careermap-teal/5 shadow-xl shadow-teal-500/10'
                        : disabled
                        ? 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-40 cursor-not-allowed'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-careermap-teal/40 hover:shadow-lg'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${levelCls(course.level)}`}>
                        {course.level}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected
                          ? 'border-careermap-teal bg-careermap-teal'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {selected && <CheckCircle size={14} className="text-white" />}
                      </div>
                    </div>

                    <h3 className={`font-serif font-black text-xl mb-2 transition-colors leading-tight ${
                      selected
                        ? 'text-careermap-navy dark:text-careermap-teal'
                        : 'text-careermap-navy dark:text-white'
                    }`}>
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 mb-5 leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md">
                        <Clock size={11} className="text-careermap-teal" />
                        {course.duration || 'Flexible'}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md">
                        <BookOpen size={11} className="text-careermap-teal" />
                        {course.modules?.length || 0} Modules
                      </span>
                      {course.category && (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md">
                          {course.category}
                        </span>
                      )}
                    </div>

                    {course.teachers && (
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2">
                        <Users size={11} className="text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Faculty: <span className="text-careermap-navy dark:text-slate-300">{course.teachers}</span>
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected summary */}
            {selectedIds.length > 0 && (
              <div className="mb-6 p-4 bg-careermap-teal/5 border border-careermap-teal/20 rounded-2xl">
                <p className="text-sm font-bold text-careermap-teal mb-2">
                  Selected courses ({selectedIds.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedIds.map(id => {
                    const c = courses.find(x => x.id === id);
                    return c ? (
                      <span key={id} className="px-3 py-1 bg-careermap-teal text-white rounded-full text-xs font-bold">
                        {c.title}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || submitting}
              className="w-full py-5 bg-careermap-teal text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4 shadow-2xl shadow-teal-500/20"
            >
              {submitting
                ? <><Loader2 size={22} className="animate-spin" /> Submitting...</>
                : <><ArrowRight size={22} /> Continue</>}
            </button>

            <p className="text-center text-slate-400 text-xs mt-3">
              Select 1–3 courses · Your request will be reviewed by an admin
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseSelection;
