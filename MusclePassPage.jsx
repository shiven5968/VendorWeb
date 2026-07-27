import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, User, Camera, Save, Check, Flame, Award, Building, MapPin, Plus, Sparkles } from 'lucide-react';

export const MusclePassPage = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    proteinTarget, 
    setProteinTarget, 
    consumedProtein, 
    setConsumedProtein,
    workoutDays,
    setWorkoutDays,
    fitnessGoal,
    setFitnessGoal,
    currentMessInfo,
    rewardPoints
  } = useApp();

  const [gymTargetInput, setGymTargetInput] = useState(proteinTarget);
  const [savedNotice, setSavedNotice] = useState(false);

  const remainingProtein = Math.max(0, proteinTarget - consumedProtein);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));

  // Device File Upload Handler for Avatar
  const handleDeviceImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserProfile({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setProteinTarget(Number(gymTargetInput));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const logMessProtein = (grams) => {
    setConsumedProtein(prev => prev + grams);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/30">
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-1">
              <span>Student Fitness & Profile Portal</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">MUSCLE PASS</h1>
            <p className="text-xs text-slate-300">
              {currentUser?.name || 'Parth Sharma'} • {currentUser?.year || '2nd Year AIML'} • {currentUser?.hostelBlock || 'DNB Block'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center min-w-[160px]">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Mess</span>
          <p className="text-sm font-extrabold text-emerald-400">{currentMessInfo.messName}</p>
        </div>

      </div>

      {/* Grid: Left Student Profile & Device Image Upload / Right Fitness Macro Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Student Profile & Device Photo Upload */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Student Profile & Device Photo</h3>
            
            {/* Avatar & Device Upload */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-emerald-500/50 shadow-xl"
                />
                <label className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white text-[10px] font-bold">
                  <Camera className="w-6 h-6 mb-1" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDeviceImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <label className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-emerald-500" />
                <span>Upload Photo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDeviceImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Read-only / Fixed Academic Details */}
            <div className="space-y-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentUser?.name || 'Parth Sharma'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                <span className="text-slate-400">Academic Batch:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentUser?.year || '2nd Year AIML'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                <span className="text-slate-400">Branch:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Artificial Intelligence & Machine Learning</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                <span className="text-slate-400">Hostel Block:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser?.hostelBlock || 'DNB Block'}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between">
                <span className="text-slate-400">Assigned Mess:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{currentMessInfo.messName}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Muscle Pass Fitness Engine */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Daily Protein & Workout Tracker</h3>

            {/* Protein Progress Gauge */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-emerald-400 uppercase tracking-wider">Daily Protein Intake</span>
                <span className="font-mono text-base">{consumedProtein}g / {proteinTarget}g</span>
              </div>

              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-slate-300">
                <span>{proteinPercent}% Target Achieved</span>
                <span>Remaining: <strong className="text-emerald-400">{remainingProtein}g</strong></span>
              </div>
            </div>

            {/* Log Mess Meal Protein */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Quick Protein Meal Logger</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => logMessProtein(18)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold text-center transition-colors border"
                >
                  + Paneer (18g)
                </button>
                <button
                  onClick={() => logMessProtein(22)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold text-center transition-colors border"
                >
                  + Sprouts (22g)
                </button>
                <button
                  onClick={() => logMessProtein(24)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold text-center transition-colors border"
                >
                  + Rajma (24g)
                </button>
                <button
                  onClick={() => logMessProtein(34)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold text-center transition-colors border"
                >
                  + Soya (34g)
                </button>
              </div>
            </div>

            {/* Target & Fitness Goal Selector */}
            <form onSubmit={handleSaveSettings} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Daily Protein Target (Grams)
                  </label>
                  <input
                    type="number"
                    value={gymTargetInput}
                    onChange={e => setGymTargetInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Fitness Goal
                  </label>
                  <select
                    value={fitnessGoal}
                    onChange={e => setFitnessGoal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs outline-none"
                  >
                    <option value="Muscle Gain & Hypertrophy">Muscle Gain & Hypertrophy</option>
                    <option value="Fat Loss & Lean Shred">Fat Loss & Lean Shred</option>
                    <option value="Athletic Strength & Maintenance">Athletic Strength & Maintenance</option>
                  </select>
                </div>
              </div>

              {savedNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Muscle Pass Gym Target Updated!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Fitness Targets</span>
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
