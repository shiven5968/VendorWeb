import React from 'react';
import { AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const ErrorState = ({ message, onRetry, className = '' }) => (
  <div className={clsx(
    'flex flex-col items-center justify-center py-12 px-6 text-center',
    className
  )}>
    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mb-4">
      <AlertCircle className="w-7 h-7 text-rose-500" />
    </div>
    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Something went wrong</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
      {message || 'Unable to load data. Please check your internet connection.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);
