import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Briefcase, Calendar, RefreshCw, BookOpen } from 'lucide-react';
import { adminService } from '../../../services/adminService';

interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  role_request: string;
  account_status: string;
  institution?: string;
  years_experience?: number;
  expertise_areas?: string[];
  qualifications?: string[];
  bio?: string;
  requested_at: string;
  created_at: string;
}

const AdminApprovalsView: React.FC = () => {
  const [tab, setTab] = useState<'teachers' | 'courses'>('teachers');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchPendingApprovals(); fetchCourseAssignments(); }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingApprovals();
      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (error) { setPendingUsers([]); }
    finally { setLoading(false); }
  };

  const fetchCourseAssignments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/api/course-assignments/pending', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCourseAssignments(Array.isArray(data) ? data : []);
    } catch { setCourseAssignments([]); }
  };

  const handleApproveCourse = async (id: number) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:8000/api/course-assignments/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ notes }) });
      fetchCourseAssignments(); setNotes('');
    } catch { alert('Failed'); }
    finally { setActionLoading(false); }
  };

  const handleRejectCourse = async (id: number) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:8000/api/course-assignments/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ notes }) });
      fetchCourseAssignments(); setNotes('');
    } catch { alert('Failed'); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminService.approveRoleRequest(userId, notes);
      await fetchPendingApprovals();
      setSelectedUser(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminService.rejectRoleRequest(userId, notes);
      await fetchPendingApprovals();
      setSelectedUser(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to reject user:', error);
      alert('Failed to reject user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-careermap-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-careermap-navy dark:text-white">Pending Approvals</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Review teacher registrations and course assignment requests</p>
        </div>
        <button onClick={() => { fetchPendingApprovals(); fetchCourseAssignments(); }} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-careermap-navy/5 dark:bg-slate-800 text-careermap-navy dark:text-white rounded-xl font-semibold hover:bg-careermap-navy/10 dark:hover:bg-slate-700 transition-all disabled:opacity-50">
          <RefreshCw className={loading ? 'animate-spin' : ''} size={18} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('teachers')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'teachers' ? 'bg-white dark:bg-slate-900 text-careermap-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Teacher Registrations {pendingUsers.length > 0 && <span className="ml-1.5 bg-careermap-navy/10 text-careermap-navy text-xs px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>}
        </button>
        <button onClick={() => setTab('courses')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'courses' ? 'bg-white dark:bg-slate-900 text-careermap-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Course Assignments {courseAssignments.length > 0 && <span className="ml-1.5 bg-careermap-teal/10 text-careermap-teal text-xs px-1.5 py-0.5 rounded-full">{courseAssignments.length}</span>}
        </button>
      </div>

      {/* ── Teacher Registrations Tab ── */}
      {tab === 'teachers' && (
        pendingUsers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">All Caught Up!</h3>
            <p className="text-slate-500 mt-2">No pending role requests at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-careermap-navy/5 rounded-full flex items-center justify-center">
                      <User className="text-careermap-navy" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-careermap-navy dark:text-white">{user.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase size={16} className="text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Requesting: <span className="font-semibold text-careermap-teal capitalize">{user.role_request}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Requested: {formatDate(user.requested_at)}
                      </span>
                    </div>
                  </div>

                  {user.role_request === 'teacher' && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                      {user.institution && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">Institution</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{user.institution}</p>
                        </div>
                      )}
                      {user.years_experience && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">Experience</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{user.years_experience} years</p>
                        </div>
                      )}
                      {user.expertise_areas && user.expertise_areas.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">Expertise</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {user.expertise_areas.map((area, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-careermap-teal/10 text-careermap-teal text-xs rounded-lg font-medium"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.qualifications && user.qualifications.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">Qualifications</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{user.qualifications.join(', ')}</p>
                        </div>
                      )}
                      {user.bio && (
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase">Bio</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {selectedUser?.id === user.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes (optional)..."
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                      rows={2}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setNotes('');
                        }}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="w-full px-4 py-2 bg-careermap-navy text-white rounded-lg font-semibold hover:bg-[#023058] transition-all"
                  >
                    Review Application
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* ── Course Assignments Tab ── */}
      {tab === 'courses' && (
        <div className="space-y-4">
          {courseAssignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <BookOpen size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">No Pending Course Requests</h3>
              <p className="text-slate-500 mt-2">All teacher course assignments are up to date</p>
            </div>
          ) : courseAssignments.map((a: any) => (
            <div key={a.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-careermap-navy/5 rounded-full flex items-center justify-center shrink-0">
                  <User className="text-careermap-navy" size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-careermap-navy dark:text-white text-lg">{a.teacher_name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><Mail size={13} /> {a.teacher_email}</p>
                  {a.institution && <p className="text-sm text-slate-500 mt-1">Institution: {a.institution}</p>}
                </div>
                <span className="text-xs text-slate-400">{new Date(a.requested_at).toLocaleDateString()}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Requested Course</p>
                <p className="font-bold text-careermap-navy dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-careermap-teal" /> {a.course_title}
                </p>
                <p className="text-xs text-slate-400 mt-1">{a.category}</p>
              </div>
              <div className="space-y-3">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none text-sm" rows={2} />
                <div className="flex gap-3">
                  <button onClick={() => handleApproveCourse(a.id)} disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50">
                    <CheckCircle size={16} /> {actionLoading ? 'Processing...' : 'Approve Assignment'}
                  </button>
                  <button onClick={() => handleRejectCourse(a.id)} disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50">
                    <XCircle size={16} /> {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApprovalsView;
