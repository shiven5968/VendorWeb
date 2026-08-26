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
  Download,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const MessCommitteeDashboard = () => {
  const { 
    currentUser,
    selectedDay, 
    setSelectedDay, 
    meals,
    deleteMeal, 
    setIsAddMealModalOpen, 
    setEditingMeal, 
    poll, 
    createPoll,
    allRatings,
    allComplaints,
    updateComplaintStatus,
    wardenMetrics
  } = useApp();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'feedback' | 'complaints' | 'voting' | 'analytics' | 'reports'
  
  // New Poll Form State
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [newPollDish, setNewPollDish] = useState('');
  const [newPollOptions, setNewPollOptions] = useState([
    { name: '', protein: '14g' },
    { name: '', protein: '12g' },
    { name: '', protein: '10g' }
  ]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleCreatePollSubmit = (e) => {
    e.preventDefault();
    if (!newPollDish.trim()) return;
    const validOptions = newPollOptions.filter(o => o.name.trim());
    if (validOptions.length < 2) return;

    createPoll({
      dishToReplace: newPollDish.trim(),
      options: validOptions,
      closingDate: 'Tomorrow at 10:00 PM'
    });
    setNewPollDish('');
    setShowPollCreator(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* Header (DYNAMIC COMMITTEE NAME) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {currentUser?.name || 'Mess Committee'} 👨‍🍳
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

      {/* QUICK METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Today's Meals</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{meals.length} Dishes</p>
          <span className="text-[10px] text-emerald-500 font-semibold">Active in student app</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Average Meal Rating</span>
          <p className="text-2xl font-black text-amber-500 flex items-center justify-center space-x-1">
            <Star className="w-4 h-4 fill-current" />
            <span>{wardenMetrics.messQualityScore} / 5.0</span>
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{allRatings.length} total reviews</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Open Complaints</span>
          <p className="text-2xl font-black text-rose-500">{wardenMetrics.openComplaints}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Pending student issues</span>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Active Poll Votes</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{poll.totalVotes}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Live votes received</span>
        </div>
      </div>

      {/* QUICK ACTIONS */}
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
          onClick={() => { setActiveTab('voting'); setShowPollCreator(true); }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 text-center transition-all shadow-sm"
        >
          <Vote className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1.5" />
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase">CREATE POLL</span>
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
          { id: 'menu', label: 'Menu Management' },
          { id: 'feedback', label: `Feedback (${allRatings.length})` },
          { id: 'complaints', label: `Complaints (${allComplaints.length})` },
          { id: 'voting', label: 'Voting Polls' },
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

      {/* TAB 1: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDay === day ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 border'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {meals.map(meal => (
              <div key={meal.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative h-36 w-full">
                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                      {meal.category}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-xs font-bold flex items-center space-x-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{meal.rating || 4.5}</span>
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{meal.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{meal.items}</p>
                    <span className="text-[10px] text-slate-400 block">{meal.calories} kcal • {meal.protein}g protein</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-between">
                  <button
                    onClick={() => { setEditingMeal(meal); setIsAddMealModalOpen(true); }}
                    className="px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-1 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
        <div className="space-y-3">
          {allRatings.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border">
              No feedback yet.
            </div>
          ) : (
            allRatings.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{r.mealName}</h4>
                    <span className="text-xs font-black text-amber-500">{r.rating} ⭐</span>
                  </div>
                  {r.feedback && <p className="text-[11px] text-slate-500 italic mt-0.5">"{r.feedback}"</p>}
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Student: {r.userName || 'Student'} • {new Date(r.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-3">
          {allComplaints.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border">
              No complaints yet.
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
                    {c.userName || 'Student'} ({c.block}) • {new Date(c.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex space-x-1">
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

      {/* TAB 4: VOTING */}
      {activeTab === 'voting' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Replacement Dish Poll</h3>
            <button
              onClick={() => setShowPollCreator(!showPollCreator)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm"
            >
              {showPollCreator ? 'Close' : 'Create New Poll'}
            </button>
          </div>

          {/* New Poll Creator */}
          {showPollCreator && (
            <form onSubmit={handleCreatePollSubmit} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
              <h4 className="text-xs font-black uppercase text-purple-600">Create Replacement Poll</h4>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Dish to Replace</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aloo Tamatar"
                  value={newPollDish}
                  onChange={e => setNewPollDish(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {newPollOptions.map((opt, i) => (
                  <div key={i}>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Option {i + 1}</label>
                    <input
                      type="text"
                      placeholder={`Candidate ${i + 1}`}
                      value={opt.name}
                      onChange={e => {
                        const updated = [...newPollOptions];
                        updated[i].name = e.target.value;
                        setNewPollOptions(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md"
              >
                Publish Live Poll
              </button>
            </form>
          )}

          {/* Current Poll Results */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold">Target Dish: {poll.dishToReplace}</span>
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
                    <div className="h-full bg-emerald-500" style={{ width: `${opt.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400">Meal Ratings (Database Calculated)</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meals}>
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
