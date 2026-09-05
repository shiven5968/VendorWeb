import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { 
  Store, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  QrCode, 
  Sparkles, 
  Tag, 
  Clock, 
  Calendar, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  X, 
  TrendingUp, 
  Ticket, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  Layers, 
  Search,
  ExternalLink,
  Copy,
  Sliders,
  UtensilsCrossed,
  Dumbbell,
  Film,
  ShoppingBag,
  RefreshCw,
  Camera
} from 'lucide-react';
import { QrCameraScannerModal } from '../components/QrCameraScannerModal';
import { createRewardOffer } from '../components/CreateOffer';

const CATEGORY_OPTIONS = [
  'Food & Dining',
  'Entertainment',
  'Fitness',
  'Hostel Essentials',
  'Shopping'
];

const PRESET_IMAGES = [
  { label: 'Gourmet Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
  { label: 'Cinema & Popcorn', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600' },
  { label: 'Fitness & Gym', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600' },
  { label: 'Campus Mart', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600' },
  { label: 'Fresh Coffee & Cafe', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600' }
];

export const VendorDashboard = () => {
  const { user, profile } = useAuth();
  const { validateAndRedeemVoucher } = useApp();

  // Vendor Identity
  const vendorId = profile?.vendorId || user?.uid || 'vendor_partner';
  const vendorName = profile?.vendorName || profile?.name || 'Partner Merchant';
  const vendorLogo = profile?.vendorLogo || profile?.avatar || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300';

  // State: Offers Inventory
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  // State: Redemptions Audit
  const [redemptions, setRedemptions] = useState([]);

  // State: Voucher Validator / Scanner
  const [voucherInput, setVoucherInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // { type: 'success' | 'error', message, redemption }
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // State: Create / Edit Reward Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Reward Form Data
  const initialForm = {
    title: '',
    category: 'Food & Dining',
    pointsRequired: 150,
    discountCode: '',
    totalVouchers: 50,
    expiryDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    vendorLogo: vendorLogo,
    imageUrl: PRESET_IMAGES[0].url,
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Toast / Notification banner
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. REAL-TIME SUBSCRIPTION TO VENDOR REWARDS & REDEMPTIONS
  useEffect(() => {
    setLoadingOffers(true);
    const unsubOffers = db.subscribeVendorRewards(vendorId, (data) => {
      setOffers(data || []);
      setLoadingOffers(false);
    });

    const unsubRedemptions = db.subscribeVendorRedemptions(vendorId, (list) => {
      setRedemptions(list || []);
    });

    return () => {
      if (typeof unsubOffers === 'function') unsubOffers();
      if (typeof unsubRedemptions === 'function') unsubRedemptions();
    };
  }, [vendorId]);

  // Aggregate Stats
  const totalOffersCount = offers.length;
  const activeOffersCount = offers.filter(o => o.isActive).length;
  const totalVouchersIssued = offers.reduce((acc, o) => acc + Number(o.totalVouchers || 0), 0);
  const totalClaimedCount = offers.reduce((acc, o) => acc + Number(o.claimedCount || 0), 0);
  const totalRedeemedCount = redemptions.filter(r => r.status === 'REDEEMED').length;

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingRewardId(null);
    setFormData({
      ...initialForm,
      discountCode: ('ABES' + Math.random().toString(36).substring(2, 6).toUpperCase())
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (reward) => {
    setEditingRewardId(reward.rewardId || reward.id);
    setFormData({
      title: reward.title || '',
      category: reward.category || 'Food & Dining',
      pointsRequired: reward.pointsRequired || 100,
      discountCode: reward.discountCode || '',
      totalVouchers: reward.totalVouchers || 50,
      expiryDate: reward.expiryDate || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      vendorLogo: reward.vendorLogo || vendorLogo,
      imageUrl: reward.imageUrl || reward.image || PRESET_IMAGES[0].url,
      description: reward.description || ''
    });
    setIsModalOpen(true);
  };

  // Save / Update Offer to Firestore
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter an offer title.', 'error');
      return;
    }
    if (Number(formData.pointsRequired) <= 0) {
      showToast('Required points must be greater than 0.', 'error');
      return;
    }
    if (Number(formData.totalVouchers) <= 0) {
      showToast('Total vouchers count must be at least 1.', 'error');
      return;
    }

    setSavingOffer(true);
    try {
      const rewardPayload = {
        rewardId: editingRewardId || ('rew_' + Date.now()),
        vendorId,
        vendorName,
        vendorLogo: formData.vendorLogo || vendorLogo,
        title: formData.title.trim(),
        description: formData.description.trim(),
        pointsRequired: Number(formData.pointsRequired),
        category: formData.category,
        discountCode: (formData.discountCode || ('ABES' + Math.random().toString(36).substring(2, 6).toUpperCase())).trim().toUpperCase(),
        totalVouchers: Number(formData.totalVouchers),
        claimedCount: editingRewardId 
          ? (offers.find(o => (o.rewardId || o.id) === editingRewardId)?.claimedCount || 0)
          : 0,
        isActive: true,
        expiryDate: formData.expiryDate,
        imageUrl: formData.imageUrl,
        image: formData.imageUrl,
        createdAt: new Date().toISOString()
      };

      if (!editingRewardId) {
        const createRes = await createRewardOffer({
          vendorId,
          vendorName,
          vendorLogo: formData.vendorLogo || vendorLogo,
          title: formData.title.trim(),
          description: formData.description.trim(),
          pointsRequired: Number(formData.pointsRequired),
          category: formData.category,
          discountCode: (formData.discountCode || ('ABES' + Math.random().toString(36).substring(2, 6).toUpperCase())).trim().toUpperCase(),
          totalVouchers: Number(formData.totalVouchers),
          expiryDate: formData.expiryDate,
          imageUrl: formData.imageUrl,
          image: formData.imageUrl
        });
        if (!createRes.success) {
          throw new Error(createRes.error || 'Failed to publish offer to Firestore');
        }
      } else {
        await db.savePartnerReward(rewardPayload);
      }
      setIsModalOpen(false);
      showToast(editingRewardId ? 'Offer updated successfully!' : 'New offer published live to MessMates students!');
    } catch (err) {
      showToast(err.message || 'Failed to save offer to database.', 'error');
    } finally {
      setSavingOffer(false);
    }
  };

  // Toggle Live Offer Visibility (Instant real-time hide/show)
  const handleToggleActive = async (reward) => {
    const rId = reward.rewardId || reward.id;
    setTogglingId(rId);
    const newStatus = !reward.isActive;
    try {
      await db.togglePartnerRewardActive(rId, newStatus);
      showToast(`Offer is now ${newStatus ? 'LIVE on MessMates' : 'HIDDEN from students'}.`);
    } catch (err) {
      showToast('Could not update offer status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Offer
  const handleDeleteOffer = async (reward) => {
    const rId = reward.rewardId || reward.id;
    if (!window.confirm(`Are you sure you want to remove "${reward.title}" from your active inventory?`)) {
      return;
    }
    try {
      await db.deletePartnerReward(rId);
      showToast('Offer removed from inventory.', 'info');
    } catch (err) {
      showToast('Could not delete offer.', 'error');
    }
  };

  // Validate and Redeem Student Voucher
  const handleValidateVoucher = async (e, directCode) => {
    if (e) e.preventDefault();
    const code = (directCode || voucherInput || '').trim();
    if (!code) {
      setValidationResult({ type: 'error', message: 'Please enter student voucher code (e.g. MM-89X2)' });
      return;
    }

    setValidating(true);
    setValidationResult(null);
    try {
      const res = await validateAndRedeemVoucher(vendorId, code);
      setValidationResult({
        type: 'success',
        message: res.message,
        redemption: res.redemption
      });
      setVoucherInput('');
    } catch (err) {
      setValidationResult({
        type: 'error',
        message: err.message || 'Invalid or unrecognized voucher code.'
      });
    } finally {
      setValidating(false);
    }
  };

  // Called when camera scanner successfully decodes a voucher QR code
  const handleCameraScanSuccess = (code) => {
    setVoucherInput(code);
    handleValidateVoucher(null, code);
  };

  // Filtered Offers
  const filteredOffers = filterCategory === 'All'
    ? offers
    : offers.filter(o => o.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-28 md:pb-14">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-black text-white ${
            toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}>
            {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER: Vendor Brand & Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-2xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-emerald-500/30 bg-white flex-shrink-0 shadow-lg">
              <img src={vendorLogo} alt={vendorName} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified MessMates Partner</span>
                </span>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">• Crossing Republik & ABES Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{vendorName}</h1>
              <p className="text-xs text-slate-300 font-medium">
                Live Merchant Portal — Manage student dining perks, real-time voucher stock, and counter redemptions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenCreateModal}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Offer</span>
            </button>

            <button
              onClick={() => {
                const scannerSection = document.getElementById('voucher-scanner-box');
                if (scannerSection) scannerSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Voucher Scanner</span>
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Active Offers</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white">{activeOffersCount}</span>
              <span className="text-xs text-emerald-400 font-bold">/ {totalOffersCount} Total</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Claims</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-amber-300">{totalClaimedCount}</span>
              <span className="text-xs text-slate-400 font-bold">Vouchers</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Counter Redemptions</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-emerald-400">{totalRedeemedCount}</span>
              <span className="text-xs text-emerald-300 font-semibold">Verified</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Voucher Stock</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-blue-400">{totalVouchersIssued}</span>
              <span className="text-xs text-slate-400 font-bold">Total Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: STUDENT VOUCHER VALIDATOR & REDEMPTION SCANNER */}
      {/* ========================================================================= */}
      <div 
        id="voucher-scanner-box"
        className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 bg-white dark:bg-slate-900 shadow-xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Cashier Voucher Validator & Scanner
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Student presents a 6-character voucher code (<span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">MM-XXXX</span>) from the MessMates Student App.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center space-x-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Scanner Active</span>
          </span>
        </div>

        {/* Redemption Input Form */}
        <form onSubmit={handleValidateVoucher} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Ticket className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                id="cashier-voucher-input"
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit Voucher Code (e.g. MM-89X2)"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm sm:text-base font-mono font-black uppercase tracking-wider outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
              {voucherInput && (
                <button
                  type="button"
                  onClick={() => setVoucherInput('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Camera QR Scanner Button */}
            <button
              type="button"
              onClick={() => setIsCameraScannerOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700 dark:border-slate-600 text-xs sm:text-sm font-black shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              title="Open camera to scan voucher QR code"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Scan QR with Camera</span>
            </button>

            {/* Approve & Redeem Button */}
            <button
              type="submit"
              disabled={validating || !voucherInput.trim()}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Redeem</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Validation Result Alert */}
        {validationResult && (
          <div className={`p-5 rounded-2xl border transition-all animate-in zoom-in-95 duration-200 ${
            validationResult.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500/40 text-rose-900 dark:text-rose-100'
          }`}>
            <div className="flex items-start space-x-3">
              {validationResult.type === 'success' ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertCircle className="w-6 h-6 stroke-[3]" />
                </div>
              )}

              <div className="space-y-1 flex-1">
                <h4 className="text-sm sm:text-base font-black">
                  {validationResult.type === 'success' ? 'Voucher Successfully Approved! 🎉' : 'Voucher Verification Notice'}
                </h4>
                <p className="text-xs font-semibold opacity-90">{validationResult.message}</p>

                {validationResult.redemption && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">Student</span>
                      <span className="font-black text-slate-900 dark:text-white">{validationResult.redemption.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">Voucher Code</span>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">{validationResult.redemption.voucherCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">Terminal POS Code</span>
                      <span className="font-mono font-black px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-emerald-500/30">
                        {validationResult.redemption.discountCode || 'ABESDISCOUNT'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Recent Redemptions Strip */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
            <span>Recent Counter Redemptions ({redemptions.length})</span>
            <span className="text-[10px] font-semibold text-slate-400">Live Real-Time Ledger</span>
          </div>

          {redemptions.length === 0 ? (
            <div className="p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-semibold">
              No redemptions logged yet. Validated student vouchers will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {redemptions.slice(0, 6).map(red => (
                <div 
                  key={red.id || red.redemptionId}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between space-x-3"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                        {red.voucherCode || red.claimCode}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        red.status === 'REDEEMED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {red.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{red.studentName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{red.rewardTitle}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {red.redeemedAt ? new Date(red.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION B: INVENTORY & LIVE OFFERS MANAGER */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Inventory & Live Offers ({offers.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active offers are visible to all students on the MessMates Student App in real time.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterCategory === 'All'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              All ({offers.length})
            </button>
            {CATEGORY_OPTIONS.map(cat => {
              const count = offers.filter(o => o.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers Grid */}
        {loadingOffers ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs font-bold">Synchronizing live offers with Firestore...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <Store className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">No Offers Found in this Category</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create and publish special student meal deals, gym passes, or student discounts to attract ABES hostel students.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-md hover:bg-emerald-500 transition-colors"
            >
              + Create First Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((offer) => {
              const rId = offer.rewardId || offer.id;
              const claimed = Number(offer.claimedCount || 0);
              const total = Number(offer.totalVouchers || 50);
              const percentClaimed = Math.min(100, Math.round((claimed / total) * 100));
              const isToggling = togglingId === rId;

              return (
                <div
                  key={rId}
                  className={`rounded-3xl overflow-hidden border transition-all flex flex-col justify-between bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl ${
                    offer.isActive
                      ? 'border-slate-200/80 dark:border-slate-800'
                      : 'border-slate-300 dark:border-slate-800/50 opacity-75'
                  }`}
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={offer.imageUrl || offer.image || PRESET_IMAGES[0].url} 
                        alt={offer.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                          {offer.category}
                        </span>

                        {/* ONE-CLICK ACTIVE / INACTIVE TOGGLE */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(offer)}
                          disabled={isToggling}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 backdrop-blur-md transition-all cursor-pointer ${
                            offer.isActive
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-rose-500/80 text-white'
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <span className={`w-2 h-2 rounded-full ${offer.isActive ? 'bg-white animate-pulse' : 'bg-white/60'}`}></span>
                          )}
                          <span>{offer.isActive ? 'Live on App' : 'Hidden / Inactive'}</span>
                        </button>
                      </div>

                      {/* Points Required Badge */}
                      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{offer.pointsRequired} Points</span>
                        </span>
                      </div>

                      {/* Expiry Pill */}
                      <div className="absolute bottom-3 right-3">
                        <span className="text-[10px] font-bold text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-300" />
                          <span>Exp: {offer.expiryDate || 'Open'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                          {offer.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {offer.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Discount Code & Stock Pill */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Cashier POS Code</span>
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{offer.discountCode}</span>
                        </div>

                        {/* Stock Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            <span>Vouchers Claimed</span>
                            <span>{claimed} / {total}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                percentClaimed >= 90 ? 'bg-rose-500' : percentClaimed >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentClaimed}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <button
                      onClick={() => handleOpenEditModal(offer)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Offer</span>
                    </button>

                    <button
                      onClick={() => handleDeleteOffer(offer)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: CREATE / EDIT REWARD MODAL & LIVE CARD PREVIEW */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingRewardId ? 'Edit Partner Reward' : 'Create & Publish Live Reward'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Changes sync in real time to the ABES Student MessMates App.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Two-Column Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
              
              {/* Form Inputs (7 cols on lg) */}
              <form onSubmit={handleSaveOffer} className="lg:col-span-7 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 20% OFF on Weekend Buffet & Combo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Category & Points Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                    >
                      {CATEGORY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Required Reward Points *
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      required
                      value={formData.pointsRequired}
                      onChange={e => setFormData({ ...formData, pointsRequired: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Voucher Code & Stock Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      POS Discount / Voucher Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.discountCode}
                      onChange={e => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABES20OFF"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold outline-none focus:border-emerald-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Stock Count (Total Vouchers) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.totalVouchers}
                      onChange={e => setFormData({ ...formData, totalVouchers: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Image URL & Quick Presets */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Offer Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">Quick Presets:</span>
                    {PRESET_IMAGES.map(img => (
                      <button
                        type="button"
                        key={img.label}
                        onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Description & Redemption Terms
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details, restaurant address, minimum bill conditions, or timings..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingOffer}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    {savingOffer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingRewardId ? 'Save Changes' : 'Publish Live to Students'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* LIVE CARD PREVIEW (5 cols on lg) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Student App Card Preview</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    This is how ABES students will see this offer in their Rewards Catalog.
                  </p>
                </div>

                {/* The Preview Card */}
                <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={formData.imageUrl || PRESET_IMAGES[0].url} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                        {formData.category}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black shadow-md flex items-center space-x-1">
                        <Zap className="w-3 h-3 fill-white" />
                        <span>{formData.pointsRequired} pts</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={vendorLogo} 
                          alt="Logo" 
                          className="w-5 h-5 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" 
                        />
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {vendorName}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {formData.title || 'Your Offer Title'}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {formData.description || 'Redeemable at Crossing Republik counter. Show claim code on MessMates.'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1">
                        <span>Stock: {formData.totalVouchers} left</span>
                        <span>Exp: {formData.expiryDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black shadow-sm flex items-center justify-center space-x-1 cursor-default opacity-90"
                    >
                      <span>CLAIM REWARD</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-semibold flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Instant Firestore Sync: Changes will be immediately reflected on student devices.</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Camera QR Scanner Modal */}
      <QrCameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleCameraScanSuccess}
      />

    </div>
  );
};
