import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DashboardCard, StatCard, SectionHeader } from '../components/ui';
import { resolveMenuGroup } from '../config/menuGroups';
import { getRoleConfig } from '../config/roles';
import { User, LogOut, Gift, Star, MessageSquare, Shield, Check, Save } from 'lucide-react';
import { clsx } from 'clsx';

export const ProfilePage = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    logout,
    rewardPoints,
    allRatings,
    userComplaints
  } = useApp();
  const { role } = useAuth();

  const [diet, setDiet] = useState(currentUser?.dietPreference || 'Veg');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [saving, setSaving] = useState(false);

  const roleConfig = getRoleConfig(role);
  const menuGroup = resolveMenuGroup(currentUser);
  
  const userRatingsCount = (allRatings || []).filter(r => r.userId === (currentUser?.uid || currentUser?.id)).length;
  const userComplaintsCount = (userComplaints || []).length;

  const avatars = [
    '/avatars/av-1.png',
    '/avatars/av-2.png',
    '/avatars/av-3.png',
    '/avatars/av-4.png',
    '/avatars/av-5.png',
    '/avatars/av-6.png'
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ dietPreference: diet, avatar });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-8">
      <SectionHeader title="Profile" subtitle="Manage your account settings" />

      {/* Profile Header Card */}
      <DashboardCard className="relative overflow-hidden border-emerald-500/30">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Shield className="w-32 h-32 text-emerald-600" />
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser?.name || 'User'}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{currentUser?.email || ''}</p>
            
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full text-xs font-bold">
                {roleConfig.label}
              </span>
              {currentUser?.admissionNumber && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                  {currentUser.admissionNumber}
                </span>
              )}
              {menuGroup?.label && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                  {menuGroup.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Gift} label="Points" value={rewardPoints || 0} color="amber" />
        <StatCard icon={Star} label="Ratings" value={userRatingsCount} color="blue" />
        <StatCard icon={MessageSquare} label="Complaints" value={userComplaintsCount} color="rose" />
      </div>

      {/* Preferences */}
      <DashboardCard title="Preferences">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Diet Preference</label>
            <div className="flex gap-3">
              {['Veg', 'Non-Veg'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setDiet(opt)}
                  className={clsx(
                    "px-6 py-2 rounded-xl font-medium border-2 transition-all",
                    diet === opt 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {avatars.map((av, idx) => (
                <button
                  key={idx}
                  onClick={() => setAvatar(av)}
                  className={clsx(
                    "relative aspect-square rounded-2xl border-2 overflow-hidden transition-all",
                    avatar === av 
                      ? "border-emerald-500 shadow-md shadow-emerald-500/20 scale-105" 
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={av} alt={`Avatar ${idx+1}`} className="w-full h-full object-cover" />
                  {avatar === av && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[1px]">
                      <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </DashboardCard>

      {/* Account Settings */}
      <DashboardCard title="Account">
        <button 
          onClick={logout}
          className="w-full sm:w-auto px-6 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-medium transition-colors border border-rose-200 dark:border-rose-500/30 flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </DashboardCard>
    </div>
  );
};
