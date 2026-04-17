import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, TrendingUp, Clock, CheckCircle, UserCheck, Activity, RefreshCw, ArrowRight, Settings } from 'lucide-react';
import { PlatformAnalytics } from '../../../types';
import { adminService } from '../../../services/adminService';

interface AdminOverviewProps {
  analytics: PlatformAnalytics;
  onNavigate: (tab: string) => void;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  user_name?: string;
  timestamp: string;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ analytics: initialAnalytics, onNavigate }) => {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [analyticsData, approvalsData] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getPendingApprovals()
      ]);

      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      if (Array.isArray(approvalsData)) {
        setPendingApprovalsCount(approvalsData.length);
      }

      // Generate recent activity from analytics
      const activities: RecentActivity[] = [];
      if (analyticsData.total_users > 0) {
        activities.push({
          id: 1,
          type: 'user_registration',
          description: `${analyticsData.total_users} total users on platform`,
          timestamp: new Date().toISOString()
        });
      }
      if (analyticsData.pending_resources > 0) {
        activities.push({
          id: 2,
          type: 'resource_pending',
          description: `${analyticsData.pending_resources} resources awaiting approval`,
          timestamp: new Date().toISOString()
        });
      }
      if (approvalsData.length > 0) {
        activities.push({
          id: 3,
          type: 'role_request',
          description: `${approvalsData.length} teacher role requests pending`,
          timestamp: new Date().toISOString()
        });
      }
      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <Users size={16} className="text-careermap-teal" />;
      case 'resource_pending': return <FileText size={16} className="text-amber-500" />;
      case 'role_request': return <UserCheck size={16} className="text-careermap-teal" />;
      default: return <Activity size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Platform Overview</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Administrative Command Center</p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-800 hover:border-careermap-teal hover:text-careermap-teal transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} size={16} />
          Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Registry', value: analytics?.total_users || 0, sub: `${analytics?.total_students || 0} Students`, icon: Users, color: 'bg-careermap-navy' },
          { label: 'Global Roadmaps', value: analytics?.total_roadmaps || 0, sub: 'Active Curriculum', icon: BookOpen, color: 'bg-careermap-teal' },
          { label: 'Indexed Assets', value: analytics?.approved_resources || 0, sub: 'Verified Content', icon: FileText, color: 'bg-[#0369a1]' },
          { label: 'Pending Review', value: analytics?.pending_resources || 0, sub: 'Approval Queue', icon: Clock, color: 'bg-[#0f172a]' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-[2.5rem] p-8 text-white shadow-xl shadow-navy-500/10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
             <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
               <stat.icon size={140} />
             </div>
             <div className="flex flex-col h-full justify-between relative z-10">
                <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 border border-white/10">
                  <stat.icon size={28} />
                </div>
                <div>
                  <div className="text-5xl font-serif font-black mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{stat.label}</div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/40" />
                    <div className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{stat.sub}</div>
                  </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & High Priority */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
             <Activity className="text-careermap-teal" size={14} />
             Sector Priority Channels
           </h3>
           
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pendingApprovalsCount > 0 && (
                <button
                  onClick={() => onNavigate('approvals')}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 text-left transition-all hover:border-careermap-teal hover:shadow-2xl hover:shadow-teal-500/10 overflow-hidden"
                >
                  <div className="absolute top-6 right-6">
                    <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg animate-pulse">Action Required</span>
                  </div>
                  <div className="w-16 h-16 bg-red-50/50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                    <UserCheck className="text-red-500" size={32} />
                  </div>
                  <div className="text-4xl font-serif font-black text-careermap-navy dark:text-white mb-2">{pendingApprovalsCount}</div>
                  <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest">New Faculty Applications</div>
                  <div className="text-xs text-slate-500 mt-4 flex items-center gap-2 font-medium">Verify credentials & sector access <ArrowRight size={14} className="text-careermap-teal" /></div>
                </button>
              )}

              <button
                onClick={() => onNavigate('analytics')}
                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 text-left transition-all hover:border-careermap-teal hover:shadow-2xl hover:shadow-teal-500/10"
              >
                <div className="w-16 h-16 bg-careermap-teal/10 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <TrendingUp className="text-careermap-teal" size={32} />
                </div>
                <div className="text-4xl font-serif font-black text-careermap-navy dark:text-white mb-2">{analytics?.total_users || 0}</div>
                <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Global Platform Outreach</div>
                <div className="text-xs text-slate-500 mt-4 flex items-center gap-2 font-medium">Platform-wide engagement matrix <ArrowRight size={14} className="text-careermap-teal" /></div>
              </button>
           </div>

           {/* Secondary Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              {[
                { label: 'Role Authority', id: 'users', icon: Users, desc: 'Sector Permissions' },
                { label: 'Intelligence', id: 'analytics', icon: TrendingUp, desc: 'Analytics Terminal' },
                { label: 'Core Directives', id: 'settings', icon: Settings, desc: 'Infrastructure' }
              ].map((action, i) => (
                <button key={i} onClick={() => onNavigate(action.id)} 
                  className="flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-transparent hover:border-careermap-teal/20 hover:bg-white dark:hover:bg-slate-800 transition-all text-center group">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-4 group-hover:bg-careermap-navy group-hover:text-careermap-teal transition-all">
                    <action.icon size={24} />
                  </div>
                  <div className="font-black text-[10px] uppercase tracking-widest text-careermap-navy dark:text-white">{action.label}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter opacity-60">{action.desc}</div>
                </button>
              ))}
           </div>
        </div>

        {/* Recent Activity Sidebar Style */}
        <div className="bg-careermap-navy rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={240} />
           </div>
           
           <h3 className="text-xl font-serif font-black mb-10 flex items-center gap-4">
             <div className="w-1.5 h-6 bg-careermap-teal rounded-full" />
             Live Intelligence
           </h3>

           {recentActivity.length === 0 ? (
             <div className="text-center py-20 opacity-30">
               <Activity size={48} className="mx-auto mb-6 text-careermap-teal" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Signal: Terminal Idle</p>
             </div>
           ) : (
             <div className="space-y-8">
               {recentActivity.map((activity) => (
                 <div key={activity.id} className="relative pl-8 border-l-2 border-white/5 group">
                   <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-careermap-teal/20 border-2 border-careermap-teal/50 group-hover:scale-150 transition-transform duration-500" />
                   <div className="text-[10px] text-careermap-teal font-black uppercase tracking-[0.2em] mb-2 opacity-80">
                     {formatTimeAgo(activity.timestamp)}
                   </div>
                   <p className="text-sm font-bold text-white leading-relaxed">
                     {activity.description}
                   </p>
                   {activity.user_name && (
                     <div className="mt-3 flex items-center gap-2">
                       <div className="w-4 h-px bg-white/20" />
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Event Origin: {activity.user_name}</p>
                     </div>
                   )}
                 </div>
               ))}
               
               <button onClick={() => onNavigate('analytics')} className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-careermap-teal hover:text-white transition-all duration-300">
                 Access Detailed Ledger
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
