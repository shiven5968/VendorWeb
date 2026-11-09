import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, MessageSquare, User, Home, Vote, Dumbbell } from 'lucide-react';
import { clsx } from 'clsx';

export const BottomNav = () => {
  const { currentPage, setCurrentPage } = useApp();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;
  // Staff and Officials use dedicated single navigation (sidebar on desktop, tab row on mobile)
  if (role === 'warden' || role === 'mess_committee' || role === 'committee') return null;

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'muscle-pass', label: 'Muscle Pass', icon: Dumbbell, isPro: true },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'voting', label: 'Voting', icon: Vote },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-colors shadow-lg">
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id || (tab.id === 'complaints' && currentPage === 'activity');
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all group"
            >
              <div className="relative">
                <div className={clsx(
                  "p-1.5 rounded-2xl transition-all duration-200",
                  isActive 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105" 
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                )}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {tab.isPro && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <span className={clsx(
                "text-[9px] sm:text-[10px] font-bold tracking-tight transition-colors mt-0.5 truncate max-w-[56px]",
                isActive ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-slate-500 dark:text-slate-400"
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
