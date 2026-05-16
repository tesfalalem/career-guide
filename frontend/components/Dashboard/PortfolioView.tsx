import React from 'react';
import { Trophy, Flame, Shield } from 'lucide-react';

interface PortfolioViewProps {
  user: {
    id: number | string;
    name: string;
    email: string;
    created_at?: string;
    academic_year?: string;
    role?: string;
  };
  onUserUpdate?: (updatedUser: any) => void;
}

// Role → gradient colours
const ROLE_GRADIENTS: Record<string, [string, string]> = {
  student: ['#2563EB', '#0D9488'],
  teacher: ['#0D9488', '#0F766E'],
  admin:   ['#4F46E5', '#7C3AED'],
  bit:     ['#0284C7', '#0369A1'],
};

const PortfolioView: React.FC<PortfolioViewProps> = ({ user }) => {
  const firstName = user.name?.split(' ')[0] ?? user.name;
  const handle = `@${user.name?.toLowerCase().replace(/\s+/g, '') ?? 'user'}-${String(user.id).slice(-4)}`;

  const initial = (user.name?.trim().charAt(0) ?? '?').toUpperCase();
  const role = (user as any).role ?? 'student';
  const [from, to] = ROLE_GRADIENTS[role] ?? ROLE_GRADIENTS.student;

  return (
    <div className="animate-reveal space-y-10">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest leading-none">
          Professional Profile
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
          Your identity and technical growth
        </p>
      </header>

      {/* Profile Header / Banner */}
      <div className="relative rounded-[3rem] overflow-hidden dashboard-card shadow-sm">
        {/* Banner */}
        <div className="h-64 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex justify-around p-10 pointer-events-none">
            <Flame size={120} className="text-careermap-teal rotate-12" />
            <Trophy size={160} className="text-careermap-teal -rotate-12" />
          </div>
        </div>

        <div className="px-12 pb-12">
          <div className="flex flex-col md:flex-row items-end gap-10 -mt-20 relative z-10">

            {/* Static initial avatar — no click, no edit button */}
            <div
              className="w-48 h-48 rounded-[2.5rem] border-[8px] border-white dark:border-slate-900 shadow-xl overflow-hidden shrink-0"
              style={{
                background: `linear-gradient(135deg, ${from}, ${to})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: Math.round(176 * 0.42),
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {initial}
              </span>
            </div>

            {/* Name */}
            <div className="flex-1 mb-4">
              <div className="inline-flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-widest mb-3">
                {handle}
              </div>
              <h2 className="text-6xl font-display font-bold text-primary dark:text-white mb-4">
                {firstName}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details — read-only */}
      <section className="space-y-6">
        <h3 className="text-slate-400 font-display font-bold text-lg uppercase tracking-widest">
          Personal Details
        </h3>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-1">Full Name</h4>
                <p className="text-sm font-medium text-slate-500">{user.name}</p>
              </div>
            </div>
          </div>

          {/* Academic Year */}
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-1">Academic Year</h4>
                <p className="text-sm font-medium text-slate-500">
                  {user.academic_year || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-1">Email Address</h4>
                <p className="text-sm font-medium text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-1">User ID</h4>
                <p className="text-sm font-medium text-slate-500 font-mono">{user.id}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">
                  System Generated
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioView;
