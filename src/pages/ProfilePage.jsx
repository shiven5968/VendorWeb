import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Star, MessageSquare, Gift, Dumbbell, Settings, LogOut, ChevronRight, Camera, Save, Check } from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, updateUserProfile, setCurrentPage, logout, rewardPoints } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [block, setBlock] = useState(currentUser?.hostelBlock || 'DNB Block');
  const [diet, setDiet] = useState(currentUser?.dietPreference || 'High Protein / Eggetarian');
  const [saved, setSaved] = useState(false);

  const handleDeviceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserProfile({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({ name, hostelBlock: block, dietPreference: diet });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowSettings(false);
    }, 1500);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Profile Header (DYNAMIC USER DATA) */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex items-center space-x-4 shadow-xl border border-slate-800">
        <div className="relative group">
          <img
            src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500"
          />
          <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white transition-opacity">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleDeviceUpload} className="hidden" />
          </label>
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-black">{currentUser.name}</h1>
          <p className="text-xs text-emerald-400 font-bold">
            {currentUser.role?.toUpperCase()} • {currentUser.hostelBlock || 'Campus'}
          </p>
          <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
            {currentUser.email} • {rewardPoints} Health Points
          </span>
        </div>
      </div>

      {/* Settings Form */}
      {showSettings && (
        <form onSubmit={handleSave} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Edit Profile</h3>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hostel Block</label>
            <select
              value={block}
              onChange={e => setBlock(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              <option value="DNB Block">DNB Block (Boys)</option>
              <option value="VKB Block">VKB Block (Boys)</option>
              <option value="RKB Block">RKB Block (Boys)</option>
              <option value="ABB Block">ABB Block (Boys)</option>
              <option value="CKB Block">CKB Block (Boys)</option>
              <option value="Kalpana Chawla (Girls)">Kalpana Chawla (Girls)</option>
              <option value="Sarojini Block (Girls)">Sarojini Block (Girls)</option>
              <option value="Kasturba Block (Girls)">Kasturba Block (Girls)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dietary Preference</label>
            <select
              value={diet}
              onChange={e => setDiet(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              <option value="High Protein / Eggetarian">High Protein / Eggetarian</option>
              <option value="Pure Vegetarian">Pure Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegan Clean">Vegan Clean</option>
            </select>
          </div>

          {saved && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center">Profile saved to database!</p>
          )}

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      {/* Options List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
        
        <button
          onClick={() => setCurrentPage('activity')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">My Ratings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentPage('activity')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">My Feedback</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentPage('activity')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">My Complaints</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentPage('rewards')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <Gift className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">My Rewards</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentPage('muscle-pass')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <Dumbbell className="w-4 h-4 text-teal-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Muscle Pass</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowSettings(prev => !prev)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={logout}
          className="w-full p-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Logout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>

      </div>

    </div>
  );
};
