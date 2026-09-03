import React from 'react';
import { clsx } from 'clsx';

const COMPLAINT_STATUS_MAP = {
  PENDING: { label: 'Pending', classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  'IN REVIEW': { label: 'In Review', classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  'In Review': { label: 'In Review', classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  'In Progress': { label: 'In Progress', classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  RESOLVED: { label: 'Resolved', classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  Resolved: { label: 'Resolved', classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  CLOSED: { label: 'Closed', classes: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
};

const PHOTO_STATUS_MAP = {
  pending: { label: 'Pending', classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  uploading: { label: 'Uploading', classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  published: { label: 'Published', classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  failed: { label: 'Failed', classes: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
};

const HYGIENE_STATUS_MAP = {
  Good: { label: 'Good', classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  'Needs Attention': { label: 'Needs Attention', classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  Critical: { label: 'Critical', classes: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
};

/**
 * StatusBadge — colored status pill.
 * @param {string} status - Status string
 * @param {'complaint'|'photo'|'hygiene'|'generic'} [variant]
 * @param {string} [className]
 */
export const StatusBadge = ({ status, variant = 'complaint', className = '' }) => {
  const map = variant === 'photo' ? PHOTO_STATUS_MAP :
               variant === 'hygiene' ? HYGIENE_STATUS_MAP :
               COMPLAINT_STATUS_MAP;

  const config = map[status] || {
    label: status || 'Unknown',
    classes: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
      config.classes,
      className
    )}>
      {config.label}
    </span>
  );
};
