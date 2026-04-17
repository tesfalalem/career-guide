import React, { useEffect, useState } from 'react';
import { Upload, BookOpen, TrendingUp, CheckCircle, Clock, XCircle, PlusCircle, Users, Star, MessageSquare, AlertTriangle, Activity, Award, Eye, Download, RefreshCw } from 'lucide-react';
import { TeacherStats } from '../../../types';
import { teacherService } from '../../../services/teacherService';

interface TeacherOverviewProps {
  stats: TeacherStats;
  onNavigate: (tab: string) => void;
}

interface RecentActivity {
  id: number;
  type: 'resource' | 'feedback' | 'student' | 'rating';
  title: string;
  status?: string;
  date: string;
  details?: string;
  rating?: number;
}

interface AtRiskStudent {
  id: number;
  name: string;
  email: string;
  engagement_score: number;
  risk_level: string;
  last_active_at: string;
}

const TeacherOverview: React.FC<TeacherOverviewProps> = ({ stats: propStats, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(propStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [quickStats, setQuickStats] = useState({
    activeStudents: 0,
    avgRating: 0,
    totalViews: 0,
    totalDownloads: 0,
    unreadFeedback: 0,
    atRiskStudents: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsData, activityData, atRiskData] = await Promise.all([
        teacherService.getStats(),
        teacherService.getActivity(),
        teacherService.getAtRiskStudents()
      ]);

      if (statsData.success) {
        setStats({
          totalResources: statsData.stats.totalResources,
          approvedResources: statsData.stats.approvedResources,
          pendingResources: statsData.stats.pendingResources,
          totalStudents: statsData.stats.activeStudents
        });
        setQuickStats({
          activeStudents: statsData.stats.activeStudents,
          avgRating: statsData.stats.avgRating || 0,
          totalViews: 0, // Will be from analytics
          totalDownloads: 0, // Will be from analytics
          unreadFeedback: statsData.stats.unreadFeedback,
          atRiskStudents: atRiskData.students?.length || 0
        });
      }

      if (activityData.success) {
        setRecentActivity(activityData.activities || []);
      }

      if (atRiskData.success) {
        setAtRiskStudents(atRiskData.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Keep using prop stats as fallback
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-secondary" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Upload size={32} className="opacity-80" />
            <span className="text-4xl font-extrabold">{stats.totalResources}</span>
          </div>
          <div className="text-sm font-bold opacity-90">Total Resources</div>
          <div className="text-xs opacity-70 mt-2">{stats.approvedResources} approved</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} className="opacity-80" />
            <span className="text-4xl font-extrabold">{quickStats.activeStudents}</span>
          </div>
          <div className="text-sm font-bold opacity-90">Active Students</div>
          <div className="text-xs opacity-70 mt-2">Using your resources</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Star size={32} className="opacity-80" />
            <span className="text-4xl font-extrabold">{quickStats.avgRating}</span>
          </div>
          <div className="text-sm font-bold opacity-90">Average Rating</div>
          <div className="text-xs opacity-70 mt-2">Out of 5.0</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare size={32} className="opacity-80" />
            <span className="text-4xl font-extrabold">{quickStats.unreadFeedback}</span>
          </div>
          <div className="text-sm font-bold opacity-90">Unread Feedback</div>
          <div className="text-xs opacity-70 mt-2">From students</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Eye className="text-blue-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-primary dark:text-white">{quickStats.totalViews}</div>
              <div className="text-xs text-slate-500">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Download className="text-green-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-primary dark:text-white">{quickStats.totalDownloads}</div>
              <div className="text-xs text-slate-500">Downloads</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-primary dark:text-white">{stats.pendingResources}</div>
              <div className="text-xs text-slate-500">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-primary dark:text-white">{quickStats.atRiskStudents}</div>
              <div className="text-xs text-slate-500">At-Risk Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('resources')}
          className="bg-white dark:bg-slate-900 border-2 border-secondary hover:border-secondary/70 rounded-2xl p-6 text-left transition-all hover:shadow-lg group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <PlusCircle className="text-secondary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary dark:text-white">Add Resource</h3>
              <p className="text-sm text-slate-500">Upload new content</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 border-2 border-accent hover:border-accent/70 rounded-2xl p-6 text-left transition-all hover:shadow-lg group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Users className="text-accent" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary dark:text-white">Monitor Students</h3>
              <p className="text-sm text-slate-500">Track progress</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="bg-white dark:bg-slate-900 border-2 border-purple-500 hover:border-purple-400 rounded-2xl p-6 text-left transition-all hover:shadow-lg group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary dark:text-white">View Analytics</h3>
              <p className="text-sm text-slate-500">Performance insights</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary dark:text-white flex items-center gap-2">
            <Activity size={20} />
            Recent Activity
          </h3>
          <button className="text-sm font-semibold text-secondary hover:text-secondary/80">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'resource' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  activity.type === 'feedback' ? 'bg-green-100 dark:bg-green-900/20' :
                  activity.type === 'student' ? 'bg-purple-100 dark:bg-purple-900/20' :
                  'bg-orange-100 dark:bg-orange-900/20'
                }`}>
                  {activity.type === 'resource' && <Upload size={18} className="text-blue-600 dark:text-blue-400" />}
                  {activity.type === 'feedback' && <MessageSquare size={18} className="text-green-600 dark:text-green-400" />}
                  {activity.type === 'student' && <Users size={18} className="text-purple-600 dark:text-purple-400" />}
                  {activity.type === 'rating' && <Star size={18} className="text-orange-600 dark:text-orange-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-primary dark:text-white">{activity.title}</div>
                  {activity.details && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{activity.details}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">{activity.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activity.rating && (
                  <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                    <Star size={14} className="text-orange-500 fill-orange-500" />
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{activity.rating}</span>
                  </div>
                )}
                {activity.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    activity.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    activity.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                    activity.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-green-500" size={24} />
            <h4 className="font-bold text-primary dark:text-white">Top Performing Resources</h4>
          </div>
          {recentActivity.filter(a => a.type === 'resource' && a.rating).length > 0 ? (
            <div className="space-y-3">
              {recentActivity
                .filter(a => a.type === 'resource' && a.rating)
                .slice(0, 3)
                .map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-primary dark:text-white">{activity.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{activity.details || 'Resource'}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-orange-500 fill-orange-500" />
                      <span className="font-bold text-sm">{activity.rating}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Award size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No rated resources yet</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h4 className="font-bold text-primary dark:text-white">Students Needing Attention</h4>
          </div>
          {atRiskStudents.length > 0 ? (
            <div className="space-y-3">
              {atRiskStudents.slice(0, 3).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-primary dark:text-white">{student.name}</div>
                    <div className="text-xs text-slate-500 mt-1">Last active: {formatTimeAgo(student.last_active_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600 dark:text-red-400">{Math.round(student.engagement_score)}%</div>
                    <div className="text-xs text-slate-500">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No at-risk students at the moment</p>
            </div>
          )}
          {atRiskStudents.length > 0 && (
            <button
              onClick={() => onNavigate('students')}
              className="w-full mt-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-semibold text-sm hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            >
              View All At-Risk Students
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;
