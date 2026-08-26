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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const WardenDashboard = () => {
  const { 
    currentUser,
    wardenMetrics, 
    allComplaints, 
    allRatings,
    meals, 
    menuApproved, 
    approveWeeklyMenu, 
    poll,
    updateComplaintStatus
  } = useApp();

  const [activeSection, setActiveSection] = useState('overview');

  const ratedMeals = meals.filter(m => m.rating !== null && m.rating !== undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header (DYNAMIC WARDEN NAME) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {currentUser?.name || 'Chief Warden'} 👋
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Hostel Governance & Oversight Console</p>
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
          <span>{menuApproved ? 'Menu Authorized' : 'Approve Weekly Menu'}</span>
        </button>
      </div>

      {/* LAUNCH-STATE REAL METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Overall Mess Rating</span>
          <p className="text-2xl font-black text-amber-500 flex items-center justify-center space-x-1">
            {wardenMetrics.messQualityScore ? (
              <>
                <Star className="w-4 h-4 fill-current" />
                <span>{wardenMetrics.messQualityScore} / 5.0</span>
              </>
            ) : (
              <span className="text-sm font-bold text-slate-400">No ratings yet</span>
            )}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{wardenMetrics.totalRatings} total reviews</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Open Complaints</span>
          <p className="text-2xl font-black text-rose-500">
            {wardenMetrics.openComplaints}
          </p>
          <span className="text-[10px] text-emerald-500 font-semibold">{wardenMetrics.resolvedComplaints} resolved</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Student Satisfaction</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {allRatings.length > 0 ? `${wardenMetrics.studentSatisfaction}%` : 'No data yet'}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">Positive ratings (4-5★)</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Active Voting</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {poll ? `${poll.totalVotes} Votes` : '0'}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{poll ? 'Live dish replacement' : 'No active polls'}</span>
        </div>

      </div>

      {/* Section Switcher */}
      <div className="flex items-center space-x-2 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {[
          { id: 'overview', label: 'Quality Overview' },
          { id: 'complaints', label: `Complaints (${allComplaints.length})` },
          { id: 'feedback', label: `Student Reviews (${allRatings.length})` },
          { id: 'voting', label: 'Voting Status' },
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

      {/* OVERVIEW / QUALITY */}
      {activeSection === 'overview' && (
        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400">Meal Quality Index</h3>
          
          {ratedMeals.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratedMeals}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              No rating data yet. Quality scores will appear automatically as students submit meal feedback.
            </div>
          )}
        </div>
      )}

      {/* COMPLAINTS */}
      {activeSection === 'complaints' && (
        <div className="space-y-3">
          {allComplaints.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No complaints filed yet.
            </div>
          ) : (
            allComplaints.map(c => (
              <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {c.category}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{c.description}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Student: {c.userName || 'Student'} ({c.block}) • {new Date(c.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {['PENDING', 'IN REVIEW', 'RESOLVED'].map(st => (
                    <button
                      key={st}
                      onClick={() => updateComplaintStatus(c.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        c.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* FEEDBACK */}
      {activeSection === 'feedback' && (
        <div className="space-y-3">
          {allRatings.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No student reviews submitted yet.
            </div>
          ) : (
            allRatings.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{r.mealName}</h4>
                    <span className="text-xs font-black text-amber-500">{r.rating} ★</span>
                  </div>
                  {r.feedback && <p className="text-[11px] text-slate-500 italic mt-0.5">"{r.feedback}"</p>}
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    By {r.userName || 'Student'} • {new Date(r.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VOTING */}
      {activeSection === 'voting' && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800">
          {poll ? (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">Active Replacement Poll: {poll.dishToReplace}</span>
                <span className="text-emerald-400">{poll.totalVotes} Total Student Votes</span>
              </div>
              <div className="space-y-2">
                {poll.options.map(opt => (
                  <div key={opt.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{opt.name} ({opt.protein})</span>
                      <span className="text-emerald-400">{opt.percent}% ({opt.votes} votes)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${opt.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-xs font-bold text-slate-400">
              No active voting polls at this time.
            </div>
          )}
        </div>
      )}

      {/* REPORTS */}
      {activeSection === 'reports' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">Mess Quality & Governance Report</h3>
          <p className="text-xs text-slate-500 font-semibold">Campus food quality compliance and audit exporter.</p>
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
