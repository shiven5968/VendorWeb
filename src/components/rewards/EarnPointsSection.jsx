import React from 'react';
import { 
  CalendarCheck, 
  Star, 
  Vote, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { getCollegeDateString } from '../../utils/dateTime.js';

export const EarnPointsSection = ({
  rewardEvents = [],
  onNavigateToRating,
  onNavigateToVoting
}) => {
  const todayStr = getCollegeDateString();

  // Check if today's login reward is already claimed
  const loginClaimedToday = (rewardEvents || []).some(
    evt => evt.type === 'LOGIN' && (evt.date === todayStr || (evt.createdAt && evt.createdAt.startsWith(todayStr)))
  );

  // Count meal ratings submitted today
  const ratingsTodayCount = (rewardEvents || []).filter(
    evt => evt.type === 'MEAL_RATING' && (evt.date === todayStr || (evt.createdAt && evt.createdAt.startsWith(todayStr)))
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>How to Earn Health Points</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Strict, transparent rules validated directly by backend transaction logic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* 1. Daily Login (+2 HP) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                +2 HP
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">Daily College Login</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Log in to MessMates each day. Awarded automatically once per calendar day (Asia/Kolkata timezone).
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {loginClaimedToday ? (
              <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Claimed for Today</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Awarded on sign-in</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold">1x / day</span>
          </div>
        </div>

        {/* 2. Meal Rating (+1 HP) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-50 text-amber-700 border border-amber-200/60">
                +1 HP
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">Meal Rating Review</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Submit an authentic food quality rating during active dining hours for Breakfast, Lunch, Snacks, or Dinner.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              {ratingsTodayCount > 0 ? `${ratingsTodayCount} rated today (+${ratingsTodayCount} HP)` : 'Available during meal times'}
            </span>
            {onNavigateToRating && (
              <button
                onClick={onNavigateToRating}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-black flex items-center gap-0.5 cursor-pointer"
              >
                <span>Rate Live</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Civic Dish Voting (0 HP) */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                <Vote className="w-5 h-5 text-slate-600" />
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-200 text-slate-700 border border-slate-300">
                0 HP (Civic)
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">Weekly Dish Polls</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Vote for upcoming special dishes. To protect election integrity and avoid spam, voting awards strictly 0 points.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Civic Participation</span>
            {onNavigateToVoting && (
              <button
                onClick={onNavigateToVoting}
                className="text-xs text-slate-700 hover:text-slate-900 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Go to Polls</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
