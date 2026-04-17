import React, { useState } from 'react';
import { 
  Sparkles, Star, ArrowRight, Quote, Trophy, 
  Map as MapIcon, BookOpen, GraduationCap, 
  Users, CheckCircle, PlayCircle, ExternalLink,
  ChevronRight, Heart, Award
} from 'lucide-react';

interface SuccessStory {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
  roadmapTaken: string;
  salaryIncrease: string;
}

interface CareerResult {
  id: number;
  title: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  roadmapId: string;
  roadmapName: string;
  topCourses: string[];
  averageSalary: string;
  growth: string;
}

const InspirationHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Web Development', 'AI & Data Science', 'Cybersecurity', 'Cloud Engineering'];

  const stories: SuccessStory[] = [
    {
      id: 1,
      name: "Tadesse Bekele",
      role: "Senior Full-Stack Engineer",
      company: "Google UK",
      image: "https://api.dicebear.com/7.x/notionists/svg?seed=Tadesse",
      quote: "The personalized roadmap was my North Star. It simplified a complex career path into reachable daily goals.",
      roadmapTaken: "Full-Stack Web Architect",
      salaryIncrease: "3x Earnings"
    },
    {
      id: 2,
      name: "Helen Gebre",
      role: "Machine Learning Specialist",
      company: "DeepMind",
      image: "https://api.dicebear.com/7.x/notionists/svg?seed=Helen",
      quote: "Transitioning from math to AI felt impossible until I followed the specialized curriculum here.",
      roadmapTaken: "AI & ML Practitioner",
      salaryIncrease: "Industry Standard"
    },
    {
      id: 3,
      name: "Samuel Abraham",
      role: "Lead UI/UX Designer",
      company: "Airbnb",
      image: "https://api.dicebear.com/7.x/notionists/svg?seed=Samuel",
      quote: "The focus on project-based learning allowed me to build a portfolio that stood out to recruiters instantly.",
      roadmapTaken: "Advanced Product Design",
      salaryIncrease: "First Global Job"
    }
  ];

  const careers: CareerResult[] = [
    {
      id: 1,
      title: "Solutions Architect",
      category: "Cloud Engineering",
      description: "Design and manage robust cloud infrastructures for enterprise-scale applications.",
      difficulty: 'Advanced',
      roadmapId: 'cloud-path',
      roadmapName: "Cloud Native Systems",
      topCourses: ["AWS Fundamentals", "Kubernetes Masterclass", "Cloud Security"],
      averageSalary: "£75k - £120k",
      growth: "Very High"
    },
    {
      id: 2,
      title: "Fullstack Developer",
      category: "Web Development",
      description: "Build end-to-end web applications using modern stacks like MERN or Next.js.",
      difficulty: 'Intermediate',
      roadmapId: 'web-path',
      roadmapName: "Modern Web Mastery",
      topCourses: ["React Professional", "Node.js Architecture", "Database Design"],
      averageSalary: "£45k - £85k",
      growth: "Stable"
    },
    {
      id: 3,
      title: "AI Research Engineer",
      category: "AI & Data Science",
      description: "Develop cutting-edge machine learning models and neural networks for complex problem solving.",
      difficulty: 'Advanced',
      roadmapId: 'ai-path',
      roadmapName: "Deep Learning Foundations",
      topCourses: ["Python for AI", "Neural Networks", "NLP Specialization"],
      averageSalary: "£80k - £150k",
      growth: "Explosive"
    }
  ];

  const filteredCareers = activeCategory === 'All' 
    ? careers 
    : careers.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-12 pb-20">
      {/* ── HERO: THE INSPIRATION BANNER ────────────────────────── */}
      <div className="relative overflow-hidden bg-careermap-navy rounded-[3.5rem] p-12 lg:p-20 text-white border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-[50%] h-full opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full text-white" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 w-max px-4 py-2 rounded-full mb-8">
            <Trophy size={16} className="text-teal-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Alumni Achievement Hub</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-serif font-black mb-8 leading-[1.1] tracking-tight">
            See Where Your <br />
            <span className="text-careermap-teal">Journey Leads.</span>
          </h1>
          
          <p className="text-xl text-slate-300 font-serif italic leading-relaxed max-w-2xl mb-10">
            "Your learning path is more than just courses—it's the foundation of your professional legacy. Meet the people who started exactly where you are today."
          </p>
          
          <div className="flex flex-wrap gap-8 items-center border-t border-white/10 pt-10">
            <div>
              <div className="text-3xl font-black text-white">500+</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hired Graduates</div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block" />
            <div>
              <div className="text-3xl font-black text-white">12.5k</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Mentorships</div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block" />
            <div>
              <div className="text-3xl font-black text-white">£55k+</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Avg. Starting Salary</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SUCCESS STORIES: THE HUMAN SIDE ─────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-black text-careermap-navy dark:text-white">Success Stories</h2>
            <p className="text-slate-500 font-medium">Real outcomes from our dedicated learning community</p>
          </div>
          <button className="flex items-center gap-2 text-careermap-teal font-black text-xs uppercase tracking-widest group px-6 py-3 bg-careermap-teal/5 rounded-2xl hover:bg-careermap-teal/10 transition-all">
            Share Your Story <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map(story => (
            <div key={story.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Quote size={120} />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 p-1">
                  <img src={story.image} alt={story.name} className="w-full h-full rounded-xl object-contain" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-careermap-navy dark:text-white leading-tight">{story.name}</h3>
                  <div className="text-[10px] font-black text-careermap-teal uppercase tracking-widest flex items-center gap-2 mt-1">
                    <CheckCircle size={10} className="fill-careermap-teal text-white" /> Verified Graduate
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 dark:text-slate-300 font-medium italic mb-2 relative z-10">"{story.quote}"</p>
                <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                   <div className="w-6 h-px bg-slate-200" /> {story.role} at <span className="text-careermap-navy dark:text-teal-400">{story.company}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Impact</div>
                  <div className="text-careermap-teal font-black text-sm">{story.salaryIncrease}</div>
                </div>
                <button className="p-3 bg-careermap-navy dark:bg-slate-800 text-white dark:text-careermap-teal rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-careermap-navy/10">
                  <MapIcon size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAREER OUTCOMES: THE RESULTS ─────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 -mx-8 px-8 py-20 rounded-[4rem]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="text-careermap-teal" size={32} />
                <h2 className="text-4xl md:text-5xl font-serif font-black text-careermap-navy dark:text-white">Career Outcomes</h2>
              </div>
              <p className="text-lg text-slate-500 font-medium max-w-2xl font-serif italic">
                The specific professional roles you reach by completing our roadmaps and courses.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-careermap-navy text-white shadow-lg' 
                      : 'text-slate-400 hover:text-careermap-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filteredCareers.map(career => (
              <div key={career.id} className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-careermap-navy/5 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-careermap-teal group-hover:text-white transition-all duration-500">
                    <Award size={32} />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                    career.difficulty === 'Advanced' ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-careermap-teal'
                  }`}>
                    {career.difficulty}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-careermap-teal mb-3">{career.category}</div>
                  <h3 className="text-3xl font-serif font-black text-careermap-navy dark:text-white group-hover:text-careermap-teal transition-colors mb-4">{career.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{career.description}</p>
                </div>

                <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800 flex-1">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <MapIcon size={12} /> Prerequisite Roadmap
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent hover:border-careermap-teal group/rdmp transition-all cursor-pointer">
                      <div className="font-bold text-sm text-slate-800 dark:text-white group-hover/rdmp:text-careermap-teal flex items-center justify-between">
                        {career.roadmapName}
                        <ArrowRight size={14} className="opacity-0 group-hover/rdmp:opacity-100 transition-all translate-x-2 group-hover/rdmp:translate-x-0" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <BookOpen size={12} /> Core Course Integrations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {career.topCourses.map(course => (
                        <span key={course} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold border border-transparent hover:border-careermap-navy dark:hover:border-careermap-teal transition-all">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Potential Earnings</div>
                      <div className="text-xl font-serif font-black text-careermap-navy dark:text-teal-400">{career.averageSalary}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Market Index</div>
                      <div className="text-xs font-black text-emerald-500 uppercase tracking-widest">{career.growth} Growth</div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-careermap-navy hover:bg-[#023058] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-navy-500/10 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn">
                    Aim for this Career <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION: THE FINAL PUSH ─────────────────── */}
      <div className="bg-gradient-to-br from-careermap-teal to-cyan-600 rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 opacity-20 pointer-events-none">
          <GraduationCap size={400} />
        </div>
        
        <div className="relative z-10 text-center lg:text-left">
          <div className="max-w-xl">
            <h2 className="text-4xl lg:text-6xl font-serif font-black mb-8 leading-tight">Your Success Story Starts with a Single <span className="text-careermap-navy">Roadmap.</span></h2>
            <p className="text-lg text-white/80 font-medium mb-10 leading-relaxed">
              Don't just learn. Build. Deploy. Succeed. Our AI-driven paths ensure you only study what truly matters for your chosen destination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-10 py-5 bg-careermap-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-navy-950/20 hover:scale-[1.05] transition-all active:scale-95 flex items-center justify-center gap-3">
                <MapIcon size={18} /> Generate My Path
              </button>
              <button className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all backdrop-blur-md flex items-center justify-center gap-3">
                <Users size={18} /> Connect with Alumni
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationHub;

