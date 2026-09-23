import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  Star,
  Sun,
  Moon,
  Coffee,
  Calendar,
  ChevronRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { getMessForStudent, getMessOptions, getMessById } from '../config/menuGroups';
import { getMenuByMessId } from '../data/hostelMenus';
import { getCollegeDateForDayInCurrentWeek } from '../utils/dateTime';
import { OFFICIAL_MEAL_TIMINGS } from '../services/mealTiming';

export const MenuPage = () => {
  const {
    selectedDay,
    setSelectedDay,
    todayDay,
    meals,
    setSelectedMealModal,
    currentUser,
    currentRole,
    getUserRating,
    getMealStats,
  } = useApp();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const isOfficial = currentRole === 'warden' || currentRole === 'mess_committee' || currentUser?.role === 'warden' || currentUser?.role === 'mess_committee';

  // Resolve the student's mess from their profile (centralized, single source of truth)
  const resolvedMess = getMessForStudent(currentUser);

  // Normal students see ONLY their resolved mess menu and cannot switch.
  // Officials retain the ability to inspect all 3 messes.
  const [selectedMessOverride, setSelectedMessOverride] = useState(null);
  const activeMess = isOfficial && selectedMessOverride ? selectedMessOverride : resolvedMess;

  const categoryStyles = {
    Breakfast: { bg: 'bg-amber-500', icon: Sun },
    Lunch: { bg: 'bg-emerald-600', icon: UtensilsCrossed },
    Snacks: { bg: 'bg-orange-500', icon: Coffee },
    Dinner: { bg: 'bg-indigo-600', icon: Moon },
  };

  // Weekly menu from the mess-resolved dataset
  const activeWeeklyMenu = activeMess ? getMenuByMessId(activeMess.menuId || activeMess.id) : null;
  const dayMenu = activeWeeklyMenu ? (activeWeeklyMenu[selectedDay] || activeWeeklyMenu['Monday'] || {}) : null;

  // Build 4 meals in official order for the active mess
  const categories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const displayMeals = dayMenu ? categories.map(cat => {
    const staticMeal = dayMenu[cat] || { title: `${cat} Special`, items: [], image: '', protein: '15g', calories: '500 kcal' };
    const matchingDbMeal = (meals || []).find(m => m.category === cat);
    return {
      ...(matchingDbMeal || {}),
      id: matchingDbMeal?.id || `${selectedDay.toLowerCase().substring(0, 3)}_${cat.toLowerCase().substring(0, 1)}`,
      category: cat,
      day: selectedDay,
      name: staticMeal.title || matchingDbMeal?.name || `${cat} Special`,
      items: (staticMeal.items && staticMeal.items.length > 0 ? staticMeal.items.join(', ') : matchingDbMeal?.items) || '',
      image: staticMeal.image || matchingDbMeal?.image || '',
      servingSize: staticMeal.servingSize || matchingDbMeal?.servingSize || '',
      calories: staticMeal.calories ? parseInt(staticMeal.calories, 10) || 0 : (matchingDbMeal?.calories || 0),
      protein: staticMeal.protein ? parseFloat(staticMeal.protein) || 0 : (matchingDbMeal?.protein || 0),
      carbs: staticMeal.carbs ? parseFloat(staticMeal.carbs) || 0 : (matchingDbMeal?.carbs || 0),
      fats: staticMeal.fats ? parseFloat(staticMeal.fats) || 0 : (matchingDbMeal?.fats || matchingDbMeal?.fat || 0),
      fat: staticMeal.fats ? parseFloat(staticMeal.fats) || 0 : (matchingDbMeal?.fat || matchingDbMeal?.fats || 0),
      fiber: staticMeal.fiber ? parseFloat(staticMeal.fiber) || 0 : (matchingDbMeal?.fiber || 0),
      status: staticMeal.status || (staticMeal.calories === '0 kcal' ? 'off' : 'active'),
    };
  }) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">

      {/* Header & Mess Identity Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Weekly Mess Menu
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Official meal schedules, estimated nutrition &amp; verified ingredients
          </p>
        </div>

        {/* Mess Selector — ONLY available to officials */}
        {isOfficial && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Official View:</span>
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              {getMessOptions().map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedMessOverride(opt)}
                  title={opt.description}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <GraduationCap className="w-4 h-4 text-emerald-500" />
          <span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeMess.label}</span>
            {' — '}{activeMess.description}
            {activeMess.caterer && (
              <span className="ml-1 text-slate-400">({activeMess.caterer}, W.E.F. {activeMess.effectiveDate})</span>
            )}
          </span>
          {isOfficial && selectedMessOverride && selectedMessOverride.id !== resolvedMess?.id && (
            <button
              onClick={() => setSelectedMessOverride(null)}
              className="ml-2 text-[10px] font-black text-amber-500 hover:text-amber-600 underline cursor-pointer"
            >
              Reset to my mess
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center space-x-2">
          <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-bold">Mess Allocation Unresolved: </span>
            <span>Your admission number could not be mapped to an official dining complex. Please contact the hostel administration to verify your mess assignment.</span>
          </div>
        </div>
      )}

      {/* Day Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map(day => {
          const isSelected = selectedDay === day;
          const isToday = todayDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md scale-105'
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
        <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No mess assigned to your student profile. Please contact the hostel office.
        </div>
      ) : displayMeals.length === 0 ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No meals scheduled for {selectedDay}. Check back shortly.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayMeals.map(meal => {
            const style = categoryStyles[meal.category] || categoryStyles.Lunch;
            const CategoryIcon = style.icon;
            const stats = getMealStats ? getMealStats(meal.id) : null;
            const selectedDayDate = getCollegeDateForDayInCurrentWeek(selectedDay);
            const userRating = getUserRating ? getUserRating(meal.id, selectedDayDate) : null;

            return (
              <div
                key={meal.id}
                onClick={() => setSelectedMealModal(meal)}
                className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {meal.image ? (
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <UtensilsCrossed className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-xs font-bold">OFF</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                    {/* Category Tag */}
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full ${style.bg} text-white text-[10px] font-black flex items-center space-x-1 shadow-md`}>
                      <CategoryIcon className="w-3 h-3" />
                      <span>{meal.category}</span>
                    </span>

                    {/* Timing Pill */}
                    {(meal.time || OFFICIAL_MEAL_TIMINGS[meal.category]?.label) && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                        {OFFICIAL_MEAL_TIMINGS[meal.category]?.label || meal.time}
                      </span>
                    )}

                    {/* Rating Pill */}
                    {meal.calories > 0 && (
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-0.5 rounded-xl text-[10px] font-black flex items-center space-x-1 shadow-md">
                        {meal.rating ? (
                          <>
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span>{meal.rating}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">Verified</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {meal.name}
                    </h3>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                      {meal.items || meal.description}
                    </p>

                    {meal.calories > 0 ? (
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                        {meal.protein && <span className="text-emerald-600 dark:text-emerald-400">{meal.protein}g protein</span>}
                        {meal.protein && meal.calories && <span>•</span>}
                        {meal.calories && <span>{meal.calories} kcal</span>}
                      </div>
                    ) : (
                      <div className="pt-1 text-[10px] font-bold text-slate-400 uppercase">
                        Kitchen Closed • No Service
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                    <span>VIEW DETAILS</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>

                  {userRating && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Your Rating: {userRating.rating || userRating}★
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
