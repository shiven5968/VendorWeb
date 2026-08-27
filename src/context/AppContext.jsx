import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, MESS_BLOCK_MAP } from '../services/db';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const getTodayDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIdx = new Date().getDay();
  return days[dayIdx] || 'Wednesday';
};

export const AppProvider = ({ children }) => {
  const { 
    user: authUser, 
    profile: authProfile, 
    role: authRole, 
    loading: authLoading,
    login: authLogin,
    register: authRegister,
    logout: authLogout,
    updateProfile: authUpdateProfile,
    resetPassword: authResetPassword
  } = useAuth();

  const todayDay = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState(todayDay);

  // Synchronize current user with AuthContext profile or fallback
  const currentUser = authProfile || (authUser ? {
    uid: authUser.uid,
    id: authUser.uid,
    name: authUser.displayName || 'Student',
    email: authUser.email,
    role: authRole || 'student',
    hostelBlock: 'DNB Block',
    proteinTarget: 120,
    rewardPoints: 0
  } : null);

  const currentRole = authRole || currentUser?.role || 'student';

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Live Database Sync State
  const [mealsVersion, setMealsVersion] = useState(0);
  const [ratingsVersion, setRatingsVersion] = useState(0);
  const [complaintsVersion, setComplaintsVersion] = useState(0);
  const [pollsVersion, setPollsVersion] = useState(0);

  // Modals
  const [selectedMealModal, setSelectedMealModal] = useState(null);
  const [claimedRewardModal, setClaimedRewardModal] = useState(null);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 'n_1', title: 'Welcome to MessMates', message: 'Know your meal before you eat it.', time: 'Today', type: 'info', read: false }
  ]);
  const [menuApproved, setMenuApproved] = useState(false);

  // Theme Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // AUTH ACTIONS
  const login = async (email, password) => {
    const res = await authLogin(email, password);
    setCurrentPage('dashboard');
    addNotification('Login Successful', `Welcome back, ${res.profile?.name || 'User'}!`, 'success');
    return res;
  };

  const register = async (userData) => {
    const res = await authRegister(userData);
    setCurrentPage('dashboard');
    addNotification('Registration Complete', `Welcome to MessMates, ${res.profile?.name || 'Student'}!`, 'success');
    return res;
  };

  const loginAsUser = async (userId) => {
    const target = db.getUserById(userId);
    if (target) {
      try {
        await authLogin(target.email, target.password || 'password123');
      } catch (e) {
        localStorage.setItem('messmate_session_uid', target.id);
        window.location.reload();
      }
    }
  };

  const logout = async () => {
    await authLogout();
    setCurrentPage('dashboard');
  };

  const updateUserProfile = async (updates) => {
    await authUpdateProfile(updates);
    addNotification('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  // REAL MEALS QUERY & ACTIONS
  const allMeals = db.getAllMeals();
  
  // Calculate dynamic ratings from real database records
  const getEnrichedMeals = (day) => {
    const rawMeals = db.getDayMeals(day) || [];
    return rawMeals.map(m => {
      const stats = db.getMealStats(m.id);
      return {
        ...m,
        rating: stats.rating,
        ratingCount: stats.ratingCount
      };
    });
  };

  const dayMeals = getEnrichedMeals(selectedDay);
  const todayMeals = getEnrichedMeals(todayDay);

  const saveMeal = (mealData, targetDay) => {
    db.saveMeal({ ...mealData, day: targetDay || mealData.day || selectedDay });
    setMealsVersion(v => v + 1);
    addNotification('Meal Saved', `${mealData.name} updated in menu.`, 'success');
  };

  const deleteMeal = (mealId) => {
    db.deleteMeal(mealId);
    setMealsVersion(v => v + 1);
    addNotification('Meal Deleted', 'Dish removed from menu schedule.', 'warning');
  };

  // REAL RATINGS & FEEDBACK
  const rateMeal = (mealId, stars, feedback = '', tags = []) => {
    if (!currentUser) return;
    const meal = db.getMealById(mealId);
    db.submitRating({
      userId: currentUser.uid || currentUser.id,
      userName: currentUser.name,
      mealId,
      mealName: meal?.name || 'Mess Meal',
      rating: stars,
      feedback,
      tags
    });
    setRatingsVersion(v => v + 1);
    addNotification('Rating Saved 🌟', `+20 Health Points awarded to ${currentUser.name}.`, 'success');
  };

  const getUserRating = (mealId) => {
    if (!currentUser) return null;
    return db.getUserRatingForMeal(currentUser.uid || currentUser.id, mealId);
  };

  // REAL COMPLAINTS
  const allComplaints = db.getAllComplaints() || [];
  const userComplaints = currentUser ? db.getUserComplaints(currentUser.uid || currentUser.id) : [];

  const createComplaint = (category, description) => {
    if (!currentUser) return;
    const newComp = db.createComplaint({
      userId: currentUser.uid || currentUser.id,
      userName: currentUser.name,
      block: currentUser.hostelBlock || 'DNB Block',
      category,
      description
    });
    setComplaintsVersion(v => v + 1);
    addNotification('Complaint Logged', 'Your issue was submitted with status PENDING.', 'info');
    return newComp;
  };

  const updateComplaintStatus = (complaintId, newStatus) => {
    db.updateComplaintStatus(complaintId, newStatus);
    setComplaintsVersion(v => v + 1);
    addNotification('Status Updated', `Complaint marked as ${newStatus}.`, 'success');
  };

  // REAL VOTING & POLLS
  const currentPoll = db.getPoll();
  const userVotedOptionId = (currentUser && currentPoll) ? db.hasUserVoted(currentPoll.id, currentUser.uid || currentUser.id) : null;

  const voteDish = (optionId) => {
    if (!currentUser || !currentPoll) return;
    try {
      db.castVote({
        pollId: currentPoll.id,
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.name,
        optionId
      });
      setPollsVersion(v => v + 1);
      addNotification('Vote Recorded 🗳️', `+30 Health Points earned by ${currentUser.name}.`, 'success');
    } catch (err) {
      addNotification('Vote Failed', err.message, 'warning');
    }
  };

  const createPoll = (pollData) => {
    db.createPoll(pollData);
    setPollsVersion(v => v + 1);
    addNotification('Poll Created', 'New dish replacement poll is now live.', 'success');
  };

  // REAL PROTEIN & MUSCLE PASS
  const consumedProtein = currentUser ? db.getTodayUserProtein(currentUser.uid || currentUser.id) : 0;
  const proteinTarget = currentUser?.proteinTarget || 120;

  const logProtein = (dishName, proteinGrams) => {
    if (!currentUser) return;
    db.logProtein({
      userId: currentUser.uid || currentUser.id,
      dishName,
      protein: proteinGrams
    });
    setRatingsVersion(v => v + 1);
    addNotification('Protein Logged 💪', `+${proteinGrams}g protein added to today's log.`, 'success');
  };

  const setProteinTarget = (newTarget) => {
    if (!currentUser) return;
    updateUserProfile({ proteinTarget: Number(newTarget) });
  };

  // REWARDS
  const rewardsCatalog = db.getRewardsCatalog() || [];
  const userRedemptions = currentUser ? db.getUserRedemptions(currentUser.uid || currentUser.id) : [];

  const redeemReward = (rewardItem) => {
    if (!currentUser) return false;
    try {
      const claimed = db.redeemReward(currentUser.uid || currentUser.id, currentUser.name, rewardItem);
      setClaimedRewardModal(claimed);
      addNotification('Reward Claimed 🎉', `Claim code: ${claimed.claimCode}`, 'success');
      return true;
    } catch (e) {
      addNotification('Cannot Redeem ⚠️', e.message, 'warning');
      return false;
    }
  };

  // WARDEN METRICS & ANALYTICS (100% Calculated from Real Database Data)
  const overallMess = db.getOverallMessRating() || { score: null, count: 0 };
  const openComplaintsCount = allComplaints.filter(c => c.status !== 'RESOLVED').length;
  const resolvedComplaintsCount = allComplaints.filter(c => c.status === 'RESOLVED').length;
  const totalVotesCount = currentPoll ? (currentPoll.totalVotes || 0) : 0;
  const allRatings = db.getAllRatings() || [];

  const wardenMetrics = {
    messQualityScore: overallMess.score,
    totalRatings: overallMess.count || 0,
    openComplaints: openComplaintsCount,
    resolvedComplaints: resolvedComplaintsCount,
    studentSatisfaction: allRatings.length > 0 
      ? Math.round((allRatings.filter(r => r.rating >= 4).length / allRatings.length) * 100)
      : 0,
    mealsReviewed: allRatings.length,
    activeVotes: totalVotesCount
  };

  // Analytics for AnalyticsPage / ReportsPage
  const wardenAnalytics = {
    satisfactionRate: wardenMetrics.studentSatisfaction,
    messQualityScore: wardenMetrics.messQualityScore || 0,
    foodWasteIndex: 0,
    ratingDistribution: [
      { rating: '5 Star', percentage: allRatings.length > 0 ? Math.round((allRatings.filter(r => r.rating === 5).length / allRatings.length) * 100) : 0 },
      { rating: '4 Star', percentage: allRatings.length > 0 ? Math.round((allRatings.filter(r => r.rating === 4).length / allRatings.length) * 100) : 0 },
      { rating: '3 Star', percentage: allRatings.length > 0 ? Math.round((allRatings.filter(r => r.rating === 3).length / allRatings.length) * 100) : 0 },
      { rating: '2 Star', percentage: allRatings.length > 0 ? Math.round((allRatings.filter(r => r.rating === 2).length / allRatings.length) * 100) : 0 },
      { rating: '1 Star', percentage: allRatings.length > 0 ? Math.round((allRatings.filter(r => r.rating === 1).length / allRatings.length) * 100) : 0 },
    ]
  };

  const approveWeeklyMenu = () => {
    setMenuApproved(true);
    addNotification('Menu Approved ✅', 'Weekly mess menu authorized by Chief Warden.', 'success');
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: 'n_' + Date.now(),
      title,
      message,
      time: 'Just now',
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const userBlock = currentUser?.hostelBlock || 'DNB Block';
  const currentMessInfo = {
    messName: 'Naina Caters - ABES Hostel Mess',
    location: 'ABES EC & ABESBS Campus, Ghaziabad',
    block: userBlock,
    chef: 'Head Chef Naina Caters',
    hygieneScore: '98.8% (Grade A+)',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Auth & User
        currentUser,
        currentRole,
        currentPage,
        setCurrentPage,
        login,
        register,
        loginAsUser,
        logout,
        updateUserProfile,
        usersList: db.getUsers(),

        // Theme
        darkMode,
        toggleDarkMode,

        // Day & Meals
        todayDay,
        selectedDay,
        setSelectedDay,
        meals: dayMeals,
        todayMeals,
        allMeals,
        saveMeal,
        deleteMeal,
        getMealStats: (mealId) => db.getMealStats(mealId),

        // Ratings & Feedback
        rateMeal,
        getUserRating,
        allRatings,

        // Gym Mode & Muscle Pass
        proteinTarget,
        setProteinTarget,
        consumedProtein,
        logProtein,

        // Rewards
        rewardPoints: currentUser?.rewardPoints || 0,
        rewardsCatalog,
        userRedemptions,
        redeemReward,

        // Voting & Polls
        poll: currentPoll,
        userVotedOptionId,
        voteDish,
        createPoll,

        // Complaints
        allComplaints,
        userComplaints,
        createComplaint,
        updateComplaintStatus,

        // Warden Governance
        wardenMetrics,
        wardenAnalytics,
        menuApproved,
        approveWeeklyMenu,

        // Modals & UI
        selectedMealModal,
        setSelectedMealModal,
        claimedRewardModal,
        setClaimedRewardModal,
        isAddMealModalOpen,
        setIsAddMealModalOpen,
        editingMeal,
        setEditingMeal,
        isNotificationOpen,
        setIsNotificationOpen,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        currentMessInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
