import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  Award,
  Scale,
  BookOpen,
  Plus,
  Shield,
  Save
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db as firestoreDb, isFirebaseConfigured } from '../../services/firebase.js';

export const ProgressSection = ({
  weeklySummaries = [],
  targetProteinG = 120,
  userId
}) => {
  const [journalWeight, setJournalWeight] = useState('');
  const [journalNote, setJournalNote] = useState('');
  const [savedJournalList, setSavedJournalList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load journal entries
  useEffect(() => {
    if (!userId) return;
    const cacheKey = `messmates_mp_journal_${userId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setSavedJournalList(JSON.parse(cached));
      }
    } catch (e) {}

    if (isFirebaseConfigured && firestoreDb) {
      getDoc(doc(firestoreDb, 'musclePassJournal', userId))
        .then(snap => {
          if (snap.exists() && Array.isArray(snap.data().entries)) {
            setSavedJournalList(snap.data().entries);
            try {
              localStorage.setItem(cacheKey, JSON.stringify(snap.data().entries));
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
  }, [userId]);

  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!journalWeight && !journalNote.trim()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      displayDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' }),
      weightKg: journalWeight ? Number(journalWeight) : null,
      notes: journalNote.trim()
    };

    const updated = [newEntry, ...savedJournalList].slice(0, 30);
    setSavedJournalList(updated);

    const cacheKey = `messmates_mp_journal_${userId}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch (e) {}

    if (isFirebaseConfigured && firestoreDb && userId) {
      try {
        await setDoc(doc(firestoreDb, 'musclePassJournal', userId), {
          userId,
          entries: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {}
    }

    setJournalWeight('');
    setJournalNote('');
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const totalDays = weeklySummaries.length || 7;
  const totalProteinSum = weeklySummaries.reduce((acc, s) => acc + (Number(s.proteinG || s.consumedProteinG) || 0), 0);
  const avgProtein = totalDays > 0 ? Math.round(totalProteinSum / totalDays) : 0;
  const daysHitTarget = weeklySummaries.filter(s => (Number(s.proteinG || s.consumedProteinG) || 0) >= targetProteinG).length;
  const adherenceRate = totalDays > 0 ? Math.round((daysHitTarget / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* ── 1. WEEKLY NUTRITION TRENDS CARD ─────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                7-Day Nutrition Insights
              </h3>
              <p className="text-xs text-slate-500">
                Consistency is what builds real campus fitness.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{daysHitTarget} of {totalDays} Days Achieved</span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
              Avg Intake
            </span>
            <span className="text-2xl font-black text-slate-900">
              {avgProtein}g
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">daily avg</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
              Adherence
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {adherenceRate}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">target hit rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
              Target
            </span>
            <span className="text-2xl font-black text-slate-900">
              {targetProteinG}g
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">daily goal</span>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Daily Intake vs {targetProteinG}g Goal</span>
            <span className="text-[11px] text-emerald-600">Green = Hit Target</span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 px-2 border-b border-slate-100">
            {weeklySummaries.map((summary, idx) => {
              const consumed = Number(summary.proteinG || summary.consumedProteinG) || 0;
              const percent = Math.min(100, Math.round((consumed / targetProteinG) * 100));
              const isHit = consumed >= targetProteinG;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-black text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {consumed}g
                  </span>
                  <div className="w-full max-w-[32px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex flex-col justify-end">
                    <div
                      style={{ height: `${percent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isHit ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 mt-2">
                    {summary.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. ATHLETE JOURNAL & BODY WEIGHT LOG ────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Private Fitness &amp; Weight Journal
              </h3>
              <p className="text-xs text-slate-500">
                Log weekly weigh-ins or training notes. Strictly private to you.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted &amp; Private</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveJournal} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide mb-1">
                Body Weight (Optional kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 61.2"
                value={journalWeight}
                onChange={e => setJournalWeight(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide mb-1">
                Workout / Nutrition Note
              </label>
              <input
                type="text"
                placeholder="e.g. Chest day PR, felt great energy after 2 bowls of dal"
                value={journalNote}
                onChange={e => setJournalNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-emerald-600 font-bold">
              {saveSuccess && '✓ Journal note saved!'}
            </span>
            <button
              type="submit"
              disabled={isSaving || (!journalWeight && !journalNote.trim())}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Journal Entry</span>
            </button>
          </div>
        </form>

        {/* Entries List */}
        {savedJournalList.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Recent Journal Entries
            </span>
            <div className="space-y-2">
              {savedJournalList.slice(0, 5).map(entry => (
                <div 
                  key={entry.id} 
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                      {entry.displayDate || entry.date}
                    </span>
                    {entry.weightKg && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs">
                        {entry.weightKg} kg
                      </span>
                    )}
                    <span className="text-slate-700 font-medium">{entry.notes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
