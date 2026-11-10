import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  UtensilsCrossed, 
  Search, 
  Tag, 
  Clock, 
  Sparkles, 
  Check, 
  Ticket, 
  MapPin,
  AlertCircle,
  Percent,
  ChevronRight
} from 'lucide-react';
import { DEFAULT_PARTNER_DEALS } from '../../data/partnerDeals.js';

export const PartnerMarketplace = ({
  rewardPoints = 0,
  onSelectOfferForRedemption
}) => {
  const [deals, setDeals] = useState(DEFAULT_PARTNER_DEALS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time Firestore sync with fallback
  useEffect(() => {
    let unsubscribe = null;
    try {
      const colRef = collection(db, 'rewards');
      unsubscribe = onSnapshot(
        colRef,
        (snap) => {
          if (!snap.empty) {
            const list = [];
            snap.forEach(docSnap => {
              const data = docSnap.data();
              if (data.isActive !== false && data.status !== 'INACTIVE') {
                list.push({ id: docSnap.id, ...data });
              }
            });
            if (list.length > 0) {
              setDeals(list);
            }
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Firestore rewards stream note:', err.message);
          setLoading(false);
        }
      );
    } catch (e) {
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filter deals based on search
  const filteredDeals = deals.filter(deal => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = (deal.title || '').toLowerCase().includes(q);
    const matchVendor = (deal.vendorName || '').toLowerCase().includes(q);
    const matchLocation = (deal.location || '').toLowerCase().includes(q);
    const matchDesc = (deal.description || '').toLowerCase().includes(q);
    return matchTitle || matchVendor || matchLocation || matchDesc;
  });

  return (
    <div className="space-y-5">
      
      {/* ── TOP HEADER & EXPLANATION ────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
              <span>Campus &amp; Crossings Republik Dining Vouchers</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Dine in at real restaurants near ABES &amp; Crossings. Show your voucher at billing to get 10%–15% off your total food bill!
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurant (CSB, Tandoori...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Real-world How it Works Note */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center space-x-2.5 text-xs text-emerald-900 font-semibold">
          <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>How It Works:</strong> If your dining bill is ₹1,200 and you have a 10% voucher, you pay only <strong>₹1,080</strong> at the counter—saving ₹120 instantly!
          </span>
        </div>
      </div>

      {/* ── UNIFIED ALL-OFFERS GRID (NO CONFUSING CATEGORY PILLS) ───────────── */}
      {filteredDeals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
          <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-700">No Matching Restaurants Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for "CSB", "Tandoori Night", "Rolls King", or clear your search query to see all restaurants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDeals.map(deal => {
            const cost = Number(deal.pointsRequired || deal.points) || 0;
            const canAfford = (rewardPoints || 0) >= cost;
            const totalStock = Number(deal.totalVouchers) || 50;
            const claimed = Number(deal.claimedCount) || 0;
            const remainingStock = Math.max(0, totalStock - claimed);

            return (
              <div
                key={deal.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-400 shadow-xs transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  
                  {/* Top: Restaurant Name & Points Cost */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-tight">
                        {deal.vendorName}
                      </h3>
                      {deal.location && (
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{deal.location}</span>
                        </span>
                      )}
                    </div>

                    <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200/80 shrink-0 shadow-2xs">
                      {cost} HP
                    </span>
                  </div>

                  {/* Main Offer Title */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{deal.title}</span>
                    </span>
                    {deal.exampleSavings && (
                      <p className="text-[11px] text-slate-600 font-bold">
                        💰 {deal.exampleSavings}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {deal.description}
                  </p>

                  {/* Stock & Validity */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{deal.expiryDate ? `Valid till ${deal.expiryDate}` : 'Limited period'}</span>
                    </span>
                    <span className="text-slate-500">
                      {remainingStock} vouchers left
                    </span>
                  </div>
                </div>

                {/* Redeem Voucher Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectOfferForRedemption(deal)}
                    disabled={!canAfford || remainingStock <= 0}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      !canAfford
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : remainingStock <= 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {!canAfford ? (
                      <span>Need {cost - rewardPoints} More HP to Redeem</span>
                    ) : remainingStock <= 0 ? (
                      <span>Vouchers Sold Out</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Get Dine-in Voucher ({cost} HP)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
