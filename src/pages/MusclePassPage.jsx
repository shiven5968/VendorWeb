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
  TrendingUp,
  Bot,
  User,
  BookOpen
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

import { Modal } from '../components/ui';
import { NutritionOnboardingModal } from '../components/musclePass/NutritionOnboardingModal';
import { MealLoggingModal } from '../components/musclePass/MealLoggingModal';
import { TodayDashboard } from '../components/musclePass/TodayDashboard';
import { MyMealsSection } from '../components/musclePass/MyMealsSection';
import { ProgressSection } from '../components/musclePass/ProgressSection';
import { AICoachSection } from '../components/musclePass/AICoachSection';
import { MyProfileSection } from '../components/musclePass/MyProfileSection';

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
  const [isBuyPremiumModalOpen, setIsBuyPremiumModalOpen] = useState(false);

  // Nutrition Profile
  const [profile, setProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 5 Main Navigation Sections: 'today' | 'meals' | 'progress' | 'coach' | 'profile'
  const [activeTab, setActiveTab] = useState('today');

  // Daily Meal Planner & Logs
  const [todayLogs, setTodayLogs] = useState([]);
  const [selectedMealForLog, setSelectedMealForLog] = useState(null);
  const [weeklySummaries, setWeeklySummaries] = useState([]);

  // Outside Food Quick Logger Modal
  const [showOutsideFoodModal, setShowOutsideFoodModal] = useState(false);
  const [outsideFoodName, setOutsideFoodName] = useState('');
  const [outsideProteinG, setOutsideProteinG] = useState('25');
  const [outsideCalories, setOutsideCalories] = useState('130');
  const [outsideMealSlot, setOutsideMealSlot] = useState('Snacks');

  // Payment state (Razorpay)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

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
          name: currentUser.name || 'Student Athlete',
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
          name: currentUser?.name || 'Student Athlete',
          weightKg: 65,
          dailyProteinTargetG: 130,
          goal: 'Muscle Gain',
          dietaryPreference: 'Vegetarian',
          preferredPortion: 'Regular',
          allergies: [],
          proteinPerKg: 2.0
        });
      }

      setTodayLogs(logsRes?.logs || []);
      setWeeklySummaries(weeklyRes || []);
    } catch (err) {
      console.warn('[MusclePass load error]:', err);
    }
  };

  useEffect(() => {
    loadEntitlementAndData();
  }, [userId, musclePassSubscription]);

  // Resolve today's actual 4 mess meals
  const dayName = todayDay || new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const rawHostelMeals = getTodayHostelMeals(activeMess || 'boys_junior', dayName);
  const resolvedMeals = (contextTodayMeals && contextTodayMeals.length > 0) ? contextTodayMeals : rawHostelMeals;

  // Active student targets
  const activeProteinTarget = profile?.dailyProteinTargetG || 120;
  const activeWeight = profile?.weightKg || 65;

  // Run Smart Nutrition & Recommendation Engine
  const { summary, recommendations } = generateSmartMealPlan({
    todayMeals: resolvedMeals,
    profile: profile || { dailyProteinTargetG: activeProteinTarget, dietaryPreference: 'Vegetarian' },
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
      setTrialSuccessMsg('🎉 7-Day Free Demo Activated! Full nutrition intelligence is now unlocked.');
      if (addNotification) {
        addNotification('Free Demo Activated', '7-Day Muscle Pass Demo is now active.', 'success');
      }
      setIsProfileModalOpen(true);
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
      const saved = await saveNutritionProfile(userId, {
        ...profileData,
        name: currentUser?.name || 'Student'
      });
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

  // Handler: Skip a meal
  const handleSkipMeal = async (mealType) => {
    await handleSaveLog({
      mealType,
      status: 'SKIPPED',
      items: [],
      proteinConsumed: 0,
      caloriesConsumed: 0
    });
  };

  // Handler: Quick-log preset campus staple
  const handleQuickLogPreset = async (staple, mealSlot = 'Snacks') => {
    const existingLog = todayLogs.find(l => l.mealType === mealSlot);
    const existingItems = existingLog && Array.isArray(existingLog.items) ? [...existingLog.items] : [];

    existingItems.push({
      name: staple.name,
      portion: 1.0,
      proteinPerServing: staple.proteinG,
      caloriesPerServing: staple.calories,
      proteinConsumed: staple.proteinG,
      caloriesConsumed: staple.calories,
      isExtra: true
    });

    let totalP = 0;
    let totalC = 0;
    for (const it of existingItems) {
      totalP += Number(it.proteinConsumed) || 0;
      totalC += Number(it.caloriesConsumed) || 0;
    }

    await handleSaveLog({
      mealType: mealSlot,
      status: 'COMPLETED',
      items: existingItems,
      proteinConsumed: Math.round(totalP * 10) / 10,
      caloriesConsumed: Math.round(totalC)
    });
  };

  // Handler: Outside Food Modal Submit
  const handleLogOutsideFood = async (e) => {
    e.preventDefault();
    if (!outsideFoodName.trim()) return;

    const prot = Number(outsideProteinG) || 0;
    const cals = Number(outsideCalories) || 0;

    const existingLog = todayLogs.find(l => l.mealType === outsideMealSlot);
    const existingItems = existingLog && Array.isArray(existingLog.items) ? [...existingLog.items] : [];

    existingItems.push({
      name: outsideFoodName.trim(),
      portion: 1.0,
      proteinPerServing: prot,
      caloriesPerServing: cals,
      proteinConsumed: prot,
      caloriesConsumed: cals,
      isExtra: true
    });

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
    const weeklyUpdated = await getWeeklySummaries(userId);
    setWeeklySummaries(weeklyUpdated || []);
  };

  // Handler: Subscribe via Razorpay
  const handleSubscribe = async (planId) => {
    if (!currentUser) return;
    setIsProcessingPayment(true);
    setPaymentMessage(null);

    await initiateMusclePassPayment({
      userId: currentUser.uid || currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      planId,
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
      
      {/* ── 1. PROMPT 7-DAY DEMO BANNER WITH BUY PREMIUM OPTION BELOW DEMO ──── */}
      {!entitlement.trialClaimed && (
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-emerald-600/40">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                Exclusive Trial
              </span>
              <span className="text-xs font-bold text-emerald-200">Zero Payment Required</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight">
              Start Your 7-Day Free Premium Demo
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-medium">
              Explore your personalized nutrition experience powered by your actual campus mess menu.
            </p>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2.5 shrink-0 self-start sm:self-auto min-w-[220px]">
            {/* 1. START 7-DAY FREE DEMO */}
            <button
              onClick={handleStartFreeTrial}
              disabled={isStartingTrial}
              className="w-full px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>{isStartingTrial ? 'Activating...' : 'START 7-DAY FREE DEMO'}</span>
            </button>

            {/* 2. BUY PREMIUM OPTION (DIRECTLY BELOW DEMO) */}
            <button
              onClick={() => setIsBuyPremiumModalOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 border border-amber-300"
            >
              <Crown className="w-4 h-4 text-amber-950 fill-amber-950" />
              <span>BUY PREMIUM PASS</span>
            </button>
          </div>
        </div>
      )}

      {trialSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center space-x-2.5 border border-emerald-200 shadow-2xs">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{trialSuccessMsg}</span>
        </div>
      )}

      {/* ── 2. BRAND HEADER & STATUS BAR ────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Greeting */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                MUSCLE PASS
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100/70 text-emerald-800">
                {isTrialActive ? '7-Day Demo' : 'Pro Pass'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Eat Smart. Train Better. Progress Daily. • {formatCollegeDateDisplay()}
            </p>
          </div>
        </div>

        {/* Right: Quick Target Badge, Buy Premium & Settings Shortcut */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsBuyPremiumModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs border border-amber-300"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-950" />
            <span>Buy Premium</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeProteinTarget}g Target ({activeWeight} kg)</span>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs"
            title="Edit Weight & Target"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── 3. FIVE CLEAN NAVIGATION TABS ───────────────────────────────────── */}
      <div className="flex overflow-x-auto no-scrollbar rounded-2xl bg-slate-100/90 p-1.5 text-xs font-black shadow-inner">
        {[
          { id: 'today', label: 'TODAY', icon: Flame },
          { id: 'meals', label: 'MY MEALS', icon: UtensilsCrossed },
          { id: 'progress', label: 'PROGRESS', icon: TrendingUp },
          { id: 'coach', label: 'NUTRITION COACH', icon: Sparkles },
          { id: 'profile', label: 'MY PROFILE', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[85px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 4. SECTION ROUTING ──────────────────────────────────────────────── */}
      
      {/* 1. TODAY */}
      {activeTab === 'today' && (
        <TodayDashboard
          profile={profile}
          summary={summary}
          recommendations={recommendations}
          todayMeals={resolvedMeals}
          todayLogs={todayLogs}
          entitlement={entitlement}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenOutsideFoodModal={(preset) => {
            if (preset) {
              setOutsideFoodName(preset.name);
              setOutsideProteinG(preset.protein);
              setOutsideCalories(preset.calories);
            }
            setShowOutsideFoodModal(true);
          }}
          onOpenMealModal={setSelectedMealForLog}
          onQuickLogStandardMeal={handleQuickLogStandardMeal}
          onSkipMeal={handleSkipMeal}
          onSelectTab={setActiveTab}
        />
      )}

      {/* 2. MY MEALS */}
      {activeTab === 'meals' && (
        <MyMealsSection
          todayLogs={todayLogs}
          summary={summary}
          onOpenMealModal={setSelectedMealForLog}
          onOpenOutsideFoodModal={() => setShowOutsideFoodModal(true)}
          onDeleteLog={handleDeleteLog}
          onQuickLogPreset={handleQuickLogPreset}
        />
      )}

      {/* 3. PROGRESS */}
      {activeTab === 'progress' && (
        <ProgressSection
          weeklySummaries={weeklySummaries}
          targetProteinG={activeProteinTarget}
          userId={userId}
        />
      )}

      {/* 4. NUTRITION COACH */}
      {activeTab === 'coach' && (
        <AICoachSection
          profile={profile}
          summary={summary}
          recommendations={recommendations}
          todayMeals={resolvedMeals}
        />
      )}

      {/* 5. MY PROFILE */}
      {activeTab === 'profile' && (
        <MyProfileSection
          profile={profile}
          entitlement={entitlement}
          todayLogs={todayLogs}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onSubscribe={handleSubscribe}
          isProcessingPayment={isProcessingPayment}
          paymentMessage={paymentMessage}
        />
      )}

      {/* ── 5. MODALS ───────────────────────────────────────────────────────── */}
      
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Log Outside Food / Shake
              </h3>
              <button
                onClick={() => setShowOutsideFoodModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogOutsideFood} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 Scoop Whey Protein / 2 Boiled Eggs"
                  value={outsideFoodName}
                  onChange={e => setOutsideFoodName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={outsideProteinG}
                    onChange={e => setOutsideProteinG(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-emerald-500"
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer"
                >
                  Add to Daily Total
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BUY PREMIUM PLAN MODAL ─────────────────────────────────────────── */}
      <Modal
        isOpen={isBuyPremiumModalOpen}
        onClose={() => setIsBuyPremiumModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 p-2">
          {/* Header */}
          <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 text-amber-950 flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-6 h-6 fill-amber-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-2xs">
                  Official Membership
                </span>
                <span className="text-[11px] font-bold text-emerald-600">Razorpay 256-Bit Secure</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Upgrade to Muscle Pass Premium
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Uninterrupted mess nutrition intelligence, plate portion sizing, and student macro analytics.
              </p>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MUSCLE_PASS_PLAN_LIST.map((plan) => {
              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 relative ${
                    plan.popular
                      ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-emerald-500/10 border-amber-400 shadow-md ring-2 ring-amber-300'
                      : 'bg-white border-slate-200/90 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 shadow-2xs">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                      {plan.savingsLabel && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {plan.savingsLabel}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-xs text-slate-400 font-bold">/ {plan.durationLabel}</span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      setIsBuyPremiumModalOpen(false);
                      await handleSubscribe(plan.id);
                    }}
                    disabled={isProcessingPayment}
                    className={`w-full py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 border border-amber-300'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Get {plan.durationLabel} Pass</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Secure Reassurance Footer */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay Verified • UPI (Google Pay, PhonePe, Paytm), Cards &amp; NetBanking</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Instant</span>
          </div>
        </div>
      </Modal>

    </div>
  );
};
