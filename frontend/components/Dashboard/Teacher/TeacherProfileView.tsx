import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Award, Globe, Linkedin, Edit2, Save, X, Star, Users, BookOpen, TrendingUp, CheckCircle, Calendar, Shield, Eye, BadgeCheck, RefreshCw } from 'lucide-react';
import { teacherService } from '../../../services/teacherService';

const TeacherProfileView: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'public'>('edit');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalStudents: 0,
    avgRating: 0,
    totalRatings: 0,
    completionRate: 0,
    joinedDate: ''
  });
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    yearsExperience: 0,
    bio: '',
    teachingPhilosophy: '',
    linkedin: '',
    website: '',
    expertiseAreas: [] as string[],
    qualifications: [] as string[],
    certifications: [] as string[],
    languages: [] as string[]
  });

  const verificationBadges = [
    { type: 'email', label: 'Email Verified', verified: true },
    { type: 'institution', label: 'Institution Verified', verified: true },
    { type: 'identity', label: 'Identity Verified', verified: true },
    { type: 'expert', label: 'Expert Educator', verified: true }
  ];

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await teacherService.getStats();
      if (response.success && response.stats) {
        setStats({
          totalResources: response.stats.totalResources || 0,
          totalStudents: response.stats.activeStudents || 0,
          avgRating: response.stats.avgRating || 0,
          totalRatings: response.stats.totalRatings || 0,
          completionRate: response.stats.completionRate || 0,
          joinedDate: response.stats.joinedDate || 'Recently'
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.getProfile();
      if (response.success && response.profile) {
        setProfile({
          name: response.profile.name || '',
          email: response.profile.email || '',
          phone: response.profile.phone_number || '',
          institution: response.profile.institution || '',
          yearsExperience: response.profile.years_experience || 0,
          bio: response.profile.bio || '',
          teachingPhilosophy: response.profile.teaching_philosophy || '',
          linkedin: response.profile.linkedin_url || '',
          website: response.profile.website_url || '',
          expertiseAreas: response.profile.expertise_areas || [],
          qualifications: response.profile.qualifications || [],
          certifications: response.profile.certifications || [],
          languages: response.profile.languages || []
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await teacherService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        institution: profile.institution,
        bio: profile.bio,
        teachingPhilosophy: profile.teachingPhilosophy,
        yearsExperience: profile.yearsExperience,
        qualifications: profile.qualifications,
        certifications: profile.certifications,
        expertiseAreas: profile.expertiseAreas,
        languages: profile.languages,
        linkedin: profile.linkedin,
        website: profile.website
      });
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-careermap-teal" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }


  // Public Profile View
  const PublicProfileView = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-careermap-navy rounded-full flex items-center justify-center text-white text-4xl font-bold relative">
            {profile.name.charAt(0)}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
              <BadgeCheck size={16} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-primary dark:text-white">{profile.name}</h1>
              {verificationBadges.filter(b => b.verified).map((badge, i) => (
                <BadgeCheck key={i} size={18} className="text-green-500" title={badge.label} />
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{profile.institution}</p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{stats.totalResources} Resources</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{stats.totalStudents} Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-orange-500 text-orange-500" />
                <span>{stats.avgRating} Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">About</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Teaching Philosophy</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.teachingPhilosophy}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} />
              Education & Qualifications
            </h3>
            <div className="space-y-3">
              {profile.qualifications.map((qual, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">{qual}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
              <Shield size={20} />
              Verifications
            </h3>
            <div className="space-y-2">
              {verificationBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <BadgeCheck size={16} className={badge.verified ? 'text-green-500' : 'text-slate-400'} />
                  <span className={badge.verified ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {profile.expertiseAreas.map((area, i) => (
                <span key={i} className="px-3 py-1 bg-careermap-teal/10 text-careermap-teal rounded-lg text-sm font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Languages</h3>
            <div className="space-y-2">
              {profile.languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle size={14} className="text-green-500" />
                  {lang}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Connect</h3>
            <div className="space-y-2">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-2 p-3 bg-careermap-navy/10 rounded-xl hover:bg-careermap-navy/20 transition-colors">
                <Linkedin size={18} className="text-careermap-teal" />
                <span className="text-sm font-medium text-careermap-navy dark:text-careermap-teal">LinkedIn</span>
              </a>
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-careermap-navy/10 rounded-xl hover:bg-careermap-navy/20 transition-colors">
                <Globe size={18} className="text-careermap-teal" />
                <span className="text-sm font-medium text-careermap-navy dark:text-careermap-teal">Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'public') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-careermap-teal" />
            <span className="font-semibold text-primary dark:text-white">Public Profile Preview</span>
          </div>
          <button onClick={() => setViewMode('edit')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            Back to Edit Mode
          </button>
        </div>
        <PublicProfileView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <CheckCircle size={20} />
          {success}
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
            <User size={28} />
            Teacher Profile
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your professional profile and credentials
          </p>
        </div>
        {!isEditing ? (
          <div className="flex gap-3">
            <button onClick={() => setViewMode('public')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <Eye size={20} />
              View Public Profile
            </button>
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all">
              <Edit2 size={20} />
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <X size={20} />
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all disabled:opacity-50">
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Verification Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary dark:text-white mb-2 flex items-center gap-2">
              <Shield size={22} />
              Verification Status
            </h3>
            <p className="text-sm text-slate-500">
              {verificationBadges.filter(b => b.verified).length} of {verificationBadges.length} verifications completed
            </p>
          </div>
          <div className="flex gap-2">
            {verificationBadges.map((badge, i) => (
              <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                badge.verified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800'
              }`} title={badge.label}>
                <BadgeCheck size={24} className={badge.verified ? 'text-green-500' : 'text-slate-400'} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <BookOpen className="text-careermap-teal mb-2" size={24} />
          <div className="text-2xl font-bold text-primary dark:text-white">{stats.totalResources}</div>
          <div className="text-xs text-slate-500">Resources</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <Users className="text-careermap-teal mb-2" size={24} />
          <div className="text-2xl font-bold text-primary dark:text-white">{stats.totalStudents}</div>
          <div className="text-xs text-slate-500">Students</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <Star className="text-careermap-teal mb-2" size={24} />
          <div className="text-2xl font-bold text-primary dark:text-white">{stats.avgRating}</div>
          <div className="text-xs text-slate-500">Avg Rating</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <TrendingUp className="text-careermap-teal mb-2" size={24} />
          <div className="text-2xl font-bold text-primary dark:text-white">{stats.totalRatings}</div>
          <div className="text-xs text-slate-500">Reviews</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <CheckCircle className="text-careermap-teal mb-2" size={24} />
          <div className="text-2xl font-bold text-primary dark:text-white">{stats.completionRate}%</div>
          <div className="text-xs text-slate-500">Completion</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <Calendar className="text-careermap-teal mb-2" size={24} />
          <div className="text-sm font-bold text-primary dark:text-white">{stats.joinedDate}</div>
          <div className="text-xs text-slate-500">Member Since</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-6">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-primary dark:text-white" />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <User size={18} className="text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{profile.name}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{profile.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                  {isEditing ? (
                    <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-primary dark:text-white" />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Phone size={18} className="text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{profile.phone}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Institution</label>
                  {isEditing ? (
                    <input type="text" value={profile.institution} onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-transparent outline-none text-primary dark:text-white" />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Building size={18} className="text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{profile.institution}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Professional Bio</label>
                {isEditing ? (
                  <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-primary dark:text-white resize-none" />
                ) : (
                  <p className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Teaching Philosophy</label>
                {isEditing ? (
                  <textarea value={profile.teachingPhilosophy} onChange={(e) => setProfile({ ...profile, teachingPhilosophy: e.target.value })} rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-primary dark:text-white resize-none" />
                ) : (
                  <p className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">{profile.teachingPhilosophy}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} />
              Qualifications & Education
            </h3>
            <div className="space-y-3">
              {profile.qualifications.map((qual, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">{qual}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} />
              Professional Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-10 h-10 bg-careermap-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award size={18} className="text-careermap-teal" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-careermap-navy rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 relative">
                {profile.name.charAt(0)}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
                  <BadgeCheck size={20} className="text-white" />
                </div>
              </div>
              {isEditing && (
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Change Photo
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Experience</h3>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-careermap-teal mb-2">{profile.yearsExperience}</div>
              <div className="text-sm text-slate-500">Years of Teaching</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Expertise Areas</h3>
            <div className="flex flex-wrap gap-2">
              {profile.expertiseAreas.map((area, i) => (
                <span key={i} className="px-3 py-1 bg-careermap-teal/10 text-careermap-teal rounded-lg text-sm font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Languages</h3>
            <div className="space-y-2">
              {profile.languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle size={14} className="text-green-500" />
                  {lang}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-white mb-4">Connect</h3>
            <div className="space-y-2">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-careermap-navy/10 rounded-xl hover:bg-careermap-navy/20 transition-colors">
                <Linkedin size={18} className="text-careermap-teal" />
                <span className="text-sm font-medium text-careermap-navy dark:text-careermap-teal">LinkedIn</span>
              </a>
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-careermap-navy/10 rounded-xl hover:bg-careermap-navy/20 transition-colors">
                <Globe size={18} className="text-careermap-teal" />
                <span className="text-sm font-medium text-careermap-navy dark:text-careermap-teal">Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileView;
