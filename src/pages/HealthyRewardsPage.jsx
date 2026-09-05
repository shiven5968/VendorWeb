import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  Sparkles, 
  Check, 
  Gift, 
  Flame, 
  History, 
  ChevronRight,
  ShieldCheck,
  Star,
  Vote,
  CalendarCheck
} from 'lucide-react';
import { RewardsSection } from '../components/RewardsSection';

export const HealthyRewardsPage = () => {
  const { 
    currentUser, 
    rewardPoints, 
    rewardsCatalog, 
    userRedemptions, 
    redeemReward 
  } = useApp();

  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedReward, setSelectedReward] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimNotice, setClaimNotice] = useState(null);

  const handleClaim = async (reward) => {
    if (claiming || rewardPoints < reward.points) return;
    try {
      setClaiming(true);
      setClaimNotice(null);
      const ok = await redeemReward(reward);
      if (ok) {
        setClaimNotice({ type: 'success', text: `Claimed ${reward.name}! Show claim code at mess counter.` });
        setSelectedReward(null);
      }
    } catch (e) {
      setClaimNotice({ type: 'error', text: e.message });
    } finally {
      setClaiming(false);
    }
  };

  const catalogList = rewardsCatalog && rewardsCatalog.length > 0 ? rewardsCatalog : [];

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
            Earn points by actively rating mess meals, logging in daily, and participating in monthly polls.
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center sm:text-right w-full sm:w-auto">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Available Balance</span>
          <span className="text-3xl sm:text-4xl font-black text-amber-300">{rewardPoints}</span>
          <span className="text-xs font-bold text-emerald-100 block">Health Points</span>
        </div>
      </div>

      {/* Official Rules Info Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white">+10 Points</span>
            <p className="text-[10px] text-slate-500 font-semibold">Per monthly dish replacement poll</p>
          </div>
        </div>
      </div>

      {claimNotice && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
          claimNotice.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
        }`}>
          <Check className="w-4 h-4" />
          <span>{claimNotice.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'catalog'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Mess Rewards Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>My Redemptions ({(userRedemptions || []).length})</span>
        </button>
      </div>

      {/* Tab: Catalog */}
      {activeTab === 'catalog' && (
        <RewardsSection />
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {(userRedemptions || []).length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              You have not claimed any rewards yet. Browse the rewards catalog above to claim partner discounts.
            </div>
          ) : (
            <div className="space-y-3">
              {userRedemptions.map((red) => (
                <div
                  key={red.id || red.redemptionId}
                  className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        Code: {red.voucherCode || red.claimCode}
                      </span>
                      {red.vendorName && (
                        <span className="text-[10px] font-bold text-slate-400">
                          @ {red.vendorName}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {red.rewardTitle || red.rewardName || 'Reward Voucher'}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      Claimed on {new Date(red.claimedAt || red.timestamp || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border block ${
                      red.status === 'REDEEMED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {red.status || 'ACTIVE'}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">-{red.pointsSpent} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
