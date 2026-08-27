import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Shield, 
  ChefHat, 
  Mail, 
  Lock, 
  User, 
  FileBadge, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  RotateCw,
  LogIn,
  UserPlus
} from 'lucide-react';
import { isValidAbesEmail } from '../services/otp';

export const LoginPage = ({ initialRole = 'student', onBackToRoles }) => {
  const { 
    login, 
    register, 
    sendOTP, 
    verifyOTP, 
    resetPassword, 
    loading: authLoading 
  } = useAuth();
  const { setCurrentPage } = useApp();

  const [activeRole, setActiveRole] = useState(initialRole);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Normal Login State
  const [loginData, setLoginData] = useState({
    identifier: '', // Admission Number for student, Email for staff
    password: ''
  });

  // Student Registration Form State
  const [regData, setRegData] = useState({
    name: '',
    admissionNumber: '',
    email: '',
    gender: 'Male',
    hostelBlock: 'DNB Block',
    password: '',
    confirmPassword: ''
  });

  // Registration Multi-Step: 'form' | 'otp' | 'success'
  const [regStep, setRegStep] = useState('form');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password state
  const [resetIdentifier, setResetIdentifier] = useState('');

  const hostelBlocks = [
    'DNB Block',
    'VKB Block',
    'RKB Block',
    'ABB Block',
    'Kalpana Chawla (Girls)',
    'Sarojini Block (Girls)',
    'Kasturba Block (Girls)'
  ];

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
  };

  // 1. NORMAL LOGIN HANDLER (Admission Number + Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginData.identifier.trim()) {
      setErrorMessage(activeRole === 'student' ? 'Please enter your Admission Number.' : 'Please enter your official college email.');
      return;
    }
    if (!loginData.password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginData.identifier.trim(), loginData.password);
      setCurrentPage('dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. REGISTRATION STEP 1: SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = regData.name.trim();
    const cleanAdmission = regData.admissionNumber.trim();
    const cleanEmail = regData.email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!cleanAdmission) {
      setErrorMessage('Admission number is required.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('College email is required.');
      return;
    }
    if (!isValidAbesEmail(cleanEmail)) {
      setErrorMessage('Please enter an official ABES college email ending with @abes.ac.in');
      return;
    }
    if (regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOTP({
        email: cleanEmail,
        admissionNumber: cleanAdmission,
        name: cleanName
      });
      setSessionToken(res.sessionToken);
      setRegStep('otp');
      setResendCooldown(30);
      setSuccessMessage(`We sent a 6-digit verification code to ${cleanEmail}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. REGISTRATION STEP 2: RESEND OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const res = await sendOTP({
        email: regData.email.trim().toLowerCase(),
        admissionNumber: regData.admissionNumber.trim(),
        name: regData.name.trim()
      });
      setSessionToken(res.sessionToken);
      setResendCooldown(30);
      setSuccessMessage('Fresh verification code sent to your college email.');
    } catch (err) {
      setErrorMessage(err.message || 'Could not resend code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. REGISTRATION STEP 3: VERIFY OTP & CREATE ACCOUNT
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Step A: Verify OTP
      await verifyOTP({
        email: regData.email.trim().toLowerCase(),
        otp: cleanOtp,
        sessionToken
      });

      // Step B: Only after OTP verification, create & activate the account
      await register({
        name: regData.name.trim(),
        admissionNumber: regData.admissionNumber.trim(),
        email: regData.email.trim().toLowerCase(),
        password: regData.password,
        gender: regData.gender,
        hostelBlock: regData.hostelBlock,
        isOtpVerified: true
      });

      setRegStep('success');
      setSuccessMessage('Account activated successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. FORGOT PASSWORD HANDLER
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const clean = resetIdentifier.trim();
    if (!clean) {
      setErrorMessage(activeRole === 'student' ? 'Please enter your Admission Number or College Email.' : 'Please enter your College Email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(clean);
      setSuccessMessage(`Password reset link sent to registered email: ${res.email}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleMeta = {
    student: {
      title: 'Student Portal',
      subtitle: 'Sign in with your Admission Number & Password',
      icon: GraduationCap,
      color: 'emerald'
    },
    warden: {
      title: 'Chief Warden Portal',
      subtitle: 'Hostel administration & mess governance',
      icon: Shield,
      color: 'blue'
    },
    committee: {
      title: 'Mess Committee Portal',
      subtitle: 'Menu management & student complaints studio',
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
        {activeRole === 'student' && regStep !== 'success' && (
          <div className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { 
                setActiveTab('login'); 
                setErrorMessage(''); 
                setSuccessMessage(''); 
                setRegStep('form'); 
              }}
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
              onClick={() => { 
                setActiveTab('register'); 
                setErrorMessage(''); 
                setSuccessMessage(''); 
                setRegStep('form'); 
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
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

        {/* ========================================================================= */}
        {/* TAB 1: NORMAL LOGIN (Admission Number + Password for Student) */}
        {/* ========================================================================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                {activeRole === 'student' ? 'Admission Number' : 'Official College Email'}
              </label>
              <div className="relative">
                {activeRole === 'student' ? (
                  <FileBadge className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                )}
                <input
                  type="text"
                  required
                  name="identifier"
                  placeholder={activeRole === 'student' ? 'e.g. 2100320100001' : 'staff@abes.ac.in'}
                  value={loginData.identifier}
                  onChange={handleLoginChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                  onClick={() => { setActiveTab('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>{activeRole === 'student' ? 'Sign In with Admission Number' : `Sign In to ${currentMeta.title}`}</span>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STUDENT REGISTRATION FLOW WITH OTP VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === 'register' && activeRole === 'student' && (
          <div className="space-y-4">
            
            {/* STEP 1: REGISTRATION FORM */}
            {regStep === 'form' && (
              <form onSubmit={handleSendOTP} className="space-y-3">
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
                      placeholder="e.g. 2100320100001"
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">College Email (ABES only) *</label>
                    <span className="text-[9px] text-slate-400 font-semibold">For OTP verification</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      name="email"
                      placeholder="e.g. student@abes.ac.in"
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
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send OTP to College Email</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
            {regStep === 'otp' && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    We sent a verification code to:
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {regData.email}
                  </span>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Enter the 6-digit code to verify your college identity and activate your account.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full py-3 px-4 text-center text-xl tracking-[0.5em] font-black rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => { setRegStep('form'); setErrorMessage(''); }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
                  >
                    Edit Registration Form
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSubmitting}
                    onClick={handleResendOTP}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center space-x-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || enteredOtp.length !== 6}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Activating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Create Account</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: SUCCESSFUL REGISTRATION SCREEN */}
            {regStep === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Account Created Successfully! 🎉
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your account is verified and ready. From now on, your permanent login credentials are:
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-left space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">Login ID:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300 font-mono">{regData.admissionNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">Verified Email:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">{regData.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage('dashboard')}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors"
                >
                  Continue to Student Dashboard
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FORGOT PASSWORD FORM */}
        {/* ========================================================================= */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                {activeRole === 'student' ? 'Admission Number or Registered College Email' : 'Registered College Email'}
              </label>
              <div className="relative">
                {activeRole === 'student' ? (
                  <FileBadge className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                )}
                <input
                  type="text"
                  required
                  placeholder={activeRole === 'student' ? '210032... or student@abes.ac.in' : 'staff@abes.ac.in'}
                  value={resetIdentifier}
                  onChange={e => setResetIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {activeRole === 'student' 
                  ? 'We will locate your verified college email and dispatch password reset instructions.'
                  : 'Enter your official college email address to receive a password reset link.'}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
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
