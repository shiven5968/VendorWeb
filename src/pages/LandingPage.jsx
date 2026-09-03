import React from 'react';
import { UtensilsCrossed, GraduationCap, Shield, ChefHat, ArrowRight } from 'lucide-react';

export const LandingPage = ({ onSelectRole }) => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HERO SECTION */}
      <div className="text-center space-y-4 pt-8 sm:pt-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 mb-2">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
          MESSMATES
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          Know Your Meal Before You Eat It
        </p>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
          Campus dining made intelligent, transparent, and simple.
        </p>
      </div>

      {/* 3 PRIMARY ROLE CARDS (THE ONLY ENTRY POINTS) */}
      <div className="pt-12 pb-8">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Select Your Role to Continue
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* STUDENTS */}
          <button
            type="button"
            onClick={() => onSelectRole('student')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Students
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Daily menus, nutrition &amp; feedback
              </p>
            </div>
          </button>

          {/* MESS COMMITTEE */}
          <button
            type="button"
            onClick={() => onSelectRole('committee')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Mess Committee
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Menu operations &amp; daily oversight
              </p>
            </div>
          </button>

          {/* ABES OFFICIALS */}
          <button
            type="button"
            onClick={() => onSelectRole('warden')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  ABES Officials
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Institutional governance &amp; audits
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* INSTITUTIONAL PURPOSE & OVERSIGHT OVERVIEW (PLACED AFTER ROLE SELECTION) */}
      <div className="pt-8 pb-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Institutional Purpose</span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            Empowering Transparent Dining at ABES Engineering College
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Institutional Monitoring</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">Centralized oversight of meal schedules, daily preparations, and operational compliance across campus.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Dining Transparency</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">Accurate weekly menus with verified ingredient breakdowns, nutritional guidance, and live service statuses.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Feedback &amp; Grievances</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">Direct student meal ratings, taste reviews, and an audited complaint resolution tracking pipeline.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Hygiene Compliance</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">Daily multi-point sanitation checks and timestamped photo records inspected by authorized officials.</p>
          </div>
        </div>
      </div>

      {/* FOOTNOTE */}
      <div className="text-center text-xs text-slate-400 font-semibold py-4">
        ABES Engineering College · Campus Dining Administration Platform
      </div>

    </div>
  );
};

