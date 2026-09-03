import React from 'react';
import { UtensilsCrossed, GraduationCap, Shield, ChefHat, Sparkles, Activity, FileText } from 'lucide-react';
import { clsx } from 'clsx';

export const LandingPage = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-600/20 rotate-3 transition-transform hover:rotate-6">
              <UtensilsCrossed className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              MESSMATES
            </h1>
            <p className="text-xl md:text-2xl font-medium text-emerald-600 dark:text-emerald-400">
              Know Your Meal Before You Eat It
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Campus dining made intelligent. Real-time menus, nutrition tracking, and transparent mess management for ABES Engineering College.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Real-time Menu</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Nutrition Tracking</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <FileText className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Student Ratings</span>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full mt-16">
          <button 
            onClick={() => onSelectRole('student')}
            className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Student Portal</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Daily menus, nutrition tracking & feedback</p>
          </button>

          <button 
            onClick={() => onSelectRole('committee')}
            className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ChefHat className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mess Committee</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Menu management & operations oversight</p>
          </button>

          <button 
            onClick={() => onSelectRole('warden')}
            className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ABES Official</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Institutional oversight & analytics</p>
          </button>
        </div>
      </div>

      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p className="font-semibold text-slate-700 dark:text-slate-300">ABES Engineering College · Ghaziabad</p>
        <p className="mt-1">Building a better dining experience for the campus community.</p>
      </footer>
    </div>
  );
};
