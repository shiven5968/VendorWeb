import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UtensilsCrossed, Star, Clock, Sun, Moon, Coffee, Calendar, ChevronRight } from 'lucide-react';

export const MenuPage = () => {
  const { selectedDay, setSelectedDay, weeklyMessMenu, setSelectedMealModal } = useApp();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const categoryStyles = {
    Breakfast: { bg: 'bg-amber-500', icon: Sun },
    Lunch: { bg: 'bg-emerald-600', icon: UtensilsCrossed },
    Snacks: { bg: 'bg-orange-500', icon: Coffee },
    Dinner: { bg: 'bg-indigo-600', icon: Moon },
  };

  const dayMeals = weeklyMessMenu[selectedDay] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Day Selector */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white">WEEKLY MESS MENU</h1>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map(day => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Meals List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dayMeals.map(meal => {
          const style = categoryStyles[meal.category] || categoryStyles.Lunch;
          const CategoryIcon = style.icon;

          return (
            <div
              key={meal.id}
              onClick={() => setSelectedMealModal(meal)}
              className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full ${style.bg} text-white text-[10px] font-black flex items-center space-x-1 shadow-md`}>
                    <CategoryIcon className="w-3 h-3" />
                    <span>{meal.category}</span>
                  </span>

                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                    {meal.time}
                  </span>

                  <div className="absolute bottom-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center space-x-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{meal.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {meal.name}
                  </h3>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                    {meal.items || meal.description}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                    <span className="text-emerald-600 dark:text-emerald-400">💪 {meal.protein}g protein</span>
                    <span>•</span>
                    <span>🔥 {meal.calories} kcal</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                  <span>VIEW MEAL</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
