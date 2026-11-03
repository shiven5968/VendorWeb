import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Flame, 
  Zap, 
  Lock,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Check,
  TrendingUp,
  Sliders,
  UtensilsCrossed,
  Plus,
  RefreshCw,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

import { initiateMusclePassPayment } from '../services/payment';
import { MUSCLE_PASS_PLAN_LIST, getMusclePassPlan, MUSCLE_PASS_TRIAL_CONFIG } from '../config/pricing';
import { getCollegeDateString, formatCollegeDateDisplay } from '../utils/dateTime';
import { getTodayHostelMeals } from '../data/hostelMenus';
import { generateSmartMealPlan } from '../services/nutritionEngine';
import { 
  startTrial, 
  checkStatus, 
  getNutritionProfile, 
  saveNutritionProfile, 
  getDailyLogs, 
  logMeal, 
  deleteMealLog,
  getWeeklySummaries,
  formatTimeRemaining
} from '../services/musclePassService';

import { NutritionOnboardingModal } from '../components/musclePass/NutritionOnboardingModal';
import { MealLoggingModal } from '../components/musclePass/MealLoggingModal';
import { WeeklyInsightsCard } from '../components/musclePass/WeeklyInsightsCard';

export const MusclePassPage = () => {
  const { 
    currentUser, 
    activeMess,
    todayDay,
    allMeals,
    todayMeals: contextTodayMeals,
    musclePassSubscription
  } = useApp();
  const { user } = useAuth();

  const userId = currentUser?.uid || currentUser?.id || user?.uid;

  // Active status & entitlement
  const [entitlement, setEntitlement] = useState({
    hasActivePass: false,
    isTrial: false,
    status: 'NONE',
    msLeft: 0,
    trialClaimed: false
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [trialError, setTrialError] = useState('');

  // Nutrition Profile
  const [profile, setProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Daily Meal Planner & Logs
  const [todayLogs, setTodayLogs] = useState([]);
  const [selectedMealForLog, setSelectedMealForLog] = useState(null);
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'insights' | 'plans'
  const [weeklySummaries, setWeeklySummaries] = useState([]);

  // Payment state (Razorpay)
  const [selectedPlanId, setSelectedPlanId] = useState('MUSCLE_3_MONTHS');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

  const selectedPlan = getMusclePassPlan(selectedPlanId);
  const todayDateIST = getCollegeDateString();

  // Load entitlement, profile, and daily logs
  const loadEntitlementAndData = async () => {
    if (!userId) {
      setIsLoadingStatus(false);
      return;
    }

    try {
      setIsLoadingStatus(true);
      const [statusRes, profileRes, logsRes, weeklyRes] = await Promise.all([
        checkStatus(userId),
        getNutritionProfile(userId),
        getDailyLogs(userId, todayDateIST),
        getWeeklySummaries(userId)
      ]);

      // If user has paid subscription from context, give it precedence
      const isPaidActive = musclePassSubscription?.status === 'ACTIVE' && new Date(musclePassSubscription?.expiryDate || 0) > new Date();
      if (isPaidActive) {
        setEntitlement({
          hasActivePass: true,
          isTrial: false,
          status: 'ACTIVE_PAID',
          planName: musclePassSubscription.planName || 'Muscle Pass Paid',
          expiresAt: musclePassSubscription.expiryDate,
          msLeft: Math.max(0, new Date(musclePassSubscription.expiryDate).getTime() - Date.now()),
          trialClaimed: statusRes.trialClaimed
        });
      } else {
        setEntitlement(statusRes);
      }

      setProfile(profileRes);
      setTodayLogs(logsRes.logs || []);
      setWeeklySummaries(weeklyRes || []);
    } catch (err) {
      console.error('[MusclePass load error]:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadEntitlementAndData();
  }, [userId, todayDateIST]);

  // Resolve today's meals for the student's actual mess
  const studentMessId = activeMess?.id || activeMess?.menuId || 'boys_junior';
  const resolvedMeals = getTodayHostelMeals(todayDay, null, studentMessId) || contextTodayMeals || [];

  // Run Smart Nutrition Engine
  const { summary, recommendations } = generateSmartMealPlan({
    todayMeals: resolvedMeals,
    profile: profile || { dailyProteinTargetG: currentUser?.proteinTarget || 120 },
    todayLogs
  });

  // Handler: Start 7-Day Free Trial (Zero Payment details)
  const handleStartFreeTrial = async () => {
    if (!userId) return;
    setTrialError('');
    setIsStartingTrial(true);

    try {
      await startTrial(userId);
      await loadEntitlementAndData();
      // Auto open profile onboarding if first time
      if (!profile) {
        setIsProfileModalOpen(true);
      }
    } catch (err) {
      setTrialError(err.message || 'Unable to start 7-day free trial.');
    } finally {
      setIsStartingTrial(false);
    }
  };

  // Handler: Save Nutrition Profile
  const handleSaveProfile = async (profileData) => {
    if (!userId) return;
    const saved = await saveNutritionProfile(userId, profileData);
    setProfile(saved);
  };

  // Handler: Save Meal Log
  const handleSaveLog = async (logData) => {
    if (!userId) return;
    await logMeal({
      userId,
      dateIST: todayDateIST,
      targetProteinG: profile?.dailyProteinTargetG || 120,
      ...logData
    });
    // Refresh logs
    const updated = await getDailyLogs(userId, todayDateIST);
    setTodayLogs(updated.logs || []);
    const weeklyUpdated = await getWeeklySummaries(userId);
    setWeeklySummaries(weeklyUpdated || []);
  };

  // Handler: Delete / Reset Meal Log
  const handleDeleteLog = async (mealType) => {
    if (!userId) return;
    await deleteMealLog(userId, todayDateIST, mealType, profile?.dailyProteinTargetG || 120);
    const updated = await getDailyLogs(userId, todayDateIST);
    setTodayLogs(updated.logs || []);
  };

  // Handler: Subscribe via Razorpay (Preserved existing flow)
  const handleSubscribe = async () => {
    if (!currentUser) return;
    setIsProcessingPayment(true);
    setPaymentMessage(null);

    await initiateMusclePassPayment({
      userId: currentUser.uid || currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      planId: selectedPlanId,
      onSuccess: (data) => {
        setIsProcessingPayment(false);
        setPaymentMessage({ type: 'success', text: `Payment verified! ${data.subscription?.planName || 'Muscle Pass'} activated.` });
        window.location.reload();
      },
      onError: (errMsg) => {
        setIsProcessingPayment(false);
        setPaymentMessage({ type: 'error', text: errMsg });
      }
    });
  };

  const isPassActive = entitlement.hasActivePass;
  const isTrialActive = entitlement.hasActivePass && entitlement.isTrial;
  const isTrialExpired = entitlement.trialExpired;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* ── 1. HEADER & PASS STATUS ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Muscle Pass
              </h1>
              {isTrialActive && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                  7-Day Demo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Hostel Mess Nutrition &amp; Macro Tracker • {formatCollegeDateDisplay()}
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div>
          {isTrialActive ? (
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center space-x-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatTimeRemaining(entitlement.msLeft)}</span>
            </div>
          ) : isPassActive ? (
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center space-x-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ACTIVE SUBSCRIBER</span>
            </div>
          ) : isTrialExpired ? (
            <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-black flex items-center space-x-1 border border-amber-300/50">
              <Clock className="w-3.5 h-3.5" />
              <span>TRIAL EXPIRED</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>FREE DEMO ELIGIBLE</span>
            </span>
          )}
        </div>
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

      {/* ── 2. ENTRY HERO BANNER / DEMO ACTIVATION (WHEN NOT ACTIVE) ────────── */}
      {!isPassActive && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white space-y-6 shadow-2xl border border-emerald-500/30">
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
              Smart Hostel Nutrition
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {isTrialExpired ? 'Your 7-Day Demo Has Ended' : 'Transform Your Hostel Dining With Muscle Pass'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isTrialExpired 
                ? 'All your logged meals and history remain safe. Choose a paid plan below to continue tracking your daily hostel macros seamlessly.'
                : 'Enter your body weight & protein target, see optimal portion recommendations from today’s actual mess menu, and track your daily intake.'}
            </p>
          </div>

          {trialError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trialError}</span>
            </div>
          )}

          {/* Prominent FREE DEMO Button */}
          {!entitlement.trialClaimed && (
            <div className="p-5 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-black text-white">Start Your 7-Day Free Demo</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    No payment details or credit cards required. Unlock full intelligent meal planning instantly.
                  </p>
                </div>

                <button
                  onClick={handleStartFreeTrial}
                  disabled={isStartingTrial}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{isStartingTrial ? 'ACTIVATING DEMO...' : 'START 7-DAY FREE DEMO'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 4 Official Paid Plans Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isTrialExpired ? 'Select a Plan to Continue' : 'Or Upgrade to Full Membership'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MUSCLE_PASS_PLAN_LIST.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 shadow-xl scale-[1.02]'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {plan.badge && (
                      <span className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-md ${
                        plan.popular ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                      }`}>
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wide text-slate-300">{plan.durationLabel}</h3>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-black text-white">₹{plan.price}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">/ {plan.durationLabel}</span>
                        </div>
                        {plan.savingsLabel && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black mt-0.5">
                            {plan.savingsLabel}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium leading-snug">
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{plan.durationDays} days</span>
                      <span className="text-emerald-400 font-bold">Select →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subscribe Action */}
            <div className="pt-3">
              <button
                onClick={handleSubscribe}
                disabled={isProcessingPayment}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessingPayment 
                    ? 'CONNECTING RAZORPAY...' 
                    : `SUBSCRIBE VIA RAZORPAY (₹${selectedPlan.price} FOR ${selectedPlan.durationLabel.toUpperCase()})`}
                </span>
              </button>
              <p className="text-[10px] text-slate-400 mt-2">
                Official Razorpay checkout. Supports UPI, Cards, NetBanking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. MAIN DASHBOARD (FOR ACTIVE TRIAL OR SUBSCRIBERS) ─────────────── */}
      {isPassActive && (
        <div className="space-y-6">
          
          {/* Top Bar: Profile Summary & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {profile ? `${profile.goal} Mode` : 'Profile Pending Setup'}
                </span>
                {profile && (
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    {profile.weightKg} kg · {profile.proteinPerKg || (summary.targetProtein / profile.weightKg).toFixed(1)} g/kg
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Diet: <strong>{profile?.dietaryPreference || 'Vegetarian'}</strong> · Portions: <strong>{profile?.preferredPortion || 'Regular'}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center space-x-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{profile ? 'Edit Profile' : 'Setup Profile'}</span>
              </button>

              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('planner')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'planner'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Today's Planner
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'insights'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Insights
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'planner' ? (
            <>
              {/* Main Circular Ring Nutrition Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Left: Circular Ring + Numbers */}
                  <div className="flex items-center space-x-6">
                    {/* SVG Circular Ring */}
                    <div className="relative w-28 h-28 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-slate-100 dark:text-slate-800"
                        />
                        {/* Progress stroke */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - summary.completionPercentage / 100)}
                          className="text-emerald-500 transition-all duration-700 ease-out"
                        />
                      </svg>
                      {/* Center % */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          {summary.completionPercentage}%
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          Achieved
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Today's Target
                      </span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                          {summary.consumedProtein}g
                        </span>
                        <span className="text-sm font-bold text-slate-400">
                          / {summary.targetProtein}g
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {summary.remainingProtein > 0 
                          ? `${summary.remainingProtein}g protein remaining` 
                          : '🎉 Daily Protein Target Reached!'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-[130px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                        Logged Meals
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {summary.completedMealsCount} / 4
                      </span>
                      <span className="text-[10px] text-slate-500 block">meals tracked</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-[130px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                        Est. Calories
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{summary.consumedCalories || 0}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block">kcal recorded</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── 4. TODAY'S MEAL RECOMMENDATIONS & LOGGING ──────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      Today's Mess Menu &amp; Smart Recommendations
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">
                      Real menu dishes for {todayDay} ({activeMess?.label || 'Your Mess'})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((cat) => {
                    const rec = recommendations[cat];
                    if (!rec) return null;

                    const isLogged = rec.status === 'COMPLETED';
                    const isSkipped = rec.status === 'SKIPPED';
                    const existingLog = todayLogs.find(l => l.mealType === cat);

                    return (
                      <div
                        key={cat}
                        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                          isLogged
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                            : isSkipped
                            ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {cat}
                            </span>

                            {isLogged && (
                              <span className="text-xs font-black text-emerald-600 flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Logged (+{existingLog?.proteinConsumed || 0}g)</span>
                              </span>
                            )}
                            {isSkipped && (
                              <span className="text-xs font-bold text-slate-400">
                                Skipped
                              </span>
                            )}
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                              {rec.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {rec.explanation}
                            </p>
                          </div>

                          {/* Recommended items breakdown */}
                          {!isLogged && !isSkipped && rec.suggestedItems.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Recommended Portions:
                              </span>
                              <div className="space-y-1">
                                {rec.suggestedItems.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-700 dark:text-slate-300">
                                      • {item.name} ({item.recommendedPortionLabel})
                                    </span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                      ~{item.recommendedProteinG}g
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">
                            {isLogged ? 'Completed' : `Target: ~${rec.targetProteinForSlot || 25}g`}
                          </span>

                          <button
                            onClick={() => setSelectedMealForLog({
                              category: cat,
                              title: rec.title,
                              items: rec.items,
                              existingLog
                            })}
                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1 transition-all cursor-pointer ${
                              isLogged
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            }`}
                          >
                            <span>{isLogged ? 'Edit Intake' : 'Log Meal'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <WeeklyInsightsCard
              weeklySummaries={weeklySummaries}
              targetProteinG={profile?.dailyProteinTargetG || 120}
            />
          )}

        </div>
      )}

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      {/* Onboarding / Profile Setup Modal */}
      <NutritionOnboardingModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialProfile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Meal Logging Modal */}
      {selectedMealForLog && (
        <MealLoggingModal
          isOpen={Boolean(selectedMealForLog)}
          onClose={() => setSelectedMealForLog(null)}
          mealCategory={selectedMealForLog.category}
          mealTitle={selectedMealForLog.title}
          parsedItems={selectedMealForLog.items}
          existingLog={selectedMealForLog.existingLog}
          onSaveLog={handleSaveLog}
          onDeleteLog={handleDeleteLog}
        />
      )}

    </div>
  );
};
