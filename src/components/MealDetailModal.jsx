import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, ArrowLeft, Check, Send } from 'lucide-react';

export const MealDetailModal = () => {
  const { selectedMealModal, setSelectedMealModal, rateMeal, getUserRating, getMealStats } = useApp();
  const [showRatingBox, setShowRatingBox] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  if (!selectedMealModal) return null;

  const meal = selectedMealModal;
  const userExistingRating = getUserRating(meal.id);
  const currentRatingVal = userExistingRating?.rating || 0;
  const liveStats = getMealStats ? getMealStats(meal.id) : { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };

  const hasNutrition = meal.calories > 0 || meal.protein > 0;

  const handleRateSubmit = (stars) => {
    rateMeal(meal.id, stars, feedbackText, selectedTag ? [selectedTag] : []);
    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingSubmitted(false);
      setShowRatingBox(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <button
            onClick={() => setSelectedMealModal(null)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <span className="text-xs font-bold text-slate-300">{meal.category}</span>

          <button
            onClick={() => setSelectedMealModal(null)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Food Image */}
        <div className="relative h-56 w-full overflow-hidden">
          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-4 left-5 right-5 text-white flex items-end justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{meal.name}</h2>
              <span className="text-xs text-slate-300 font-semibold">{meal.time}</span>
            </div>

            <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1 shadow-md">
              {liveStats.rating ? (
                <>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>{liveStats.rating} ★ ({liveStats.ratingCount})</span>
                </>
              ) : (
                <span className="text-slate-300 text-[11px]">No ratings yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          
          {/* Nutrition Cards */}
          {hasNutrition ? (
            <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Calories</span>
                <p className="text-base font-black text-slate-900 dark:text-white">{meal.calories}</p>
                <span className="text-[9px] text-slate-400">kcal</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Protein</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{meal.protein}g</p>
                <span className="text-[9px] text-slate-400">protein</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Carbs</span>
                <p className="text-base font-black text-slate-900 dark:text-white">{meal.carbs || 0}g</p>
                <span className="text-[9px] text-slate-400">carbs</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fats</span>
                <p className="text-base font-black text-slate-900 dark:text-white">{meal.fats || 0}g</p>
                <span className="text-[9px] text-slate-400">fats</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs font-bold text-slate-400 border">
              Nutrition details not available yet.
            </div>
          )}

          {/* Ingredients */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Ingredients</h4>
              <div className="flex flex-wrap gap-1.5">
                {meal.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Inline Rating Box */}
          {showRatingBox && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Rate this meal</span>
                <span className="text-[10px] text-slate-400">Feedback</span>
              </div>

              {/* 5 Stars */}
              <div className="flex items-center justify-center space-x-2 py-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => handleRateSubmit(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= currentRatingVal
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      handleRateSubmit(5);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedTag === tag ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Optional Text Feedback */}
              <div className="flex space-x-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Optional comment..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRateSubmit(5)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {ratingSubmitted && (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Rating saved!</span>
                </div>
              )}
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setShowRatingBox(prev => !prev)}
              className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-colors text-center"
            >
              RATE MEAL
            </button>

            <button
              onClick={() => setShowRatingBox(true)}
              className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold text-xs border border-slate-200 dark:border-slate-700 transition-colors text-center"
            >
              GIVE FEEDBACK
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
