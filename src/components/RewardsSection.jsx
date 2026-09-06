import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useApp } from '../context/AppContext';
import { 
  Tag, 
  Store, 
  Sparkles, 
  Check, 
  Gift, 
  AlertCircle, 
  Loader2, 
  Ticket, 
  QrCode, 
  X, 
  Copy, 
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

/**
 * Helper to safely extract milliseconds from either a Firestore Timestamp or an ISO string
 */
const toMillis = (val) => {
  if (!val) return 0;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (val.seconds) return val.seconds * 1000;
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
};

export const RewardsSection = () => {
  const { currentUser, rewardPoints, addNotification } = useApp();
  
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Claim state
  const [claimingId, setClaimingId] = useState(null);
  const [claimedVoucher, setClaimedVoucher] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [retryKey, setRetryKey] = useState(0);

  // Real-time Firestore subscription to /rewards (live Partner Hub integration)
  useEffect(() => {
    setLoading(true);
    setError(null);

    let unsubscribe = null;

    try {
      const rewardsCol = collection(db, 'rewards');

      unsubscribe = onSnapshot(
        rewardsCol,
        (snapshot) => {
          const items = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Filter: deal must be active and not expired
            const isExplicitlyInactive = data.isActive === false || data.status === 'INACTIVE';
            if (isExplicitlyInactive) return;

            if (data.expiryDate) {
              try {
                const exp = new Date(data.expiryDate);
                if (!isNaN(exp.getTime()) && exp < today) {
                  return; // Expired
                }
              } catch (e) {}
            }

            items.push({ id: docSnap.id, ...data });
          });

          // Sort client-side by createdAt descending (newest deals first)
          items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
          setRewards(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn('Firestore /rewards live listener notice:', err.message);
          setError('Unable to load live vendor rewards at this time.');
          setLoading(false);
        }
      );
    } catch (e) {
      console.error('Setup listener exception:', e);
      setError('Unable to load live vendor rewards at this time.');
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [retryKey]);

  // Claim offer handler
  const handleClaimOffer = async (offer) => {
    if (!currentUser) {
      if (addNotification) {
        addNotification('Please Log In', 'You must be logged in as a student to claim offers.', 'warning');
      }
      return;
    }

    const pointsCost = Number(offer.pointsRequired) || 0;
    if (rewardPoints < pointsCost) {
      if (addNotification) {
        addNotification('Insufficient Points', `You need ${pointsCost - rewardPoints} more points to claim this offer.`, 'warning');
      }
      return;
    }

    const remainingStock = Math.max(0, (Number(offer.totalVouchers) || 50) - (Number(offer.claimedCount) || 0));
    if (remainingStock <= 0) {
      if (addNotification) {
        addNotification('Offer Out of Stock', 'All vouchers for this offer have been claimed.', 'warning');
      }
      return;
    }

    setClaimingId(offer.id);

    try {
      const redemptionId = 'red_' + Date.now();
      const voucherCode = 'MM-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      const studentId = currentUser.uid || currentUser.id;

      // 1. Atomically increment claimedCount on reward doc
      const rewardRef = doc(db, 'rewards', offer.id);
      await updateDoc(rewardRef, {
        claimedCount: increment(1)
      });

      // 2. Create redemption record in /redemptions collection
      const redemptionRef = doc(db, 'redemptions', redemptionId);
      const redemptionData = {
        id: redemptionId,
        studentId,
        userId: studentId,
        studentName: currentUser.name || 'Student',
        studentAdmissionNumber: currentUser.admissionNumber || '',
        rewardId: offer.id,
        rewardTitle: offer.title,
        rewardName: offer.title, // Backward compatibility
        vendorId: offer.vendorId || 'vendor_partner',
        vendorName: offer.vendorName || 'Partner Vendor',
        discountCode: offer.discountCode || voucherCode,
        voucherCode,
        claimCode: voucherCode,  // Backward compatibility
        pointsSpent: pointsCost,
        status: 'ACTIVE',
        claimedAt: serverTimestamp(),
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        expiryDate: offer.expiryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
      };
      await setDoc(redemptionRef, redemptionData);

      // 3. Atomically deduct points from student user doc
      try {
        const userRef = doc(db, 'users', studentId);
        await updateDoc(userRef, {
          rewardPoints: increment(-pointsCost),
          updatedAt: serverTimestamp()
        });
      } catch (userPointsErr) {
        console.warn('Student points deduction notice:', userPointsErr.message);
      }

      // 4. Update local state and offline persistence
      try {
        const localReds = (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('messmates_launch_redemptions') || '[]')) || [];
        localReds.unshift(redemptionData);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('messmates_launch_redemptions', JSON.stringify(localReds));
        }
      } catch (e) {}

      if (currentUser) {
        currentUser.rewardPoints = Math.max(0, (currentUser.rewardPoints || 0) - pointsCost);
      }

      // Show voucher dialog
      setClaimedVoucher({
        ...redemptionData,
        offerImage: offer.imageUrl || offer.image,
        vendorLogo: offer.vendorLogo
      });

      if (addNotification) {
        addNotification('Offer Claimed! 🎉', `Voucher ${voucherCode} is ready to redeem at ${offer.vendorName || 'the counter'}.`, 'success');
      }
    } catch (err) {
      console.error('Error claiming offer:', err);
      if (addNotification) {
        addNotification('Claim Failed', err.message || 'Could not claim this reward.', 'error');
      }
    } finally {
      setClaimingId(null);
    }
  };

  // Copy code helper
  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Categories list
  const categories = ['All', ...new Set(rewards.map(r => r.category).filter(Boolean))];

  // Filtered rewards list
  const filteredRewards = selectedCategory === 'All' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header & Category Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Campus Vendor Offers
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Partner Deals & Discounts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Redeem your earned MessMate health points for exclusive discounts at local cafes, gyms, and stores.
          </p>
        </div>

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Syncing live rewards from Firestore...</p>
        </div>
      )}

      {/* Error Notice */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setRetryKey(k => k + 1)}
            className="px-3 py-1 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRewards.length === 0 && (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3 shadow-sm">
          <Store className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
            No active partner offers available right now
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When campus merchants publish new combos and discounts in their portal, they will automatically appear here in real time!
          </p>
        </div>
      )}

      {/* Offers Grid */}
      {!loading && filteredRewards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRewards.map((offer) => {
            const pointsCost = Number(offer.pointsRequired) || 0;
            const canAfford = (rewardPoints || 0) >= pointsCost;
            const totalStock = Number(offer.totalVouchers) || 50;
            const claimedCount = Number(offer.claimedCount) || 0;
            const remaining = Math.max(0, totalStock - claimedCount);
            const isClaiming = claimingId === offer.id;
            const isOutOfStock = remaining <= 0;

            return (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-emerald-500/40 transition-all group"
              >
                <div>
                  {/* Image / Header Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={offer.imageUrl || offer.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600'}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    
                    {/* Category pill */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span>{offer.category || 'Deal'}</span>
                    </span>

                    {/* Points Tag */}
                    <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-600/40 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{pointsCost} pts</span>
                    </span>

                    {/* Vendor Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                      {offer.vendorLogo ? (
                        <img 
                          src={offer.vendorLogo} 
                          alt={offer.vendorName} 
                          className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className="text-xs font-extrabold text-white drop-shadow-md truncate max-w-[150px]">
                        {offer.vendorName || 'Partner'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {offer.description || 'Exclusive student reward voucher valid at merchant counter.'}
                    </p>

                    {/* Meta info */}
                    <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Valid till: {offer.expiryDate || 'Active'}</span>
                      </span>
                      <span className={`${remaining <= 5 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                        {remaining} left
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleClaimOffer(offer)}
                    disabled={!canAfford || isClaiming || isOutOfStock}
                    className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 transition-all shadow-md ${
                      isOutOfStock
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-[0.98]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Voucher...</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>Sold Out</span>
                    ) : canAfford ? (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>CLAIM FOR {pointsCost} PTS</span>
                      </>
                    ) : (
                      <span>Need {pointsCost - (rewardPoints || 0)} more pts</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claimed Voucher Modal Dialog */}
      {claimedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center relative animate-in zoom-in-95">
            <button
              onClick={() => setClaimedVoucher(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Ticket className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Reward Successfully Claimed
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {claimedVoucher.rewardTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Show this voucher QR or code at <strong className="text-slate-700 dark:text-slate-200">{claimedVoucher.vendorName}</strong>
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(claimedVoucher.voucherCode)}`}
                alt="Voucher QR Code"
                className="w-40 h-40 mx-auto rounded-xl shadow-inner bg-white p-2"
              />
              <span className="text-[10px] text-slate-400 font-bold block mt-2">
                Scan by Vendor to Redeem
              </span>
            </div>

            {/* Voucher Code Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Voucher Code</span>
                <span className="text-base font-black tracking-widest text-emerald-800 dark:text-emerald-200 font-mono">
                  {claimedVoucher.voucherCode}
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(claimedVoucher.voucherCode)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm border border-emerald-200 dark:border-emerald-700 flex items-center space-x-1 hover:bg-emerald-50"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setClaimedVoucher(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-black transition-all"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsSection;
