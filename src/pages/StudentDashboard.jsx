import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  Star, 
  MapPin, 
  Sun, 
  Moon, 
  Coffee, 
  ChevronRight, 
  Dumbbell, 
  Vote, 
  Award, 
  Check, 
  Clock, 
  GraduationCap 
} from 'lucide-react';
import { WeeklyMenuReviewSection } from '../components/WeeklyMenuReviewSection';
import { getMessForStudent } from '../config/menuGroups';
import { formatCollegeDateDisplay, formatRatingRelativeTime } from '../utils/dateTime';
import { OFFICIAL_MEAL_TIMINGS } from '../services/mealTiming';

import {
  MEAL_IMAGES,
  GH_IMAGES,
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

export const StudentDashboard = () => {
  const { 
    currentUser, 
    todayDay, 
    todayMeals, 
    rateMeal, 
    getUserRating, 
    getMealStats, 
    setSelectedMealModal, 
    currentMessInfo, 
    setCurrentPage, 
    proteinTarget, 
    consumedProtein, 
    currentTime, 
    mealSlotInfo, 
    getTimingStatus, 
    checkIsRatingAllowed, 
    allRatings, 
    rewardPoints 
  } = useApp();

  const [selectedRatingMealId, setSelectedRatingMealId] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratedSuccessNotice, setRatedSuccessNotice] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const todayDateString = formatCollegeDateDisplay(currentTime);
  const menuGroup = getMessForStudent(currentUser);

  const remainingProtein = Math.max(0, proteinTarget - consumedProtein);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));

  const getMealStatsLocal = (mealId) => {
    const mealRatings = (allRatings || []).filter(r => r.mealId === mealId);
    if (mealRatings.length === 0) {
      return { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };
    }
    const sum = mealRatings.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    const avg = parseFloat((sum / mealRatings.length).toFixed(1));
    return {
      rating: avg,
      ratingDisplay: `⭐ ${avg} (${mealRatings.length})`,
      ratingCount: mealRatings.length
    };
  };

  const activeMenu = getActiveMenu(currentUser);

  const rawMeals = todayMeals && todayMeals.length > 0 ? todayMeals : [];
  const mealsList = activeMenu ? ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(cat => {
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
  }) : [];

  // Active rating meal slot determination
  const activeRatingMeal = mealsList.find(m => checkIsRatingAllowed(m.category));
  const defaultTargetMeal = activeRatingMeal || mealsList[0];
  const currentTargetMealId = selectedRatingMealId || defaultTargetMeal?.id || '';
  const currentTargetMeal = mealsList.find(m => m.id === currentTargetMealId) || defaultTargetMeal;

  const currentMealUserRating = currentTargetMeal ? getUserRating(currentTargetMeal.id) : null;
  const isTargetRatingAllowed = currentTargetMeal ? checkIsRatingAllowed(currentTargetMeal.category) : false;

  const handleRatingSubmit = async (e) => {
    e?.preventDefault();
    if (!currentTargetMeal || selectedStars === 0 || submittingRating || currentMealUserRating || !isTargetRatingAllowed) {
      return;
    }

    try {
      setSubmittingRating(true);
      setRatingError('');
      await rateMeal(currentTargetMeal.id, selectedStars, feedbackText, selectedTag ? [selectedTag] : []);
      setRatedSuccessNotice(true);
      setSelectedStars(0);
      setFeedbackText('');
      setSelectedTag('');
      setTimeout(() => setRatedSuccessNotice(false), 3000);
    } catch (err) {
      setRatingError(err.message || 'Rating submission failed.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 pb-24 md:pb-16 text-slate-900 dark:text-slate-100">
      
      {/* 1. GREETING & CONTEXT HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
            alt={currentUser?.name}
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Hello, {currentUser?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{todayDateString}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser?.hostelBlock || 'DNB Block'}</span>
              {menuGroup && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700/60">
                    <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{menuGroup.label}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {rewardPoints > 0 && (
            <button
              onClick={() => setCurrentPage('rewards')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/80 text-xs font-medium transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{rewardPoints} pts</span>
            </button>
          )}

          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{currentMessInfo?.messName || 'ABES Mess'}</span>
          </div>
        </div>
      </div>

      {/* 2. UNDERSTATED LIVE MESS STATUS TICKER */}
      {mealSlotInfo && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Current Service</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{mealSlotInfo.bannerMessage}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-4 sm:pl-0">
            <span>Next:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{mealSlotInfo.nextMealLabel}</span>
          </div>
        </div>
      )}

      {/* 3. TODAY'S MEALS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Today's Meals
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {menuGroup ? menuGroup.label : "Allocation Pending"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Full schedule for {todayDay} · Select any meal for verified ingredients and nutritional guidance
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('menu')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Full Week Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mealsList.map(meal => {
            const timing = getTimingStatus(meal.category);
            const stats = getMealStatsLocal(meal.id);

            return (
              <div
                key={meal.id}
                onClick={() => setSelectedMealModal(meal)}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div>
                  {/* Clean Culinary Photography with Soft Masking */}
                  <div className="relative w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {meal.image ? (
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <Coffee className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kitchen Closed</span>
                        <span className="text-[10px] text-slate-400">Snacks OFF on Sunday</span>
                      </div>
                    )}

                    {/* Single subtle category badge top-left */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                        {meal.category}
                      </span>
                    </div>

                    {/* Live indicator top-right only if Live */}
                    {timing.isLive && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          <span>Live Service</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clean Content Area */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {meal.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {meal.items || meal.description}
                      </p>
                    </div>

                    {/* Horizontal Structured Metadata Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-medium">Protein</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{meal.protein}g</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-medium">Energy</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{meal.calories} kcal</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-medium">Timing</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {getMealTiming(meal.category, todayDay)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {stats.rating ? `⭐ ${stats.rating} (${stats.ratingCount})` : 'New dish'}
                  </span>

                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. VERIFIED MEAL FEEDBACK & RATING (HIGH TRUST) */}
      {mealsList.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                How was your meal?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submit verified ratings to improve campus dining quality · 1 review per meal window
              </p>
            </div>
            
            <span className="inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-500/20">
              <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>+1 Health Point per Review</span>
            </span>
          </div>

          {/* Meal Selector */}
          <div className="space-y-1.5 max-w-md">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Select Meal Category
            </label>
            <select
              value={currentTargetMealId}
              onChange={(e) => {
                setSelectedRatingMealId(e.target.value);
                setSelectedStars(0);
                setRatingError('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              {mealsList.map(m => {
                const isAllowed = checkIsRatingAllowed(m.category);
                const rated = getUserRating(m.id);
                return (
                  <option key={m.id} value={m.id}>
                    {m.category}: {m.name} {rated ? '(Already Rated ★)' : isAllowed ? '(Rating Open)' : '(Rating Closed)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* State switch */}
          {currentMealUserRating ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Rating Recorded · Locked</span>
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatRatingRelativeTime(currentMealUserRating.timestamp)} ({currentMealUserRating.rating || currentMealUserRating}★)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your feedback has been logged into the hostel committee ledger.
              </p>
            </div>
          ) : !isTargetRatingAllowed ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Rating window for {currentTargetMeal?.category} is currently closed.
              </p>
              <p className="text-[11px]">
                Ratings are accepted strictly during meal hours and up to 30 minutes after service ({getTimingStatus(currentTargetMeal?.category).ratingWindowLabel}).
              </p>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4 pt-1">
              <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSelectedStars(star)}
                      className="p-1 text-slate-300 dark:text-slate-700 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-all ${
                          star <= selectedStars
                            ? 'text-amber-400 fill-amber-400'
                            : 'hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {selectedStars > 0 ? `${selectedStars} of 5 Stars` : 'Tap stars to rate'}
                </span>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Comment Input */}
              <input
                type="text"
                placeholder="Optional review comment for the mess staff..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />

              {ratingError && (
                <p className="text-xs text-rose-500 font-medium text-center">{ratingError}</p>
              )}

              <button
                type="submit"
                disabled={selectedStars === 0 || submittingRating}
                className={`w-full py-2.5 rounded-xl font-medium text-xs transition-colors ${
                  selectedStars > 0 && !submittingRating
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          )}

          {ratedSuccessNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium text-center flex items-center justify-center space-x-1.5 border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Rating recorded. +1 Health Point awarded!</span>
            </div>
          )}
        </div>
      )}

      {/* 5. STUDENT ECOSYSTEM CARDS: MUSCLE PASS & ACTIVE VOTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Muscle Pass Entry Card */}
        <div 
          onClick={() => setCurrentPage('muscle-pass')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 cursor-pointer hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Muscle Pass
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Gym Mode &amp; High-Protein Diet Plan</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Target: {proteinTarget}g
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>Consumed: <strong className="text-slate-900 dark:text-slate-100">{consumedProtein}g</strong></span>
              <span>Remaining: <strong className="text-emerald-600 dark:text-emerald-400">{remainingProtein}g</strong></span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${proteinPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Daily Macro Intake Tracking</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>Manage plan</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Dish Replacement Voting Card */}
        <div 
          onClick={() => setCurrentPage('voting')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 cursor-pointer hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Vote className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Dish Replacement Voting
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Active Committee Polls</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold border border-purple-500/20">
              Live Poll
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            Cast your vote on upcoming dish alterations and propose new hostel menu recipes democratically.
          </p>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Student Council Ballot</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>Vote now</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

      {/* 6. WEEKLY MENU REVIEW SECTION */}
      <WeeklyMenuReviewSection />

    </div>
  );
};
