import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Loader2, X, Save, Tag, Briefcase, CheckCircle, AlertCircle,
  Code2, Database, Shield, Cloud, Smartphone, Palette,
  Network, Server, GraduationCap
} from 'lucide-react';
import { apiClient } from '../../../services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Career {
  id: number;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  status: 'draft' | 'published';
  creator_name?: string;
  created_at: string;
}

const CATEGORIES = [
  'Software Engineering', 'Data Science & AI', 'Cybersecurity',
  'Cloud & DevOps', 'Mobile Development', 'UI/UX Design',
  'Network Engineering', 'Database Administration', 'General',
];

// ── Category → icon + gradient (shared with student view) ────────────────────

const CATEGORY_STYLE: Record<string, { icon: React.ReactNode; gradient: string; light: string }> = {
  'Software Engineering':    { icon: <Code2 size={20} />,        gradient: 'from-[#1e3a5f] to-[#0d9488]', light: 'bg-teal-50 text-teal-700' },
  'Data Science & AI':       { icon: <Database size={20} />,     gradient: 'from-[#312e81] to-[#6d28d9]', light: 'bg-violet-50 text-violet-700' },
  'Cybersecurity':           { icon: <Shield size={20} />,       gradient: 'from-[#7f1d1d] to-[#dc2626]', light: 'bg-red-50 text-red-700' },
  'Cloud & DevOps':          { icon: <Cloud size={20} />,        gradient: 'from-[#0c4a6e] to-[#0284c7]', light: 'bg-sky-50 text-sky-700' },
  'Mobile Development':      { icon: <Smartphone size={20} />,   gradient: 'from-[#064e3b] to-[#059669]', light: 'bg-emerald-50 text-emerald-700' },
  'UI/UX Design':            { icon: <Palette size={20} />,      gradient: 'from-[#831843] to-[#db2777]', light: 'bg-pink-50 text-pink-700' },
  'Network Engineering':     { icon: <Network size={20} />,      gradient: 'from-[#1c1917] to-[#78716c]', light: 'bg-stone-50 text-stone-700' },
  'Database Administration': { icon: <Server size={20} />,       gradient: 'from-[#1e3a5f] to-[#2563eb]', light: 'bg-blue-50 text-blue-700' },
  'General':                 { icon: <GraduationCap size={20} />, gradient: 'from-[#1e3a5f] to-[#0d9488]', light: 'bg-teal-50 text-teal-700' },
};

const getCategoryStyle = (cat: string) =>
  CATEGORY_STYLE[cat] ?? { icon: <Briefcase size={20} />, gradient: 'from-[#1e3a5f] to-[#0d9488]', light: 'bg-teal-50 text-teal-700' };

// ── Career Form Modal ─────────────────────────────────────────────────────────

interface FormModalProps {
  career: Career | null;
  onClose: () => void;
  onSaved: () => void;
}

const CareerFormModal: React.FC<FormModalProps> = ({ career, onClose, onSaved }) => {
  const isEdit = !!career;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const skillRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: career?.title ?? '',
    description: career?.description ?? '',
    category: career?.category ?? 'General',
    required_skills: career?.required_skills ?? [] as string[],
    status: career?.status ?? 'published' as 'draft' | 'published',
  });

  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.required_skills.includes(s)) {
      set('required_skills', [...form.required_skills, s]);
    }
    setSkillInput('');
    skillRef.current?.focus();
  };

  const removeSkill = (s: string) =>
    set('required_skills', form.required_skills.filter(x => x !== s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await apiClient.updateCareer(career!.id, form);
      } else {
        await apiClient.createCareer(form);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const previewStyle = getCategoryStyle(form.category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${previewStyle.gradient} flex items-center justify-center text-white`}>
              {previewStyle.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Edit Career' : 'New Career'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Update career details' : 'Create a new career listing'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-5">

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-900/30">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/30 text-sm"
                placeholder="e.g. Full Stack Developer"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/30 text-sm resize-none"
                placeholder="Describe what this career involves, responsibilities, and opportunities..."
              />
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none text-sm"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value as 'draft' | 'published')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Category icon preview */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${previewStyle.gradient} flex items-center justify-center text-white shrink-0`}>
                {previewStyle.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Card Preview Icon</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {form.category} — icon auto-assigned
                </p>
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                <Tag size={12} className="inline mr-1" /> Required Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  ref={skillRef}
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none text-sm"
                  placeholder="Type a skill and press Enter or Add"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2.5 bg-careermap-teal/10 text-careermap-teal rounded-xl font-bold text-sm hover:bg-careermap-teal/20 transition-all"
                >
                  Add
                </button>
              </div>
              {form.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.required_skills.map(s => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-careermap-navy/5 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-careermap-teal text-white rounded-xl font-bold text-sm hover:bg-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Career'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Career Detail Modal (admin preview) ──────────────────────────────────────

const CareerDetailModal: React.FC<{ career: Career; onClose: () => void }> = ({ career, onClose }) => {
  const style = getCategoryStyle(career.category);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className={`relative h-36 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10 text-white/90">{style.icon}</div>
          <div className="absolute bottom-3 left-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
              {career.category}
            </span>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 mb-3">{career.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">{career.description}</p>
          {career.required_skills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {career.required_skills.map(s => (
                  <span key={s} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${style.light}`}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────

const BiTCareersView: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editCareer, setEditCareer] = useState<Career | null>(null);
  const [viewCareer, setViewCareer] = useState<Career | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBitCareers({
        search,
        category: filterCategory !== 'all' ? filterCategory : '',
        status: filterStatus !== 'all' ? filterStatus : '',
      });
      setCareers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast('Failed to load careers: ' + (err.message || 'Unknown error'));
      setCareers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, filterStatus, filterCategory]);

  const handleDelete = async (career: Career) => {
    if (!window.confirm(`Delete "${career.title}"? This cannot be undone.`)) return;
    setActionLoading(career.id);
    try {
      await apiClient.deleteCareer(career.id);
      toast('Career deleted');
      load();
    } catch (err: any) {
      toast(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (career: Career) => {
    setActionLoading(career.id);
    try {
      if (career.status === 'published') {
        await apiClient.unpublishCareer(career.id);
        toast(`"${career.title}" moved to draft`);
      } else {
        await apiClient.publishCareer(career.id);
        toast(`"${career.title}" published`);
      }
      load();
    } catch (err: any) {
      toast(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const allCategories = ['all', ...Array.from(new Set(careers.map(c => c.category)))];
  const published = careers.filter(c => c.status === 'published').length;
  const drafts = careers.filter(c => c.status === 'draft').length;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle size={16} className="text-careermap-teal" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Careers Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {published} published · {drafts} draft
          </p>
        </div>
        <button
          onClick={() => { setEditCareer(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-careermap-teal text-white rounded-xl font-bold text-sm hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
        >
          <Plus size={18} /> New Career
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search careers..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/30 text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none text-sm font-medium"
        >
          {allCategories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-careermap-teal" />
        </div>
      ) : careers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Briefcase size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-bold text-slate-500 dark:text-slate-400">No careers found</p>
          <p className="text-sm text-slate-400 mt-1">Create your first career listing to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Career</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {careers.map(career => {
                  const style = getCategoryStyle(career.category);
                  return (
                    <tr key={career.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Category icon instead of thumbnail */}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shrink-0`}>
                            {style.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{career.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{career.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${style.light}`}>
                          {career.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {career.required_skills.slice(0, 3).map(s => (
                            <span key={s} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${style.light}`}>{s}</span>
                          ))}
                          {career.required_skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold">
                              +{career.required_skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          career.status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${career.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {career.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewCareer(career)} className="p-2 rounded-lg text-slate-400 hover:text-careermap-teal hover:bg-careermap-teal/10 transition-all" title="Preview">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => { setEditCareer(career); setShowForm(true); }} className="p-2 rounded-lg text-slate-400 hover:text-careermap-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(career)}
                            disabled={actionLoading === career.id}
                            className={`p-2 rounded-lg transition-all ${career.status === 'published' ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                            title={career.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {actionLoading === career.id ? <Loader2 size={16} className="animate-spin" /> : career.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button onClick={() => handleDelete(career)} disabled={actionLoading === career.id} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <CareerFormModal
          career={editCareer}
          onClose={() => { setShowForm(false); setEditCareer(null); }}
          onSaved={() => { setShowForm(false); setEditCareer(null); load(); toast(editCareer ? 'Career updated' : 'Career created'); }}
        />
      )}
      {viewCareer && (
        <CareerDetailModal career={viewCareer} onClose={() => setViewCareer(null)} />
      )}
    </div>
  );
};

export default BiTCareersView;
