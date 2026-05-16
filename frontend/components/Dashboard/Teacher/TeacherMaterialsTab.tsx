import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Edit2, FileText, Link2, Video,
  BookOpen, X, Loader2, CheckCircle, Upload,
  StickyNote, ChevronDown, ChevronRight, FolderOpen
} from 'lucide-react';
import RichTextEditor from '../../common/RichTextEditor';
import ConfirmModal from '../../common/ConfirmModal';

const API = 'http://localhost/careerguide/backend/api';
const token = () => localStorage.getItem('auth_token') || '';

interface Material {
  id: number;
  title: string;
  description: string;
  resource_type: string;
  external_url?: string;
  file_path?: string;
  file_url?: string;
  module_name?: string;
  lesson_name?: string;
  notes?: string;
  teacher_name?: string;
  created_at: string;
}

interface Module { title: string; lessons: { title: string }[] }

interface Props {
  courseId: string;
  modules: Module[];
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  document: { icon: <FileText size={15} />, label: 'Document', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  video:    { icon: <Video size={15} />,    label: 'Video',    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  link:     { icon: <Link2 size={15} />,    label: 'Link',     color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  note:     { icon: <StickyNote size={15}/>, label: 'Note',    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  article:  { icon: <BookOpen size={15} />, label: 'Article',  color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' },
  tutorial: { icon: <BookOpen size={15} />, label: 'Tutorial', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
};

const emptyForm = () => ({
  title: '', description: '', resource_type: 'document',
  external_url: '', module_name: '', lesson_name: '', notes: '',
});

const TeacherMaterialsTab: React.FC<Props> = ({ courseId, modules }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['__ungrouped__']));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMaterials(); }, [courseId]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/teacher/courses/${courseId}/materials`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch { setMaterials([]); }
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFile(null);
    setShowForm(true);
  };

  const openEdit = (m: Material) => {
    setEditingId(m.id);
    setForm({
      title: m.title, description: m.description,
      resource_type: m.resource_type, external_url: m.external_url || '',
      module_name: m.module_name || '', lesson_name: m.lesson_name || '',
      notes: m.notes || '',
    });
    setFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    try {
      if (editingId) {
        // Update via JSON
        await fetch(`${API}/teacher/materials/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify(form),
        });
      } else {
        // Create via FormData (supports file upload)
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        if (file) fd.append('file', file);
        await fetch(`${API}/teacher/courses/${courseId}/materials`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}` },
          body: fd,
        });
      }
      setShowForm(false);
      fetchMaterials();
    } catch { alert('Failed to save material'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`${API}/teacher/materials/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      setMaterials(p => p.filter(m => m.id !== deleteId));
    } catch { alert('Failed to delete'); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const toggleGroup = (key: string) => {
    const next = new Set(expandedGroups);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpandedGroups(next);
  };

  // Group materials by module_name
  const grouped = materials.reduce<Record<string, Material[]>>((acc, m) => {
    const key = m.module_name || '__ungrouped__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const typeMeta = (type: string) => TYPE_META[type] || TYPE_META['document'];

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-careermap-teal" size={32} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Course Materials</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Add supplementary content for your students — organized by module or lesson.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-careermap-teal text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
        >
          <Plus size={16} /> Add Material
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-white">
              {editingId ? 'Edit Material' : 'Add New Material'}
            </h4>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Title + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20"
                  placeholder="e.g. Week 3 Lecture Notes"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Type</label>
                <select
                  value={form.resource_type}
                  onChange={e => setForm(p => ({ ...p, resource_type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                >
                  <option value="document">Document (PDF/PPT)</option>
                  <option value="video">Video</option>
                  <option value="link">External Link</option>
                  <option value="note">Formatted Note</option>
                  <option value="article">Article</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
            </div>

            {/* Module + Lesson */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Module (optional)</label>
                <select
                  value={form.module_name}
                  onChange={e => setForm(p => ({ ...p, module_name: e.target.value, lesson_name: '' }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                >
                  <option value="">— General (no module) —</option>
                  {modules.map((m, i) => (
                    <option key={i} value={m.title}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Lesson (optional)</label>
                <select
                  value={form.lesson_name}
                  onChange={e => setForm(p => ({ ...p, lesson_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                  disabled={!form.module_name}
                >
                  <option value="">— All lessons —</option>
                  {modules.find(m => m.title === form.module_name)?.lessons.map((l, i) => (
                    <option key={i} value={l.title}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20"
                placeholder="Brief description of this material"
              />
            </div>

            {/* File or URL */}
            {form.resource_type !== 'note' && (
              <div className="grid grid-cols-2 gap-4">
                {!editingId && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Upload File</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-careermap-teal transition-all"
                    >
                      <Upload size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-500 truncate">
                        {file ? file.name : 'Click to upload PDF, PPT, video...'}
                      </span>
                    </div>
                    <input
                      ref={fileRef} type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.jpg,.png"
                      className="hidden"
                      onChange={e => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {editingId ? 'External URL' : 'Or External URL'}
                  </label>
                  <input
                    type="url"
                    value={form.external_url}
                    onChange={e => setForm(p => ({ ...p, external_url: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* Rich Notes */}
            {form.resource_type === 'note' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Formatted Note</label>
                <RichTextEditor
                  value={form.notes}
                  onChange={html => setForm(p => ({ ...p, notes: html }))}
                  placeholder="Write your note here — use the toolbar to format..."
                  minHeight={200}
                />
              </div>
            )}

            {/* Save */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-careermap-teal text-white rounded-xl font-bold text-sm hover:bg-teal-600 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                {editingId ? 'Update' : 'Save Material'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Materials List — grouped by module */}
      {materials.length === 0 && !showForm ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="font-bold text-slate-500 text-lg">No materials yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add Material" to upload your first resource.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([groupKey, items]) => {
            const label = groupKey === '__ungrouped__' ? 'General Materials' : groupKey;
            const isExpanded = expandedGroups.has(groupKey);
            return (
              <div key={groupKey} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                  <FolderOpen size={16} className="text-careermap-teal" />
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{label}</span>
                  <span className="ml-auto text-xs text-slate-400 font-semibold">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {items.map(m => {
                      const meta = typeMeta(m.resource_type);
                      return (
                        <div key={m.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm text-slate-800 dark:text-white">{m.title}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                              {m.lesson_name && (
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                  {m.lesson_name}
                                </span>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{m.description}</p>
                            )}
                            {m.resource_type === 'note' && m.notes && (
                              <div
                                className="mt-2 text-xs text-slate-600 dark:text-slate-400 rich-content line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: m.notes }}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => openEdit(m)}
                              className="p-1.5 text-careermap-teal hover:bg-careermap-teal/10 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(m.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Material"
        message="Remove this material? Students will no longer see it."
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default TeacherMaterialsTab;
