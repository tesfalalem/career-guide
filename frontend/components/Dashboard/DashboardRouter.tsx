import React, { lazy, Suspense } from 'react';
import { DashboardRouterProps } from '../../types';

const StudentDashboardLayout = lazy(() => import('./StudentDashboardLayout'));
const TeacherDashboardLayout = lazy(() => import('./TeacherDashboardLayout'));
const AdminDashboardLayout = lazy(() => import('./AdminDashboardLayout'));
const BiTDashboardLayout = lazy(() => import('./BiTDashboardLayout'));

const DashboardLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading Dashboard...</p>
    </div>
  </div>
);

const DashboardRouter: React.FC<DashboardRouterProps & { initialTab?: string }> = ({ user, initialTab, ...props }) => {
  switch (user.role) {
    case 'student':
      return <Suspense fallback={<DashboardLoadingFallback />}><StudentDashboardLayout user={user} initialTab={initialTab} {...props} /></Suspense>;
    case 'teacher':
      return <Suspense fallback={<DashboardLoadingFallback />}><TeacherDashboardLayout user={user} initialTab={initialTab} {...props} /></Suspense>;
    case 'admin':
      return <Suspense fallback={<DashboardLoadingFallback />}><AdminDashboardLayout user={user} initialTab={initialTab} {...props} /></Suspense>;
    case 'bit':
      return <Suspense fallback={<DashboardLoadingFallback />}><BiTDashboardLayout user={user as any} initialTab={initialTab} {...props} /></Suspense>;
    default:
      console.error('Invalid user role detected:', user.role);
      return (
        <>
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-6 py-3 text-center">
            <p className="font-semibold">⚠️ Account role error. Please contact support.</p>
          </div>
          <Suspense fallback={<DashboardLoadingFallback />}><StudentDashboardLayout user={user as any} {...props} /></Suspense>
        </>
      );
  }
};

export default DashboardRouter;
