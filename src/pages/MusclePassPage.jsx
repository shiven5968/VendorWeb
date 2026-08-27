import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Dumbbell, 
  Plus, 
  Check, 
  Save, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Flame, 
  Zap, 
  Lock,
  Clock,
  AlertCircle
} from 'lucide-react';
import { initiateMusclePassPayment } from '../services/payment';

export const MusclePassPage = () => {
  const { 
    currentUser, 
    proteinTarget, 
    setProteinTarget, 
    consumedProtein, 
    logProtein,
    todayMeals,
    isMusclePassActive,
    musclePassSubscription
  } = useApp();

  const [targetInput, setTargetInput] = useState(proteinTarget);
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

  const remainingProtein = Math.max(0, proteinTarget - consumedProtein);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));

  const recommendedToday = (todayMeals || [])
    .filter(m => Number(m.protein) >= 7)
    .sort((a, b) => Number(b.protein) - Number(a.protein));

  const handleSaveTarget = (e) => {
    e.preventDefault();
    setProteinTarget(Number(targetInput));
    setShowEditTarget(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSubscribe = async () => {
    if (!currentUser) return;
    setIsProcessingPayment(true);
    setPaymentMessage(null);

    await initiateMusclePassPayment({
      userId: currentUser.uid || currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      onSuccess: (data) => {
        setIsProcessingPayment(false);
        setPaymentMessage({ type: 'success', text: 'Payment verified! Muscle Pass activated for 30 days.' });
        window.location.reload();
      },
      onError: (errMsg) => {
        setIsProcessingPayment(false);
        setPaymentMessage({ type: 'error', text: errMsg });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Muscle Pass</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Gym Mode & High-Protein Mess Diet Planner • {currentUser?.name || 'Student'}
            </p>
          </div>
        </div>

        {isMusclePassActive ? (
          <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ACTIVE PASS</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5" />
            <span>PREMIUM FEATURE</span>
          </span>
        )}
      </div>

      {paymentMessage && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
          paymentMessage.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          {paymentMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{paymentMessage.text}</span>
        </div>
      )}

      {/* PAYWALL / SUBSCRIPTION BANNER (WHEN NOT ACTIVE) */}
      {!isMusclePassActive && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white space-y-6 shadow-2xl border border-emerald-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                Monthly Subscription
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Unlock Personalized Gym Nutrition for ₹299 / Month
              </h2>
              <p className="text-xs text-slate-300">
                Custom daily protein targets, mess dish macro analysis, and verified hostel nutrition plans.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Price</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">₹299 <span className="text-xs text-slate-300 font-semibold">/ mo</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-4">
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-300">Personalized daily protein goal slider</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-300">One-tap protein logging from mess menu</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-300">High-protein mess dish recommendations</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubscribe}
              disabled={isProcessingPayment}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessingPayment ? 'CONNECTING RAZORPAY...' : 'SUBSCRIBE VIA RAZORPAY (₹299/MO)'}</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              Secure UPI, Cards, NetBanking via Razorpay. Subscriptions are activated only after verified payment.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE MUSCLE PASS TRACKER (PROTEIN METRICS & GOALS) */}
      <div className="space-y-6">
        
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Daily Protein Metrics
          </h2>

          <button
            onClick={() => setShowEditTarget(!showEditTarget)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
          >
            {showEditTarget ? 'Close' : 'Set Goal'}
          </button>
        </div>

        {showEditTarget && (
          <form onSubmit={handleSaveTarget} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-md">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Protein Goal (g)</label>
              <input
                type="number"
                value={targetInput}
                onChange={e => setTargetInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </form>
        )}

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center space-x-1">
            <Check className="w-4 h-4" />
            <span>Protein target updated.</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Protein Goal</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{proteinTarget}g</p>
          </div>

          <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">Consumed</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{consumedProtein}g</p>
          </div>

          <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Remaining</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{remainingProtein}g</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Daily Target Progress</span>
            <span className="text-emerald-600 dark:text-emerald-400">{proteinPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Recommended Dishes from Today's Menu */}
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            High-Protein Items in Today's Menu
          </h3>

          {recommendedToday.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border">
              No high-protein recommendations found in today's menu.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedToday.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">{item.category}</span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{item.name}</h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                      +{item.protein}g
                    </span>
                    <button
                      onClick={() => logProtein(item.name, item.protein)}
                      className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                      title="Log to today's protein"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
