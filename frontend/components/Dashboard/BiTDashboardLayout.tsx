import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, BookOpen, Map, LogOut, Sun, Moon, GraduationCap,
  ChevronsLeft, Menu
} from 'lucide-react';
import BiTOverview from './BiT/BiTOverview';
import BiTRoadmapsView from './BiT/BiTRoadmapsView';
import BiTCoursesView from './BiT/BiTCoursesView';
import NotificationBell from '../common/NotificationBell';
import { BiTDashboardLayoutProps } from '../../types';

type BiTTab = 'overview' | 'roadmaps' | 'courses';

const BiTDashboardLayout: React.FC<BiTDashboardLayoutProps> = ({
  user, onLogout, theme, onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<BiTTab>('overview');
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

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'roadmaps', label: 'Roadmaps', icon: Map },
    { id: 'courses', label: 'Courses', icon: BookOpen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <BiTOverview onNavigate={tab => setActiveTab(tab as BiTTab)} />;
      case 'roadmaps': return <BiTRoadmapsView />;
      case 'courses':  return <BiTCoursesView />;
      default:         return <BiTOverview onNavigate={tab => setActiveTab(tab as BiTTab)} />;
    }
  };

  return (
    <div data-testid="bit-dashboard" className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-sans">
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
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-careermap-teal rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-careermap-teal/20">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <div className="min-w-0">
                  <div className="font-serif font-bold text-white truncate text-lg tracking-tight">BiT Portal</div>
                  <div className="text-[10px] text-careermap-teal font-bold uppercase tracking-widest opacity-80">Tech Education</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} title="Collapse"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0 ml-2">
                <ChevronsLeft size={18} />
              </button>
            </>
          ) : (
            <div className="w-10 h-10 bg-careermap-teal rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-careermap-teal/20">
              <GraduationCap className="text-white" size={20} />
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as BiTTab)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === item.id ? 'bg-careermap-teal text-white shadow-lg shadow-careermap-teal/20' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${!sidebarOpen ? 'justify-center' : ''}`}>
              <item.icon size={20} className={`shrink-0 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-careermap-teal/20 rounded-xl flex items-center justify-center shrink-0 border border-careermap-teal/30">
                  <span className="text-careermap-teal font-serif font-bold text-lg">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">BiT Academic Admin</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={onToggleTheme} className="flex items-center justify-center p-2.5 bg-white/5 text-slate-400 rounded-xl hover:text-white hover:bg-white/10 transition-all" title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <button onClick={onLogout} className="flex items-center justify-center p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button onClick={onToggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'} className="p-2 rounded-lg text-slate-400 hover:bg-white/10 transition-all">
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
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} title="Expand sidebar"
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800">
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-careermap-teal animate-pulse" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Academic Content Management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 hidden sm:block">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Institution</div>
              <div className="text-xs font-bold text-slate-700 dark:text-white truncate max-w-[120px]">Bahir Dar Tech</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default BiTDashboardLayout;
