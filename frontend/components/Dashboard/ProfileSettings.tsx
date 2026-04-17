import React, { useState } from 'react';
import { 
  Volume2, 
  Moon, 
  Accessibility, 
  Mail, 
  Bell, 
  CreditCard, 
  Lock, 
  LogOut,
  ChevronRight,
  User as UserIcon,
  Shield,
  Palette,
  Save,
  X,
  Edit2,
  Loader2
} from 'lucide-react';
import { User } from '../../types';
import { apiClient } from '../../services/apiClient';

interface ProfileSettingsProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onLogout, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    academic_year: user.academic_year || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.updateProfile(editData);
      
      // Update local user object
      const updatedUser = { ...user, ...editData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
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

  const ToggleSwitch = ({ active }: { active?: boolean }) => (
    <div className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${active ? 'bg-careermap-navy' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );

  return (
    <div className="animate-reveal max-w-4xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest leading-none">Settings</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure your personal and institutional preferences</p>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
          <Shield size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
          <X size={20} />
          {error}
        </div>
      )}

      {/* Profile Information Section */}
      <section className="space-y-6">
        <h3 className="text-slate-400 font-display font-bold text-lg uppercase tracking-widest">Profile Information</h3>
        <div className="space-y-4">
          {/* Name Field */}
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <UserIcon size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-2">Full Name</h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-500">{user.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Year Field */}
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 hover:border-slate-200 transition-colors">
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
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

          {/* Email (Read-only) */}
          <div className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary dark:text-white mb-2">Email Address</h4>
                <p className="text-sm font-medium text-slate-500">{user.email}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Cannot be changed</p>
              </div>
            </div>
          </div>

          {/* User ID (Read-only) */}
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

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-careermap-navy text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-careermap-navy/90 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        )}
      </section>

      {/* Preferences Section */}
      <section className="space-y-6">
        <h3 className="text-slate-400 font-display font-bold text-lg uppercase tracking-widest">Personalization</h3>
        <div className="space-y-4">
          {[
            { label: "Interface Theme", icon: <Palette size={20} />, active: true, detail: "Dynamic mode sync" },
            { label: "Sound Profiles", icon: <Volume2 size={20} />, active: true },
            { label: "Institutional Notifications", icon: <Bell size={20} />, active: true },
          ].map((item, i) => (
            <div key={i} className="dashboard-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 flex items-center justify-between hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                   {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-primary dark:text-white">{item.label}</h4>
                  {item.detail && <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.detail}</p>}
                </div>
              </div>
              <ToggleSwitch active={item.active} />
            </div>
          ))}
        </div>
      </section>

      <div className="pt-10 border-t border-careermap-teal/20 dark:border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full bg-red-50 dark:bg-red-950/20 text-red-500 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 border border-red-100 dark:border-red-900/30"
        >
           <LogOut size={18} /> Exit Protocol (Log Out)
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
