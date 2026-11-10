import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Store,
  ArrowRight,
  ShieldCheck,
  Ticket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  doc, 
  updateDoc, 
  setDoc, 
  increment, 
  serverTimestamp, 
  runTransaction 
} from 'firebase/firestore';
import { db } from '../../services/firebase';

export const RedemptionModal = ({
  isOpen,
  onClose,
  offer,
  currentUser,
  rewardPoints = 0,
  onSuccessfulRedemption,
  addNotification
}) => {
  const [step, setStep] = useState('CONFIRM'); // 'CONFIRM' | 'SUCCESS'
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [voucherData, setVoucherData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !offer) return null;

  const cost = Number(offer.pointsRequired || offer.points) || 0;
  const canAfford = (rewardPoints || 0) >= cost;
  const balanceAfter = Math.max(0, (rewardPoints || 0) - cost);

  const handleConfirmClaim = async () => {
    if (!currentUser) {
      setErrorMsg('You must be logged in as a verified student to redeem offers.');
      return;
    }

    if (!canAfford) {
      setErrorMsg(`Insufficient points. You need ${cost - rewardPoints} more Health Points.`);
      return;
    }

    setIsClaiming(true);
    setErrorMsg(null);

    const studentId = currentUser.uid || currentUser.id;
    const redemptionId = 'red_' + Date.now();
    const vendorPrefix = (offer.vendorName || 'MM').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
    const voucherCode = `MM-${vendorPrefix || 'VCH'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const redemptionRecord = {
      id: redemptionId,
      studentId,
      userId: studentId,
      studentName: currentUser.name || 'Student',
      studentAdmissionNumber: currentUser.admissionNumber || '',
      rewardId: offer.id,
      rewardTitle: offer.title,
      rewardName: offer.title,
      vendorId: offer.vendorId || 'vendor_partner',
      vendorName: offer.vendorName || 'Campus Partner',
      discountCode: offer.discountCode || voucherCode,
      voucherCode,
      claimCode: voucherCode,
      pointsSpent: cost,
      status: 'ACTIVE',
      claimedAt: serverTimestamp(),
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      expiryDate: offer.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      terms: offer.terms || 'Show this voucher before billing at the vendor counter.'
    };

    try {
      // 1. Transactional / Atomic execution in Firestore
      if (offer.id && !offer.id.startsWith('deal_')) {
        const rewardRef = doc(db, 'rewards', offer.id);
        await updateDoc(rewardRef, {
          claimedCount: increment(1)
        }).catch(() => {});
      }

      // 2. Create record in /redemptions
      const redemptionRef = doc(db, 'redemptions', redemptionId);
      await setDoc(redemptionRef, redemptionRecord);

      // 3. Atomically deduct points from student user doc
      try {
        const userRef = doc(db, 'users', studentId);
        await updateDoc(userRef, {
          rewardPoints: increment(-cost),
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Student points update notice:', e.message);
      }

      // 4. Update local state & trigger celebration
      if (currentUser) {
        currentUser.rewardPoints = balanceAfter;
      }

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setVoucherData(redemptionRecord);
      setStep('SUCCESS');

      if (onSuccessfulRedemption) {
        onSuccessfulRedemption(redemptionRecord);
      }

      if (addNotification) {
        addNotification(
          'Offer Redeemed! 🎉',
          `Voucher ${voucherCode} for ${offer.vendorName} is now active.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Redemption error:', err);
      setErrorMsg(err.message || 'Could not process redemption. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCopyCode = () => {
    if (voucherData?.voucherCode && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(voucherData.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative p-6 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── STEP 1: CONFIRMATION PREVIEW ──────────────────────────────────── */}
        {step === 'CONFIRM' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <Gift className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-1.5">
                {offer.category || 'Partner Reward'}
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {offer.title}
              </h2>
              <span className="text-xs font-bold text-slate-500 block mt-0.5">
                at {offer.vendorName}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              {offer.description}
            </p>

            {/* Points Deduction Breakdown Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-600">
                <span>Current Balance:</span>
                <span className="text-slate-900">{rewardPoints} HP</span>
              </div>
              <div className="flex items-center justify-between font-bold text-rose-600">
                <span>Points Required:</span>
                <span>-{cost} HP</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-black text-slate-900">
                <span>Balance After Claim:</span>
                <span className="text-emerald-700">{balanceAfter} HP</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold flex items-center space-x-2 border border-rose-200 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleConfirmClaim}
                disabled={isClaiming || !canAfford}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isClaiming ? 'Claiming Voucher...' : `Confirm & Deduct ${cost} HP`}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SUCCESS VOUCHER PASS ──────────────────────────────────── */}
        {step === 'SUCCESS' && voucherData && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-1.5">
                Reward Claimed Successfully!
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {voucherData.rewardTitle}
              </h2>
              <span className="text-xs font-bold text-slate-500 block mt-0.5">
                {voucherData.vendorName}
              </span>
            </div>

            {/* Voucher Pass Presentation */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-32 h-32 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    Voucher Claim Code
                  </span>
                  <span className="text-base font-mono font-black text-emerald-700 select-all tracking-wider">
                    {voucherData.voucherCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-left leading-relaxed">
                ℹ️ <strong>How to Redeem:</strong> Show this claim code or QR to the cashier at <strong>{voucherData.vendorName}</strong> before billing.
              </p>
            </div>

            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Valid until {voucherData.expiryDate}</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
            >
              Done &amp; View in My Redemptions
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
