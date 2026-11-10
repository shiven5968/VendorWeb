import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Star, 
  CalendarCheck, 
  Ticket, 
  Flame, 
  Crown,
  Zap,
  Info
} from 'lucide-react';

export const AchievementsSection = ({
  rewardEvents = [],
  userRedemptions = [],
  rewardPoints = 0
}) => {
  const ratingsCount = (rewardEvents || []).filter(e => e.type === 'MEAL_RATING').length;
  const loginCount = (rewardEvents || []).filter(e => e.type === 'LOGIN').length;
  const redemptionsCount = (userRedemptions || []).length;
  const lifetimePoints = (rewardEvents || []).reduce((acc, e) => acc + (Number(e.points) || 0), 0);

  const ACHIEVEMENTS_LIST = [
    {
      id: 'first_rating',
      title: 'First Taste Critic',
      description: 'Submit your first meal quality review.',
      icon: Star,
      current: ratingsCount,
      target: 1,
      category: 'Dining'
    },
    {
      id: 'active_critic',
      title: 'Active Foodie',
      description: 'Review 5 mess meals across Breakfast, Lunch, or Dinner.',
      icon: Award,
      current: ratingsCount,
      target: 5,
      category: 'Dining'
    },
    {
      id: 'campus_regular',
      title: 'Campus Regular',
      description: 'Complete 7 daily logins on MessMates.',
      icon: CalendarCheck,
      current: loginCount,
      target: 7,
      category: 'Consistency'
    },
    {
      id: 'fortnight_streak',
      title: 'Fortnight Habit',
      description: 'Achieve 14 daily logins to master campus dining awareness.',
      icon: Flame,
      current: loginCount,
      target: 14,
      category: 'Consistency'
    },
    {
      id: 'first_redemption',
      title: 'Perk Explorer',
      description: 'Claim your first campus partner discount voucher.',
      icon: Ticket,
      current: redemptionsCount,
      target: 1,
      category: 'Rewards'
    },
    {
      id: 'century_club',
      title: 'Century Club',
      description: 'Earn 100+ lifetime Health Points.',
      icon: Crown,
      current: lifetimePoints,
      target: 100,
      category: 'Milestone'
    }
  ];

  const totalUnlocked = ACHIEVEMENTS_LIST.filter(a => a.current >= a.target).length;

  return (
    <div className="space-y-4">
      
      {/* ── HEADER BANNER ───────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Campus Dining Milestones
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Visual badges recognizing student consistency and civic dining feedback.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black flex items-center space-x-1.5 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{totalUnlocked} of {ACHIEVEMENTS_LIST.length} Unlocked</span>
        </div>
      </div>

      {/* ── ACHIEVEMENTS CARDS GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS_LIST.map(item => {
          const isUnlocked = item.current >= item.target;
          const progressPct = Math.min(100, Math.round((item.current / item.target) * 100));
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                isUnlocked
                  ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                  : 'bg-slate-50 border-slate-200/80 opacity-80'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    isUnlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {isUnlocked ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>In Progress</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.description}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>Progress</span>
                  <span>{item.current} / {item.target}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium flex items-center space-x-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Campus milestones provide visual recognition for active hostellers. They do not artificially create or inflate Health Points.
        </span>
      </div>

    </div>
  );
};
