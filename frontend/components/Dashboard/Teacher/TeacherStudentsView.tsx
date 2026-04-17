import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, MessageSquare, Star, Eye, Download, Send, X, Loader2 } from 'lucide-react';

interface Student {
  student_id: number;
  student_name: string;
  student_email: string;
  total_resources_accessed: number;
  total_resources_completed: number;
  total_time_spent: number;
  average_rating: number;
  last_activity_at: string;
  engagement_score: number;
  risk_level: 'low' | 'medium' | 'high';
  active_resources: number;
  unread_feedback_count: number;
}

interface StudentProgress {
  resource_id: number;
  resource_title: string;
  resource_type: string;
  category: string;
  status: string;
  progress_percentage: number;
  time_spent_total: number;
  last_accessed_at: string;
  rating: number | null;
}

const TeacherStudentsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/teacher/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      // Show error state instead of mock data
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/teacher/students/${studentId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudentProgress(data.progress || []);
      }
    } catch (error) {
      console.error('Failed to fetch student progress:', error);
      setStudentProgress([]);
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentProgress(student.student_id);
  };

  const handleSendFeedback = async () => {
    if (!selectedStudent || !feedbackSubject || !feedbackMessage) return;

    setSendingFeedback(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/teacher/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_user_id: selectedStudent.student_id,
          subject: feedbackSubject,
          message: feedbackMessage
        })
      });

      if (response.ok) {
        setShowFeedbackModal(false);
        setFeedbackSubject('');
        setFeedbackMessage('');
        alert('Feedback sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setSendingFeedback(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'all' || student.risk_level === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle size={16} />;
      case 'medium': return <Clock size={16} />;
      case 'high': return <AlertTriangle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary dark:text-white flex items-center gap-3">
            <Users size={28} />
            Student Monitoring
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track student engagement, progress, and provide feedback
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="px-4 py-2 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary dark:text-white">{students.length}</div>
              <div className="text-sm text-slate-500">Total Students</div>
            </div>
            <Users className="text-careermap-teal" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {students.filter(s => s.risk_level === 'low').length}
              </div>
              <div className="text-sm text-slate-500">High Engagement</div>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {students.filter(s => s.risk_level === 'medium').length}
              </div>
              <div className="text-sm text-slate-500">Medium Engagement</div>
            </div>
            <Clock className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {students.filter(s => s.risk_level === 'high').length}
              </div>
              <div className="text-sm text-slate-500">At Risk</div>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'low', 'medium', 'high'].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk as any)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all capitalize ${
                  filterRisk === risk
                    ? 'bg-careermap-navy text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {risk === 'all' ? 'All' : `${risk} Risk`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-careermap-teal" size={48} />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={64} />
          <h3 className="text-xl font-bold text-primary dark:text-white mb-2">No Students Found</h3>
          <p className="text-slate-500">
            {searchTerm || filterRisk !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Students will appear here once they start using your resources'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-careermap-navy/10 rounded-full flex items-center justify-center">
                          <span className="text-careermap-teal font-bold">{student.student_name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-primary dark:text-white">{student.student_name}</div>
                          <div className="text-sm text-slate-500">{student.student_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-primary dark:text-white">
                              {student.engagement_score}%
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${getRiskColor(student.risk_level)}`}>
                              {getRiskIcon(student.risk_level)}
                              {student.risk_level}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                student.risk_level === 'low' ? 'bg-green-500' :
                                student.risk_level === 'medium' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${student.engagement_score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-primary dark:text-white">
                          {student.total_resources_completed}/{student.total_resources_accessed}
                        </div>
                        <div className="text-slate-500">completed</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-primary dark:text-white">
                        {formatTime(student.total_time_spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="text-orange-500 fill-orange-500" size={16} />
                        <span className="text-sm font-semibold text-primary dark:text-white">
                          {student.average_rating > 0 ? student.average_rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500">
                        {formatDate(student.last_activity_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="px-4 py-2 bg-careermap-navy text-white rounded-lg font-semibold text-sm hover:bg-[#023058] transition-all"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-careermap-navy/10 rounded-full flex items-center justify-center">
                  <span className="text-careermap-teal font-bold text-xl">{selectedStudent.student_name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary dark:text-white">{selectedStudent.student_name}</h3>
                  <p className="text-sm text-slate-500">{selectedStudent.student_email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary dark:text-white">{selectedStudent.engagement_score}%</div>
                  <div className="text-sm text-slate-500">Engagement</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary dark:text-white">
                    {selectedStudent.total_resources_completed}/{selectedStudent.total_resources_accessed}
                  </div>
                  <div className="text-sm text-slate-500">Completed</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary dark:text-white">
                    {formatTime(selectedStudent.total_time_spent)}
                  </div>
                  <div className="text-sm text-slate-500">Time Spent</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-1">
                    <Star className="text-orange-500 fill-orange-500" size={20} />
                    <span className="text-2xl font-bold text-primary dark:text-white">
                      {selectedStudent.average_rating > 0 ? selectedStudent.average_rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">Avg Rating</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all"
                >
                  <MessageSquare size={20} />
                  Send Feedback
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  <Eye size={20} />
                  View History
                </button>
              </div>

              {/* Progress List */}
              <div>
                <h4 className="text-lg font-bold text-primary dark:text-white mb-4">Resource Progress</h4>
                {studentProgress.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No progress data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentProgress.map((progress) => (
                      <div key={progress.resource_id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-primary dark:text-white">{progress.resource_title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                                {progress.resource_type}
                              </span>
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full">
                                {progress.category}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                progress.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                progress.status === 'in_progress' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                                'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                              }`}>
                                {progress.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          {progress.rating && (
                            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/20 px-3 py-1 rounded-lg">
                              <Star className="text-orange-500 fill-orange-500" size={14} />
                              <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{progress.rating}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-semibold text-primary dark:text-white">{progress.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-careermap-teal h-2 rounded-full transition-all"
                              style={{ width: `${progress.progress_percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Time: {formatTime(progress.time_spent_total)}</span>
                            <span>Last accessed: {formatDate(progress.last_accessed_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary dark:text-white">Send Feedback</h3>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">To: {selectedStudent.student_name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder="Enter feedback subject..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={6}
                  placeholder="Write your feedback message..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendFeedback}
                  disabled={sendingFeedback || !feedbackSubject || !feedbackMessage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingFeedback ? (
                    <><Loader2 className="animate-spin" size={20} /> Sending...</>
                  ) : (
                    <><Send size={20} /> Send Feedback</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsView;