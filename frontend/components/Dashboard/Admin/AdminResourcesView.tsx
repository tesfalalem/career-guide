import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Filter, Loader2, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import ConfirmModal from '../../common/ConfirmModal';
import CreateResourceModal from './CreateResourceModal';
import EditResourceModal from './EditResourceModal';

interface Resource {
  id: number;
  title: string;
  description: string;
  resource_type: string;
  external_url?: string;
  file_path?: string;
  category: string;
  tags: string[];
  status: string;
  uploaded_by: number;
  uploader_name?: string;
  views: number;
  downloads: number;
  created_at: string;
}

const AdminResourcesView: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [filterStatus, filterType]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (filterType !== 'all') filters.resource_type = filterType;
      
      const data = await adminService.getResources(filters);
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    
    setDeleting(true);
    try {
      await adminService.deleteResource(resourceToDelete);
      setResources(resources.filter(r => r.id !== resourceToDelete));
      setDeleteConfirmOpen(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    } finally {
      setDeleting(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-careermap-teal" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white flex items-center gap-4">
            <div className="w-1.5 h-8 bg-careermap-teal rounded-full" />
            Educational Assets
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest leading-loose">
            Administrative Control of Learning Materials
          </p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-careermap-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-navy-500/20"
        >
          <Plus size={20} />
          Register Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white font-bold text-sm focus:ring-2 focus:ring-careermap-teal/20 outline-none transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white font-black text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-careermap-teal/20 outline-none cursor-pointer"
        >
          <option value="all">Validation Status</option>
          <option value="approved">Status: Verified</option>
          <option value="pending">Status: In-Queue</option>
          <option value="rejected">Status: Retired</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white font-black text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-careermap-teal/20 outline-none cursor-pointer"
        >
          <option value="all">Asset Class</option>
          <option value="document">Class: Document</option>
          <option value="video">Class: Video</option>
          <option value="link">Class: External URL</option>
          <option value="course">Class: Curriculum</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Registry</div>
          <div className="text-3xl font-serif font-black text-careermap-navy dark:text-white">{resources.length}</div>
        </div>
        <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[1.5rem] border border-emerald-50 dark:border-emerald-900/20 p-6 shadow-sm">
          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Authenticated</div>
          <div className="text-3xl font-serif font-black text-emerald-600">{resources.filter(r => r.status === 'approved').length}</div>
        </div>
        <div className="bg-amber-50/30 dark:bg-amber-900/10 rounded-[1.5rem] border border-amber-50 dark:border-amber-900/20 p-6 shadow-sm">
          <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Queue Under Review</div>
          <div className="text-3xl font-serif font-black text-amber-600">{resources.filter(r => r.status === 'pending').length}</div>
        </div>
        <div className="bg-red-50/30 dark:bg-red-900/10 rounded-[1.5rem] border border-red-50 dark:border-red-900/20 p-6 shadow-sm">
          <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">De-Listed</div>
          <div className="text-3xl font-serif font-black text-red-600">{resources.filter(r => r.status === 'rejected').length}</div>
        </div>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">No Resources Found</h3>
          <p className="text-slate-500 mt-2">No resources match your filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Narrative</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authority</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validation</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Intelligence</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <div className="font-bold text-careermap-navy dark:text-white group-hover:text-careermap-teal transition-colors">{resource.title}</div>
                        <div className="text-xs text-slate-500 font-medium line-clamp-1 mt-1">{resource.description}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-careermap-navy/5 text-careermap-navy dark:bg-slate-800 dark:text-careermap-teal rounded-lg text-[10px] font-black uppercase tracking-widest border border-transparent group-hover:border-careermap-navy/10 transition-all">
                        {resource.resource_type}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{resource.category}</td>
                    <td className="px-8 py-6 text-xs font-bold text-careermap-navy dark:text-slate-300">{resource.uploader_name || 'System Operator'}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatusBadge(resource.status)}`}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 group-hover:text-careermap-navy dark:group-hover:text-careermap-teal transition-colors">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md">
                          <Eye size={12} className="text-careermap-teal" />
                          {resource.views || 0}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md">
                          <Download size={12} className="text-careermap-teal" />
                          {resource.downloads || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setResourceToEdit(resource);
                            setEditModalOpen(true);
                          }}
                          className="p-2 text-careermap-teal hover:bg-careermap-teal/10 rounded-lg transition-all"
                          title="Re-Configure"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setResourceToDelete(resource.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                          title="Terminate"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setResourceToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      {/* Create Resource Modal */}
      {createModalOpen && (
        <CreateResourceModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchResources();
          }}
        />
      )}

      {/* Edit Resource Modal */}
      {editModalOpen && resourceToEdit && (
        <EditResourceModal
          isOpen={editModalOpen}
          resource={resourceToEdit}
          onClose={() => {
            setEditModalOpen(false);
            setResourceToEdit(null);
          }}
          onSuccess={() => {
            setEditModalOpen(false);
            setResourceToEdit(null);
            fetchResources();
          }}
        />
      )}
    </div>
  );
};

export default AdminResourcesView;
