import React from 'react';
import { useApp } from '../context/AppContext';
import { Tag, Sparkles, Clock, Check } from 'lucide-react';

export const HealthyRewardsPage = () => {
  const { restaurantVouchers, rewardPoints, redeemReward } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/20 mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Student Partner Discount Vouchers</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Healthy Restaurant Vouchers</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Redeem your accumulated health points for exclusive promo coupons at partner healthy restaurants & juice bars.
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white border border-emerald-500/30 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Points Balance</span>
          <p className="text-2xl font-black text-emerald-400">{rewardPoints} Pts</p>
        </div>
      </div>

      {/* Restaurant Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurantVouchers.map(voucher => (
          <div
            key={voucher.id}
            className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden">
                <img src={voucher.image} alt={voucher.restaurantName} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                  {voucher.restaurantName}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{voucher.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{voucher.desc}</p>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{voucher.validity}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{voucher.points} Pts</span>
              <button
                onClick={() => redeemReward(voucher)}
                disabled={rewardPoints < voucher.points}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  rewardPoints >= voucher.points
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {rewardPoints >= voucher.points ? 'Redeem Coupon' : 'Need Points'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
