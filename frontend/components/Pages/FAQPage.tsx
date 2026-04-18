import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, BookOpen, Sparkles, UserCircle } from 'lucide-react';

const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: "General",
      icon: HelpCircle,
      items: [
        { q: "What is CareerGuide?", a: "CareerGuide is an AI-powered platform specifically designed for Bahir Dar Institute of Technology (BiT) students. It helps students map out their career paths, learn in-demand skills, and connect with industry opportunities." },
        { q: "Is CareerGuide free for students?", a: "Yes, the core features of CareerGuide, including AI roadmap generation and course enrollment, are free for verified BiT students." }
      ]
    },
    {
      category: "AI & Roadmaps",
      icon: Sparkles,
      items: [
        { q: "How does the AI generate roadmaps?", a: "Our AI analyzes your career goals and interests, then cross-references them with current industry requirements and the BiT curriculum to create a step-by-step learning journey." },
        { q: "Can I customize my roadmap?", a: "Absolutely. While the AI provides a starting point, you can adjust your interests and goals at any time to regenerate a path that better fits your changing aspirations." }
      ]
    },
    {
      category: "Courses & Learning",
      icon: BookOpen,
      items: [
        { q: "Who provides the courses?", a: "Courses are a mix of AI-generated content based on global best practices, curated external resources from top platforms, and materials uploaded by verified BiT teachers." },
        { q: "Do I get certificates?", a: "We track your course completion and progress (XP). Official certification integration with BDU departments is currently in our roadmap." }
      ]
    },
    {
      category: "Account & Access",
      icon: UserCircle,
      items: [
        { q: "How do I sign up as a teacher?", a: "When registering, select the 'Teacher' role. Your account will undergo a verification process by the admin team before you can upload resources." },
        { q: "I forgot my password, what do I do?", a: "Click the 'Forgot Password' link on the login page to receive a reset link via your registered email." }
      ]
    }
  ];

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Find answers to common questions about CareerGuide, AI roadmaps, and how to make the most of the platform.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-careermap-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="space-y-12">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, catIdx) => (
              <div key={catIdx} className="animate-fade-in-up" style={{ animationDelay: `${catIdx * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600">
                    <category.icon size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {category.category}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIdx) => {
                    const globalIdx = `${catIdx}-${itemIdx}`;
                    const isOpen = openIdx === parseInt(globalIdx.replace('-', '')); // Simple toggle logic for demo
                    
                    return (
                      <div 
                        key={itemIdx}
                        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:border-teal-500/30"
                      >
                        <button 
                          onClick={() => setOpenIdx(openIdx === itemIdx + catIdx*10 ? null : itemIdx + catIdx*10)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left group"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-careermap-teal transition-colors">
                            {item.q}
                          </span>
                          {openIdx === itemIdx + catIdx*10 ? (
                            <ChevronUp className="text-slate-400" size={18} />
                          ) : (
                            <ChevronDown className="text-slate-400" size={18} />
                          )}
                        </button>
                        
                        {openIdx === itemIdx + catIdx*10 && (
                          <div className="px-6 pb-5 pt-0 text-slate-500 dark:text-slate-400 leading-relaxed animate-fade-in">
                            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 mb-4" />
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-careermap-navy text-center animate-fade-in-up">
          <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
          <p className="text-teal-100/70 mb-8">
            Can't find the answer you're looking for? Our team is here to help you.
          </p>
          <a 
            href="mailto:tesfalemtm54@gmail.com"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-teal-500/20"
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
};

export default FAQPage;
