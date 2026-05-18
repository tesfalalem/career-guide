import React, { useState } from 'react';
import { X, Plus, Loader2, Link as LinkIcon, Upload } from 'lucide-react';
import { adminService } from '../../../services/adminService';

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

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateResourceModal: React.FC<CreateResourceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [resourceMode, setResourceMode] = useState<'link' | 'file'>('link');
  const [selectedCat, setSelectedCat] = useState('Full-Stack Development');
  const [customCat, setCustomCat] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'link',
    external_url: '',
    tags: '',
    file_path: '',
    file_size: 0,
    file_type: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a resource title');
      return;
    }

    if (selectedCat === 'Other' && !customCat.trim()) {
      alert('Please enter a custom category');
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
        category: selectedCat === 'Other' ? customCat : selectedCat,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        file_size: formData.file_size,
        file_type: formData.file_type
      };

      await adminService.createResource(resourceData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create resource:', error);
      alert('Failed to create resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-primary dark:text-white">Add New Resource</h3>
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
                      ? 'bg-careermap-navy text-white'
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
                      ? 'bg-careermap-navy text-white'
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                placeholder="e.g., React Documentation"
                required
              />
            </div>

            {/* Standard Category Selector & Custom Input */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                >
                  {SYSTEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {selectedCat === 'Other' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Custom Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCat}
                    onChange={(e) => setCustomCat(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                    placeholder="Enter custom category manually"
                  />
                </div>
              )}
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                  placeholder="/uploads/resources/document.pdf"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Note: File upload functionality requires backend file handling. Enter the path where the file will be stored.
                </p>
              </div>
            )}

            {/* Tags (comma-separated) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary dark:text-white focus:ring-2 focus:ring-teal-500/20 outline-none"
                placeholder="e.g., react, javascript"
              />
            </div>

            {/* Scroll spacer to give plenty of viewport space below select elements */}
            <div className="h-32" />
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
              className="flex items-center gap-2 px-6 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResourceModal;
