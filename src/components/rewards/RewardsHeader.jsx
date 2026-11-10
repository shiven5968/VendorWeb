import React from 'react';
import { 
  Award, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Gift, 
  HelpCircle, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { getCollegeDateString } from '../../utils/dateTime.js';

export const RewardsHeader = ({
  currentUser,
  rewardPoints = 0,
  rewardEvents = [],
  userRedemptions = [],
  onOpenHowToEarn
}) => {
  const todayStr = getCollegeDateString();
  const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'

  // Points earned today
  const pointsToday = (rewardEvents || [])
    .filter(evt => evt.date === todayStr || (evt.createdAt && evt.createdAt.startsWith(todayStr)))
    .reduce((sum, evt) => sum + (Number(evt.points) || 0), 0);

  // Points earned this month
  const pointsThisMonth = (rewardEvents || [])
    .filter(evt => (evt.date && evt.date.startsWith(currentMonthStr)) || (evt.createdAt && evt.createdAt.startsWith(currentMonthStr)))
    .reduce((sum, evt) => sum + (Number(evt.points) || 0), 0);

  // Points redeemed lifetime
  const pointsRedeemed = (userRedemptions || [])
    .reduce((sum, red) => sum + (Number(red.pointsSpent || red.points) || 0), 0);

  // Milestone Tiers: 25 -> 50 -> 100 -> 250 -> 500 -> 1000
  const MILESTONES = [
    { target: 25, label: 'Bronze Perk' },
    { target: 50, label: 'Silver Perk' },
    { target: 100, label: 'Gold Perk' },
    { target: 250, label: 'Platinum Elite' },
    { target: 500, label: 'Diamond Campus Member' }
  ];

  const nextMilestone = MILESTONES.find(m => m.target > rewardPoints) || { target: 1000, label: 'Master Perk' };
  const prevMilestoneTarget = MILESTONES.slice().reverse().find(m => m.target <= rewardPoints)?.target || 0;
  
  const milestoneProgress = Math.min(
    100, 
    Math.max(0, Math.round(((rewardPoints - prevMilestoneTarget) / (nextMilestone.target - prevMilestoneTarget)) * 100))
  );

  return (
    <div className="space-y-4">
      {/* ── 1. MAIN HEALTH POINTS HERO ──────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-xl relative overflow-hidden">
        
        {/* Subtle Decorative Accents */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-56 h-56 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: User Identity & Description */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 text-emerald-100 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified Campus Rewards</span>
              </span>
              <span className="text-[11px] text-emerald-200/80 font-medium">
                Official Health Points Ledger
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentUser?.name || 'Student Athlete'}
            </h1>

            <p className="text-xs text-emerald-100/90 max-w-lg leading-relaxed">
              Earn Health Points by rating campus dining meals and logging in every day. Redeem your points for exclusive discounts at trusted campus cafes and vendors.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={onOpenHowToEarn}
                className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 border border-white/20 shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>How to Earn Points</span>
              </button>
            </div>
          </div>

          {/* Right: Balance Pill & Milestone Ring */}
          <div className="bg-black/25 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/15 text-center md:text-right min-w-[220px] space-y-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest block">
                Available Health Points
              </span>
              <div className="flex items-baseline justify-center md:justify-end space-x-1.5 mt-0.5">
                <span className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                  {rewardPoints}
                </span>
                <span className="text-sm font-bold text-emerald-200">HP</span>
              </div>
            </div>

            {/* Next Milestone Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 text-left">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-200">
                <span>Next: {nextMilestone.label}</span>
                <span>{nextMilestone.target - rewardPoints} HP needed</span>
              </div>
              <div className="w-full bg-white/15 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. TRUSTED LEDGER SUMMARY METRIC TILES ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
            Current Balance
          </span>
          <span className="text-2xl font-black text-slate-900 flex items-baseline space-x-1">
            <span>{rewardPoints}</span>
            <span className="text-xs text-slate-400 font-bold">HP</span>
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">verified balance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
            Earned Today
          </span>
          <span className="text-2xl font-black text-emerald-600 flex items-baseline space-x-1">
            <span>+{pointsToday}</span>
            <span className="text-xs text-slate-400 font-bold">HP</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">today in IST</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
            This Month
          </span>
          <span className="text-2xl font-black text-slate-900 flex items-baseline space-x-1">
            <span>+{pointsThisMonth}</span>
            <span className="text-xs text-slate-400 font-bold">HP</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">calendar month</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
            Total Redeemed
          </span>
          <span className="text-2xl font-black text-slate-900 flex items-baseline space-x-1">
            <span>{pointsRedeemed}</span>
            <span className="text-xs text-slate-400 font-bold">HP</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{(userRedemptions || []).length} vouchers claimed</span>
        </div>
      </div>
    </div>
  );
};
