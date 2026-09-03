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
  UserPlus,
  Edit3
} from 'lucide-react';
import { isValidAbesEmail } from '../services/otp';

// Explicit Step State Constants
const REG_STEPS = {
  FORM: 'REGISTRATION_FORM',
  OTP: 'OTP_VERIFICATION',
  CREATED: 'ACCOUNT_CREATED'
};

export const LoginPage = ({ initialRole = 'student', onBackToRoles }) => {
  const { 
    login, 
    register, 
    sendOTP, 
    verifyOTP, 
    resetPassword, 
    isLoginSubmitting,
    isRegisterSubmitting
  } = useAuth();
  const { setCurrentPage } = useApp();

  const [activeRole, setActiveRole] = useState(initialRole);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Granular UI loading states (not tied to AuthContext loading — pure local UI)
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Derived convenience flag: any operation in progress
  const isAnySubmitting = isLoginSubmitting || isRegisterSubmitting || isOtpSending || isOtpVerifying || isForgotSubmitting;

  // Student Normal Login State
  const [loginData, setLoginData] = useState({
    identifier: '', // Admission Number for student, Email for staff
    password: ''
  });

  // Student In-Memory Registration Form State
  const [regData, setRegData] = useState({
    name: '',
    admissionNumber: '',
    email: '',
    gender: 'Male',
    hostelBlock: 'DNB Block',
    password: '',
    confirmPassword: ''
  });

  // Registration Multi-Step: REGISTRATION_FORM -> OTP_VERIFICATION -> ACCOUNT_CREATED
  const [regStep, setRegStep] = useState(REG_STEPS.FORM);
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
    'Block A (Girls)',
    'Block B (Girls)',
    'Block C (Girls)'
  ];

  // Cooldown countdown timer for OTP resend (30s)
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

    const cleanIdentifier = loginData.identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage(activeRole === 'student' ? 'Please enter your Admission Number.' : 'Please enter your official college email.');
      return;
    }
    if (!loginData.password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Role-specific pre-check for ABES Officials
    if (activeRole === 'warden') {
      const email = cleanIdentifier.toLowerCase();
      const authorizedOfficials = ['anita@abes.ac.in', 'alok@abes.ac.in'];
      if (!authorizedOfficials.includes(email)) {
        setErrorMessage('Access Denied: Only authorized ABES Officials (anita@abes.ac.in, alok@abes.ac.in) are permitted to sign in to this portal.');
        return;
      }
    }

    try {
      setIsLoginSubmitting(true);
      const res = await login(cleanIdentifier, loginData.password);
      
      // Strict role boundary enforcement:
      if (activeRole === 'warden' && res?.profile?.role !== 'warden') {
        await logout();
        setErrorMessage('Access Denied: This account is not authorized as an ABES Official.');
        return;
      }
      if (activeRole === 'committee' && res?.profile?.role !== 'mess_committee' && res?.profile?.role !== 'committee') {
        await logout();
        setErrorMessage('Access Denied: This account is not authorized as Mess Committee.');
        return;
      }

      setCurrentPage('dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  // 2. STEP 1: SUBMIT REGISTRATION FORM & SEND OTP (POST /api/send-otp)
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

    setIsOtpSending(true);
    try {
      const res = await sendOTP({
        email: cleanEmail,
        admissionNumber: cleanAdmission,
        name: cleanName
      });

      if (res && res.sessionToken) {
        setSessionToken(res.sessionToken);
      }

      // Move to STEP 2 ONLY AFTER API confirms OTP was dispatched
      setRegStep(REG_STEPS.OTP);
      setResendCooldown(30);
      setSuccessMessage(`We sent a 6-digit verification code to ${cleanEmail}`);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to send verification code. Please try again.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // 3. STEP 2: RESEND CODE HANDLER
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isAnySubmitting) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsOtpSending(true);
    try {
      const res = await sendOTP({
        email: regData.email.trim().toLowerCase(),
        admissionNumber: regData.admissionNumber.trim(),
        name: regData.name.trim()
      });
      if (res && res.sessionToken) {
        setSessionToken(res.sessionToken);
      }
      setResendCooldown(30);
      setSuccessMessage('Fresh verification code sent to your college email.');
    } catch (err) {
      setErrorMessage(err.message || 'Unable to send verification code. Please try again.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // 4. STEP 2 → STEP 3: VERIFY OTP & CREATE ACCOUNT (POST /api/verify-otp)
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsOtpVerifying(true);
    try {
      // Step A: Call POST /api/verify-otp
      await verifyOTP({
        email: regData.email.trim().toLowerCase(),
        otp: cleanOtp,
        sessionToken
      });

      // Step B: ONLY if server returns successful verification:
      await register({
        name: regData.name.trim(),
        admissionNumber: regData.admissionNumber.trim(),
        email: regData.email.trim().toLowerCase(),
        password: regData.password,
        gender: regData.gender,
        hostelBlock: regData.hostelBlock,
        isOtpVerified: true
      });

      // Move to STEP 3: ACCOUNT_CREATED
      setRegStep(REG_STEPS.CREATED);
      setSuccessMessage('Account created successfully!');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('expired')) {
        setErrorMessage('Code expired. Request a new code.');
      } else if (msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('exceeded')) {
        setErrorMessage('Too many invalid attempts. Please request a new verification code.');
        setEnteredOtp('');
      } else {
        setErrorMessage(msg || 'Invalid verification code. Please try again.');
      }
    } finally {
      setIsOtpVerifying(false);
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

    setIsForgotSubmitting(true);
    try {
      const res = await resetPassword(clean);
      setSuccessMessage(`Password reset link sent to registered email: ${res.email}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset link.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const roleMeta = {
    student: {
      title: 'Student Sign In',
      subtitle: 'Sign in with your Admission Number & Password',
      icon: GraduationCap,
      color: 'emerald'
    },
    warden: {
      title: 'ABES Officials',
      subtitle: 'Institutional oversight & administration',
      icon: Shield,
      color: 'emerald'
    },
    committee: {
      title: 'Mess Committee',
      subtitle: 'Menu management & operational oversight',
      icon: ChefHat,
      color: 'emerald'
    }
  };

  const currentMeta = roleMeta[activeRole] || roleMeta.student;
  const RoleIcon = currentMeta.icon;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 pb-20">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Top Role Switcher Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={onBackToRoles}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Select Role</span>
          </button>
        </div>

        {/* Role Icon & Title */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
            <RoleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {currentMeta.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Student Sign In / Register Tab Switcher */}
        {activeRole === 'student' && regStep !== REG_STEPS.CREATED && (
          <div className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { 
                setActiveTab('login'); 
                setErrorMessage(''); 
                setSuccessMessage(''); 
                setRegStep(REG_STEPS.FORM); 
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
                setRegStep(REG_STEPS.FORM); 
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
                  placeholder={activeRole === 'student' ? 'e.g. 2100320100001' : activeRole === 'warden' ? 'anita@abes.ac.in or alok@abes.ac.in' : 'committee@abes.ac.in'}
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
              disabled={isLoginSubmitting}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50"
            >
              {isLoginSubmitting ? (
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
        {/* TAB 2: STUDENT REGISTRATION FLOW WITH EXPLICIT STEP GATES */}
        {/* ========================================================================= */}
        {activeTab === 'register' && activeRole === 'student' && (
          <div className="space-y-4">
            
            {/* ------------------------------------------------------------------- */}
            {/* STEP 1: REGISTRATION_FORM */}
            {/* ------------------------------------------------------------------- */}
            {regStep === REG_STEPS.FORM && (
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Confirm Password *</label>
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
                  disabled={isOtpSending}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2 disabled:opacity-50 uppercase tracking-wider"
                >
                  {isOtpSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>SEND OTP</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* STEP 2: OTP_VERIFICATION */}
            {/* ------------------------------------------------------------------- */}
            {regStep === REG_STEPS.OTP && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    We sent a 6-digit verification code to your college email.
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                    {regData.email}
                  </span>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Valid for 10 minutes.
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
                    placeholder="______"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full py-3 px-4 text-center text-2xl tracking-[0.4em] font-black rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => { setRegStep(REG_STEPS.FORM); setErrorMessage(''); }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>EDIT DETAILS</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isAnySubmitting}
                    onClick={handleResendOTP}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center space-x-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{resendCooldown > 0 ? `RESEND CODE (${resendCooldown}s)` : 'RESEND CODE'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isOtpVerifying || isRegisterSubmitting || enteredOtp.length !== 6}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 uppercase tracking-wider"
                >
                  {isOtpVerifying || isRegisterSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isOtpVerifying ? 'Verifying...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>VERIFY OTP</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* STEP 3: ACCOUNT_CREATED */}
            {/* ------------------------------------------------------------------- */}
            {regStep === REG_STEPS.CREATED && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Account Created Successfully! 🎉
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your account is verified and active. From now on, your permanent login credentials are:
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
                disabled={isForgotSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1"
              >
                {isForgotSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
