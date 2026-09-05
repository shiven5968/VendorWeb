import React from 'react';
import { UtensilsCrossed, GraduationCap, Shield, ChefHat, Store, ArrowRight } from 'lucide-react';

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
          Your hostel mess, finally made simple.
        </p>
      </div>

      {/* 3 PRIMARY ROLE CARDS (THE ONLY ENTRY POINTS) */}
      <div className="pt-12 pb-8">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Select Your Role to Continue
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* STUDENT ROLE */}
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
                  Student
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Daily menus, nutrition & feedback
              </p>
            </div>
          </button>

          {/* VENDOR PARTNER ROLE */}
          <button
            type="button"
            onClick={() => onSelectRole('partner')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 hover:border-amber-500 text-left transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Vendor Partner
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Hotels, cafes & student perks
              </p>
            </div>
          </button>

          {/* WARDEN ROLE */}
          <button
            type="button"
            onClick={() => onSelectRole('warden')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 hover:border-blue-500 text-left transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Warden
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Hostel governance & audits
              </p>
            </div>
          </button>

          {/* MESS COMMITTEE ROLE */}
          <button
            type="button"
            onClick={() => onSelectRole('committee')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 hover:border-purple-500 text-left transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Mess Committee
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Menu studio & complaints
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* FOOTNOTE */}
      <div className="text-center text-xs text-slate-400 font-semibold py-4">
        ABES EC & ABESBS Campus Dining Platform
      </div>

    </div>
  );
};
