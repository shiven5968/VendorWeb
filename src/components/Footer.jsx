import React from 'react';
import { Utensils, Heart, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer = () => {
  const { setCurrentPage } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">MessMate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Know Your Meal Before You Eat It. Empowering campus dining with nutrition transparency, student governance, and data-driven kitchen operations.
            </p>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 mr-1" /> Incubation Ready
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Award className="w-3 h-3 mr-1" /> Smart Hostel v2.4
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-emerald-400 transition-colors">Home</button></li>
              <li><button onClick={() => setCurrentPage('features')} className="hover:text-emerald-400 transition-colors">Features Showcase</button></li>
              <li><button onClick={() => setCurrentPage('how-it-works')} className="hover:text-emerald-400 transition-colors">How It Works</button></li>
              <li><button onClick={() => setCurrentPage('about')} className="hover:text-emerald-400 transition-colors">About Us</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Dashboards & Roles</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-emerald-400 font-medium">Student Dashboard</span> (Gym Mode & Rewards)</li>
              <li><span className="text-emerald-400 font-medium">Mess Committee</span> (Menu Studio & Polls)</li>
              <li><span className="text-emerald-400 font-medium">Chief Warden</span> (Analytics & Approvals)</li>
              <li><button onClick={() => setCurrentPage('voting')} className="hover:text-emerald-400 transition-colors">Live Dish Replacement Voting</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Hostel Deployment</h4>
            <p className="text-xs text-slate-400 mb-3">
              Ready for campus integration with ERP, Firebase Auth, and IoT smart mess display boards.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-slate-300 font-semibold block">Active Session:</span>
              <span className="text-emerald-400 text-[11px] font-bold">
                {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Not Logged In'}
              </span>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© 2026 MessMate Inc. All rights reserved. Built for modern university campuses.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>for healthy student dining.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
