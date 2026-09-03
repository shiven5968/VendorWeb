import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

const COLOR_MAP = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

/**
 * StatCard — a metric display card.
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string|number} value - Primary value to display
 * @param {string} label - Metric label
 * @param {string} [subLabel] - Secondary label or context
 * @param {string} [trend] - 'up' | 'down' | 'neutral'
 * @param {string} [trendLabel] - Text describing the trend
 * @param {string} [color] - 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'slate'
 * @param {string} [className]
 */
export const StatCard = ({
  icon: Icon,
  value,
  label,
  subLabel,
  trend,
  trendLabel,
  color = 'emerald',
  className = ''
}) => {
  const colorClass = COLOR_MAP[color] || COLOR_MAP.emerald;

  return (
    <div className={clsx(
      'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <div className={clsx(
            'flex items-center space-x-1 text-xs font-semibold px-2 py-1 rounded-full',
            trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
            trend === 'down' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' :
            'bg-slate-100 dark:bg-slate-800 text-slate-500'
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {value ?? '—'}
        </div>
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{label}</div>
        {subLabel && (
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subLabel}</div>
        )}
      </div>
    </div>
  );
};
