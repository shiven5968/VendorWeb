import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Tag, QrCode, Clock, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RewardClaimModal = () => {
  const { claimedRewardModal, setClaimedRewardModal } = useApp();

  useEffect(() => {
    if (claimedRewardModal) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [claimedRewardModal]);

  if (!claimedRewardModal) return null;

  const voucher = claimedRewardModal;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden text-center relative p-6 space-y-5 animate-in zoom-in-95 duration-200">
        
        <button
          onClick={() => setClaimedRewardModal(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
          <Tag className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 mb-2">
            Reward Claimed
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{voucher.rewardName || 'Mess Reward'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Show this claim code at the mess counter for redemption.</p>
        </div>

        {/* Voucher Promo Pass */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-inner border flex items-center justify-center">
            <QrCode className="w-28 h-28 text-slate-900" />
          </div>
          
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Claim Code</span>
            <p className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-wider select-all">{voucher.claimCode || voucher.code}</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{voucher.validity || 'Valid for 30 days online & offline'}</span>
        </div>

        <button
          onClick={() => setClaimedRewardModal(null)}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          Done & Return to Vouchers
        </button>

      </div>
    </div>
  );
};
