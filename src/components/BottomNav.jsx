import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  UtensilsCrossed, 
  MessageSquare, 
  Gift, 
  User, 
  ShieldAlert, 
  BarChart3, 
  Vote, 
  Dumbbell,
  Store
} from 'lucide-react';

export const BottomNav = () => {
  const { currentPage, setCurrentPage, currentUser } = useApp();
  const { user, role } = useAuth();

  if (!user || !currentUser) return null;

  const getTabs = () => {
    if (role === 'student') {
      return [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
        { id: 'voting', label: 'Voting', icon: Vote },
        { id: 'muscle-pass', label: 'Muscle', icon: Dumbbell },
        { id: 'rewards', label: 'Rewards', icon: Gift },
        { id: 'activity', label: 'Issues', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    } else if (role === 'mess_committee') {
      return [
        { id: 'dashboard', label: 'Menu Studio', icon: UtensilsCrossed },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Feedback', icon: MessageSquare },
        { id: 'voting', label: 'Polls', icon: Vote },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    } else if (role === 'warden') {
      return [
        { id: 'dashboard', label: 'Overview', icon: ShieldAlert },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Complaints', icon: MessageSquare },
        { id: 'voting', label: 'Polls', icon: Vote },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    } else if (role === 'partner') {
      return [
        { id: 'dashboard', label: 'Vendor', icon: Store },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }
    return [];
  };

  const tabs = getTabs();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 shadow-2xl flex justify-around items-center transition-all">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentPage(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-black scale-105'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-500/10' : ''}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            </div>
            <span className="text-[9px] tracking-tight mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
