import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UtensilsCrossed, UserPlus, LogIn, Lock, Mail, User, Building, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, register, loginAsUser, usersList } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    hostelBlock: 'DNB Block',
    gender: 'Male',
    year: '2nd Year',
    branch: 'Engineering',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 120
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      login(loginEmail, loginPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regData.name.trim() || !regData.email.trim() || !regData.password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    try {
      register(regData);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 pb-20">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">MessMate</h2>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">ABES Pilot Platform</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="text-2xl font-black leading-snug">
                Know Your Meal Before You Eat It
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilot portal for 30 students, mess committee & warden. Dynamic nutrition tracking, real meal ratings, issue reporting & menu voting.
              </p>
            </div>
          </div>

          {/* Pilot Test Accounts Quick Launcher */}
          <div className="pt-6 space-y-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Pilot Quick Accounts (1-Tap):
            </span>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {usersList.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => loginAsUser(u.id)}
                  className="w-full p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left flex items-center justify-between text-xs transition-colors border border-slate-700/60"
                >
                  <div className="flex items-center space-x-2">
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500" />
                    <div>
                      <p className="font-bold text-white leading-tight">{u.name}</p>
                      <span className="text-[10px] text-slate-400">{u.hostelBlock}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    u.role === 'warden' ? 'bg-blue-900 text-blue-300' :
                    u.role === 'committee' ? 'bg-purple-900 text-purple-300' : 'bg-emerald-900 text-emerald-300'
                  }`}>
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6">
          
          {/* Form Switcher */}
          <div className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setIsRegisterMode(false); setErrorMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                !isRegisterMode
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsRegisterMode(true); setErrorMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                isRegisterMode
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.verma@hostel.edu"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors text-center"
              >
                Sign In to Dashboard
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Singh"
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@hostel.edu"
                    value={regData.email}
                    onChange={e => setRegData({ ...regData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Account Role
                  </label>
                  <select
                    value={regData.role}
                    onChange={e => setRegData({ ...regData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="committee">Mess Committee</option>
                    <option value="warden">Warden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Hostel / Block
                  </label>
                  <select
                    value={regData.hostelBlock}
                    onChange={e => setRegData({ ...regData, hostelBlock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  >
                    <option value="DNB Block">DNB Block (Boys)</option>
                    <option value="VKB Block">VKB Block (Boys)</option>
                    <option value="RKB Block">RKB Block (Boys)</option>
                    <option value="ABB Block">ABB Block (Boys)</option>
                    <option value="Kalpana Chawla (Girls)">Kalpana Chawla (Girls)</option>
                    <option value="Sarojini Block (Girls)">Sarojini Block (Girls)</option>
                    <option value="Kasturba Block (Girls)">Kasturba Block (Girls)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={regData.gender}
                    onChange={e => setRegData({ ...regData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors text-center mt-2"
              >
                Create Account & Sign In
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
