import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, Globe, Database, Mail, Key, CheckCircle } from 'lucide-react';

const AdminSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'system'>('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    // General
    platformName: 'CareerGuide',
    platformDescription: 'AI-Powered Career Guidance Platform',
    supportEmail: 'support@careerguide.com',
    maintenanceMode: false,
    
    // Security
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Notifications
    emailNotifications: true,
    systemAlerts: true,
    userRegistrationAlerts: true,
    contentModerationAlerts: true,
    
    // System
    autoApproveResources: false,
    autoApproveTeachers: false,
    enableAnalytics: true,
    enableLogging: true
  });

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'system' as const, label: 'System', icon: Database }
  ];

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-8 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest flex items-center gap-4 animate-nav-reveal shadow-sm">
          <CheckCircle size={24} className="text-emerald-500" />
          Protocol Synchronized: Settings persist to master registry.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white flex items-center gap-4">
            <div className="w-1.5 h-8 bg-careermap-teal rounded-full" />
            Configuration Tier
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest leading-loose">Establish platform-wide operational directives</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-careermap-navy/90 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
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
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-careermap-navy text-white shadow-xl shadow-navy-500/20'
                  : 'text-slate-400 dark:text-slate-500 hover:text-careermap-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-careermap-teal/5 rounded-full blur-3xl -mr-32 -mt-32" />
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 pb-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
              <Globe size={14} className="text-careermap-teal" />
              General Platform Directive
            </h3>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Platform Designation
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-careermap-teal focus:border-transparent outline-none transition-all text-careermap-navy dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Mission Statement
              </label>
              <textarea
                value={settings.platformDescription}
                onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
                rows={3}
                className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-careermap-teal focus:border-transparent outline-none transition-all text-careermap-navy dark:text-white font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-start gap-5 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-[1.5rem] cursor-pointer hover:bg-careermap-navy/5 transition-all group border border-transparent hover:border-careermap-navy/10">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="mt-1 w-6 h-6 text-careermap-teal rounded-lg focus:ring-2 focus:ring-careermap-teal border-slate-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-careermap-navy dark:text-white text-base">Platform Lockdown (Maintenance)</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Avert platform traffic for critical maintenance protocols</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 pb-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
              <Shield size={14} className="text-emerald-500" />
              Security & Credentialing Firewall
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-5 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-[1.5rem] cursor-pointer hover:bg-emerald-500/5 transition-all group border border-transparent hover:border-emerald-500/10">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                  className="mt-1 w-6 h-6 text-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 border-slate-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-careermap-navy dark:text-white text-base">Enforce SMTP Handshake</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Require identity verification via email before granting entry</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.enableTwoFactor}
                  onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">Enable Two-Factor Authentication</div>
                  <div className="text-sm text-slate-500 mt-1">Allow users to enable 2FA for enhanced security</div>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary dark:text-white mb-6">Notification Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">Email Notifications</div>
                  <div className="text-sm text-slate-500 mt-1">Send email notifications to admins</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.systemAlerts}
                  onChange={(e) => setSettings({ ...settings, systemAlerts: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">System Alerts</div>
                  <div className="text-sm text-slate-500 mt-1">Receive alerts for system events and errors</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.userRegistrationAlerts}
                  onChange={(e) => setSettings({ ...settings, userRegistrationAlerts: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">User Registration Alerts</div>
                  <div className="text-sm text-slate-500 mt-1">Get notified when new users register</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.contentModerationAlerts}
                  onChange={(e) => setSettings({ ...settings, contentModerationAlerts: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">Content Moderation Alerts</div>
                  <div className="text-sm text-slate-500 mt-1">Receive alerts for pending content approvals</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary dark:text-white mb-6">System Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.autoApproveResources}
                  onChange={(e) => setSettings({ ...settings, autoApproveResources: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">Auto-Approve Resources</div>
                  <div className="text-sm text-slate-500 mt-1">Automatically approve resources from verified teachers</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.autoApproveTeachers}
                  onChange={(e) => setSettings({ ...settings, autoApproveTeachers: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">Auto-Approve Teacher Requests</div>
                  <div className="text-sm text-slate-500 mt-1">Automatically approve teacher role requests (not recommended)</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.enableAnalytics}
                  onChange={(e) => setSettings({ ...settings, enableAnalytics: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">Enable Analytics</div>
                  <div className="text-sm text-slate-500 mt-1">Track platform usage and generate analytics</div>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.enableLogging}
                  onChange={(e) => setSettings({ ...settings, enableLogging: e.target.checked })}
                  className="mt-1 w-5 h-5 text-careermap-teal rounded focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-primary dark:text-white">Enable System Logging</div>
                  <div className="text-sm text-slate-500 mt-1">Log system events and user actions for debugging</div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsView;
