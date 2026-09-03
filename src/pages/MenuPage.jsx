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
import { resolveMenuGroup, getMenuGroupOptions } from '../config/menuGroups';

export const MenuPage = () => {
  const { 
    selectedDay, 
    setSelectedDay, 
    todayDay,
    meals, 
    setSelectedMealModal,
    currentUser,
    getUserRating,
    getMealStats
  } = useApp();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const menuGroup = resolveMenuGroup(currentUser);
  const [selectedGroupOverride, setSelectedGroupOverride] = useState(null);

  const activeGroup = selectedGroupOverride || menuGroup;

  const categoryStyles = {
    Breakfast: { bg: 'bg-amber-500', icon: Sun },
    Lunch: { bg: 'bg-emerald-600', icon: UtensilsCrossed },
    Snacks: { bg: 'bg-orange-500', icon: Coffee },
    Dinner: { bg: 'bg-indigo-600', icon: Moon },
  };

  // Sort meals in official order: Breakfast, Lunch, Snacks, Dinner
  const orderMap = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };
  const sortedMeals = [...(meals || [])].sort((a, b) => (orderMap[a.category] || 99) - (orderMap[b.category] || 99));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header & Menu Group Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Weekly Mess Menu
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Official meal schedules, certified nutrition & verified ingredients
          </p>
        </div>

        {/* Dynamic Menu Group Badge & Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Schedule for:</span>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {getMenuGroupOptions().map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedGroupOverride(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGroup.id === opt.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.shortLabel || opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
      {sortedMeals.length === 0 ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No meals scheduled for {selectedDay}. Check back shortly.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedMeals.map(meal => {
            const style = categoryStyles[meal.category] || categoryStyles.Lunch;
            const CategoryIcon = style.icon;
            const stats = getMealStats ? getMealStats(meal.id) : null;
            const userRating = getUserRating ? getUserRating(meal.id) : null;

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
                        <span className="text-xs font-bold">Holiday / Off</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                    {/* Category Tag */}
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full ${style.bg} text-white text-[10px] font-black flex items-center space-x-1 shadow-md`}>
                      <CategoryIcon className="w-3 h-3" />
                      <span>{meal.category}</span>
                    </span>

                    {/* Timing Pill */}
                    {meal.time && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                        {meal.time}
                      </span>
                    )}

                    {/* Rating Pill */}
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
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {meal.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                      {meal.items || meal.description}
                    </p>

                    <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                      {meal.protein && <span className="text-emerald-600 dark:text-emerald-400">{meal.protein}g protein</span>}
                      {meal.protein && meal.calories && <span>•</span>}
                      {meal.calories && <span>{meal.calories} kcal</span>}
                    </div>
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
