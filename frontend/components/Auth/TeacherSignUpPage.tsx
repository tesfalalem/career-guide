import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, User, Mail, Lock, Briefcase, Building, Award, Loader2, CheckCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface TeacherSignUpPageProps {
  onNavigate: (view: 'home' | 'login' | 'signup' | 'dashboard') => void;
  onSignup: (user: any) => void;
}

const TeacherSignUpPage: React.FC<TeacherSignUpPageProps> = ({ onNavigate, onSignup }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Basic Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 2: Professional Info
  const [institution, setInstitution] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  
  // Step 3: Expertise
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [linkedIn, setLinkedIn] = useState('');

  const expertiseOptions = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
    'Artificial Intelligence', 'Cloud Computing', 'DevOps', 'Cybersecurity',
    'Database Management', 'UI/UX Design', 'Software Architecture', 'Blockchain',
    'Game Development', 'IoT', 'Network Engineering', 'Quality Assurance'
  ];

  const toggleExpertise = (area: string) => {
    setExpertiseAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const validateStep1 = () => {
    if (!fullName.trim() || fullName.length < 3) {
      setError('Please enter your full name (at least 3 characters)');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!institution.trim()) {
      setError('Please enter your institution name');
      return false;
    }
    if (!yearsExperience || parseInt(yearsExperience) < 0) {
      setError('Please enter your years of experience');
      return false;
    }
    if (!qualifications.trim()) {
      setError('Please enter your qualifications');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (expertiseAreas.length === 0) {
      setError('Please select at least one area of expertise');
      return false;
    }
    if (!bio.trim() || bio.length < 50) {
      setError('Please write a bio (at least 50 characters)');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const qualificationsArray = qualifications.split(',').map(q => q.trim()).filter(q => q);
      
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          role_preference: 'teacher',
          institution: institution,
          years_experience: parseInt(yearsExperience),
          qualifications: qualificationsArray,
          expertise_areas: expertiseAreas,
          bio: bio,
          linkedin_url: linkedIn || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSignup(data.user);
        onNavigate('dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('signup')}
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-careermap-teal mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to role selection
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-careermap-navy rounded-2xl flex items-center justify-center">
              <GraduationCap className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-primary dark:text-white">Teacher Registration</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Join our platform and share your knowledge</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s 
                  ? 'bg-careermap-navy text-white' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                {step > s ? <CheckCircle size={20} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 rounded ${
                  step > s ? 'bg-careermap-navy' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-primary dark:text-white mb-6">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="Dr. John Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="john.smith@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-primary dark:text-white mb-6">Professional Information</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Institution/Organization *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="University of Technology"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Years of Teaching Experience *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Qualifications/Degrees *
                  </label>
                  <div className="relative">
                    <Award className="absolute left-4 top-4 text-slate-400" size={20} />
                    <textarea
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white resize-none"
                      placeholder="PhD in Computer Science, MSc in Software Engineering"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Separate multiple qualifications with commas</p>
                </div>
              </div>
            )}

            {/* Step 3: Expertise & Bio */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-primary dark:text-white mb-6">Expertise & About You</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Areas of Expertise * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {expertiseOptions.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleExpertise(area)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          expertiseAreas.includes(area)
                            ? 'bg-careermap-navy text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Selected: {expertiseAreas.length}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Professional Bio *
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white resize-none"
                    placeholder="Tell us about your teaching experience, philosophy, and what you're passionate about..."
                  />
                  <p className="text-xs text-slate-500 mt-1">{bio.length} / 50 minimum characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-primary dark:text-white"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-careermap-navy text-white rounded-xl font-semibold hover:bg-[#023058] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-careermap-teal font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default TeacherSignUpPage;
