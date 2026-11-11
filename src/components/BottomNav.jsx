import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Home, Dumbbell, Gift, MessageSquare, Vote, User } from 'lucide-react';
import { clsx } from 'clsx';

export const BottomNav = () => {
  const { currentPage, setCurrentPage } = useApp();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;
  // Staff and Officials use dedicated single navigation (sidebar on desktop, tab row on mobile)
  if (role === 'warden' || role === 'mess_committee' || role === 'committee') return null;

  // Phase 7 Canonical 6-Item Order:
  // 1. HOME -> 2. MUSCLE PASS -> 3. REWARDS -> 4. COMPLAINTS -> 5. VOTING -> 6. PROFILE
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'muscle-pass', label: 'Muscle Pass', icon: Dumbbell, isPro: true, twoLineCompact: true },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'voting', label: 'Voting', icon: Vote },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-colors shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
    >
      <div className="grid grid-cols-6 items-stretch min-h-[64px] px-1 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            currentPage === tab.id ||
            (tab.id === 'complaints' && currentPage === 'activity');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentPage(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
              className="flex flex-col items-center justify-center min-w-0 min-h-[54px] px-0.5 py-1 rounded-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={clsx(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  )}
                >
                  <Icon className="w-[18px] h-[18px] min-[380px]:w-5 min-[380px]:h-5" />
                </div>
                {tab.isPro && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>

              <span
                className={clsx(
                  'mt-0.5 text-center leading-[1.1] tracking-tight transition-colors w-full',
                  tab.twoLineCompact
                    ? 'text-[9.5px] min-[380px]:text-[10.5px] whitespace-normal'
                    : 'text-[9.5px] min-[375px]:text-[10.5px] whitespace-nowrap',
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-black'
                    : 'text-slate-600 dark:text-slate-400 font-bold'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
