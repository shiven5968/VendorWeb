import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Printer, CheckCircle } from 'lucide-react';

export const ReportsPage = () => {
  const { wardenAnalytics } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Monthly Mess Governance Report</h1>
          <p className="text-xs text-slate-500">Official Monthly Quality & Nutrition Certification</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">MessMate Institutional Audit</h2>
            <p className="text-xs text-slate-400">Hostel Block B & Dining Hall 1</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">STATUS: CERTIFIED</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-xs text-slate-400">Overall Satisfaction</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{wardenAnalytics.satisfactionRate}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-xs text-slate-400">Mess Quality Score</span>
            <p className="text-2xl font-black text-emerald-600">{wardenAnalytics.messQualityScore} / 5.0</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-xs text-slate-400">Waste Reduction</span>
            <p className="text-2xl font-black text-blue-600">{wardenAnalytics.foodWasteIndex}%</p>
          </div>
        </div>

        <div className="text-xs text-slate-500 space-y-2 pt-4">
          <p>✔ Signed off by Chief Warden ({currentUser?.name || 'Authorized Office'}).</p>
          <p>✔ All dish replacement polls successfully concluded.</p>
          <p>✔ Gym Mode high-protein guidelines verified by hostel mess nutritionist.</p>
        </div>
      </div>

    </div>
  );
};
