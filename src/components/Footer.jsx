import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { MessMatesLogo } from './MessMatesLogo';
import { useApp } from '../context/AppContext';
import { MESSMATES_SUPPORT_CONTACTS } from '../config/contacts';

export const Footer = () => {
  let appState = null;
  try {
    appState = useApp();
  } catch (err) {
    // Graceful fallback if rendered outside AppProvider
  }
  const { setCurrentPage, currentUser } = appState || {};

  const handleNav = (page) => {
    if (setCurrentPage && currentUser) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* MAIN 4-COLUMN FOOTER GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-10 border-b border-slate-200/80 dark:border-slate-800">
          
          {/* COLUMN 1: BRAND IDENTITY & MISSION */}
          <div className="space-y-3.5">
            <div className="p-0.5 inline-block">
              <MessMatesLogo variant="full" size="sm" />
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm font-medium">
              MessMates delivers an intelligent campus dining ecosystem for ABES Engineering College. 
              Connecting hostellers, mess committees, and wardens through transparent live menus, 
              verified nutrition breakdowns, and audited daily hygiene oversight.
            </p>

            <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 font-semibold space-y-0.5">
              <p className="font-bold text-slate-600 dark:text-slate-400">{MESSMATES_SUPPORT_CONTACTS.campus}</p>
              <p>{MESSMATES_SUPPORT_CONTACTS.address}</p>
            </div>
          </div>

          {/* COLUMN 2: CAMPUS DINING PATHWAYS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Campus Dining
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('menu')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Weekly Mess Schedule
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('menu')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Nutrition &amp; Macro Breakdown
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Live Meal Service Status
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Student Meal Ratings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('complaints')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Grievance &amp; Complaint Pipeline
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: PLATFORM & REACH */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Platform &amp; Reach
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <span className="text-slate-500 dark:text-slate-400">
                  Hostel Ecosystem (5,000+ Students)
                </span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('hygiene')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Kitchen Hygiene &amp; Sanitization
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('daily-photos')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Timestamped Preparation Photos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('voting')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Mess Committee Voting
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('profile')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Founding Team &amp; About Us
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: GLOBAL SUPPORT (CONTACT INFO) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Global Support
            </h4>
            
            <div className="space-y-2.5 text-xs font-semibold">
              
              {/* Phone Numbers */}
              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-0.5">
                  <a
                    href={`tel:${MESSMATES_SUPPORT_CONTACTS.phone1}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {MESSMATES_SUPPORT_CONTACTS.phone1}
                  </a>
                  <a
                    href={`tel:${MESSMATES_SUPPORT_CONTACTS.phone2}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {MESSMATES_SUPPORT_CONTACTS.phone2}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-2.5 pt-1">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a
                  href={`mailto:${MESSMATES_SUPPORT_CONTACTS.email}`}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors break-all"
                >
                  {MESSMATES_SUPPORT_CONTACTS.email}
                </a>
              </div>

              {/* Physical Location */}
              <div className="flex items-start space-x-2.5 pt-1 text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {MESSMATES_SUPPORT_CONTACTS.address}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM SUB-FOOTER */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
          <div className="flex items-center space-x-2">
            <span>{MESSMATES_SUPPORT_CONTACTS.campus}</span>
            <span>•</span>
            <span>Campus Dining Administration Platform</span>
          </div>

          <p>
            © {new Date().getFullYear()} MessMates • {MESSMATES_SUPPORT_CONTACTS.tagline}
          </p>
        </div>

      </div>
    </footer>
  );
};
