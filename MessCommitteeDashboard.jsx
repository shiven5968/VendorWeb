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
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  Calendar,
  Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export const MessCommitteeDashboard = () => {
  const { 
    selectedDay, 
    setSelectedDay, 
    weeklyMessMenu, 
    deleteMeal, 
    setIsAddMealModalOpen, 
    setEditingMeal, 
    poll, 
    wardenAnalytics 
  } = useApp();

  const [activeTab, setActiveTab] = useState('menu');
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const dayMeals = weeklyMessMenu[selectedDay] || [];
  const lowRatedDishes = dayMeals.filter(m => m.rating < 3.0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-purple-500/20">
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Naina Caters ABES Boys' Hostel Menu Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello Mess Committee 👨‍🍳
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Upload daily & weekly menus, configure nutrition values, edit dishes for any day of the week, and launch automated dish replacement polls.
          </p>
        </div>

        <button
          onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }}
          className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl flex items-center space-x-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Upload / Edit Mess Dish</span>
        </button>

      </div>

      {/* Control Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'menu', label: 'Weekly Menu Management Studio', icon: Utensils },
          { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
          { id: 'polls', label: 'Voting Poll Manager', icon: Vote },
          { id: 'reports', label: 'Monthly Reports Generator', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WEEKLY MENU STUDIO */}
      {activeTab === 'menu' && (
        <div className="space-y-8">
          
          {/* Day of Week Selector Bar for Committee Editing */}
          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Select Day of Week to Manage Menu</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                    selectedDay === day
                      ? 'bg-purple-600 text-white shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedDay}'s Menu Items ({dayMeals.length} Dishes)
            </h2>
            <button
              onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center space-x-1 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish to {selectedDay}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dayMeals.map(meal => (
              <div key={meal.id} className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-44 w-full overflow-hidden">
                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                      {meal.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{meal.rating}</span>
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{meal.name}</h3>
                    
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-slate-800 dark:text-slate-100">
                      {meal.items || meal.description}
                    </div>

                    <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase">Calories</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{meal.calories}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-500 uppercase">Protein</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{meal.protein}g</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase">Carbs</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{meal.carbs}g</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase">Fats</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{meal.fats}g</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit / Delete Actions */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => { setEditingMeal(meal); setIsAddMealModalOpen(true); }}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Dish</span>
                  </button>

                  <button
                    onClick={() => deleteMeal(meal.id, selectedDay)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: COMMITTEE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Most Liked Hostel Dishes</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayMeals}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="rating" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Nutrition Compliance Share (%)</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={wardenAnalytics.nutritionCompliance} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                      {wardenAnalytics.nutritionCompliance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VOTING POLL MANAGER */}
      {activeTab === 'polls' && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold">Active Dish Replacement Poll</h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">Status: Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
            <span className="text-xs text-slate-400">Target Low-Rated Dish:</span>
            <p className="text-lg font-bold text-amber-400">{poll.dishToReplace} ({poll.currentRating} ⭐)</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Votes & Winning Candidate</h4>
            {poll.options.map(opt => (
              <div key={opt.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{opt.name}</span>
                  <span className="text-emerald-400">{opt.percent}% ({opt.votes} votes)</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${opt.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MONTHLY REPORTS GENERATOR */}
      {activeTab === 'reports' && (
        <div className="glass-card p-8 rounded-3xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Monthly Mess Audit & Performance Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Includes full student satisfaction breakdown, meal rating averages, replacement poll results, and food waste audit indices for ABES Boys Hostel.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl inline-flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Generate & Download Monthly PDF Report</span>
          </button>
        </div>
      )}

    </div>
  );
};
