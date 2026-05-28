import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  LineChart, 
  Settings as SettingsIcon, 
  LogOut,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  UserCircle,
  Sun,
  Moon,
  ShieldCheck,
  ChevronsLeft,
  Menu
} from 'lucide-react';
import DashboardHome from './DashboardHome';
import RoadmapGenerator from './RoadmapGenerator';
import ProgressView from './ProgressView';
import CareersView from './CareersView';
import ProfileSettings from './ProfileSettings';
import LibraryView from './LibraryView';
import AssessmentView from './AssessmentView';
import PortfolioView from './PortfolioView';
import CuratedRoadmapsView from './CuratedRoadmapsView';
import NotificationBell from '../common/NotificationBell';
import SupportChatView from './common/SupportChatView';
import { HelpCircle } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import { StudentDashboardLayoutProps } from '../../types';

export type StudentTab = 'overview' | 'roadmaps' | 'progress' | 'careers' | 'courses' | 'assessments' | 'profile' | 'support';

const StudentDashboardLayout: React.FC<StudentDashboardLayoutProps & { initialTab?: string }> = ({ 
  user, 
  onLogout, 
  theme, 
  onToggleTheme, 
  onUserUpdate,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>((initialTab as StudentTab) || 'overview');
  const [selectedCareer, setSelectedCareer] = useState<string | undefined>(undefined);
  const [roadmapView, setRoadmapView] = useState<'curated' | 'ai'>('curated');
  const [openCourseId, setOpenCourseId] = useState<number | null>(null);
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

  // Track if this is the first visit this session
  const [isFirstVisit] = useState<boolean>(() => {
    const visited = sessionStorage.getItem('hasVisited');
    if (!visited) {
      sessionStorage.setItem('hasVisited', 'true');
      return true;
    }
    return false;
  });

  const handleOpenCourseFromRoadmap = (courseId: number) => {
    setOpenCourseId(courseId);
    setActiveTab('courses');
  };

  useEffect(() => {
    if (activeTab !== 'roadmaps') {
      setSelectedCareer(undefined);
      setRoadmapView('curated');
    }
  }, [activeTab]);

  const menuItems = [
    { id: 'overview',    label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'careers',     label: 'Careers', icon: ShieldCheck },
    { id: 'roadmaps',    label: 'Roadmaps',    icon: MapIcon },
    { id: 'courses',     label: 'Courses',     icon: BookOpen },
    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
    { id: 'progress',    label: 'Progress',    icon: LineChart },
    { id: 'profile',     label: 'Profile',     icon: UserCircle },
    { id: 'support',     label: 'Support',     icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardHome 
            user={user} 
            onNavigateToRoadmaps={() => { 
              setActiveTab('roadmaps'); 
              setRoadmapView('curated');
              window.scrollTo(0, 0);
            }} 
            onNavigateToAiGenerator={() => { 
              setActiveTab('roadmaps'); 
              setRoadmapView('ai');
              window.scrollTo(0, 0);
            }}
            onNavigateToAssessments={() => { setActiveTab('assessments'); window.scrollTo(0, 0); }} 
            onOpenCourse={() => { setActiveTab('courses'); window.scrollTo(0, 0); }} 
            onNavigateToCareers={() => { setActiveTab('careers'); window.scrollTo(0, 0); }} 
          />
        );
      case 'roadmaps':
        return roadmapView === 'curated'
          ? <CuratedRoadmapsView onGenerateCustom={() => setRoadmapView('ai')} onOpenCourse={handleOpenCourseFromRoadmap} />
          : <RoadmapGenerator userId={user.id} initialQuery={selectedCareer} onBackToCurated={() => setRoadmapView('curated')} />;
      case 'progress':
        return <ProgressView userId={user.id} />;
      case 'courses':
        return <LibraryView userId={user.id} openCourseId={openCourseId} onCourseOpened={() => setOpenCourseId(null)} />;
      case 'assessments':
        return <AssessmentView userId={user.id} />;
      case 'careers':
        return <CareersView />;
      case 'profile':
        return <PortfolioView user={user} onUserUpdate={onUserUpdate} />;
      case 'support':
        return (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h2>
              <p className="text-slate-500 dark:text-slate-400">Ask us anything about the platform.</p>
            </div>
            <SupportChatView currentUser={user} />
          </div>
        );
      default:
        return (
          <DashboardHome 
            user={user} 
            onNavigateToRoadmaps={() => { 
              setActiveTab('roadmaps'); 
              setRoadmapView('curated');
              window.scrollTo(0, 0);
            }} 
            onNavigateToAiGenerator={() => { 
              setActiveTab('roadmaps'); 
              setRoadmapView('ai');
              window.scrollTo(0, 0);
            }}
            onNavigateToAssessments={() => { setActiveTab('assessments'); window.scrollTo(0, 0); }} 
            onOpenCourse={() => { setActiveTab('courses'); window.scrollTo(0, 0); }} 
            onNavigateToCareers={() => { setActiveTab('careers'); window.scrollTo(0, 0); }} 
          />
        );
    }
  };

  return (
    <div data-testid="student-dashboard" className="h-screen bg-[#f8fafc] dark:bg-slate-950 flex font-sans relative overflow-hidden">
      {/* Global Background Image */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06] z-0 overflow-hidden">
        <img 
          src="/dashboard-bg.png" 
          alt="" 
          className="w-full h-full object-cover scale-105 blur-2xl"
        />
      </div>
      {/* Sidebar */}
      <aside 
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '64px' }}
        className={`bg-careermap-navy text-white flex flex-col h-screen sticky top-0 ${isResizing ? '' : 'transition-all duration-300'} shrink-0 shadow-2xl z-40 relative group`}>
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
                <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Student Portal</div>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-10 h-10 bg-careermap-teal rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-careermap-teal/20">
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
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as StudentTab)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id
                  ? 'bg-careermap-teal text-white shadow-lg shadow-teal-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
            >
              <item.icon size={20} className={`shrink-0 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar
                  name={user.name}
                  imageUrl={(user as any).profile_image}
                  role={user.role}
                  size={44}
                  className="rounded-xl border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate leading-tight">{user.name}</div>
                  <div className="text-[10px] text-white/50 font-black uppercase tracking-widest mt-0.5">{user.role}</div>
                </div>
              </div>
              <button onClick={onToggleTheme}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all mb-2">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
              <button onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button onClick={onToggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={onLogout} title="Logout"
                className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
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
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <Menu size={20} />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-serif font-black text-careermap-navy dark:text-white tracking-tight">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h1>

              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardLayout;
