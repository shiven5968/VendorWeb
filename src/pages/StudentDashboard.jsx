import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  Star, 
  MapPin, 
  Sun, 
  Moon, 
  Coffee, 
  ChevronRight, 
  Award, 
  Send, 
  Check, 
  Clock, 
  Flame, 
  X, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { getMessForStudent } from '../config/menuGroups';
import { formatCollegeDateDisplay, formatRatingRelativeTime } from '../utils/dateTime';
import { OFFICIAL_MEAL_TIMINGS } from '../services/mealTiming';

import {
  getMenuByMessId,
  isGirlsHostelBlock
} from '../data/hostelMenus';

const getActiveMenu = (user) => {
  const mess = getMessForStudent(user);
  if (mess) {
    return getMenuByMessId(mess.menuId || mess.id);
  }
  if (user && isGirlsHostelBlock(user.hostelBlock || user.block)) {
    return getMenuByMessId('girls');
  }
  return getMenuByMessId('boys_junior');
};

const getMealTiming = (mealType, selectedDay) => {
  if (selectedDay === 'Sunday' && mealType === 'Snacks') {
    return 'OFF';
  }
  return OFFICIAL_MEAL_TIMINGS[mealType]?.label || '';
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const StudentDashboard = () => {
  const { 
    currentUser, 
    todayDay,
    todayMeals,
    rateMeal, 
    getUserRating, 
    getMealStats, 
    setSelectedMealModal, 
    setCurrentPage,
    currentTime,
    mealSlotInfo,
    getTimingStatus,
    checkIsRatingAllowed,
    allRatings,
    rewardPoints
  } = useApp();

  // Weekly Schedule Day Selector State (inside Home)
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(todayDay || 'Monday');

  // Modal state for direct meal rating
  const [ratingModalMeal, setRatingModalMeal] = useState(null);
  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratedSuccessNotice, setRatedSuccessNotice] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const todayDateString = formatCollegeDateDisplay(currentTime);

  const categoryStyles = {
    Breakfast: { bg: 'bg-amber-500', icon: Sun },
    Lunch: { bg: 'bg-emerald-600', icon: UtensilsCrossed },
    Snacks: { bg: 'bg-orange-500', icon: Coffee },
    Dinner: { bg: 'bg-indigo-600', icon: Moon },
  };

  const getMealStatsLocal = (mealId) => {
    const mealRatings = (allRatings || []).filter(r => r.mealId === mealId);
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

  const activeMenu = getActiveMenu(currentUser);
  const rawMeals = todayMeals && todayMeals.length > 0 ? todayMeals : [];

  // Today's Meals list
  const mealsList = useMemo(() => {
    if (!activeMenu) return [];
    return ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(cat => {
      const dayMenu = activeMenu[todayDay] || activeMenu['Monday'] || {};
      const staticMeal = dayMenu[cat] || { title: `${cat} Menu`, items: [], image: '', protein: '15g', calories: '500 kcal' };
      const matchingDbMeal = rawMeals.find(m => m.category === cat);
      return {
        ...(matchingDbMeal || {}),
        id: matchingDbMeal?.id || `${todayDay.toLowerCase().substring(0, 3)}_${cat.toLowerCase().substring(0, 1)}`,
        category: cat,
        name: staticMeal.title || matchingDbMeal?.name,
        items: (staticMeal.items && staticMeal.items.length > 0 ? staticMeal.items.join(', ') : matchingDbMeal?.items) || '',
        image: staticMeal.image || matchingDbMeal?.image,
        servingSize: staticMeal.servingSize || matchingDbMeal?.servingSize || '',
        protein: (staticMeal.protein || matchingDbMeal?.protein || '14g').toString().replace('g', ''),
        calories: (staticMeal.calories || matchingDbMeal?.calories || '520 kcal').toString().replace(' kcal', ''),
      };
    });
  }, [activeMenu, todayDay, rawMeals]);

  // Selected Day's Meals list for the Weekly Schedule
  const scheduleDayMeals = useMemo(() => {
    if (!activeMenu) return [];
    const dayMenu = activeMenu[selectedScheduleDay] || activeMenu['Monday'] || {};
    return ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(cat => {
      const staticMeal = dayMenu[cat] || { title: `${cat} Special`, items: [], image: '', protein: '15g', calories: '500 kcal' };
      return {
        id: `${selectedScheduleDay.toLowerCase().substring(0, 3)}_${cat.toLowerCase().substring(0, 1)}`,
        category: cat,
        day: selectedScheduleDay,
        name: staticMeal.title || `${cat} Special`,
        items: (staticMeal.items && staticMeal.items.length > 0 ? staticMeal.items.join(', ') : '') || '',
        image: staticMeal.image || '',
        servingSize: staticMeal.servingSize || '',
        protein: (staticMeal.protein || '14g').toString().replace('g', ''),
        calories: (staticMeal.calories || '520 kcal').toString().replace(' kcal', ''),
      };
    });
  }, [activeMenu, selectedScheduleDay]);

  // Determine current active / next upcoming meal to feature on top
  const { featuredMeal, otherMeals } = useMemo(() => {
    if (!mealsList || mealsList.length === 0) {
      return { featuredMeal: null, otherMeals: [] };
    }

    // 1. If any meal is currently in rating window / live, it becomes featured
    const liveOrRatingMeal = mealsList.find(m => checkIsRatingAllowed(m.category));
    if (liveOrRatingMeal) {
      return {
        featuredMeal: liveOrRatingMeal,
        otherMeals: mealsList.filter(m => m.id !== liveOrRatingMeal.id)
      };
    }

    // 2. Otherwise feature the next upcoming meal slot
    const nextCategory = mealSlotInfo?.nextMealCategory;
    const upcoming = mealsList.find(m => m.category === nextCategory);
    if (upcoming) {
      return {
        featuredMeal: upcoming,
        otherMeals: mealsList.filter(m => m.id !== upcoming.id)
      };
    }

    // Fallback: first meal
    return {
      featuredMeal: mealsList[0],
      otherMeals: mealsList.slice(1)
    };
  }, [mealsList, checkIsRatingAllowed, mealSlotInfo]);

  // Deep-link handler: Scan QR Code -> auto-open live rating window
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const rate = params.get('rate');
      if (action === 'rate' || rate === 'current' || rate === 'true') {
        const target = featuredMeal || mealsList.find(m => checkIsRatingAllowed(m.category)) || mealsList[0];
        if (target) {
          openRateModal(target);
        }
      }
    } catch (e) {}
  }, [featuredMeal, mealsList]);

  // Open Direct Rating Modal
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
      await rateMeal(ratingModalMeal.id, selectedStars, feedbackText, selectedTag ? [selectedTag] : []);
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

  const scrollToWeeklySchedule = () => {
    const el = document.getElementById('weekly-menu-schedule');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredTiming = featuredMeal ? getTimingStatus(featuredMeal.category) : null;
  const featuredStats = featuredMeal ? getMealStatsLocal(featuredMeal.id) : null;
  const myFeaturedRating = featuredMeal ? getUserRating(featuredMeal.id) : null;
  const FeaturedCategoryIcon = featuredMeal ? (categoryStyles[featuredMeal.category]?.icon || UtensilsCrossed) : UtensilsCrossed;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12 animate-in fade-in duration-200">
      
      {/* 1. UNIFIED, COHESIVE STUDENT HEADER (CLEAN & INTEGRATED) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
            alt={currentUser?.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, {currentUser?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center space-x-1.5">
              <span>{todayDateString}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentUser?.hostelBlock || 'DNB Block'}</span>
            </p>
          </div>
        </div>

        {rewardPoints > 0 && (
          <button
            type="button"
            onClick={() => setCurrentPage('rewards')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/90 dark:border-amber-800/80 text-xs font-bold hover:scale-105 transition-all shadow-xs cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>{rewardPoints} pts</span>
          </button>
        )}
      </div>

      {/* 2. SECTION TITLE & WEEKLY SCHEDULE SHORTCUT */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            TODAY'S MEALS
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Full day menu for {todayDay} • Tap dish to view nutrition breakdown
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToWeeklySchedule}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>Full Week Menu</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. FEATURED HERO MEAL (LIVE NOW OR NEXT UPCOMING MEAL) */}
      {featuredMeal && featuredTiming && (
        <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-lg hover:shadow-xl transition-all">
          <div className="flex flex-col sm:flex-row">
            {/* Clear, Bright Food Image */}
            <div className="relative sm:w-80 md:w-96 h-52 sm:h-auto min-h-[220px] overflow-hidden shrink-0">
              {featuredMeal.image ? (
                <img
                  src={featuredMeal.image}
                  alt={featuredMeal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center p-6 text-white text-center">
                  <Coffee className="w-10 h-10 text-orange-400 mb-2 opacity-80" />
                  <span className="text-xs font-bold">Holiday Off</span>
                </div>
              )}
              {/* Subtle lighting overlay for crisp image clarity */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>

              {/* Category Pill */}
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full ${categoryStyles[featuredMeal.category]?.bg || 'bg-emerald-600'} text-white text-xs font-black shadow-md flex items-center space-x-1.5`}>
                <FeaturedCategoryIcon className="w-3.5 h-3.5" />
                <span>{featuredMeal.category}</span>
              </span>

              {/* Official Service Timing */}
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                {getMealTiming(featuredMeal.category, todayDay)}
              </span>
            </div>

            {/* Featured Meal Details & Actions */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Status Indicator */}
                  {featuredTiming.isLive ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-500/30">
                      <Flame className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>LIVE NOW • Service Active</span>
                    </span>
                  ) : featuredTiming.status === 'ENDED_RATING_OPEN' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-500/30">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rating Grace Period Open</span>
                    </span>
                  ) : featuredTiming.status === 'UPCOMING' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Upcoming Next • Starts {featuredTiming.label.split('–')[0]?.trim()}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                      <span>Concluded for Today</span>
                    </span>
                  )}

                  {featuredStats?.rating && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{featuredStats.rating} ({featuredStats.ratingCount} reviews)</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {featuredMeal.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {featuredMeal.items || featuredMeal.description}
                </p>

                <div className="flex items-center space-x-2.5 text-xs font-bold pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    {featuredMeal.protein}g protein
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {featuredMeal.calories} kcal
                  </span>
                </div>
              </div>

              {/* Glorified Action Buttons (View Details + Direct Rate Now) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMealModal(featuredMeal)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openRateModal(featuredMeal)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer ${
                    myFeaturedRating
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : featuredTiming.isRatingAllowed
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${myFeaturedRating ? 'text-amber-500 fill-amber-500' : 'fill-current'}`} />
                  <span>
                    {myFeaturedRating 
                      ? `Rated (${myFeaturedRating.rating}★)` 
                      : featuredTiming.isRatingAllowed 
                      ? 'Rate Now (+1 pt)' 
                      : 'Rate Meal'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. THE OTHER 3 MEALS (CLEAN RESPONSIVE GRID) */}
      {otherMeals.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Other Meals Today
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMeals.map(meal => {
              const style = categoryStyles[meal.category] || categoryStyles.Lunch;
              const CategoryIcon = style.icon;
              const timing = getTimingStatus(meal.category);
              const stats = getMealStatsLocal(meal.id);
              const myRating = getUserRating(meal.id);

              return (
                <div
                  key={meal.id}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg transition-all"
                >
                  <div>
                    {/* Clear Food Image */}
                    <div className="relative w-full h-44 overflow-hidden">
                      {meal.image ? (
                        <img
                          src={meal.image}
                          alt={meal.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-4 text-center">
                          <Coffee className="w-8 h-8 text-orange-400 mb-1.5 opacity-80" />
                          <span className="text-xs font-black text-white">HOLIDAY OFF</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">Mess closed</span>
                        </div>
                      )}
                      {/* Subtle lighting */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>

                      {/* Category Tag */}
                      <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full ${style.bg} text-white text-[10px] font-black flex items-center space-x-1 shadow-md`}>
                        <CategoryIcon className="w-3 h-3" />
                        <span>{meal.category}</span>
                      </span>

                      {/* Live Timing Badge */}
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md ${timing.badgeColor}`}>
                        {timing.badgeText}
                      </span>

                      {/* Service Timing */}
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                        {getMealTiming(meal.category, todayDay)}
                      </span>

                      {/* Rating Stats if available */}
                      {stats.rating && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-xl text-[10px] font-black flex items-center space-x-1 shadow-md">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span>{stats.rating} ({stats.ratingCount})</span>
                        </div>
                      )}
                    </div>

                    {/* Meal Info */}
                    <div className="p-4 space-y-1.5">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                        {meal.name}
                      </h3>
                      
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {meal.items || meal.description}
                      </p>

                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                        <span className="text-emerald-600 dark:text-emerald-400">{meal.protein}g protein</span>
                        <span>•</span>
                        <span>{meal.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Glorified Action Buttons in Card Footer */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMealModal(meal)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-100 transition-colors shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openRateModal(meal)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center space-x-1 cursor-pointer ${
                        myRating
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : timing.isRatingAllowed
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${myRating ? 'text-amber-500 fill-amber-500' : 'fill-current'}`} />
                      <span>{myRating ? `${myRating.rating}★` : timing.isRatingAllowed ? 'Rate' : 'Window'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. INTEGRATED WEEKLY MESS SCHEDULE EXPLORER (ADDED TO HOME SECTION) */}
      <div id="weekly-menu-schedule" className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Weekly Mess Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Day-by-day menu schedules, verified ingredients & macro estimates
            </p>
          </div>
        </div>

        {/* Day Pills Bar */}
        <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = selectedScheduleDay === day;
            const isToday = day === todayDay;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedScheduleDay(day)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4 Meal Cards for Selected Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scheduleDayMeals.map(meal => {
            const style = categoryStyles[meal.category] || categoryStyles.Lunch;
            const CategoryIcon = style.icon;

            return (
              <div
                key={meal.id}
                className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-500/30 hover:shadow-md transition-all"
              >
                <div>
                  <div className="relative w-full h-40 overflow-hidden">
                    {meal.image ? (
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center p-4 text-center">
                        <Coffee className="w-8 h-8 text-orange-400 mb-1 opacity-80" />
                        <span className="text-xs font-bold text-white">OFF</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>

                    <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full ${style.bg} text-white text-[10px] font-black flex items-center space-x-1 shadow-md`}>
                      <CategoryIcon className="w-3 h-3" />
                      <span>{meal.category}</span>
                    </span>

                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                      {getMealTiming(meal.category, selectedScheduleDay)}
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                      {meal.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                      {meal.items || 'Standard hostel preparation'}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 pt-1">
                      <span className="text-emerald-600 dark:text-emerald-400">{meal.protein}g protein</span>
                      <span>•</span>
                      <span>{meal.calories} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedMealModal(meal)}
                    className="w-full py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-100 transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>View Ingredients & Details</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. DIRECT MEAL RATING MODAL (POPS UP ON "RATE NOW" CLICK OR SCANNER QR) */}
      {ratingModalMeal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
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
                className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {getMealTiming(ratingModalMeal.category, todayDay)}
                </p>
              </div>
            </div>

            {/* Rating Content */}
            <div className="p-5 space-y-4">
              {(() => {
                const myRating = getUserRating(ratingModalMeal.id);
                const timing = getTimingStatus(ratingModalMeal.category);
                const isAllowed = checkIsRatingAllowed(ratingModalMeal.category);

                if (myRating) {
                  return (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-center space-y-2">
                      <div className="flex items-center justify-center space-x-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
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
                      <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                        Rating Submitted ({myRating.rating}★)
                      </p>
                      {myRating.feedback && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                          "{myRating.feedback}"
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 block">
                        Verified & locked. +1 Health Point awarded.
                      </span>
                    </div>
                  );
                }

                if (!isAllowed) {
                  return (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2 text-xs">
                      <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Rating window is currently closed for {ratingModalMeal.category}.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Ratings are accepted strictly during meal hours and for 30 minutes after ({timing.ratingWindowLabel}).
                      </p>
                    </div>
                  );
                }

                return (
                  <form onSubmit={handleModalRatingSubmit} className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Rate Your Food Quality
                      </span>
                      <div className="flex items-center justify-center space-x-2 pt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setSelectedStars(star)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer"
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
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
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
                      onChange={e => setFeedbackText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
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
                      className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2 ${
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
                          <Send className="w-3.5 h-3.5" />
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
