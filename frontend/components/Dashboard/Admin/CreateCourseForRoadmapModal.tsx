import React, { useState, useRef } from 'react';
import {
  X, Plus, Trash2, Loader2, BookOpen,
  ChevronDown, ChevronUp, Type, Link2,
  Image, Video, FileText, GripVertical, ClipboardCheck
} from 'lucide-react';
import { adminService } from '../../../services/adminService';

// ── Types ─────────────────────────────────────────────────────────────────────
type BlockType = 'text' | 'link' | 'image' | 'video' | 'file';

interface ContentBlock {
  id: string; type: BlockType;
  text?: string;
  url?: string; label?: string;
  imageUrl?: string; imageFile?: File | null; imageCaption?: string;
  videoUrl?: string; videoFile?: File | null;
  fileUrl?: string; fileUpload?: File | null; fileLabel?: string;
}

interface Lesson { title: string; duration: string; blocks: ContentBlock[]; }
interface Module  { title: string; lessons: Lesson[]; expanded: boolean; }

interface Props {
  isOpen: boolean; roadmapId: number; roadmapTitle: string;
  onClose: () => void; onSuccess: () => void;
  /** Override the default adminService.addCourseToRoadmap — used by BiT dashboard */
  addCourseFn?: (roadmapId: number, data: any) => Promise<any>;
}

interface Question {
  question: string;
  options: [string, string, string, string];
  correct_answer: number; // 0-3
  explanation: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const emptyBlock = (type: BlockType): ContentBlock => ({ id: uid(), type });
const emptyLesson = (): Lesson => ({ title: '', duration: '', blocks: [emptyBlock('text')] });
const emptyModule = (): Module => ({ title: '', lessons: [emptyLesson()], expanded: true });

const BLOCK_META: Record<BlockType, { icon: React.ReactNode; label: string; btnCls: string }> = {
  text:  { icon: <Type size={13}/>,     label: 'Text',     btnCls: 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700' },
  link:  { icon: <Link2 size={13}/>,    label: 'Link',     btnCls: 'border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/20' },
  image: { icon: <Image size={13}/>,    label: 'Image',    btnCls: 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20' },
  video: { icon: <Video size={13}/>,    label: 'Video',    btnCls: 'border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20' },
  file:  { icon: <FileText size={13}/>, label: 'Document', btnCls: 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20' },
};

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

async function uploadFile(file: File): Promise<string> {
  const token = localStorage.getItem('auth_token');
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('http://localhost:8000/api/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.url;
}

async function serializeBlocks(blocks: ContentBlock[]): Promise<string> {
  const serialized = await Promise.all(blocks.map(async b => {
    const { imageFile, videoFile, fileUpload, ...rest } = b;
    if (imageFile) {
      try { return { ...rest, imageUrl: await uploadFile(imageFile) }; }
      catch { return { ...rest, imageUrl: `[UPLOAD_FAILED:${imageFile.name}]` }; }
    }
    if (videoFile) {
      try { return { ...rest, videoUrl: await uploadFile(videoFile) }; }
      catch { return { ...rest, videoUrl: `[UPLOAD_FAILED:${videoFile.name}]` }; }
    }
    if (fileUpload) {
      try { return { ...rest, fileUrl: await uploadFile(fileUpload) }; }
      catch { return { ...rest, fileUrl: `[UPLOAD_FAILED:${fileUpload.name}]` }; }
    }
    return rest;
  }));
  return JSON.stringify(serialized);
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

  return (
    <div className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      {/* Block header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <GripVertical size={13} className="text-slate-300 cursor-grab flex-shrink-0" />
        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
          {meta.icon} {meta.label}
        </span>
        <div className="flex-1" />
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Block body */}
      <div className="p-3 space-y-2">

        {/* TEXT */}
        {block.type === 'text' && (
          <textarea
            value={block.text ?? ''}
            onChange={e => onChange({ ...block, text: e.target.value })}
            rows={5}
            className="w-full bg-transparent text-sm text-primary dark:text-white outline-none resize-y placeholder:text-slate-400 leading-relaxed"
            placeholder="Write lesson content here — plain text or Markdown supported..."
          />
        )}

        {/* LINK */}
        {block.type === 'link' && (
          <>
            <input type="url" value={block.url ?? ''}
              onChange={e => onChange({ ...block, url: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-primary dark:text-white outline-none focus:ring-2 focus:ring-teal-400/30"
              placeholder="https://example.com" />
            <input type="text" value={block.label ?? ''}
              onChange={e => onChange({ ...block, label: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-primary dark:text-white outline-none"
              placeholder="Display label (optional)" />
          </>
        )}

        {/* IMAGE */}
        {block.type === 'image' && (
          <>
            {(block.imageUrl || block.imageFile) && (
              <img
                src={block.imageFile ? URL.createObjectURL(block.imageFile) : block.imageUrl}
                alt="preview"
                className="w-full max-h-52 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
              />
            )}
            <div className="flex gap-2">
              <input type="url" value={block.imageUrl ?? ''}
                onChange={e => onChange({ ...block, imageUrl: e.target.value, imageFile: null })}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-primary dark:text-white outline-none focus:ring-2 focus:ring-green-400/30"
                placeholder="Image URL (optional)" />
              <button type="button" onClick={() => imgRef.current?.click()}
                className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-all whitespace-nowrap">
                Upload
              </button>
              <input ref={imgRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0] ?? null; onChange({ ...block, imageFile: f, imageUrl: '' }); }} />
            </div>
            <input type="text" value={block.imageCaption ?? ''}
              onChange={e => onChange({ ...block, imageCaption: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-primary dark:text-white outline-none"
              placeholder="Caption (optional)" />
          </>
        )}

        {/* VIDEO */}
        {block.type === 'video' && (
          <>
            {block.videoUrl && getYouTubeId(block.videoUrl) && (
              <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <iframe src={`https://www.youtube.com/embed/${getYouTubeId(block.videoUrl)}`}
                  className="w-full h-full" allowFullScreen title="yt-preview" />
              </div>
            )}
            {block.videoFile && (
              <video src={URL.createObjectURL(block.videoFile)} controls
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 max-h-52" />
            )}
            <div className="flex gap-2">
              <input type="url" value={block.videoUrl ?? ''}
                onChange={e => onChange({ ...block, videoUrl: e.target.value, videoFile: null })}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-primary dark:text-white outline-none focus:ring-2 focus:ring-purple-400/30"
                placeholder="YouTube URL or video link (optional)" />
              <button type="button" onClick={() => vidRef.current?.click()}
                className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-all whitespace-nowrap">
                Upload
              </button>
              <input ref={vidRef} type="file" accept="video/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0] ?? null; onChange({ ...block, videoFile: f, videoUrl: '' }); }} />
            </div>
          </>
        )}

        {/* FILE / DOCUMENT */}
        {block.type === 'file' && (
          <>
            {(block.fileUpload || block.fileUrl) && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <FileText size={20} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 truncate flex-1">
                  {block.fileUpload ? block.fileUpload.name : block.fileUrl}
                </span>
                {block.fileUrl && (
                  <a href={block.fileUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-orange-600 underline whitespace-nowrap">Preview</a>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <input type="url" value={block.fileUrl ?? ''}
                onChange={e => onChange({ ...block, fileUrl: e.target.value, fileUpload: null })}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-primary dark:text-white outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="Document URL (optional)" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 transition-all whitespace-nowrap">
                Upload
              </button>
              <input ref={fileRef} type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0] ?? null; onChange({ ...block, fileUpload: f, fileUrl: '' }); }} />
            </div>
            <input type="text" value={block.fileLabel ?? ''}
              onChange={e => onChange({ ...block, fileLabel: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-primary dark:text-white outline-none"
              placeholder='Display label (optional, e.g. "Lecture Notes Week 1")' />
          </>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CreateCourseForRoadmapModal: React.FC<Props> = ({
  isOpen, roadmapId, roadmapTitle, onClose, onSuccess, addCourseFn,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'questions'>('content');
  const [form, setForm] = useState({ title: '', description: '', level: 'Intermediate', duration: '' });
  const [modules, setModules] = useState<Module[]>([emptyModule()]);
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }
  ]);

  if (!isOpen) return null;

  const addQuestion = () => setQuestions(p => [...p, { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]);
  const removeQuestion = (i: number) => setQuestions(p => p.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, field: keyof Question, value: any) =>
    setQuestions(p => p.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  const updateOption = (qi: number, oi: number, value: string) =>
    setQuestions(p => p.map((q, idx) => idx !== qi ? q : {
      ...q, options: q.options.map((o, j) => j === oi ? value : o) as [string,string,string,string]
    }));

  // module helpers
  const updMod = (mi: number, f: keyof Module, v: any) =>
    setModules(p => p.map((m, i) => i === mi ? { ...m, [f]: v } : m));
  const addMod = () => setModules(p => [...p, emptyModule()]);
  const delMod = (mi: number) => setModules(p => p.filter((_, i) => i !== mi));

  // lesson helpers
  const updLes = (mi: number, li: number, f: keyof Lesson, v: any) =>
    setModules(p => p.map((m, i) => i !== mi ? m : {
      ...m, lessons: m.lessons.map((l, j) => j === li ? { ...l, [f]: v } : l)
    }));
  const addLes = (mi: number) =>
    setModules(p => p.map((m, i) => i !== mi ? m : { ...m, lessons: [...m.lessons, emptyLesson()] }));
  const delLes = (mi: number, li: number) =>
    setModules(p => p.map((m, i) => i !== mi ? m : { ...m, lessons: m.lessons.filter((_, j) => j !== li) }));

  // block helpers
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Please enter a course title'); return; }
    if (modules.some(m => !m.title.trim())) { alert('All modules need a title'); return; }
    setLoading(true);
    try {
      const caller = addCourseFn ?? ((id: number, data: any) => adminService.addCourseToRoadmap(id, data));

      // Serialize all modules with file uploads
      const serializedModules = await Promise.all(
        modules.map(async ({ title, lessons }) => ({
          title,
          lessons: await Promise.all(
            lessons.filter(l => l.title.trim()).map(async ({ title, duration, blocks }) => ({
              title,
              duration,
              content: await serializeBlocks(blocks),
            }))
          ),
        }))
      );

      const result = await caller(roadmapId, { ...form, modules: serializedModules });

      // Save assessment questions if any are filled
      const validQuestions = questions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
      if (validQuestions.length > 0 && result?.course_id) {
        const token = localStorage.getItem('auth_token');
        await fetch('http://localhost:8000/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            course_id: result.course_id,
            title: `${form.title} Assessment`,
            description: `Assessment for ${form.title}`,
            time_limit: 30,
            questions: validQuestions
          })
        });
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
              <BookOpen size={22} className="text-careermap-teal" /> Add Course to Roadmap
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Roadmap: <span className="font-semibold text-careermap-teal">{roadmapTitle}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 flex-shrink-0">
            <button type="button" onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'content' ? 'border-careermap-teal text-careermap-teal' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <BookOpen size={16} /> Course Content
            </button>
            <button type="button" onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'questions' ? 'border-careermap-teal text-careermap-teal' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <ClipboardCheck size={16} /> Assessment Questions
              {questions.filter(q => q.question.trim()).length > 0 && (
                <span className="bg-careermap-teal text-white text-xs px-1.5 py-0.5 rounded-full">
                  {questions.filter(q => q.question.trim()).length}
                </span>
              )}
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-8">
            {activeTab === 'content' ? (<>

            {/* Course Details */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Course Details</h4>
              <input type="text" value={form.title} required
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                placeholder="Course description (optional)" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
                <input type="text" value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none"
                  placeholder="Duration (e.g. 20 Hours)" />
              </div>
            </section>

            {/* Modules & Lessons */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Modules & Lessons</h4>
                <button type="button" onClick={addMod}
                  className="flex items-center gap-2 px-4 py-2 bg-careermap-navy/10 text-careermap-teal rounded-lg font-semibold hover:bg-careermap-navy/20 transition-all text-sm">
                  <Plus size={15} /> Add Module
                </button>
              </div>

              <div className="space-y-5">
                {modules.map((mod, mi) => (
                  <div key={mi} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">

                    {/* Module header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800">
                      <button type="button" onClick={() => updMod(mi, 'expanded', !mod.expanded)}
                        className="text-slate-400 hover:text-careermap-teal transition-colors">
                        {mod.expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                      </button>
                      <input type="text" value={mod.title} required
                        onChange={e => updMod(mi, 'title', e.target.value)}
                        className="flex-1 bg-transparent text-primary dark:text-white font-bold outline-none placeholder:text-slate-400"
                        placeholder={`Module ${mi + 1} title *`} />
                      <span className="text-xs text-slate-400">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}</span>
                      {modules.length > 1 && (
                        <button type="button" onClick={() => delMod(mi)}
                          className="p-1 text-red-400 hover:text-red-600 rounded transition-all">
                          <Trash2 size={15}/>
                        </button>
                      )}
                    </div>

                    {/* Lessons */}
                    {mod.expanded && (
                      <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        {mod.lessons.map((lesson, li) => (
                          <div key={li} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">

                            {/* Lesson title row */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-xs font-bold text-slate-400 w-16 flex-shrink-0">Lesson {li + 1}</span>
                              <input type="text" value={lesson.title}
                                onChange={e => updLes(mi, li, 'title', e.target.value)}
                                className="flex-1 bg-transparent text-sm font-semibold text-primary dark:text-white outline-none placeholder:text-slate-400"
                                placeholder="Lesson title" />
                              <input type="text" value={lesson.duration}
                                onChange={e => updLes(mi, li, 'duration', e.target.value)}
                                className="w-24 bg-transparent text-xs text-slate-400 outline-none placeholder:text-slate-400 text-right"
                                placeholder="Duration" />
                              {mod.lessons.length > 1 && (
                                <button type="button" onClick={() => delLes(mi, li)}
                                  className="p-1 text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                                  <Trash2 size={13}/>
                                </button>
                              )}
                            </div>

                            {/* Content blocks — always visible */}
                            <div className="p-4 space-y-3 bg-slate-50/40 dark:bg-slate-800/20">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lesson Content</p>

                              {lesson.blocks.map((block, bi) => (
                                <BlockEditor key={block.id} block={block}
                                  onChange={b => updBlk(mi, li, bi, b)}
                                  onRemove={() => delBlk(mi, li, bi)}
                                  canRemove={lesson.blocks.length > 1} />
                              ))}

                              {/* Add block buttons */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-xs text-slate-400 font-semibold">+ Add block:</span>
                                {(Object.keys(BLOCK_META) as BlockType[]).map(type => (
                                  <button key={type} type="button" onClick={() => addBlk(mi, li, type)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:scale-105 ${BLOCK_META[type].btnCls}`}>
                                    {BLOCK_META[type].icon} {BLOCK_META[type].label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}

                        <button type="button" onClick={() => addLes(mi)}
                          className="flex items-center gap-1 text-xs text-careermap-teal font-bold hover:underline">
                          <Plus size={13}/> Add Lesson
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            </>) : (
            /* ── Questions Tab ── */
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Assessment Questions</h4>
                  <p className="text-xs text-slate-400 mt-1">Add multiple choice questions. Students will see these in the Assessments page.</p>
                </div>
                <button type="button" onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-careermap-navy/10 text-careermap-teal rounded-lg font-semibold hover:bg-careermap-navy/20 transition-all text-sm">
                  <Plus size={15} /> Add Question
                </button>
              </div>

              {questions.map((q, qi) => (
                <div key={qi} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-slate-400 mt-1 shrink-0">Q{qi + 1}</span>
                    <textarea
                      value={q.question}
                      onChange={e => updateQuestion(qi, 'question', e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 text-sm resize-none"
                      placeholder="Enter your question..."
                    />
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${q.correct_answer === oi ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                        <button type="button" onClick={() => updateQuestion(qi, 'correct_answer', oi)}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${q.correct_answer === oi ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                          {q.correct_answer === oi && <div className="w-full h-full rounded-full bg-white scale-50" />}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          className="flex-1 bg-transparent text-sm text-primary dark:text-white outline-none placeholder:text-slate-400"
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 pl-6">Click the circle next to the correct answer</p>

                  <div className="pl-6">
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm"
                      placeholder="Explanation (shown after answering — optional)"
                    />
                  </div>
                </div>
              ))}
            </section>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all disabled:opacity-50">
              {loading ? <><Loader2 className="animate-spin" size={18}/> Saving...</> : <><BookOpen size={18}/> Create & Assign to Students</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseForRoadmapModal;
