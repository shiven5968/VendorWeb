import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, Dumbbell, Flame, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const MealDetailModal = () => {
  const { selectedMealModal, setSelectedMealModal, rateMeal, userRatings } = useApp();

  if (!selectedMealModal) return null;

  const meal = selectedMealModal;
  const currentRating = userRatings[meal.id] || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Top Header Bar with Close & Back Buttons */}
        <div className="p-4 bg-slate-900/90 text-white flex items-center justify-between border-b border-slate-800">
          <button
            onClick={() => setSelectedMealModal(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>
          
          <div className="text-xs font-bold text-slate-300">Dish Nutrition Profile</div>

          <button
            onClick={() => setSelectedMealModal(null)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Food Image Header */}
        <div className="relative h-60 w-full overflow-hidden">
          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-extrabold shadow">
                {meal.category}
              </span>
              {meal.gymRecommended && (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold flex items-center space-x-1">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>High Protein Dish</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black">{meal.name}</h2>
            <p className="text-xs text-slate-300 mt-1">{meal.description}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick Macro Grid */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 text-amber-500 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Calories</span>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{meal.calories}</p>
              <span className="text-[10px] text-slate-400">kcal</span>
            </div>
            <div>
              <div className="text-emerald-500 mb-1 text-xs font-semibold uppercase">Protein</div>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{meal.protein}g</p>
              <span className="text-[10px] text-slate-400 font-semibold">Muscle Pass</span>
            </div>
            <div>
              <div className="text-blue-500 mb-1 text-xs font-semibold uppercase">Carbs</div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{meal.carbs}g</p>
              <span className="text-[10px] text-slate-400">Energy</span>
            </div>
            <div>
              <div className="text-rose-500 mb-1 text-xs font-semibold uppercase">Fats</div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{meal.fats}g</p>
              <span className="text-[10px] text-slate-400">Essential</span>
            </div>
          </div>

          {/* Micro Nutrients */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Micronutrients & Minerals</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Dietary Fiber:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{meal.fiber || 6}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sodium:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{meal.sodium || '350mg'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Probiotic:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            </div>
          </div>

          {/* Ingredients & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ingredients List</h4>
              <div className="flex flex-wrap gap-1.5">
                {meal.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Allergen Flags</h4>
              <div className="flex flex-wrap gap-1.5">
                {meal.allergens.map((alg, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{alg}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Rating Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>Rate Today's Dish (+20 Points)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current Mess Rating: <strong className="text-slate-800 dark:text-slate-200">{meal.rating} / 5.0</strong> ({meal.ratingCount} student ratings)
                </p>
              </div>

              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => rateMeal(meal.id, star)}
                    className="p-1.5 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= currentRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Back & Close Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setSelectedMealModal(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Menu</span>
            </button>

            <button
              onClick={() => setSelectedMealModal(null)}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
