import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  Award
} from 'lucide-react';

export const WeeklyInsightsCard = ({
  weeklySummaries = [],
  targetProteinG = 120
}) => {
  if (!weeklySummaries || weeklySummaries.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2 shadow-sm">
        <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
          Weekly Insights Unlocking Soon
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Log your meals over the coming days. Your 7-day protein averages, goal consistency, and intake patterns will appear here automatically.
        </p>
      </div>
    );
  }

  // Calculate metrics
  const totalDays = weeklySummaries.length;
  const totalProteinSum = weeklySummaries.reduce((acc, s) => acc + (Number(s.consumedProteinG) || 0), 0);
  const avgProtein = Math.round(totalProteinSum / totalDays);
  const daysHitTarget = weeklySummaries.filter(s => (Number(s.consumedProteinG) || 0) >= (Number(s.targetProteinG) || targetProteinG)).length;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              7-Day Nutrition Insights
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Daily protein progress &amp; consistency
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl">
          <Award className="w-3.5 h-3.5" />
          <span>{daysHitTarget}/{totalDays} Days Achieved</span>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
            Avg Intake
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {avgProtein}g
          </span>
          <span className="text-[10px] text-slate-500 block">per day</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
            Success Rate
          </span>
          <span className="text-xl font-black text-emerald-600">
            {Math.round((daysHitTarget / totalDays) * 100)}%
          </span>
          <span className="text-[10px] text-slate-500 block">target adherence</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
            Daily Goal
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {targetProteinG}g
          </span>
          <span className="text-[10px] text-slate-500 block">protein/day</span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="space-y-2 pt-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
          Daily Intake vs Goal
        </span>
        <div className="grid grid-cols-7 gap-1.5 items-end h-28 pt-4">
          {weeklySummaries.map((summary, idx) => {
            const consumed = Number(summary.consumedProteinG) || 0;
            const target = Number(summary.targetProteinG) || targetProteinG;
            const percent = Math.min(100, Math.round((consumed / target) * 100));
            const dateObj = new Date(summary.dateIST);
            const dayLabel = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-US', { weekday: 'narrow' }) : `D${idx+1}`;

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {consumed}g
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-20 flex items-end overflow-hidden p-0.5">
                  <div
                    style={{ height: `${percent}%` }}
                    className={`w-full rounded-t transition-all duration-500 ${
                      percent >= 100 ? 'bg-emerald-500' : 'bg-emerald-400/80'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-1">
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
