import React, { useState } from 'react';
import { Building2, MapPin, Clock, ArrowLeft, CheckCircle2, Send, ShieldAlert } from 'lucide-react';
import { MessMatesLogo } from '../MessMatesLogo';

export const CollegePendingModal = ({ institution, onBackToSearch }) => {
  const [emailInput, setEmailInput] = useState('');
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!institution) return null;

  const handleJoinWaitlist = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasJoinedWaitlist(true);
      try {
        const key = `messmates_waitlist_${institution.id}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ email: emailInput.trim(), date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {}
    }, 600);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          type="button"
          onClick={onBackToSearch}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change college</span>
        </button>
        <MessMatesLogo size="xs" />
      </div>

      {/* Institution Icon & Name */}
      <div className="text-center space-y-3 pt-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-900/60 shadow-sm">
          <Building2 className="w-7 h-7" />
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Onboarding in Progress</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {institution.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center space-x-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{institution.city}, {institution.state}</span>
          </p>
        </div>
      </div>

      {/* Status Explanation Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
        <p className="font-semibold text-slate-900 dark:text-white">
          Active dining intelligence is currently in preparation for this campus.
        </p>
        <p>
          {institution.onboardingMessage || 
           `MessMates is rolling out campus dining transparency across engineering universities. Real student login for ${institution.shortName} will activate once institutional mess routing and menu scheduling are finalized.`}
        </p>
        <div className="pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Active live dining is currently operating at ABES Engineering College.</span>
        </div>
      </div>

      {/* Waitlist / Interest Capture */}
      {!hasJoinedWaitlist ? (
        <form onSubmit={handleJoinWaitlist} className="space-y-3 pt-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Get notified when {institution.shortName} goes live:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={`your.name${institution.primaryEmailDomain || '@college.edu'}`}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Joining...</span>
              ) : (
                <>
                  <span>Notify Me</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            No spam. We will notify you as soon as student meal tracking opens at your hostel.
          </p>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
            You're on the campus waitlist!
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
            We will alert {emailInput} once your hostel dining hall is connected.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBackToSearch}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
        >
          Select Another College
        </button>
      </div>

    </div>
  );
};
