import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, TrendingUp, CheckCircle, XCircle, Shield, GraduationCap, Briefcase, Loader2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Resource {
  id: number;
  title: string;
  resource_type: string;
  category: string;
  status: string;
  uploaded_by: number;
  uploader_name?: string;
}

interface Analytics {
  total_users: number;
  total_roadmaps: number;
  total_resources: number;
  pending_resources: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'resources'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');

    try {
      if (activeTab === 'overview') {
        const response = await fetch('http://localhost:8000/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } else if (activeTab === 'users') {
        const response = await fetch('http://localhost:8000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } else if (activeTab === 'resources') {
        const response = await fetch('http://localhost:8000/api/admin/resources/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPendingResources(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleResourceAction = async (resourceId: number, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/resources/${resourceId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(`Failed to ${action} resource:`, err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-primary dark:text-white">Admin Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage users, content, and platform settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-bold text-sm transition-all ${
            activeTab === 'overview'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-bold text-sm transition-all ${
            activeTab === 'users'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 font-bold text-sm transition-all ${
            activeTab === 'resources'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Pending Resources
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-secondary" size={40} />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Users size={32} />
                  <span className="text-3xl font-extrabold">{analytics.total_users}</span>
                </div>
                <div className="text-sm font-bold opacity-90">Total Users</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen size={32} />
                  <span className="text-3xl font-extrabold">{analytics.total_roadmaps}</span>
                </div>
                <div className="text-sm font-bold opacity-90">Published Roadmaps</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <FileText size={32} />
                  <span className="text-3xl font-extrabold">{analytics.total_resources}</span>
                </div>
                <div className="text-sm font-bold opacity-90">Approved Resources</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp size={32} />
                  <span className="text-3xl font-extrabold">{analytics.pending_resources}</span>
                </div>
                <div className="text-sm font-bold opacity-90">Pending Approval</div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                              <span className="text-secondary font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-semibold text-primary dark:text-white">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === 'admin' ? 'bg-red-100 text-red-700' :
                            user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.role === 'admin' && <Shield size={12} />}
                            {user.role === 'teacher' && <Briefcase size={12} />}
                            {user.role === 'student' && <GraduationCap size={12} />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-secondary/20 outline-none"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {pendingResources.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    No resources pending approval
                  </p>
                </div>
              ) : (
                pendingResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-primary dark:text-white mb-2">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <FileText size={16} />
                            {resource.resource_type}
                          </span>
                          <span>{resource.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleResourceAction(resource.id, 'approve')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleResourceAction(resource.id, 'reject')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
