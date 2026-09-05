import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { 
  Store, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  Copy, 
  Check, 
  Ticket, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';

const PARTNER_STORES = [
  {
    id: 'vendor_burger_club',
    name: 'The Burger Club',
    email: 'partner@abes.ac.in',
    category: 'Food & Dining',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    location: 'Crossing Republik Commercial Hub'
  },
  {
    id: 'vendor_pvr_grand',
    name: 'PVR Grand',
    email: 'pvr@partner.messmates.com',
    category: 'Entertainment',
    logo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=300',
    location: 'Opulent Mall Ghaziabad'
  },
  {
    id: 'vendor_fitgym',
    name: 'FitGym ABES',
    email: 'fitgym@abes.ac.in',
    category: 'Fitness',
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
    location: 'ABES Sports Complex'
  },
  {
    id: 'vendor_campus_mart',
    name: 'Campus Mart',
    email: 'campusmart@abes.ac.in',
    category: 'Hostel Essentials',
    logo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=300',
    location: 'Student Activity Center'
  }
];

export const VendorNavbar = ({ onGenerateTestVoucher }) => {
  const { user, profile, logout, login } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [switchingStore, setSwitchingStore] = useState(false);

  // Current active vendor details
  const currentVendorId = profile?.vendorId || 'vendor_burger_club';
  const currentVendor = PARTNER_STORES.find(s => s.id === currentVendorId) || {
    id: currentVendorId,
    name: profile?.vendorName || profile?.name || 'Partner Merchant',
    logo: profile?.vendorLogo || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    category: 'Merchant'
  };

  const handleSwitchStore = async (store) => {
    setStoreDropdownOpen(false);
    if (store.id === currentVendorId) return;
    setSwitchingStore(true);
    try {
      await login(store.email, 'password123');
    } catch (e) {
      console.warn('Switch store login notice:', e.message);
    } finally {
      setSwitchingStore(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Portal Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                MessMates
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Partner Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
              Campus Merchant & Partner Terminal
            </p>
          </div>
        </div>

        {/* Center: Live Firestore Status Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Firestore Sync:</span>
          <code className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            messmates-f69a3
          </code>
        </div>

        {/* Right: Store Switcher, Test Claim Tool, Theme, Logout */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick "Generate Test Voucher" Helper */}
          {onGenerateTestVoucher && (
            <button
              onClick={onGenerateTestVoucher}
              title="Generate an active student claim to test counter scanner"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Student Voucher</span>
              <span className="sm:hidden">Test Code</span>
            </button>
          )}

          {/* Active Store Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
              disabled={switchingStore}
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <img 
                src={currentVendor.logo} 
                alt={currentVendor.name} 
                className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-600"
              />
              <span className="max-w-[110px] sm:max-w-[140px] truncate">
                {switchingStore ? 'Switching...' : currentVendor.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {storeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setStoreDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    Switch Partner Store
                  </p>
                  <div className="space-y-1">
                    {PARTNER_STORES.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => handleSwitchStore(store)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-all ${
                          store.id === currentVendorId
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <img 
                          src={store.logo} 
                          alt={store.name} 
                          className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate leading-tight">
                            {store.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {store.category} • {store.location}
                          </p>
                        </div>
                        {store.id === currentVendorId && (
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Sign out of Partner Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
