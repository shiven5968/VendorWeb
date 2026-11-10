import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  Flame, 
  Dumbbell, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { CAMPUS_NUTRITION_STAPLES } from '../../services/nutritionAlternatives.js';

export const MyMealsSection = ({
  todayLogs = [],
  summary = {},
  onOpenMealModal,
  onOpenOutsideFoodModal,
  onDeleteLog,
  onQuickLogPreset
}) => {
  const [selectedSlot, setSelectedSlot] = useState('Snacks');
  const [deletingType, setDeletingType] = useState(null);

  const handleDelete = async (mealType) => {
    if (window.confirm(`Reset ${mealType} log for today?`)) {
      setDeletingType(mealType);
      try {
        await onDeleteLog(mealType);
      } finally {
        setDeletingType(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── TOP STAT STRIP ──────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Today's Logged Total
          </span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-3xl font-black text-slate-900">{summary.consumedProtein || 0}g</span>
            <span className="text-xs font-bold text-slate-400">/ {summary.targetProtein || 120}g goal</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {todayLogs.length} meal entries recorded today.
          </p>
        </div>

        <button
          onClick={() => onOpenOutsideFoodModal()}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ Log Custom Outside Food</span>
        </button>
      </div>

      {/* ── POPULAR CAMPUS PRESET 1-TAP LOGGERS ──────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Tap Instant Staples Logger</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Adds to Snacks slot</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CAMPUS_NUTRITION_STAPLES.slice(0, 6).map(staple => (
            <button
              key={staple.id}
              onClick={() => onQuickLogPreset(staple, selectedSlot)}
              className="p-3 rounded-2xl bg-white hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 transition-all text-left group cursor-pointer shadow-xs"
            >
              <div className="text-[11px] font-black text-slate-900 truncate group-hover:text-emerald-700">
                {staple.name}
              </div>
              <div className="text-[10px] text-emerald-600 font-black mt-0.5">
                +{staple.proteinG}g protein
              </div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">
                {staple.servingSize}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── TODAY'S RECORDED MEALS TIMELINE ─────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          Recorded Meal Logs
        </h3>

        {todayLogs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
            <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-black text-slate-700">No Meals Logged Yet Today</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Head to the Today tab to log your breakfast, lunch, or dinner, or use the 1-Tap logger above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLogs.map((log) => {
              const isSkipped = log.status === 'SKIPPED';
              const items = log.items || [];

              return (
                <div
                  key={log.mealType}
                  className={`p-5 rounded-3xl border transition-all ${
                    isSkipped
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                          {log.mealType}
                        </span>
                        {isSkipped ? (
                          <span className="text-xs font-bold text-slate-400">Skipped</span>
                        ) : (
                          <span className="text-xs font-black text-emerald-700 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>+{log.proteinConsumed || 0}g protein recorded</span>
                          </span>
                        )}
                        {log.caloriesConsumed > 0 && (
                          <span className="text-xs text-slate-400 font-semibold">
                            • ~{log.caloriesConsumed} kcal
                          </span>
                        )}
                      </div>

                      {/* Items details */}
                      {!isSkipped && items.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          {items.map((it, idx) => (
                            <span 
                              key={idx}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200/60"
                            >
                              {it.name} <span className="text-slate-400 text-[10px]">({it.portion || 1}x)</span>
                              <strong className="text-emerald-700 ml-1">+{it.proteinConsumed || 0}g</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDelete(log.mealType)}
                        disabled={deletingType === log.mealType}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete this meal log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
