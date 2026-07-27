import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Salad, UserCheck, Shield, Award, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const { loginAsRole } = useApp();
  const [selectedRoleTab, setSelectedRoleTab] = useState('student');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginAsRole(selectedRoleTab);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left Visual Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg">
                <Salad className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">MessMate</span>
            </div>

            <div className="space-y-2 pt-6">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
                Hostel Access Portal
              </span>
              <h2 className="text-3xl font-extrabold leading-tight">
                Role-Based Authentication
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect to your hostel dining console. AIML students track gym macros, committees upload menus, and wardens access quality analytics.
              </p>
            </div>
          </div>

          {/* Role specific dynamic preview badge */}
          <div className="pt-8 relative z-10">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Selected Demo Role:</span>
                <span className="text-brand-400 font-bold">
                  {selectedRoleTab === 'student' && 'Parth Sharma (2nd Yr AIML)'}
                  {selectedRoleTab === 'committee' && 'Mess Committee'}
                  {selectedRoleTab === 'warden' && 'Pathak Sir'}
                </span>
              </div>
              <p className="text-xs font-semibold text-white">
                {selectedRoleTab === 'student' && 'Hello Parth Sharma 👋 (Gym Mode & Rewards)'}
                {selectedRoleTab === 'committee' && 'Hello Mess Committee 👨‍🍳 (Menu Studio & Polls)'}
                {selectedRoleTab === 'warden' && 'Hello Pathak Sir 👨‍🏫 (Chief Warden Portal)'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Interactive Login Form */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center space-y-8">
          
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sign In to MessMate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your role below to launch the pre-configured demo portal.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            
            <button
              type="button"
              onClick={() => setSelectedRoleTab('student')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 ${
                selectedRoleTab === 'student'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleTab('committee')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 ${
                selectedRoleTab === 'committee'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Committee</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleTab('warden')}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 ${
                selectedRoleTab === 'warden'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Warden</span>
            </button>

          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  readOnly
                  value={
                    selectedRoleTab === 'student' ? 'parth.sharma@hostel.edu' :
                    selectedRoleTab === 'committee' ? 'mess.committee@hostel.edu' :
                    'pathak.warden@hostel.edu'
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-mono font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Access Credentials
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  readOnly
                  value="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-mono outline-none"
                />
              </div>
            </div>

            {/* Quick Greeting Notice */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                Pre-authenticated demo for: <strong>
                  {selectedRoleTab === 'student' ? 'Hello Parth Sharma (2nd Year AIML)' : selectedRoleTab === 'committee' ? 'Hello Mess Committee' : 'Hello Pathak Sir'}
                </strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          <div className="text-center text-xs text-slate-400">
            MessMate Secure Multi-Tenant Authentication Engine
          </div>

        </div>

      </div>
    </div>
  );
};
