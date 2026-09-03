import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Search, Bell, Sun, Moon, LogOut, Home, MessageSquare, Gift, User, BarChart3, Camera, ShieldCheck, Clipboard, ChefHat, Shield, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar = () => {
  const { 
    currentUser, 
    currentPage, 
    setCurrentPage, 
    logout, 
    darkMode, 
    toggleDarkMode, 
    unreadCount, 
    setIsNotificationOpen, 
    setIsSearchOpen 
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

  const roleConfig = {
    student: { label: 'Student', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    committee: { label: 'Mess Committee', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
    mess_committee: { label: 'Mess Committee', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
    warden: { label: 'ABES Official', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  };

  const navItems = getNavItems();
  const currentRoleConfig = roleConfig[role] || roleConfig.student;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Role Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 hidden sm:block">
                MessMates
              </span>
            </div>
            {role && (
              <span className={clsx("px-2.5 py-1 text-xs font-semibold rounded-full", currentRoleConfig.color)}>
                {currentRoleConfig.label}
              </span>
            )}
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
                      ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsNotificationOpen(true)} className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
            <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 sm:mx-2 hidden sm:block"></div>
            
            {currentUser && (
              <div className="hidden sm:flex items-center space-x-3 pl-2">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{currentUser.name?.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={() => setCurrentPage('profile')}
                  className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 overflow-hidden"
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </button>
                <button onClick={logout} className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
