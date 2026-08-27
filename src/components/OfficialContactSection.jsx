import React from 'react';
import { Mail, Phone, MapPin, Clock, ShieldAlert, Users, PhoneOff } from 'lucide-react';
import { OFFICIAL_CAMPUS_CONTACTS } from '../config/contacts';

export const OfficialContactSection = () => {
  const { warden, committee } = OFFICIAL_CAMPUS_CONTACTS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Official Mess & Hostel Contacts
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Direct communication channels for student grievances & assistance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* WARDEN CONTACT CARD */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{warden.name}</h3>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{warden.role}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                Administration
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{warden.location}</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{warden.hours}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Mobile-First Tap Targets) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`mailto:${warden.email}?subject=Hostel%20Mess%20Inquiry%20from%20Student`}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>EMAIL WARDEN</span>
            </a>

            {warden.phone ? (
              <a
                href={`tel:${warden.phone}`}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-black text-xs flex items-center justify-center space-x-1.5 border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>CALL</span>
              </a>
            ) : (
              <div
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-[11px] font-bold flex items-center justify-center space-x-1 border border-slate-200/60 dark:border-slate-800 cursor-default"
                title="Official phone number not configured in database. Please reach out via official email."
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>EMAIL PREFERRED</span>
              </div>
            )}
          </div>
        </div>

        {/* MESS COMMITTEE CONTACT CARD */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{committee.name}</h3>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">{committee.role}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                Student Body
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{committee.location}</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{committee.hours}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Mobile-First Tap Targets) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`mailto:${committee.email}?subject=Mess%20Issue%20/%20Feedback`}
              className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>EMAIL COMMITTEE</span>
            </a>

            {committee.phone ? (
              <a
                href={`tel:${committee.phone}`}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-black text-xs flex items-center justify-center space-x-1.5 border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-purple-500" />
                <span>CALL</span>
              </a>
            ) : (
              <div
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-[11px] font-bold flex items-center justify-center space-x-1 border border-slate-200/60 dark:border-slate-800 cursor-default"
                title="Official phone number not configured in database. Please reach out via official email."
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>EMAIL PREFERRED</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
