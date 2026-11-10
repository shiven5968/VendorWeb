import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  Store, 
  Search, 
  Tag, 
  Clock, 
  Sparkles, 
  Check, 
  Ticket, 
  AlertCircle,
  Filter,
  ChevronRight,
  Layers
} from 'lucide-react';
import { DEFAULT_PARTNER_DEALS } from '../../data/partnerDeals.js';

export const PartnerMarketplace = ({
  rewardPoints = 0,
  onSelectOfferForRedemption
}) => {
  const [deals, setDeals] = useState(DEFAULT_PARTNER_DEALS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pointFilter, setPointFilter] = useState('ALL'); // 'ALL' | 'AFFORDABLE' | 'UNDER_50' | '50_100' | 'ABOVE_100'
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

  const CATEGORIES = [
    'All',
    'Food & Beverages',
    'Cafes',
    'Fitness & Wellness',
    'Student Essentials',
    'Special Campus Offers'
  ];

  // Filtering logic
  const filteredDeals = deals.filter(deal => {
    // Category check
    if (selectedCategory !== 'All' && deal.category !== selectedCategory) {
      return false;
    }

    // Points check
    const cost = Number(deal.pointsRequired || deal.points) || 0;
    if (pointFilter === 'AFFORDABLE' && cost > rewardPoints) return false;
    if (pointFilter === 'UNDER_50' && cost >= 50) return false;
    if (pointFilter === '50_100' && (cost < 50 || cost > 100)) return false;
    if (pointFilter === 'ABOVE_100' && cost <= 100) return false;

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (deal.title || '').toLowerCase().includes(q);
      const matchVendor = (deal.vendorName || '').toLowerCase().includes(q);
      const matchDesc = (deal.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchVendor && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* ── HEADER, SEARCH & FILTERS ────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <span>Explore Partner Rewards</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real discounts &amp; perks at student-favorite campus spots.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search partner or deal..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 pt-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Points Requirement Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setPointFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${
              pointFilter === 'ALL' ? 'bg-emerald-50 text-emerald-700 font-black' : 'hover:text-slate-800'
            }`}
          >
            All Deals ({deals.length})
          </button>
          <button
            onClick={() => setPointFilter('AFFORDABLE')}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${
              pointFilter === 'AFFORDABLE' ? 'bg-emerald-50 text-emerald-700 font-black' : 'hover:text-slate-800'
            }`}
          >
            Affordable Now (≤ {rewardPoints} HP)
          </button>
          <button
            onClick={() => setPointFilter('UNDER_50')}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${
              pointFilter === 'UNDER_50' ? 'bg-emerald-50 text-emerald-700 font-black' : 'hover:text-slate-800'
            }`}
          >
            Under 50 HP
          </button>
          <button
            onClick={() => setPointFilter('50_100')}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${
              pointFilter === '50_100' ? 'bg-emerald-50 text-emerald-700 font-black' : 'hover:text-slate-800'
            }`}
          >
            50 - 100 HP
          </button>
        </div>
      </div>

      {/* ── PARTNER DEALS CARDS GRID ────────────────────────────────────────── */}
      {filteredDeals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
          <Tag className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-700">No Matching Partner Deals</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or point requirement filter to view more campus offers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map(deal => {
            const cost = Number(deal.pointsRequired || deal.points) || 0;
            const canAfford = (rewardPoints || 0) >= cost;
            const totalStock = Number(deal.totalVouchers) || 50;
            const claimed = Number(deal.claimedCount) || 0;
            const remainingStock = Math.max(0, totalStock - claimed);

            return (
              <div
                key={deal.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-400/80 shadow-xs transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  
                  {/* Top: Vendor Badge & Cost */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                      {deal.category || 'Partner Deal'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200/70">
                      {cost} HP
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <span className="text-[11px] font-black text-emerald-600 block mb-0.5">
                      {deal.vendorName || 'Campus Partner'}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                      {deal.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {deal.description}
                    </p>
                  </div>

                  {/* Stock & Expiry */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{deal.expiryDate ? `Valid till ${deal.expiryDate}` : 'Limited time'}</span>
                    </span>
                    <span className="text-slate-500">
                      {remainingStock} vouchers left
                    </span>
                  </div>
                </div>

                {/* Redeem Action */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectOfferForRedemption(deal)}
                    disabled={!canAfford || remainingStock <= 0}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      !canAfford
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : remainingStock <= 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {!canAfford ? (
                      <span>Need {cost - rewardPoints} More HP</span>
                    ) : remainingStock <= 0 ? (
                      <span>Sold Out</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Redeem for {cost} HP</span>
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
