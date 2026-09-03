import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard, MealCard, EmptyState, LoadingState, DashboardCard, WeeklyDayPicker, RatingStars, SectionHeader, Modal } from '../components/ui';
import { resolveMenuGroup } from '../config/menuGroups';
import { UtensilsCrossed, Star, MessageSquare, Gift, Award, CheckCircle2, User } from 'lucide-react';
import { clsx } from 'clsx';

export const StudentDashboard = () => {
  const { 
    currentUser, 
    todayDay, 
    selectedDay, 
    setSelectedDay,
    meals, 
    todayMeals, 
    allMeals, 
    currentTime,
    rateMeal, 
    getUserRating, 
    mealSlotInfo, 
    getTimingStatus, 
    checkIsRatingAllowed,
    userComplaints, 
    rewardPoints, 
    allRatings, 
    setCurrentPage
  } = useApp();

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedMealToRate, setSelectedMealToRate] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const menuGroup = resolveMenuGroup(currentUser);
  
  const userRatingsCount = (allRatings || []).filter(r => r.userId === (currentUser?.uid || currentUser?.id)).length;
  const userComplaintsCount = (userComplaints || []).length;

  const handleRateClick = (meal) => {
    setSelectedMealToRate(meal);
    setRatingValue(getUserRating(meal.id) || 0);
    setRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!selectedMealToRate || ratingValue === 0 || ratingSubmitting) return;
    try {
      setRatingSubmitting(true);
      await rateMeal(selectedMealToRate.id, ratingValue);
      setRatingModalOpen(false);
    } catch (error) {
      console.error("Error rating meal:", error);
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Active or upcoming meal spotlight
  const activeMeal = useMemo(() => {
    if (!todayMeals || todayMeals.length === 0) return null;
    if (mealSlotInfo?.active?.category) {
      return todayMeals.find(m => m.category === mealSlotInfo.active.category);
    }
    if (mealSlotInfo?.next?.category) {
      return todayMeals.find(m => m.category === mealSlotInfo.next.category);
    }
    return todayMeals[0];
  }, [mealSlotInfo, todayMeals]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Greeting & Quick Stats */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {todayDateString} · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{menuGroup}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage('rewards')} className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
              <Award className="w-4 h-4" />
              <span>{rewardPoints || 0} pts</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Gift} label="Reward Points" value={rewardPoints || 0} color="amber" />
          <StatCard icon={Star} label="Ratings Given" value={userRatingsCount} color="blue" />
          <StatCard icon={MessageSquare} label="Complaints" value={userComplaintsCount} color="rose" />
          <StatCard icon={UtensilsCrossed} label="Today's Meals" value={todayMeals?.length || 0} color="emerald" />
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Menu', icon: UtensilsCrossed, page: 'menu', color: 'emerald' },
          { label: 'Complaints', icon: MessageSquare, page: 'complaints', color: 'rose' },
          { label: 'Rewards', icon: Gift, page: 'rewards', color: 'amber' },
          { label: 'Profile', icon: User, page: 'profile', color: 'blue' }
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => setCurrentPage(action.page)}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-500/20 text-${action.color}-600 dark:text-${action.color}-400 mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Meal Spotlight */}
      {activeMeal && (
        <DashboardCard title={mealSlotInfo?.active ? "Served Now" : "Up Next"} className="overflow-hidden border-emerald-500/30">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {activeMeal.image && (
              <img src={activeMeal.image} alt={activeMeal.name} className="w-full md:w-1/3 h-48 object-cover rounded-xl" />
            )}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {activeMeal.category}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {getTimingStatus(activeMeal.category)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeMeal.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{activeMeal.items}</p>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Protein</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeMeal.protein}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Calories</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeMeal.calories} kcal</span>
                </div>
              </div>

              {checkIsRatingAllowed(activeMeal.category) && (
                <button 
                  onClick={() => handleRateClick(activeMeal)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 w-fit"
                >
                  <Star className="w-4 h-4" />
                  <span>{getUserRating(activeMeal.id) ? 'Update Rating' : 'Rate this meal'}</span>
                </button>
              )}
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Today's Menu */}
      <section>
        <SectionHeader title="Today's Menu" subtitle={todayDay} />
        {todayMeals && todayMeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {todayMeals.map(meal => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                onRate={() => handleRateClick(meal)}
                userRating={getUserRating(meal.id)}
                showRating={checkIsRatingAllowed(meal.category)}
                compact
              />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState icon={UtensilsCrossed} title="No meals listed" description="Check back later for today's menu." />
          </div>
        )}
      </section>

      {/* Weekly Menu Preview */}
      <section>
        <SectionHeader 
          title="Weekly Menu" 
          action={
            <button onClick={() => setCurrentPage('menu')} className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              View full schedule
            </button>
          } 
        />
        <div className="mt-4 space-y-4">
          <WeeklyDayPicker days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} selectedDay={selectedDay} onDayChange={setSelectedDay} todayDay={todayDay} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {meals && meals.length > 0 ? (
              meals.map(meal => (
                <MealCard key={meal.id} meal={meal} compact />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState icon={UtensilsCrossed} title="No menu found" description={`Menu for ${selectedDay} is not available.`} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rating Modal */}
      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title={`Rate ${selectedMealToRate?.category}`}>
        <div className="space-y-6 py-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{selectedMealToRate?.name}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">How was the food? Your feedback helps improve the mess.</p>
            <RatingStars value={ratingValue} onChange={setRatingValue} size="lg" />
          </div>
          <button 
            onClick={submitRating}
            disabled={ratingValue === 0 || ratingSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </Modal>

    </div>
  );
};
