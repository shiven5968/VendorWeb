import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Camera, 
  ClipboardCheck,
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  AlertTriangle,
  Upload,
  Check,
  FileText
} from 'lucide-react';
import { formatCollegeDateDisplay, getCollegeDateString } from '../utils/dateTime';
import { DailyPhotosPage } from './DailyPhotosPage';
import { HygieneCheckPage } from './HygieneCheckPage';

export const MessCommitteeDashboard = ({ initialTab = 'overview' }) => {
  const { 
    currentUser, 
    selectedDay, 
    setSelectedDay, 
    meals, 
    deleteMeal, 
    setIsAddMealModalOpen, 
    setEditingMeal, 
    allRatings, 
    allComplaints, 
    updateComplaintStatus, 
    wardenMetrics,
    todayDay, 
    messPhotos, 
    hygieneChecks,
    currentTime,
    approveWeeklyMenu,
    menuApproved
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'ratings-view') setActiveTab('ratings');
      else setActiveTab(initialTab);
    }
  }, [initialTab]);

  const todayStr = getCollegeDateString(currentTime);
  const todayDateString = formatCollegeDateDisplay(currentTime);

  const todayPhotos = (messPhotos || []).filter(p => p.date === todayStr);
  const todayHygiene = (hygieneChecks || []).find(h => h.date === todayStr);
  const pendingComplaints = (allComplaints || []).filter(c => c.status === 'Pending' || c.status === 'In Review' || c.status === 'PENDING' || c.status === 'IN REVIEW');
  const resolvedComplaints = (allComplaints || []).filter(c => c.status === 'Resolved' || c.status === 'RESOLVED' || c.status === 'Closed' || c.status === 'CLOSED');
  const recentRatings = (allRatings || []).slice(0, 8);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Studio', icon: UtensilsCrossed },
    { id: 'photos', label: 'Daily Photos', icon: Camera, count: todayPhotos.length },
    { id: 'hygiene', label: 'Hygiene Reports', icon: ClipboardCheck },
    { id: 'ratings', label: 'Ratings & Reviews', icon: Star },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare, count: pendingComplaints.length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* MOBILE HORIZONTAL NAVIGATION (Single Navigation on Mobile) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-8">
        
        {/* DESKTOP LEFT SIDEBAR (The Sole Primary Navigation on Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            
            {/* Staff Profile Capsule */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Operational Staff
              </span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {currentUser?.name || 'Mess Committee'}
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                Naina Caters Operations Team
              </p>
            </div>

            {/* Sidebar Navigation Links */}
            <nav className="p-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Action: Add Menu Item */}
            <button
              onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Dish</span>
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 min-w-0 space-y-6 pb-20">
          
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Mess Committee
                  </h1>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Today's Operations · {todayDateString}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={approveWeeklyMenu}
                    disabled={menuApproved}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      menuApproved 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-500/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 hover:border-emerald-500 border-slate-200'
                    }`}
                  >
                    {menuApproved ? 'Menu Authorized ✓' : 'Authorize Weekly Menu'}
                  </button>
                </div>
              </div>

              {/* TODAY'S OVERVIEW: 5 USEFUL OPERATIONAL METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                
                {/* Today's Menu */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Today's Menu</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{meals.length} Dishes</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active for {todayDay}</span>
                </div>

                {/* Today's Average Rating */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Average Rating</span>
                  <p className="text-2xl font-black text-amber-500 flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{wardenMetrics?.messQualityScore ? `${wardenMetrics.messQualityScore}` : '4.5'}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">{allRatings?.length || 0} reviews total</span>
                </div>

                {/* Pending Complaints */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pending Issues</span>
                  <p className={`text-2xl font-black ${pendingComplaints.length > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {pendingComplaints.length}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">{resolvedComplaints.length} resolved</span>
                </div>

                {/* Today's Photos */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Today's Photos</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{todayPhotos.length}</p>
                  <span className="text-[10px] text-slate-400 font-semibold">Records published</span>
                </div>

                {/* Today's Hygiene Status */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hygiene Status</span>
                  <p className={`text-lg font-black mt-1 ${
                    todayHygiene?.overallStatus === 'Good' ? 'text-emerald-600' :
                    todayHygiene?.overallStatus === 'Critical' ? 'text-rose-600' : 'text-amber-500'
                  }`}>
                    {todayHygiene ? todayHygiene.overallStatus : 'Pending'}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">Inspection audit</span>
                </div>

              </div>

              {/* 2-COLUMN OPERATIONAL SUMMARY: MENU + COMPLAINTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Today's Active Meals */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Today's Menu ({todayDay})
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold">Dishes currently served to students</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('menu')}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Menu Studio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {meals.map(meal => (
                      <div key={meal.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          {meal.image ? (
                            <img src={meal.image} alt={meal.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                              {meal.category}
                            </span>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {meal.name}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 block">{meal.time || 'Meal Time'}</span>
                          <span className="text-[10px] font-bold text-emerald-600">{meal.protein ? `${meal.protein}g protein` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Grievances / Complaints Overview */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Pending Grievances ({pendingComplaints.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold">Student feedback requiring committee action</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('complaints')}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                    >
                      <span>All Issues</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {pendingComplaints.length === 0 ? (
                    <div className="p-8 text-center text-xs font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/50">
                      ✓ No pending grievances. All operational complaints resolved!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingComplaints.slice(0, 4).map(complaint => (
                        <div key={complaint.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                                {complaint.category || 'General'}
                              </span>
                              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-1">
                                {complaint.description || complaint.text}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                              {complaint.hostelBlock || 'Hostel'}
                            </span>
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                            <button
                              onClick={() => updateComplaintStatus(complaint.id, 'RESOLVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black cursor-pointer"
                            >
                              Mark Resolved ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MENU STUDIO (EDIT / ADD / ORGANIZE DISHES) */}
          {/* ========================================================================= */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Menu Studio
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Manage weekly dishes, nutrition data, and service schedules
                  </p>
                </div>

                <button
                  onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Dish to {selectedDay}</span>
                </button>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      selectedDay === day
                        ? 'bg-emerald-600 text-white shadow-md scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    {day} {todayDay === day && '• Today'}
                  </button>
                ))}
              </div>

              {/* Meals List for Selected Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {meals.map(meal => (
                  <div key={meal.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {meal.image ? (
                          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <UtensilsCrossed className="w-8 h-8 opacity-40 mb-1" />
                            <span className="text-[10px] font-bold">Holiday / Off</span>
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black">
                          {meal.category}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{meal.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{meal.items || meal.description}</p>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 pt-1">
                          <span className="text-emerald-600">{meal.protein}g protein</span>
                          <span>•</span>
                          <span>{meal.calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => { setEditingMeal(meal); setIsAddMealModalOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                        title="Edit Dish"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DAILY PHOTOS (EMBEDDED OPERATIONAL UPLOAD) */}
          {/* ========================================================================= */}
          {activeTab === 'photos' && (
            <div>
              <DailyPhotosPage />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: HYGIENE REPORTS (EMBEDDED DAILY INSPECTION) */}
          {/* ========================================================================= */}
          {activeTab === 'hygiene' && (
            <div>
              <HygieneCheckPage />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: RATINGS & REVIEWS */}
          {/* ========================================================================= */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Student Meal Ratings & Feedback
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Live taste reviews, quality ratings, and student recommendations
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(allRatings || []).map((rating, idx) => (
                  <div key={idx} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {rating.mealName || rating.mealCategory || 'Meal Review'}
                      </h4>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rating.rating}★</span>
                      </div>
                    </div>

                    {rating.feedback ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{rating.feedback}"</p>
                    ) : (
                      <p className="text-[11px] text-slate-400">No review text provided</p>
                    )}

                    {rating.tags && rating.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {rating.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: COMPLAINTS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Student Complaints & Grievances Pipeline
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Update issue statuses and track student resolutions
                </p>
              </div>

              <div className="space-y-3">
                {(allComplaints || []).map(complaint => (
                  <div key={complaint.id} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          {complaint.category || 'Quality'}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          {complaint.hostelBlock || 'DNB Block'} · {complaint.submittedByName || 'Student'}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black self-start sm:self-auto ${
                        complaint.status === 'RESOLVED' || complaint.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {complaint.status || 'Pending'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      {complaint.description || complaint.text}
                    </p>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => updateComplaintStatus(complaint.id, 'IN REVIEW')}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200"
                      >
                        In Review
                      </button>
                      <button
                        onClick={() => updateComplaintStatus(complaint.id, 'RESOLVED')}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                      >
                        Mark Resolved ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
