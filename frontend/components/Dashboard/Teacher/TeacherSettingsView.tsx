import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Lock, Eye, Globe, Save, Mail, Phone, Building, Loader2, CheckCircle, RefreshCw, X } from 'lucide-react';
import { teacherService } from '../../../services/teacherService';

const TeacherSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy' | 'teaching'>('account');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    resourceApprovalAlerts: true,
    studentFeedbackAlerts: true,
    weeklyReport: true,
    privacyShowEmail: false,
    privacyShowPhone: false,
    privacyPublicProfile: true
  });

  // Account data state
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    bio: '',
    linkedin: '',
    website: ''
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNewStudent: true,
    emailFeedback: true,
    emailResourceApproved: true,
    emailResourceRejected: true,
    emailWeeklySummary: true,
    pushNewStudent: true,
    pushFeedback: true,
    pushResourceStatus: true
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLinkedIn: true,
    allowMessages: true,
    showStats: true
  });

  // Teaching preferences state
  const [teaching, setTeaching] = useState({
    allowResourceDownload: true,
    requireFeedback: false,
    defaultResourceVisibility: 'pending',
    maxStudentsPerResource: 0,
    preferredCategories: [] as string[]
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load profile data for account tab
      const profileResponse = await teacherService.getProfile();
      if (profileResponse.success && profileResponse.profile) {
        const profile = profileResponse.profile;
        setAccountData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone_number || '',
          institution: profile.institution || '',
          bio: profile.bio || '',
          linkedin: profile.linkedin_url || '',
          website: profile.website_url || ''
        });
      }

      // Load settings if endpoint exists
      try {
        const response = await teacherService.getSettings();
        if (response.success && response.settings) {
          setSettings({
            emailNotifications: response.settings.email_notifications,
            pushNotifications: response.settings.push_notifications,
            resourceApprovalAlerts: response.settings.resource_approval_alerts,
            studentFeedbackAlerts: response.settings.student_feedback_alerts,
            weeklyReport: response.settings.weekly_report,
            privacyShowEmail: response.settings.privacy_show_email,
            privacyShowPhone: response.settings.privacy_show_phone,
            privacyPublicProfile: response.settings.privacy_public_profile
          });
        }
      } catch (settingsErr) {
        // Settings endpoint might not exist yet, use defaults
        console.log('Settings endpoint not available, using defaults');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await teacherService.updateSettings(settings);
      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Eye },
    { id: 'teaching' as const, label: 'Teaching', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-careermap-teal" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <CheckCircle size={20} />
          Settings saved successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <X size={20} />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary dark:text-white flex items-center gap-3">
            <Settings size={28} />
            Settings
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="animate-spin" size={20} /> Saving...</>
          ) : saved ? (
            <><CheckCircle size={20} /> Saved!</>
          ) : (
            <><Save size={20} /> Save Changes</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-careermap-navy text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary dark:text-white mb-6">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={accountData.name}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="tel"
                    value={accountData.phone}
                    onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-primary dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Institution
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={accountData.institution}
                    onChange={(e) => setAccountData({ ...accountData, institution: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-primary dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Professional Bio
              </label>
              <textarea
                value={accountData.bio}
                onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="url"
                    value={accountData.linkedin}
                    onChange={(e) => setAccountData({ ...accountData, linkedin: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="url"
                    value={accountData.website}
                    onChange={(e) => setAccountData({ ...accountData, website: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-primary dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-lg font-bold text-primary dark:text-white mb-4">Change Password</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary dark:text-white mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-primary dark:text-white mb-4">Email Notifications</h4>
                <div className="space-y-3">
                  {[
                    { key: 'emailNewStudent', label: 'New student using your resources', desc: 'Get notified when a student starts using your content' },
                    { key: 'emailFeedback', label: 'New feedback from students', desc: 'Receive email when students leave feedback' },
                    { key: 'emailResourceApproved', label: 'Resource approved', desc: 'Notification when admin approves your resource' },
                    { key: 'emailResourceRejected', label: 'Resource rejected', desc: 'Notification when admin rejects your resource' },
                    { key: 'emailWeeklySummary', label: 'Weekly summary report', desc: 'Get a weekly overview of your teaching activity' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications] as boolean}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-primary dark:text-white">{item.label}</div>
                        <div className="text-sm text-slate-500 mt-1">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-primary dark:text-white mb-4">Push Notifications</h4>
                <div className="space-y-3">
                  {[
                    { key: 'pushNewStudent', label: 'New student notifications', desc: 'Real-time alerts for new students' },
                    { key: 'pushFeedback', label: 'Feedback notifications', desc: 'Instant alerts for new feedback' },
                    { key: 'pushResourceStatus', label: 'Resource status updates', desc: 'Get notified about resource approval status' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications] as boolean}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-primary dark:text-white">{item.label}</div>
                        <div className="text-sm text-slate-500 mt-1">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary dark:text-white mb-6">Privacy & Visibility</h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Profile Visibility
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                  { value: 'students', label: 'Students Only', desc: 'Only students using your resources can see your profile' },
                  { value: 'private', label: 'Private', desc: 'Your profile is hidden from everyone' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option.value}
                      checked={privacy.profileVisibility === option.value}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value as any })}
                      className="mt-1 w-5 h-5 text-careermap-teal focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary dark:text-white">{option.label}</div>
                      <div className="text-sm text-slate-500 mt-1">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary dark:text-white mb-4">Contact Information</h4>
              <div className="space-y-3">
                {[
                  { key: 'showEmail', label: 'Show email address', desc: 'Display your email on your public profile' },
                  { key: 'showPhone', label: 'Show phone number', desc: 'Display your phone number on your profile' },
                  { key: 'showLinkedIn', label: 'Show LinkedIn profile', desc: 'Display link to your LinkedIn profile' }
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={privacy[item.key as keyof typeof privacy] as boolean}
                      onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                      className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary dark:text-white">{item.label}</div>
                      <div className="text-sm text-slate-500 mt-1">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary dark:text-white mb-4">Other Settings</h4>
              <div className="space-y-3">
                {[
                  { key: 'allowMessages', label: 'Allow direct messages', desc: 'Students can send you direct messages' },
                  { key: 'showStats', label: 'Show statistics', desc: 'Display your teaching statistics on your profile' }
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={privacy[item.key as keyof typeof privacy] as boolean}
                      onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                      className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary dark:text-white">{item.label}</div>
                      <div className="text-sm text-slate-500 mt-1">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teaching Preferences */}
        {activeTab === 'teaching' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary dark:text-white mb-6">Teaching Preferences</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-primary dark:text-white mb-4">Resource Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={teaching.allowResourceDownload}
                      onChange={(e) => setTeaching({ ...teaching, allowResourceDownload: e.target.checked })}
                      className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary dark:text-white">Allow resource downloads</div>
                      <div className="text-sm text-slate-500 mt-1">Students can download your resources for offline use</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={teaching.requireFeedback}
                      onChange={(e) => setTeaching({ ...teaching, requireFeedback: e.target.checked })}
                      className="mt-1 w-5 h-5 text-secondary rounded focus:ring-2 focus:ring-secondary"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-primary dark:text-white">Require feedback after completion</div>
                      <div className="text-sm text-slate-500 mt-1">Students must provide feedback when completing resources</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Default Resource Visibility
                </label>
                <select
                  value={teaching.defaultResourceVisibility}
                  onChange={(e) => setTeaching({ ...teaching, defaultResourceVisibility: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                >
                  <option value="pending">Pending (requires admin approval)</option>
                  <option value="public">Public (immediately visible)</option>
                </select>
                <p className="text-sm text-slate-500 mt-2">How new resources should be published by default</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Maximum Students Per Resource (0 = unlimited)
                </label>
                <input
                  type="number"
                  min="0"
                  value={teaching.maxStudentsPerResource}
                  onChange={(e) => setTeaching({ ...teaching, maxStudentsPerResource: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                />
                <p className="text-sm text-slate-500 mt-2">Limit the number of students who can access each resource</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Preferred Teaching Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'UI/UX Design'].map((category) => (
                    <label key={category} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={teaching.preferredCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTeaching({ ...teaching, preferredCategories: [...teaching.preferredCategories, category] });
                          } else {
                            setTeaching({ ...teaching, preferredCategories: teaching.preferredCategories.filter(c => c !== category) });
                          }
                        }}
                        className="w-4 h-4 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-primary dark:text-white">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSettingsView;
