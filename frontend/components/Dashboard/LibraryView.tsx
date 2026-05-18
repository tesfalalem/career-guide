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

const API = 'http://localhost/careerguide/backend/api';
const authToken = () => localStorage.getItem('auth_token') || '';

const levelCls = (level: string) =>
  level === 'Advanced'     ? 'bg-purple-500/10 text-purple-600 border border-purple-200/50' :
  level === 'Intermediate' ? 'bg-careermap-teal/10 text-careermap-teal border border-careermap-teal/20' :
                             'bg-emerald-500/10 text-emerald-600 border border-emerald-200/50';

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

  const calculateProgress = (course: Course) => {
    const modules = typeof course.modules === 'string' ? JSON.parse(course.modules) : (course.modules || []);
    const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
    const completedCount = course.completed_lessons?.length || 0;
    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  };

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const courses = await getUserCourses(userId);
      setUserCourses((courses || []).map((c: any) => ({
        ...c,
        modules: typeof c.modules === 'string' ? JSON.parse(c.modules) : (c.modules || [])
      })));
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
    }
  };

  const handleEnrollSuccessAction = () => {
    if (enrollState?.courseId) {
      const target = userCourses.find(c => String(c.id) === String(enrollState.courseId));
      if (target) {
        openCourse(target);
      } else {
        setActiveTab('my');
      }
    }
    setEnrollState(null);
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

  const [showAllBrowse, setShowAllBrowse] = useState(false);
  const [showAllMy, setShowAllMy] = useState(false);

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
            <button onClick={handleEnrollSuccessAction}
              className={`w-full py-3 rounded-xl font-bold text-white ${enrollState.type === 'success' ? 'bg-green-600 hover:bg-green-700' : enrollState.type === 'already' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'}`}>
              {enrollState.type === 'success' ? 'Go to Course' : 'Got it'}
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
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">Your library is empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Start your journey by enrolling in a course or generating a custom AI roadmap.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setActiveTab('browse')} className="bg-careermap-navy text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#023058] transition-all shadow-lg shadow-careermap-navy/20">Browse Courses</button>
              <button onClick={() => setViewMode('create')} className="bg-white dark:bg-slate-800 border-2 border-careermap-teal text-careermap-teal px-8 py-3 rounded-2xl font-bold text-sm hover:bg-careermap-teal/5 transition-all">AI Generator</button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {(showAllMy ? filteredMy : filteredMy.slice(0, 6)).map(course => (
                <div key={course.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-white dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                  onClick={() => openCourse(course)}>
                  {/* Progress Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-careermap-navy/[0.02] to-careermap-teal/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${levelCls(course.level)}`}>
                        {course.level}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-careermap-navy text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlayCircle size={20} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-careermap-teal transition-colors">{course.title}</h3>
                    <p className="text-slate-400 font-medium text-xs line-clamp-2 mb-8 leading-relaxed">{course.description}</p>

                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-black text-careermap-teal">{calculateProgress(course)}%</span>
                      </div>
                      <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-careermap-navy to-careermap-teal transition-all duration-1000" style={{ width: `${calculateProgress(course)}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {course.duration || '20 hours'}</span>
                        <span className="flex items-center gap-1.5"><BookOpen size={12} /> {course.modules?.length || 0} Modules</span>
                      </div>
                      <span className="text-[10px] font-black text-careermap-navy dark:text-teal-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Resume</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMy.length > 6 && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAllMy(!showAllMy); }}
                  className="group flex items-center gap-3 px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-careermap-navy dark:text-careermap-teal hover:border-careermap-teal transition-all shadow-sm hover:shadow-xl"
                >
                  {showAllMy ? 'Show Less' : 'View All My Courses'}
                  <ChevronRight size={18} className={`transition-transform duration-300 ${showAllMy ? '-rotate-90' : 'rotate-90 group-hover:translate-y-1'}`} />
                </button>
              </div>
            )}
          </div>
        )
      )}

      {/* ── Browse All Tab ── */}
      {activeTab === 'browse' && (
        browseLoading ? (
          <CardGridSkeleton count={6} />
        ) : filteredAll.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
            <BookOpen size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-serif font-bold text-slate-400">No courses available in the catalog</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {(showAllBrowse ? filteredAll : filteredAll.slice(0, 6)).map(course => {
                const isEnrolled = enrolledIds.has(String(course.id));
                const isEnrolling = enrollingId === String(course.id);
                const isExpanded = expandedCoursePreviews.has(String(course.id));
                
                return (
                  <div key={course.id}
                    className={`group relative bg-white dark:bg-slate-900 border transition-all duration-500 rounded-[2.5rem] p-8 flex flex-col ${isExpanded ? 'ring-2 ring-careermap-teal shadow-2xl z-10' : 'border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-careermap-teal/20'}`}>
                    
                    <div className="flex justify-between items-center mb-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${levelCls(course.level)}`}>
                        {course.level}
                      </span>

                    </div>

                    <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-careermap-teal transition-colors">{course.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium mb-8 flex-1">{course.description}</p>

                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-2"><Clock size={14} className="text-slate-300" /> {course.duration || 'Self-paced'}</span>
                      <button 
                        onClick={(e) => togglePreview(String(course.id), e)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-careermap-navy dark:text-teal-400 font-black hover:bg-careermap-teal hover:text-white transition-all duration-300"
                      >
                        <BookOpen size={14} /> {course.modules?.length || 0} modules {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mb-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
                        <p className="text-[10px] font-black uppercase tracking-widest text-careermap-teal">Curriculum Deep Dive</p>
                        <div className="max-h-60 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                          {course.modules?.map((mod: any, mIdx: number) => (
                            <div key={mIdx} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                              <h4 className="text-xs font-black text-careermap-navy dark:text-white mb-3 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-careermap-teal shadow-lg shadow-careermap-teal/50" /> 
                                {mod.title}
                              </h4>
                              <div className="pl-5 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-1">
                                {mod.lessons?.map((lesson: any, lIdx: number) => (
                                  <div key={lIdx} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between group/lesson">
                                    <span className="group-hover/lesson:text-careermap-teal transition-colors">{lesson.title}</span>
                                    <span className="text-[9px] font-black text-slate-300 uppercase">{lesson.duration}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 mt-auto">
                      {isEnrolled ? (
                        <>
                          <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-black text-xs uppercase tracking-widest border border-emerald-200/50 dark:border-emerald-800/50">
                            <CheckCircle size={16} /> Enrolled
                          </div>
                          <button onClick={() => openCourse(course)}
                            className="flex-1 py-4 rounded-2xl bg-careermap-navy text-white font-black text-xs uppercase tracking-widest hover:bg-[#023058] transition-all shadow-lg shadow-careermap-navy/20 hover:-translate-y-1">
                            Continue
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openCourse(course)}
                            className="flex-1 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            Preview
                          </button>
                          <button onClick={(e) => handleEnroll(String(course.id), e)} disabled={isEnrolling}
                            className="flex-1 py-4 rounded-2xl bg-careermap-navy text-white font-black text-xs uppercase tracking-widest hover:bg-[#023058] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-careermap-navy/30 hover:-translate-y-1">
                            {isEnrolling ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Enroll Now
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAll.length > 6 && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setShowAllBrowse(!showAllBrowse)}
                  className="group flex items-center gap-3 px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-careermap-navy dark:text-careermap-teal hover:border-careermap-teal transition-all shadow-sm hover:shadow-xl"
                >
                  {showAllBrowse ? 'Show Less' : 'View All Courses'}
                  <ChevronRight size={18} className={`transition-transform duration-300 ${showAllBrowse ? '-rotate-90' : 'rotate-90 group-hover:translate-y-1'}`} />
                </button>
              </div>
            )}
          </div>

        )
      )}
    </div>
  );
};

export default LibraryView;
