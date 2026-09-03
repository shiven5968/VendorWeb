import React from 'react';
import { clsx } from 'clsx';

export const SectionHeader = ({ title, subtitle, action, badge, className = '' }) => (
  <div className={clsx('flex items-center justify-between', className)}>
    <div className="flex items-center gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
