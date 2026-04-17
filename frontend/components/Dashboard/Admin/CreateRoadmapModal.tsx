import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';

interface Phase {
  title: string;
  description: string;
  duration: string;
  resources: string[];
}

interface CreateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Override the default adminService.createRoadmap — used by BiT dashboard */
  createFn?: (data: any) => Promise<any>;
}

const CreateRoadmapModal: React.FC<CreateRoadmapModalProps> = ({ isOpen, onClose, onSuccess, createFn }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    difficulty_level: 'beginner',
    estimated_duration: '',
    status: 'published',
    tags: '',
    thumbnail_url: ''
  });
  const [phases, setPhases] = useState<Phase[]>([
    { title: '', description: '', duration: '', resources: [] }
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a roadmap title');
      return;
    }

    if (phases.length === 0 || !phases[0].title.trim()) {
      alert('Please add at least one phase');
      return;
    }

    setLoading(true);
    try {
      const roadmapData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        phases: phases.filter(p => p.title.trim())
      };

      const creator = createFn ?? adminService.createRoadmap.bind(adminService);
      await creator(roadmapData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create roadmap:', error);
      alert('Failed to create roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPhase = () => {
    setPhases([...phases, { title: '', description: '', duration: '', resources: [] }]);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const updatePhase = (index: number, field: keyof Phase, value: string) => {
    const updated = [...phases];
    updated[index] = { ...updated[index], [field]: value };
    setPhases(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-primary dark:text-white">Create New Roadmap</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="font-bold text-primary dark:text-white mb-4">Basic Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                    placeholder="e.g., Full Stack Web Development"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                    rows={3}
                    placeholder="Describe what students will learn..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="DevOps">DevOps</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Game Development">Game Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={formData.estimated_duration}
                      onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                      placeholder="e.g., 6 months"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                    placeholder="e.g., web, fullstack, javascript"
                  />
                </div>
              </div>
            </div>

            {/* Phases */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-primary dark:text-white">
                  Phases <span className="text-red-500">*</span>
                </h4>
                <button
                  type="button"
                  onClick={addPhase}
                  className="flex items-center gap-2 px-4 py-2 bg-careermap-navy/10 text-careermap-teal rounded-lg font-semibold hover:bg-careermap-navy/20 transition-all"
                >
                  <Plus size={16} />
                  Add Phase
                </button>
              </div>

              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm text-slate-600 dark:text-slate-400">
                        Phase {index + 1}
                      </span>
                      {phases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhase(index)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={phase.title}
                        onChange={(e) => updatePhase(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                        placeholder="Phase title"
                        required
                      />
                      <textarea
                        value={phase.description}
                        onChange={(e) => updatePhase(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                        rows={2}
                        placeholder="Phase description"
                      />
                      <input
                        type="text"
                        value={phase.duration}
                        onChange={(e) => updatePhase(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                        placeholder="Duration (e.g., 2 weeks)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-careermap-navy/90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Roadmap
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoadmapModal;
