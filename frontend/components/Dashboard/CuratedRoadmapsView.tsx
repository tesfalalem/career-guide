import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, TrendingUp, Search, Star, ArrowLeft, ArrowRight, ExternalLink, PlayCircle, Users, Loader2, CheckCircle, XCircle, Sparkles, ChevronDown, ChevronRight, BrainCircuit } from 'lucide-react';
import { CardGridSkeleton } from '../common/Skeleton';
import { apiClient } from '../../services/apiClient';

interface LinkedCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  enrolled_count: number;
  author: string;
  creator_name: string;
}

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

type EnrollStatus = { type: 'success' | 'already' | 'error'; roadmapId: number | string } | null;

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
  const [linkedCourses, setLinkedCourses] = useState<LinkedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<EnrollStatus>(null);
  const [enrollingId, setEnrollingId] = useState<number | string | null>(null);
  // Track which roadmaps this student is already enrolled in (per session)
  const [enrolledIds, setEnrolledIds] = useState<Set<number | string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));

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

  const handleEnroll = async (roadmapId: number | string) => {
    setEnrollingId(roadmapId);
    try {
      const { data, status, ok } = await apiClient.enrollInCuratedRoadmap(roadmapId);

      if (ok) {
        // First time enroll
        setEnrolledIds(prev => new Set([...prev, roadmapId]));
        setEnrollStatus({ type: 'success', roadmapId });
        fetchRoadmaps();
      } else if (status === 409 || data?.message?.toLowerCase().includes('already')) {
        // Already enrolled
        setEnrolledIds(prev => new Set([...prev, roadmapId]));
        setEnrollStatus({ type: 'already', roadmapId });
      } else {
        setEnrollStatus({ type: 'error', roadmapId });
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      setEnrollStatus({ type: 'error', roadmapId });
    } finally {
      setEnrollingId(null);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setEnrollStatus(null), 3000);
    }
  };

  const handleViewDetails = async (roadmapId: number | string) => {
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    
    if (roadmap?.isAi) {
      // AI roadmaps already have their data locally
      setSelectedRoadmap(roadmap);
      setViewMode('detail');
      setLinkedCourses([]); // AI roadmaps don't have linked platform courses yet
      return;
    }

    try {
      const data = await apiClient.getCuratedRoadmap(roadmapId);
      setSelectedRoadmap(data);
      setViewMode('detail');

      // Fetch linked courses
      setLoadingCourses(true);
      setLinkedCourses([]);
      try {
        const cData = await apiClient.getCuratedRoadmapCourses(roadmapId);
        setLinkedCourses(Array.isArray(cData) ? cData : []);
      } catch {
        setLinkedCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    } catch (error) {
      console.error('Error fetching roadmap details:', error);
    }
  };

  const handleBackToBrowse = () => {
    setViewMode('browse');
    setSelectedRoadmap(null);
    setLinkedCourses([]);
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

  // Enrollment Dialog
  const EnrollDialog = () => {
    if (!enrollStatus) return null;
    const isSuccess = enrollStatus.type === 'success';
    const isAlready = enrollStatus.type === 'already';
    const isError = enrollStatus.type === 'error';
    const roadmap = roadmaps.find(r => r.id === enrollStatus.roadmapId);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-careermap-navy/40 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isSuccess ? 'bg-careermap-teal/10' :
            isAlready ? 'bg-amber-100 dark:bg-amber-900/30' :
            'bg-red-100 dark:bg-red-900/30'
          }`}>
            {isSuccess && <CheckCircle size={40} className="text-careermap-teal" />}
            {isAlready && <CheckCircle size={40} className="text-amber-500" />}
            {isError && <XCircle size={40} className="text-red-500" />}
          </div>

          <h3 className={`text-2xl font-serif font-black mb-3 ${
            isSuccess ? 'text-careermap-navy dark:text-careermap-teal' :
            isAlready ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {isSuccess ? 'Roadmap Started!' : isAlready ? 'Already Navigating' : 'Navigation Error'}
          </h3>

          {roadmap && (
            <p className="text-slate-900 dark:text-white text-sm mb-2 font-bold">{roadmap.title}</p>
          )}

          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            {isSuccess && 'Your personalized career path has been activated. Follow the milestones to reach your goal.'}
            {isAlready && "You're already on this path. Continue following your milestones to stay on track!"}
            {isError && 'We encountered an error while mapping your path. Please try again or contact support.'}
          </p>

          <button
            onClick={() => setEnrollStatus(null)}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
              isSuccess ? 'bg-careermap-teal hover:bg-teal-600 shadow-teal-500/20' :
              isAlready ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' :
              'bg-red-500 hover:bg-red-600 shadow-red-500/20'
            }`}
          >
            {isSuccess ? 'Start My Journey' : 'Got it'}
          </button>
        </div>
      </div>
    );
  };
  // Detail View
  if (viewMode === 'detail' && selectedRoadmap) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto pb-20">
        <EnrollDialog />
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
                selectedRoadmap.difficulty_level === 'beginner'   ? 'bg-green-100 text-green-700' :
                selectedRoadmap.difficulty_level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {selectedRoadmap.isAi ? <span className="flex items-center gap-1"><BrainCircuit size={10} /> AI Generated</span> : selectedRoadmap.difficulty_level}
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
                  <p className="font-bold text-slate-600 dark:text-slate-300">{selectedRoadmap.phases.length} Phases</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-careermap-navy dark:text-teal-400">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Community</p>
                  <p className="font-bold text-slate-600 dark:text-slate-300">{selectedRoadmap.enrollments + 142} Explorers</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {enrolledIds.has(selectedRoadmap.id) ? (
                <div className="flex items-center gap-3 bg-careermap-teal text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20">
                  <CheckCircle size={24} /> Journey Active
                </div>
              ) : (
                <button
                  onClick={() => handleEnroll(selectedRoadmap.id)}
                  disabled={enrollingId === selectedRoadmap.id}
                  className="bg-careermap-navy hover:bg-navy-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-navy-500/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                >
                  {enrollingId === selectedRoadmap.id ? <Loader2 size={24} className="animate-spin" /> : <PlayCircle size={24} />}
                  Start This Path
                </button>
              )}
              <button className="px-10 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                Save Guide
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Roadmap Timeline (Col Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white mb-8 flex items-center gap-4">
              <div className="w-1.5 h-10 bg-careermap-teal rounded-full" />
              The Learning Milestones
            </h2>
            
            <div className="relative pl-4 space-y-12">
              {/* Vertical Connector Line */}
              <div className="absolute left-[39px] top-6 bottom-6 w-[3px] bg-slate-100 dark:bg-slate-800 rounded-full" />

              {selectedRoadmap.phases.map((phase: any, index: number) => {
                const isExpanded = expandedPhases.has(index);
                return (
                  <div key={index} className="relative group">
                    <div className="flex items-start gap-8">
                      {/* Phase Number Circle */}
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
                              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{phase.duration}</span>
                              </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-1">{phase.description}</p>
                          </div>
                          <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-careermap-teal text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover/header:text-careermap-teal'}`}>
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-2 duration-300">
                            <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                              {phase.description}
                            </p>
                            
                            {/* Topics */}
                            {phase.topics && (
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
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Market Evidence Sidebar */}
          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white mb-8 flex items-center gap-4">
              <div className="w-1.5 h-10 bg-careermap-navy rounded-full" />
              Market Evidence
            </h2>

            <div className="bg-careermap-navy rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Estimated Salary</p>
              <h3 className="text-4xl font-serif font-black mb-1">£45k - £85k</h3>
              <p className="text-xs text-white/60 mb-8 font-bold">Annual range for {selectedRoadmap.category}</p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Hiring Demand</span>
                    <span className="text-careermap-teal">High</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-careermap-teal rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Skills Matching</span>
                    <span className="text-teal-400">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-teal-400 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs font-medium text-white/70 leading-relaxed italic">
                  "The {selectedRoadmap.category} market is expanding rapidly in the UK tech hub. Professional certification is increasingly required."
                </p>
              </div>
            </div>

            {/* Linked Courses Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-lg">
              <h4 className="text-xl font-serif font-black text-careermap-navy dark:text-white mb-6">Expert-Led Courses</h4>
              <div className="space-y-4">
                {loadingCourses ? (
                   <div className="flex items-center gap-3 text-slate-400">
                     <Loader2 className="animate-spin" size={16} />
                     <span className="text-xs font-bold uppercase tracking-widest">Scanning catalog...</span>
                   </div>
                ) : linkedCourses.length > 0 ? (
                  linkedCourses.map(course => (
                    <div key={course.id} className="group p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:border-careermap-teal transition-all cursor-pointer" onClick={() => onOpenCourse?.(course.id)}>
                      <p className="text-xs font-bold text-careermap-navy dark:text-teal-400 uppercase tracking-widest mb-1">{course.category}</p>
                      <h5 className="font-black text-slate-800 dark:text-slate-200 line-clamp-1 mb-2 group-hover:text-careermap-navy dark:group-hover:text-careermap-teal">{course.title}</h5>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" /> 4.9</span>
                        <span className="text-careermap-navy dark:text-teal-400">Enroll <ArrowLeft className="inline rotate-180" size={10} /></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 font-medium italic">No direct matches found. Browse library for similar topics.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Browse View
  return (
    <div className="space-y-10">
      <EnrollDialog />
      
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
                  roadmap.difficulty_level === 'beginner' ? 'bg-green-50 text-green-600' :
                  roadmap.difficulty_level === 'intermediate' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {roadmap.isAi ? <span className="flex items-center gap-1"><Sparkles size={10} /> AI Generated</span> : roadmap.difficulty_level}
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
                   <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest font-sans">
                     <Users size={12} /> {roadmap.enrollments + 24}
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
