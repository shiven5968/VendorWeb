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
  ChevronRight,
  Crown
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
      
      {/* ── TOP VIP GOLDEN HEADER (TEXT REMOVED & LUXURY GOLD PALETTE) ────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-300/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 text-amber-950 flex items-center justify-center shadow-sm shrink-0">
              <Crown className="w-6 h-6 fill-amber-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-2xs">
                  VIP Dining Deals
                </span>
                <span className="text-[11px] font-bold text-amber-700">10%–15% OFF Bill</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Crossings Republik &amp; Campus Dining Vouchers
              </h2>
            </div>
          </div>

          {/* Quick Search Bar with Golden Focus */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurant (CSB, Tandoori...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-amber-300/80 bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* ── UNIFIED ALL-OFFERS GRID WITH GOLDEN ACCENTS ─────────────────────── */}
      {filteredDeals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
          <UtensilsCrossed className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-black text-slate-700">No Matching Restaurants Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for "CSB", "Tandoori Night", "Rolls King", or clear your search query to view all spots.
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
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Subtle top golden glow line on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3.5">
                  
                  {/* Top: Restaurant Name, Location & Points Cost */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-amber-950 transition-colors leading-tight">
                          {deal.vendorName}
                        </h3>
                        {deal.discountPercent && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-[10px] font-black uppercase shadow-2xs">
                            {deal.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                      {deal.location && (
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{deal.location}</span>
                        </span>
                      )}
                    </div>

                    <span className="px-3 py-1.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-900 text-xs font-black border border-amber-300 shrink-0 shadow-2xs">
                      ⭐ {cost} HP
                    </span>
                  </div>

                  {/* Main Offer Title */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>{deal.title}</span>
                    </span>
                    {deal.exampleSavings && (
                      <p className="text-[11px] text-amber-900/90 font-bold">
                        💰 {deal.exampleSavings}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {deal.description}
                  </p>

                  {/* Stock & Validity */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{deal.expiryDate ? `Valid till ${deal.expiryDate}` : 'Limited period'}</span>
                    </span>
                    <span className="text-amber-700 font-bold">
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
                        : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white shadow-sm'
                    }`}
                  >
                    {!canAfford ? (
                      <span>Need {cost - rewardPoints} More HP to Redeem</span>
                    ) : remainingStock <= 0 ? (
                      <span>Vouchers Sold Out</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Claim Dine-in Voucher ({cost} HP)</span>
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
