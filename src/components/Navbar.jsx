import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Bell, LogOut, Home, MessageSquare, Gift, User, BarChart3, Camera, ShieldCheck, Clipboard } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
  const { 
    currentUser, 
    currentPage, 
    setCurrentPage, 
    logout, 
    unreadCount, 
    setIsNotificationOpen
  } = useApp();
  const { user, role, isAuthenticated } = useAuth();

  if (!user || !isAuthenticated) return null;

  const getNavItems = () => {
    switch(role) {
      case 'warden':
        // Primary navigation for ABES Officials is the Left Sidebar ONLY.
        // The top header must NOT contain duplicate page navigation links.
        return [];
      case 'mess_committee':
      case 'committee':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'daily-photos', label: 'Photos', icon: Camera },
          { id: 'hygiene', label: 'Hygiene', icon: ShieldCheck },
          { id: 'ratings-view', label: 'Ratings', icon: Clipboard },
          { id: 'complaints', label: 'Complaints', icon: MessageSquare }
        ];
      default:
        return [
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
          { id: 'complaints', label: 'Complaints', icon: MessageSquare },
          { id: 'rewards', label: 'Rewards', icon: Gift },
          { id: 'profile', label: 'Profile', icon: User }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentPage('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="flex items-center">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">MessMates</span>
              {role === 'warden' && (
                <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  ABES OFFICIALS
                </span>
              )}
            </div>
          </div>

          {/* Desktop Nav (Empty for ABES Officials to prevent duplicate top/sidebar navigation) */}
          {navItems.length > 0 && (
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={clsx(
                      'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: Notification + Avatar + Logout */}
          <div className="flex items-center space-x-1">
            {currentUser && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>
            )}

            {currentUser && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 overflow-hidden"
                  title="Profile"
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                  {currentUser.name?.split(' ')[0] || (role === 'warden' ? 'Official' : 'User')}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
