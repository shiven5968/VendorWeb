import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Zap, 
  Clock, 
  CheckCircle2, 
  CheckCheck, 
  Plus, 
  ChevronRight, 
  Target, 
  Sparkles,
  Sliders,
  AlertCircle,
  HelpCircle,
  XCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { getSmartAlternatives } from '../../services/nutritionAlternatives.js';
import { formatCollegeDateDisplay } from '../../utils/dateTime.js';

export const TodayDashboard = ({
  profile,
  summary,
  recommendations,
  todayMeals,
  todayLogs,
  entitlement,
  onOpenProfileModal,
  onOpenOutsideFoodModal,
  onOpenMealModal,
  onQuickLogStandardMeal,
  onSkipMeal,
  onSelectTab
}) => {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const activeTarget = summary.targetProtein || profile?.dailyProteinTargetG || 120;
  const consumed = summary.consumedProtein || 0;
  const remaining = Math.max(0, activeTarget - consumed);
  const completionPct = summary.completionPercentage || Math.min(100, Math.round((consumed / activeTarget) * 100));

  const alternatives = getSmartAlternatives({
    dietaryPreference: profile?.dietaryPreference || 'Vegetarian',
    allergies: profile?.allergies || [],
    remainingProteinNeeded: remaining
  });

  return (
    <div className="space-y-6">
      
      {/* ── 1. PRIMARY NUTRITION HERO (APPLE FITNESS / LINEAR CALIBRE) ────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: High-Precision Radial Ring */}
          <div className="flex items-center space-x-6">
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(100, completionPct) / 100)}
                  className="text-emerald-500 transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {completionPct}%
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Target Hit
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Today's Daily Target
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700">
                  LIVE IST
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {consumed}g
                </span>
                <span className="text-base font-bold text-slate-400">
                  / {activeTarget}g
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-600">
                {remaining > 0 ? (
                  <span>⚡ {remaining}g needed from upcoming meals</span>
                ) : (
                  <span>🎉 Daily Target Achieved! Fantastic discipline!</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Tactile Macro Tiles */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center min-w-[105px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                Meals
              </span>
              <span className="text-xl font-black text-slate-900">
                {summary.completedMealsCount || 0} / 4
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">tracked</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center min-w-[105px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                Calories
              </span>
              <span className="text-xl font-black text-slate-900 flex items-center justify-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{summary.consumedCalories || 0}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">kcal intake</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center min-w-[105px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                Deficit
              </span>
              <span className="text-xl font-black text-emerald-600">
                {remaining}g
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">to goal</span>
            </div>
          </div>

        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>💡 Having eggs, a whey protein shake, or canteen snack?</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showAlternatives ? 'Hide Alternatives' : 'View Smart Alternatives'}</span>
            </button>
            <button
              onClick={onOpenOutsideFoodModal}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Log Outside Food</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. SMART CAMPUS FOOD ALTERNATIVES (PHASE 9) ───────────────────────── */}
      {showAlternatives && (
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Smart Campus Alternatives (To Bridge Your {remaining}g Deficit)</span>
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Affordable, verified protein staples available on campus or hostel rooms ({profile?.dietaryPreference || 'Vegetarian'}).
              </p>
            </div>
            <button
              onClick={() => setShowAlternatives(false)}
              className="text-xs text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alternatives.slice(0, 6).map(alt => (
              <div 
                key={alt.id}
                className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900">{alt.name}</h4>
                    <span className="text-xs font-black text-emerald-700">~{alt.proteinG}g</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">{alt.servingSize} • {alt.costEstimate}</span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{alt.recommendationTip}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 truncate max-w-[140px]">{alt.availability}</span>
                  <button
                    onClick={() => {
                      onOpenOutsideFoodModal({
                        name: alt.name,
                        protein: alt.proteinG,
                        calories: alt.calories
                      });
                    }}
                    className="text-emerald-600 font-black hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>+ Quick Log</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. FOUR REAL MESS MEAL CARDS (BREAKFAST, LUNCH, SNACKS, DINNER) ──── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Today's Actual Mess Menu &amp; Smart Portions
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real hostel menu with personalized portion sizing to hit your remaining target.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((cat) => {
            const rec = recommendations[cat];
            if (!rec) return null;

            const isLogged = rec.status === 'COMPLETED';
            const isSkipped = rec.status === 'SKIPPED';
            const existingLog = (todayLogs || []).find(l => l.mealType === cat);

            return (
              <div
                key={cat}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isLogged
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : isSkipped
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-400'
                }`}
              >
                <div className="space-y-3.5">
                  
                  {/* Top Slot Pill & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {cat}
                    </span>

                    {isLogged && (
                      <span className="text-xs font-black text-emerald-700 flex items-center space-x-1.5 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Logged (+{existingLog?.proteinConsumed || 0}g)</span>
                      </span>
                    )}
                    {isSkipped && (
                      <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">
                        Skipped
                      </span>
                    )}
                  </div>

                  {/* Dish Name & Context Explanation */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>

                  {/* Recommended Portions Breakdown */}
                  {!isLogged && !isSkipped && rec.suggestedItems && rec.suggestedItems.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Recommended Plate Portions:
                      </span>
                      <div className="space-y-1.5">
                        {rec.suggestedItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-700 truncate max-w-[210px]">
                              • {item.name} <span className="text-slate-400 text-[10px]">({item.recommendedPortionLabel})</span>
                            </span>
                            <span className="font-black text-emerald-700 shrink-0">
                              ~{item.recommendedProteinG}g
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-400">
                      {isLogged ? 'Recorded' : `Target: ~${rec.targetProteinForSlot || 25}g`}
                    </span>
                    {!isLogged && !isSkipped && (
                      <button
                        onClick={() => onSkipMeal(cat)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 font-semibold cursor-pointer underline"
                      >
                        Skip
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {!isLogged && !isSkipped && (
                      <button
                        onClick={() => onQuickLogStandardMeal(cat, rec)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black transition-all cursor-pointer flex items-center space-x-1"
                        title="Instant 1-tap log of standard serving"
                      >
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span>1-Tap Log</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenMealModal({
                        category: cat,
                        title: rec.title,
                        items: rec.items,
                        existingLog
                      })}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1 transition-all cursor-pointer ${
                        isLogged
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <span>{isLogged ? 'Edit Intake' : 'Customize / Log'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
