import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle, 
  Award, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  Sparkles,
  Users,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const WardenDashboard = () => {
  const { currentUser, wardenAnalytics, recentComplaints, meals, menuApproved, approveWeeklyMenu, poll } = useApp();

  const topRated = [...meals].sort((a, b) => b.rating - a.rating)[0];
  const worstRated = [...meals].sort((a, b) => a.rating - b.rating)[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-500/20">
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Chief Warden Executive Governance Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello {currentUser?.name || 'Pathak Sir'} 👨‍🏫
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time hostel mess quality index, food waste analytics, student complaint tracking, and weekly menu sign-off authorization.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center space-x-2 transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Export Executive Report</span>
        </button>

      </div>

      {/* EXECUTIVE KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Satisfaction</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{wardenAnalytics.satisfactionRate}%</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
            <span>+3.2% vs last month</span>
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mess Quality Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{wardenAnalytics.messQualityScore} / 5.0</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Based on 1,420 meal ratings</p>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Food Waste Index</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{wardenAnalytics.foodWasteIndex}%</p>
          <p className="text-[11px] text-slate-400">14% reduction in kitchen waste</p>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Meals Served Today</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{wardenAnalytics.mealsServedToday}</p>
          <p className="text-[11px] text-slate-400">Across Dining Halls 1 & 2</p>
        </div>

      </div>

      {/* WEEKLY MENU APPROVAL WORKFLOW */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-4 border border-blue-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Governance Action Required</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${menuApproved ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'}`}>
                {menuApproved ? 'Signed & Approved' : 'Pending Warden Sign-off'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">Upcoming Weekly Mess Menu (High-Protein Certified)</h2>
          </div>

          <button
            onClick={approveWeeklyMenu}
            disabled={menuApproved}
            className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
              menuApproved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{menuApproved ? 'Weekly Menu Authorized' : 'Approve & Sign Weekly Menu'}</span>
          </button>
        </div>
      </section>

      {/* RECHARTS VISUALIZATION DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Satisfaction & Waste Trend */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Daily Student Satisfaction % Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wardenAnalytics.satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hostel Block Participation */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Hostel Block Dining Attendance %</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardenAnalytics.blockParticipation}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="block" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TOP RATED vs WORST RATED DISH HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">🏆 Top Student Rated Dish</span>
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{topRated?.name}</h4>
            <span className="text-sm font-black text-amber-500 bg-amber-400/20 px-3 py-1 rounded-xl">{topRated?.rating} ⭐</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            High protein compliance and top student appreciation score across all blocks.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">⚠️ Lowest Rated Dish (In Replacement Poll)</span>
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{worstRated?.name}</h4>
            <span className="text-sm font-black text-rose-500 bg-rose-400/20 px-3 py-1 rounded-xl">{worstRated?.rating} ⭐</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Currently active in 24-hour student replacement voting poll.
          </p>
        </div>

      </div>

      {/* RECENT COMPLAINTS & FEEDBACK LOG */}
      <section className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Student Complaints & Feedback Audit Log</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Hostel Block</th>
                <th className="pb-3">Issue Feedback Description</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentComplaints.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{item.student}</td>
                  <td className="py-3 text-slate-500">{item.block}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{item.issue}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
