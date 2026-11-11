import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';
import { getMessForStudent, getMessOptions } from '../config/menuGroups';
import { getMenuByMessId } from '../data/hostelMenus';
import { getCollegeDateForDayInCurrentWeek } from '../utils/dateTime';
import { OFFICIAL_MEAL_TIMINGS, MEAL_ORDER } from '../services/mealTiming';
import { MealCard } from '../components/ui/MealCard';

export const MenuPage = () => {
  const {
    selectedDay,
    setSelectedDay,
    todayDay,
    meals,
    allMeals,
    setSelectedMealModal,
    setCurrentPage,
    currentUser,
    currentRole,
    getUserRating,
    getMealStats,
    getTimingStatus
  } = useApp();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const isOfficial =
    currentRole === 'warden' ||
    currentRole === 'mess_committee' ||
    currentUser?.role === 'warden' ||
    currentUser?.role === 'mess_committee';

  // Resolve the student's mess from their profile (centralized, single source of truth)
  const resolvedMess = getMessForStudent(currentUser);

  // Normal students see ONLY their resolved mess menu and cannot switch.
  // Officials retain the ability to inspect all 3 messes.
  const [selectedMessOverride, setSelectedMessOverride] = useState(null);
  const activeMess = isOfficial && selectedMessOverride ? selectedMessOverride : resolvedMess;

  // Weekly menu from the mess-resolved dataset (no silent fallback to another day if missing)
  const activeWeeklyMenu = activeMess ? getMenuByMessId(activeMess.menuId || activeMess.id) : null;
  const dayMenu = activeWeeklyMenu ? activeWeeklyMenu[selectedDay] || null : null;
  const dayDbMeals = (allMeals || meals || []).filter(
    (m) => (m.day || '').toLowerCase() === (selectedDay || '').toLowerCase()
  );

  // Build up to 4 meals in official chronological order for the selected day
  const displayMeals = dayMenu
    ? MEAL_ORDER.map((cat) => {
        const staticMeal = dayMenu[cat];
        const matchingDbMeal = dayDbMeals.find((m) => m.category === cat);
        if (!staticMeal && !matchingDbMeal) return null;

        const calories = staticMeal?.calories
          ? parseInt(staticMeal.calories, 10) || 0
          : matchingDbMeal?.calories || 0;
        const protein = staticMeal?.protein
          ? parseFloat(staticMeal.protein) || 0
          : matchingDbMeal?.protein || 0;

        return {
          ...(matchingDbMeal || {}),
          id:
            matchingDbMeal?.id ||
            `${selectedDay.toLowerCase().substring(0, 3)}_${cat.toLowerCase().substring(0, 1)}`,
          category: cat,
          day: selectedDay,
          name: staticMeal?.title || matchingDbMeal?.name || `${cat} Special`,
          items:
            (staticMeal?.items && staticMeal.items.length > 0
              ? staticMeal.items.join(', ')
              : matchingDbMeal?.items) || '',
          image: staticMeal?.image ?? matchingDbMeal?.image ?? '',
          servingSize: staticMeal?.servingSize || matchingDbMeal?.servingSize || '',
          calories,
          protein,
          carbs: staticMeal?.carbs ? parseFloat(staticMeal.carbs) || 0 : matchingDbMeal?.carbs || 0,
          fats: staticMeal?.fats
            ? parseFloat(staticMeal.fats) || 0
            : matchingDbMeal?.fats || matchingDbMeal?.fat || 0,
          fat: staticMeal?.fats
            ? parseFloat(staticMeal.fats) || 0
            : matchingDbMeal?.fat || matchingDbMeal?.fats || 0,
          fiber: staticMeal?.fiber ? parseFloat(staticMeal.fiber) || 0 : matchingDbMeal?.fiber || 0,
          status: staticMeal?.status || (calories === 0 ? 'off' : 'active')
        };
      }).filter(Boolean)
    : [];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 pb-8 md:pb-12">

      {/* Return to Home CTA */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentPage('dashboard')}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {selectedDay} Schedule
        </span>
      </div>

      {/* Header & Official Mess Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h1 className="text-[22px] sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Full Week Mess Menu
            </h1>
          </div>
          <p className="text-[13px] sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
            Official meal schedules, estimated nutrition &amp; verified ingredients
          </p>
        </div>

        {/* Mess Selector — ONLY available to officials */}
        {isOfficial && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">
              Official View:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              {getMessOptions().map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedMessOverride(opt)}
                  title={opt.description}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMess?.id === opt.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.shortLabel || opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mess identity badge or Unresolved Notice */}
      {activeMess ? (
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
          <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {activeMess.label}
            </span>
            {' — '}
            {activeMess.description}
            {activeMess.caterer && (
              <span className="ml-1 text-slate-400">
                ({activeMess.caterer}, W.E.F. {activeMess.effectiveDate})
              </span>
            )}
          </span>
          {isOfficial && selectedMessOverride && selectedMessOverride.id !== resolvedMess?.id && (
            <button
              type="button"
              onClick={() => setSelectedMessOverride(null)}
              className="ml-2 text-xs font-black text-amber-600 hover:text-amber-700 underline cursor-pointer"
            >
              Reset to my mess
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start space-x-2.5">
          <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Mess Allocation Unresolved: </span>
            <span>
              Your admission number could not be mapped to an official dining complex. Please contact hostel administration to verify your mess assignment.
            </span>
          </div>
        </div>
      )}

      {/* Day Selector Pills (Horizontal scroll strictly contained inside viewport, no scale overflow) */}
      <div className="w-full min-w-0 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              {day} {isToday && '• Today'}
            </button>
          );
        })}
      </div>

      {/* Meals Grid for Selected Day */}
      {!activeMess ? (
        <div className="p-10 text-center text-sm font-bold text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No mess assigned to your student profile. Please contact the hostel office.
        </div>
      ) : displayMeals.length === 0 ? (
        <div className="p-10 text-center text-sm font-bold text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          Menu for {selectedDay} has not been published yet. Check back shortly.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {displayMeals.map((meal) => {
            const stats = getMealStats ? getMealStats(meal.id) : null;
            const selectedDayDate = getCollegeDateForDayInCurrentWeek(selectedDay);
            const userRating = getUserRating ? getUserRating(meal.id, selectedDayDate) : null;
            const isTodaySelected = selectedDay === todayDay;
            const timingStatus = getTimingStatus
              ? getTimingStatus(meal.category, {
                  dayName: selectedDay,
                  isNextDay: !isTodaySelected
                })
              : null;

            return (
              <MealCard
                key={meal.id}
                meal={meal}
                timingStatus={timingStatus}
                timingLabel={
                  selectedDay === 'Sunday' && meal.category === 'Snacks'
                    ? 'OFF'
                    : OFFICIAL_MEAL_TIMINGS[meal.category]?.label || meal.time
                }
                stats={stats}
                userRating={userRating}
                isNextDay={!isTodaySelected}
                showActions
                showRating={false}
                onViewDetails={(m) => setSelectedMealModal(m)}
                onClick={() => setSelectedMealModal(meal)}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};
