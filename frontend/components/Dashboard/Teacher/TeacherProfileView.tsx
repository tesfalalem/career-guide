import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building, Award, Globe, Linkedin,
  Edit2, Save, X, BookOpen, CheckCircle, BadgeCheck,
  RefreshCw
} from 'lucide-react';
import { teacherService } from '../../../services/teacherService';

const TeacherProfileView: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalResources, setTotalResources] = useState(0);

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
    languages: [] as string[],
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const r = await teacherService.getStats();
      if (r.success) setTotalResources(r.stats?.totalResources || 0);
    } catch {}
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await teacherService.getProfile();
      if (r.success && r.profile) {
        const p = r.profile;
        setProfile({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone_number || '',
          institution: p.institution || '',
          yearsExperience: p.years_experience || 0,
          bio: p.bio || '',
          teachingPhilosophy: p.teaching_philosophy || '',
          linkedin: p.linkedin_url || '',
          website: p.website_url || '',
          expertiseAreas: p.expertise_areas || [],
          qualifications: p.qualifications || [],
          certifications: p.certifications || [],
          languages: p.languages || [],
        });
      }
    } catch {
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
      const r = await teacherService.updateProfile({
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
        website: profile.website,
      });
      if (r.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-careermap-teal" size={40} />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="space-y-6">

      {/* ── Feedback banners ─────────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-semibold">
          <CheckCircle size={18} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-sm font-semibold">
          <X size={18} /> {error}
        </div>
      )}

      {/* ── Header row: title + action buttons ───────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={24} className="text-careermap-teal" />
            Teacher Profile
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your professional profile and credentials
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-careermap-navy text-white rounded-xl font-bold text-sm hover:bg-[#023058] transition-all"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-careermap-navy text-white rounded-xl font-bold text-sm hover:bg-[#023058] transition-all disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── LEFT: main content ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Information */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-5">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                    <User size={15} className="text-slate-400 shrink-0" /> {profile.name || '—'}
                  </div>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                  <Mail size={15} className="text-slate-400 shrink-0" /> {profile.email || '—'}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                    <Phone size={15} className="text-slate-400 shrink-0" /> {profile.phone || '—'}
                  </div>
                )}
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Institution</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.institution}
                    onChange={e => setProfile({ ...profile, institution: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300">
                    <Building size={15} className="text-slate-400 shrink-0" /> {profile.institution || '—'}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Professional Bio</label>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-careermap-teal/20 text-slate-900 dark:text-white resize-none"
                />
              ) : (
                <p className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {profile.bio || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award size={18} className="text-careermap-teal" /> Professional Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.certifications.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-8 h-8 bg-careermap-teal/10 rounded-lg flex items-center justify-center shrink-0">
                      <Award size={15} className="text-careermap-teal" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: unified sidebar card ────────────────────────────────── */}
        <div className="space-y-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

            {/* Avatar + name + verified badge */}
            <div className="bg-gradient-to-br from-careermap-navy to-careermap-teal p-6 text-white text-center">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-extrabold border-4 border-white/30 mx-auto">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                  <BadgeCheck size={14} className="text-white" />
                </div>
              </div>
              <h3 className="font-extrabold text-lg leading-tight">{profile.name || 'Your Name'}</h3>
              {profile.institution && (
                <p className="text-white/70 text-xs mt-1">{profile.institution}</p>
              )}
              {/* Compact verified badge */}
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-white/15 rounded-full text-[10px] font-black uppercase tracking-wider">
                <BadgeCheck size={11} /> Verified Educator
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
              <div className="py-4 text-center">
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{totalResources}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                  <BookOpen size={10} /> Resources
                </div>
              </div>
              <div className="py-4 text-center">
                <div className="text-xl font-extrabold text-careermap-teal">{profile.yearsExperience}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Yrs Experience</div>
              </div>
            </div>

            {/* Expertise */}
            {profile.expertiseAreas.length > 0 && (
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.expertiseAreas.map((area, i) => (
                    <span key={i} className="px-2.5 py-1 bg-careermap-teal/10 text-careermap-teal rounded-lg text-xs font-semibold">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages.length > 0 && (
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Languages</p>
                <div className="space-y-1.5">
                  {profile.languages.map((lang, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" /> {lang}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connect */}
            {(profile.linkedin || profile.website) && (
              <div className="p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Connect</p>
                <div className="space-y-2">
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-careermap-navy/10 transition-colors"
                    >
                      <Linkedin size={16} className="text-careermap-teal shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">LinkedIn</span>
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-careermap-navy/10 transition-colors"
                    >
                      <Globe size={16} className="text-careermap-teal shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileView;
