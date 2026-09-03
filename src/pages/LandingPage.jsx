import React from 'react';
import { UtensilsCrossed, GraduationCap, Shield, ChefHat } from 'lucide-react';

export const LandingPage = ({ onSelectRole }) => {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-10">
      {/* Brand */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-xl mb-4">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          MessMates
        </h1>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
          Know Your Meal Before You Eat It
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          ABES Engineering College · Campus Dining Platform
        </p>
      </div>

      {/* Role Selection */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">
          Select your role to continue
        </p>

        <button
          onClick={() => onSelectRole('student')}
          className="w-full flex items-center space-x-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Students</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Daily menu, nutrition &amp; feedback</div>
          </div>
        </button>

        <button
          onClick={() => onSelectRole('committee')}
          className="w-full flex items-center space-x-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Mess Committee</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Menu management &amp; operations</div>
          </div>
        </button>

        <button
          onClick={() => onSelectRole('warden')}
          className="w-full flex items-center space-x-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">ABES Officials</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Institutional oversight &amp; monitoring</div>
          </div>
        </button>
      </div>
    </div>
  );
};
