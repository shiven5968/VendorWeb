import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Dumbbell, Save, Check, Camera, Building, GraduationCap, Phone, Sparkles, MapPin } from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, updateUserProfile, proteinTarget, setProteinTarget, rewardPoints, MESS_BLOCK_MAP } = useApp();

  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Parth Sharma',
    year: currentUser?.year || '2nd Year AIML',
    branch: currentUser?.branch || 'Artificial Intelligence & Machine Learning',
    hostelBlock: currentUser?.hostelBlock || 'DNB Block',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    email: currentUser?.email || 'parth.sharma@hostel.edu',
    phone: currentUser?.phone || '+91 98765 43210',
    dietPreference: currentUser?.dietPreference || 'High Protein / Eggetarian',
  });

  const [gymModeEnabled, setGymModeEnabled] = useState(currentUser?.gymMode ?? true);
  const [targetVal, setTargetVal] = useState(proteinTarget);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({
      ...formData,
      gymMode: gymModeEnabled,
    });
    setProteinTarget(Number(targetVal));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const selectedMessInfo = MESS_BLOCK_MAP[formData.hostelBlock] || MESS_BLOCK_MAP['DNB Block'];

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Edit Student Profile & Hostel Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your personal AIML batch details, hostel block mess assignments, and avatar.
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-xs border border-brand-200 dark:border-brand-800">
          Reward Balance: {rewardPoints} Points
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* Profile Card & Avatar Selector */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-brand-500/50 shadow-xl"
              />
              <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose Profile Picture</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  {avatarPresets.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar ${idx}`}
                      onClick={() => setFormData({ ...formData, avatar: url })}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                        formData.avatar === url ? 'border-brand-500 ring-2 ring-brand-500' : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Custom Image URL</label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full max-w-md px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Student Academic & Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Student Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Year & Batch</label>
              <input
                type="text"
                required
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                placeholder="2nd Year AIML"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Branch / Specialization</label>
              <input
                type="text"
                required
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                placeholder="Artificial Intelligence & Machine Learning"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dietary Preference</label>
              <select
                value={formData.dietPreference}
                onChange={e => setFormData({ ...formData, dietPreference: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
              >
                <option value="High Protein / Eggetarian">High Protein / Eggetarian</option>
                <option value="Pure Vegetarian">Pure Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan Clean">Vegan Clean</option>
              </select>
            </div>

          </div>

        </div>

        {/* HOSTEL BLOCK SELECTION & AUTOMATED MESS MAPPING */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 border border-emerald-500/30">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Hostel Block & Mess Assignment</h3>
              <p className="text-xs text-slate-300">
                Select your block to automatically map your designated dining hall mess.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Hostel Block</label>
              <select
                value={formData.hostelBlock}
                onChange={e => setFormData({ ...formData, hostelBlock: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="DNB Block">DNB Block</option>
                <option value="VKB Block">VKB Block</option>
                <option value="RKB Block">RKB Block</option>
                <option value="ABB Block">ABB Block</option>
                <option value="CKB Block">CKB Block</option>
              </select>
            </div>

            {/* Live Mess Mapping Summary */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mapped Dining Hall:</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Active</span>
              </div>
              <p className="text-sm font-extrabold text-white">{selectedMessInfo.messName}</p>
              <p className="text-[11px] text-slate-300">
                📍 {selectedMessInfo.location} • Head Chef: <strong>{selectedMessInfo.chef}</strong>
              </p>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-400">Campus Mess Allocation Rules:</span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pt-1">
              <li><strong>DNB Block:</strong> Serves exclusively in DNB Exclusive Mess (Dining Hall 1).</li>
              <li><strong>VKB Block & RKB Block:</strong> Share the VKB-RKB Combined Central Mess (Dining Hall 2).</li>
              <li><strong>ABB Block & CKB Block:</strong> Share the ABB-CKB Combined South Mess (Dining Hall 3).</li>
            </ul>
          </div>

        </div>

        {/* GYM MODE TARGET SETTINGS */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Gym Mode ⭐ Premium Protein Target</h3>
            </div>
            <input
              type="checkbox"
              checked={gymModeEnabled}
              onChange={e => setGymModeEnabled(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded"
            />
          </div>

          {gymModeEnabled && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Daily Protein Target (g)
              </label>
              <input
                type="number"
                value={targetVal}
                onChange={e => setTargetVal(e.target.value)}
                className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm"
              />
            </div>
          )}
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-sm">
            <Check className="w-5 h-5" />
            <span>Profile and Mess Assigned Updated Successfully!</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save All Profile Changes</span>
        </button>

      </form>

    </div>
  );
};
