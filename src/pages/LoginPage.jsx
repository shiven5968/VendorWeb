import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  UserPlus, 
  LogIn, 
  Lock, 
  Mail, 
  User, 
  Building, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  GraduationCap,
  Shield,
  ChefHat,
  Loader2,
  FileBadge
} from 'lucide-react';

export const LoginPage = ({ initialRole = 'student', onBackToRoles }) => {
  const { login, register, resetPassword, loading: authLoading } = useAuth();
  const { setCurrentPage } = useApp();

  const [activeRole, setActiveRole] = useState(initialRole);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single-state object for login
  const [loginData, setLoginData] = useState({
    identifier: '', // email or admission number
    password: ''
  });

  // Single-state object for student registration
  const [regData, setRegData] = useState({
    name: '',
    admissionNumber: '',
    email: '',
    gender: 'Male',
    hostelBlock: 'DNB Block',
    password: '',
    confirmPassword: ''
  });

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');

  const hostelBlocks = [
    'DNB Block',
    'VKB Block',
    'RKB Block',
    'ABB Block',
    'Kalpana Chawla (Girls)',
    'Sarojini Block (Girls)',
    'Kasturba Block (Girls)'
  ];

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await login(loginData.identifier, loginData.password);
      setCurrentPage('dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: regData.name,
        admissionNumber: regData.admissionNumber,
        email: regData.email,
        password: regData.password,
        gender: regData.gender,
        hostelBlock: regData.hostelBlock
      });
      setSuccessMessage('Account registered successfully! Redirecting to dashboard...');
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your college email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(resetEmail);
      setSuccessMessage('Password reset instructions sent to your email.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleMeta = {
    student: {
      title: 'Student Portal',
      subtitle: 'Sign in to access daily mess menus, nutrition & ratings',
      icon: GraduationCap,
      color: 'emerald'
    },
    warden: {
      title: 'Chief Warden Portal',
      subtitle: 'Hostel administration & mess quality governance',
      icon: Shield,
      color: 'blue'
    },
    committee: {
      title: 'Mess Committee Portal',
      subtitle: 'Operational menu studio & student complaints manager',
      icon: ChefHat,
      color: 'purple'
    }
  };

  const currentMeta = roleMeta[activeRole] || roleMeta.student;
  const RoleIcon = currentMeta.icon;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 pb-20">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Top Role Switcher Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <button
            type="button"
            onClick={onBackToRoles}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Role</span>
          </button>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {activeRole.replace('_', ' ')}
          </span>
        </div>

        {/* Role Icon & Title */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
            <RoleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentMeta.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Student Sign In / Register Tab Switcher */}
        {activeRole === 'student' && (
          <div className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                {activeRole === 'student' ? 'College Email or Admission No.' : 'Official College Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="identifier"
                  placeholder={activeRole === 'student' ? 'student@abes.ac.in or 210032...' : 'staff@abes.ac.in'}
                  value={loginData.identifier}
                  onChange={handleLoginChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot'); setErrorMessage(''); }}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to {currentMeta.title}</span>
              )}
            </button>
          </form>
        )}

        {/* STUDENT REGISTRATION FORM */}
        {activeTab === 'register' && activeRole === 'student' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="e.g. Parth Sharma"
                  value={regData.name}
                  onChange={handleRegChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Admission No. *</label>
                <input
                  type="text"
                  required
                  name="admissionNumber"
                  placeholder="210032..."
                  value={regData.admissionNumber}
                  onChange={handleRegChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender *</label>
                <select
                  name="gender"
                  value={regData.gender}
                  onChange={handleRegChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">College Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="student@abes.ac.in"
                  value={regData.email}
                  onChange={handleRegChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hostel Block *</label>
              <select
                name="hostelBlock"
                value={regData.hostelBlock}
                onChange={handleRegChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
              >
                {hostelBlocks.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password *</label>
                <input
                  type="password"
                  required
                  name="password"
                  placeholder="Min 6 chars"
                  value={regData.password}
                  onChange={handleRegChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirm *</label>
                <input
                  type="password"
                  required
                  name="confirmPassword"
                  placeholder="Repeat"
                  value={regData.confirmPassword}
                  onChange={handleRegChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Registered College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@abes.ac.in"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
