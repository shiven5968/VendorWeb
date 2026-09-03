import React from 'react';
import { clsx } from 'clsx';

export const DashboardCard = ({ title, subtitle, action, children, className = '' }) => (
  <div className={clsx(
    'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm',
    className
  )}>
    {(title || action) && (
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          {title && <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className={clsx(!title && !action ? 'p-5' : 'px-5 pb-5')}>
      {children}
    </div>
  </div>
);
