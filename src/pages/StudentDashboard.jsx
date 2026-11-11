import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  Award,
  Send,
  Check,
  Clock,
  X,
  Calendar,
  ChevronRight,
  Building2,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { getMessForStudent, getMessById } from '../config/menuGroups';
import { getInstitutionById, getDefaultInstitution } from '../config/institutions';
import { formatCollegeDateDisplay } from '../utils/dateTime';
import { OFFICIAL_MEAL_TIMINGS, MEAL_ORDER, resolveHomeMealSchedule } from '../services/mealTiming';
import { MealCard } from '../components/ui/MealCard';
import { getMenuByMessId, isGirlsHostelBlock } from '../data/hostelMenus';

const getActiveMessAndMenu = (user) => {
  const mess = getMessForStudent(user);
  if (mess) {
    return { mess, menu: getMenuByMessId(mess.menuId || mess.id) };
  }
  if (user && isGirlsHostelBlock(user.hostelBlock || user.block)) {
    const girlsMess = getMessById('girls');
    return { mess: girlsMess, menu: getMenuByMessId('girls') };
  }
  const fallbackMess = getMessById('boys_junior');
  return { mess: fallbackMess, menu: getMenuByMessId('boys_junior') };
};

const getMealTimingLabel = (mealType, targetDay) => {
  if (targetDay === 'Sunday' && mealType === 'Snacks') {
    return 'OFF';
  }
  return OFFICIAL_MEAL_TIMINGS[mealType]?.label || '';
};

export const StudentDashboard = () => {
  const {
    currentUser,
    allMeals,
    rateMeal,
    getUserRating,
    setSelectedMealModal,
    setCurrentPage,
    setSelectedDay,
    currentTime,
    homeScheduleContext,
    getTimingStatus,
    checkIsRatingAllowed,
    allRatings,
    rewardPoints
  } = useApp();

  // Direct Rating Modal state
  const [ratingModalMeal, setRatingModalMeal] = useState(null);
  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratedSuccessNotice, setRatedSuccessNotice] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // Resolve canonical IST schedule context (including automatic post-dinner rollover to next day)
  const scheduleContext = useMemo(
    () => homeScheduleContext || resolveHomeMealSchedule(currentTime),
    [homeScheduleContext, currentTime]
  );

  const displayDayName = scheduleContext.displayDayName;
  const displayDateStr = scheduleContext.displayDateStr;
  const isNextDayContext = scheduleContext.isNextDayContext;
  const todayDateString = formatCollegeDateDisplay(currentTime);

  const activeInstitution = useMemo(() => {
    try {
      const savedId =
        currentUser?.institutionId ||
        localStorage.getItem('messmates_selected_college_id');
      return getInstitutionById(savedId) || getDefaultInstitution();
    } catch (e) {
      return getDefaultInstitution();
    }
  }, [currentUser?.institutionId]);

  const { mess: resolvedMess, menu: activeMenu } = useMemo(
    () => getActiveMessAndMenu(currentUser),
    [currentUser]
  );

  const getMealStatsLocal = (mealId) => {
    const mealRatings = (allRatings || []).filter((r) => r.mealId === mealId);
    if (mealRatings.length === 0) {
      return { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };
    }
    const sum = mealRatings.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    const avg = parseFloat((sum / mealRatings.length).toFixed(1));
    return {
      rating: avg,
      ratingDisplay: `★ ${avg} (${mealRatings.length} reviews)`,
      ratingCount: mealRatings.length
    };
  };

  // Match DB overrides strictly by target day (NEVER mix another weekday's meals/IDs)
  const targetDayDbMeals = useMemo(
    () =>
      (allMeals || []).filter(
        (m) => (m.day || '').toLowerCase() === displayDayName.toLowerCase()
      ),
    [allMeals, displayDayName]
  );

  // Check whether the target day's menu is actually published (do NOT silently fallback to Monday)
  const hasPublishedDayMenu = Boolean(
    (activeMenu && activeMenu[displayDayName]) || targetDayDbMeals.length > 0
  );

  // Build ONLY the 4 chronological meals for the resolved display day
  const mealsList = useMemo(() => {
    if (!hasPublishedDayMenu) return [];
    const dayMenu = (activeMenu && activeMenu[displayDayName]) || {};
    const dayPrefix = displayDayName.toLowerCase().substring(0, 3);

    return MEAL_ORDER.map((cat) => {
      const staticMeal = dayMenu[cat];
      const matchingDbMeal = targetDayDbMeals.find((m) => m.category === cat);
      if (!staticMeal && !matchingDbMeal) return null;

      const rawProtein = (staticMeal?.protein ?? matchingDbMeal?.protein ?? '14')
        .toString()
        .replace(/g$/i, '')
        .trim();
      const rawCalories = (staticMeal?.calories ?? matchingDbMeal?.calories ?? '520')
        .toString()
        .replace(/\s*kcal$/i, '')
        .trim();

      return {
        ...(matchingDbMeal || {}),
        id:
          matchingDbMeal?.id ||
          `${dayPrefix}_${cat.toLowerCase().substring(0, 1)}`,
        category: cat,
        day: displayDayName,
        occurrenceDate: displayDateStr,
        name: staticMeal?.title || matchingDbMeal?.name || `${cat} Special`,
        items:
          (staticMeal?.items && staticMeal.items.length > 0
            ? staticMeal.items.join(', ')
            : matchingDbMeal?.items) || '',
        image: staticMeal?.image ?? matchingDbMeal?.image ?? '',
        servingSize: staticMeal?.servingSize || matchingDbMeal?.servingSize || '',
        protein: rawProtein,
        calories: rawCalories,
        status: staticMeal?.status || matchingDbMeal?.status || (rawCalories === '0' ? 'off' : 'active')
      };
    }).filter(Boolean);
  }, [hasPublishedDayMenu, activeMenu, displayDayName, displayDateStr, targetDayDbMeals]);

  // Deep-link QR handler: auto-open live rating window if currently eligible
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const rate = params.get('rate');
      if (action === 'rate' || rate === 'current' || rate === 'true') {
        if (!isNextDayContext && mealsList.length > 0) {
          const eligible =
            mealsList.find((m) => checkIsRatingAllowed(m.category, { dayName: displayDayName })) ||
            mealsList.find((m) => m.category === scheduleContext.primaryCategory) ||
            mealsList[0];
          if (eligible) {
            openRateModal(eligible);
          }
        }
      }
    } catch (e) {}
  }, [isNextDayContext, mealsList, displayDayName]);

  const openRateModal = (meal) => {
    setRatingModalMeal(meal);
    setSelectedStars(0);
    setSelectedTag('');
    setFeedbackText('');
    setRatingError('');
    setRatedSuccessNotice(false);
  };

  const closeRateModal = () => {
    setRatingModalMeal(null);
    setSelectedStars(0);
    setRatingError('');
    setRatedSuccessNotice(false);
  };

  const handleModalRatingSubmit = async (e) => {
    e?.preventDefault();
    if (!ratingModalMeal || selectedStars === 0 || submittingRating) return;

    try {
      setSubmittingRating(true);
      setRatingError('');
      await rateMeal(
        ratingModalMeal.id,
        selectedStars,
        feedbackText,
        selectedTag ? [selectedTag] : []
      );
      setRatedSuccessNotice(true);
      setTimeout(() => {
        closeRateModal();
      }, 1500);
    } catch (err) {
      setRatingError(err.message || 'Rating submission failed.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const openFullWeekMenu = () => {
    if (typeof setSelectedDay === 'function') {
      setSelectedDay(displayDayName);
    }
    setCurrentPage('menu');
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'Student';

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-8 md:pb-12 animate-in fade-in duration-200">

      {/* 1. COMPACT, BALANCED STUDENT GREETING & HEALTH POINTS CARD */}
      <section
        aria-label="Student Summary"
        className="w-full min-w-0 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <img
            src={
              currentUser?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'
            }
            alt={firstName}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              Hello, {firstName} 👋
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
              <span>{todayDateString}</span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeInstitution?.shortName || 'ABES EC'} • {currentUser?.hostelBlock || 'DNB Block'}
                </span>
              </span>
              {resolvedMess && (
                <>
                  <span aria-hidden="true" className="hidden lg:inline text-slate-300 dark:text-slate-600">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{resolvedMess.label}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Health Points Summary Tile (Always shown cleanly without blank desktop void) */}
        <button
          type="button"
          onClick={() => setCurrentPage('rewards')}
          className="w-full sm:w-auto min-h-[52px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50/70 dark:from-amber-950/35 dark:to-emerald-950/30 border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 transition-all flex items-center justify-between sm:justify-start gap-3 shadow-2xs cursor-pointer shrink-0 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-300/80 leading-none">
                Health Points
              </span>
              <span className="block text-base sm:text-lg font-black text-amber-900 dark:text-amber-200 leading-tight mt-0.5">
                {rewardPoints || 0} pts
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-700/70 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </section>

      {/* 2. TODAY'S / NEXT DAY'S MEALS HEADING */}
      <section aria-label="Daily Meals" className="w-full min-w-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {scheduleContext.sectionHeading}
              </h2>
              {isNextDayContext && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold">
                  <Sparkles className="w-3 h-3" />
                  <span>{scheduleContext.displayDateDisplay}</span>
                </span>
              )}
            </div>
            <p className="text-[13px] sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-snug">
              {scheduleContext.statusSummary}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Showing {displayDayName} (IST)</span>
          </div>
        </div>

        {/* 3. FOUR MEAL CARDS IN STRICT CHRONOLOGICAL ORDER OR MISSING MENU NOTICE */}
        {!hasPublishedDayMenu || mealsList.length === 0 ? (
          <div className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-2.5 shadow-sm">
            <Calendar className="w-9 h-9 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {displayDayName}'s menu has not been published yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Menu details for {scheduleContext.displayDateDisplay} are not available yet. Please check the full weekly schedule or try again shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {mealsList.map((meal) => {
              const isPrimary = meal.category === scheduleContext.primaryCategory;
              const timingStatus = getTimingStatus(meal.category, {
                dayName: displayDayName,
                isNextDay: isNextDayContext,
                isPrimary
              });
              const stats = getMealStatsLocal(meal.id);
              const myRating = isNextDayContext
                ? null
                : getUserRating(meal.id, displayDateStr);

              const isHighlighted =
                timingStatus.isLive ||
                timingStatus.status === 'ENDED_RATING_OPEN' ||
                (isPrimary && timingStatus.status === 'UPCOMING');

              return (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  timingStatus={timingStatus}
                  timingLabel={getMealTimingLabel(meal.category, displayDayName)}
                  stats={stats}
                  userRating={myRating}
                  isHighlighted={isHighlighted}
                  isNextDay={isNextDayContext}
                  showActions
                  showRating
                  onViewDetails={(m) => setSelectedMealModal(m)}
                  onRateMeal={(m) => openRateModal(m)}
                />
              );
            })}
          </div>
        )}

        {/* 4. EXPLICIT FULL WEEK MENU CTA */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={openFullWeekMenu}
            className="w-full sm:w-auto min-h-[52px] px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm sm:text-base font-black tracking-wide uppercase shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span>VIEW FULL WEEK MENU</span>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        </div>
      </section>

      {/* 5. DIRECT MEAL RATING MODAL */}
      {ratingModalMeal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative pb-safe">

            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                  Rate Meal
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-300">{ratingModalMeal.category}</span>
              </div>

              <button
                type="button"
                onClick={closeRateModal}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 -mr-1 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Banner Preview */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
              {ratingModalMeal.image ? (
                <img
                  src={ratingModalMeal.image}
                  alt={ratingModalMeal.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {ratingModalMeal.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  {getMealTimingLabel(ratingModalMeal.category, ratingModalMeal.day || displayDayName)}
                </p>
              </div>
            </div>

            {/* Rating Content */}
            <div className="p-5 space-y-4">
              {(() => {
                const targetRatingDate = ratingModalMeal.occurrenceDate || displayDateStr;
                const myRating = isNextDayContext
                  ? null
                  : getUserRating(ratingModalMeal.id, targetRatingDate);
                const timing = getTimingStatus(ratingModalMeal.category, {
                  dayName: ratingModalMeal.day || displayDayName,
                  isNextDay: isNextDayContext
                });
                const isAllowed = !isNextDayContext && checkIsRatingAllowed(ratingModalMeal.category, { dayName: displayDayName });

                if (myRating) {
                  return (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-center space-y-2">
                      <div className="flex items-center justify-center space-x-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= myRating.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                        Rating Submitted ({myRating.rating}★)
                      </p>
                      {myRating.feedback && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          "{myRating.feedback}"
                        </p>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Verified & locked. +1 Health Point awarded.
                      </span>
                    </div>
                  );
                }

                if (!isAllowed) {
                  return (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2 text-sm">
                      <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Rating window is currently closed for {ratingModalMeal.category}.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ratings are accepted strictly during meal hours and for 30 minutes after ({timing.ratingWindowLabel}).
                      </p>
                    </div>
                  );
                }

                return (
                  <form onSubmit={handleModalRatingSubmit} className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Rate Your Food Quality
                      </span>
                      <div className="flex items-center justify-center space-x-1 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setSelectedStars(star)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= selectedStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-500 block pt-0.5">
                        {selectedStars > 0 ? `${selectedStars} / 5 Stars` : 'Tap stars to rate'}
                      </span>
                    </div>

                    {/* Quick Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedTag === tag
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Review Comment */}
                    <input
                      type="text"
                      placeholder="Optional feedback comment..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                    />

                    {ratingError && (
                      <p className="text-xs text-rose-500 font-bold text-center">{ratingError}</p>
                    )}

                    {ratedSuccessNotice && (
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Rating recorded! +1 Health Point awarded.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={selectedStars === 0 || submittingRating}
                      className={`w-full min-h-[48px] py-3 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center space-x-2 ${
                        selectedStars > 0 && !submittingRating
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {submittingRating ? (
                        <span>SUBMITTING...</span>
                      ) : (
                        <>
                          <span>SUBMIT RATING (+1 POINT)</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
