import React, { useState, useEffect } from 'react';
import {
  Search, Plus, ArrowLeft, Clock, Monitor,
  Loader2, BookOpen, CheckCircle, Star, Users, ExternalLink, ChevronDown, ChevronRight, PlayCircle
} from 'lucide-react';
import RoadmapGenerator from './RoadmapGenerator';
import { getUserCourses } from '../../services/courseService';
import { Course } from '../../types';
import CourseView from './CourseView';
import { CardGridSkeleton } from '../common/Skeleton';

interface LibraryViewProps {
  userId: string;
  openCourseId?: number | null;
  onCourseOpened?: () => void;
}

type Tab = 'my' | 'browse';
type EnrollState = { type: 'success' | 'already' | 'error'; courseId: string } | null;

const API = 'http://localhost:8000/api';
const authToken = () => localStorage.getItem('auth_token') || '';

const levelCls = (level: string) =>
  level === 'Advanced'     ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300' :
  level === 'Intermediate' ? 'bg-careermap-navy/10 text-careermap-navy dark:bg-careermap-navy/20 dark:text-careermap-teal' :
                             'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300';

const LibraryView: React.FC<LibraryViewProps> = ({ userId, openCourseId, onCourseOpened }) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'study'>('list');
  const [activeTab, setActiveTab] = useState<Tab>('my');
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollState, setEnrollState] = useState<EnrollState>(null);
  const [expandedCoursePreviews, setExpandedCoursePreviews] = useState<Set<string>>(new Set());

  const togglePreview = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedCoursePreviews);
    if (next.has(courseId)) next.delete(courseId);
    else next.add(courseId);
    setExpandedCoursePreviews(next);
  };

  useEffect(() => { if (userId) fetchMyCourses(); }, [userId]);

  useEffect(() => {
    if (openCourseId && userCourses.length > 0) {
      const target = userCourses.find(c => String(c.id) === String(openCourseId));
      if (target) { openCourse(target); onCourseOpened?.(); }
    }
  }, [openCourseId, userCourses]);

  useEffect(() => {
    if (activeTab === 'browse' && allCourses.length === 0) fetchAllCourses();
  }, [activeTab]);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const courses = await getUserCourses(userId);
      setUserCourses(courses || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAllCourses = async () => {
    setBrowseLoading(true);
    try {
      const res = await fetch(`${API}/course-assignments/available`, {
        headers: { Authorization: `Bearer ${authToken()}` }
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setAllCourses(list.map((c: any) => ({
        ...c,
        modules: typeof c.modules === 'string' ? JSON.parse(c.modules) : (c.modules || [])
      })));
    } catch (e) { console.error(e); }
    finally { setBrowseLoading(false); }
  };

  const openCourse = (course: Course) => { setSelectedCourse(course); setViewMode('study'); };

  const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnrollingId(courseId);
    try {
      const res = await fetch(`${API}/course-assignments/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken()}` },
        body: JSON.stringify({ course_id: parseInt(courseId) })
      });
      const data = await res.json();
      if (res.ok) {
        setEnrollState({ type: 'success', courseId });
        fetchMyCourses();
      } else if (data?.message?.toLowerCase().includes('already')) {
        setEnrollState({ type: 'already', courseId });
      } else {
        setEnrollState({ type: 'error', courseId });
      }
    } catch { setEnrollState({ type: 'error', courseId }); }
    finally {
      setEnrollingId(null);
      setTimeout(() => setEnrollState(null), 3000);
    }
  };

  const enrolledIds = new Set(userCourses.map(c => String(c.id)));

  const filteredMy = userCourses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAll = allCourses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Views ──────────────────────────────────────────────────────────────────

  if (viewMode === 'create') return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => { setViewMode('list'); fetchMyCourses(); }}
        className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
        <ArrowLeft size={14} /> Back to Library
      </button>
      <RoadmapGenerator userId={userId} onCourseCreated={(c) => { fetchMyCourses(); openCourse(c); }} />
    </div>
  );

  if (viewMode === 'study' && selectedCourse) return (
    <CourseView userId={userId} initialCourseData={selectedCourse} onBack={() => { setViewMode('list'); fetchMyCourses(); }} />
  );

  return (
    <div className="animate-reveal space-y-6 pb-20">
      {/* Enrollment success dialog */}
      {enrollState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${enrollState.type === 'success' ? 'bg-green-100' : enrollState.type === 'already' ? 'bg-amber-100' : 'bg-red-100'}`}>
              <CheckCircle size={32} className={enrollState.type === 'success' ? 'text-green-600' : enrollState.type === 'already' ? 'text-amber-500' : 'text-red-500'} />
            </div>
            <h3 className={`text-xl font-extrabold mb-2 ${enrollState.type === 'success' ? 'text-green-700' : enrollState.type === 'already' ? 'text-amber-600' : 'text-red-600'}`}>
              {enrollState.type === 'success' ? 'Enrolled!' : enrollState.type === 'already' ? 'Already Enrolled' : 'Enrollment Failed'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {enrollState.type === 'success' ? 'Course added to your library. Start learning now!' :
               enrollState.type === 'already' ? 'You are already enrolled in this course.' :
               'Something went wrong. Please try again.'}
            </p>
            <button onClick={() => setEnrollState(null)}
              className={`w-full py-3 rounded-xl font-bold text-white ${enrollState.type === 'success' ? 'bg-green-600 hover:bg-green-700' : enrollState.type === 'already' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'}`}>
              {enrollState.type === 'success' ? 'Go to My Courses' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Learning</p>
          <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white uppercase tracking-widest">Courses</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 w-56 transition-all" />
          </div>
          <button onClick={() => setViewMode('create')}
            className="bg-careermap-navy hover:bg-[#023058] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-careermap-navy/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Plus size={16} /> New Course
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('my')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-white dark:bg-slate-900 text-careermap-navy shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          My Courses {userCourses.length > 0 && <span className="ml-1.5 bg-careermap-navy/10 text-careermap-navy text-xs px-1.5 py-0.5 rounded-full">{userCourses.length}</span>}
        </button>
        <button onClick={() => setActiveTab('browse')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'browse' ? 'bg-white dark:bg-slate-900 text-careermap-navy shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          Browse All
        </button>
      </div>

      {/* ── My Courses Tab ── */}
      {activeTab === 'my' && (
        loading ? (
          <CardGridSkeleton count={3} />
        ) : filteredMy.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Courses Yet</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-6">Browse all courses to enroll, or generate a new AI course.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setActiveTab('browse')} className="bg-careermap-navy text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#023058] transition-all">Browse Courses</button>
              <button onClick={() => setViewMode('create')} className="border border-careermap-teal text-careermap-teal px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-careermap-teal/5 transition-all">Generate with AI</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMy.map(course => (
              <div key={course.id} onClick={() => openCourse(course)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-careermap-teal/20 transition-all group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-careermap-navy/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative flex justify-between items-start mb-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${levelCls(course.level)}`}>{course.level}</span>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-careermap-navy group-hover:text-white transition-colors">
                    <ExternalLink size={15} />
                  </div>
                </div>
                <div className="relative mb-6 h-28">
                  <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 group-hover:text-careermap-teal transition-colors">{course.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{course.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-4">
                  <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-300" /> {course.duration}</span>
                  <span className="flex items-center gap-1.5"><Monitor size={13} className="text-slate-300" /> {course.modules?.length || 0} Modules</span>
                  <span className="ml-auto flex items-center gap-1 text-careermap-teal opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowLeft size={11} className="rotate-180" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Browse All Tab ── */}
      {activeTab === 'browse' && (
        browseLoading ? (
          <CardGridSkeleton count={6} />
        ) : filteredAll.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAll.map(course => {
              const isEnrolled = enrolledIds.has(String(course.id));
              const isEnrolling = enrollingId === String(course.id);
              const isExpanded = expandedCoursePreviews.has(String(course.id));
              
              return (
                <div key={course.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 transition-all duration-300 flex flex-col ${isExpanded ? 'ring-2 ring-careermap-teal shadow-2xl' : 'hover:shadow-lg'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${levelCls(course.level)}`}>{course.level}</span>
                    {course.rating && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={12} fill="currentColor" /> {course.rating}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">{course.description}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-5 pb-5 border-b border-slate-50 dark:border-slate-800">
                    <span className="flex items-center gap-1"><Clock size={12} /> {course.duration || 'Self-paced'}</span>
                    <button 
                      onClick={(e) => togglePreview(String(course.id), e)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-careermap-navy dark:text-teal-400 font-bold hover:bg-careermap-teal/10 transition-colors"
                    >
                      <BookOpen size={12} /> {course.modules?.length || 0} modules {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    {course.enrolled && <span className="flex items-center gap-1"><Users size={12} /> {course.enrolled}</span>}
                  </div>

                  {isExpanded && (
                    <div className="mb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Curriculum</p>
                      <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {course.modules?.map((mod: any, mIdx: number) => (
                          <div key={mIdx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent">
                            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-careermap-teal" /> {mod.title}
                            </h4>
                            <div className="pl-3.5 space-y-1">
                              {mod.lessons?.map((lesson: any, lIdx: number) => (
                                <div key={lIdx} className="text-[10px] text-slate-400 flex items-center justify-between">
                                  <span>{lesson.title}</span>
                                  <span>{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    {isEnrolled ? (
                      <>
                        <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 font-bold text-sm border border-green-200 dark:border-green-800">
                          <CheckCircle size={15} /> Enrolled
                        </div>
                        <button onClick={() => openCourse(course)}
                          className="flex-1 py-2.5 rounded-xl bg-careermap-navy text-white font-bold text-sm hover:bg-[#023058] transition-all">
                          Open
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openCourse(course)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                          Preview
                        </button>
                        <button onClick={(e) => handleEnroll(String(course.id), e)} disabled={isEnrolling}
                          className="flex-1 py-2.5 rounded-xl bg-careermap-navy text-white font-bold text-sm hover:bg-[#023058] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-navy-500/10">
                          {isEnrolling ? <Loader2 size={14} className="animate-spin" /> : null}
                          Enroll
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default LibraryView;
