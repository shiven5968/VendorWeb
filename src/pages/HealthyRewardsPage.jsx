import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  Sparkles, 
  History, 
  Store, 
  Ticket, 
  CalendarCheck, 
  Receipt, 
  Plus, 
  QrCode, 
  Check, 
  Copy, 
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { RewardsHeader } from '../components/rewards/RewardsHeader';
import { EarnPointsSection } from '../components/rewards/EarnPointsSection';
import { PartnerMarketplace } from '../components/rewards/PartnerMarketplace';
import { RedemptionModal } from '../components/rewards/RedemptionModal';
import { TransactionLedger } from '../components/rewards/TransactionLedger';
import { AchievementsSection } from '../components/rewards/AchievementsSection';
import { PartnerAdminModal } from '../components/rewards/PartnerAdminModal';

export const HealthyRewardsPage = () => {
  const { 
    currentUser, 
    currentRole,
    rewardPoints = 0, 
    userRedemptions = [], 
    rewardEvents = [],
    addNotification,
    setActiveTab: setAppActiveTab
  } = useApp();

  // Active Tab: 'partner' | 'earn' | 'ledger' | 'my_vouchers' | 'milestones'
  const [activeTab, setActiveTab] = useState('partner');

  // Modal states
  const [selectedOfferForRedemption, setSelectedOfferForRedemption] = useState(null);
  const [isPartnerAdminOpen, setIsPartnerAdminOpen] = useState(false);
  const [activeVoucherCodeModal, setActiveVoucherCodeModal] = useState(null);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  const isStaffOrPartner = currentRole === 'partner' || 
    currentRole === 'warden' || 
    currentRole === 'mess_committee' || 
    currentRole === 'committee' ||
    (currentUser?.email || '').includes('warden') ||
    (currentUser?.email || '').includes('partner');

  const handleCopyCode = (code) => {
    if (code && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedVoucher(true);
      setTimeout(() => setCopiedVoucher(false), 2000);
    }
  };

  const handleNavigateToRating = () => {
    // Navigate to student home dashboard where meals can be rated
    if (setAppActiveTab) {
      setAppActiveTab('home');
    }
  };

  const handleNavigateToVoting = () => {
    if (setAppActiveTab) {
      setAppActiveTab('voting');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-16 animate-fade-in">
      
      {/* ── 1. PROMINENT HEALTH POINTS HERO & LEDGER TILES ──────────────────── */}
      <RewardsHeader
        currentUser={currentUser}
        rewardPoints={rewardPoints}
        rewardEvents={rewardEvents}
        userRedemptions={userRedemptions}
        onOpenHowToEarn={() => setActiveTab('earn')}
      />

      {/* ── 2. SUB-NAVIGATION TABS BAR ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 rounded-2xl bg-slate-100 text-xs font-black">
          <button
            onClick={() => setActiveTab('partner')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'partner'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Partner Deals</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('earn')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'earn'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>How to Earn</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Points Ledger ({(rewardEvents || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_vouchers')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'my_vouchers'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Redemptions ({(userRedemptions || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Milestones</span>
          </button>
        </div>

        {/* Staff/Partner Add Deal Action */}
        {isStaffOrPartner && (
          <button
            onClick={() => setIsPartnerAdminOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Add Partner Offer</span>
          </button>
        )}
      </div>

      {/* ── 3. TAB 1: EXPLORE PARTNER REWARDS ───────────────────────────────── */}
      {activeTab === 'partner' && (
        <PartnerMarketplace
          rewardPoints={rewardPoints}
          onSelectOfferForRedemption={(offer) => setSelectedOfferForRedemption(offer)}
        />
      )}

      {/* ── 4. TAB 2: HOW TO EARN HEALTH POINTS ─────────────────────────────── */}
      {activeTab === 'earn' && (
        <EarnPointsSection
          rewardEvents={rewardEvents}
          onNavigateToRating={handleNavigateToRating}
          onNavigateToVoting={handleNavigateToVoting}
        />
      )}

      {/* ── 5. TAB 3: UNIFIED POINTS LEDGER ─────────────────────────────────── */}
      {activeTab === 'ledger' && (
        <TransactionLedger
          rewardEvents={rewardEvents}
          userRedemptions={userRedemptions}
        />
      )}

      {/* ── 6. TAB 4: MY CLAIMED VOUCHERS ───────────────────────────────────── */}
      {activeTab === 'my_vouchers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>My Claimed Vouchers</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Active vouchers ready to be redeemed at campus partner counters.
              </p>
            </div>
          </div>

          {(userRedemptions || []).length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
              <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-black text-slate-700">No Vouchers Claimed Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore the Rewards Marketplace to redeem your Health Points for cafe discounts and student perks!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {userRedemptions.map((red) => {
                const code = red.voucherCode || red.claimCode || red.id;
                const title = red.rewardTitle || red.rewardName || 'Partner Perk';
                const points = red.pointsSpent ?? red.points ?? 0;

                return (
                  <div
                    key={red.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-xs transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          {red.vendorName || 'Campus Partner'}
                        </span>
                        <span className="text-xs font-black text-slate-400">
                          -{points} HP
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {title}
                      </h3>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                            Claim Code
                          </span>
                          <span className="text-sm font-mono font-black text-emerald-800 select-all tracking-wider">
                            {code}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(code)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedVoucher ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedVoucher ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>Status: <strong className="text-emerald-700">{red.status || 'ACTIVE'}</strong></span>
                      <button
                        onClick={() => setActiveVoucherCodeModal(red)}
                        className="text-emerald-700 hover:text-emerald-900 font-black cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Show QR Pass</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 7. TAB 5: ACHIEVEMENTS & MILESTONES ──────────────────────────────── */}
      {activeTab === 'milestones' && (
        <AchievementsSection
          rewardEvents={rewardEvents}
          userRedemptions={userRedemptions}
          rewardPoints={rewardPoints}
        />
      )}

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      
      {/* 1. Confirm & Claim Redemption Modal */}
      {selectedOfferForRedemption && (
        <RedemptionModal
          isOpen={Boolean(selectedOfferForRedemption)}
          onClose={() => setSelectedOfferForRedemption(null)}
          offer={selectedOfferForRedemption}
          currentUser={currentUser}
          rewardPoints={rewardPoints}
          addNotification={addNotification}
        />
      )}

      {/* 2. Partner Admin Offer Creator */}
      {isPartnerAdminOpen && (
        <PartnerAdminModal
          isOpen={isPartnerAdminOpen}
          onClose={() => setIsPartnerAdminOpen(false)}
          currentUser={currentUser}
          addNotification={addNotification}
        />
      )}

      {/* 3. QR Voucher Modal for Existing Redemptions */}
      {activeVoucherCodeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                {activeVoucherCodeModal.rewardTitle || 'Claimed Voucher'}
              </h3>
              <button
                onClick={() => setActiveVoucherCodeModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs">
              <QrCode className="w-28 h-28 text-slate-900" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-sm font-mono font-black text-emerald-800 select-all">
                {activeVoucherCodeModal.voucherCode || activeVoucherCodeModal.claimCode || activeVoucherCodeModal.id}
              </span>
              <button
                onClick={() => handleCopyCode(activeVoucherCodeModal.voucherCode || activeVoucherCodeModal.claimCode || activeVoucherCodeModal.id)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
              >
                Copy
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed text-left">
              Present this QR pass to the staff at <strong>{activeVoucherCodeModal.vendorName || 'the partner counter'}</strong> for verification.
            </p>

            <button
              onClick={() => setActiveVoucherCodeModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
