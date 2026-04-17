
import React from 'react';
import { MessageSquare, ThumbsUp, Share2, Plus, Users, Hash } from 'lucide-react';

const CommunityView: React.FC = () => {
  const threads = [
    { user: "Abebe B.", time: "2h ago", title: "Any tips for the BiT Semester 5 Compiler Design project?", likes: 24, replies: 12, tag: "Academics" },
    { user: "Sara K.", time: "5h ago", title: "Looking for a backend partner for the Safaricom Hackathon!", likes: 45, replies: 8, tag: "Collaboration" },
    { user: "Dawit M.", time: "1d ago", title: "How to properly set up Docker on Windows for Ethiopian ISP constraints?", likes: 112, replies: 56, tag: "DevOps" },
    { user: "Hirut T.", time: "2d ago", title: "CareerPath AI helped me land an internship at EthioTelecom!", likes: 890, replies: 122, tag: "Success" },
  ];

  return (
    <div className="animate-reveal space-y-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest leading-none">BiT Community</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Collaborate, share knowledge, and grow with your peers</p>
        </div>
        <button className="bg-secondary text-white px-8 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-secondary/20 flex items-center gap-3 active:scale-95 transition-all">
          <Plus size={18} /> Start Thread
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-6">
          {threads.map((thread, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-secondary border border-slate-100 dark:border-slate-800 uppercase">
                    {thread.user.split(' ')[0][0]}{thread.user.split(' ')[1][0]}
                  </div>
                  <div>
                    <p className="font-bold text-primary dark:text-white">{thread.user}</p>
                    <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">{thread.time}</p>
                  </div>
                </div>
                <span className="bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-800">{thread.tag}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-primary dark:text-white mb-10 leading-snug hover:text-secondary transition-colors">{thread.title}</h3>
              
              <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                <div className="flex gap-10">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-secondary font-bold text-xs transition-colors">
                    <ThumbsUp size={18} /> {thread.likes}
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-secondary font-bold text-xs transition-colors">
                    <MessageSquare size={18} /> {thread.replies}
                  </button>
                </div>
                <button className="text-slate-200 dark:text-slate-700 hover:text-secondary transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-10">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
            <h4 className="text-xl font-black text-primary dark:text-white mb-8 flex items-center gap-3">
              <Hash className="text-secondary" /> Popular Nodes
            </h4>
            <div className="flex flex-wrap gap-3">
              {['#ReactJS', '#BiT2024', '#Internships', '#GoLang', '#AddisTech', '#Safaricom', '#Hackathon'].map((tag) => (
                <button key={tag} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-secondary text-white p-10 rounded-[3rem] shadow-xl text-center border border-transparent dark:border-secondary/20">
            <Users size={48} className="mx-auto mb-6" />
            <h4 className="text-2xl font-black mb-4">BiT Mentors</h4>
            <p className="text-white/60 text-sm font-medium leading-relaxed mb-8">
              Join the elite alumni network and get direct guidance from industry pros.
            </p>
            <button className="w-full bg-white text-secondary py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all">
              Apply to Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
