import React, { useState, useEffect } from 'react';
import { Plus, Upload, Link as LinkIcon, FileText, Video, BookOpen, X, Loader2, CheckCircle, Clock, XCircle, Edit, Trash2, File, Eye, Download } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

interface Resource {
  id: number;
  title: string;
  description: string;
  resource_type: string;
  external_url?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  category: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  downloads: number;
  created_at: string;
}

interface ResourceStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  total_views: number;
  total_downloads: number;
}

const TeacherResourcesView: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'document',
    external_url: '',
    category: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    'Frontend Development', 'Backend Development', 'Full Stack Development',
    'Mobile Development', 'Data Science', 'Machine Learning', 'AI',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design',
    'Database Management', 'System Architecture', 'General'
  ];

  const resourceTypes = [
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'link', label: 'External Link', icon: LinkIcon },
    { value: 'article', label: 'Article', icon: FileText },
    { value: 'course', label: 'Course', icon: BookOpen },
    { value: 'tutorial', label: 'Tutorial', icon: BookOpen }
  ];

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/teacher/resources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/teacher/resources/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('resource_type', formData.resource_type);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      
      if (uploadMode === 'file' && selectedFile) {
        formDataToSend.append('file', selectedFile);
      } else if (uploadMode === 'url' && formData.external_url) {
        formDataToSend.append('external_url', formData.external_url);
      } else {
        setError('Please provide either a file or URL');
        setSubmitting(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/teacher/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        setShowAddForm(false);
        resetForm();
        fetchResources();
        fetchStats();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create resource');
      }
    } catch (err) {
      setError('Failed to create resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      resource_type: resource.resource_type,
      external_url: resource.external_url || '',
      category: resource.category,
      tags: resource.tags.join(', ')
    });
    setUploadMode(resource.file_path ? 'file' : 'url');
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('resource_type', formData.resource_type);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }
      
      if (uploadMode === 'url' && formData.external_url) {
        formDataToSend.append('external_url', formData.external_url);
      }

      const response = await fetch(`http://localhost:8000/api/teacher/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        setShowEditForm(false);
        setEditingResource(null);
        resetForm();
        fetchResources();
        fetchStats();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update resource');
      }
    } catch (err) {
      setError('Failed to update resource');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'document',
      external_url: '',
      category: '',
      tags: ''
    });
    setSelectedFile(null);
    setUploadMode('file');
    setError(null);
  };

  const handleDelete = async (id: number) => {
    setResourceToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/teacher/resources/${resourceToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchResources();
        fetchStats();
        setDeleteConfirmOpen(false);
        setResourceToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <CheckCircle size={14} /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
            <Clock size={14} /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-careermap-teal" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary dark:text-white">My Resources</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Share educational content with students
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 bg-careermap-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-[#023058] transition-all"
        >
          <Plus size={20} /> Add Resource
        </button>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total</div>
            <div className="text-2xl font-bold text-primary dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1 flex items-center gap-1">
              <Eye size={14} /> Views
            </div>
            <div className="text-2xl font-bold text-careermap-teal">{stats.total_views}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1 flex items-center gap-1">
              <Download size={14} /> Downloads
            </div>
            <div className="text-2xl font-bold text-careermap-teal">{stats.total_downloads}</div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-primary dark:text-white">Add New Resource</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload Mode Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                    uploadMode === 'file'
                      ? 'bg-white dark:bg-slate-700 text-careermap-teal shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <Upload size={16} className="inline mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                    uploadMode === 'url'
                      ? 'bg-white dark:bg-slate-700 text-careermap-teal shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <LinkIcon size={16} className="inline mr-2" />
                  External URL
                </button>
              </div>

              {/* File Upload or URL Input */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Upload File (Max 50MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-teal-500 transition-all">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.mpeg,.jpg,.jpeg,.png,.gif"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                      {selectedFile ? (
                        <div>
                          <p className="text-careermap-teal font-bold mb-1">{selectedFile.name}</p>
                          <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 font-bold mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-slate-500">
                            PDF, DOC, PPT, MP4, Images (Max 50MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    External URL
                  </label>
                  <input
                    type="url"
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    placeholder="https://example.com/resource"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Resource Type
                  </label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  >
                    {resourceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  placeholder="react, javascript, frontend"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-careermap-navy text-white py-3 rounded-xl font-bold hover:bg-[#023058] transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Add Resource'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditForm && editingResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-primary dark:text-white">Edit Resource</h3>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingResource(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Upload Mode Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                    uploadMode === 'file'
                      ? 'bg-white dark:bg-slate-700 text-careermap-teal shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <Upload size={16} className="inline mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                    uploadMode === 'url'
                      ? 'bg-white dark:bg-slate-700 text-careermap-teal shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <LinkIcon size={16} className="inline mr-2" />
                  External URL
                </button>
              </div>

              {/* File Upload or URL Input */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Upload New File (Optional, Max 50MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-teal-500 transition-all">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload-edit"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.mpeg,.jpg,.jpeg,.png,.gif"
                    />
                    <label htmlFor="file-upload-edit" className="cursor-pointer">
                      <Upload size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                      {selectedFile ? (
                        <div>
                          <p className="text-careermap-teal font-bold mb-1">{selectedFile.name}</p>
                          <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      ) : editingResource.file_path ? (
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 font-bold mb-1">
                            Current: {editingResource.file_path.split('/').pop()}
                          </p>
                          <p className="text-sm text-slate-500">
                            Click to upload a new file
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 font-bold mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-slate-500">
                            PDF, DOC, PPT, MP4, Images (Max 50MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    External URL
                  </label>
                  <input
                    type="url"
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    placeholder="https://example.com/resource"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Resource Type
                  </label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  >
                    {resourceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  placeholder="react, javascript, frontend"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-careermap-navy text-white py-3 rounded-xl font-bold hover:bg-[#023058] transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Update Resource'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingResource(null);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resources List */}
      <div className="grid gap-4">
        {resources.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <Upload size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
              No resources yet
            </h3>
            <p className="text-slate-500 dark:text-slate-500 mb-4">
              Start sharing educational content with students
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-careermap-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-[#023058] transition-all"
            >
              <Plus size={20} /> Add Your First Resource
            </button>
          </div>
        ) : (
          resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-primary dark:text-white">
                      {resource.title}
                    </h3>
                    {getStatusBadge(resource.status)}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <BookOpen size={16} />
                      {resource.resource_type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      {resource.category}
                    </span>
                    {resource.file_path && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <File size={16} />
                        {resource.file_size ? formatFileSize(resource.file_size) : 'File'}
                      </span>
                    )}
                    {resource.external_url && (
                      <a
                        href={resource.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-careermap-teal hover:underline"
                      >
                        <LinkIcon size={16} />
                        View Resource
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Eye size={16} />
                      {resource.views} views
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Download size={16} />
                      {resource.downloads} downloads
                    </span>
                  </div>
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {resource.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="p-2 text-careermap-teal hover:bg-teal-500/10 rounded-lg transition-all"
                    title="Edit resource"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Delete resource"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setResourceToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default TeacherResourcesView;
