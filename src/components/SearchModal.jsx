import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, Utensils, Star, Flame, Dumbbell } from 'lucide-react';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, meals, setSelectedMealModal } = useApp();

  if (!isSearchOpen) return null;

  const filteredMeals = meals.filter(m => 
    (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.ingredients && m.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))) ||
    (m.allergens && m.allergens.some(alg => alg.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <input
            type="text"
            placeholder="Search dishes, ingredients (Paneer, Protein), allergens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {filteredMeals.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No dishes matched "{searchQuery}"</p>
            </div>
          ) : (
            filteredMeals.map(meal => (
              <div
                key={meal.id}
                onClick={() => {
                  setSelectedMealModal(meal);
                  setIsSearchOpen(false);
                }}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/40 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{meal.name}</h4>
                      {meal.gymRecommended && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center space-x-0.5">
                          <Dumbbell className="w-3 h-3" />
                          <span>High Protein</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{meal.category} • {meal.calories} kcal • {meal.protein}g protein</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{meal.rating}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Tag suggestions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 text-xs">
          <span className="text-slate-400 font-medium self-center">Popular:</span>
          {['Paneer', 'High Protein', 'Rajma', 'Breakfast', 'Snacks', 'Gluten Free'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
