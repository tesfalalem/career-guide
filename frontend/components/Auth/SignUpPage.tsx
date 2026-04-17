
import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, Github, User, Mail, Lock, BookOpen, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface SignUpPageProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'dashboard') => void;
  onSignup: (user: any) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate, onSignup }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = 'Please enter at least your first name and father\'s name';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 50) {
      errors.password = 'Password is too weak. Add uppercase, numbers, or symbols';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleNameChange = (value: string) => {
    setFullName(value);
    if (validationErrors.fullName) {
      setValidationErrors(prev => ({ ...prev, fullName: '' }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.register(fullName, email, password);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update user state in App
      onSignup(data.user);
      
      // Navigate to onboarding
      onNavigate('onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 blueprint-bg">
      <button 
        onClick={() => onNavigate('home')}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-careermap-teal transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="w-full max-w-[540px] animate-reveal">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 p-10 md:p-14">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-careermap-navy rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-teal-500/20">
              <span className="text-3xl font-black">BiT</span>
            </div>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Initialize Profile</h1>
            <p className="text-slate-400 font-medium text-center">Join the network of future-ready BiT engineers.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* OAuth buttons disabled - Backend doesn't support OAuth yet */}
            {/*
            <button 
              className="flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm opacity-50 cursor-not-allowed"
              disabled
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Google (Soon)
            </button>
            <button 
              className="flex items-center justify-center gap-3 bg-[#24292F] text-white py-4 rounded-2xl hover:bg-[#1a1e22] transition-all font-bold shadow-sm opacity-50 cursor-not-allowed"
              disabled
            >
              <Github size={20} />
              Github (Soon)
            </button>
            */}
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Register with Email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5" autoComplete="off">
            {/* Hidden dummy inputs to prevent browser autofill */}
            <input type="text" name="fake-username" autoComplete="username" tabIndex={-1} style={{ opacity: 0, height: 0, position: 'absolute' }} />
            <input type="password" name="fake-password" autoComplete="current-password" tabIndex={-1} style={{ opacity: 0, height: 0, position: 'absolute' }} />
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-semibold text-slate-700 focus:ring-2 ${
                    validationErrors.fullName ? 'ring-2 ring-red-300' : 'focus:ring-teal-500/20'
                  } outline-none transition-all placeholder:text-slate-400`}
                  placeholder="Please Enter Your Name"
                  required
                />
              </div>
              {validationErrors.fullName && (
                <p className="text-red-500 text-xs ml-1 mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  autoComplete="new-password"
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-semibold text-slate-700 focus:ring-2 ${
                    validationErrors.email ? 'ring-2 ring-red-300' : 'focus:ring-teal-500/20'
                  } outline-none transition-all placeholder:text-slate-400`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-xs ml-1 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  autoComplete="new-password"
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-semibold text-slate-700 focus:ring-2 ${
                    validationErrors.password ? 'ring-2 ring-red-300' : 'focus:ring-teal-500/20'
                  } outline-none transition-all placeholder:text-slate-400`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength < 40 ? 'bg-red-500' :
                          passwordStrength < 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                      passwordStrength < 40 ? 'text-red-500' :
                      passwordStrength < 70 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength < 40 ? 'Weak' :
                       passwordStrength < 70 ? 'Medium' :
                       'Strong'}
                    </span>
                  </div>
                </div>
              )}
              {validationErrors.password && (
                <p className="text-red-500 text-xs ml-1 mt-1">{validationErrors.password}</p>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-careermap-navy hover:bg-[#023058] text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <React.Fragment><BookOpen size={20} /> Create Profile</React.Fragment>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 font-medium">
            Already have an identity? 
            <button onClick={() => onNavigate('login')} className="text-careermap-teal font-bold hover:underline ml-1">Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
