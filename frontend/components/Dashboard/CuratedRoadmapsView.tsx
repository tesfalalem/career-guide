import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, TrendingUp, Search, ArrowLeft, ArrowRight, Loader2, Sparkles, ChevronDown, ChevronRight, BrainCircuit, CheckCircle } from 'lucide-react';
import { CardGridSkeleton } from '../common/Skeleton';
import { apiClient } from '../../services/apiClient';

interface CuratedRoadmap {
  id: number | string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  estimated_duration: string;
  tags: string[];
  phases: any[];
  views: number;
  enrollments: number;
  creator_name: string;
  isAi?: boolean;
}

type LevelKey = 'beginner' | 'medium' | 'advanced';

const LEVEL_META: Record<LevelKey, { label: string; color: string; bg: string; dot: string }> = {
  beginner: { label: 'Beginner',  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  medium:   { label: 'Medium',    color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',   dot: 'bg-amber-500' },
  advanced: { label: 'Advanced',  color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',           dot: 'bg-red-500' },
};

/** Returns true if phases is the new multi-level format */
function isMultiLevel(phases: any[]): boolean {
  return Array.isArray(phases) && phases.length > 0 &&
    typeof phases[0] === 'object' && 'level' in phases[0] && 'phases' in phases[0];
}

/** Extract phases for a specific level from multi-level format */
function getLevelPhases(phases: any[], level: LevelKey): any[] {
  if (!isMultiLevel(phases)) return phases; // old flat format
  const entry = phases.find((e: any) => e.level === level);
  return entry?.phases ?? [];
}

/** Count total phases across all levels */
function totalPhaseCount(phases: any[]): number {
  if (!isMultiLevel(phases)) return phases.length;
  return phases.reduce((sum: number, e: any) => sum + (e.phases?.length ?? 0), 0);
}

/** Strip HTML tags and return plain text for preview */
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parse HTML from RichTextEditor into an array of topic strings.
 * Handles <li>, <p>, and <div> as separate items.
 */
function parseHtmlToTopics(html: string): string[] {
  if (!html) return [];

  // Try <li> items first (from bullet/numbered lists)
  const liMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [];
  if (liMatches.length > 0) {
    return liMatches
      .map(m => m.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())
      .filter(Boolean);
  }

  // Fall back to <p> or <div> blocks
  const blockMatches = html.match(/<(?:p|div)[^>]*>([\s\S]*?)<\/(?:p|div)>/gi) ?? [];
  if (blockMatches.length > 0) {
    return blockMatches
      .map(m => m.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())
      .filter(Boolean);
  }

  // Last resort: split by <br> tags
  return html
    .split(/<br\s*\/?>/gi)
    .map(s => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())
    .filter(Boolean);
}

interface CuratedRoadmapsViewProps {
  onGenerateCustom?: () => void;
  onOpenCourse?: (courseId: number) => void;
}

const CuratedRoadmapsView: React.FC<CuratedRoadmapsViewProps> = ({ onGenerateCustom, onOpenCourse }) => {
  const [roadmaps, setRoadmaps] = useState<CuratedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedRoadmap, setSelectedRoadmap] = useState<CuratedRoadmap | null>(null);
  const [viewMode, setViewMode] = useState<'browse' | 'detail'>('browse');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));
  const [activeLevel, setActiveLevel] = useState<LevelKey>('beginner');

  const togglePhase = (idx: number) => {
    const next = new Set(expandedPhases);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedPhases(next);
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [selectedCategory, selectedDifficulty]);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      // Fetch curated roadmaps
      const curatedData = await apiClient.getCuratedRoadmaps({
        category: selectedCategory,
        difficulty_level: selectedDifficulty
      });

      // Fetch AI roadmaps from user history
      let aiRoadmaps: CuratedRoadmap[] = [];
      try {
        const userAiData = await apiClient.getUserRoadmaps();
        if (Array.isArray(userAiData)) {
          aiRoadmaps = userAiData.map((item: any) => ({
            id: `ai-${item.id}`,
            title: item.title,
            description: item.road_data?.description || `AI-generated path for ${item.role}`,
            category: item.role,
            difficulty_level: 'AI Generated',
            estimated_duration: '~6 Months',
            tags: [],
            phases: item.road_data?.phases || [],
            views: 0,
            enrollments: 0,
            creator_name: 'AI Architect',
            isAi: true
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch AI roadmaps:', e);
      }

      // Merge and prioritize AI roadmaps
      setRoadmaps([...aiRoadmaps, ...curatedData]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = async (roadmapId: number | string) => {
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    
    if (roadmap?.isAi) {
      setSelectedRoadmap(roadmap);
      setViewMode('detail');
      setActiveLevel('beginner');
      setExpandedPhases(new Set([0]));
      return;
    }

    try {
      const data = await apiClient.getCuratedRoadmap(roadmapId);
      setSelectedRoadmap(data);
      setViewMode('detail');
      setActiveLevel('beginner');
      setExpandedPhases(new Set([0]));
    } catch (error) {
      console.error('Error fetching roadmap details:', error);
    }
  };

  const handleBackToBrowse = () => {
    setViewMode('browse');
    setSelectedRoadmap(null);
  };

  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roadmap.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <CardGridSkeleton count={6} />;
  }

  // Detail View
  if (viewMode === 'detail' && selectedRoadmap) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto pb-20">
        {/* Back Button */}
        <button
          onClick={handleBackToBrowse}
          className="flex items-center gap-2 text-slate-400 hover:text-careermap-navy transition-all group font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Browse</span>
        </button>

        {/* Roadmap Hero Header */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.1] pointer-events-none">
            <TrendingUp size={300} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-[10px] font-black text-careermap-teal bg-careermap-teal/10 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                {selectedRoadmap.category}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${
                selectedRoadmap.isAi ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                selectedRoadmap.difficulty_level === 'all' ? 'bg-gradient-to-r from-emerald-50 via-amber-50 to-red-50 text-slate-700 border border-slate-200' :
                selectedRoadmap.difficulty_level === 'beginner'   ? 'bg-green-100 text-green-700' :
                selectedRoadmap.difficulty_level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {selectedRoadmap.isAi
                  ? <span className="flex items-center gap-1"><BrainCircuit size={10} /> AI Generated</span>
                  : selectedRoadmap.difficulty_level === 'all'
                    ? '🎯 Beginner → Medium → Advanced'
                    : selectedRoadmap.difficulty_level}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-black text-careermap-navy dark:text-white mb-6 leading-tight max-w-3xl">
              {selectedRoadmap.title}
            </h1>
            
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl font-medium">
              {selectedRoadmap.description}
            </p>

            <div className="flex flex-wrap items-center gap-8 text-sm text-slate-400 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-careermap-navy dark:text-teal-400">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Duration</p>
                  <p className="font-bold text-slate-600 dark:text-slate-300">{selectedRoadmap.estimated_duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-careermap-navy dark:text-teal-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Milestones</p>
                  <p className="font-bold text-slate-600 dark:text-slate-300">{totalPhaseCount(selectedRoadmap.phases)} Phases</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="space-y-4">
          {/* Main Roadmap Timeline — full width */}
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white mb-8 flex items-center gap-4">
              <div className="w-1.5 h-10 bg-careermap-teal rounded-full" />
              The Learning Milestones
            </h2>

            {/* Level selector — only for multi-level roadmaps */}
            {isMultiLevel(selectedRoadmap.phases) && (
              <div className="flex gap-2 mb-6">
                {(Object.keys(LEVEL_META) as LevelKey[]).map(lvl => {
                  const meta = LEVEL_META[lvl];
                  const count = getLevelPhases(selectedRoadmap.phases, lvl).length;
                  return (
                    <button
                      key={lvl}
                      onClick={() => { setActiveLevel(lvl); setExpandedPhases(new Set([0])); }}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                        activeLevel === lvl
                          ? `${meta.bg} ${meta.color} shadow-sm`
                          : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full ${meta.dot} mr-2`} />
                      {meta.label}
                      <span className="ml-1.5 opacity-60">· {count} phase{count !== 1 ? 's' : ''}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Phases for the active level (or all phases for old format) */}
            {(() => {
              const displayPhases = isMultiLevel(selectedRoadmap.phases)
                ? getLevelPhases(selectedRoadmap.phases, activeLevel)
                : selectedRoadmap.phases;

              if (displayPhases.length === 0) {
                return (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">No phases defined for this level yet.</p>
                  </div>
                );
              }

              return (
                <div className="relative pl-4 space-y-12">
                  <div className="absolute left-[39px] top-6 bottom-6 w-[3px] bg-slate-100 dark:bg-slate-800 rounded-full" />
                  {displayPhases.map((phase: any, index: number) => {
                    const isExpanded = expandedPhases.has(index);
                    return (
                      <div key={index} className="relative group">
                        <div className="flex items-start gap-8">
                          <button
                            onClick={() => togglePhase(index)}
                            className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-[3px] ${isExpanded ? 'border-careermap-teal text-careermap-teal shadow-lg shadow-careermap-teal/20' : 'border-careermap-navy text-careermap-navy'} font-serif font-black text-xl flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-110 active:scale-95`}
                          >
                            {index + 1}
                          </button>

                          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] p-0 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:shadow-2xl group-hover:border-careermap-teal/30 transition-all duration-300 overflow-hidden">
                            <button
                              onClick={() => togglePhase(index)}
                              className="w-full text-left p-8 flex items-center justify-between group/header"
                            >
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white group-hover/header:text-careermap-teal transition-colors">
                                    {phase.title}
                                  </h3>
                                  {phase.duration && (
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                                      <Clock size={12} className="text-slate-400" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{phase.duration}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-1">
                                  {stripHtml(phase.description)}
                                </p>
                              </div>
                              <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-careermap-teal text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover/header:text-careermap-teal'}`}>
                                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-2 duration-300">
                                <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6" />

                                {/* AI roadmap: topics array */}
                                {phase.topics && phase.topics.length > 0 && (
                                  <div className="grid gap-3">
                                    {phase.topics.map((topic: any, tIdx: number) => (
                                      <div key={tIdx} className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-transparent hover:border-careermap-teal/20 transition-all group/topic cursor-default">
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-careermap-teal opacity-40 group-hover/topic:opacity-100 transition-opacity" />
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{topic.title}</h4>
                                          </div>
                                          <CheckCircle size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-careermap-teal transition-colors" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* BiT roadmap: HTML description — parse into topic cards */}
                                {!phase.topics && phase.description && (() => {
                                  const items = parseHtmlToTopics(phase.description);

                                  if (items.length > 0) {
                                    return (
                                      <div className="grid gap-3">
                                        {items.map((item, tIdx) => (
                                          <div key={tIdx} className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-transparent hover:border-careermap-teal/20 transition-all group/topic cursor-default">
                                            <div className="flex items-center justify-between gap-4">
                                              <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-careermap-teal opacity-40 group-hover/topic:opacity-100 transition-opacity" />
                                                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item}</span>
                                              </div>
                                              <CheckCircle size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-careermap-teal transition-colors" />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }

                                  // No parseable items — show plain text
                                  const plain = stripHtml(phase.description);
                                  return plain ? (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{plain}</p>
                                  ) : null;
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // Browse View
  return (
    <div className="space-y-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-careermap-navy dark:text-white mb-3">Curated Roadmaps</h1>
          <p className="text-lg text-slate-500 font-medium font-sans">Expert-designed career guides to help you navigate your journey.</p>
        </div>
        <button
          onClick={onGenerateCustom}
          className="bg-careermap-teal text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
        >
          <Sparkles size={18} /> AI Custom Map
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="Search pathways..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-careermap-navy/10 text-slate-700 dark:text-slate-200 font-bold outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          
          <div className="md:col-span-7 flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 min-w-[150px] px-6 py-4 rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-careermap-navy/10"
            >
              <option value="all">All Sectors</option>
              {['Frontend Development', 'Backend Development', 'Full Stack', 'Data Science', 'Mobile Development', 'DevOps', 'Design', 'Cybersecurity'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 min-w-[150px] px-6 py-4 rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-careermap-navy/10"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRoadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            onClick={() => handleViewDetails(roadmap.id)}
            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-white dark:border-slate-800 shadow-lg hover:shadow-[0_30px_60px_-15px_rgba(2,67,109,0.15)] transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-3"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-careermap-navy/[0.02] to-careermap-teal/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-careermap-teal bg-careermap-teal/10 uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                  {roadmap.category}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                  roadmap.isAi ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                  roadmap.difficulty_level === 'all' ? 'bg-gradient-to-r from-emerald-50 via-amber-50 to-red-50 text-slate-600 border border-slate-200' :
                  roadmap.difficulty_level === 'beginner' ? 'bg-green-50 text-green-600' :
                  roadmap.difficulty_level === 'intermediate' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {roadmap.isAi
                    ? <span className="flex items-center gap-1"><Sparkles size={10} /> AI Generated</span>
                    : roadmap.difficulty_level === 'all'
                      ? '🎯 3 Levels'
                      : roadmap.difficulty_level}
                </span>
              </div>

              <h3 className="text-2xl font-serif font-black text-careermap-navy dark:text-white mb-4 leading-tight group-hover:text-careermap-navy dark:group-hover:text-careermap-teal transition-colors">
                {roadmap.title}
              </h3>
              
              <p className="text-slate-400 font-medium text-sm line-clamp-3 mb-8 leading-relaxed font-sans">
                {roadmap.description}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest font-sans">
                     <Clock size={12} /> {roadmap.estimated_duration}
                   </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-careermap-navy text-white flex items-center justify-center opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRoadmaps.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-serif font-black text-slate-400 mb-2">No roadmaps found</h3>
          <p className="text-slate-400 font-medium">Try adjusting your filters or search term to discover new paths.</p>
        </div>
      )}

      {/* AI Fallback CTA */}
      <div className="relative overflow-hidden bg-careermap-navy rounded-[3rem] p-12 text-center text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
          <Sparkles size={200} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-serif font-black mb-4">Can't find your ideal path?</h3>
          <p className="mb-8 text-white/70 font-medium text-lg">Let our AI engine architect a personalized roadmap tailored specifically to your unique goals and background.</p>
          <button
            onClick={onGenerateCustom}
            className="bg-white text-careermap-navy px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-careermap-teal hover:text-white transition-all shadow-xl shadow-black/20"
          >
            Generate Custom Roadmap with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default CuratedRoadmapsView;
