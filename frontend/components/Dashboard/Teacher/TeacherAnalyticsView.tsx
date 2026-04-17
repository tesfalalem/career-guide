import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Star, Download, Eye, Award, RefreshCw, FileText } from 'lucide-react';

interface ResourceStats {
  total_resources: number;
  approved_resources: number;
  pending_resources: number;
  total_views: number;
  total_downloads: number;
}

interface StudentStats {
  total_students: number;
  avg_engagement: number;
  total_time_spent: number;
  avg_rating: number;
}

interface TopResource {
  id: number;
  title: string;
  resource_type: string;
  category: string;
  views: number;
  downloads: number;
  avg_rating: number;
  student_count: number;
}

interface RatingDistribution {
  rating: number;
  count: number;
}

interface MonthlyActivity {
  month: string;
  active_students: number;
  total_accesses: number;
  total_time: number;
}

interface CategoryPerformance {
  category: string;
  resource_count: number;
  student_count: number;
  avg_rating: number;
  total_views: number;
}

interface AnalyticsData {
  resource_stats: ResourceStats;
  student_stats: StudentStats;
  top_resources: TopResource[];
  rating_distribution: RatingDistribution[];
  monthly_activity: MonthlyActivity[];
  category_performance: CategoryPerformance[];
}

const TeacherAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/teacher/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalytics(data);
      } else {
        throw new Error(data.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
      // Show error state instead of mock data
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-secondary" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load analytics'}</p>
          <button onClick={fetchAnalytics}
            className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalRatings = analytics.rating_distribution?.reduce((sum, r) => sum + r.count, 0) || 0;
  const avgRating = totalRatings > 0 && analytics.rating_distribution
    ? (analytics.rating_distribution.reduce((sum, r) => sum + (r.rating * r.count), 0) / totalRatings).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary dark:text-white flex items-center gap-3">
            <BarChart3 size={28} />
            Analytics & Insights
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track performance and engagement metrics for your resources
          </p>
        </div>
        <button onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="text-secondary" size={24} />
            <span className="text-3xl font-bold text-primary dark:text-white">
              {analytics?.resource_stats?.total_views?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="text-sm text-slate-500">Total Views</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Download className="text-secondary" size={24} />
            <span className="text-3xl font-bold text-primary dark:text-white">
              {analytics?.resource_stats?.total_downloads?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="text-sm text-slate-500">Downloads</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="text-secondary" size={24} />
            <span className="text-3xl font-bold text-primary dark:text-white">
              {analytics?.student_stats?.total_students || 0}
            </span>
          </div>
          <div className="text-sm text-slate-500">Students</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Star className="text-secondary" size={24} />
            <span className="text-3xl font-bold text-primary dark:text-white">{avgRating}</span>
          </div>
          <div className="text-sm text-slate-500">Avg Rating</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Award className="text-secondary" size={24} />
            <span className="text-3xl font-bold text-primary dark:text-white">
              {Math.round(analytics?.student_stats?.avg_engagement || 0)}%
            </span>
          </div>
          <div className="text-sm text-slate-500">Engagement</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Monthly Activity (Last 6 Months)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics?.monthly_activity?.slice().reverse().map((month, i) => {
              const maxStudents = Math.max(...(analytics.monthly_activity?.map(m => m.active_students) || [1]));
              const height = (month.active_students / maxStudents) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-secondary rounded-t-lg transition-all hover:bg-secondary/80 cursor-pointer"
                      style={{ height: `${height * 2}px` }}
                      title={`${month.active_students} students`}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {month.active_students} students
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatMonth(month.month)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
            <Star size={20} />
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {analytics?.rating_distribution?.map((rating) => {
              const percentage = totalRatings > 0 ? (rating.count / totalRatings) * 100 : 0;
              return (
                <div key={rating.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-semibold text-primary dark:text-white">{rating.rating}</span>
                    <Star size={14} className="text-secondary fill-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                      <div className="bg-secondary h-3 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 w-12 text-right">
                    {rating.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-primary dark:text-white mb-6 flex items-center gap-2">
          <BarChart3 size={20} />
          Category Performance
        </h3>
        <div className="space-y-4">
          {analytics?.category_performance?.map((category, i) => {
            const maxViews = Math.max(...(analytics.category_performance?.map(c => c.total_views) || [1]));
            const viewsPercentage = (category.total_views / maxViews) * 100;
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary dark:text-white">{category.category}</span>
                    <span className="text-xs text-slate-500">
                      {category.resource_count} resources • {category.student_count} students
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-secondary fill-secondary" />
                      <span className="text-sm font-bold text-primary dark:text-white">
                        {category.avg_rating ? category.avg_rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary dark:text-white">
                      {category.total_views} views
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4">
                  <div className="bg-secondary h-4 rounded-full transition-all" style={{ width: `${viewsPercentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resource Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-primary dark:text-white flex items-center gap-2">
            <FileText size={20} />
            Top Performing Resources
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics?.top_resources?.map((resource) => (
                <tr key={resource.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-primary dark:text-white">{resource.title}</div>
                      <div className="text-sm text-slate-500">{resource.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-semibold capitalize">
                      {resource.resource_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-secondary" />
                      <span className="font-semibold text-primary dark:text-white">
                        {resource.views.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Download size={16} className="text-secondary" />
                      <span className="font-semibold text-primary dark:text-white">
                        {resource.downloads.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-secondary" />
                      <span className="font-semibold text-primary dark:text-white">
                        {resource.student_count}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-lg">
                        <Star size={14} className="text-secondary fill-secondary" />
                        <span className="text-sm font-bold text-secondary">
                          {resource.avg_rating ? resource.avg_rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsView;
