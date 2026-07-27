import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  Star, 
  Flame, 
  MapPin, 
  Clock, 
  Sun, 
  Moon, 
  Coffee, 
  ChevronRight,
  Award,
  CheckCircle2
} from 'lucide-react';

export const StudentDashboard = () => {
  const { 
    currentUser, 
    todayDay,
    meals, 
    userRatings, 
    rateMeal, 
    setSelectedMealModal,
    currentMessInfo
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');

  // Today's formatted date string from system clock
  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Category styling map
  const categoryStyles = {
    Breakfast: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/10', icon: Sun },
    Lunch: { bg: 'bg-emerald-600', text: 'text-emerald-500', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/10', icon: UtensilsCrossed },
    Snacks: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/30', glow: 'shadow-orange-500/10', icon: Coffee },
    Dinner: { bg: 'bg-indigo-600', text: 'text-indigo-500', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/10', icon: Moon },
  };

  // Filtered meals for today only
  const filteredMeals = activeCategory === 'All' 
    ? meals 
    : meals.filter(m => m.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* TODAY'S AUTOMATIC REAL-TIME MESS MENU BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/30">
        
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Today: {todayDateString}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
              <span>ABES EC & ABESBS (Naina Caters)</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
            Today's Mess Menu ({todayDay})
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Hostel Block: <strong className="text-white">{currentUser?.hostelBlock || 'DNB Block'}</strong></span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Assigned Mess: <strong className="text-emerald-300">{currentMessInfo.messName}</strong></span>
            </div>
          </div>
        </div>

        {/* Mess Operational Timings Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 space-y-1.5 text-xs min-w-[260px] relative z-10 shadow-lg">
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Mess Operational Timings</span>
          <div className="space-y-1 text-[11px] text-slate-300">
            <p className="flex justify-between"><span>Breakfast:</span><strong className="text-white">07:30 AM - 09:30 AM</strong></p>
            <p className="flex justify-between"><span>Lunch:</span><strong className="text-white">12:30 PM - 02:30 PM</strong></p>
            <p className="flex justify-between"><span>Snacks:</span><strong className="text-white">05:00 PM - 06:00 PM</strong></p>
            <p className="flex justify-between"><span>Dinner:</span><strong className="text-white">07:30 PM - 09:30 PM</strong></p>
          </div>
        </div>

      </div>

      {/* DISH CATEGORY FILTER TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {todayDay}'s Served Dishes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rating is active for Today's Mess Meals only.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
          {['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeCategory === cat
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DISH CARDS GRID FOR TODAY ONLY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeals.map(meal => {
          const userRating = userRatings[meal.id] || 0;
          const style = categoryStyles[meal.category] || categoryStyles.Lunch;
          const CategoryIcon = style.icon;

          return (
            <div
              key={meal.id}
              className={`glass-card rounded-3xl overflow-hidden flex flex-col justify-between group border ${style.border} ${style.glow} hover:shadow-xl transition-all`}
            >
              <div>
                {/* Food Image */}
                <div className="relative h-56 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedMealModal(meal)}>
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex space-x-1.5">
                    <span className={`px-3 py-1 rounded-full ${style.bg} text-white text-[11px] font-black flex items-center space-x-1 shadow-md`}>
                      <CategoryIcon className="w-3.5 h-3.5" />
                      <span>{meal.category}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-bold">
                      {meal.time}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-amber-500 flex items-center space-x-1 shadow-md">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{meal.rating}</span>
                    <span className="text-slate-400 font-normal">({meal.ratingCount})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="cursor-pointer" onClick={() => setSelectedMealModal(meal)}>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {meal.name}
                    </h3>
                    
                    {/* Full Menu Combo Items Description */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mt-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        Combo Items Served:
                      </span>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {meal.items || meal.description}
                      </p>
                    </div>
                  </div>

                  {/* Macro Breakdown */}
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs border border-slate-200/50 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Calories</span>
                      <p className="font-black text-slate-900 dark:text-white">{meal.calories}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-500 uppercase font-semibold">Protein</span>
                      <p className="font-black text-emerald-600 dark:text-emerald-400">{meal.protein}g</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Carbs</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{meal.carbs}g</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Fats</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{meal.fats}g</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Footer for Today's Dish */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Rate Today:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => rateMeal(meal.id, star)}
                      title={`Rate ${star} Stars`}
                      className="hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedMealModal(meal)}
                  className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Full Recipe & Ingredients</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
