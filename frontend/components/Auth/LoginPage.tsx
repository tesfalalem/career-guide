import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Lock, Loader2, ChevronLeft, Sparkles, User, Phone, CheckCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface LoginPageProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'dashboard') => void;
  onLogin: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isVisible, setIsVisible] = useState(false);

  // Forgot Password States
  const [forgotName, setForgotName] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const [forgotErrors, setForgotErrors] = useState<{[key: string]: string}>({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotStrength, setForgotStrength] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
    return emailRegex.test(email.trim());
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

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val.trim()) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy.email;
        return copy;
      });
    } else if (validateEmail(val)) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy.email;
        return copy;
      });
    } else {
      if (val.includes('@') || validationErrors.email) {
        setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }
  };

  const handleEmailBlur = () => {
    if (email.trim() && !validateEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    }
  };

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 15;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const validateName = (nameStr: string): string | null => {
    const trimmed = nameStr.trim();
    if (!trimmed) return 'Full name is required';
    if (trimmed.length < 5) return 'Full name must be at least 5 characters long';
    if (trimmed.length > 50) return 'Full name is too long';
    if (!trimmed.includes(' ')) return 'Please enter at least two names (First and Father name)';
    if (!/^[a-zA-Z\s\-\']+$/.test(trimmed)) return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    if (!/[a-zA-Z]/.test(trimmed)) return 'Full name must contain letters';
    if (/(.)\1{3,}/.test(trimmed)) return 'Full name contains too many repeated characters';
    if (trimmed.includes('  ')) return 'Full name contains excessive spaces';
    return null;
  };

  const validatePhone = (phoneStr: string): string | null => {
    const trimmed = phoneStr.trim();
    if (!trimmed) return 'Phone number is required';
    if (!/^\+?[0-9\s\-()]+$/.test(trimmed)) return 'Phone number can only contain digits, spaces, dashes, and parentheses';
    const digits = trimmed.replace(/[^0-9]/g, '');
    if (digits.length < 9) return 'Phone number must be at least 9 digits';
    if (digits.length > 15) return 'Phone number must be at most 15 digits';
    return null;
  };

  const validateForgotForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    const nameErr = validateName(forgotName);
    if (nameErr) errors.name = nameErr;

    if (!forgotEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(forgotEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    const phoneErr = validatePhone(forgotPhone);
    if (phoneErr) errors.phone = phoneErr;

    if (!forgotPassword) {
      errors.password = 'Password is required';
    } else if (forgotPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (calculatePasswordStrength(forgotPassword) < 60) {
      errors.password = 'Please use a stronger password (include numbers and symbols)';
    }

    if (!forgotConfirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (forgotPassword !== forgotConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setForgotErrors(errors);
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
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForgotForm()) return;

    setForgotLoading(true);
    setForgotErrors({});

    try {
      await apiClient.forgotPassword(
        forgotName,
        forgotEmail,
        forgotPhone,
        forgotPassword,
        forgotConfirmPassword
      );
      setForgotSubmitted(true);
    } catch (err: any) {
      setForgotErrors({ general: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setForgotLoading(false);
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
        onClick={() => mode === 'login' ? onNavigate('home') : setMode('login')}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-careermap-teal dark:hover:text-teal-400 transition-all font-bold text-[10px] uppercase tracking-[0.3em] z-50 group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/30 transition-all">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span>{mode === 'login' ? 'Home' : 'Back'}</span>
      </button>

      <div className={`w-full max-w-[480px] relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {mode === 'login' ? (
          <>
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
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={handleEmailBlur}
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
                    <button 
                      type="button" 
                      onClick={() => {
                        setMode('forgot');
                        setForgotSubmitted(false);
                        setForgotEmail('');
                        setForgotEmailError(null);
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-careermap-teal hover:underline"
                    >
                      Forgot?
                    </button>
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
                      Continue
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
          </>
        ) : (
          <>
            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 animate-fade-in-up">
                <Sparkles size={13} className="text-teal-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-careermap-teal dark:text-teal-400">
                  Secure Identity Reset
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Reset Password
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                Verify your identity fields to reset your password
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-teal-500/5 overflow-hidden">
              
              {forgotSubmitted ? (
                <div className="space-y-6 text-center animate-fade-in-up">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Password Reset Successful</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                      Your identity was successfully verified and your password has been updated.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setMode('login');
                      setForgotSubmitted(false);
                      setForgotEmail('');
                      setForgotName('');
                      setForgotPhone('');
                      setForgotPassword('');
                      setForgotConfirmPassword('');
                    }}
                    className="w-full bg-careermap-navy hover:bg-[#023058] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
                  >
                    <ChevronLeft size={20} />
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-5 animate-fade-in-up">
                  {forgotErrors.general && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-shake">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {forgotErrors.general}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                      Full Name
                    </label>
                    <div className="group relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                        <User size={20} />
                      </div>
                      <input 
                        type="text" 
                        value={forgotName}
                        onChange={(e) => {
                          setForgotName(e.target.value);
                          setForgotErrors(prev => { const c = {...prev}; delete c.name; return c; });
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
                          forgotErrors.name ? 'border-red-300' : 'border-slate-100 dark:border-slate-800'
                        } rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none transition-all shadow-sm`}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    {forgotErrors.name && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{forgotErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                      Email Address
                    </label>
                    <div className="group relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                        <Mail size={20} />
                      </div>
                      <input 
                        type="email" 
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotErrors(prev => { const c = {...prev}; delete c.email; return c; });
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
                          forgotErrors.email ? 'border-red-300' : 'border-slate-100 dark:border-slate-800'
                        } rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none transition-all shadow-sm`}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    {forgotErrors.email && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{forgotErrors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                      Phone Number
                    </label>
                    <div className="group relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                        <Phone size={20} />
                      </div>
                      <input 
                        type="tel" 
                        value={forgotPhone}
                        onChange={(e) => {
                          setForgotPhone(e.target.value);
                          setForgotErrors(prev => { const c = {...prev}; delete c.phone; return c; });
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
                          forgotErrors.phone ? 'border-red-300' : 'border-slate-100 dark:border-slate-800'
                        } rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none transition-all shadow-sm`}
                        placeholder="+251912345678"
                        required
                      />
                    </div>
                    {forgotErrors.phone && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{forgotErrors.phone}</p>}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                      New Password
                    </label>
                    <div className="group relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                        <Lock size={20} />
                      </div>
                      <input 
                        type="password" 
                        value={forgotPassword}
                        onChange={(e) => {
                          setForgotPassword(e.target.value);
                          setForgotStrength(calculatePasswordStrength(e.target.value));
                          setForgotErrors(prev => { const c = {...prev}; delete c.password; return c; });
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
                          forgotErrors.password ? 'border-red-300' : 'border-slate-100 dark:border-slate-800'
                        } rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none transition-all shadow-sm`}
                        placeholder="••••••••••••"
                        required
                      />
                    </div>
                    {forgotPassword && (
                      <div className="px-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Security Strength</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            forgotStrength < 40 ? 'text-red-500' : forgotStrength < 70 ? 'text-yellow-500' : 'text-emerald-500'
                          }`}>
                            {forgotStrength < 40 ? 'Weak' : forgotStrength < 70 ? 'Medium' : 'Excellent'}
                          </span>
                        </div>
                        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full transition-all duration-500 ${forgotStrength < 40 ? 'bg-red-500' : forgotStrength < 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${forgotStrength}%` }} />
                        </div>
                      </div>
                    )}
                    {forgotErrors.password && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{forgotErrors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                      Confirm New Password
                    </label>
                    <div className="group relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                        <Lock size={20} />
                      </div>
                      <input 
                        type="password" 
                        value={forgotConfirmPassword}
                        onChange={(e) => {
                          setForgotConfirmPassword(e.target.value);
                          setForgotErrors(prev => { const c = {...prev}; delete c.confirmPassword; return c; });
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
                          forgotErrors.confirmPassword ? 'border-red-300' : 'border-slate-100 dark:border-slate-800'
                        } rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 outline-none transition-all shadow-sm`}
                        placeholder="••••••••••••"
                        required
                      />
                    </div>
                    {forgotErrors.confirmPassword && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{forgotErrors.confirmPassword}</p>}
                  </div>

                  <button 
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-careermap-navy hover:bg-[#023058] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 group"
                  >
                    {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        Verify & Reset Password
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setForgotErrors({});
                      }}
                      className="text-careermap-teal dark:text-teal-400 font-bold hover:underline text-xs uppercase tracking-widest"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
