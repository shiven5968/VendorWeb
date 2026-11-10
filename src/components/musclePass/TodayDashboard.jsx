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
  ArrowRight,
  Sun,
  Utensils,
  Coffee,
  Moon,
  Info
} from 'lucide-react';
import { getSmartAlternatives } from '../../services/nutritionAlternatives.js';
import { formatCollegeDateDisplay } from '../../utils/dateTime.js';

export const TodayDashboard = ({
  profile,
  summary,
  recommendations = {},
  todayMeals = [],
  todayLogs = [],
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

  const MEAL_META = {
    Breakfast: {
      time: '7:20 AM - 8:30 AM',
      icon: Sun,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    Lunch: {
      time: '12:20 PM - 2:00 PM',
      icon: Utensils,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    Snacks: {
      time: '5:00 PM - 6:00 PM',
      icon: Coffee,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    Dinner: {
      time: '7:30 PM - 9:00 PM',
      icon: Moon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── 1. PRIMARY NUTRITION HERO (CLEAN, BOLD, APPLE FITNESS CALIBRE) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: High-Precision Radial Ring & Numbers */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
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
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Today's Daily Target
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  LIVE IST
                </span>
              </div>
              <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {consumed}g
                </span>
                <span className="text-lg font-bold text-slate-400">
                  / {activeTarget}g
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-emerald-700">
                {remaining > 0 ? (
                  <span>⚡ {remaining}g remaining to reach your goal today</span>
                ) : (
                  <span>🎉 Daily Target Achieved! Outstanding consistency!</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Tactile Macro Tiles */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="p-3 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-0 flex-1 sm:min-w-[100px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 truncate">
                Meals
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {summary.completedMealsCount || 0} / 4
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mt-0.5 truncate">logged</span>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-0 flex-1 sm:min-w-[100px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 truncate">
                Calories
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center space-x-1">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <span>{summary.consumedCalories || 0}</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold block mt-0.5 truncate">kcal intake</span>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center min-w-0 flex-1 sm:min-w-[100px]">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block mb-1 truncate">
                Remaining
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {remaining}g
              </span>
              <span className="text-[11px] sm:text-xs text-emerald-800 font-semibold block mt-0.5 truncate">protein left</span>
            </div>
          </div>

        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
            <span>💡 Having eggs, canteen snacks, or a whey protein shake?</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 text-xs font-black text-slate-700 hover:text-emerald-700 transition-all cursor-pointer flex items-center space-x-1.5"
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

      {/* ── 2. SMART CAMPUS FOOD ALTERNATIVES ───────────────────────────────── */}
      {showAlternatives && (
        <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-emerald-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Smart Campus Alternatives (Bridge Your {remaining}g Protein Gap)</span>
              </h3>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                Verified high-protein staples easily available on campus ({profile?.dietaryPreference || 'Vegetarian'}).
              </p>
            </div>
            <button
              onClick={() => setShowAlternatives(false)}
              className="text-xs text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alternatives.slice(0, 6).map(alt => (
              <div 
                key={alt.id}
                className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{alt.name}</h4>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ~{alt.proteinG}g
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
                    {alt.servingSize} • {alt.costEstimate}
                  </span>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{alt.recommendationTip}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[140px] text-[10px]">{alt.availability}</span>
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

      {/* ── 3. FOUR SPATIOUS, BEAUTIFULLY LAID-OUT MESS MEAL CARDS ─────────── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Today's Mess Menu &amp; What to Put on Your Plate
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Clear, spacious portion guidelines for each meal so you can eat smart without technical confusion.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((cat) => {
            const rec = recommendations[cat];
            if (!rec) return null;

            const isLogged = rec.status === 'COMPLETED';
            const isSkipped = rec.status === 'SKIPPED';
            const existingLog = (todayLogs || []).find(l => l.mealType === cat);
            const meta = MEAL_META[cat] || MEAL_META.Lunch;
            const IconComponent = meta.icon;

            return (
              <div
                key={cat}
                className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                  isLogged
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                    : isSkipped
                    ? 'bg-slate-50/80 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Top Bar: Meal Category, Timing & Logged Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-xl ${meta.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                          {cat}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {meta.time}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isLogged && (
                        <span className="text-xs font-black text-emerald-800 flex items-center space-x-1.5 bg-emerald-100 px-3 py-1 rounded-full">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Logged (+{existingLog?.proteinConsumed || 0}g)</span>
                        </span>
                      )}
                      {isSkipped && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                          Skipped
                        </span>
                      )}
                      {!isLogged && !isSkipped && (
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          Target: ~{rec.targetProteinForSlot || 25}g
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Big Bold Dish Title */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>

                  {/* Dishes Served Chips */}
                  {Array.isArray(rec.items) && rec.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rec.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                        >
                          {it.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── HERO PLATE GUIDANCE: "What to Put on Your Plate" ── */}
                  {!isLogged && !isSkipped && (
                    <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                          <span>What to Put on Your Plate</span>
                        </span>
                        <span className="text-xs font-black text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                          ~{rec.totalSuggestedProtein || 25}g protein
                        </span>
                      </div>

                      {/* Item-by-item clear integer servings */}
                      {rec.suggestedItems && rec.suggestedItems.length > 0 ? (
                        <div className="space-y-2">
                          {rec.suggestedItems.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black">
                                  {item.recommendedPortion || 1} Serving{item.recommendedPortion > 1 ? 's' : ''}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[200px]">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-xs sm:text-sm font-black text-emerald-700 shrink-0">
                                ~{item.recommendedProteinG}g
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Friendly Student Mess Tip */}
                      <div className="flex items-start space-x-2 text-xs text-emerald-900 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200/60 font-medium">
                        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <p className="leading-snug">
                          {rec.plateTip || "Prioritize extra dal or paneer katoris over excess plain rice to hit your target easily."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* If already logged, show what student ate */}
                  {isLogged && existingLog && Array.isArray(existingLog.items) && (
                    <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2">
                      <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wide block">
                        Recorded on Your Plate:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {existingLog.items.map((it, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {it.name} ({it.portion || 1} serving{it.portion > 1 ? 's' : ''}): +{it.proteinConsumed || 0}g
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Action Buttons Row */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {!isLogged && !isSkipped && (
                      <button
                        onClick={() => onSkipMeal(cat)}
                        className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer transition-colors"
                      >
                        Skip This Meal
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isLogged && !isSkipped && (
                      <button
                        onClick={() => onQuickLogStandardMeal(cat, rec)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 border border-emerald-200"
                        title="Instant 1-tap log of 1 standard serving"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>1-Tap Ate Standard</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenMealModal({
                        category: cat,
                        title: rec.title,
                        items: rec.items,
                        existingLog
                      })}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isLogged
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      <span>{isLogged ? 'Edit Intake' : 'Customize Servings (1, 2, 3, 4)'}</span>
                      <ChevronRight className="w-4 h-4" />
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
