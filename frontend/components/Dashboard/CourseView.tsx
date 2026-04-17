import React, { useState, useEffect, useCallback } from 'react';
import { Course } from '../../types';
import {
  PlayCircle, Lock, BookOpen, Clock,
  ArrowLeft, ArrowRight, Star, ChevronsLeft, Menu,
  ChevronDown, ChevronRight,
  Link2, FileText, Image as ImageIcon, Video, Download, ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { enrollInCourse } from '../../services/courseService';

const API_BASE = 'http://localhost:8000/api';

interface CourseViewProps {
  initialCourseData?: Course;
  onBack: () => void;
  isEnrolled?: boolean;
  userId?: string;
}

// ── Block Renderer ────────────────────────────────────────────────────────────
const SERVE_BASE = 'http://localhost:8000';

// Resolve any URL — handles real URLs and legacy [UPLOADED:filename] format
const resolveUrl = (raw: string | undefined): string | null => {
  if (!raw) return null;
  if (raw.startsWith('[UPLOADED:')) {
    const filename = raw.replace('[UPLOADED:', '').replace(']', '');
    return `${SERVE_BASE}/api/uploads/serve?file=${encodeURIComponent(filename)}`;
  }
  if (raw.startsWith('[UPLOAD_FAILED') || raw.startsWith('[')) return null;
  return raw;
};
const getYouTubeId = (url: string) => {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
};

const BlockRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Try to parse as JSON block array
  let blocks: any[] = [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      blocks = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Single block or wrapped object
      return <ReactMarkdown>{parsed.text || parsed.content || content}</ReactMarkdown>;
    }
  } catch {
    // Plain text or markdown — render directly
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block: any, i: number) => {
        switch (block.type) {
          case 'text':
            return (
              <div key={i} className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{block.text || ''}</ReactMarkdown>
              </div>
            );

          case 'image': {
            const src = resolveUrl(block.imageUrl);
            return (
              <figure key={i} className="my-4">
                {src ? (
                  <img src={src} alt={block.imageCaption || 'Image'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 object-cover max-h-96"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                    <ImageIcon size={20} className="text-slate-400" />
                    <span className="text-sm text-slate-500">{block.imageCaption || 'Image unavailable'}</span>
                  </div>
                )}
                {block.imageCaption && src && (
                  <figcaption className="text-xs text-slate-400 text-center mt-2">{block.imageCaption}</figcaption>
                )}
              </figure>
            );
          }

          case 'video': {
            const ytId = block.videoUrl ? getYouTubeId(block.videoUrl) : null;
            const videoSrc = resolveUrl(block.videoUrl);
            return (
              <div key={i} className="my-4">
                {ytId ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allowFullScreen title={`video-${i}`} />
                  </div>
                ) : videoSrc ? (
                  <video src={videoSrc} controls className="w-full rounded-xl border border-slate-200 dark:border-slate-700 max-h-96" />
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                    <Video size={20} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Video unavailable</span>
                  </div>
                )}
              </div>
            );
          }

          case 'link':
            return (
              <div key={i} className="my-2">
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800 font-semibold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                >
                  <Link2 size={16} />
                  {block.label || block.url}
                </a>
              </div>
            );

          case 'file': {
            const fileUrl = resolveUrl(block.fileUrl);
            // Extract clean filename: strip uid prefix and URL noise
            const rawName = block.fileLabel
              || (block.fileUrl && !block.fileUrl.startsWith('http')
                  ? block.fileUrl.replace(/\[UPLOADED:|]/g, '')
                  : null)
              || (fileUrl ? decodeURIComponent(new URL(fileUrl).searchParams.get('file') || '') : '')
              || 'Document';
            // Strip leading uid (hex_) prefix e.g. "69cec6dd3b42d_wireless..." → "wireless..."
            const cleanName = rawName.replace(/^[a-f0-9]{8,}_/, '').replace(/_/g, ' ');
            const ext = rawName.split('.').pop()?.toUpperCase() ?? '';
            const extColors: Record<string, string> = {
              PDF: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
              DOCX: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
              DOC: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
              PPTX: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
              PPT: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
              XLSX: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
              ZIP: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
            };
            const colorCls = extColors[ext] ?? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
            return (
              <div key={i} className="my-3">
                {fileUrl ? (
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" download
                    className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border font-semibold text-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${colorCls}`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-current/10 shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate max-w-xs font-bold">{cleanName}</div>
                      <div className="text-xs opacity-60 font-normal">{ext} · Click to download</div>
                    </div>
                    <ArrowRight size={16} className="shrink-0 opacity-60" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                    <FileText size={20} className="text-slate-400" />
                    <span className="text-sm text-slate-500">{cleanName}</span>
                  </div>
                )}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};

const CourseView: React.FC<CourseViewProps> = ({
  initialCourseData, onBack, isEnrolled: initialEnrolled, userId = 'mock-user-id'
}) => {
  const [course] = useState<Course | null>(initialCourseData || null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled || !!initialCourseData);
  const [progress, setProgress] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [showMaterials, setShowMaterials] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
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

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 200 && newWidth <= 550) {
        setSidebarWidth(newWidth);
      } else if (newWidth < 100) {
        setSidebarOpen(false);
        setIsResizing(false);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    if (course?.id) {
      fetch(`${API_BASE}/resources/course/${course.id}`)
        .then(r => r.json())
        .then(d => setMaterials(Array.isArray(d) ? d : []))
        .catch(() => setMaterials([]));
    }
  }, [course?.id]);

  if (!course) return null;

  const activeModule = course.modules[activeModuleIndex];
  const activeLesson = activeModule?.lessons[activeLessonIndex];

  const handleEnroll = async () => {
    if (!course?.id) return;
    setIsEnrolling(true);
    try {
      await enrollInCourse(course.id, userId);
      setIsEnrolled(true);
    } catch (err) {
      console.error('Failed to enroll', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCompleteLesson = () => {
    setProgress(prev => Math.min(prev + 10, 100));
  };

  const goToPrev = () => {
    if (activeLessonIndex > 0) setActiveLessonIndex(i => i - 1);
    else if (activeModuleIndex > 0) {
      setActiveModuleIndex(i => i - 1);
      setActiveLessonIndex(course.modules[activeModuleIndex - 1].lessons.length - 1);
    }
  };

  const goToNext = () => {
    if (activeLessonIndex < activeModule.lessons.length - 1) {
      setActiveLessonIndex(i => i + 1);
    } else if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(i => i + 1);
      setActiveLessonIndex(0);
    }
  };

  const isFirst = activeModuleIndex === 0 && activeLessonIndex === 0;
  const isLast = activeModuleIndex === course.modules.length - 1 &&
    activeLessonIndex === activeModule.lessons.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row animate-in fade-in duration-500">

      {/* Sidebar */}
      {sidebarOpen && (
        <aside 
          style={{ width: `${sidebarWidth}px` }}
          className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen overflow-y-auto flex flex-col shrink-0 relative group">
          {/* Resize Handle */}
          <div
            onMouseDown={startResizing}
            className={`absolute top-0 -right-1 w-2 h-full cursor-col-resize z-50 transition-colors ${isResizing ? 'bg-indigo-500' : 'group-hover:bg-indigo-500/20'}`}
          />
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs uppercase font-bold tracking-widest transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                title="Collapse sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronsLeft size={18} />
              </button>
            </div>
            <h2 className="font-bold text-base text-slate-800 dark:text-white leading-tight mb-2">
              {course.title}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {course.level}
              </span>
              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star size={12} fill="currentColor" /> {course.rating}
              </span>
            </div>
            {isEnrolled ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Progress</span><span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <button
                disabled={isEnrolling}
                onClick={handleEnroll}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {course.modules.map((module, mIdx) => {
              const isExpanded = expandedModules.has(mIdx);
              return (
                <div key={mIdx} className="border-b border-slate-50 dark:border-slate-800/50">
                  <button
                    onClick={() => toggleModule(mIdx)}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between group transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 sticky top-0 backdrop-blur-sm z-10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{mIdx + 1}</span>
                      </div>
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300 text-left leading-tight">
                        {module.title}
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> : <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-0.5 py-1 animate-in slide-in-from-top-2 duration-300">
                      {module.lessons.map((lesson, lIdx) => {
                        const isActive = activeModuleIndex === mIdx && activeLessonIndex === lIdx;
                        const isLocked = !isEnrolled && mIdx > 0;
                        return (
                          <button
                            key={lIdx}
                            onClick={() => { if (!isLocked) { setActiveModuleIndex(mIdx); setActiveLessonIndex(lIdx); } }}
                            disabled={isLocked}
                            className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 border-r-2 border-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isActive ? (
                              <PlayCircle size={15} className="text-indigo-500 mt-0.5 shrink-0" />
                            ) : isLocked ? (
                              <Lock size={15} className="text-slate-300 mt-0.5 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className={`text-xs font-medium ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                {lesson.title}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Clock size={9} /> {lesson.duration}
                              </p>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-14 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Expand button shown when sidebar is collapsed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expand sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Menu size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <BookOpen size={15} />
              <span className="hidden sm:inline">{activeModule?.title}</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-slate-800 dark:text-white font-bold truncate max-w-xs">{activeLesson?.title}</span>
            </div>
          </div>
          {!isEnrolled && (
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Lock size={11} /> Preview
            </span>
          )}
          {materials.length > 0 && (
            <button onClick={() => setShowMaterials(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showMaterials ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}>
              <FileText size={14} /> Materials ({materials.length})
            </button>
          )}
        </header>

        {/* Teacher Materials Panel */}
        {showMaterials && materials.length > 0 && (
          <div className="border-b border-slate-200 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/10 px-6 py-4">
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <FileText size={15} /> Teacher Materials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {materials.map((m: any) => (
                <a key={m.id}
                  href={m.file_url || m.external_url || '#'}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all group">
                  <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                    {m.resource_type === 'video' ? <Video size={16} className="text-indigo-600" /> :
                     m.resource_type === 'link' ? <ExternalLink size={16} className="text-indigo-600" /> :
                     <FileText size={16} className="text-indigo-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary dark:text-white truncate group-hover:text-indigo-600 transition-colors">{m.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{m.resource_type} · {m.uploader_name}</p>
                  </div>
                  <Download size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-4xl mx-auto w-full">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="font-bold text-3xl mb-6">{activeLesson?.title}</h1>
            <div className="min-h-[400px]">
              <BlockRenderer content={activeLesson?.content || ''} />
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={isFirst}
              onClick={goToPrev}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-600 disabled:opacity-40 transition-all"
            >
              <ArrowLeft size={16} /> Previous
            </button>
            <button
              disabled={isLast}
              onClick={() => { handleCompleteLesson(); goToNext(); }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-lg disabled:opacity-40 transition-all"
            >
              Complete & Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseView;
