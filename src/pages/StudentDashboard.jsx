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
  Send,
  Check
} from 'lucide-react';

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
    poll
  } = useApp();

  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [quickRatingMealId, setQuickRatingMealId] = useState(todayMeals[0]?.id || '');
  const [ratedNotice, setRatedNotice] = useState(false);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const categoryStyles = {
    Breakfast: { bg: 'bg-amber-500', icon: Sun },
    Lunch: { bg: 'bg-emerald-600', icon: UtensilsCrossed },
    Snacks: { bg: 'bg-orange-500', icon: Coffee },
    Dinner: { bg: 'bg-indigo-600', icon: Moon },
  };

  const remainingProtein = Math.max(0, proteinTarget - consumedProtein);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));

  const handleQuickSubmit = (star) => {
    const targetMealId = quickRatingMealId || todayMeals[0]?.id;
    if (!targetMealId) return;
    rateMeal(targetMealId, star, feedbackText, selectedTag ? [selectedTag] : []);
    setRatedNotice(true);
    setFeedbackText('');
    setSelectedTag('');
    setTimeout(() => setRatedNotice(false), 2500);
  };

  const mealsList = todayMeals && todayMeals.length > 0 ? todayMeals : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* GREETING & LOCATION (DYNAMIC NAME) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
            alt={currentUser?.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, {currentUser?.name || 'Student'} 👋
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {todayDateString} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentUser?.hostelBlock || 'DNB Block'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
          <MapPin className="w-4 h-4 text-emerald-500" />
          <span>{currentMessInfo.messName}</span>
        </div>
      </div>

      {/* TODAY'S MENU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>TODAY'S MENU</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500 text-white">LIVE</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">{todayDay}</span>
        </div>

        {mealsList.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No menu available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealsList.map(meal => {
              const myRating = getUserRating(meal.id);
              const stats = getMealStats ? getMealStats(meal.id) : { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };
              const style = categoryStyles[meal.category] || categoryStyles.Lunch;
              const CategoryIcon = style.icon;

              return (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealModal(meal)}
                  className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer"
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

                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center space-x-1 shadow-md">
                        {stats.rating ? (
                          <>
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span>{stats.rating} ({stats.ratingCount})</span>
                          </>
                        ) : (
                          <span className="text-slate-300">No ratings yet</span>
                        )}
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
                        <span className="text-emerald-600 dark:text-emerald-400">{meal.protein}g protein</span>
                        <span>•</span>
                        <span>{meal.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>VIEW MEAL</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>

                    <span className="text-[10px] text-slate-400 font-semibold">
                      {myRating ? `Rated ${myRating.rating}★` : 'Tap to rate'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RATING CARD: “How was your meal?” */}
      {mealsList.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold flex items-center space-x-2">
              <span>How was your meal?</span>
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              Rate & Review
            </span>
          </div>

          {/* Meal Selector */}
          <select
            value={quickRatingMealId || (mealsList[0]?.id || '')}
            onChange={(e) => setQuickRatingMealId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 outline-none"
          >
            {mealsList.map(m => (
              <option key={m.id} value={m.id}>
                {m.category}: {m.name}
              </option>
            ))}
          </select>

          {/* 5 Stars */}
          <div className="flex items-center justify-center space-x-3 py-1">
            {[1, 2, 3, 4, 5].map(star => {
              const activeId = quickRatingMealId || mealsList[0]?.id;
              const userMealRating = getUserRating(activeId);
              const isFilled = userMealRating ? star <= userMealRating.rating : false;
              return (
                <button
                  key={star}
                  onClick={() => handleQuickSubmit(star)}
                  className="p-1.5 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Tag Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  handleQuickSubmit(5);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTag === tag
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {ratedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1 border border-emerald-500/30">
              <Check className="w-4 h-4" />
              <span>Feedback recorded! Thank you for rating.</span>
            </div>
          )}
        </div>
      )}

      {/* MUSCLE PASS & ACTIVE VOTING SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Muscle Pass */}
        <div 
          onClick={() => setCurrentPage('muscle-pass')}
          className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 cursor-pointer hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Muscle Pass</h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Target: {proteinTarget}g</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Consumed: <strong className="text-emerald-600 dark:text-emerald-400">{consumedProtein}g</strong></span>
              <span>Remaining: <strong className="text-slate-900 dark:text-white">{remainingProtein}g</strong></span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${proteinPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>High-protein dish tracking</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center">Open →</span>
          </div>
        </div>

        {/* Voting */}
        <div 
          onClick={() => setCurrentPage('voting')}
          className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 cursor-pointer hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Voting Poll</h3>
            {poll ? (
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{poll.totalVotes} Votes</span>
            ) : null}
          </div>

          {poll ? (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Replace: <strong className="text-amber-500">{poll.dishToReplace}</strong>
              </p>
              {poll.options.slice(0, 2).map(opt => (
                <div key={opt.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-bold">
                  <span>{opt.name}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{opt.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs font-bold text-slate-400">
              No active voting polls at this time.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
