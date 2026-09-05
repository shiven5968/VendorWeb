import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  Store, 
  ArrowRight, 
  Lock, 
  Mail, 
  AlertCircle,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';

export const VendorLandingPage = () => {
  const { login, loading: authLoading } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign In Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter your vendor email and password.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please use the credentials provided by MessMates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                MessMates
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Partner Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
              Campus Merchant & Retail Network
            </p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Centered Sign-In Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto w-full">
        
        {/* Brand Hero */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 mb-1">
            <Store className="w-8 h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            MESSMATES
          </h1>

          <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            Partner & Vendor Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Vendor Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your official partner email and password to access your store terminal:
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Vendor Partner Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. partner@abes.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Vendor Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Portal Notice */}
          <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Authorized merchant partners only. Passwords are encrypted and managed by MessMates Administration.
          </div>

        </div>

      </main>

      {/* Clean Footer */}
      <footer className="py-6 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        ABES EC & ABESBS Campus Dining Platform • MessMates Merchant Portal
      </footer>

    </div>
  );
};
