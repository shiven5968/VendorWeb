import React from 'react';
import { Utensils, ShieldCheck, Heart, Award } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">About MessMate</h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Built to transform university hostel dining into a transparent, high-nutrition, student-empowered ecosystem.
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          MessMate addresses the age-old problem of uninspiring hostel food by introducing real-time nutrition transparency, automated Gym Mode tracking, democratic dish replacement voting, and warden audit dashboards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
            <span className="text-3xl font-black text-emerald-500">100%</span>
            <p className="text-xs text-slate-400 mt-1">Calorie & Macro Visibility</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
            <span className="text-3xl font-black text-purple-500">24/7</span>
            <p className="text-xs text-slate-400 mt-1">Student Voting Governance</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
            <span className="text-3xl font-black text-blue-500">-14%</span>
            <p className="text-xs text-slate-400 mt-1">Food Waste Index</p>
          </div>
        </div>
      </div>
    </div>
  );
};
