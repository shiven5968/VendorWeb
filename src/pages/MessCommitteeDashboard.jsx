import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, Plus, Edit3, Trash2, Vote, BarChart3, FileText, Star, 
  MessageSquare, Calendar, Download, CheckCircle2, Clock
} from 'lucide-react';
import { StatCard, MealCard, StatusBadge, EmptyState, DashboardCard, SectionHeader, RatingStars, WeeklyDayPicker } from '../components/ui';

export const MessCommitteeDashboard = () => {
  const { 
    currentUser, selectedDay, setSelectedDay, meals, deleteMeal, 
    setIsAddMealModalOpen, setEditingMeal, poll, createPoll,
    allRatings, allComplaints, updateComplaintStatus, wardenMetrics,
    todayDay
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');

  const ratedMeals = meals.filter(m => m.rating !== null && m.rating !== undefined);
  const recentRatings = allRatings.slice(0, 5);
  const pendingComplaints = allComplaints.filter(c => c.status === 'Pending' || c.status === 'In Review');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Star} label="Today's Avg Rating" value={wardenMetrics.messQualityScore ? `${wardenMetrics.messQualityScore}/5` : 'N/A'} color="amber" />
              <StatCard icon={MessageSquare} label="Total Ratings" value={wardenMetrics.totalRatings} color="blue" />
              <StatCard icon={FileText} label="Pending Complaints" value={pendingComplaints.length} color="rose" />
              <StatCard icon={Utensils} label="Active Menu" value={`${meals.length} Dishes`} color="emerald" />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <DashboardCard title="Today's Menu">
                {meals.length > 0 ? (
                  <div className="space-y-3">
                    {meals.map(meal => (
                      <MealCard key={meal.id} meal={meal} compact />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Utensils} title="No meals added" description="Add meals to today's menu." />
                )}
              </DashboardCard>

              <div className="space-y-6">
                <DashboardCard title="Recent Ratings">
                  {recentRatings.length > 0 ? (
                    <div className="space-y-3">
                      {recentRatings.map((rating, idx) => (
                        <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm">{rating.mealName}</span>
                            <RatingStars rating={rating.rating} />
                          </div>
                          {rating.feedback && <p className="text-xs text-slate-500 italic">"{rating.feedback}"</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Star} title="No ratings" description="No recent ratings found." />
                  )}
                </DashboardCard>
              </div>
            </div>
          </div>
        );
      case 'menu':
        return (
          <div className="space-y-6">
            <WeeklyDayPicker days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} selectedDay={selectedDay} onDayChange={setSelectedDay} todayDay={todayDay} />
            <DashboardCard title={`${selectedDay}'s Menu`} action={<button onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Add Dish</button>}>
              {meals.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {meals.map(meal => (
                    <div key={meal.id} className="relative">
                      <MealCard meal={meal} />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button onClick={() => { setEditingMeal(meal); setIsAddMealModalOpen(true); }} className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-md shadow-sm hover:text-blue-500"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => deleteMeal(meal.id)} className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-md shadow-sm hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Utensils} title="No meals for this day" description="Click Add Dish to create the menu." />
              )}
            </DashboardCard>
          </div>
        );
      case 'ratings':
        return (
          <DashboardCard title="All Ratings">
            <div className="space-y-4">
              {allRatings.length > 0 ? (
                allRatings.map((rating, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-sm block">{rating.mealName}</span>
                        <span className="text-xs text-slate-500">By {rating.userName} • {rating.timestamp?.toDate ? rating.timestamp.toDate().toLocaleDateString() : 'Recent'}</span>
                      </div>
                      <RatingStars rating={rating.rating} />
                    </div>
                    {rating.feedback && <p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mt-2">"{rating.feedback}"</p>}
                  </div>
                ))
              ) : (
                <EmptyState icon={Star} title="No ratings yet" description="Ratings will appear here." />
              )}
            </div>
          </DashboardCard>
        );
      case 'complaints':
        return (
          <DashboardCard title="All Complaints">
            <div className="space-y-4">
              {allComplaints.length > 0 ? (
                allComplaints.map(complaint => (
                  <div key={complaint.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-sm block">{complaint.subject}</span>
                        <span className="text-xs text-slate-500">By {complaint.userName} • {complaint.category}</span>
                      </div>
                      <StatusBadge status={complaint.status} variant={complaint.status === 'Resolved' ? 'success' : complaint.status === 'Pending' ? 'warning' : 'default'} />
                    </div>
                    <p className="text-sm my-2">{complaint.description}</p>
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-500 self-center mr-2">Update Status:</span>
                      {['Pending', 'In Review', 'Resolved'].map(status => (
                        <button 
                          key={status}
                          onClick={() => updateComplaintStatus(complaint.id, status)}
                          disabled={complaint.status === status}
                          className={`px-3 py-1 text-xs rounded-full font-medium ${complaint.status === status ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={FileText} title="No complaints" description="There are no complaints filed." />
              )}
            </div>
          </DashboardCard>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen pb-24 md:pb-0">
      <aside className="hidden md:block w-64 p-6 border-r border-slate-200 dark:border-slate-800 space-y-2">
        <div className="font-black text-xl mb-8">Committee Portal</div>
        {[
          { id: 'overview', icon: BarChart3, label: 'Dashboard' },
          { id: 'menu', icon: Utensils, label: 'Menu Studio' },
          { id: 'ratings', icon: Star, label: 'Ratings' },
          { id: 'complaints', icon: FileText, label: 'Complaints' }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === item.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 mb-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Hello, {currentUser?.name || 'Committee'} 👨‍🍳</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">Operational Mess Management Studio</p>
          </div>
          <button onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }} className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5">
            <Plus className="w-4 h-4" /><span>ADD MENU</span>
          </button>
        </div>
        
        {renderTabContent()}
      </main>
    </div>
  );
};
