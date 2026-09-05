import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { 
  Award, 
  Sparkles, 
  Check, 
  Gift, 
  Flame, 
  Zap, 
  Clock, 
  Search, 
  Store, 
  Ticket, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

const FILTER_CATEGORIES = [
  'All Rewards',
  'Food & Dining',
  'Fitness',
  'Entertainment',
  'Hostel Essentials',
  'Shopping'
];

export const RewardsSection = () => {
  const { user } = useAuth();
  const { 
    currentUser, 
    rewardPoints = 0, 
    claimPartnerReward 
  } = useApp();

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Rewards');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Claiming state
  const [claimingId, setClaimingId] = useState(null);
  const [claimedVoucher, setClaimedVoucher] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const studentPoints = Number(currentUser?.rewardPoints ?? rewardPoints ?? 0);

  // REAL-TIME FIRESTORE LISTENER ON /rewards (where isActive == true and totalVouchers > claimedCount)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = db.subscribeActiveRewards((activeList) => {
      setRewards(activeList || []);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClaim = async (reward) => {
    const rId = reward.rewardId || reward.id;
    if (claimingId) return;

    const pointsReq = Number(reward.pointsRequired || reward.points || 0);
    if (studentPoints < pointsReq) {
      showToast(`You need ${pointsReq - studentPoints} more Health Points to claim this reward.`, 'error');
      return;
    }

    setClaimingId(rId);
    try {
      const redemption = await claimPartnerReward(reward);
      if (redemption) {
        setClaimedVoucher(redemption);
        showToast(`Reward claimed! Show code ${redemption.voucherCode} at counter.`);
      }
    } catch (err) {
      showToast(err.message || 'Could not claim reward.', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  // Filter rewards by category & search query
  const filteredRewards = rewards.filter((r) => {
    const matchesCat = 
      activeCategory === 'All Rewards' || 
      r.category === activeCategory ||
      (activeCategory === 'Fitness' && (r.category === 'Gym & Fitness' || r.category === 'Gym Fuel')) ||
      (activeCategory === 'Food & Dining' && (r.category === 'Nutrition' || r.category === 'Probiotic'));

    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !searchLower ||
      (r.title && r.title.toLowerCase().includes(searchLower)) ||
      (r.vendorName && r.vendorName.toLowerCase().includes(searchLower)) ||
      (r.description && r.description.toLowerCase().includes(searchLower));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-black text-white ${
            toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}>
            {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_CATEGORIES.map((category) => {
            const isSelected = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search offers or vendors..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-emerald-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* LIVE REWARDS GRID */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading live vendor rewards from Firestore...</p>
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <Gift className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No Live Rewards in this Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Check back soon! Partner hotels, cafes, and gyms in Crossing Republik frequently publish new student deals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRewards.map((reward) => {
            const rId = reward.rewardId || reward.id;
            const pointsReq = Number(reward.pointsRequired || reward.points || 0);
            const canAfford = studentPoints >= pointsReq;
            const isClaiming = claimingId === rId;
            const pointsDiff = pointsReq - studentPoints;
            const progressPercent = Math.min(100, Math.round((studentPoints / pointsReq) * 100));

            const totalVouchers = Number(reward.totalVouchers || 50);
            const claimedCount = Number(reward.claimedCount || 0);
            const remainingVouchers = Math.max(0, totalVouchers - claimedCount);

            return (
              <div
                key={rId}
                className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Reward Card Image & Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={reward.imageUrl || reward.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"} 
                      alt={reward.title || reward.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>

                    {/* Category Tag */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                      {reward.category || 'Special Offer'}
                    </span>

                    {/* Stock Pill */}
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                      {remainingVouchers} left
                    </span>

                    {/* Points Requirement Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
                      <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>⚡ {pointsReq} Points Required</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    
                    {/* Vendor Name & Logo */}
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-white flex-shrink-0">
                        <img 
                          src={reward.vendorLogo || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300"} 
                          alt={reward.vendorName || "Merchant"} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="text-xs font-black text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                        <span>{reward.vendorName || "ABES Campus Partner"}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {reward.title || reward.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {reward.description}
                    </p>

                    {/* Expiry Pill */}
                    {reward.expiryDate && (
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Valid until {reward.expiryDate}</span>
                      </div>
                    )}

                  </div>
                </div>

                {/* Footer Action & Progress */}
                <div className="p-4 sm:p-5 pt-0 space-y-2">
                  
                  {/* If user lacks points: show progress bar */}
                  {!canAfford && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-slate-400">
                        <span>Balance: {studentPoints} / {pointsReq} pts</span>
                        <span className="text-amber-500">Need {pointsDiff} more</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Claim Reward Button */}
                  <button
                    onClick={() => handleClaim(reward)}
                    disabled={!canAfford || isClaiming}
                    className={`w-full py-2.5 sm:py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                      canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.02] cursor-pointer'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Claiming Voucher...</span>
                      </>
                    ) : canAfford ? (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>CLAIM REWARD</span>
                      </>
                    ) : (
                      <span>Need {pointsDiff} More Points</span>
                    )}
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTANT CLAIM VOUCHER MODAL */}
      {/* ========================================================================= */}
      {claimedVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-500/40 p-6 sm:p-7 space-y-5 text-center relative">
            
            <button
              onClick={() => setClaimedVoucher(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <Ticket className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Reward Voucher Active
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {claimedVoucher.rewardTitle || 'Vendor Reward'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Show this 6-character code or QR pass at the <span className="font-bold text-slate-800 dark:text-slate-200">{claimedVoucher.vendorName || 'partner'}</span> counter to redeem your discount.
              </p>
            </div>

            {/* QR / Voucher Code Pass */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 shadow-inner">
              <div className="w-32 h-32 mx-auto bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                <QrCode className="w-28 h-28 text-slate-900" />
              </div>

              {/* 6-DIGIT CODE DISPLAY */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Redemption Voucher Code
                </span>
                <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-wider select-all mt-0.5">
                  {claimedVoucher.voucherCode || claimedVoucher.claimCode}
                </p>
              </div>

              {claimedVoucher.discountCode && (
                <div className="flex items-center justify-between text-xs px-2 font-semibold text-slate-500 dark:text-slate-400">
                  <span>Merchant Promo Code:</span>
                  <span className="font-mono font-black text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {claimedVoucher.discountCode}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Valid for 30 days. Single-use student voucher.</span>
            </div>

            <button
              onClick={() => setClaimedVoucher(null)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Done & Save Voucher
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
