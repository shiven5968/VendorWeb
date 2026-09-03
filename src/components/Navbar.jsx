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
  const { role } = useAuth();

  const getNavItems = () => {
    switch(role) {
      case 'warden':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'photo-archive', label: 'Photos', icon: Camera },
          { id: 'hygiene-archive', label: 'Hygiene', icon: ShieldCheck },
          { id: 'complaints', label: 'Complaints', icon: MessageSquare },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ];
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
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white hidden sm:block tracking-tight">
              MessMates
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={clsx(
                    "flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Notification + Avatar + Logout */}
          <div className="flex items-center space-x-1">
            {currentUser && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>
            )}

            {currentUser && (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 overflow-hidden"
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {currentUser.name?.split(' ')[0]}
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
