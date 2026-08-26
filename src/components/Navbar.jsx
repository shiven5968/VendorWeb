import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  Dumbbell, 
  BarChart3, 
  FileText, 
  ShieldAlert,
  Home,
  MessageSquare,
  Gift,
  User
} from 'lucide-react';

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

  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    if (role === 'student') {
      return [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
        { id: 'muscle-pass', label: 'Muscle Pass', icon: Dumbbell },
        { id: 'activity', label: 'Activity', icon: MessageSquare },
        { id: 'rewards', label: 'Rewards', icon: Gift },
      ];
    } else if (role === 'mess_committee') {
      return [
        { id: 'dashboard', label: 'Menu Studio', icon: UtensilsCrossed },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Feedback', icon: MessageSquare },
        { id: 'reports', label: 'Reports', icon: FileText },
      ];
    } else if (role === 'warden') {
      return [
        { id: 'dashboard', label: 'Executive Overview', icon: ShieldAlert },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Complaints', icon: MessageSquare },
        { id: 'reports', label: 'Governance', icon: FileText },
      ];
    }
    return [];
  };

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => { if (user) setCurrentPage('dashboard'); }}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                MessMates
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold hidden sm:block">
              Know Your Meal Before You Eat It
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {getNavItems().map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20 scale-105'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {user && (
            <>
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications Trigger */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Profile & Logout */}
          {user && currentUser ? (
            <div 
              onClick={() => setCurrentPage('profile')}
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            >
              <img
                src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/50 group-hover:scale-105 transition-transform"
              />
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                  {role?.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); logout(); }}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Mobile Menu Toggle */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          )}

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {user && mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2">
          {getNavItems().map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  currentPage === item.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
