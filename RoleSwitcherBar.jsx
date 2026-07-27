import React from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Shield, Award, Home, Salad } from 'lucide-react';

export const RoleSwitcherBar = () => {
  const { currentRole, loginAsRole, logout, setCurrentPage, currentUser } = useApp();

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-emerald-500/20 sticky top-0 z-50 shadow-md backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
            ⚡ Quick Role Switcher
          </span>
          <span className="text-slate-400 hidden sm:inline">Demo Instant Switcher:</span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => { loginAsRole('student'); }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full font-bold transition-all ${
              currentRole === 'student'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Student (Parth • 2nd Yr AIML)</span>
          </button>

          <button
            onClick={() => { loginAsRole('committee'); }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full font-bold transition-all ${
              currentRole === 'committee'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Mess Committee</span>
          </button>

          <button
            onClick={() => { loginAsRole('warden'); }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full font-bold transition-all ${
              currentRole === 'warden'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Warden (Pathak Sir)</span>
          </button>

          <button
            onClick={() => { setCurrentPage('home'); loginAsRole(null); logout(); }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full font-bold transition-all ${
              currentRole === 'landing' || !currentRole
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Landing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
