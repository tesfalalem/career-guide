
import React, { useState } from 'react';
import { Users, Shield, MessageSquare, ArrowUpRight, Search, Filter, ShieldCheck, Mail, Star } from 'lucide-react';

const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'feedback' | 'roles'>('users');

  const users = [
    { id: '1', name: 'Meareg Teame', email: 'meareg@bit.bdu.edu.et', role: 'student', year: '4th Year', progress: '85%' },
    { id: '2', name: 'Abebe Bikila', email: 'abebe@bit.bdu.edu.et', role: 'student', year: '3rd Year', progress: '42%' },
    { id: '3', name: 'Sara Kebede', email: 'sara@bit.bdu.edu.et', role: 'admin', year: 'Faculty', progress: '100%' },
    { id: '4', name: 'Dawit Mekonnen', email: 'dawit@bit.bdu.edu.et', role: 'student', year: '5th Year', progress: '72%' },
  ];

  return (
    <div className="animate-reveal space-y-12">
      <header>
        <h1 className="text-5xl font-extrabold text-primary dark:text-white tracking-tight mb-3">Institutional Control</h1>
        <p className="text-slate-400 dark:text-slate-500 font-medium text-lg">Manage protocols, verify academic identities, and provide expert feedback.</p>
      </header>

      <div className="flex border-b border-slate-100 dark:border-slate-800 gap-10">
        {[
          { id: 'users', label: 'Manage Students', icon: Users },
          { id: 'feedback', label: 'Student Feedback', icon: MessageSquare },
          { id: 'roles', label: 'Role Management', icon: ShieldCheck },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-4 font-bold text-sm uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-secondary border-b-2 border-secondary' : 'text-slate-300 hover:text-primary dark:hover:text-white'}`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Search students by protocol email or identity..." 
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-secondary transition-all font-semibold"
              />
            </div>
            <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400">
              <Filter size={16} /> Filters
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Year</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role Status</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Roadmap Progress</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-primary dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{u.year}</td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-brand/10 text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                          <div className="h-full bg-success" style={{ width: u.progress }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{u.progress}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-secondary transition-all">
                        <ArrowUpRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-sm hover:border-secondary transition-all">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Mail className="text-slate-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary dark:text-white">Submission Review</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">BiT Lab Project Alpha</p>
                  </div>
                </div>
                <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed italic">
                "I have completed the microservices implementation for the local e-commerce project. Requesting faculty feedback on the architectural design."
              </p>
              <div className="flex gap-4">
                <button className="flex-1 bg-secondary text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary transition-all">Provide Feedback</button>
                <button className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Archive</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="max-w-2xl mx-auto text-center space-y-12 py-20">
          <Shield className="mx-auto text-secondary" size={80} strokeWidth={1} />
          <h2 className="text-4xl font-display font-bold text-primary dark:text-white">Institutional Authority</h2>
          <p className="text-slate-400 font-medium text-lg leading-relaxed">
            As an administrator, you can grant faculty status or mentor roles to verified users. Use this protocol only for authorized BiT personnel.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] text-left">
             <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                 <div className="flex items-center gap-4">
                   <Star className="text-secondary" />
                   <span className="font-bold text-primary dark:text-white">Grant Admin Status</span>
                 </div>
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-secondary transition-colors">Configure Access</button>
               </div>
               <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                 <div className="flex items-center gap-4">
                   <ShieldCheck className="text-emerald-500" />
                   <span className="font-bold text-primary dark:text-white">Faculty Accreditation</span>
                 </div>
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-secondary transition-colors">Verify Credentials</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
