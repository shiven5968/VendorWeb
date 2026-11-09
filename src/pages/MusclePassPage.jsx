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
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Check, 
  Sliders, 
  UtensilsCrossed, 
  Plus, 
  ChevronRight, 
  Calendar,
  Layers,
  Award,
  Crown,
  Target,
  ArrowRight,
  Shield,
  CheckCheck,
  TrendingUp
} from 'lucide-react';

import { initiateMusclePassPayment } from '../services/payment';
import { MUSCLE_PASS_PLAN_LIST, getMusclePassPlan } from '../config/pricing';
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
    todayMeals: contextTodayMeals, 
    musclePassSubscription,
    updateUserProfile,
    addNotification
  } = useApp();
  const { user } = useAuth();

  const userId = currentUser?.uid || currentUser?.id || user?.uid;

  // Active status & entitlement
  const [entitlement, setEntitlement] = useState({
    hasActivePass: true,
    isTrial: false,
    status: 'ACTIVE_TRIAL',
    msLeft: 7 * 24 * 60 * 60 * 1000,
    trialClaimed: true
  });
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [trialSuccessMsg, setTrialSuccessMsg] = useState('');

  // Nutrition Profile
  const [profile, setProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Daily Meal Planner & Logs
  const [todayLogs, setTodayLogs] = useState([]);
  const [selectedMealForLog, setSelectedMealForLog] = useState(null);
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'insights' | 'plans'
  const [weeklySummaries, setWeeklySummaries] = useState([]);

  // Outside Food Quick Logger
  const [showOutsideFoodModal, setShowOutsideFoodModal] = useState(false);
  const [outsideFoodName, setOutsideFoodName] = useState('');
  const [outsideProteinG, setOutsideProteinG] = useState('25');
  const [outsideCalories, setOutsideCalories] = useState('130');
  const [outsideMealSlot, setOutsideMealSlot] = useState('Snacks');

  // Payment state (Razorpay)
  const [selectedPlanId, setSelectedPlanId] = useState('MUSCLE_3_MONTHS');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

  const selectedPlan = getMusclePassPlan(selectedPlanId);
  const todayDateIST = getCollegeDateString();

  // Load entitlement, profile, and daily logs
  const loadEntitlementAndData = async () => {
    if (!userId) return;

    try {
      const [statusRes, profileRes, logsRes, weeklyRes] = await Promise.all([
        checkStatus(userId),
        getNutritionProfile(userId),
        getDailyLogs(userId, todayDateIST),
        getWeeklySummaries(userId)
      ]);

      const isPaidActive = musclePassSubscription?.status === 'ACTIVE' && new Date(musclePassSubscription?.expiryDate || 0) > new Date();
      if (isPaidActive) {
        setEntitlement({
          hasActivePass: true,
          isTrial: false,
          status: 'ACTIVE_PAID',
          planName: musclePassSubscription.planName || 'Muscle Pass Pro',
          expiresAt: musclePassSubscription.expiryDate,
          msLeft: Math.max(0, new Date(musclePassSubscription.expiryDate).getTime() - Date.now()),
          trialClaimed: true
        });
      } else if (statusRes && statusRes.hasActivePass) {
        setEntitlement(statusRes);
      } else {
        setEntitlement({
          hasActivePass: true,
          isTrial: true,
          status: 'ACTIVE_TRIAL',
          msLeft: statusRes?.msLeft || 7 * 24 * 60 * 60 * 1000,
          trialClaimed: statusRes?.trialClaimed || false
        });
      }

      if (profileRes && profileRes.weightKg) {
        setProfile(profileRes);
      } else if (currentUser?.weight || currentUser?.proteinTarget) {
        const synth = {
          userId,
          weightKg: Number(currentUser.weight) || 60,
          dailyProteinTargetG: Number(currentUser.proteinTarget) || 120,
          goal: currentUser.fitnessGoal || 'Muscle Gain',
          dietaryPreference: currentUser.dietPreference || 'Vegetarian',
          preferredPortion: 'Regular',
          allergies: [],
          proteinPerKg: Math.round(((Number(currentUser.proteinTarget) || 120) / (Number(currentUser.weight) || 60)) * 10) / 10
        };
        setProfile(synth);
      } else {
        setProfile({
          userId,
          weightKg: 60,
          dailyProteinTargetG: 120,
          goal: 'Muscle Gain',
          dietaryPreference: 'Vegetarian',
          preferredPortion: 'Regular',
          allergies: [],
          proteinPerKg: 2.0,
          isStarterDefault: true
        });
      }

      setTodayLogs(logsRes?.logs || []);
      setWeeklySummaries(weeklyRes || []);
    } catch (err) {
      console.error('[MusclePass load error]:', err);
    }
  };

  useEffect(() => {
    loadEntitlementAndData();
  }, [userId, todayDateIST]);

  // Resolve today's meals for student's actual mess (Junior, Senior, Girls)
  const studentMessId = activeMess?.id || activeMess?.menuId || 'boys_junior';
  const resolvedMeals = getTodayHostelMeals(todayDay, null, studentMessId) || contextTodayMeals || [];

  const activeProteinTarget = profile?.dailyProteinTargetG || currentUser?.proteinTarget || 120;
  const activeWeight = profile?.weightKg || 60;
  const activeProteinPerKg = (activeProteinTarget / activeWeight).toFixed(1);

  // Run Smart Nutrition Engine
  const { summary, recommendations } = generateSmartMealPlan({
    todayMeals: resolvedMeals,
    profile: profile || { dailyProteinTargetG: activeProteinTarget, weightKg: activeWeight },
    todayLogs
  });

  // Handler: Start 7-Day Free Trial
  const handleStartFreeTrial = async () => {
    if (!userId) return;
    setIsStartingTrial(true);
    setTrialSuccessMsg('');

    try {
      const trial = await startTrial(userId);
      setEntitlement({
        hasActivePass: true,
        isTrial: true,
        status: 'ACTIVE_TRIAL',
        planName: '7-Day Free Trial',
        startedAt: trial.startedAt,
        expiresAt: trial.expiresAt,
        msLeft: 7 * 24 * 60 * 60 * 1000,
        trialClaimed: true
      });
      setTrialSuccessMsg('🎉 7-Day Free Demo Activated! Enjoy full intelligent mess macro tracking.');
      if (addNotification) {
        addNotification('Free Demo Activated', '7-Day Muscle Pass Demo is now active.', 'success');
      }
    } catch (err) {
      console.warn('[Trial start warning]:', err.message);
    } finally {
      setIsStartingTrial(false);
    }
  };

  // Handler: Save Nutrition Profile
  const handleSaveProfile = async (profileData) => {
    if (!userId) return;

    try {
      const saved = await saveNutritionProfile(userId, profileData);
      setProfile(saved);

      if (updateUserProfile) {
        updateUserProfile({
          proteinTarget: saved.dailyProteinTargetG,
          dietPreference: saved.dietaryPreference
        });
      }

      if (!entitlement.hasActivePass || entitlement.status === 'NONE') {
        await startTrial(userId);
        setEntitlement({
          hasActivePass: true,
          isTrial: true,
          status: 'ACTIVE_TRIAL',
          planName: '7-Day Free Trial',
          msLeft: 7 * 24 * 60 * 60 * 1000,
          trialClaimed: true
        });
      }

      if (addNotification) {
        addNotification('Nutrition Profile Updated', `Target: ${saved.dailyProteinTargetG}g protein/day (${saved.weightKg} kg).`, 'success');
      }
    } catch (err) {
      console.error('[Save profile error]:', err);
    }
  };

  // Handler: Save Meal Log
  const handleSaveLog = async (logData) => {
    if (!userId) return;
    await logMeal({
      userId,
      dateIST: todayDateIST,
      targetProteinG: activeProteinTarget,
      ...logData
    });
    const updated = await getDailyLogs(userId, todayDateIST);
    setTodayLogs(updated.logs || []);
    const weeklyUpdated = await getWeeklySummaries(userId);
    setWeeklySummaries(weeklyUpdated || []);
    if (addNotification) {
      addNotification('Meal Logged 💪', `${logData.mealType}: +${logData.proteinConsumed || 0}g protein.`, 'success');
    }
  };

  // Quick 1-click "I Ate This" standard portion logging
  const handleQuickLogStandardMeal = async (cat, rec) => {
    if (!rec) return;
    const items = (rec.items || []).map(item => ({
      name: item.name,
      portion: 1.0,
      proteinPerServing: item.proteinG || 0,
      caloriesPerServing: item.calories || 0,
      proteinConsumed: item.proteinG || 0,
      caloriesConsumed: item.calories || 0,
      isExtra: false
    }));

    let mealProtein = 0;
    let mealCals = 0;
    for (const it of items) {
      mealProtein += Number(it.proteinConsumed) || 0;
      mealCals += Number(it.caloriesConsumed) || 0;
    }

    await handleSaveLog({
      mealType: cat,
      status: 'COMPLETED',
      items,
      proteinConsumed: Math.round(mealProtein * 10) / 10,
      caloriesConsumed: Math.round(mealCals)
    });
  };

  // Handler: Log Outside Food / Shake
  const handleLogOutsideFood = async (e) => {
    e.preventDefault();
    if (!outsideFoodName.trim()) return;

    const extraItem = {
      name: outsideFoodName.trim(),
      portion: 1.0,
      proteinPerServing: Number(outsideProteinG) || 0,
      caloriesPerServing: Number(outsideCalories) || 0,
      proteinConsumed: Number(outsideProteinG) || 0,
      caloriesConsumed: Number(outsideCalories) || 0,
      isExtra: true
    };

    const existingSlotLog = todayLogs.find(l => l.mealType === outsideMealSlot);
    const existingItems = existingSlotLog?.items ? [...existingSlotLog.items] : [];
    existingItems.push(extraItem);

    let totalP = 0;
    let totalC = 0;
    for (const it of existingItems) {
      totalP += Number(it.proteinConsumed) || 0;
      totalC += Number(it.caloriesConsumed) || 0;
    }

    await handleSaveLog({
      mealType: outsideMealSlot,
      status: 'COMPLETED',
      items: existingItems,
      proteinConsumed: Math.round(totalP * 10) / 10,
      caloriesConsumed: Math.round(totalC)
    });

    setOutsideFoodName('');
    setShowOutsideFoodModal(false);
  };

  // Handler: Delete / Reset Meal Log
  const handleDeleteLog = async (mealType) => {
    if (!userId) return;
    await deleteMealLog(userId, todayDateIST, mealType, activeProteinTarget);
    const updated = await getDailyLogs(userId, todayDateIST);
    setTodayLogs(updated.logs || []);
  };

  // Handler: Subscribe via Razorpay
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

  const isTrialActive = entitlement.isTrial;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-16 animate-fade-in">
      
      {/* ── 1. BESPOKE VIP ATHLETE PASS (LUXURY CARD PRESENTATION) ───────────── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-[#071f18] to-slate-950 text-white p-6 sm:p-8">
        
        {/* Subtle Luxury Sheen Background Accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Brand, Crest, and Student Athlete Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
                <Crown className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-black tracking-widest uppercase text-amber-300">
                    MESSMATES ATHLETICS
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>MUSCLE PASS</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm">
                    {isTrialActive ? 'VIP Demo' : 'VIP Pro Pass'}
                  </span>
                </h1>
              </div>
            </div>

            {/* Student Pass Bio line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium pt-1 border-t border-white/10">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {currentUser?.name || 'Student Athlete'}
              </span>
              <span className="text-slate-400">·</span>
              <span>{currentUser?.block || 'Hostel Campus'}</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-300 font-semibold">{formatCollegeDateDisplay()}</span>
            </div>
          </div>

          {/* Right: Pass Status Capsule & Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3">
            <div className="flex items-center gap-2">
              {isTrialActive ? (
                <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center space-x-2 shadow-inner">
                  <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{formatTimeRemaining(entitlement.msLeft)} Demo Left</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-200 text-xs font-black flex items-center space-x-2 shadow-inner">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>ELITE VIP MEMBER</span>
                </div>
              )}

              {!entitlement.trialClaimed && (
                <button
                  onClick={handleStartFreeTrial}
                  disabled={isStartingTrial}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isStartingTrial ? 'Activating...' : 'Activate 7-Day Free Demo'}</span>
                </button>
              )}
            </div>

            {/* Direct Switch to Pro Button */}
            {isTrialActive && (
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade to Pro (From ₹69)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {trialSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2.5 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{trialSuccessMsg}</span>
        </div>
      )}

      {/* ── 2. ATHLETE METRICS & NAVIGATION TABS ──────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Profile Attributes */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Weight:</span>
            <span>{activeWeight} kg</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target: {activeProteinTarget}g/day</span>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400 font-semibold">({activeProteinPerKg} g/kg)</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
            {profile?.goal || 'Muscle Gain'} · {profile?.dietaryPreference || 'Vegetarian'}
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-emerald-600 flex items-center space-x-1.5 transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-xs"
          >
            <Sliders className="w-3 h-3 text-slate-500" />
            <span>Customize Target</span>
          </button>
        </div>

        {/* Clean Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs font-black self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ⚡ Daily Fuel Plan
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📊 7-Day Trends
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            💎 Pro Passes
          </button>
        </div>

      </div>

      {/* ── 3. TAB 1: TODAY'S FUEL PLAN (PROGRESS RING + MEAL BREAKDOWNS) ─────── */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          
          {/* Main Hero HUD: Progress Dial & Macros */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Left: High-Precision Radial Ring */}
              <div className="flex items-center space-x-6">
                <div className="relative w-36 h-36 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(100, summary.completionPercentage || 0) / 100)}
                      className="text-emerald-500 transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {summary.completionPercentage || 0}%
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Target Hit
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Today's Protein Fuel
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {summary.consumedProtein || 0}g
                    </span>
                    <span className="text-base font-bold text-slate-400">
                      / {activeProteinTarget}g
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {summary.remainingProtein > 0 ? (
                      <span>⚡ {summary.remainingProtein}g needed from remaining meals</span>
                    ) : (
                      <span>🎉 Daily Target Achieved! Fantastic discipline!</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Tactile Macro Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                    Logged Meals
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {summary.completedMealsCount || 0} / 4
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">tracked today</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                    Est. Calories
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center space-x-1">
                    <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{summary.consumedCalories || 0}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">kcal intake</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center min-w-[120px] col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                    Remaining
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {Math.max(0, summary.remainingProtein || 0)}g
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">protein left</span>
                </div>
              </div>

            </div>

            {/* Quick Action: Log Outside Food (Shake / Canteen / Boiled Eggs) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                💡 Having a Whey Protein shake, boiled eggs, or outside canteen meal?
              </span>
              <button
                onClick={() => setShowOutsideFoodModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Outside Food / Shake</span>
              </button>
            </div>
          </div>

          {/* ── 4 REAL MESS MEAL CARDS (BREAKFAST, LUNCH, SNACKS, DINNER) ────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Today's Actual Mess Menu &amp; Smart Portions
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Personalized intake recommendations for {todayDay} ({activeMess?.label || 'Hostel Mess'})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                        : isSkipped
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400'
                    }`}
                  >
                    <div className="space-y-3.5">
                      
                      {/* Top Slot Pill & Status */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {cat}
                        </span>

                        {isLogged && (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Logged (+{existingLog?.proteinConsumed || 0}g)</span>
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-xs font-bold text-slate-400">
                            Skipped
                          </span>
                        )}
                      </div>

                      {/* Dish Name & Context Explanation */}
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {rec.explanation}
                        </p>
                      </div>

                      {/* Recommended Portions Breakdown */}
                      {!isLogged && !isSkipped && rec.suggestedItems && rec.suggestedItems.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Recommended Portions:
                          </span>
                          <div className="space-y-1.5">
                            {rec.suggestedItems.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                                  • {item.name} <span className="text-slate-400 text-[10px]">({item.recommendedPortionLabel})</span>
                                </span>
                                <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                                  ~{item.recommendedProteinG}g
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {isLogged ? 'Status: Recorded' : `Target: ~${rec.targetProteinForSlot || 25}g`}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {!isLogged && !isSkipped && (
                          <button
                            onClick={() => handleQuickLogStandardMeal(cat, rec)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-black transition-all cursor-pointer flex items-center space-x-1"
                            title="Instant 1-tap log of standard serving"
                          >
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>1-Tap Log</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedMealForLog({
                            category: cat,
                            title: rec.title,
                            items: rec.items,
                            existingLog
                          })}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1 transition-all cursor-pointer ${
                            isLogged
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          <span>{isLogged ? 'Edit Intake' : 'Customize / Log'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── 4. TAB 2: WEEKLY INSIGHTS & ADHERENCE ───────────────────────────── */}
      {activeTab === 'insights' && (
        <WeeklyInsightsCard
          weeklySummaries={weeklySummaries}
          targetProteinG={activeProteinTarget}
        />
      )}

      {/* ── 5. TAB 3: MEMBERSHIP PLANS & UPGRADE (HIGH-CONVERTING LUXURY TIERS) ─ */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto space-y-2 py-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              👑 ELITE STUDENT FITNESS PASS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Fuel Your Campus Physique Transformation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Every day your hostel mess serves hundreds of grams of protein. Muscle Pass tells you exactly which dishes to pile onto your plate, how many bowls to take, and what to avoid to hit your exact fitness targets.
            </p>
          </div>

          {paymentMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
              paymentMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30'
            }`}>
              {paymentMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{paymentMessage.text}</span>
            </div>
          )}

          {/* 4 Official Paid Plans Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MUSCLE_PASS_PLAN_LIST.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-950 text-white border-emerald-400 ring-2 ring-emerald-400 shadow-xl scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400/60 shadow-sm'
                  }`}
                >
                  {plan.badge && (
                    <span className={`absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-md ${
                      isPopular 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-black uppercase tracking-wider ${
                        isSelected ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {plan.durationLabel}
                      </h3>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className={`text-3xl font-black ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          ₹{plan.price}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">/ {plan.durationLabel}</span>
                      </div>
                      {plan.savingsLabel && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black mt-1">
                          {plan.savingsLabel}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-snug font-medium ${
                      isSelected ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {plan.tagline}
                    </p>
                  </div>

                  <div className={`pt-4 mt-4 border-t flex items-center justify-between text-xs font-bold ${
                    isSelected ? 'border-white/10 text-slate-300' : 'border-slate-100 dark:border-slate-800 text-slate-500'
                  }`}>
                    <span>{plan.durationDays} days access</span>
                    <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-black">
                      {isSelected ? 'Selected' : 'Choose'} →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout & Guarantees Box */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 text-xs font-black uppercase tracking-wider">
                  Selected Plan:
                </span>
                <span className="text-white text-base font-black">
                  {selectedPlan?.name || 'Muscle Pass Pro'} — ₹{selectedPlan?.price}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                🔒 Instant activation via Razorpay. Supports UPI, Google Pay, PhonePe, Paytm, RuPay &amp; NetBanking.
              </p>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isProcessingPayment}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isProcessingPayment 
                  ? 'CONNECTING RAZORPAY...' 
                  : `SUBSCRIBE FOR ₹${selectedPlan?.price} (${selectedPlan?.durationLabel.toUpperCase()})`}
              </span>
            </button>
          </div>

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

      {/* Quick Outside Food Logger Modal */}
      {showOutsideFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Log Outside Food / Shake
              </h3>
              <button
                onClick={() => setShowOutsideFoodModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogOutsideFood} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 Scoop Whey Protein / 2 Boiled Eggs"
                  value={outsideFoodName}
                  onChange={e => setOutsideFoodName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    required
                    value={outsideProteinG}
                    onChange={e => setOutsideProteinG(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={outsideCalories}
                    onChange={e => setOutsideCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Add to Meal Slot
                </label>
                <select
                  value={outsideMealSlot}
                  onChange={e => setOutsideMealSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOutsideFoodModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Add to Today's Total
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
