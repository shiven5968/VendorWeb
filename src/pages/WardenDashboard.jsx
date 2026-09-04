import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, UtensilsCrossed, Camera, ClipboardCheck, Star, FileText, 
  BarChart3, CheckCircle, Check, Plus, Edit3, Trash2, Shield, AlertTriangle, Award
} from 'lucide-react';
import { 
  StatCard, StatusBadge, EmptyState, DashboardCard, 
  PhotoGallery, WeeklyDayPicker, MealCard, RatingStars 
} from '../components/ui';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { clsx } from 'clsx';

import { formatCollegeDateDisplay, getCollegeDateString } from '../utils/dateTime';
import { StudentSatisfactionModule } from '../components/satisfaction/StudentSatisfactionModule';

export const WardenDashboard = ({ initialTab = 'overview' }) => {
  const { 
    currentUser, 
    wardenMetrics, 
    wardenAnalytics,
    allComplaints, 
    allRatings, 
    meals, 
    todayMeals,
    selectedDay, 
    setSelectedDay, 
    setIsAddMealModalOpen, 
    setEditingMeal, 
    deleteMeal, 
    menuApproved, 
    approveWeeklyMenu, 
    updateComplaintStatus, 
    messPhotos, 
    hygieneChecks, 
    todayDay,
    currentTime
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const todayStr = getCollegeDateString(currentTime);
  const todayFormattedDate = formatCollegeDateDisplay(currentTime);

  // Safe complaint filtering
  const pendingComplaints = useMemo(() => {
    return (allComplaints || []).filter(c => {
      const s = (c.status || '').toLowerCase();
      return s === 'pending' || s === 'in review' || s === 'in progress';
    });
  }, [allComplaints]);

  const resolvedComplaints = useMemo(() => {
    return (allComplaints || []).filter(c => {
      const s = (c.status || '').toLowerCase();
      return s === 'resolved' || s === 'closed';
    });
  }, [allComplaints]);

  // Safe photo filtering & formatting
  const todayPhotos = useMemo(() => {
    return (messPhotos || []).filter(p => p.date === todayStr);
  }, [messPhotos, todayStr]);

  const todayPhotosFormatted = useMemo(() => {
    return (todayPhotos || []).flatMap(doc => {
      const urls = Array.isArray(doc.urls) ? doc.urls : (doc.url ? [doc.url] : (doc.downloadUrl ? [doc.downloadUrl] : []));
      return urls.map(url => ({
        url,
        photoCategory: doc.photoCategory || 'Mess Photo',
        mealCategory: doc.mealCategory || 'General',
        uploadedByName: doc.uploadedByName || 'Mess Committee',
        id: `${doc.id || Math.random()}_${url}`
      }));
    });
  }, [todayPhotos]);

  const allMessPhotosFormatted = useMemo(() => {
    return (messPhotos || []).flatMap(doc => {
      const urls = Array.isArray(doc.urls) ? doc.urls : (doc.url ? [doc.url] : (doc.downloadUrl ? [doc.downloadUrl] : []));
      return urls.map(url => ({
        url,
        photoCategory: doc.photoCategory || 'Mess Photo',
        mealCategory: doc.mealCategory || 'General',
        uploadedByName: doc.uploadedByName || 'Mess Committee',
        id: `${doc.id || Math.random()}_${url}`
      }));
    });
  }, [messPhotos]);

  // Safe hygiene check
  const todayHygiene = useMemo(() => {
    return (hygieneChecks || []).find(h => h.date === todayStr);
  }, [hygieneChecks, todayStr]);

  // Navigation Items (Exact items requested by ABES Officials specification)
  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'menu', icon: UtensilsCrossed, label: 'Menu Oversight' },
    { id: 'photos', icon: Camera, label: 'Mess Photos' },
    { id: 'hygiene', icon: ClipboardCheck, label: 'Hygiene Reports' },
    { id: 'satisfaction', icon: Award, label: 'Student Satisfaction' },
    { id: 'ratings', icon: Star, label: 'Ratings' },
    { id: 'complaints', icon: FileText, label: 'Complaints' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

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
      // ── TAB 1: EXECUTIVE DASHBOARD ──────────────────────────────────────────
      case 'overview':
        return (
          <div className="space-y-8">
            {/* TODAY'S OVERVIEW: 5 Compact Stat Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Today's Overview
                </h2>
                <span className="text-[11px] font-bold text-slate-400">
                  Live Campus Operational Telemetry
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <StatCard 
                  icon={Star} 
                  label="Average Rating" 
                  value={wardenMetrics?.messQualityScore ? `${wardenMetrics.messQualityScore} / 5.0` : 'No ratings'} 
                  color="amber" 
                />
                <StatCard 
                  icon={FileText} 
                  label="Pending Complaints" 
                  value={pendingComplaints.length} 
                  color={pendingComplaints.length > 0 ? 'rose' : 'slate'} 
                />
                <StatCard 
                  icon={CheckCircle} 
                  label="Resolved Complaints" 
                  value={resolvedComplaints.length} 
                  color="emerald" 
                />
                <StatCard 
                  icon={Camera} 
                  label="Today's Photos" 
                  value={todayPhotos.length} 
                  color="blue" 
                />
                <StatCard 
                  icon={ClipboardCheck} 
                  label="Hygiene Status" 
                  value={todayHygiene?.overallStatus || 'Pending'} 
                  color={todayHygiene?.overallStatus === 'Good' ? 'emerald' : todayHygiene?.overallStatus === 'Critical' ? 'rose' : 'amber'} 
                />
              </div>
            </div>

            {/* TODAY'S MENU */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Today's Menu
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {todayDay}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Weekly Schedule Oversight →
                </button>
              </div>
              {todayMeals && todayMeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {todayMeals.map(meal => (
                    <MealCard key={meal.id} meal={meal} compact showRating={false} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={UtensilsCrossed} 
                  title="No meals listed for today" 
                  description="Mess Committee has not published today's meal schedule yet." 
                />
              )}
            </section>

            {/* TODAY'S MESS PHOTOS */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Today's Mess Photos
                </h2>
                <button
                  onClick={() => setActiveTab('photos')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View Full Photo Gallery →
                </button>
              </div>
              {todayPhotosFormatted.length > 0 ? (
                <PhotoGallery photos={todayPhotosFormatted} groupBy="meal" />
              ) : (
                <EmptyState 
                  icon={Camera} 
                  title="No mess photos uploaded today" 
                  description="Daily preparation, service, and dining hall photos uploaded by the Mess Committee will appear here." 
                />
              )}
            </section>

            {/* HYGIENE STATUS */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Hygiene Status
                </h2>
                <button
                  onClick={() => setActiveTab('hygiene')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  All Inspection Reports →
                </button>
              </div>
              {todayHygiene ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Daily Inspection Report · {todayHygiene.date}</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        Conducted by: {todayHygiene.submittedByName || 'Mess Committee'}
                      </p>
                    </div>
                    <StatusBadge status={todayHygiene.overallStatus} variant="hygiene" />
                  </div>
                  {Array.isArray(todayHygiene.items) && todayHygiene.items.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {todayHygiene.items.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate mr-1">{item.label}</span>
                          <span className={clsx(
                            'font-bold text-[10px] px-1.5 py-0.5 rounded', 
                            item.status === 'Good' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 
                            item.status === 'Critical' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 
                            'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                          )}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {todayHygiene.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      Notes: {todayHygiene.notes}
                    </p>
                  )}
                </div>
              ) : (
                <EmptyState 
                  icon={ClipboardCheck} 
                  title="No inspection submitted for today" 
                  description="Today's hygiene compliance checklist has not yet been submitted by the inspection team." 
                />
              )}
            </section>

            {/* RECENT COMPLAINTS & RECENT RATINGS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RECENT COMPLAINTS */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recent Complaints
                  </h2>
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Manage ({allComplaints?.length || 0}) →
                  </button>
                </div>
                {allComplaints && allComplaints.length > 0 ? (
                  <div className="space-y-2">
                    {allComplaints.slice(0, 3).map(c => (
                      <div key={c.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-sm">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <StatusBadge status={c.status} variant="complaint" />
                            <span className="text-[11px] font-bold text-slate-400 truncate">{c.category || 'Mess Service'}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.subject}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                          <span className="text-[10px] text-slate-400 block">Reported by {c.userName || 'Student'}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={FileText} 
                    title="No complaints filed" 
                    description="There are currently zero open student grievances." 
                  />
                )}
              </section>

              {/* RECENT RATINGS */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recent Ratings & Feedback
                  </h2>
                  <button
                    onClick={() => setActiveTab('ratings')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    View All ({allRatings?.length || 0}) →
                  </button>
                </div>
                {allRatings && allRatings.length > 0 ? (
                  <div className="space-y-2">
                    {allRatings.slice(0, 3).map((r, i) => (
                      <div key={r.id || i} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.mealName || 'Dish'}</span>
                          <div className="flex items-center space-x-1">
                            <RatingStars value={Number(r.rating) || 0} readonly size="sm" />
                            <span className="text-xs font-black text-slate-900 dark:text-white ml-1">{r.rating}/5</span>
                          </div>
                        </div>
                        {r.feedback ? (
                          <p className="text-xs text-slate-500 italic line-clamp-2">"{r.feedback}"</p>
                        ) : (
                          <p className="text-[11px] text-slate-400">Rating submitted without feedback text.</p>
                        )}
                        <span className="text-[10px] text-slate-400 block">— {r.userName || 'Student'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={Star} 
                    title="No ratings recorded yet" 
                    description="Student ratings and feedback will appear here." 
                  />
                )}
              </section>
            </div>
          </div>
        );

      // ── TAB 2: MENU OVERSIGHT ──────────────────────────────────────────────
      case 'menu':
        return (
          <div className="space-y-6">
            <WeeklyDayPicker 
              days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} 
              selectedDay={selectedDay} 
              onDayChange={setSelectedDay} 
              todayDay={todayDay} 
            />

            <DashboardCard 
              title={`${selectedDay}'s Menu Oversight`} 
              subtitle="Review dishes scheduled for this day"
              action={
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={approveWeeklyMenu} 
                    disabled={menuApproved} 
                    className={clsx(
                      'px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer',
                      menuApproved 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{menuApproved ? 'Menu Approved' : 'Authorize Menu'}</span>
                  </button>
                  <button 
                    onClick={() => { setEditingMeal(null); setIsAddMealModalOpen(true); }} 
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1"/>
                    <span>Add Dish</span>
                  </button>
                </div>
              }
            >
              {meals && meals.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {meals.map(meal => (
                    <div key={meal.id} className="relative">
                      <MealCard meal={meal} />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button 
                          onClick={() => { setEditingMeal(meal); setIsAddMealModalOpen(true); }} 
                          className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-md shadow-sm hover:text-blue-500 transition-colors cursor-pointer"
                          title="Edit Meal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteMeal(meal.id)} 
                          className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-md shadow-sm hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete Meal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={UtensilsCrossed} title="No meals for this day" description="Mess committee has not added meals." />
              )}
            </DashboardCard>
          </div>
        );

      // ── TAB 3: MESS PHOTOS ──────────────────────────────────────────────────
      case 'photos':
        return (
          <DashboardCard title="Daily Mess Photos Archive" subtitle="Inspection of dining hall & food preparation">
            {allMessPhotosFormatted.length > 0 ? (
              <PhotoGallery photos={allMessPhotosFormatted} groupBy="meal" />
            ) : (
              <EmptyState 
                icon={Camera} 
                title="No operational photos recorded" 
                description="Daily photos uploaded by the Mess Committee will be archived here." 
              />
            )}
          </DashboardCard>
        );

      // ── TAB 4: HYGIENE REPORTS ──────────────────────────────────────────────
      case 'hygiene':
        return (
          <DashboardCard title="Hygiene & Sanitation Audit Log" subtitle="Daily regulatory compliance inspections">
            <div className="space-y-4">
              {hygieneChecks && hygieneChecks.length > 0 ? (
                hygieneChecks.map(check => (
                  <div key={check.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-sm text-slate-900 dark:text-white block">Inspection Date: {check.date}</span>
                        <span className="text-xs text-slate-400 font-semibold">Submitted by {check.submittedByName || 'Mess Committee'}</span>
                      </div>
                      <StatusBadge status={check.overallStatus} variant="hygiene" />
                    </div>
                    {Array.isArray(check.items) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {check.items.map((item, i) => (
                          <div key={i} className="text-xs flex justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                            <span className="text-slate-600 dark:text-slate-300 font-medium truncate mr-1">{item.label}</span>
                            <span className={clsx(
                              'font-bold text-[10px]',
                              item.status === 'Good' ? 'text-emerald-500' : 
                              item.status === 'Critical' ? 'text-rose-500' : 'text-amber-500'
                            )}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {check.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        Notes: {check.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState 
                  icon={ClipboardCheck} 
                  title="No hygiene reports filed" 
                  description="Daily sanitation inspection logs will appear here." 
                />
              )}
            </div>
          </DashboardCard>
        );

      // ── TAB: STUDENT SATISFACTION ──────────────────────────────────────────
      case 'satisfaction':
        return (
          <StudentSatisfactionModule
            mode="officials"
            allRatings={allRatings}
            allComplaints={allComplaints}
            allMeals={meals}
            hygieneChecks={hygieneChecks}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );

      // ── TAB 5: RATINGS ──────────────────────────────────────────────────────
      case 'ratings':
        return (
          <div className="space-y-6">
            <DashboardCard title="Meal Ratings & Student Satisfaction" subtitle="Aggregated student feedback by dish">
              {mealRatingsSummary.length > 0 ? (
                <div className="space-y-4">
                  {mealRatingsSummary.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          {item.mealCategory && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                              {item.mealCategory}
                            </span>
                          )}
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.mealName}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RatingStars value={Math.round(item.avg)} readonly size="sm" />
                          <span className="text-sm font-black text-slate-900 dark:text-white">{item.avg} / 5.0</span>
                          <span className="text-xs text-slate-400">({item.count} {item.count === 1 ? 'rating' : 'ratings'})</span>
                        </div>
                      </div>
                      {item.feedbacks && item.feedbacks.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Verified Student Comments:</span>
                          {item.feedbacks.slice(0, 3).map((fb, fi) => (
                            <p key={fi} className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                              "{fb.feedback}" <span className="not-italic text-slate-400 text-[10px]">— {fb.userName || 'Student'} ({fb.rating}★)</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Star} 
                  title="No ratings recorded yet" 
                  description="Student ratings and feedback comments will appear here." 
                />
              )}
            </DashboardCard>
          </div>
        );

      // ── TAB 6: COMPLAINTS ──────────────────────────────────────────────────
      case 'complaints':
        return (
          <DashboardCard title="Institutional Complaints Oversight" subtitle="Review and update student mess grievances">
            <div className="space-y-4">
              {allComplaints && allComplaints.length > 0 ? (
                allComplaints.map(complaint => (
                  <div key={complaint.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">{complaint.subject}</span>
                        <span className="text-xs text-slate-400">By {complaint.userName || 'Student'} • {complaint.category || 'Dining'}</span>
                      </div>
                      <StatusBadge status={complaint.status} variant="complaint" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      {complaint.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-400 mr-2">Update Status:</span>
                      {['Pending', 'In Review', 'Resolved'].map(status => (
                        <button 
                          key={status}
                          onClick={() => updateComplaintStatus(complaint.id, status)}
                          disabled={complaint.status === status}
                          className={clsx(
                            'px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer',
                            complaint.status === status 
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-not-allowed' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState 
                  icon={FileText} 
                  title="No complaints filed" 
                  description="There are currently zero open student grievances." 
                />
              )}
            </div>
          </DashboardCard>
        );

      // ── TAB 7: ANALYTICS ──────────────────────────────────────────────────
      case 'analytics':
        const ratedMeals = (meals || []).filter(m => m.rating !== null && m.rating !== undefined);
        const ratingDist = wardenAnalytics?.ratingDistribution || [];
        const hasRatings = ratingDist.some(d => d.percentage > 0);

        return (
          <div className="space-y-6">
            <DashboardCard title="Quality & Dining Satisfaction Analytics" subtitle="Institutional performance telemetry">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-400">Meal Ratings</h3>
                  {ratedMeals.length > 0 ? (
                    <div className="h-60 w-full">
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
                    <div className="py-16 text-center text-xs font-bold text-slate-400">
                      No rating analytics available yet.
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-400">Rating Distribution (% Share)</h3>
                  {hasRatings ? (
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ratingDist} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                          <YAxis type="category" dataKey="rating" width={60} tick={{ fontSize: 9 }} />
                          <Tooltip />
                          <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs font-bold text-slate-400">
                      No reviews recorded yet to calculate rating distribution.
                    </div>
                  )}
                </div>
              </div>
            </DashboardCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. DESKTOP SINGLE PRIMARY SIDEBAR (Left Sidebar)                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 p-5 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 min-h-[calc(100vh-3.5rem)]">
        <div className="mb-4 px-3.5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Console</span>
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white block">Institutional Oversight</span>
        </div>

        <nav className="space-y-1.5 flex-1">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  'w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-400')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">ABES Engineering College</p>
          <p className="text-[10px] text-slate-500 px-3 mt-0.5">Campus Dining Administration</p>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. MOBILE SINGLE PRIMARY TAB NAVIGATION BAR                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-14 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. MAIN DASHBOARD CONTENT AREA                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
        {/* EXECUTIVE HEADER */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                ABES OFFICIALS
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Institutional Oversight · {todayFormattedDate}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                ABES EC &amp; ABESBS Campus
              </span>
            </div>
          </div>
        </div>

        {renderTabContent()}
      </main>
    </div>
  );
};

