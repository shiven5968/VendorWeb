import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <UtensilsCrossed className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">MessMates</span>
          <span>•</span>
          <span>Know Your Meal Before You Eat It</span>
        </div>

        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} MessMates • ABES Campus Dining
        </p>
      </div>
    </footer>
  );
};
