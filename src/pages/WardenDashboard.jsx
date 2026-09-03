import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, CheckCircle, Award, TrendingUp, FileText, Download, 
  Users, AlertCircle, Star, Check, Utensils, Plus, Edit3, Trash2, Camera, ClipboardCheck
} from 'lucide-react';
import { StatCard, StatusBadge, EmptyState, DashboardCard, SectionHeader, PhotoGallery, WeeklyDayPicker, MealCard } from '../components/ui';

export const WardenDashboard = () => {
  const { 
    currentUser, wardenMetrics, allComplaints, allRatings, meals, 
    selectedDay, setSelectedDay, setIsAddMealModalOpen, setEditingMeal, deleteMeal, 
    menuApproved, approveWeeklyMenu, updateComplaintStatus, messPhotos, hygieneChecks, todayDay
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');

  const pendingComplaints = allComplaints.filter(c => c.status === 'Pending' || c.status === 'In Review');
  const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved');
  const todayPhotos = messPhotos?.filter(p => p.date === new Date().toISOString().split('T')[0]) || [];
  const todayHygiene = hygieneChecks?.find(h => h.date === new Date().toISOString().split('T')[0]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Star} label="Avg Rating" value={wardenMetrics.messQualityScore ? `${wardenMetrics.messQualityScore}/5` : 'N/A'} color="amber" />
              <StatCard icon={FileText} label="Pending Complaints" value={pendingComplaints.length} color="rose" />
              <StatCard icon={CheckCircle} label="Resolved Complaints" value={resolvedComplaints.length} color="emerald" />
              <StatCard icon={Camera} label="Today's Photos" value={todayPhotos.length} color="blue" />
              <StatCard icon={ClipboardCheck} label="Hygiene Status" value={todayHygiene ? todayHygiene.overallStatus : 'Pending'} color={todayHygiene?.overallStatus === 'Good' ? 'emerald' : todayHygiene?.overallStatus === 'Critical' ? 'rose' : 'amber'} />
              <StatCard icon={Users} label="Total Ratings" value={wardenMetrics.totalRatings} color="indigo" />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <DashboardCard title="Recent Activity">
                {allRatings.length > 0 || allComplaints.length > 0 ? (
                  <div className="space-y-3">
                    {allComplaints.slice(0, 3).map(c => (
                      <div key={`c-${c.id}`} className="p-3 border-l-4 border-rose-500 bg-slate-50 dark:bg-slate-800/50 rounded-r-xl">
                        <span className="text-xs font-bold text-rose-500">Complaint • {c.status}</span>
                        <p className="text-sm font-medium mt-1">{c.subject}</p>
                      </div>
                    ))}
                    {allRatings.slice(0, 3).map((r, i) => (
                      <div key={`r-${i}`} className="p-3 border-l-4 border-amber-500 bg-slate-50 dark:bg-slate-800/50 rounded-r-xl">
                        <span className="text-xs font-bold text-amber-500">Rating • {r.rating}/5</span>
                        <p className="text-sm font-medium mt-1">{r.mealName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Award} title="No recent activity" description="Activity will appear here." />
                )}
              </DashboardCard>
              
              <DashboardCard title="Quick Actions">
                <div className="space-y-3">
                  <button onClick={approveWeeklyMenu} disabled={menuApproved} className={`w-full p-4 rounded-xl font-bold flex items-center justify-between ${menuApproved ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5" />
                      <span>{menuApproved ? 'Weekly Menu Approved' : 'Approve Weekly Menu'}</span>
                    </div>
                  </button>
                </div>
              </DashboardCard>
            </div>
          </div>
        );
      case 'menu':
        return (
          <div className="space-y-6">
            <WeeklyDayPicker days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} selectedDay={selectedDay} onDayChange={setSelectedDay} todayDay={todayDay} />
            <DashboardCard title={`${selectedDay}'s Menu Oversight`} action={<button onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Add Dish</button>}>
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
                <EmptyState icon={Utensils} title="No meals for this day" description="Mess committee has not added meals." />
              )}
            </DashboardCard>
          </div>
        );
      case 'photos':
        return (
          <DashboardCard title="Today's Mess Photos">
            {todayPhotos.length > 0 ? (
              <PhotoGallery photos={todayPhotos.flatMap(doc => doc.urls.map(url => ({ url, category: doc.photoCategory, meal: doc.mealCategory, uploadedBy: doc.uploadedByName })))} groupBy="meal" />
            ) : (
              <EmptyState icon={Camera} title="No photos uploaded today" description="Mess Committee will upload daily photos here." />
            )}
          </DashboardCard>
        );
      case 'hygiene':
        return (
          <DashboardCard title="Hygiene Reports">
            <div className="space-y-4">
              {hygieneChecks && hygieneChecks.length > 0 ? (
                hygieneChecks.map(check => (
                  <div key={check.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="font-bold text-sm block">Inspection: {check.date}</span>
                        <span className="text-xs text-slate-500">By {check.submittedByName}</span>
                      </div>
                      <StatusBadge status={check.overallStatus} variant={check.overallStatus === 'Good' ? 'success' : check.overallStatus === 'Critical' ? 'danger' : 'warning'} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {check.items.map((item, i) => (
                        <div key={i} className="text-xs flex justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded">
                          <span>{item.label}</span>
                          <span className={item.status === 'Good' ? 'text-emerald-500' : item.status === 'Critical' ? 'text-rose-500' : 'text-amber-500'}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                    {check.notes && <p className="text-sm mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg italic">Notes: {check.notes}</p>}
                  </div>
                ))
              ) : (
                <EmptyState icon={ClipboardCheck} title="No hygiene reports" description="No daily inspections submitted yet." />
              )}
            </div>
          </DashboardCard>
        );
      case 'complaints':
        return (
          <DashboardCard title="Oversight: Complaints">
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
                      <span className="text-xs font-medium text-slate-500 self-center mr-2">Oversight Status Update:</span>
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
        <div className="font-black text-xl mb-8">ABES Officials</div>
        {[
          { id: 'overview', icon: ShieldAlert, label: 'Dashboard' },
          { id: 'menu', icon: Utensils, label: 'Menu Oversight' },
          { id: 'photos', icon: Camera, label: 'Mess Photos' },
          { id: 'hygiene', icon: ClipboardCheck, label: 'Hygiene Reports' },
          { id: 'complaints', icon: FileText, label: 'Complaints' }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 mb-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">ABES Officials Dashboard</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">Institutional Oversight Console</p>
          </div>
          <div className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full text-xs font-bold">
            ABES Official
          </div>
        </div>
        
        {renderTabContent()}
      </main>
    </div>
  );
};
