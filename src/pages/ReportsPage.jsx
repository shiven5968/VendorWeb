import React from 'react';
import { useApp } from '../context/AppContext';
import { Download } from 'lucide-react';

export const ReportsPage = () => {
  const { wardenMetrics, wardenAnalytics, currentUser } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Mess Quality & Audit Report</h1>
          <p className="text-xs text-slate-500 font-semibold">Campus food quality certification & governance</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Export Report (PDF)</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">ABES Mess Quality Audit</h2>
            <p className="text-xs text-slate-400">Hostel Dining Operations</p>
          </div>
          <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            LAUNCH STATE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Student Satisfaction</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {wardenMetrics?.studentSatisfaction !== undefined ? `${wardenMetrics.studentSatisfaction}%` : 'No data yet'}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mess Quality Score</span>
            <p className="text-xl font-black text-amber-500 mt-0.5">
              {wardenMetrics?.messQualityScore ? `${wardenMetrics.messQualityScore} / 5.0` : 'No ratings yet'}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Reviews</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {wardenMetrics?.totalRatings || 0}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p>• Verified by authorized session ({currentUser?.name || 'Staff User'}).</p>
          <p>• Clean database state active for college onboarding.</p>
          <p>• Student feedback recorded in real-time.</p>
        </div>
      </div>

    </div>
  );
};
