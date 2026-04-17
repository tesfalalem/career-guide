import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Lock, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface LoginPageProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'dashboard') => void;
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.login(email, password);
      onLogin(data.user);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };
    
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* ── Floating background blobs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50 dark:bg-teal-900/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-50/50 dark:bg-cyan-900/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation Back */}
      <button 
        onClick={() => onNavigate('home')}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-careermap-teal dark:hover:text-teal-400 transition-all font-bold text-[10px] uppercase tracking-[0.3em] z-50 group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/30 transition-all">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span>Home</span>
      </button>

      <div className={`w-full max-w-[480px] relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 animate-fade-in-up">
            <Sparkles size={13} className="text-teal-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-careermap-teal dark:text-teal-400">
              Welcome Back
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Sign In
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Continue your professional journey with BiT CareerGuide
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-teal-500/5 overflow-hidden">
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                Email Address
              </label>
              <div className="group relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
                    validationErrors.email ? 'border-red-300' : 'border-slate-100 dark:border-slate-800'
                  } rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none transition-all shadow-sm`}
                  placeholder="your.email@example.com"
                />
              </div>
              {validationErrors.email && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{validationErrors.email}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Password
                </label>
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-careermap-teal hover:underline">Forgot?</button>
              </div>
              <div className="group relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
                    validationErrors.password ? 'border-red-300' : 'border-slate-100 dark:border-slate-800'
                  } rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none transition-all shadow-sm`}
                  placeholder="••••••••••••"
                />
              </div>
              {validationErrors.password && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{validationErrors.password}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-careermap-navy hover:bg-[#023058] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              New to BiT CareerGuide?{' '}
              <button 
                onClick={() => onNavigate('signup')}
                className="text-careermap-teal dark:text-teal-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
