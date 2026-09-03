import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, MessageSquare, Gift, User, Home, Camera, ShieldCheck, BarChart3, Clipboard } from 'lucide-react';
import { clsx } from 'clsx';

export const BottomNav = () => {
  const { currentPage, setCurrentPage } = useApp();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;
  // Staff and Officials use dedicated single navigation (sidebar on desktop, tab row on mobile)
  if (role === 'warden' || role === 'mess_committee' || role === 'committee') return null;

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
            >
              <div className={clsx(
                "p-1.5 rounded-full transition-all duration-200",
                isActive 
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                  : "text-slate-500 dark:text-slate-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={clsx(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
