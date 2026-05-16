import React, { useState, useEffect } from 'react';
import {
  Search, Tag, ChevronRight, X, Loader2, AlertCircle,
  Code2, Database, Shield, Cloud, Smartphone, Palette,
  Network, Server, Briefcase, GraduationCap
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Career {
  id: number;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  created_at: string;
}

// ── Category → icon + gradient ────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  light: string;
}> = {
  'Software Engineering':    { icon: <Code2 size={32} />,       gradient: 'from-[#1e3a5f] to-[#0d9488]', accent: '#0d9488', light: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  'Data Science & AI':       { icon: <Database size={32} />,    gradient: 'from-[#312e81] to-[#6d28d9]', accent: '#7c3aed', light: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  'Cybersecurity':           { icon: <Shield size={32} />,      gradient: 'from-[#7f1d1d] to-[#dc2626]', accent: '#dc2626', light: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  'Cloud & DevOps':          { icon: <Cloud size={32} />,       gradient: 'from-[#0c4a6e] to-[#0284c7]', accent: '#0284c7', light: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  'Mobile Development':      { icon: <Smartphone size={32} />,  gradient: 'from-[#064e3b] to-[#059669]', accent: '#059669', light: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  'UI/UX Design':            { icon: <Palette size={32} />,     gradient: 'from-[#831843] to-[#db2777]', accent: '#db2777', light: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  'Network Engineering':     { icon: <Network size={32} />,     gradient: 'from-[#1c1917] to-[#78716c]', accent: '#78716c', light: 'bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300' },
  'Database Administration': { icon: <Server size={32} />,      gradient: 'from-[#1e3a5f] to-[#2563eb]', accent: '#2563eb', light: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'General':                 { icon: <GraduationCap size={32} />, gradient: 'from-[#1e3a5f] to-[#0d9488]', accent: '#0d9488', light: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
};

const getCategoryStyle = (category: string) =>
  CATEGORY_STYLE[category] ?? {
    icon: <Briefcase size={32} />,
    gradient: 'from-[#1e3a5f] to-[#0d9488]',
    accent: '#0d9488',
    light: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  };

// ── Career Detail Modal ───────────────────────────────────────────────────────

const CareerModal: React.FC<{ career: Career; onClose: () => void }> = ({ career, onClose }) => {
  const style = getCategoryStyle(career.category);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Icon header */}
        <div className={`relative h-40 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
          <div className="text-white/90">{style.icon}</div>
          <div className="absolute bottom-4 left-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              {career.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{career.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">{career.description}</p>

          {career.required_skills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Tag size={12} /> Required Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {career.required_skills.map(s => (
                  <span key={s} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${style.light} border-current/20`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-careermap-navy text-white rounded-2xl font-bold text-sm hover:bg-[#023058] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Career Card ───────────────────────────────────────────────────────────────

const CareerCard: React.FC<{ career: Career; onView: () => void }> = ({ career, onView }) => {
  const style = getCategoryStyle(career.category);
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">

      {/* Icon banner */}
      <div className={`relative h-36 bg-gradient-to-br ${style.gradient} flex items-center justify-center shrink-0 overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
        {/* Icon */}
        <div className="relative z-10 text-white/90 group-hover:scale-110 transition-transform duration-300">
          {style.icon}
        </div>
        {/* Category badge */}
        <div className="absolute bottom-3 left-4">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
            {career.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-2 group-hover:text-careermap-teal transition-colors">
          {career.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
          {career.description}
        </p>

        {/* Skills */}
        {career.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {career.required_skills.slice(0, 3).map(s => (
              <span key={s} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${style.light}`}>
                {s}
              </span>
            ))}
            {career.required_skills.length > 3 && (
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-bold">
                +{career.required_skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* View button */}
        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 py-3 bg-careermap-navy text-white rounded-2xl font-bold text-sm hover:bg-[#023058] active:scale-95 transition-all group/btn"
        >
          View Career
          <ChevronRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────

const CareersView: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState<Career | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, cats] = await Promise.allSettled([
          apiClient.getPublishedCareers({
            search: search || undefined,
            category: activeCategory !== 'all' ? activeCategory : undefined,
          }),
          apiClient.getCareerCategories(),
        ]);

        if (data.status === 'fulfilled') {
          const result = data.value;
          setCareers(Array.isArray(result) ? result : []);
        } else {
          console.error('Careers fetch failed:', data.reason);
          setError('Failed to load careers. Please try again.');
        }

        if (cats.status === 'fulfilled' && Array.isArray(cats.value)) {
          setCategories(cats.value);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load careers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, activeCategory]);

  return (
    <div className="space-y-8 pb-16">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[3rem] bg-careermap-navy p-10 md:p-14 text-white border border-white/5 shadow-2xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-careermap-teal/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] w-[300px] h-[300px] bg-careermap-teal/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap size={20} className="text-careermap-teal" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-careermap-teal">Official BiT Career Paths</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black mb-4 leading-tight">
            Explore Your <span className="text-careermap-teal">Career Path</span>
          </h1>
          <p className="text-white/60 text-base font-medium leading-relaxed">
            Discover official career paths curated by the BiT department. Each career includes the skills you need to get there.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search careers..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-careermap-teal/30 text-sm"
        />
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {['all', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-careermap-navy text-white shadow-lg'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-careermap-teal hover:text-careermap-teal'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="animate-spin text-careermap-teal" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl border border-red-100 dark:border-red-900/30">
          <AlertCircle size={18} /> {error}
        </div>
      ) : careers.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
          <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">No careers found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? 'Try a different search term.' : 'No published careers yet. Check back soon.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-400 font-medium">
            {careers.length} career{careers.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map(career => (
              <CareerCard key={career.id} career={career} onView={() => setSelected(career)} />
            ))}
          </div>
        </>
      )}

      {selected && <CareerModal career={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CareersView;
