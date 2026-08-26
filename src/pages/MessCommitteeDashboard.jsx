import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, 
  Plus, 
  Edit3, 
  Trash2, 
  Vote, 
  BarChart3, 
  FileText, 
  Star, 
  MessageSquare,
  Calendar,
  Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const MessCommitteeDashboard = () => {
  const { 
    selectedDay, 
    setSelectedDay, 
    weeklyMessMenu, 
    deleteMeal, 
    setIsAddMealModalOpen, 
    setEditingMeal, 
    poll, 
    meals,
    recentComplaints 
  } = useApp();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'feedback' | 'complaints' | 'voting' | 'analytics' | 'reports'
  const [complaintList, setComplaintList] = useState(recentComplaints || []);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayMeals = weeklyMessMenu[selectedDay] || [];

  const updateStatus = (id, newStatus) => {
    setComplaintList(complaintList.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            HELLO, MESS COMMITTEE 👨‍🍳
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Operational Mess Management Studio</p>
        </div>

        <button
          onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ADD MENU</span>
        </button>
      </div>

      {/* QUICK ACTIONS (4 BUTTONS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-center transition-all shadow-sm"
        >
          <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">ADD MENU</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 text-center transition-all shadow-sm"
        >
          <Star className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">VIEW FEEDBACK</span>
        </button>

        <button
          onClick={() => setActiveTab('voting')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 text-center transition-all shadow-sm"
        >
          <Vote className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1.5" />
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">CREATE VOTE</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500 text-center transition-all shadow-sm"
        >
          <MessageSquare className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">VIEW COMPLAINTS</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        {[
          { id: 'menu', label: 'Menu' },
          { id: 'feedback', label: 'Feedback' },
          { id: 'complaints', label: 'Complaints' },
          { id: 'voting', label: 'Voting' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'reports', label: 'Reports' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MENU */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDay === day ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dayMeals.map(meal => (
              <div key={meal.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="relative h-36 w-full">
                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                      {meal.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{meal.name}</h4>
                    <span className="text-[10px] text-slate-400">{meal.calories} kcal • {meal.protein}g protein</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-between">
                  <button
                    onClick={() => { setEditingMeal(meal); setIsAddMealModalOpen(true); }}
                    className="px-2.5 py-1 rounded-lg text-emerald-600 text-xs font-bold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteMeal(meal.id, selectedDay)}
                    className="px-2.5 py-1 rounded-lg text-rose-600 text-xs font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {meals.map(m => (
            <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{m.name}</h4>
                <span className="text-[10px] text-slate-400">{m.category}</span>
              </div>
              <span className="text-xs font-black text-amber-500">{m.rating} ⭐ ({m.ratingCount})</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-3">
          {complaintList.map(c => (
            <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{c.issue}</h4>
                <span className="text-[10px] text-slate-400">{c.student} ({c.block}) • {c.date}</span>
              </div>

              <div className="flex space-x-1">
                {['Pending', 'In Review', 'Resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => updateStatus(c.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      c.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: VOTING */}
      {activeTab === 'voting' && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold">Active Vote: {poll.dishToReplace}</span>
            <span className="text-emerald-400">{poll.totalVotes} votes</span>
          </div>
          <div className="space-y-2">
            {poll.options.map(opt => (
              <div key={opt.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{opt.name}</span>
                  <span className="text-emerald-400">{opt.percent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${opt.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400">Meal Ratings</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayMeals}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="rating" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Mess Committee Monthly Summary</h3>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md inline-flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary</span>
          </button>
        </div>
      )}

    </div>
  );
};
