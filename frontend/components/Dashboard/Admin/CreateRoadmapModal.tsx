import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';
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

interface Phase {
  title: string;
  description: string;
  duration: string;
  resources: string[];
}

type LevelKey = 'beginner' | 'medium' | 'advanced';

const LEVELS: { key: LevelKey; label: string; color: string; bg: string }[] = [
  { key: 'beginner', label: 'Beginner',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' },
  { key: 'medium',   label: 'Medium',    color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' },
  { key: 'advanced', label: 'Advanced',  color: 'text-red-600',     bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' },
];

const emptyPhase = (): Phase => ({ title: '', description: '', duration: '', resources: [] });

interface CreateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  createFn?: (data: any) => Promise<any>;
}

const CreateRoadmapModal: React.FC<CreateRoadmapModalProps> = ({ isOpen, onClose, onSuccess, createFn }) => {
  const [loading, setLoading] = useState(false);
  const [activeLevel, setActiveLevel] = useState<LevelKey>('beginner');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Full-Stack Development',
    estimated_duration: '',
    status: 'published',
    tags: '',
  });

  const [selectedCat, setSelectedCat] = useState('Full-Stack Development');
  const [customCat, setCustomCat] = useState('');

  const handleCategorySelectChange = (val: string) => {
    setSelectedCat(val);
    if (val !== 'Other') {
      setFormData(p => ({ ...p, category: val }));
    } else {
      setFormData(p => ({ ...p, category: customCat }));
    }
  };

  const handleCustomCategoryChange = (val: string) => {
    setCustomCat(val);
    setFormData(p => ({ ...p, category: val }));
  };

  // Each level has its own phases array
  const [levelPhases, setLevelPhases] = useState<Record<LevelKey, Phase[]>>({
    beginner: [emptyPhase()],
    medium:   [emptyPhase()],
    advanced: [emptyPhase()],
  });

  if (!isOpen) return null;

  const addPhase = (level: LevelKey) =>
    setLevelPhases(p => ({ ...p, [level]: [...p[level], emptyPhase()] }));

  const removePhase = (level: LevelKey, idx: number) =>
    setLevelPhases(p => ({ ...p, [level]: p[level].filter((_, i) => i !== idx) }));

  const updatePhase = (level: LevelKey, idx: number, field: keyof Phase, value: string) =>
    setLevelPhases(p => {
      const arr = [...p[level]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...p, [level]: arr };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { alert('Please enter a roadmap title'); return; }

    // Build multi-level phases structure
    const levels = LEVELS.map(({ key, label }) => ({
      level: key,
      label,
      phases: levelPhases[key].filter(p => p.title.trim()),
    }));

    if (levels.every(l => l.phases.length === 0)) {
      alert('Please add at least one phase in any level');
      return;
    }

    setLoading(true);
    try {
      const roadmapData = {
        ...formData,
        difficulty_level: 'all',   // signals multi-level roadmap
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        phases: levels,             // stored as [{level, label, phases:[...]}, ...]
      };
      const creator = createFn ?? adminService.createRoadmap.bind(adminService);
      await creator(roadmapData);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to create roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-primary dark:text-white">Create Roadmap</h3>
            <p className="text-xs text-slate-400 mt-0.5">One roadmap · three sequential levels</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-6">

            {/* Basic info */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                Roadmap Details
              </h4>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/20 text-sm"
                  placeholder="e.g., Full Stack Web Development"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select
                    value={selectedCat}
                    onChange={e => handleCategorySelectChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm"
                  >
                    {SYSTEM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={formData.estimated_duration}
                    onChange={e => setFormData(p => ({ ...p, estimated_duration: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm"
                    placeholder="e.g., 9 months"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Custom Category Input if "Other" is selected */}
              {selectedCat === 'Other' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCat}
                    onChange={e => handleCustomCategoryChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/20 text-sm"
                    placeholder="Enter custom category manually"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/20 text-sm resize-none"
                  placeholder="Describe what students will learn across all levels..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white outline-none text-sm"
                  placeholder="e.g., web, fullstack, javascript"
                />
              </div>
            </section>

            {/* Level tabs */}
            <section>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                Level Phases
              </h4>

              {/* Tab switcher */}
              <div className="flex gap-2 mb-5">
                {LEVELS.map(({ key, label, color, bg }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveLevel(key)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                      activeLevel === key
                        ? `${bg} ${color} shadow-sm`
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                    }`}
                  >
                    {label}
                    <span className="ml-1.5 opacity-60">({levelPhases[key].filter(p => p.title.trim()).length})</span>
                  </button>
                ))}
              </div>

              {/* Active level phases */}
              {LEVELS.filter(l => l.key === activeLevel).map(({ key, label, color }) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label} Phases</span>
                    <button
                      type="button"
                      onClick={() => addPhase(key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-careermap-navy/10 text-careermap-teal rounded-lg font-bold text-xs hover:bg-careermap-navy/20 transition-all"
                    >
                      <Plus size={13} /> Add Phase
                    </button>
                  </div>

                  {levelPhases[key].map((phase, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500">Phase {idx + 1}</span>
                        {levelPhases[key].length > 1 && (
                          <button type="button" onClick={() => removePhase(key, idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={phase.title}
                          onChange={e => updatePhase(key, idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-primary dark:text-white outline-none text-sm"
                          placeholder="Phase title"
                        />
                        <RichTextEditor
                          value={phase.description}
                          onChange={html => updatePhase(key, idx, 'description', html)}
                          placeholder="Phase description..."
                          minHeight={80}
                        />
                        <input
                          type="text"
                          value={phase.duration}
                          onChange={e => updatePhase(key, idx, 'duration', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-primary dark:text-white outline-none text-sm"
                          placeholder="Duration (e.g., 2 weeks)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>

            {/* Scroll spacer to give plenty of viewport space below select elements */}
            <div className="h-32" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-careermap-navy/90 transition-all disabled:opacity-50 text-sm">
              {loading ? <><Loader2 className="animate-spin" size={16} /> Creating...</> : <><Plus size={16} /> Create Roadmap</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoadmapModal;
