import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Contact & Campus Inquiries</h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Interested in deploying MessMate at your hostel or university? Send us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        <div className="md:col-span-5 p-8 rounded-3xl bg-slate-900 text-white space-y-6">
          <h3 className="text-xl font-bold">Campus Deployment Office</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-emerald-400" />
              <span>contact@messmate.edu</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>+91 (800) 456-MESS</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>Innovation Incubation Center, Block 4, Campus Rd</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 glass-card p-8 rounded-3xl space-y-4">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <Check className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Delivered!</h3>
              <p className="text-xs text-slate-500">Our campus onboarding team will contact your hostel administration within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Your Name</label>
                <input required type="text" placeholder="Your Full Name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">University / Hostel Name</label>
                <input required type="text" placeholder="IIT / NIT Hostel Campus" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Message</label>
                <textarea required rows={4} placeholder="Tell us about your hostel meal capacity and requirements..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"></textarea>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
