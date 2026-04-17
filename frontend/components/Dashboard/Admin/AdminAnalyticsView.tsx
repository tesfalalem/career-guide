import React, { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, FileText, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { adminService } from '../../../services/adminService';

interface Analytics {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  total_roadmaps: number;
  total_resources: number;
  pending_resources: number;
  approved_resources: number;
  rejected_resources: number;
}

const AdminAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-6 text-careermap-teal/50" size={48} />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aggregating Platform Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <p className="text-red-500 font-bold mb-6">{error || 'Failed to load intelligence'}</p>
          <button onClick={fetchAnalytics}
            className="px-8 py-4 bg-careermap-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-navy-500/20">
            Re-Establish Connection
          </button>
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
            Platform Intelligence
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">
            Cross-Sector Performance & User Engagement Matrix
          </p>
        </div>
        <button onClick={fetchAnalytics}
          className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 text-careermap-navy dark:text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:border-careermap-teal transition-all shadow-sm">
          <RefreshCw size={18} />
          Sync Data
        </button>
      </div>

      {/* User Statistics */}
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Demographic Registry</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-careermap-navy rounded-[2rem] p-8 text-white shadow-2xl shadow-navy-500/20 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Registry</span>
              <Activity size={16} className="text-careermap-teal" />
            </div>
            <div className="text-5xl font-serif font-black">{analytics.total_users}</div>
            <div className="mt-4 text-[10px] font-bold text-careermap-teal uppercase tracking-widest">Verified Accounts</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-lg hover:border-careermap-teal/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Corps</span>
              <Users size={16} className="text-emerald-500" />
            </div>
            <div className="text-5xl font-serif font-black text-careermap-navy dark:text-white">{analytics.total_students}</div>
            <div className="mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+4.2% Growth</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-lg hover:border-careermap-teal/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher Registry</span>
              <Users size={16} className="text-careermap-teal" />
            </div>
            <div className="text-5xl font-serif font-black text-careermap-navy dark:text-white">{analytics.total_teachers}</div>
            <div className="mt-4 text-[10px] font-bold text-careermap-teal uppercase tracking-widest">Expert Network</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-lg hover:border-careermap-teal/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Authority</span>
              <Users size={16} className="text-slate-900 dark:text-white" />
            </div>
            <div className="text-5xl font-serif font-black text-careermap-navy dark:text-white">{analytics.total_admins}</div>
            <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control Tier</div>
          </div>
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Curriculum Velocity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-careermap-navy/5 text-careermap-navy dark:text-careermap-teal rounded-2xl flex items-center justify-center">
                <BookOpen size={32} />
              </div>
              <div>
                <div className="text-4xl font-serif font-black text-careermap-navy dark:text-white">{analytics.total_roadmaps}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Roadmaps</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                <FileText size={32} />
              </div>
              <div>
                <div className="text-4xl font-serif font-black text-careermap-navy dark:text-white">{analytics.approved_resources}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indexed Resources</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <TrendingUp size={32} />
              </div>
              <div>
                <div className="text-4xl font-serif font-black text-careermap-navy dark:text-white">{analytics.pending_resources}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resource Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Asset Health Matrix</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-50 dark:border-emerald-900/20">
              <div>
                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Authenticated Assets</div>
                <div className="text-3xl font-serif font-black text-emerald-600">{analytics.approved_resources}</div>
              </div>
              <div className="text-2xl font-serif font-black text-emerald-600/30">
                {analytics.total_resources > 0 
                  ? Math.round((analytics.approved_resources / analytics.total_resources) * 100)
                  : 0}%
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-50 dark:border-amber-900/20">
              <div>
                <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Queue Under Review</div>
                <div className="text-3xl font-serif font-black text-amber-600">{analytics.pending_resources}</div>
              </div>
              <div className="text-2xl font-serif font-black text-amber-600/30">
                {analytics.total_resources > 0 
                  ? Math.round((analytics.pending_resources / analytics.total_resources) * 100)
                  : 0}%
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-50 dark:border-red-900/20">
              <div>
                <div className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">De-Listed Content</div>
                <div className="text-3xl font-serif font-black text-red-600">{analytics.rejected_resources}</div>
              </div>
              <div className="text-2xl font-serif font-black text-red-600/30">
                {analytics.total_resources > 0 
                  ? Math.round((analytics.rejected_resources / analytics.total_resources) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Platform Vitals */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Platform Vitals</h3>
          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Expansion</div>
                  <div className="text-2xl font-serif font-black text-careermap-navy dark:text-white">User Growth</div>
                </div>
                <span className="text-lg font-serif font-black text-emerald-500">+12.4%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Moderation Velocity</div>
                  <div className="text-2xl font-serif font-black text-careermap-navy dark:text-white">Approval Rating</div>
                </div>
                <span className="text-lg font-serif font-black text-careermap-teal">
                  {analytics.total_resources > 0 
                    ? Math.round((analytics.approved_resources / analytics.total_resources) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-careermap-teal rounded-full" style={{ 
                  width: `${analytics.total_resources > 0 
                    ? (analytics.approved_resources / analytics.total_resources) * 100
                    : 0}%` 
                }} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Integrity: High</span>
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-careermap-teal">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsView;
