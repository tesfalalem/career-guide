
import React, { useState, useEffect } from 'react';
import { AppLoadingSkeleton } from './components/common/Skeleton';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import Features from './components/Features';
import Footer from './components/Footer';
import LoginPage from './components/Auth/LoginPage';
import EnhancedSignUpPage from './components/Auth/EnhancedSignUpPage';
import OnboardingPage from './components/Auth/OnboardingPage';
import DashboardRouter from './components/Dashboard/DashboardRouter';
import { User } from './types';
import { apiClient, getToken } from './services/apiClient';

function App() {
  const [view, setView] = useState<'home' | 'login' | 'signup' | 'onboarding' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching profile
          const profile = await apiClient.getProfile();
          setUser(profile);
          setView('dashboard');
        } catch (error) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const navigateTo = (newView: 'home' | 'login' | 'signup' | 'onboarding' | 'dashboard') => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await apiClient.logout();
    localStorage.removeItem('user');
    setUser(null);
    navigateTo('home');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Loading state for initial auth check
  if (loading) {
     return <AppLoadingSkeleton />;
  }


  const handleOnboardingComplete = (selectedCareer: string) => {
    if (user) {
      // In a real app, save this selection to Supabase 'user_enrollments'
      setUser({
        ...user,
        enrolledPaths: [selectedCareer],
        xp: 50
      });
    }
    navigateTo('dashboard');
  };

  if (view === 'login') return <LoginPage onNavigate={navigateTo} onLogin={(userData) => setUser(userData)} />;
  if (view === 'signup') return <EnhancedSignUpPage onNavigate={navigateTo} onSignup={(userData) => setUser(userData)} />;
  if (view === 'onboarding') return <OnboardingPage onComplete={handleOnboardingComplete} />;
  
  if (view === 'dashboard' && user) {
    return <DashboardRouter 
      user={user} 
      onLogout={handleLogout} 
      theme={theme} 
      onToggleTheme={toggleTheme}
      onUserUpdate={handleUserUpdate}
    />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar onNavigate={navigateTo} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero onNavigate={navigateTo} />
        
        {/* Trust Layer */}
        <div className="bg-slate-50 dark:bg-slate-900/50 py-12 border-y border-slate-100 dark:border-slate-800 overflow-hidden">
           <div className="max-w-[1440px] mx-auto px-6 md:px-12 opacity-30 dark:opacity-20 grayscale contrast-125">
             <div className="grid grid-cols-3 gap-y-8 gap-x-4">
               <span className="text-xl font-bold tracking-tight uppercase text-primary dark:text-white text-center">Adama Science & Tech</span>
               <span className="text-xl font-bold tracking-tight uppercase text-primary dark:text-white text-center">MInT Ethiopia</span>
               <span className="text-xl font-bold tracking-tight uppercase text-primary dark:text-white text-center">Info Mind Solutions</span>
               <span className="text-xl font-bold tracking-tight uppercase text-primary dark:text-white text-center">IBA Ethiopia</span>
               <span className="text-xl font-bold tracking-tight uppercase text-primary dark:text-white text-center">HaHu Jobs</span>
               <span className="text-xl font-bold tracking-tight uppercase text-primary dark:text-white text-center">Ethio Clicks</span>
             </div>
           </div>
        </div>

        <Features />
        <ProblemSolution />
        
        {/* High Conversion CTA */}
        <section id="network" className="py-24 px-6 bg-white dark:bg-slate-950">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="gradient-careermap rounded-[2.5rem] p-14 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-teal-500/25">
              {/* Decorative background circles */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

              <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 relative z-10 leading-[1.1]">
                The future is <br className="hidden md:block" />
                yours to <span className="underline decoration-white/25">engineer.</span>
              </h2>
              <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 relative z-10 leading-relaxed">
                Join 2,000+ BiT students using AI-powered intelligence to bridge the gap between classroom and career.
              </p>
              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                <button
                  onClick={() => navigateTo('signup')}
                  className="bg-white text-careermap-navy hover:bg-slate-50 px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95"
                >
                  Build My Roadmap
                </button>
                <button
                  onClick={() => navigateTo('login')}
                  className="border border-white/30 hover:border-white/60 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
