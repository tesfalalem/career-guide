import React, { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Trash2, Loader2, Save, BookOpen,
  ChevronDown, ChevronUp, Type, Link2,
  Image, Video, FileText, GripVertical
} from 'lucide-react';
import RichTextEditor from '../../common/RichTextEditor';

const SYSTEM_CATEGORIES = [
  'Full-Stack Development',
  'Frontend Web Development',
  'Backend Development',
  'Mobile App Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Cloud Computing',
  'Cybersecurity',
  'Data Science',
  'UI/UX Design',
  'DevOps Engineering',
  'Software Engineering',
  'Database Management',
  'Computer Networking',
  'API Development',
  'Blockchain Development',
  'Internet of Things (IoT)',
  'Game Development',
  'Embedded Systems',
  'System Administration',
  'Other'
];

const API = 'http://localhost/backup/careerguide/backend/api';
const token = () => localStorage.getItem('auth_token') || '';

// ── Types ─────────────────────────────────────────────────────────────────────
type BlockType = 'text' | 'link' | 'image' | 'video' | 'file';

interface ContentBlock {
  id: string; type: BlockType;
  text?: string;
  url?: string; label?: string;
  imageUrl?: string; imageCaption?: string;
  videoUrl?: string;
  fileUrl?: string; fileLabel?: string;
}

interface Lesson { title: string; duration: string; blocks: ContentBlock[]; }
interface Module  { title: string; lessons: Lesson[]; expanded: boolean; }

interface Course {
  id: number; title: string; description: string;
  category: string; level: string; duration: string;
  modules: any[];
}

interface Props {
  isOpen: boolean;
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const emptyBlock = (type: BlockType): ContentBlock => ({ id: uid(), type });
const emptyLesson = (): Lesson => ({ title: '', duration: '', blocks: [emptyBlock('text')] });
const emptyModule = (): Module => ({ title: '', lessons: [emptyLesson()], expanded: true });

const BLOCK_META: Record<BlockType, { icon: React.ReactNode; label: string; color: string }> = {
  text:  { icon: <Type size={13}/>,     label: 'Text',     color: 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700' },
  link:  { icon: <Link2 size={13}/>,    label: 'Link',     color: 'border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400' },
  image: { icon: <Image size={13}/>,    label: 'Image',    color: 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400' },
  video: { icon: <Video size={13}/>,    label: 'Video',    color: 'border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400' },
  file:  { icon: <FileText size={13}/>, label: 'Document', color: 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400' },
};

// Parse stored content (JSON block array or plain string) into blocks
function parseContent(raw: string): ContentBlock[] {
  if (!raw || raw === '[CONTENT_PENDING]') return [emptyBlock('text')];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(b => ({ ...b, id: b.id || uid() }));
    }
  } catch {}
  // Plain text / HTML — wrap in a text block
  return [{ id: uid(), type: 'text', text: raw }];
}

// Serialize blocks back to JSON string
function serializeBlocks(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks.map(({ ...b }) => b));
}

// ── Block Editor ──────────────────────────────────────────────────────────────
const BlockEditor: React.FC<{
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ block, onChange, onRemove, canRemove }) => {
  const imgRef  = useRef<HTMLInputElement>(null);
  const vidRef  = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const meta = BLOCK_META[block.type];

  const getYouTubeId = (url: string) =>
    url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] ?? null;

  return (
    <div className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <GripVertical size={13} className="text-slate-300 cursor-grab shrink-0" />
        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
          {meta.icon} {meta.label}
        </span>
        <div className="flex-1" />
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="p-3 space-y-2">
        {block.type === 'text' && (
          <RichTextEditor
            value={block.text ?? ''}
            onChange={html => onChange({ ...block, text: html })}
            placeholder="Write lesson content here..."
            minHeight={140}
          />
        )}

        {block.type === 'link' && (
          <>
            <input type="url" value={block.url ?? ''}
              onChange={e => onChange({ ...block, url: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400/30"
              placeholder="https://example.com" />
            <input type="text" value={block.label ?? ''}
              onChange={e => onChange({ ...block, label: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="Display label (optional)" />
          </>
        )}

        {block.type === 'image' && (
          <>
            {block.imageUrl && (
              <img src={block.imageUrl} alt="preview"
                className="w-full max-h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
            )}
            <input type="url" value={block.imageUrl ?? ''}
              onChange={e => onChange({ ...block, imageUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="Image URL" />
            <input type="text" value={block.imageCaption ?? ''}
              onChange={e => onChange({ ...block, imageCaption: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="Caption (optional)" />
          </>
        )}

        {block.type === 'video' && (
          <>
            {block.videoUrl && getYouTubeId(block.videoUrl) && (
              <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <iframe src={`https://www.youtube.com/embed/${getYouTubeId(block.videoUrl)}`}
                  className="w-full h-full" allowFullScreen title="yt" />
              </div>
            )}
            <input type="url" value={block.videoUrl ?? ''}
              onChange={e => onChange({ ...block, videoUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="YouTube URL or video link" />
          </>
        )}

        {block.type === 'file' && (
          <>
            {block.fileUrl && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <FileText size={18} className="text-orange-500 shrink-0" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 truncate">{block.fileUrl}</span>
              </div>
            )}
            <input type="url" value={block.fileUrl ?? ''}
              onChange={e => onChange({ ...block, fileUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="Document URL" />
            <input type="text" value={block.fileLabel ?? ''}
              onChange={e => onChange({ ...block, fileLabel: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
              placeholder='Label (e.g. "Lecture Notes Week 1")' />
          </>
        )}
      </div>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const EditCourseModal: React.FC<Props> = ({ isOpen, course, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', level: 'Intermediate', duration: ''
  });
  const [modules, setModules] = useState<Module[]>([]);

  const [selectedCat, setSelectedCat] = useState('Full-Stack Development');
  const [customCat, setCustomCat] = useState('');
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelectChange = (val: string) => {
    setSelectedCat(val);
    if (val !== 'Other') {
      setForm(p => ({ ...p, category: val }));
    } else {
      setForm(p => ({ ...p, category: customCat }));
    }
  };

  const handleCustomCategoryChange = (val: string) => {
    setCustomCat(val);
    setForm(p => ({ ...p, category: val }));
  };

  // Populate form when course changes
  useEffect(() => {
    if (!course) return;
    const cat = course.category || 'Full-Stack Development';
    const isPredefined = SYSTEM_CATEGORIES.includes(cat);
    if (isPredefined && cat !== 'Other') {
      setSelectedCat(cat);
      setCustomCat('');
    } else {
      setSelectedCat('Other');
      setCustomCat(cat);
    }

    setForm({
      title: course.title || '',
      description: course.description || '',
      category: cat,
      level: course.level || 'Intermediate',
      duration: course.duration || '',
    });

    // Convert stored modules → editable Module[] with blocks
    const rawModules: any[] = Array.isArray(course.modules) ? course.modules : [];
    setModules(rawModules.map(m => ({
      title: m.title || '',
      expanded: false,
      lessons: (m.lessons || []).map((l: any) => ({
        title: l.title || '',
        duration: l.duration || '',
        blocks: parseContent(l.content || ''),
      })),
    })));
  }, [course]);

  if (!isOpen) return null;

  // ── Module helpers ──────────────────────────────────────────────────────────
  const updMod = (mi: number, f: keyof Module, v: any) =>
    setModules(p => p.map((m, i) => i === mi ? { ...m, [f]: v } : m));
  const addMod = () => setModules(p => [...p, emptyModule()]);
  const delMod = (mi: number) => setModules(p => p.filter((_, i) => i !== mi));

  // ── Lesson helpers ──────────────────────────────────────────────────────────
  const updLes = (mi: number, li: number, f: keyof Lesson, v: any) =>
    setModules(p => p.map((m, i) => i !== mi ? m : {
      ...m, lessons: m.lessons.map((l, j) => j === li ? { ...l, [f]: v } : l)
    }));
  const addLes = (mi: number) =>
    setModules(p => p.map((m, i) => i !== mi ? m : { ...m, lessons: [...m.lessons, emptyLesson()] }));
  const delLes = (mi: number, li: number) =>
    setModules(p => p.map((m, i) => i !== mi ? m : { ...m, lessons: m.lessons.filter((_, j) => j !== li) }));

  // ── Block helpers ───────────────────────────────────────────────────────────
  const addBlk = (mi: number, li: number, type: BlockType) =>
    setModules(p => p.map((m, i) => i !== mi ? m : {
      ...m, lessons: m.lessons.map((l, j) => j !== li ? l : { ...l, blocks: [...l.blocks, emptyBlock(type)] })
    }));
  const updBlk = (mi: number, li: number, bi: number, blk: ContentBlock) =>
    setModules(p => p.map((m, i) => i !== mi ? m : {
      ...m, lessons: m.lessons.map((l, j) => j !== li ? l : {
        ...l, blocks: l.blocks.map((b, k) => k === bi ? blk : b)
      })
    }));
  const delBlk = (mi: number, li: number, bi: number) =>
    setModules(p => p.map((m, i) => i !== mi ? m : {
      ...m, lessons: m.lessons.map((l, j) => j !== li ? l : { ...l, blocks: l.blocks.filter((_, k) => k !== bi) })
    }));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Course title is required'); return; }
    if (modules.some(m => !m.title.trim())) { alert('All modules need a title'); return; }

    setLoading(true);
    try {
      const serializedModules = modules.map(({ title, lessons }) => ({
        title,
        lessons: lessons.filter(l => l.title.trim()).map(({ title, duration, blocks }) => ({
          title,
          duration,
          content: serializeBlocks(blocks),
        })),
      }));

      const res = await fetch(`${API}/bit/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({ ...form, modules: serializedModules }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
              <BookOpen size={22} className="text-careermap-teal" /> Edit Course
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes are reflected immediately for all enrolled students.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-8">

            {/* ── Course Details ── */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Course Details
              </h4>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/20"
                  placeholder="Course title"
                />
              </div>

              <div className="relative" ref={categoryDropdownRef}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all font-semibold"
                >
                  <span>{selectedCat}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto py-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                    {SYSTEM_CATEGORIES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          handleCategorySelectChange(c);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center justify-between ${
                          selectedCat === c ? 'text-careermap-teal font-bold bg-slate-50/50 dark:bg-slate-750/30' : 'text-slate-700 dark:text-slate-350'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Category Input if "Other" is selected */}
              {selectedCat === 'Other' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Custom Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCat}
                    onChange={e => handleCustomCategoryChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/20"
                    placeholder="Enter custom category manually"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Level</label>
                  <select
                    value={form.level}
                    onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none cursor-pointer"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none"
                    placeholder="e.g. 40 Hours"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/20 resize-none"
                  placeholder="What will students learn?"
                />
              </div>
            </section>

            {/* ── Modules & Lessons ── */}
            <section>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Modules & Lessons
                </h4>
                <button
                  type="button"
                  onClick={addMod}
                  className="flex items-center gap-2 px-4 py-2 bg-careermap-navy/10 text-careermap-teal rounded-lg font-semibold hover:bg-careermap-navy/20 transition-all text-sm"
                >
                  <Plus size={15} /> Add Module
                </button>
              </div>

              <div className="space-y-5">
                {modules.map((mod, mi) => (
                  <div key={mi} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">

                    {/* Module header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => updMod(mi, 'expanded', !mod.expanded)}
                        className="text-slate-400 hover:text-careermap-teal transition-colors"
                      >
                        {mod.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <input
                        type="text"
                        value={mod.title}
                        onChange={e => updMod(mi, 'title', e.target.value)}
                        className="flex-1 bg-transparent text-primary dark:text-white font-bold outline-none placeholder:text-slate-400"
                        placeholder={`Module ${mi + 1} title *`}
                      />
                      <span className="text-xs text-slate-400 shrink-0">
                        {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                      </span>
                      {modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => delMod(mi)}
                          className="p-1 text-red-400 hover:text-red-600 rounded transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {/* Lessons */}
                    {mod.expanded && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {mod.lessons.map((lesson, li) => (
                          <div key={li} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">

                            {/* Lesson header */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-xs font-bold text-slate-400 w-16 shrink-0">Lesson {li + 1}</span>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={e => updLes(mi, li, 'title', e.target.value)}
                                className="flex-1 bg-transparent text-sm font-semibold text-primary dark:text-white outline-none placeholder:text-slate-400"
                                placeholder="Lesson title"
                              />
                              <input
                                type="text"
                                value={lesson.duration}
                                onChange={e => updLes(mi, li, 'duration', e.target.value)}
                                className="w-24 bg-transparent text-xs text-slate-400 outline-none placeholder:text-slate-400 text-right"
                                placeholder="Duration"
                              />
                              {mod.lessons.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => delLes(mi, li)}
                                  className="p-1 text-red-400 hover:text-red-600 transition-colors shrink-0"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            {/* Content blocks */}
                            <div className="p-4 space-y-3 bg-slate-50/40 dark:bg-slate-800/20">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lesson Content</p>

                              {lesson.blocks.map((block, bi) => (
                                <BlockEditor
                                  key={block.id}
                                  block={block}
                                  onChange={b => updBlk(mi, li, bi, b)}
                                  onRemove={() => delBlk(mi, li, bi)}
                                  canRemove={lesson.blocks.length > 1}
                                />
                              ))}

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-xs text-slate-400 font-semibold">+ Add block:</span>
                                {(Object.keys(BLOCK_META) as BlockType[]).map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => addBlk(mi, li, type)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:scale-105 ${BLOCK_META[type].color}`}
                                  >
                                    {BLOCK_META[type].icon} {BLOCK_META[type].label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addLes(mi)}
                          className="flex items-center gap-1 text-xs text-careermap-teal font-bold hover:underline"
                        >
                          <Plus size={13} /> Add Lesson
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Scroll spacer to give plenty of viewport space below select elements */}
            <div className="h-32" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-400">
              Student enrollments and progress are preserved on save.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-careermap-teal text-white rounded-xl font-bold text-sm hover:bg-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
