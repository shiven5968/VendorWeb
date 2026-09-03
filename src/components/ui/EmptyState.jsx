import React from 'react';
import { Inbox } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * EmptyState — shown when a list or section has no content.
 * @param {React.ElementType} [icon] - Lucide icon component
 * @param {string} title
 * @param {string} [description]
 * @param {string} [actionLabel]
 * @param {Function} [onAction]
 * @param {string} [className]
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => (
  <div className={clsx(
    'flex flex-col items-center justify-center py-16 px-6 text-center',
    className
  )}>
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs">{description}</p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
