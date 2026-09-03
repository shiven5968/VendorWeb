import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, Plus, Edit3, Trash2, Vote, BarChart3, FileText, Star, 
  MessageSquare, Calendar, Download, CheckCircle2, Clock, Camera, ClipboardCheck
} from 'lucide-react';
import { StatCard, MealCard, StatusBadge, EmptyState, DashboardCard, SectionHeader, RatingStars, WeeklyDayPicker } from '../components/ui';

export const MessCommitteeDashboard = ({ initialTab = 'overview' }) => {
  const { 
    currentUser, selectedDay, setSelectedDay, meals, deleteMeal, 
    setIsAddMealModalOpen, setEditingMeal, poll, createPoll,
    allRatings, allComplaints, updateComplaintStatus, wardenMetrics,
    todayDay, messPhotos, hygieneChecks, setCurrentPage
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPhotos = (messPhotos || []).filter(p => p.date === todayStr);
  const todayHygiene = (hygieneChecks || []).find(h => h.date === todayStr);
  const recentRatings = (allRatings || []).slice(0, 5);
  const pendingComplaints = (allComplaints || []).filter(c => c.status === 'Pending' || c.status === 'In Review');

  // Aggregate ratings by meal for structured presentation
  const mealRatingsSummary = useMemo(() => {
    const map = {};
    (allRatings || []).forEach(r => {
      const key = r.mealName || r.mealId;
      if (!key) return;
      if (!map[key]) {
        map[key] = {
          mealName: r.mealName || 'Dish',
          mealCategory: r.mealCategory || '',
          ratings: [],
          feedbacks: []
        };
      }
      if (typeof r.rating === 'number') {
        map[key].ratings.push(r.rating);
      }
      if (r.feedback && r.feedback.trim()) {
        map[key].feedbacks.push({
          feedback: r.feedback,
          userName: r.userName,
          rating: r.rating
        });
      }
    });

    return Object.values(map).map(m => {
      const count = m.ratings.length;
      const avg = count > 0 ? (m.ratings.reduce((a, b) => a + b, 0) / count).toFixed(1) : '0.0';
      return { ...m, count, avg: parseFloat(avg) };
    }).sort((a, b) => b.count - a.count);
  }, [allRatings]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Star} label="Today's Avg Rating" value={wardenMetrics.messQualityScore ? `${wardenMetrics.messQualityScore}/5` : 'N/A'} color="amber" />
              <StatCard icon={FileText} label="Pending Complaints" value={pendingComplaints.length} color="rose" />
              <StatCard icon={Camera} label="Today's Photos" value={todayPhotos.length} color="emerald" subLabel="Operations uploaded" />
              <StatCard icon={ClipboardCheck} label="Hygiene Status" value={todayHygiene ? todayHygiene.overallStatus : 'Pending'} color={todayHygiene?.overallStatus === 'Good' ? 'emerald' : todayHygiene?.overallStatus === 'Critical' ? 'rose' : 'amber'} />
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
                <DashboardCard title="Recent Student Feedback">
                  {recentRatings.length > 0 ? (
                    <div className="space-y-3">
                      {recentRatings.map((rating, idx) => (
                        <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{rating.mealName}</span>
                            <RatingStars value={rating.rating} readonly size="sm" />
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
          <div className="space-y-6">
            <DashboardCard title="Meal Performance &amp; Ratings">
              {mealRatingsSummary.length > 0 ? (
                <div className="space-y-4">
                  {mealRatingsSummary.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          {item.mealCategory && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              {item.mealCategory}
                            </span>
                          )}
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.mealName}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RatingStars value={Math.round(item.avg)} readonly size="sm" />
                          <span className="text-sm font-black text-slate-900 dark:text-white">{item.avg} / 5</span>
                          <span className="text-xs text-slate-400">({item.count} {item.count === 1 ? 'rating' : 'ratings'})</span>
                        </div>
                      </div>
                      {item.feedbacks.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Student Feedback:</span>
                          {item.feedbacks.slice(0, 2).map((fb, fi) => (
                            <p key={fi} className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                              "{fb.feedback}" <span className="not-italic text-slate-400 text-[10px]">— {fb.userName || 'Student'} ({fb.rating}★)</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Star} title="No ratings recorded yet" description="Student feedback and ratings will appear here." />
              )}
            </DashboardCard>
          </div>
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
      <aside className="hidden md:block w-56 p-5 border-r border-slate-200 dark:border-slate-800 space-y-1 pt-8">
        {[
          { id: 'overview', icon: BarChart3, label: 'Dashboard' },
          { id: 'menu', icon: Utensils, label: 'Menu' },
          { id: 'ratings', icon: Star, label: 'Ratings' },
          { id: 'complaints', icon: FileText, label: 'Complaints' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mess Committee</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Today's Operations · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {renderTabContent()}
      </main>
    </div>
  );
};

