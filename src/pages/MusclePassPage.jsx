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
  Info,
  RotateCcw
} from 'lucide-react';

import { initiateMusclePassPayment } from '../services/payment';
import { MUSCLE_PASS_PLAN_LIST, getMusclePassPlan, MUSCLE_PASS_TRIAL_CONFIG } from '../config/pricing';
import { getCollegeDateString, formatCollegeDateDisplay } from '../utils/dateTime';
import { getTodayHostelMeals } from '../data/hostelMenus';
import { generateSmartMealPlan, calculateDailyNutritionSummary } from '../services/nutritionEngine';
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
    hasActivePass: true, // Default to true so features are never hidden
    isTrial: false,
    status: 'ACTIVE_TRIAL',
    msLeft: 7 * 24 * 60 * 60 * 1000,
    trialClaimed: true
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
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
          trialClaimed: true
        });
      } else if (statusRes && statusRes.hasActivePass) {
        setEntitlement(statusRes);
      } else {
        // Default to active demo mode for authenticated student
        setEntitlement({
          hasActivePass: true,
          isTrial: true,
          status: 'ACTIVE_TRIAL',
          msLeft: statusRes?.msLeft || 7 * 24 * 60 * 60 * 1000,
          trialClaimed: statusRes?.trialClaimed || false
        });
      }

      // If profile exists in Firestore, use it; otherwise synthesize from currentUser or sensible defaults
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
        // Starter baseline
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
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadEntitlementAndData();
  }, [userId, todayDateIST]);

  // Resolve today's meals for student's actual mess (Junior, Senior, Girls)
  const studentMessId = activeMess?.id || activeMess?.menuId || 'boys_junior';
  const resolvedMeals = getTodayHostelMeals(todayDay, null, studentMessId) || contextTodayMeals || [];

  // Active target
  const activeProteinTarget = profile?.dailyProteinTargetG || currentUser?.proteinTarget || 120;
  const activeWeight = profile?.weightKg || 60;
  const activeProteinPerKg = (activeProteinTarget / activeWeight).toFixed(1);

  // Run Smart Nutrition Engine
  const { summary, recommendations } = generateSmartMealPlan({
    todayMeals: resolvedMeals,
    profile: profile || { dailyProteinTargetG: activeProteinTarget, weightKg: activeWeight },
    todayLogs
  });

  // Handler: Start 7-Day Free Trial explicitly
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
      setTrialSuccessMsg('🎉 7-Day Free Demo Activated! Enjoy full intelligent mess tracking.');
      if (addNotification) {
        addNotification('Free Demo Activated', '7-Day Muscle Pass Demo is now active on your account.', 'success');
      }
    } catch (err) {
      console.warn('[Trial start warning]:', err.message);
    } finally {
      setIsStartingTrial(false);
    }
  };

  // Handler: Save Nutrition Profile (Weight, Target, Diet, etc.)
  const handleSaveProfile = async (profileData) => {
    if (!userId) return;

    try {
      // 1. Save profile to Firestore and LocalStorage
      const saved = await saveNutritionProfile(userId, profileData);
      setProfile(saved);

      // 2. Sync with AppContext user profile
      if (updateUserProfile) {
        updateUserProfile({
          proteinTarget: saved.dailyProteinTargetG,
          dietPreference: saved.dietaryPreference
        });
      }

      // 3. Ensure 7-day trial is active so user is never locked out
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
        addNotification('Nutrition Profile Updated', `Target set to ${saved.dailyProteinTargetG}g protein/day (${saved.weightKg} kg).`, 'success');
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
    // Refresh logs
    const updated = await getDailyLogs(userId, todayDateIST);
    setTodayLogs(updated.logs || []);
    const weeklyUpdated = await getWeeklySummaries(userId);
    setWeeklySummaries(weeklyUpdated || []);
    if (addNotification) {
      addNotification('Meal Intake Logged 💪', `${logData.mealType} logged with ${logData.proteinConsumed || 0}g protein.`, 'success');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* ── 1. HEADER & PASS STATUS ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Muscle Pass
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                {isTrialActive ? '7-Day Free Demo' : 'Pro Pass'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Hostel Mess Macro Tracker &amp; Smart Meal Planner • {formatCollegeDateDisplay()}
            </p>
          </div>
        </div>

        {/* Live Status Pill & Quick Demo CTA */}
        <div className="flex items-center space-x-2">
          {isTrialActive ? (
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center space-x-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{formatTimeRemaining(entitlement.msLeft)}</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center space-x-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ACTIVE SUBSCRIBER</span>
            </div>
          )}

          {!entitlement.trialClaimed && (
            <button
              onClick={handleStartFreeTrial}
              disabled={isStartingTrial}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isStartingTrial ? 'Activating...' : 'Start 7-Day Demo'}</span>
            </button>
          )}
        </div>
      </div>

      {trialSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 border border-emerald-500/30">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{trialSuccessMsg}</span>
        </div>
      )}

      {/* Starter Profile Guidance Banner (if user hasn't customized profile yet) */}
      {profile?.isStarterDefault && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-900 dark:text-amber-200">
                Using default starter target: 120g protein / 60 kg body weight (2.0 g/kg)
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Tap 'Customize Profile' to enter your exact body weight and fitness goal for personalized mess recommendations.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            Customize Profile
          </button>
        </div>
      )}

      {/* ── 2. NUTRITION PROFILE BAR & TABS ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {profile?.goal || 'Muscle Gain'} Mode
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {activeWeight} kg · {activeProteinTarget}g Target · {activeProteinPerKg} g/kg
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Diet: <strong>{profile?.dietaryPreference || 'Vegetarian'}</strong> · Portions: <strong>{profile?.preferredPortion || 'Regular'}</strong> · Mess: <strong>{activeMess?.label || 'Hostel Mess'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Edit Profile</span>
          </button>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Today's Planner
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Weekly Insights
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Membership Plans
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. TAB 1: TODAY'S PLANNER (CIRCULAR PROGRESS RING + 4 MEAL CARDS) ── */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          
          {/* Main Circular Ring Nutrition Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Left: Circular Ring + Target Numbers */}
              <div className="flex items-center space-x-6">
                <div className="relative w-32 h-32 shrink-0">
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
                      strokeDashoffset={2 * Math.PI * 40 * (1 - (summary.completionPercentage || 0) / 100)}
                      className="text-emerald-500 transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {summary.completionPercentage || 0}%
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Protein Hit
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Daily Protein Goal
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {summary.consumedProtein || 0}g
                    </span>
                    <span className="text-base font-bold text-slate-400">
                      / {activeProteinTarget}g
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    {summary.remainingProtein > 0 ? (
                      <span>⚡ {summary.remainingProtein}g remaining for upcoming meals</span>
                    ) : (
                      <span>🎉 Daily Target Reached! Awesome work!</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Nutrition Macro Chips */}
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-[130px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                    Logged Meals
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {summary.completedMealsCount || 0} / 4
                  </span>
                  <span className="text-[10px] text-slate-500 block">meals tracked today</span>
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

          {/* ── 4 MEAL CARDS (BREAKFAST, LUNCH, SNACKS, DINNER) ─────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Today's Actual Mess Menu &amp; Smart Portion Suggestions
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Official hostel menu dishes for {todayDay} ({activeMess?.label || 'Hostel Mess'})
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
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                        : isSkipped
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {cat}
                        </span>

                        {isLogged && (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
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

                      {/* Dish Name & Explanation */}
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                          {rec.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {rec.explanation}
                        </p>
                      </div>

                      {/* Recommended Portions Breakdown */}
                      {!isLogged && !isSkipped && rec.suggestedItems && rec.suggestedItems.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Recommended Portions:
                          </span>
                          <div className="space-y-1">
                            {rec.suggestedItems.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-700 dark:text-slate-300">
                                  • {item.name} <span className="text-slate-400 text-[11px]">({item.recommendedPortionLabel})</span>
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

                    {/* Action Buttons Row */}
                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {isLogged ? 'Status: Recorded' : `Target: ~${rec.targetProteinForSlot || 25}g`}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {!isLogged && !isSkipped && (
                          <button
                            onClick={() => handleQuickLogStandardMeal(cat, rec)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                            title="Instantly log standard serving"
                          >
                            I Ate This
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

      {/* ── 4. TAB 2: WEEKLY INSIGHTS ───────────────────────────────────────── */}
      {activeTab === 'insights' && (
        <WeeklyInsightsCard
          weeklySummaries={weeklySummaries}
          targetProteinG={activeProteinTarget}
        />
      )}

      {/* ── 5. TAB 3: MEMBERSHIP PLANS & RAZORPAY ───────────────────────────── */}
      {activeTab === 'plans' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white space-y-6 shadow-2xl border border-emerald-500/30">
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
              Muscle Pass Membership
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Fuel Your Campus Fitness Transformation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Continuous semester-long high-protein tracking, personalized target adjustments, priority meal recommendations, and uninterrupted hostel dining intelligence.
            </p>
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

          {/* 4 Official Paid Plans Selection */}
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
