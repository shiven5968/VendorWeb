import React from 'react';
import { Clock, Flame, Dumbbell, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { RatingStars } from './RatingStars';
import { StatusBadge } from './StatusBadge';

/**
 * MealCard — displays a single meal with image, nutrition, rating.
 * @param {object} meal - Meal data object
 * @param {Function} [onRate] - Called with (mealId, stars)
 * @param {object} [userRating] - Existing user rating object
 * @param {boolean} [showRating] - Whether to show rating UI
 * @param {boolean} [compact] - Compact variant
 * @param {Function} [onClick] - Card click handler
 * @param {string} [className]
 */
export const MealCard = ({
  meal,
  onRate,
  userRating,
  showRating = true,
  compact = false,
  onClick,
  className = ''
}) => {
  if (!meal) return null;

  const isHolidayOff = !meal.image || meal.name?.toLowerCase().includes('holiday off');

  const categoryColors = {
    Breakfast: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    Lunch: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    Snacks: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    Dinner: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        compact ? '' : '',
        className
      )}
    >
      {/* Meal Image */}
      {isHolidayOff ? (
        <div className="h-36 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center">
          <span className="text-3xl">🎉</span>
          <span className="text-xs font-black text-slate-400 mt-1">HOLIDAY OFF</span>
        </div>
      ) : (
        <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute top-2 left-2">
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide backdrop-blur-sm',
              categoryColors[meal.category] || 'bg-slate-100 text-slate-600'
            )}>
              {meal.category}
            </span>
          </div>
          {meal.ratingCount > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-black text-white">{meal.rating?.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}

      {/* Meal Info */}
      <div className="p-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
          {meal.name}
        </h3>

        {!compact && (
          <div className="flex items-center gap-3 mt-2">
            {meal.calories && (
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{meal.calories} kcal</span>
              </div>
            )}
            {meal.protein && (
              <div className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3 text-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{meal.protein}g protein</span>
              </div>
            )}
          </div>
        )}

        {meal.time && (
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-medium">{meal.time}</span>
          </div>
        )}

        {showRating && !isHolidayOff && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {userRating ? (
              <div className="flex items-center gap-2">
                <RatingStars value={userRating.rating} readonly size="sm" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Rated</span>
              </div>
            ) : onRate ? (
              <RatingStars value={0} onChange={(stars) => onRate(meal.id, stars)} size="sm" />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
