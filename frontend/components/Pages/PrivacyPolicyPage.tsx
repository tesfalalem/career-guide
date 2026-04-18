import React from 'react';
import { Shield, Lock, Eye, Database, Globe, UserCheck } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "April 18, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: "We collect information you provide directly to us when you create an account, such as your BDU email address, name, academic year, and department. We also collect data about your career interests and learning progress (XP, course completions) to power our AI roadmapping features."
    },
    {
      title: "2. How We Use Your Information",
      icon: Eye,
      content: "Your data is primarily used to personalize your learning journey. This includes generating custom career roadmaps, recommending relevant courses, and providing analytics on your skill growth. We also use aggregated, non-identifying data to improve the platform's performance and AI accuracy."
    },
    {
      title: "3. AI Processing & Third Parties",
      icon: Globe,
      content: "To provide AI-generated content, we may process your career goals through third-party AI providers (e.g., Groq, OpenRouter). This data is processed anonymously and is not used to train global AI models. We do not sell your personal information to any third parties."
    },
    {
      title: "4. Data Security",
      icon: Lock,
      content: "We implement robust security measures to protect your data, including end-to-end encryption for sensitive information and restricted access to database records. BDU verification ensures that only legitimate students and teachers can access the platform's resources."
    },
    {
      title: "5. Your Rights",
      icon: UserCheck,
      content: "You have the right to access, update, or delete your personal information at any time through your Profile Settings. If you choose to delete your account, all associated progress data will be permanently removed from our active servers."
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-[900px] mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 animate-fade-in-up">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 animate-fade-in-up">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-12 italic">
              "At CareerGuide, we are committed to protecting the privacy of our BiT students and teachers. This policy outlines how we handle your digital footprint within our AI-powered ecosystem."
            </p>
            
            <div className="space-y-12">
              {sections.map((section, i) => (
                <section key={i} className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                      <section.icon size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg pl-14">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

            <div className="mt-20 p-8 rounded-3xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Questions about your privacy?</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-0">
                If you have any concerns regarding how your data is handled, please contact our privacy officer at <a href="mailto:tesfalemtm54@gmail.com" className="text-teal-600 hover:underline font-bold">tesfalemtm54@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
