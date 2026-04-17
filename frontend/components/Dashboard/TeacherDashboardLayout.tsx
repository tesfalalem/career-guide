import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Upload, BookOpen, Users,
  Settings as SettingsIcon, LogOut, UserCircle,
  Sun, Moon, BarChart3, GraduationCap, Clock,
  ChevronsLeft, Menu
} from 'lucide-react';
import TeacherOverview from './Teacher/TeacherOverview';
import TeacherResourcesView from './TeacherResourcesView';
import TeacherStudentsView from './Teacher/TeacherStudentsView';
import TeacherCourseSelection from './Teacher/TeacherCourseSelection';
import TeacherAnalyticsView from './Teacher/TeacherAnalyticsView';
import TeacherProfileView from './Teacher/TeacherProfileView';
import TeacherSettingsView from './Teacher/TeacherSettingsView';
import NotificationBell from '../common/NotificationBell';
import { TeacherDashboardLayoutProps, TeacherStats } from '../../types';

export type TeacherTab = 'overview' | 'resources' | 'students' | 'analytics' | 'profile' | 'settings';

const TeacherDashboardLayout: React.FC<TeacherDashboardLayoutProps> = ({ 
  user, 
  onLogout, 
  theme, 
  onToggleTheme,
  onUserUpdate 
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 200 && newWidth <= 480) {
        setSidebarWidth(newWidth);
      } else if (newWidth < 100) {
        setSidebarOpen(false);
        setIsResizing(false);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);
  const [courseSelected, setCourseSelected] = useState(true);
  const [assignmentStatus, setAssignmentStatus] = useState<'none'|'pending'|'approved'|'rejected'>('none');
  const [stats, setStats] = useState<TeacherStats>({
    totalResources: 0, approvedResources: 0, pendingResources: 0,
    rejectedResources: 0, totalRoadmaps: 0, totalStudents: 0
  });

  useEffect(() => { checkAssignment(); }, []);

  const checkAssignment = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/api/course-assignments/my', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data) { setCourseSelected(false); setAssignmentStatus('none'); }
      else { setCourseSelected(true); setAssignmentStatus(data.status); }
    } catch { setCourseSelected(true); }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'resources', label: 'My Resources', icon: Upload },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeacherOverview stats={stats} onNavigate={setActiveTab} />;
      case 'resources':
        return <TeacherResourcesView />;
      case 'students':
        return <TeacherStudentsView />;
      case 'analytics':
        return <TeacherAnalyticsView />;
      case 'profile':
        return <TeacherProfileView />;
      case 'settings':
        return <TeacherSettingsView />;
      default:
        return <TeacherOverview stats={stats} onNavigate={setActiveTab} />;
    }
  };

  // Course selection gate — first login, no course selected yet
  if (!courseSelected) {
    return <TeacherCourseSelection teacherName={user.name} onSelected={() => { setCourseSelected(true); checkAssignment(); }} />;
  }

  // Pending approval gate
  if (user.account_status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-amber-500" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-careermap-navy dark:text-white mb-3">
            Pending Approval
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            Your teacher account is under review. An admin will verify your credentials and approve your account shortly.
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
            You'll be able to access the Teacher Portal once approved.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">
              Logged in as: {user.name}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all mx-auto"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="teacher-dashboard" className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex font-sans">
      {/* Sidebar */}
      <aside 
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '64px' }}
        className={`bg-careermap-navy text-white flex flex-col h-screen ${isResizing ? '' : 'transition-all duration-300'} shrink-0 shadow-2xl z-40 relative group`}>
        {/* Resize Handle */}
        {sidebarOpen && (
          <div
            onMouseDown={startResizing}
            className={`absolute top-0 -right-1 w-2 h-full cursor-col-resize z-50 transition-colors ${isResizing ? 'bg-careermap-teal' : 'group-hover:bg-careermap-teal/20'}`}
          />
        )}
        {/* Logo */}
        <div className="p-6 border-b border-white/10 shrink-0 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-careermap-teal rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                <GraduationCap className="text-white" size={20} />
              </div>
              <div className="min-w-0">
                <div className="font-serif font-bold text-white text-lg tracking-tight truncate leading-tight">CareerGuide</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Teacher Portal</div>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-10 h-10 bg-careermap-teal rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
              <GraduationCap className="text-white" size={20} />
            </div>
          )}
          {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} title="Collapse sidebar"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0 ml-2">
                <ChevronsLeft size={18} />
              </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as TeacherTab)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id
                  ? 'bg-careermap-teal text-white shadow-lg shadow-teal-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              } ${!sidebarOpen ? 'justify-center' : ''}`}>
              <item.icon size={20} className={`shrink-0 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-white/10 shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-careermap-teal font-bold">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate">{user.name}</div>
                  <div className="text-xs text-white/50 capitalize">{user.role}</div>
                </div>
              </div>
              <button onClick={onToggleTheme} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg font-semibold text-sm hover:bg-white/10 hover:text-white transition-all mb-2">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-semibold text-sm hover:bg-red-500/20 transition-all">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button onClick={onToggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={onLogout} title="Logout" className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} title="Expand sidebar"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <Menu size={20} />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-serif font-black text-careermap-navy dark:text-white tracking-tight">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Manage your educational content and track student progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3"><NotificationBell /></div>
          </div>
        </header>

        {/* Pending assignment banner */}
        {assignmentStatus === 'pending' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-8 py-3 flex items-center gap-3">
            <Clock size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">
              Your course assignment request is pending admin approval. Some features are limited until approved.
            </p>
          </div>
        )}
        {assignmentStatus === 'rejected' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-8 py-3 flex items-center gap-3">
            <Clock size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
              Your course assignment was rejected. Please contact the admin or select a different course.
            </p>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboardLayout;
