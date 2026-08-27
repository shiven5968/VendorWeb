import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, ShieldAlert, Users } from 'lucide-react';
import { OfficialContactSection } from '../components/OfficialContactSection';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Contact & Campus Administration
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Official hostel governance, dining hall management & student helpdesk.
        </p>
      </div>

      {/* Official Contacts Grid */}
      <OfficialContactSection />

      {/* Campus Dining Complex Info */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800">
        <h3 className="text-base font-black text-white">ABES Dining Complex Locations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Boys Dining Complex</span>
            <p className="font-bold text-white">Campus Dining Hall 1 (Opposite DNB & VKB Blocks)</p>
            <p className="text-slate-400">Serving DNB, VKB, RKB, and ABB Boys Hostels</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase">Girls Dining Complex</span>
            <p className="font-bold text-white">Campus Dining Hall 2 (Girls Hostel Complex)</p>
            <p className="text-slate-400">Serving Kalpana Chawla, Sarojini, and Kasturba Hostels</p>
          </div>
        </div>
      </div>

    </div>
  );
};
