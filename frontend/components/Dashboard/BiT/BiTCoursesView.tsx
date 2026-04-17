import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Trash2, Search, Loader2, Users, Star,
  ChevronDown, ChevronUp, ClipboardCheck, Plus, X,
  CheckCircle, Edit2, PlayCircle, Clock, ChevronLeft,
  ChevronRight, ChevronsLeft, Menu, Lock
} from 'lucide-react';
import { bitService } from '../../../services/bitService';
import ConfirmModal from '../../common/ConfirmModal';
import ReactMarkdown from 'react-markdown';
import CreateCourseForRoadmapModal from '../Admin/CreateCourseForRoadmapModal';
import { CardGridSkeleton } from '../../common/Skeleton';

const API = 'http://localhost:8000/api';
const token = () => localStorage.getItem('auth_token') || '';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Lesson { title: string; duration: string; content?: string; }
interface Module  { title: string; lessons: Lesson[]; }
interface Course {
  id: number; title: string; description: string; category: string;
  level: string; duration: string; enrolled_count: number; rating: number;
  creator_name: string; created_at: string; modules: Module[];
}
interface Question {
  id?: number; question: string;
  options: [string, string, string, string];
  correct_answer: number; explanation: string;
}
interface AssessmentRecord {
  id: number; title: string; time_limit: number;
  question_count: number; attempt_count: number;
}

// ── Assessment Manager Modal ──────────────────────────────────────────────────
const AssessmentManager: React.FC<{
  course: Course;
  onClose: () => void;
  onCountChange: (courseId: number, count: number) => void;
}> = ({ course, onClose, onCountChange }) => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null); // null = new
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/assessments/course/${course.id}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setAssessments(list);
      onCountChange(course.id, list.length);
    } catch { setAssessments([]); }
    finally { setLoading(false); }
  }, [course.id]);

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const openNew = () => {
    setEditingId(null);
    setFormTitle(`${course.title} Assessment`);
    setFormTime(30);
    setQuestions([{ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]);
    setShowForm(true);
  };

  const openEdit = async (id: number) => {
    setEditingId(id);
    setShowForm(true);
    try {
      const res = await fetch(`${API}/assessments/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setFormTitle(data.title || '');
      setFormTime(data.time_limit || 30);
      // Fetch with correct answers for editing
      const qRes = await fetch(`${API}/assessments/${id}/questions-admin`, { headers: { Authorization: `Bearer ${token()}` } });
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions(qData.map((q: any) => ({ id: q.id, question: q.question, options: q.options, correct_answer: q.correct_answer, explanation: q.explanation || '' })));
      } else {
        // Fallback: use questions without correct answers
        setQuestions((data.questions || []).map((q: any) => ({ id: q.id, question: q.question, options: q.options, correct_answer: 0, explanation: '' })));
      }
    } catch { alert('Failed to load assessment'); setShowForm(false); }
  };

  const handleSave = async () => {
    const valid = questions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
    if (valid.length === 0) { alert('Add at least one complete question'); return; }
    setSaving(true);
    try {
      if (editingId) {
        // Update existing — delete and recreate (simplest approach)
        await fetch(`${API}/assessments/${editingId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      }
      const res = await fetch(`${API}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ course_id: course.id, title: formTitle, description: '', time_limit: formTime, questions: valid })
      });
      if (!res.ok) throw new Error('Failed');
      setShowForm(false);
      fetchAssessments();
    } catch { alert('Failed to save assessment'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API}/assessments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      fetchAssessments();
    } catch { alert('Failed to delete'); }
    setDeleteId(null);
  };

  const addQ = () => setQuestions(p => [...p, { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]);
  const removeQ = (i: number) => setQuestions(p => p.filter((_, idx) => idx !== i));
  const updateQ = (i: number, f: keyof Question, v: any) => setQuestions(p => p.map((q, idx) => idx === i ? { ...q, [f]: v } : q));
  const updateOpt = (qi: number, oi: number, v: string) =>
    setQuestions(p => p.map((q, idx) => idx !== qi ? q : { ...q, options: q.options.map((o, j) => j === oi ? v : o) as [string,string,string,string] }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-primary dark:text-white flex items-center gap-2">
              <ClipboardCheck size={20} className="text-careermap-teal" />
              {showForm ? (editingId ? 'Edit Assessment' : 'New Assessment') : 'Assessments'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{course.title}</p>
          </div>
          <div className="flex items-center gap-2">
            {showForm && (
              <button onClick={() => setShowForm(false)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {!showForm && (
              <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-careermap-navy text-white rounded-xl text-sm font-bold hover:bg-[#023058] transition-all">
                <Plus size={15} /> New Assessment
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={18} /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {!showForm ? (
            /* ── Assessment List ── */
            loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-careermap-teal" size={32} /></div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-semibold">No assessments yet</p>
                <p className="text-slate-400 text-sm mt-1">Click "New Assessment" to create one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assessments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-bold text-primary dark:text-white text-sm">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.question_count} questions · {a.time_limit} min · {a.attempt_count} attempts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a.id)} className="p-2 text-careermap-teal hover:bg-careermap-navy/10 dark:hover:bg-careermap-navy/20 rounded-lg transition-all" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteId(a.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ── Assessment Form ── */
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Title</label>
                  <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Time Limit (min)</label>
                  <input type="number" value={formTime} onChange={e => setFormTime(+e.target.value)} min={5}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm" />
                </div>
              </div>

              {questions.map((q, qi) => (
                <div key={qi} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-400 mt-2 shrink-0">Q{qi + 1}</span>
                    <textarea value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)} rows={2}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm resize-none"
                      placeholder="Enter question..." />
                    {questions.length > 1 && (
                      <button onClick={() => removeQ(qi)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-6">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${q.correct_answer === oi ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                        <button type="button" onClick={() => updateQ(qi, 'correct_answer', oi)}
                          className={`w-4 h-4 rounded-full border-2 shrink-0 ${q.correct_answer === oi ? 'border-green-500 bg-green-500' : 'border-slate-300'}`} />
                        <input value={opt} onChange={e => updateOpt(qi, oi, e.target.value)}
                          className="flex-1 bg-transparent text-sm text-primary dark:text-white outline-none placeholder:text-slate-400"
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                      </div>
                    ))}
                  </div>
                  <div className="pl-6">
                    <input value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-xs"
                      placeholder="Explanation (optional)" />
                  </div>
                </div>
              ))}

              <button onClick={addQ} className="flex items-center gap-2 text-sm text-careermap-teal font-bold hover:underline">
                <Plus size={15} /> Add Question
              </button>
            </div>
          )}
        </div>

        {showForm && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/50">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-careermap-navy text-white rounded-xl font-semibold text-sm hover:bg-[#023058] disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {editingId ? 'Update Assessment' : 'Save Assessment'}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Assessment" message="Delete this assessment? All student attempts will be lost." confirmText="Delete" type="danger" loading={false} />
    </div>
  );
};

// ── Course Detail View (mirrors student CourseView) ───────────────────────────
const CourseDetailView: React.FC<{ course: Course; onBack: () => void }> = ({ course, onBack }) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

  const toggleModule = (idx: number) => {
    const next = new Set(expandedModules);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedModules(next);
  };

  useEffect(() => {
    setExpandedModules(prev => {
      if (prev.has(activeModuleIndex)) return prev;
      return new Set(prev).add(activeModuleIndex);
    });
  }, [activeModuleIndex]);

  const activeModule = course.modules[activeModuleIndex];
  const activeLesson = activeModule?.lessons[activeLessonIndex];
  const isFirst = activeModuleIndex === 0 && activeLessonIndex === 0;
  const isLast = activeModuleIndex === course.modules.length - 1 && activeLessonIndex === activeModule.lessons.length - 1;

  const parseContent = (raw: string) => {
    if (!raw || raw === '[CONTENT_PENDING]') return '*Content not yet generated.*';
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((b: any) => b.text || b.content || '').join('\n\n');
      if (typeof parsed === 'object') return parsed.text || parsed.content || raw;
    } catch {}
    return raw;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {sidebarOpen && (
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs uppercase font-bold tracking-widest transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
              <button onClick={() => setSidebarOpen(false)} title="Collapse sidebar" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <ChevronsLeft size={16} />
              </button>
            </div>
            <h2 className="font-bold text-sm text-slate-800 dark:text-white leading-tight mb-2">{course.title}</h2>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{course.level}</span>
              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold"><Star size={11} fill="currentColor" /> {course.rating || '4.80'}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {course.modules.map((mod, mIdx) => {
              const isExpanded = expandedModules.has(mIdx);
              return (
                <div key={mIdx} className="border-b border-slate-50 dark:border-slate-800/50">
                  <button
                    onClick={() => toggleModule(mIdx)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between group transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 sticky top-0 backdrop-blur-sm z-20"
                  >
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{mod.title}</span>
                    {isExpanded ? <ChevronDown size={14} className="text-slate-400 group-hover:text-careermap-teal transition-colors" /> : <ChevronRight size={14} className="text-slate-400 group-hover:text-careermap-teal transition-colors" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                      {mod.lessons.map((lesson, lIdx) => {
                        const isActive = activeModuleIndex === mIdx && activeLessonIndex === lIdx;
                        return (
                          <button key={lIdx} onClick={() => { setActiveModuleIndex(mIdx); setActiveLessonIndex(lIdx); }}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${isActive ? 'bg-careermap-navy/10 dark:bg-careermap-navy/20 border-r-2 border-careermap-teal' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            {isActive ? <PlayCircle size={14} className="text-careermap-teal mt-0.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />}
                            <div>
                              <p className={`text-xs font-medium ${isActive ? 'text-careermap-navy dark:text-careermap-teal' : 'text-slate-600 dark:text-slate-400'}`}>{lesson.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={9} /> {lesson.duration}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-6 gap-3 shrink-0">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} title="Expand sidebar" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Menu size={16} />
            </button>
          )}
          <BookOpen size={14} className="text-slate-400" />
          <span className="text-slate-400 text-sm hidden sm:inline">{activeModule?.title}</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-800 dark:text-white font-bold text-sm truncate">{activeLesson?.title}</span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="font-bold text-2xl mb-5">{activeLesson?.title}</h1>
            <div className="min-h-[300px]">
              <ReactMarkdown>{parseContent(activeLesson?.content || '')}</ReactMarkdown>
            </div>
          </div>
          <div className="mt-12 flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button disabled={isFirst} onClick={() => {
              if (activeLessonIndex > 0) setActiveLessonIndex(i => i - 1);
              else if (activeModuleIndex > 0) { setActiveModuleIndex(i => i - 1); setActiveLessonIndex(course.modules[activeModuleIndex - 1].lessons.length - 1); }
            }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 disabled:opacity-40 transition-all hover:bg-slate-50">
              <ChevronLeft size={15} /> Previous
            </button>
            <button disabled={isLast} onClick={() => {
              if (activeLessonIndex < activeModule.lessons.length - 1) setActiveLessonIndex(i => i + 1);
              else if (activeModuleIndex < course.modules.length - 1) { setActiveModuleIndex(i => i + 1); setActiveLessonIndex(0); }
            }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-careermap-navy text-white font-bold text-sm hover:bg-[#023058] disabled:opacity-40 transition-all shadow-lg shadow-navy-500/10">
              Next Lesson <ChevronLeft size={15} className="rotate-180" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const BiTCoursesView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [assessmentModal, setAssessmentModal] = useState<Course | null>(null);
  const [assessmentCounts, setAssessmentCounts] = useState<Record<number, number>>({});
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [expandedCurriculumModules, setExpandedCurriculumModules] = useState<Set<string>>(new Set());

  const toggleCurriculumModule = (courseId: number, moduleIdx: number) => {
    const key = `${courseId}-${moduleIdx}`;
    const next = new Set(expandedCurriculumModules);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedCurriculumModules(next);
  };

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await bitService.getCourses();
      const list = Array.isArray(data) ? data : [];
      setCourses(list);
      fetchAssessmentCounts(list);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const fetchAssessmentCounts = async (list: Course[]) => {
    const counts: Record<number, number> = {};
    await Promise.all(list.map(async c => {
      try {
        const res = await fetch(`${API}/assessments/course/${c.id}`, { headers: { Authorization: `Bearer ${token()}` } });
        const data = await res.json();
        counts[c.id] = Array.isArray(data) ? data.length : 0;
      } catch { counts[c.id] = 0; }
    }));
    setAssessmentCounts(counts);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      await bitService.deleteCourse(courseToDelete);
      setCourses(courses.filter(c => c.id !== courseToDelete));
      setDeleteConfirmOpen(false); setCourseToDelete(null);
    } catch { alert('Failed to delete course'); }
    finally { setDeleting(false); }
  };

  const levelBadge = (l: string) => ({
    Beginner: 'bg-careermap-teal/10 text-careermap-teal', Intermediate: 'bg-orange-100 text-orange-700', Advanced: 'bg-purple-100 text-purple-700',
  }[l] ?? 'bg-slate-100 text-slate-600');

  // Show course detail view
  if (detailCourse) return <CourseDetailView course={detailCourse} onBack={() => setDetailCourse(null)} />;

  const filtered = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <CardGridSkeleton count={4} />;

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <BookOpen className="text-careermap-teal" size={32} /> 
             Official Curriculum
          </h2>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Institutional Catalog Management</p>
        </div>
        <button onClick={() => setAddCourseModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-careermap-teal text-white rounded-2xl font-bold text-sm hover:bg-careermap-teal/90 transition-all shadow-lg shadow-careermap-teal/20">
          <Plus size={18} /> Compose New Course
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Filter catalog by title, category or creator..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-careermap-teal/5 focus:border-careermap-teal outline-none transition-all shadow-sm" 
        />
      </div>

      {/* Summary Stats - High Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-careermap-navy rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl">
          <div>
            <div className="text-3xl font-serif font-bold tracking-tighter">{courses.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-careermap-teal">Active Catalog</div>
          </div>
          <BookOpen className="opacity-20" size={40} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-3xl font-serif font-bold tracking-tighter text-slate-900 dark:text-white">{courses.reduce((s, c) => s + (c.enrolled_count || 0), 0)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Scholars</div>
          </div>
          <Users className="text-careermap-teal opacity-20" size={40} />
        </div>
      </div>

      {/* Catalog Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 text-center border border-slate-200 dark:border-slate-800 border-dashed">
          <BookOpen size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
          <p className="text-xl font-serif font-bold text-slate-400">No matching courses found</p>
          <p className="text-sm text-slate-400 mt-2">Adjust your parameters or create a new entry.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(course => (
            <div key={course.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:border-careermap-teal/30">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 px-8 py-6">
                <button 
                  onClick={() => setExpandedId(expandedId === course.id ? null : course.id)} 
                  className={`hidden lg:flex p-3 rounded-2xl transition-all ${expandedId === course.id ? 'bg-careermap-navy text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-careermap-teal'}`}
                >
                  {expandedId === course.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <button onClick={() => setDetailCourse(course)} className="text-xl font-serif font-bold text-slate-900 dark:text-white hover:text-careermap-teal transition-colors text-left tracking-tight">
                      {course.title}
                    </button>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      course.level === 'Beginner' ? 'bg-careermap-teal/10 text-careermap-teal border-careermap-teal/20' : 
                      course.level === 'Intermediate' ? 'bg-careermap-navy/5 text-careermap-navy border-careermap-navy/10' : 'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>{course.level}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5"><Users size={12} className="text-careermap-teal" /> {course.enrolled_count || 0} Students</span>
                    <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-400" fill="currentColor" /> {course.rating || '4.80'}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {course.duration}</span>
                    <span className="flex items-center gap-1.5 text-careermap-teal"><ClipboardCheck size={12} /> {assessmentCounts[course.id] ?? 0} Assessments</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <button onClick={() => setDetailCourse(course)} className="flex items-center gap-2 px-5 py-3 bg-careermap-navy text-white rounded-xl text-xs font-bold hover:bg-careermap-navy/90 transition-all shadow-lg shadow-careermap-navy/20">
                    <PlayCircle size={14} /> View Studio
                  </button>
                  <button onClick={() => setAssessmentModal(course)} className="flex items-center gap-2 px-5 py-3 bg-careermap-teal/10 text-careermap-teal rounded-xl text-xs font-bold hover:bg-careermap-teal/20 transition-all border border-careermap-teal/20 group-hover:bg-careermap-teal group-hover:text-white group-hover:border-transparent duration-300">
                    <ClipboardCheck size={14} /> Exam Manager
                  </button>
                  <button onClick={() => { setCourseToDelete(course.id); setDeleteConfirmOpen(true); }} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {expandedId === course.id && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-8 py-8 bg-slate-50/50 dark:bg-slate-800/20 animate-in slide-in-from-top duration-300">
                  <div className="max-w-3xl mb-8">
                     <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-careermap-teal mb-2">Curriculum Sync Overview</div>
                     {course.description && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{course.description}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(course.modules || []).map((mod, mi) => {
                      const isModExpanded = expandedCurriculumModules.has(`${course.id}-${mi}`);
                      return (
                        <div key={mi} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                          <button 
                            onClick={() => toggleCurriculumModule(course.id, mi)}
                            className="flex items-center justify-between group/mod-header"
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-serif font-bold text-slate-900 dark:text-white group-hover/mod-header:text-careermap-teal transition-colors">{mod.title}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{mod.lessons?.length || 0} Topics</span>
                            </div>
                            {isModExpanded ? <ChevronDown size={16} className="text-careermap-teal" /> : <ChevronRight size={16} className="text-slate-300 group-hover/mod-header:text-careermap-teal" />}
                          </button>
                          
                          {isModExpanded && (
                            <div className="space-y-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                              {(mod.lessons || []).map((lesson, li) => (
                                <div key={li} className="flex items-center justify-between group/lesson">
                                  <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-careermap-teal opacity-40 group-hover/lesson:opacity-100" />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover/lesson:text-careermap-teal transition-colors">{lesson.title}</span>
                                  </div>
                                  <span className="text-[10px] font-medium text-slate-400">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal isOpen={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setCourseToDelete(null); }}
        onConfirm={handleDelete} title="Delete Course" message="Delete this course? Students will lose access." confirmText="Delete" type="danger" loading={deleting} />

      {assessmentModal && (
        <AssessmentManager course={assessmentModal} onClose={() => setAssessmentModal(null)}
          onCountChange={(id, count) => setAssessmentCounts(prev => ({ ...prev, [id]: count }))} />
      )}

      {addCourseModal && (
        <CreateCourseForRoadmapModal
          isOpen={addCourseModal}
          roadmapId={0}
          roadmapTitle="BiT Official Courses"
          onClose={() => setAddCourseModal(false)}
          onSuccess={() => { setAddCourseModal(false); fetchCourses(); }}
          addCourseFn={async (_roadmapId, data) => {
            // Create course without linking to a roadmap — use first available roadmap or standalone
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:8000/api/bit/courses/standalone', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create course');
            return res.json();
          }}
        />
      )}
    </div>
  );
};

export default BiTCoursesView;
