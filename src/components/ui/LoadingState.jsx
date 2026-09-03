import React from 'react';
import { clsx } from 'clsx';

const SkeletonBlock = ({ className }) => (
  <div className={clsx('animate-skeleton rounded-xl', className)} />
);

const MealCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <SkeletonBlock className="h-40 rounded-none" />
    <div className="p-4 space-y-2">
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-3 w-1/2" />
      <div className="flex gap-2 mt-3">
        <SkeletonBlock className="h-6 w-16" />
        <SkeletonBlock className="h-6 w-16" />
      </div>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
    <SkeletonBlock className="w-10 h-10" />
    <div className="mt-3 space-y-2">
      <SkeletonBlock className="h-7 w-20" />
      <SkeletonBlock className="h-4 w-24" />
    </div>
  </div>
);

const ListItemSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
    <SkeletonBlock className="w-10 h-10 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-3 w-1/2" />
    </div>
  </div>
);

const SpinnerLoader = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    {message && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{message}</p>}
  </div>
);

/**
 * LoadingState — skeleton loaders and spinners.
 * @param {'meal-card'|'stat'|'list'|'spinner'} [type]
 * @param {number} [count] - Number of skeletons
 * @param {string} [message] - For spinner type
 * @param {string} [className]
 */
export const LoadingState = ({ type = 'spinner', count = 3, message, className = '' }) => {
  if (type === 'spinner') return <SpinnerLoader message={message} />;

  const Skeleton = type === 'meal-card' ? MealCardSkeleton :
                   type === 'stat' ? StatCardSkeleton :
                   ListItemSkeleton;

  const gridClass = type === 'meal-card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' :
                    type === 'stat' ? 'grid grid-cols-2 lg:grid-cols-4 gap-4' :
                    'space-y-3';

  return (
    <div className={clsx(gridClass, className)}>
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} />)}
    </div>
  );
};
