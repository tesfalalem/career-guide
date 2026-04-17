import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Link as LinkIcon, Upload } from 'lucide-react';
import { adminService } from '../../../services/adminService';

interface Resource {
  id: number;
  title: string;
  description: string;
  resource_type: string;
  external_url?: string;
  file_path?: string;
  category: string;
  tags: string[];
}

interface EditResourceModalProps {
  isOpen: boolean;
  resource: Resource;
  onClose: () => void;
  onSuccess: () => void;
}

const EditResourceModal: React.FC<EditResourceModalProps> = ({ isOpen, resource, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [resourceMode, setResourceMode] = useState<'link' | 'file'>('link');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'link',
    external_url: '',
    category: 'Web Development',
    tags: '',
    file_path: ''
  });

  useEffect(() => {
    if (resource) {
      const mode = resource.external_url ? 'link' : 'file';
      setResourceMode(mode);
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        resource_type: resource.resource_type || 'link',
        external_url: resource.external_url || '',
        file_path: resource.file_path || '',
        category: resource.category || 'Web Development',
        tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ''
      });
    }
  }, [resource]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a resource title');
      return;
    }

    if (resourceMode === 'link' && !formData.external_url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const resourceData = {
        title: formData.title,
        description: formData.description,
        resource_type: formData.resource_type,
        external_url: resourceMode === 'link' ? formData.external_url : null,
        file_path: resourceMode === 'file' ? formData.file_path : null,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      await adminService.updateResource(resource.id, resourceData);
      onSuccess();
    } catch (error) {
      console.error('Failed to update resource:', error);
      alert('Failed to update resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-primary dark:text-white">Edit Resource</h3>
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
            {/* Resource Mode Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Resource Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setResourceMode('link')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                    resourceMode === 'link'
                      ? 'bg-secondary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <LinkIcon size={20} />
                  External Link
                </button>
                <button
                  type="button"
                  onClick={() => setResourceMode('file')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                    resourceMode === 'file'
                      ? 'bg-secondary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Upload size={20} />
                  File Upload
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-secondary/20 outline-none"
                placeholder="e.g., React Documentation"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-secondary/20 outline-none"
                rows={3}
                placeholder="Describe the resource..."
              />
            </div>

            {/* Resource Type Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Content Type
              </label>
              <select
                value={formData.resource_type}
                onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-secondary/20 outline-none"
              >
                <option value="link">Link</option>
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="course">Course</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>

            {/* URL or File Path */}
            {resourceMode === 'link' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-secondary/20 outline-none"
                  placeholder="https://example.com/resource"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  File Path <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.file_path}
                  onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-secondary/20 outline-none"
                  placeholder="/uploads/resources/document.pdf"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-secondary/20 outline-none"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="DevOps">DevOps</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Game Development">Game Development</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-secondary/20 outline-none"
                  placeholder="e.g., react, javascript"
                />
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
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditResourceModal;
