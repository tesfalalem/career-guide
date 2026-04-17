import React, { useState, useEffect } from 'react';
import { Users, Shield, Briefcase, GraduationCap, Search, Loader2, RefreshCw } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { ListSkeleton } from '../../common/Skeleton';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    const previousRole = users.find(u => u.id === userId)?.role;
    
    // Optimistic update
    setUsers(users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    
    try {
      await adminService.updateUserRole(userId, newRole);
    } catch (err) {
      // Revert on error
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: previousRole || 'student' } : u
      ));
      alert('Failed to update user role. Please try again.');
      console.error('Role update error:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="skeleton-shimmer bg-slate-200/70 dark:bg-slate-800 rounded-xl w-48 h-7" />
            <div className="skeleton-shimmer bg-slate-200/70 dark:bg-slate-800 rounded-lg w-64 h-4" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <ListSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Sync */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">User Management</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Platform Role & Permission Registry</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-800 hover:border-careermap-teal hover:text-careermap-teal transition-all shadow-sm"
        >
          <RefreshCw className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} size={16} />
          Sync Registry
        </button>
      </div>

      {/* Modern Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors" size={20} />
          <input
            type="text"
            placeholder="Filter by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-careermap-teal/5 focus:border-careermap-teal outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-6 py-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm focus:ring-4 focus:ring-careermap-teal/5 focus:border-careermap-teal outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="all">Every Role</option>
            <option value="student">Students Only</option>
            <option value="teacher">Teacher Corps</option>
            <option value="bit">BiT Admins</option>
            <option value="admin">Global Admins</option>
          </select>
        </div>
      </div>

      {/* Editorial Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-100 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  User Identity
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Contact
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Access Tier
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Enrolled
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-careermap-navy text-white rounded-2xl flex items-center justify-center font-serif font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-careermap-teal transition-colors">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">ID: #UX00{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {user.email}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                      user.role === 'teacher' ? 'bg-careermap-navy/10 text-careermap-navy border border-careermap-navy/10' :
                      user.role === 'bit' ? 'bg-careermap-teal/10 text-careermap-teal border border-careermap-teal/20' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {user.role === 'admin' && <Shield size={12} />}
                      {user.role === 'teacher' && <Briefcase size={12} />}
                      {user.role === 'bit' && <GraduationCap size={12} />}
                      {user.role === 'student' && <Users size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="relative inline-block text-left">
                       <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="appearance-none pr-8 pl-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border-transparent hover:border-careermap-teal focus:ring-0 outline-none cursor-pointer transition-all"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="bit">BiT Admin</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between px-4">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
           Displaying {filteredUsers.length} active sessions — Registered platform users
        </div>
      </div>
    </div>
  );
};

export default AdminUsersView;
