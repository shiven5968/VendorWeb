import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, Plus, Check, Save } from 'lucide-react';

export const MusclePassPage = () => {
  const { 
    currentUser, 
    proteinTarget, 
    setProteinTarget, 
    consumedProtein, 
    logProtein,
    todayMeals
  } = useApp();

  const [targetInput, setTargetInput] = useState(proteinTarget);
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const remainingProtein = Math.max(0, proteinTarget - consumedProtein);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));

  const recommendedToday = (todayMeals || [])
    .filter(m => Number(m.protein) >= 7)
    .sort((a, b) => Number(b.protein) - Number(a.protein));

  const handleSaveTarget = (e) => {
    e.preventDefault();
    setProteinTarget(Number(targetInput));
    setShowEditTarget(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Muscle Pass</h1>
            <p className="text-xs text-slate-500 font-semibold">{currentUser?.name || 'Student'}</p>
          </div>
        </div>

        <button
          onClick={() => setShowEditTarget(!showEditTarget)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
        >
          {showEditTarget ? 'Close' : 'Set Goal'}
        </button>
      </div>

      {showEditTarget && (
        <form onSubmit={handleSaveTarget} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Protein Goal (g)</label>
            <input
              type="number"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </form>
      )}

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center space-x-1">
          <Check className="w-4 h-4" />
          <span>Protein target updated.</span>
        </div>
      )}

      {/* Protein Goal Tracker Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Protein Goal</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{proteinTarget}g</p>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">Consumed</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{consumedProtein}g</p>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Remaining</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{remainingProtein}g</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500">Daily Target Progress</span>
          <span className="text-emerald-600 dark:text-emerald-400">{proteinPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${proteinPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Recommended Today Section */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Recommended Today (From Mess Menu)
        </h2>

        {recommendedToday.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border">
            No high-protein recommendations found in today's menu.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedToday.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{item.category}</span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{item.name}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                    +{item.protein}g
                  </span>
                  <button
                    onClick={() => logProtein(item.name, item.protein)}
                    className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    title="Log to today's protein"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
