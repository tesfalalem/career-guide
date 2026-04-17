import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { Resource } from '../../../types';
import { adminService } from '../../../services/adminService';

const AdminContentModerationView: React.FC = () => {
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingResources();
  }, []);

  const fetchPendingResources = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPendingResources();
      setPendingResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch pending resources:', err);
      setPendingResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAction = async (resourceId: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await adminService.approveResource(resourceId);
      } else {
        await adminService.rejectResource(resourceId);
      }
      // Remove from list
      setPendingResources(pendingResources.filter(r => r.id !== resourceId));
    } catch (err) {
      console.error(`Failed to ${action} resource:`, err);
      alert(`Failed to ${action} resource. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-6 text-careermap-teal/50" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scanning Platform Assets...</p>
        </div>
      </div>
    );
  }

  if (pendingResources.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white flex items-center gap-4">
              <div className="w-1.5 h-8 bg-careermap-teal rounded-full" />
              Asset Consensus
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest leading-loose">Review and Moderate Administrative Queue</p>
          </div>
          <button
            onClick={fetchPendingResources}
            className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:border-careermap-teal transition-all shadow-sm"
          >
            <RefreshCw size={18} />
            Check Queue
          </button>
        </div>
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white mb-2">
            Protocols Satisfied
          </h3>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            The moderation queue is currently empty
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white flex items-center gap-4">
            <div className="w-1.5 h-8 bg-careermap-teal rounded-full" />
            Asset Consensus
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest leading-loose">Review and Moderate Administrative Queue</p>
        </div>
        <button
          onClick={fetchPendingResources}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:border-careermap-teal transition-all shadow-sm"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          Check Queue
        </button>
      </div>
      
      <div className="space-y-6">
        {pendingResources.map((resource) => (
          <div
            key={resource.id}
            className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 hover:shadow-[0_40px_80px_-15px_rgba(2,67,109,0.1)] transition-all duration-500"
          >
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 bg-careermap-navy/5 rounded-2xl flex items-center justify-center shrink-0 border border-slate-50 dark:border-slate-800">
                    <FileText size={28} className="text-careermap-navy dark:text-careermap-teal" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white group-hover:text-careermap-teal transition-colors mb-2">
                      {resource.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <FileText size={12} className="text-careermap-teal" />
                        {resource.resource_type}
                      </span>
                      <span className="px-3 py-1 bg-careermap-navy/5 text-careermap-navy dark:text-slate-300 rounded-lg">{resource.category}</span>
                      {resource.uploader_name && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">Origin: {resource.uploader_name}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {resource.description && (
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed max-w-3xl">
                    {resource.description}
                  </p>
                )}

                {resource.external_url && (
                  <a
                    href={resource.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-careermap-navy/5 text-careermap-navy dark:text-careermap-teal rounded-xl text-xs font-black uppercase tracking-widest hover:bg-careermap-navy/10 transition-all border border-transparent hover:border-careermap-navy/10"
                  >
                    <ExternalLink size={16} />
                    Inspect Asset Source
                  </a>
                )}

                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {resource.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-row lg:flex-col gap-3 shrink-0 pt-4">
                <button
                  onClick={() => handleResourceAction(resource.id, 'approve')}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle size={18} />
                  Approve Asset
                </button>
                <button
                  onClick={() => handleResourceAction(resource.id, 'reject')}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-red-500/20"
                >
                  <XCircle size={18} />
                  Reject Asset
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminContentModerationView;
