import React from 'react';
import { Store, ShieldCheck, HelpCircle, PhoneCall, ArrowRight, ExternalLink } from 'lucide-react';

export const VendorFooter = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Info */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              MessMates Partner Network
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Official Merchant & Dining Partner Portal • ABES EC & ABESBS Ghaziabad
            </p>
          </div>
        </div>

        {/* Center: Fast Support Links */}
        <div className="flex items-center space-x-6 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fraud-Free Vouchers</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>POS Support: 1800-ABES-PERKS</span>
          </span>
        </div>

        {/* Right: Copyright */}
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} MessMates Merchant Portal. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
};
