import React from 'react';
import { useApp } from '../context/AppContext';
import { Gift, Award, Check } from 'lucide-react';

export const HealthyRewardsPage = () => {
  const { rewardPoints, rewardsCatalog, userRedemptions, redeemReward } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Health Points Store</h1>
          <p className="text-xs text-slate-500 font-semibold">Earn points by rating meals (+20) & voting (+30)</p>
        </div>

        <div className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white border border-emerald-500/30 text-center shadow-md">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">Balance</span>
          <p className="text-xl font-black text-white">{rewardPoints} Pts</p>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewardsCatalog.map(item => {
          const canRedeem = rewardPoints >= item.points;

          return (
            <div
              key={item.id}
              className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block pt-1">
                    {item.points} Points
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => redeemReward(item)}
                  disabled={!canRedeem}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                    canRedeem
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? 'Redeem Item' : 'Need More Points'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claimed Redemptions History */}
      {userRedemptions.length > 0 && (
        <div className="pt-4 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            My Claimed Vouchers ({userRedemptions.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userRedemptions.map(red => (
              <div key={red.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{red.rewardName}</h4>
                  <span className="text-[10px] text-slate-400">Claim Code: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{red.claimCode}</strong></span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  {red.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
