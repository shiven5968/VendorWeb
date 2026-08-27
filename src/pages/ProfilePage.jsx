import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Mail, 
  Building2, 
  Utensils, 
  Award, 
  ShieldCheck, 
  Camera, 
  Save, 
  Check, 
  LogOut, 
  Lock,
  IdCard,
  Sparkles
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300'
];

export const ProfilePage = () => {
  const { currentUser, currentRole, updateUserProfile, logout, rewardPoints } = useApp();

  const [hostelBlock, setHostelBlock] = useState(currentUser?.hostelBlock || 'DNB Block');
  const [dietPreference, setDietPreference] = useState(currentUser?.dietPreference || 'Vegetarian');
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile({
        hostelBlock,
        dietPreference,
        avatar
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (e) {
      console.error('Profile update failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Profile & Preferences</h1>
        <p className="text-xs text-slate-500 font-semibold">
          Official Student Identity & Mess Preferences
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1.5 border border-emerald-500/30">
          <Check className="w-4 h-4" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            <img
              src={avatar}
              alt={currentUser?.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
            />
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-colors"
              title="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentUser?.name || 'Student'}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">{currentUser?.email}</p>
            <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
              <span className="text-[11px] font-bold text-amber-500 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5" />
                <span>{rewardPoints} Health Points</span>
              </span>
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal / Drawer */}
        {showAvatarPicker && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 block">Choose Profile Photo</span>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar option ${i}`}
                  onClick={() => {
                    setAvatar(url);
                    setShowAvatarPicker(false);
                  }}
                  className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all hover:scale-105 ${
                    avatar === url ? 'ring-4 ring-emerald-500' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 1: FIXED / NON-EDITABLE OFFICIAL IDENTITY */}
        <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Official College Identity (Read-Only)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Verified via College Records</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Full Name (Fixed Read-Only Badge) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Full Name</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {currentUser?.name || 'Parth Sharma'}
              </p>
            </div>

            {/* Admission Number (Fixed Read-Only Badge) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Admission Number</span>
                <IdCard className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {currentUser?.admissionNumber || '2100320100001'}
              </p>
            </div>

            {/* College Email (Fixed Read-Only Badge) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>College Email</span>
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {currentUser?.email || 'student@abes.ac.in'}
              </p>
            </div>

            {/* User Role (Fixed Read-Only Badge) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>System Role</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white capitalize">
                {currentRole === 'mess_committee' ? 'Mess Committee' : currentRole}
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 2: EDITABLE PREFERENCES */}
        <form onSubmit={handleSave} className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Mess & Dietary Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Hostel Block */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Hostel Residence Block
              </label>
              <select
                value={hostelBlock}
                onChange={e => setHostelBlock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="DNB Block">DNB Block (Boys)</option>
                <option value="VKB Block">VKB Block (Boys)</option>
                <option value="RKB Block">RKB Block (Boys)</option>
                <option value="ABB Block">ABB Block (Boys)</option>
                <option value="Kalpana Chawla (Girls)">Kalpana Chawla (Girls)</option>
                <option value="Sarojini Block (Girls)">Sarojini Block (Girls)</option>
                <option value="Kasturba Block (Girls)">Kasturba Block (Girls)</option>
              </select>
            </div>

            {/* Diet Preference */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Dietary Preference
              </label>
              <select
                value={dietPreference}
                onChange={e => setDietPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="Vegetarian">Pure Vegetarian</option>
                <option value="High Protein / Eggetarian">High Protein / Eggetarian</option>
                <option value="Jain (No Onion/Garlic)">Jain (No Onion / Garlic)</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

          </div>

          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold flex items-center space-x-1.5 border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
