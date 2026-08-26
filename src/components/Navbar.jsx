import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  Vote, 
  Tag, 
  Dumbbell, 
  Info,
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
    currentRole, 
    currentPage, 
    setCurrentPage, 
    logout, 
    darkMode, 
    toggleDarkMode, 
    unreadCount, 
    setIsNotificationOpen, 
    setIsSearchOpen,
    loginAsRole
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    if (currentRole === 'student') {
      return [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
        { id: 'muscle-pass', label: 'Muscle Pass', icon: Dumbbell },
        { id: 'activity', label: 'Activity', icon: MessageSquare },
        { id: 'rewards', label: 'Rewards', icon: Gift },
      ];
    } else if (currentRole === 'committee') {
      return [
        { id: 'dashboard', label: 'Menu Studio', icon: UtensilsCrossed },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Feedback', icon: MessageSquare },
        { id: 'reports', label: 'Reports', icon: FileText },
      ];
    } else if (currentRole === 'warden') {
      return [
        { id: 'dashboard', label: 'Executive Overview', icon: ShieldAlert },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'activity', label: 'Complaints', icon: MessageSquare },
        { id: 'reports', label: 'Governance', icon: FileText },
      ];
    } else {
      return [
        { id: 'home', label: 'Home' },
        { id: 'features', label: 'Features' },
        { id: 'how-it-works', label: 'How It Works' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' },
      ];
    }
  };

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-9 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo - Plate, Spoon & Fork Icon */}
        <div 
          onClick={() => { if (currentRole === 'landing') setCurrentPage('home'); else setCurrentPage('dashboard'); }}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                MessMates
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold hidden sm:block">
              Know Your Meal Before You Eat It
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
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

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
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

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Profile / Login CTA */}
          {currentUser ? (
            <div 
              onClick={() => setCurrentPage('profile')}
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/50 group-hover:scale-105 transition-transform"
              />
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {currentUser.role === 'student' ? 'Student' : currentUser.role}
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
          ) : (
            <button
              onClick={() => loginAsRole('student')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
            >
              <span>Login Demo</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
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
