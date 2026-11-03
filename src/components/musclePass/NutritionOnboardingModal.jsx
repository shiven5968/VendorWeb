import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { 
  Dumbbell, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Scale, 
  Target, 
  Utensils, 
  ShieldAlert,
  Info
} from 'lucide-react';

const FITNESS_GOALS = [
  { id: 'Muscle Gain', label: 'Muscle Gain', desc: 'Build lean muscle with high protein intake' },
  { id: 'Fat Loss', label: 'Fat Loss', desc: 'Preserve muscle while in a calorie deficit' },
  { id: 'Maintenance', label: 'Maintenance', desc: 'Stay energetic and maintain current weight' },
  { id: 'General Fitness', label: 'General Fitness', desc: 'Balanced campus dining nutrition' }
];

const ACTIVITY_LEVELS = [
  { id: 'Low', label: 'Low', desc: 'Sedentary study routine' },
  { id: 'Moderate', label: 'Moderate', desc: 'Regular walking / gym 3-4 days' },
  { id: 'High', label: 'High', desc: 'Intense training / sports team' }
];

const DIETARY_PREFS = [
  { id: 'Vegetarian', label: 'Pure Veg', icon: '🌱' },
  { id: 'Eggetarian', label: 'Eggetarian', icon: '🥚' },
  { id: 'Non-Vegetarian', label: 'Non-Veg', icon: '🍗' }
];

const COMMON_ALLERGIES = ['Dairy', 'Gluten', 'Peanuts', 'Soy', 'Besan'];

export const NutritionOnboardingModal = ({
  isOpen,
  onClose,
  initialProfile,
  onSaveProfile
}) => {
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg || 60);
  const [dailyProteinTargetG, setDailyProteinTargetG] = useState(
    initialProfile?.dailyProteinTargetG || 120
  );
  const [heightCm, setHeightCm] = useState(initialProfile?.heightCm || '');
  const [age, setAge] = useState(initialProfile?.age || '');
  const [goal, setGoal] = useState(initialProfile?.goal || 'Muscle Gain');
  const [activityLevel, setActivityLevel] = useState(initialProfile?.activityLevel || 'Moderate');
  const [dietaryPreference, setDietaryPreference] = useState(
    initialProfile?.dietaryPreference || 'Vegetarian'
  );
  const [allergies, setAllergies] = useState(initialProfile?.allergies || []);
  const [preferredPortion, setPreferredPortion] = useState(
    initialProfile?.preferredPortion || 'Regular'
  );
  const [appetitePreference, setAppetitePreference] = useState(
    initialProfile?.appetitePreference || 'Normal'
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setWeightKg(initialProfile.weightKg || 60);
      setDailyProteinTargetG(initialProfile.dailyProteinTargetG || 120);
      setHeightCm(initialProfile.heightCm || '');
      setAge(initialProfile.age || '');
      setGoal(initialProfile.goal || 'Muscle Gain');
      setActivityLevel(initialProfile.activityLevel || 'Moderate');
      setDietaryPreference(initialProfile.dietaryPreference || 'Vegetarian');
      setAllergies(initialProfile.allergies || []);
      setPreferredPortion(initialProfile.preferredPortion || 'Regular');
      setAppetitePreference(initialProfile.appetitePreference || 'Normal');
    }
  }, [initialProfile, isOpen]);

  // Contextual g/kg calculation
  const numericWeight = Number(weightKg) || 1;
  const numericTarget = Number(dailyProteinTargetG) || 0;
  const proteinPerKg = (numericTarget / numericWeight).toFixed(1);

  // Optional target suggestion based on fitness goal
  const handleAutoSuggestTarget = () => {
    let multiplier = 1.8; // Default muscle gain
    if (goal === 'Fat Loss') multiplier = 2.0;
    else if (goal === 'Maintenance') multiplier = 1.4;
    else if (goal === 'General Fitness') multiplier = 1.2;

    const suggested = Math.round(numericWeight * multiplier);
    setDailyProteinTargetG(suggested);
  };

  const toggleAllergy = (al) => {
    setAllergies(prev => 
      prev.includes(al) ? prev.filter(x => x !== al) : [...prev, al]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!weightKg || numericWeight < 25 || numericWeight > 250) {
      setError('Please provide a valid body weight between 25 kg and 250 kg.');
      return;
    }

    if (!dailyProteinTargetG || numericTarget < 20 || numericTarget > 350) {
      setError('Please provide a daily protein target between 20g and 350g.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveProfile({
        weightKg: numericWeight,
        dailyProteinTargetG: numericTarget,
        heightCm: heightCm ? Number(heightCm) : null,
        age: age ? Number(age) : null,
        goal,
        activityLevel,
        dietaryPreference,
        allergies,
        preferredPortion,
        appetitePreference
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {initialProfile ? 'Edit Nutrition Profile' : 'Setup Your Nutrition Profile'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Personalize your hostel mess meal recommendations
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Body Weight & Daily Protein Target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Body Weight (kg) *</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="25"
              max="250"
              required
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
              placeholder="e.g. 65"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protein Target (g/day) *</span>
              </label>
              <button
                type="button"
                onClick={handleAutoSuggestTarget}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center space-x-0.5"
                title="Calculate estimate based on weight & goal"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Estimate</span>
              </button>
            </div>
            <input
              type="number"
              min="20"
              max="350"
              required
              value={dailyProteinTargetG}
              onChange={e => setDailyProteinTargetG(e.target.value)}
              placeholder="e.g. 120"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Live Contextual Ratio Badge */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">Target Ratio:</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {dailyProteinTargetG}g protein / {weightKg}kg body weight
            </span>
          </div>
          <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
            {proteinPerKg} g/kg
          </span>
        </div>

        {/* 2. Primary Fitness Goal */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Primary Fitness Goal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FITNESS_GOALS.map(g => (
              <button
                type="button"
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  goal === g.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="text-xs font-black">{g.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{g.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Dietary Preference */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dietary Preference</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIETARY_PREFS.map(d => (
              <button
                type="button"
                key={d.id}
                onClick={() => setDietaryPreference(d.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  dietaryPreference === d.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Portion Size & Appetite Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Portion Size
            </label>
            <select
              value={preferredPortion}
              onChange={e => setPreferredPortion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="Small">Small Portions (light eater)</option>
              <option value="Regular">Regular Standard Mess Portions</option>
              <option value="Large">Large Portions (heavy appetite)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Daily Appetite
            </label>
            <select
              value={appetitePreference}
              onChange={e => setAppetitePreference(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="Low">Low (skip heavy dinners)</option>
              <option value="Normal">Normal (steady hunger)</option>
              <option value="High">High (frequently hungry)</option>
            </select>
          </div>
        </div>

        {/* 5. Food Allergies & Restrictions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Allergies &amp; Avoidances (Optional)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_ALLERGIES.map(al => {
              const selected = allergies.includes(al);
              return (
                <button
                  type="button"
                  key={al}
                  onClick={() => toggleAllergy(al)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                    selected
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {selected ? `✕ ${al}` : `+ ${al}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Disclaimer per requirement */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 flex items-start space-x-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Nutrition values and recommendations are estimates derived from standard ICMR-NIN food composition tables, not medical advice. For clinical dietary management, please consult a certified healthcare professional.
          </span>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Continue'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
