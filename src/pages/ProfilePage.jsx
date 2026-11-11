import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { resolveMenuGroup } from '../config/menuGroups';
import { 
  Camera, 
  Save, 
  LogOut, 
  Award, 
  Check, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles, 
  Building2, 
  Utensils, 
  Flame, 
  ExternalLink, 
  HeartHandshake, 
  FileText,
  Users, 
  UserCheck 
} from 'lucide-react';
import { AboutUsSection } from '../components/AboutUsSection';

const PRESET_AVATARS = [
  '/founders/parth_avatar_4k.jpg',
  '/founders/shivendra_avatar_4k.jpg',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300'
];

export const ProfilePage = () => {
  const { currentUser, updateUserProfile, logout, rewardPoints } = useApp();
  const { role } = useAuth();

  const isParth = currentUser?.name?.toLowerCase().includes('parth') || currentUser?.email?.toLowerCase().includes('parth');

  const [activeTab, setActiveTab] = useState('about_us'); // 'about_us' (Tab 1 default) | 'profile' (Tab 2)
  const [dietPreference, setDietPreference] = useState(currentUser?.dietPreference || 'Vegetarian');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || (isParth ? '/founders/parth_avatar_4k.jpg' : PRESET_AVATARS[0])
  );
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const menuGroup = resolveMenuGroup(currentUser);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        dietPreference,
        avatar
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (userRole) => {
    switch (userRole) {
      case 'warden':
        return { label: 'Hostel Warden / Official', bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' };
      case 'mess_committee':
      case 'committee':
        return { label: 'Mess Committee Member', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
      default:
        return { label: 'Verified Hostel Student', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
    }
  };

  const roleConfig = getRoleBadge(role);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* ── TOP SECTION HEADER & TAB SELECTOR ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight text-center sm:text-left">
            Account & Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
            Official platform founders and student profile settings.
          </p>
        </div>

        {/* Concise Tab Selector */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('about_us')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'about_us'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. About Us</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Profile</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1.5 border border-emerald-500/30">
          <Check className="w-4 h-4" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ABOUT US SECTION (FOUNDERS & MISSION WITH 4K INTERACTIVE PROFILES)    */}
      {/* ========================================================================= */}
      {activeTab === 'about_us' && (
        <div className="space-y-4">
          <AboutUsSection />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OFFICIAL STUDENT PROFILE & PREFERENCES                                */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img
                src={avatar}
                alt={currentUser?.name}
                className="w-20 h-20 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {currentUser?.name || 'Student Name'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                {currentUser?.email || 'student@abes.ac.in'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {roleConfig.label}
                </span>
                {rewardPoints > 0 && (
                  <span className="text-[11px] font-bold text-amber-500 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>{rewardPoints} Health Points</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Picker Modal/Dropdown */}
          {showAvatarPicker && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Choose Avatar:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(av);
                      setShowAvatarPicker(false);
                    }}
                    className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      avatar === av ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details Form */}
          <form onSubmit={handleSavePreferences} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  College / University
                </label>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>ABES Engineering College</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Hostel Block & Assigned Mess
                </label>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Utensils className="w-4 h-4 text-emerald-500" />
                  <span>{currentUser?.hostelBlock || 'DNB Block'} • {menuGroup?.label || 'Pending Allocation'}</span>
                </div>
              </div>
            </div>

            {/* Diet Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Diet Preference
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {['Vegetarian', 'Eggetarian'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setDietPreference(pref)}
                    className={`p-3 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                      dietPreference === pref
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'SAVE PREFERENCES'}</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
};

export default ProfilePage;
