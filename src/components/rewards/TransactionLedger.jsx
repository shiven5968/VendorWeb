import React, { useState } from 'react';
import { 
  Award, 
  CalendarCheck, 
  Star, 
  Vote, 
  Ticket, 
  Clock, 
  Filter,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const TransactionLedger = ({
  rewardEvents = [],
  userRedemptions = []
}) => {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'EARNED' | 'REDEEMED'

  // Normalize earned events
  const normalizedEarned = (rewardEvents || []).map(evt => ({
    id: evt.id || `evt_${Math.random()}`,
    type: 'EARNED',
    sourceType: evt.type,
    title: evt.type === 'LOGIN' 
      ? 'Daily College Login' 
      : evt.type === 'MEAL_RATING' 
      ? (evt.description ? `Meal Rating: ${evt.description}` : 'Meal Rating Review')
      : (evt.description || 'Health Reward Points'),
    pointsDelta: Number(evt.points) || 0,
    dateStr: evt.date || (evt.createdAt ? new Date(evt.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'),
    timeStr: evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
    rawTimestamp: evt.createdAt ? new Date(evt.createdAt).getTime() : 0,
    referenceId: evt.referenceId || evt.id,
    status: 'COMPLETED'
  }));

  // Normalize redeemed vouchers
  const normalizedRedeemed = (userRedemptions || []).map(red => {
    let dateStr = 'Recently';
    let timeStr = '';
    let rawTimestamp = red.timestamp || 0;

    try {
      const d = red.claimedAt?.toDate ? red.claimedAt.toDate() : red.claimedAt ? new Date(red.claimedAt) : red.createdAt ? new Date(red.createdAt) : null;
      if (d) {
        dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        rawTimestamp = d.getTime();
      }
    } catch (e) {}

    return {
      id: red.id,
      type: 'REDEEMED',
      sourceType: 'VOUCHER',
      title: `${red.rewardTitle || red.rewardName || 'Vendor Offer'} (${red.vendorName || 'Partner'})`,
      pointsDelta: -(Number(red.pointsSpent ?? red.points) || 0),
      dateStr,
      timeStr,
      rawTimestamp,
      referenceId: red.voucherCode || red.claimCode || red.id,
      status: red.status || 'ACTIVE'
    };
  });

  // Combine and sort descending by timestamp
  const combinedTransactions = [...normalizedEarned, ...normalizedRedeemed].sort(
    (a, b) => b.rawTimestamp - a.rawTimestamp
  );

  const filteredTransactions = combinedTransactions.filter(tx => {
    if (filterType === 'EARNED') return tx.type === 'EARNED';
    if (filterType === 'REDEEMED') return tx.type === 'REDEEMED';
    return true;
  });

  const getTxIcon = (tx) => {
    if (tx.type === 'REDEEMED') return <Ticket className="w-4 h-4 text-amber-600" />;
    if (tx.sourceType === 'LOGIN') return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
    if (tx.sourceType === 'MEAL_RATING') return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
    return <Award className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="space-y-4">
      
      {/* ── FILTER BUTTONS BAR ──────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Health Points Transaction Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Immutable, verified ledger of all earned and redeemed points.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({combinedTransactions.length})
          </button>
          <button
            onClick={() => setFilterType('EARNED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'EARNED' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Earned ({normalizedEarned.length})
          </button>
          <button
            onClick={() => setFilterType('REDEEMED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'REDEEMED' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Redeemed ({normalizedRedeemed.length})
          </button>
        </div>
      </div>

      {/* ── TRANSACTION ROWS ────────────────────────────────────────────────── */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
          <Award className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-700">No Transactions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Transactions will appear here automatically when you rate meals, log in daily, or redeem partner offers.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  tx.type === 'REDEEMED' ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                  {getTxIcon(tx)}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {tx.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                    <span>{tx.dateStr} {tx.timeStr && `• ${tx.timeStr}`}</span>
                    {tx.referenceId && (
                      <span className="font-mono text-slate-400 bg-slate-50 px-1 rounded">
                        Ref: {tx.referenceId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2 space-y-1">
                <span className={`text-xs sm:text-sm font-black block ${
                  tx.pointsDelta > 0 ? 'text-emerald-700' : 'text-slate-800'
                }`}>
                  {tx.pointsDelta > 0 ? `+${tx.pointsDelta}` : tx.pointsDelta} HP
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 block">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
