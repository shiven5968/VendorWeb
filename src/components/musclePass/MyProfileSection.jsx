import React, { useState } from 'react';
import { 
  User, 
  Target, 
  Scale, 
  ShieldCheck, 
  CreditCard, 
  Sliders, 
  Download, 
  Lock, 
  Check, 
  AlertCircle, 
  Clock, 
  Zap, 
  Crown,
  ChevronRight,
  Flame
} from 'lucide-react';
import { MUSCLE_PASS_PLAN_LIST, getMusclePassPlan } from '../../config/pricing.js';
import { formatTimeRemaining } from '../../services/musclePassService.js';

export const MyProfileSection = ({
  profile = {},
  entitlement = {},
  todayLogs = [],
  onOpenProfileModal,
  onSubscribe,
  isProcessingPayment,
  paymentMessage
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState('MUSCLE_3_MONTHS');
  const selectedPlan = getMusclePassPlan(selectedPlanId);

  const isTrialActive = entitlement.isTrial;
  const activeWeight = profile.weightKg || 60;
  const activeTarget = profile.dailyProteinTargetG || 120;
  const proteinPerKg = (activeTarget / activeWeight).toFixed(1);

  const handleExportData = () => {
    const dataToExport = {
      profile,
      entitlement,
      todayLogs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messmates_nutrition_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* ── 1. ATHLETE PROFILE CARD ─────────────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
              <User className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Nutrition Profile &amp; Targets
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-800">
                  {profile.goal || 'Muscle Gain'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Personalized parameters driving your mess menu plate suggestions.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenProfileModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Profile &amp; Targets</span>
          </button>
        </div>

        {/* Attribute Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">
              Body Weight
            </span>
            <span className="text-xl font-black text-slate-900">{activeWeight} kg</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">
              Daily Target
            </span>
            <span className="text-xl font-black text-emerald-700">{activeTarget}g / day</span>
            <span className="text-[10px] text-slate-400 font-semibold block">{proteinPerKg} g/kg</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">
              Dietary Type
            </span>
            <span className="text-sm font-black text-slate-900">{profile.dietaryPreference || 'Vegetarian'}</span>
            <span className="text-[10px] text-slate-400 font-semibold block">Mess filter active</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">
              Allergies
            </span>
            <span className="text-sm font-black text-slate-900">
              {profile.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">auto-filtered</span>
          </div>
        </div>

        {/* Portion & Appetite details */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            Portion Preference: <strong>{profile.preferredPortion || 'Regular'}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            Appetite: <strong>{profile.appetitePreference || 'Normal'}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            Activity: <strong>{profile.activityLevel || 'Moderate'}</strong>
          </span>
        </div>
      </div>

      {/* ── 2. SUBSCRIPTION & DEMO MEMBERSHIP ────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Muscle Pass Membership &amp; Upgrades
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Razorpay checkout. Supports UPI, Google Pay, PhonePe, Paytm &amp; Cards.
            </p>
          </div>

          {isTrialActive ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black flex items-center space-x-1.5 border border-emerald-200 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{formatTimeRemaining(entitlement.msLeft)} Demo Left</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-black flex items-center space-x-1.5 border border-amber-200 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>VIP Pro Member</span>
            </div>
          )}
        </div>

        {paymentMessage && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
            paymentMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {paymentMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{paymentMessage.text}</span>
          </div>
        )}

        {/* 4 Official Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MUSCLE_PASS_PLAN_LIST.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-xs ${
                    isPopular ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-600 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-700">{plan.durationLabel}</h4>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">/ {plan.durationLabel}</span>
                    </div>
                    {plan.savingsLabel && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black mt-0.5">
                        {plan.savingsLabel}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    {plan.tagline}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{plan.durationDays} days</span>
                  <span className="text-emerald-700 font-bold">Select →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscribe Action */}
        <div className="pt-2">
          <button
            onClick={() => onSubscribe(selectedPlanId)}
            disabled={isProcessingPayment}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {isProcessingPayment 
                ? 'CONNECTING RAZORPAY...' 
                : `UPGRADE VIA RAZORPAY (₹${selectedPlan?.price} FOR ${selectedPlan?.durationLabel?.toUpperCase()})`}
            </span>
          </button>
        </div>
      </div>

      {/* ── 3. DATA PRIVACY & EXPORT ────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Student Privacy Guarantee
            </h4>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Your body weight, protein goals, and meal logs are strictly private to you. They are never shared with college officials or caterers without your explicit consent.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-black text-slate-700 transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export My Data (JSON)</span>
        </button>
      </div>

    </div>
  );
};
