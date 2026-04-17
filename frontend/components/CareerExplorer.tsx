
import React, { useState } from 'react';
import { BrainCircuit, Loader2, ArrowRight, Map as MapIcon, GraduationCap, Box, Search, TrendingUp, DollarSign, Target, Briefcase } from 'lucide-react';
import { getCareerSuggestion } from '../services/geminiService';
import { CareerSuggestion } from '../types';
import { apiClient } from '../services/apiClient';

const CareerExplorer: React.FC = () => {
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerSuggestion | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [careerDetails, setCareerDetails] = useState<any>(null);

  const handleExplore = async () => {
    if (!interest.trim()) return;
    const searchInterest = interest;
    setInterest('');
    setLoading(true);
    setCareerDetails(null);
    const suggestion = await getCareerSuggestion(searchInterest);
    setResult(suggestion);
    setLoading(false);
  };

  const handleBuildRoadmap = async () => {
    if (!result) return;
    
    setDetailsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/career-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career: result.career,
          interest: interest
        })
      });

      const data = await response.json();
      if (data.success) {
        setCareerDetails(data.details);
      }
    } catch (error) {
      console.error('Failed to generate career details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <section id="lab" className="py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-32 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 text-secondary font-bold text-[11px] uppercase tracking-widest mb-8">
               <BrainCircuit size={16} /> Synthesis Lab
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary dark:text-white leading-[1.1] mb-10">
               Identify your <br/> <span className="text-secondary">Expertise.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-12 max-w-xl leading-relaxed">
              Feed the career engine with your current interests and aspirations. We'll generate a precise blueprint for your BiT-to-Professional transition.
            </p>

            <div className="relative group max-w-2xl">
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                <div className="pl-4 text-slate-300 dark:text-slate-600">
                  <Search size={24} />
                </div>
                <input 
                  type="text" 
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="I want to work in Blockchain..."
                  className="flex-1 bg-transparent px-4 py-4 outline-none text-primary dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 font-semibold text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleExplore()}
                />
                <button 
                  onClick={handleExplore}
                  disabled={loading}
                  className="bg-secondary text-white px-8 py-4 rounded-xl transition-all hover:bg-primary disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full min-h-[500px] flex items-center justify-center">
            {careerDetails ? (
              <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl animate-reveal max-h-[700px] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-extrabold text-primary dark:text-white mb-2">{result?.career}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{careerDetails.overview}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-secondary" />
                        <h4 className="font-bold text-sm text-primary dark:text-white">Market Insights</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{careerDetails.market_insights}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={18} className="text-secondary" />
                        <h4 className="font-bold text-sm text-primary dark:text-white">Salary Range</h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Entry:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{careerDetails.salary_range.entry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mid:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{careerDetails.salary_range.mid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Senior:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{careerDetails.salary_range.senior}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-primary dark:text-white mb-3 flex items-center gap-2">
                      <Target size={18} className="text-secondary" />
                      Required Skills
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {careerDetails.required_skills.slice(0, 6).map((skill: any, i: number) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <div className="font-semibold text-sm text-primary dark:text-white">{skill.name}</div>
                          <div className="text-xs text-slate-500">{skill.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-primary dark:text-white mb-3 flex items-center gap-2">
                      <Briefcase size={18} className="text-secondary" />
                      Job Opportunities
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(careerDetails.job_opportunities).slice(0, 4).map(([key, value]: [string, any], i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                          <div className="font-semibold text-primary dark:text-white">{key}</div>
                          <div className="text-xs text-slate-500">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setCareerDetails(null)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-primary dark:text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Back to Summary
                  </button>
                </div>
              </div>
            ) : result ? (
              <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[2rem] shadow-xl animate-reveal relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <GraduationCap className="text-slate-500" size={180} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest mb-8">
                      Target Role
                    </div>
                    <h3 className="text-5xl font-extrabold text-primary dark:text-white mb-10 tracking-tight">{result.career}</h3>
                    
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Synthesis Summary</h4>
                        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          "{result.reason}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {result.topSkills.map((skill, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-xl">
                            <span className="text-[10px] font-bold text-secondary uppercase block mb-2 tracking-widest">Skill {i+1}</span>
                            <span className="font-bold text-base text-primary dark:text-white">{skill}</span>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={handleBuildRoadmap}
                        disabled={detailsLoading}
                        className="w-full bg-primary dark:bg-secondary text-white py-6 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-primary/10 disabled:opacity-50"
                      >
                        {detailsLoading ? (
                          <><Loader2 className="animate-spin" size={20} /> Generating Details...</>
                        ) : (
                          <><MapIcon size={20} /> Explore Career Details</>
                        )}
                      </button>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[500px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center p-12 group hover:border-secondary/30 transition-all">
                 <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    <Box size={40} className="text-slate-200 dark:text-slate-700 group-hover:text-secondary" />
                 </div>
                 <h4 className="text-slate-400 dark:text-slate-600 font-bold text-2xl mb-4">Awaiting Parameters</h4>
                 <p className="text-slate-300 dark:text-slate-700 text-lg max-w-[300px]">The engine is in standby. Input your interests to begin.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default CareerExplorer;
