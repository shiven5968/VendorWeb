import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MessMatesLogo } from './MessMatesLogo';
import {
  Bell,
  LogOut,
  Home,
  MessageSquare,
  Gift,
  User,
  Vote,
  Dumbbell,
  Calendar,
  Award,
  ChevronDown,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
  const {
    currentUser,
    currentPage,
    setCurrentPage,
    logout,
    unreadCount,
    setIsNotificationOpen,
    rewardPoints
  } = useApp();
  const { user, role, isAuthenticated } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPage]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [mobileMenuOpen]);

  if (!user || !isAuthenticated) return null;

  const isStaffRole = role === 'warden' || role === 'mess_committee' || role === 'committee';

  const getNavItems = () => {
    if (isStaffRole) {
      // Primary navigation for Staff & Officials is the Left Sidebar ONLY.
      return [];
    }
    return [
      { id: 'dashboard', label: 'Home', icon: Home },
      { id: 'menu', label: 'Full Menu', icon: Calendar },
      { id: 'muscle-pass', label: 'Muscle Pass', icon: Dumbbell },
      { id: 'rewards', label: 'Rewards', icon: Gift },
      { id: 'complaints', label: 'Complaints', icon: MessageSquare },
      { id: 'voting', label: 'Voting', icon: Vote }
    ];
  };

  const navItems = getNavItems();
  const firstName = currentUser?.name?.split(' ')[0] || (role === 'warden' ? 'Official' : 'Student');

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 gap-1.5 lg:gap-3">
          {/* Left: Brand Logo */}
          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2 min-w-0 shrink-0 py-1 cursor-pointer focus:outline-none"
            aria-label="MessMates Home"
          >
            <MessMatesLogo size="sm" className="max-w-[144px] md:max-w-[118px] lg:max-w-none" />
            {role === 'warden' && (
              <span className="hidden min-[400px]:inline-flex text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                ABES OFFICIALS
              </span>
            )}
            {(role === 'mess_committee' || role === 'committee') && (
              <span className="hidden min-[400px]:inline-flex text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                MESS COMMITTEE
              </span>
            )}
          </button>

          {/* Center: Desktop Nav Links */}
          {navItems.length > 0 && (
            <nav
              aria-label="Desktop Navigation"
              className="hidden md:flex items-center gap-0.5 lg:gap-1 min-w-0"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPage === item.id ||
                  (item.id === 'complaints' && currentPage === 'activity');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentPage(item.id)}
                    className={clsx(
                      'flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-3 py-2 rounded-xl text-[11px] lg:text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 hidden lg:block" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right: Notifications + Account Controls */}
          {currentUser && (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0" ref={menuRef}>
              {/* Notification Bell (Visible on both Mobile & Desktop) */}
              <button
                type="button"
                onClick={() => setIsNotificationOpen(true)}
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Open Notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Desktop: Profile + Visible Sign Out */}
              <div className="hidden md:flex items-center gap-1 lg:gap-2 pl-1.5 lg:pl-2 border-l border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCurrentPage('profile')}
                  className={clsx(
                    'flex items-center gap-2 px-1.5 lg:px-2 py-1.5 rounded-xl transition-colors cursor-pointer',
                    currentPage === 'profile'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-200 dark:ring-emerald-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  aria-label="Profile"
                  title="Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 overflow-hidden shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="hidden lg:inline text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {firstName}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile: Compact Account Sheet Trigger (Profile + HP + Logout without squeezing row) */}
              <div className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(prev => !prev)}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Account Menu"
                  className="min-h-[44px] pl-1.5 pr-2 py-1 flex items-center gap-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center overflow-hidden shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <ChevronDown className={clsx('w-4 h-4 text-slate-500 transition-transform', mobileMenuOpen && 'rotate-180')} />
                </button>

                {mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 space-y-2 z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {currentUser.name || firstName}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.hostelBlock || 'Campus Student'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Close account menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {!isStaffRole && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setCurrentPage('rewards');
                        }}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Health Points</span>
                        </span>
                        <span className="font-black">{rewardPoints || 0} HP</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCurrentPage('profile');
                      }}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Profile & Settings</span>
                    </button>

                    {!isStaffRole && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setCurrentPage('menu');
                        }}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>Full Week Menu</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
