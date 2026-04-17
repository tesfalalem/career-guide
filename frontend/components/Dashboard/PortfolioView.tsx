import React from 'react';
import { apiClient } from '../../services/apiClient';
import { 
  Download, 
  Share2, 
  Globe, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Github, 
  Linkedin, 
  ExternalLink,
  Edit2,
  Trophy,
  Clock,
  Zap,
  Flame,
  LineChart,
  Shield
} from 'lucide-react';

interface PortfolioViewProps {
  user: {
    id: number | string;
    name: string;
    email: string;
    xp?: number;
    streak?: number;
    created_at?: string;
    academic_year?: string;
  };
  onUserUpdate?: (updatedUser: any) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ user, onUserUpdate }) => {
  const firstName = user.name?.split(' ')[0] ?? user.name;
  const handle = `@${user.name?.toLowerCase().replace(/\s+/g, '') ?? 'user'}-${String(user.id).slice(-4)}`;
  const xp = user.xp ?? 0;
  const streak = user.streak ?? 0;
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editData, setEditData] = React.useState({
    name: user.name,
    academic_year: user.academic_year || ''
  });
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.updateProfile(editData);
      
      const updatedUser = { ...user, ...editData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      academic_year: user.academic_year || ''
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="animate-reveal space-y-10">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest leading-none">Professional Profile</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage your identity and track technical growth</p>
      </header>

      {/* Profile Header/Banner */}
      <div className="relative rounded-[3rem] overflow-hidden dashboard-card shadow-sm">
        <div className="h-64 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex justify-around p-10 pointer-events-none">
             <Flame size={120} className="text-careermap-teal rotate-12" />
             <Trophy size={160} className="text-careermap-teal -rotate-12" />
          </div>
        </div>
        <div className="px-12 pb-12">
          <div className="flex flex-col md:flex-row items-end gap-10 -mt-20 relative z-10">
            <div className="relative group">
               <div className="w-48 h-48 rounded-[2.5rem] bg-[#FDE68A] border-[8px] border-white dark:border-slate-900 flex items-center justify-center overflow-hidden shadow-xl">
                 <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <button onClick={() => setIsEditing(true)} className="absolute -right-2 bottom-4 w-10 h-10 bg-careermap-navy text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                 <Edit2 size={16} />
               </button>
            </div>
            
            <div className="flex-1 mb-4">
              <div className="inline-flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-widest mb-3">
                {handle}
              </div>
              <h2 className="text-6xl font-display font-bold text-primary dark:text-white mb-4">{firstName}</h2>
              <div className="flex flex-wrap items-center gap-6">
                <span className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Zap size={18} className="text-accent fill-accent" /> {xp} Total XP
                </span>
                <span className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Flame size={18} className="text-careermap-teal fill-careermap-teal" /> {streak} Day Streak
                </span>
              </div>
            </div>
            
            <div className="flex gap-4 mb-4">
               <button className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-careermap-teal transition-all">
                 <Share2 size={16} /> Share
               </button>
               {!isEditing && (
                 <button onClick={() => setIsEditing(true)} className="flex items-center gap-3 bg-careermap-navy text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-teal-500/20">
                   <Edit2 size={16} /> Edit Profile
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Editable Info Fields Block */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-400 font-display font-bold text-lg uppercase tracking-widest">Personal Details</h3>
        </div>

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-6 py-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
            ❌ {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-2">Full Name</h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-500">{user.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-2">Academic Year</h4>
                {isEditing ? (
                  <select
                    value={editData.academic_year}
                    onChange={(e) => setEditData({ ...editData, academic_year: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-slate-500">{user.academic_year || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-2">Email Address</h4>
                <p className="text-sm font-medium text-slate-500">{user.email}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Cannot be changed</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-2">User ID</h4>
                <p className="text-sm font-medium text-slate-500 font-mono">{user.id}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">System Generated</p>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-careermap-navy text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-opacity-90 transition-all flex items-center justify-center"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default PortfolioView;
