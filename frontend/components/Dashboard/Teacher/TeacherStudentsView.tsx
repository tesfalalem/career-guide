import React, { useState, useEffect } from 'react';
import {
  Users, Search, BookOpen, ChevronDown, ChevronRight,
  GraduationCap, Mail, TrendingUp, CheckCircle, Clock,
  Loader2, RefreshCw, AlertCircle, BarChart2
} from 'lucide-react';

const API = 'http://localhost/careerguide/backend/api';
const token = () => localStorage.getItem('auth_token') || '';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CourseStudent {
  student_id: number;
  student_name: string;
  student_email: string;
  academic_year: string;
  department: string;
  progress: number;
  completed_lesson_count: number;
  enrolled_at: string;
}

interface CourseGroup {
  course_id: number;
  course_title: string;
  level: string;
  description: string;
  student_count: number;
  students: CourseStudent[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const levelCls = (level: string) =>
  level === 'Advanced'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    : level === 'Intermediate'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';

const progressColor = (p: number) =>
  p >= 75 ? 'bg-emerald-500' : p >= 40 ? 'bg-amber-500' : 'bg-red-400';

const fmtDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Main Component ────────────────────────────────────────────────────────────
const TeacherStudentsView: React.FC = () => {
  const [courses, setCourses] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/teacher/course-students`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      const list: CourseGroup[] = data.courses || [];
      setCourses(list);
      // Auto-expand all courses that have students
      setExpandedCourses(new Set(list.filter(c => c.student_count > 0).map(c => c.course_id)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (id: number) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Filter students across all courses by search term
  const filteredCourses = courses.map(c => ({
    ...c,
    students: c.students.filter(
      s =>
        s.student_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_email.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(c => search === '' || c.students.length > 0);

  const totalStudents = courses.reduce((acc, c) => acc + c.student_count, 0);
  const totalCourses = courses.length;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-careermap-teal" size={48} />
        <p className="text-slate-500 font-medium">Loading your course students…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="text-red-400" size={48} />
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 bg-careermap-navy text-white rounded-xl font-bold text-sm hover:bg-[#023058] transition-all"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Users size={26} className="text-careermap-teal" />
            My Course Students
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Students enrolled in your assigned courses
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 bg-careermap-navy text-white rounded-xl font-bold text-sm hover:bg-[#023058] transition-all self-start"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-careermap-teal/10 rounded-xl flex items-center justify-center">
            <BookOpen size={22} className="text-careermap-teal" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalCourses}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Courses</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-careermap-navy/10 rounded-xl flex items-center justify-center">
            <Users size={22} className="text-careermap-navy" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalStudents}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</div>
          </div>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or department…"
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20 transition-all"
        />
      </div>

      {/* ── No courses ─────────────────────────────────────────────────────── */}
      {courses.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">No Assigned Courses</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            You don't have any approved course assignments yet. Contact an admin to get assigned to a course.
          </p>
        </div>
      )}

      {/* ── Course groups ───────────────────────────────────────────────────── */}
      {filteredCourses.map(course => {
        const isExpanded = expandedCourses.has(course.course_id);
        const avgProgress = course.students.length > 0
          ? Math.round(course.students.reduce((a, s) => a + s.progress, 0) / course.students.length)
          : 0;

        return (
          <div
            key={course.course_id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Course header — click to expand/collapse */}
            <button
              onClick={() => toggleCourse(course.course_id)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 bg-careermap-navy/10 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-careermap-navy" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                      {course.course_title}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${levelCls(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {course.student_count} student{course.student_count !== 1 ? 's' : ''}
                    </span>
                    {course.student_count > 0 && (
                      <span className="flex items-center gap-1">
                        <BarChart2 size={12} /> Avg progress: {avgProgress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {/* Mini progress bar */}
                {course.student_count > 0 && (
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progressColor(avgProgress)}`}
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{avgProgress}%</span>
                  </div>
                )}
                {isExpanded
                  ? <ChevronDown size={18} className="text-slate-400" />
                  : <ChevronRight size={18} className="text-slate-400" />}
              </div>
            </button>

            {/* Student list */}
            {isExpanded && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                {course.students.length === 0 ? (
                  <div className="py-10 text-center">
                    <Users size={36} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Academic Info</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Lessons Done</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Enrolled</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {course.students.map(student => (
                          <tr
                            key={student.student_id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                            onClick={() => { setSelectedStudent(student); setSelectedCourseTitle(course.course_title); }}
                          >
                            {/* Name + email */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-careermap-navy to-careermap-teal flex items-center justify-center shrink-0">
                                  <span className="text-white font-black text-sm">
                                    {student.student_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white">{student.student_name}</div>
                                  <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <Mail size={10} /> {student.student_email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Academic info */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                {student.academic_year && (
                                  <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                    <GraduationCap size={11} className="text-careermap-teal" />
                                    {student.academic_year}
                                  </span>
                                )}
                                {student.department && (
                                  <span className="text-xs text-slate-400">{student.department}</span>
                                )}
                                {!student.academic_year && !student.department && (
                                  <span className="text-xs text-slate-300">—</span>
                                )}
                              </div>
                            </td>

                            {/* Progress bar */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${progressColor(student.progress)}`}
                                    style={{ width: `${student.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-8 text-right">
                                  {student.progress}%
                                </span>
                              </div>
                            </td>

                            {/* Lessons done */}
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                                <CheckCircle size={13} className="text-emerald-500" />
                                {student.completed_lesson_count}
                              </span>
                            </td>

                            {/* Enrolled date */}
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={11} /> {fmtDate(student.enrolled_at)}
                              </span>
                            </td>

                            {/* Status badge */}
                            <td className="px-6 py-4">
                              {student.progress === 100 ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                                  Completed
                                </span>
                              ) : student.progress > 0 ? (
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                                  In Progress
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                  Not Started
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Student detail modal ────────────────────────────────────────────── */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-careermap-navy to-careermap-teal flex items-center justify-center shrink-0">
                <span className="text-white font-black text-xl">
                  {selectedStudent.student_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedStudent.student_name}
                </h3>
                <p className="text-sm text-slate-400 flex items-center gap-1">
                  <Mail size={12} /> {selectedStudent.student_email}
                </p>
              </div>
            </div>

            {/* Course badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-careermap-teal/10 rounded-xl border border-careermap-teal/20">
              <BookOpen size={15} className="text-careermap-teal shrink-0" />
              <span className="text-sm font-bold text-careermap-teal truncate">{selectedCourseTitle}</span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedStudent.academic_year || '—'}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedStudent.department || '—'}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lessons Done</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  {selectedStudent.completed_lesson_count}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Enrolled</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {fmtDate(selectedStudent.enrolled_at)}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Progress</span>
                <span className="text-sm font-extrabold text-careermap-teal">{selectedStudent.progress}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressColor(selectedStudent.progress)}`}
                  style={{ width: `${selectedStudent.progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-end">
                {selectedStudent.progress === 100 ? (
                  <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={12} /> Completed
                  </span>
                ) : selectedStudent.progress > 0 ? (
                  <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                    <TrendingUp size={12} /> In Progress
                  </span>
                ) : (
                  <span className="text-xs font-black text-slate-400">Not started yet</span>
                )}
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-3 bg-careermap-navy text-white rounded-xl font-bold text-sm hover:bg-[#023058] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsView;
