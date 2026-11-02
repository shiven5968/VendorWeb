import React from 'react';
import { MessMatesLogo } from './MessMatesLogo';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <MessMatesLogo size="xs" />
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Know Your Meal Before You Eat It</span>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} MessMates • ABES Campus Dining
        </p>
      </div>
    </footer>
  );
};
