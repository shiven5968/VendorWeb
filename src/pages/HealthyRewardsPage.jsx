import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  Sparkles, 
  History, 
  ChevronRight,
  ShieldCheck,
  Star,
  Vote,
  CalendarCheck,
  Store,
  Ticket
} from 'lucide-react';
import { RewardsSection } from '../components/RewardsSection';

export const HealthyRewardsPage = () => {
  const { 
    currentUser, 
    rewardPoints, 
    userRedemptions, 
    rewardEvents 
  } = useApp();

  const [activeTab, setActiveTab] = useState('partner');

  const formatRedemptionDate = (red) => {
    try {
      if (red.claimedAt?.toDate) return red.claimedAt.toDate().toLocaleDateString();
      if (red.claimedAt) return new Date(red.claimedAt).toLocaleDateString();
      if (red.timestamp) return new Date(red.timestamp).toLocaleDateString();
      if (red.createdAt) return new Date(red.createdAt).toLocaleDateString();
    } catch (e) {}
    return 'Recently';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header & Balance Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-300" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">Health Points Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{currentUser?.name || 'Student'}</h1>
          <p className="text-xs text-emerald-100 font-medium">
            Earn points by actively rating mess meals and logging in daily.
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center sm:text-right w-full sm:w-auto">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Available Balance</span>
          <span className="text-3xl sm:text-4xl font-black text-amber-300">{rewardPoints}</span>
          <span className="text-xs font-bold text-emerald-100 block">Health Points</span>
        </div>
      </div>

      {/* Official Rules Info Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white">+1 Point</span>
            <p className="text-[10px] text-slate-500 font-semibold">Per valid submitted meal review</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white">+2 Points</span>
            <p className="text-[10px] text-slate-500 font-semibold">Daily login (once per calendar day)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('partner')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'partner'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4 text-emerald-500" />
          <span>Live Partner Deals</span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'ledger'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Points Ledger ({(rewardEvents || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>My Redemptions ({(userRedemptions || []).length})</span>
        </button>
      </div>

      {/* Tab: Live Partner Deals (Real-time Firestore) */}
      {activeTab === 'partner' && (
        <RewardsSection />
      )}

      {/* Tab: Points Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          {(rewardEvents || []).length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-base font-black text-slate-700 dark:text-slate-200">No reward events logged yet.</p>
              <p>Earn points by logging in daily (+2 pts) and rating today's meals (+1 pt)!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewardEvents.map((evt) => {
                const getEventIcon = () => {
                  if (evt.type === 'LOGIN') return <CalendarCheck className="w-4 h-4 text-emerald-500" />;
                  if (evt.type === 'MEAL_RATING') return <Star className="w-4 h-4 fill-amber-500 text-amber-500" />;
                  if (evt.type === 'VOTE') return <Vote className="w-4 h-4 text-purple-500" />;
                  return <Award className="w-4 h-4 text-teal-500" />;
                };

                const getEventTitle = () => {
                  if (evt.type === 'LOGIN') return 'Daily College Login';
                  if (evt.type === 'MEAL_RATING') return evt.description ? `Meal Rating: ${evt.description}` : 'Meal Rating Review';
                  if (evt.type === 'VOTE') return evt.description || 'Weekly Dish Feedback';
                  return evt.description || 'Health Reward Points';
                };

                return (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        {getEventIcon()}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {getEventTitle()}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {evt.date || (evt.createdAt ? new Date(evt.createdAt).toLocaleDateString() : 'Today')}
                          {evt.createdAt && ` • ${new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-3">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/20 inline-block">
                        +{evt.points} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {(userRedemptions || []).length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              You have not claimed any rewards yet.
            </div>
          ) : (
            <div className="space-y-3">
              {userRedemptions.map((red) => {
                const code = red.voucherCode || red.claimCode || red.code || red.id;
                const title = red.rewardTitle || red.rewardName || 'Vendor Reward';
                const dateStr = formatRedemptionDate(red);
                const points = red.pointsSpent ?? red.points ?? 0;

                return (
                  <div
                    key={red.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                            {code}
                          </span>
                          {red.vendorName && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold truncate">
                              {red.vendorName}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Claimed on {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1 flex-shrink-0 pl-3">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20 block">
                        {red.status || 'ACTIVE'}
                      </span>
                      <span className="text-xs text-slate-400 font-bold block">-{points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
