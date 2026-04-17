import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, User, Mail, Lock, Loader2, Briefcase, ChevronLeft, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface EnhancedSignUpPageProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'dashboard') => void;
  onSignup: (user: any) => void;
}

const EnhancedSignUpPage: React.FC<EnhancedSignUpPageProps> = ({ onNavigate, onSignup }) => {
  const [step, setStep] = useState(1);
  const [rolePreference, setRolePreference] = useState<'student' | 'teacher'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Student fields
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  
  // Teacher fields
  const [institution, setInstitution] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const expertiseOptions = [
    'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Data Science', 'ML/AI',
    'DevOps', 'Cloud', 'Security', 'UI/UX', 'Database', 'Architecture'
  ];

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const toggleExpertise = (area: string) => {
    setExpertiseAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNext = () => {
    if (step === 1) {
      setError(null);

      if (!fullName.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (fullName.trim().split(/\s+/).length < 2) {
        setError('Please enter at least your first name and father\'s name');
        return;
      }
      
      if (!email.trim()) {
        setError('Email address is required');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!password) {
        setError('Password is required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (passwordStrength < 60) {
        setError('Please use a stronger password (include numbers and symbols)');
        return;
      }

      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const registrationData: any = {
        name: fullName,
        email,
        password,
        role_request: rolePreference,
        role_preference: rolePreference,
      };

      if (rolePreference === 'student') {
        registrationData.student_id = studentId;
        registrationData.department = department;
        registrationData.academic_year = academicYear;
        registrationData.graduation_year = graduationYear ? parseInt(graduationYear) : null;
      } else {
        registrationData.institution = institution;
        registrationData.years_experience = parseInt(yearsExperience);
        registrationData.expertise_areas = expertiseAreas;
        registrationData.qualifications = qualifications;
        registrationData.bio = bio;
      }

      const data = await apiClient.register(fullName, email, password, registrationData);
      
      localStorage.setItem('user', JSON.stringify(data.user));
      onSignup(data.user);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* ── Floating background blobs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-teal-50 dark:bg-teal-900/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-cyan-50/50 dark:bg-cyan-900/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Decorative dots */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400/10 dark:bg-teal-400/5"
            style={{
              width: `${10 + i * 5}px`,
              height: `${10 + i * 5}px`,
              top: `${10 + i * 12}%`,
              left: `${i % 2 === 0 ? 5 + i * 3 : 90 - i * 3}%`,
              animation: `dotPulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation Back */}
      <button 
        onClick={() => step === 1 ? onNavigate('home') : setStep(1)}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-careermap-teal dark:hover:text-teal-400 transition-all font-bold text-[10px] uppercase tracking-[0.3em] z-50 group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/30 transition-all">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span>{step === 1 ? 'Home' : 'Previous Step'}</span>
      </button>

      <div className={`w-full max-w-[580px] relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 animate-fade-in-up">
            <Sparkles size={13} className="text-teal-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-careermap-teal dark:text-teal-400">
              Future Talent Network
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {step === 1 ? 'Create your account' : 'Complete your profile'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            {step === 1 
              ? 'Join 2,000+ Students bridging the gap to professional careers' 
              : `Fill in your ${rolePreference} details to personalize your experience`}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-teal-500/5 overflow-hidden relative">
          
          <style dangerouslySetInnerHTML={{ __html: `
            input:-webkit-autofill,
            input:-webkit-autofill:hover, 
            input:-webkit-autofill:focus, 
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 40px white inset !important;
              -webkit-text-fill-color: #0f172a !important;
              transition: background-color 5000s ease-in-out 0s;
            }
            .dark input:-webkit-autofill,
            .dark input:-webkit-autofill:hover, 
            .dark input:-webkit-autofill:focus, 
            .dark input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 40px #1e293b inset !important;
              -webkit-text-fill-color: white !important;
            }
          `}} />
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500 ease-out"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
            <span className="text-[10px] font-black text-careermap-teal dark:text-teal-400 uppercase tracking-widest whitespace-nowrap">
              Step {step} of 2
            </span>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Step 1 Content */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Role Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                  Who are you?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRolePreference('student')}
                    className={`relative group p-6 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden ${
                      rolePreference === 'student'
                        ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-500/10'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      rolePreference === 'student' ? 'bg-careermap-navy text-white shadow-lg shadow-teal-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <GraduationCap size={24} />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">Student</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Looking for a roadmap</div>
                    
                    {rolePreference === 'student' && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-careermap-navy" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRolePreference('teacher')}
                    className={`relative group p-6 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden ${
                      rolePreference === 'teacher'
                        ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-500/10'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      rolePreference === 'teacher' ? 'bg-careermap-navy text-white shadow-lg shadow-teal-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Briefcase size={24} />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">Teacher</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Mentoring next generation</div>

                    {rolePreference === 'teacher' && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-careermap-navy" />
                    )}
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleNext(); }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                    Full Name
                  </label>
                  <div className="group relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                      <User size={20} />
                    </div>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 placeholder:font-medium focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all shadow-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

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
                      autoComplete="email"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 placeholder:font-medium focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all shadow-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">
                    Strong Password
                  </label>
                  <div className="group relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-careermap-teal transition-colors">
                      <Lock size={20} />
                    </div>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 font-bold text-slate-900 dark:text-white placeholder:text-slate-400/70 placeholder:font-medium focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all shadow-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                  {password && (
                    <div className="px-1 space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Strength</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${
                           passwordStrength < 40 ? 'text-red-500' : passwordStrength < 70 ? 'text-yellow-500' : 'text-emerald-500'
                         }`}>
                           {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Excellent'}
                         </span>
                       </div>
                       <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                         <div className={`h-full transition-all duration-500 ${passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${passwordStrength}%` }} />
                       </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-careermap-navy hover:bg-[#023058] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all group"
                >
                  Continue 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          )}

          {/* Step 2 Content */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in-up">
              <form onSubmit={handleSignUp} className="space-y-6">
                {rolePreference === 'student' ? (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">ID Number</label>
                        <input 
                          type="text" 
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white"
                          placeholder="BIT/123/12"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">Department</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all"
                          required
                        >
                          <option value="">Select Dept</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Information System">Information System</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">Academic Year</label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-all"
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="5th Year">5th Year</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">Graduation</label>
                        <input 
                          type="number" 
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white focus:border-teal-500 transition-all"
                          placeholder="2026"
                          min="2020"
                          max="2035"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">Institution</label>
                        <input 
                          type="text" 
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white"
                          placeholder="Bahir Dar University"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1">Experience</label>
                        <input 
                          type="number" 
                          value={yearsExperience}
                          onChange={(e) => setYearsExperience(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white"
                          placeholder="5"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-1 text-center block">Expertise Areas</label>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {expertiseOptions.map(area => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleExpertise(area)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              expertiseAreas.includes(area)
                                ? 'bg-careermap-navy border-careermap-navy text-white shadow-lg shadow-teal-500/20'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-teal-300'
                            }`}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-careermap-navy hover:bg-[#023058] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 group"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      Build My Network
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Social Proof Footer */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
              Already have a professional account?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="text-careermap-teal dark:text-teal-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
            <div className="flex justify-center items-center gap-6 grayscale opacity-30 dark:opacity-20 contrast-125">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white">MInT</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white">BiT-BDU</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white">EthioJobs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSignUpPage;
