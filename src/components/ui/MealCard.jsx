import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Dumbbell,
  Star,
  Sun,
  UtensilsCrossed,
  Coffee,
  Moon,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { clsx } from 'clsx';
import { RatingStars } from './RatingStars';
import { formatRatingRelativeTime } from '../../utils/dateTime';

const CATEGORY_META = {
  Breakfast: { label: 'Breakfast', pillClass: 'bg-amber-500 text-white', icon: Sun },
  Lunch: { label: 'Lunch', pillClass: 'bg-emerald-600 text-white', icon: UtensilsCrossed },
  Snacks: { label: 'Evening Snacks', pillClass: 'bg-orange-500 text-white', icon: Coffee },
  Dinner: { label: 'Dinner', pillClass: 'bg-indigo-600 text-white', icon: Moon }
};

/**
 * Shared Unified MealCard — guarantees identical proportions (16:9 cover image),
 * readable typography, and consistent action heights across all 4 daily meals.
 */
export const MealCard = ({
  meal,
  timingStatus,
  timingLabel,
  stats,
  userRating,
  onViewDetails,
  onRateMeal,
  onRate,
  isHighlighted = false,
  isNextDay = false,
  showRating = true,
  showActions = false,
  compact = false,
  onClick,
  className = ''
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!meal) return null;

  const isHolidayOff =
    meal.status === 'off' ||
    Number(meal.calories) === 0 ||
    meal.name?.toLowerCase().includes('holiday off') ||
    timingLabel === 'OFF';

  const catMeta = CATEGORY_META[meal.category] || {
    label: meal.category || 'Meal',
    pillClass: 'bg-emerald-600 text-white',
    icon: UtensilsCrossed
  };
  const CategoryIcon = catMeta.icon;

  const descriptionText = meal.items || meal.description || '';
  const hasLongDescription = descriptionText.length > 72;

  const resolvedRating = stats?.rating ?? meal.rating ?? null;
  const resolvedRatingCount = stats?.ratingCount ?? meal.ratingCount ?? 0;

  const canRateNow = Boolean(timingStatus?.isRatingAllowed && !isNextDay && !isHolidayOff);
  const statusText = isHolidayOff
    ? 'Not Available'
    : timingStatus?.displayStatus || timingStatus?.badgeText || (isNextDay ? 'Next Day' : null);

  const statusBadgeClass = (() => {
    if (isHolidayOff) {
      return 'bg-slate-800/85 text-slate-200 border border-slate-700/80';
    }
    if (timingStatus?.isLive) {
      return 'bg-emerald-500 text-white shadow-sm';
    }
    if (timingStatus?.status === 'ENDED_RATING_OPEN') {
      return 'bg-amber-500 text-white shadow-sm';
    }
    if (isNextDay || timingStatus?.displayStatus === 'Next Day') {
      return isHighlighted
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'bg-indigo-600/90 text-white shadow-sm';
    }
    if (timingStatus?.status === 'UPCOMING') {
      return isHighlighted
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'bg-slate-800/85 text-slate-100';
    }
    if (timingStatus?.status === 'CLOSED') {
      return 'bg-slate-800/80 text-slate-300';
    }
    return 'bg-slate-800/80 text-slate-200';
  })();

  const formattedUserRating =
    typeof userRating === 'object' && userRating !== null
      ? userRating.rating || 0
      : Number(userRating) || 0;

  const displayTime = timingLabel || timingStatus?.label || meal.time || '';

  return (
    <article
      data-meal-card={meal.category}
      onClick={onClick}
      className={clsx(
        'w-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col justify-between transition-all',
        isHighlighted
          ? 'border-emerald-500/70 dark:border-emerald-500/60 ring-2 ring-emerald-500/15 shadow-md'
          : 'border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/35',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Top Section: Consistent 16:9 Image + Body */}
      <div>
        <div className="relative w-full aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
          {!isHolidayOff && meal.image && !imgFailed ? (
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
              <Coffee className="w-9 h-9 text-amber-400/90 mb-2" />
              <span className="text-sm font-black text-white tracking-wide uppercase">
                {isHolidayOff ? 'Kitchen Closed • OFF' : 'Meal Preview'}
              </span>
              <span className="text-xs font-medium text-slate-300 mt-0.5">
                {isHolidayOff ? 'No scheduled service for this slot' : meal.name}
              </span>
            </div>
          )}

          {/* Subtle gradient overlay so badges remain legible over bright photos */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-slate-950/20 pointer-events-none" />

          {/* Category Pill */}
          <span
            className={clsx(
              'absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5',
              catMeta.pillClass
            )}
          >
            <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{catMeta.label}</span>
          </span>

          {/* Status Pill */}
          {statusText && (
            <span
              className={clsx(
                'absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wide',
                statusBadgeClass
              )}
            >
              {statusText}
            </span>
          )}

          {/* Timing Pill */}
          {displayTime && (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-300 shrink-0" />
              <span>{displayTime}</span>
            </span>
          )}

          {/* Rating Summary Pill */}
          {resolvedRatingCount > 0 && resolvedRating !== null && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-xs font-black">
                {Number(resolvedRating).toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-300 font-semibold">
                ({resolvedRatingCount})
              </span>
            </div>
          )}
        </div>

        {/* Meal Text Content */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <h3 className="text-[18px] sm:text-[19px] font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
            {meal.name}
          </h3>

          {!compact && descriptionText && (
            <div>
              <p
                className={clsx(
                  'text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed',
                  !isExpanded && 'line-clamp-2'
                )}
              >
                {descriptionText}
              </p>
              {hasLongDescription && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(prev => !prev);
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline py-1 cursor-pointer"
                >
                  <span>{isExpanded ? 'Show less' : 'Show full menu items'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Nutrition Badges (Readable 13-14px text) */}
          {!compact && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {!isHolidayOff && Number(meal.calories) > 0 ? (
                <>
                  {meal.protein !== undefined && meal.protein !== '' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-[13px] font-bold">
                      <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{String(meal.protein).replace(/g$/i, '')}g protein</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[13px] font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{String(meal.calories).replace(/\s*kcal$/i, '')} kcal</span>
                  </span>
                </>
              ) : (
                <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                  Kitchen closed • No meal service
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions: Student Home/Menu CTA Row OR Legacy Warden Star Picker */}
      {showActions ? (
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/90 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
          {onViewDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(meal);
              }}
              className="min-h-[44px] flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          )}

          {showRating && !isHolidayOff && onRateMeal && (canRateNow || userRating) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRateMeal(meal);
              }}
              className={clsx(
                'min-h-[44px] flex-1 px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                userRating
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-600/25'
              )}
            >
              <Star
                className={clsx(
                  'w-4 h-4 shrink-0',
                  userRating ? 'text-amber-500 fill-amber-500' : 'fill-current'
                )}
              />
              <span>
                {userRating ? `Rated (${formattedUserRating}★)` : 'Rate Meal'}
              </span>
            </button>
          )}
        </div>
      ) : (
        showRating && !isHolidayOff && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            {userRating ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <RatingStars value={formattedUserRating} readonly size="sm" />
                    <span className="text-xs font-bold text-amber-500">
                      {formattedUserRating}★
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
                    Recorded
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {formatRatingRelativeTime(typeof userRating === 'object' ? userRating?.timestamp : null)}
                </p>
              </div>
            ) : onRate ? (
              <RatingStars value={0} onChange={(stars) => onRate(meal.id, stars)} size="sm" />
            ) : null}
          </div>
        )
      )}
    </article>
  );
};
