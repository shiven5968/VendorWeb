import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  FileText, 
  Download, 
  Users, 
  AlertCircle,
  Star,
  Check
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const WardenDashboard = () => {
  const { wardenAnalytics, recentComplaints, meals, menuApproved, approveWeeklyMenu, poll } = useApp();
  const [activeSection, setActiveSection] = useState('quality'); // 'quality' | 'complaints' | 'feedback' | 'voting' | 'reports'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            HELLO PATHAK SIR 👋
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Chief Warden • Executive Portal</p>
        </div>

        <button
          onClick={approveWeeklyMenu}
          disabled={menuApproved}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-1.5 transition-all ${
            menuApproved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{menuApproved ? 'Menu Approved' : 'Approve Menu'}</span>
        </button>
      </div>

      {/* IMPORTANT METRICS ONLY (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mess Rating</span>
          <p className="text-2xl font-black text-amber-500 flex items-center justify-center space-x-1">
            <Star className="w-4 h-4 fill-current" />
            <span>{wardenAnalytics.messQualityScore} / 5.0</span>
          </p>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Open Complaints</span>
          <p className="text-2xl font-black text-rose-500">
            {recentComplaints.filter(c => c.status !== 'Resolved').length}
          </p>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Student Satisfaction</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {wardenAnalytics.satisfactionRate}%
          </p>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Meals Reviewed</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {wardenAnalytics.mealsServedToday}
          </p>
        </div>

      </div>

      {/* Section Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {[
          { id: 'quality', label: 'Food Quality' },
          { id: 'complaints', label: 'Complaints' },
          { id: 'feedback', label: 'Feedback' },
          { id: 'voting', label: 'Voting' },
          { id: 'reports', label: 'Reports' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeSection === tab.id
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: FOOD QUALITY */}
      {activeSection === 'quality' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Food Quality Trend (%)</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wardenAnalytics.satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SECTION 2: COMPLAINTS */}
      {activeSection === 'complaints' && (
        <div className="space-y-3">
          {recentComplaints.map(c => (
            <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{c.issue}</h4>
                <span className="text-[10px] text-slate-400">{c.student} • {c.block}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: FEEDBACK */}
      {activeSection === 'feedback' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {meals.map(m => (
            <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{m.name}</h4>
                <span className="text-[10px] text-slate-400">{m.category}</span>
              </div>
              <span className="text-xs font-black text-amber-500">{m.rating} ⭐</span>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: VOTING */}
      {activeSection === 'voting' && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold">Active Replacement Poll</span>
            <span className="text-emerald-400">{poll.totalVotes} Votes</span>
          </div>
          <p className="text-xs font-bold text-amber-400">Replacing: {poll.dishToReplace}</p>
          <div className="space-y-2">
            {poll.options.map(opt => (
              <div key={opt.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{opt.name}</span>
                  <span className="text-emerald-400">{opt.percent}% ({opt.votes})</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${opt.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: REPORTS */}
      {activeSection === 'reports' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">Monthly Mess Report</h3>
          <p className="text-xs text-slate-500 font-semibold">Audit report for warden sign-off.</p>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md inline-flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      )}

    </div>
  );
};
