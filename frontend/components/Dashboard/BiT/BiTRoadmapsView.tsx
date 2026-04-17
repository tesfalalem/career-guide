import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Globe, Search, Loader2 } from 'lucide-react';
import { bitService } from '../../../services/bitService';
import ConfirmModal from '../../common/ConfirmModal';
import CreateRoadmapModal from '../Admin/CreateRoadmapModal';
import EditRoadmapModal from '../Admin/EditRoadmapModal';
import CreateCourseForRoadmapModal from '../Admin/CreateCourseForRoadmapModal';

interface Roadmap {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  estimated_duration: string;
  status: string;
  tags: string[];
  phases: any[];
  created_at: string;
}

const BiTRoadmapsView: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roadmapToEdit, setRoadmapToEdit] = useState<Roadmap | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [roadmapForCourse, setRoadmapForCourse] = useState<Roadmap | null>(null);

  useEffect(() => { fetchRoadmaps(); }, [filterStatus]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      const data = await bitService.getRoadmaps(filters);
      setRoadmaps(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await bitService.publishRoadmap(id);
      fetchRoadmaps();
    } catch (e) {
      alert('Failed to publish roadmap');
    }
  };

  const handleDelete = async () => {
    if (!roadmapToDelete) return;
    setDeleting(true);
    try {
      await bitService.deleteRoadmap(roadmapToDelete);
      setRoadmaps(roadmaps.filter(r => r.id !== roadmapToDelete));
      setDeleteConfirmOpen(false);
      setRoadmapToDelete(null);
    } catch (e) {
      alert('Failed to delete roadmap');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = roadmaps.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadge = (s: string) => ({
    published: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    archived: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  }[s] ?? 'bg-slate-100 text-slate-700');

  const diffBadge = (l: string) => ({
    beginner: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-orange-100 text-orange-700',
    advanced: 'bg-purple-100 text-purple-700',
  }[l] ?? 'bg-blue-100 text-blue-700');

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="animate-spin text-careermap-teal" size={48} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white flex items-center gap-4">
            <div className="w-1.5 h-8 bg-careermap-teal rounded-full" />
            Academic Tracks
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest leading-loose">
            Institutional Curriculum Protocols
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-careermap-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-navy-500/20"
        >
          <Plus size={20} />
          Forge Roadmap
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Tracks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white font-bold text-sm focus:ring-2 focus:ring-careermap-teal/20 outline-none transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white font-black text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-careermap-teal/20 outline-none cursor-pointer"
        >
          <option value="all">Deployment Status</option>
          <option value="published">Status: Live</option>
          <option value="draft">Status: Draft</option>
          <option value="archived">Status: Archived</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Registry', value: roadmaps.length, color: 'text-careermap-navy dark:text-white' },
          { label: 'Live Tracks', value: roadmaps.filter(r => r.status === 'published').length, color: 'text-emerald-600' },
          { label: 'In-Queue', value: roadmaps.filter(r => r.status === 'draft').length, color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <div className={`text-3xl font-serif font-black ${s.color} transition-colors mb-1`}>{s.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label} Roadmaps</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-semibold">No roadmaps found. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(roadmap => (
            <div key={roadmap.id} className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 hover:shadow-[0_40px_80px_-15px_rgba(2,67,109,0.15)] transition-all duration-500 transform hover:-translate-y-2">
              <h3 className="text-xl font-serif font-black text-careermap-navy dark:text-white mb-2 group-hover:text-careermap-teal transition-colors">{roadmap.title}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed">{roadmap.description}</p>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${statusBadge(roadmap.status)}`}>{roadmap.status}</span>
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${diffBadge(roadmap.difficulty_level)}`}>{roadmap.difficulty_level}</span>
                <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-careermap-navy/5 text-careermap-navy dark:bg-slate-800 dark:text-slate-300">{roadmap.category}</span>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{roadmap.phases?.length || 0} phases · {roadmap.estimated_duration}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setRoadmapForCourse(roadmap); setCourseModalOpen(true); }}
                    className="p-2 text-careermap-navy hover:bg-careermap-navy/5 rounded-lg transition-all" title="Propagate Course">
                    <BookOpen size={16} />
                  </button>
                  {roadmap.status === 'draft' && (
                    <button onClick={() => handlePublish(roadmap.id)}
                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Activate Layer">
                      <Globe size={16} />
                    </button>
                  )}
                  <button onClick={() => { setRoadmapToEdit(roadmap); setEditModalOpen(true); }}
                    className="p-2 text-careermap-teal hover:bg-careermap-teal/5 rounded-lg transition-all" title="Re-Configure">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => { setRoadmapToDelete(roadmap.id); setDeleteConfirmOpen(true); }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Terminate">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setRoadmapToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Roadmap"
        message="Are you sure you want to delete this roadmap? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      {createModalOpen && (
        <CreateRoadmapModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => { setCreateModalOpen(false); fetchRoadmaps(); }}
          createFn={(data) => bitService.createRoadmap(data)}
        />
      )}

      {editModalOpen && roadmapToEdit && (
        <EditRoadmapModal
          isOpen={editModalOpen}
          roadmap={roadmapToEdit}
          onClose={() => { setEditModalOpen(false); setRoadmapToEdit(null); }}
          onSuccess={() => { setEditModalOpen(false); setRoadmapToEdit(null); fetchRoadmaps(); }}
          updateFn={(id, data) => bitService.updateRoadmap(id, data)}
        />
      )}

      {courseModalOpen && roadmapForCourse && (
        <CreateCourseForRoadmapModal
          isOpen={courseModalOpen}
          roadmapId={roadmapForCourse.id}
          roadmapTitle={roadmapForCourse.title}
          onClose={() => { setCourseModalOpen(false); setRoadmapForCourse(null); }}
          onSuccess={() => { setCourseModalOpen(false); setRoadmapForCourse(null); fetchRoadmaps(); }}
          addCourseFn={(id, data) => bitService.addCourseToRoadmap(id, data)}
        />
      )}
    </div>
  );
};

export default BiTRoadmapsView;
