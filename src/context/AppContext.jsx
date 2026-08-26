import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, MESS_BLOCK_MAP } from '../services/db';

const AppContext = createContext();

const getTodayDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIdx = new Date().getDay();
  return days[dayIdx] || 'Wednesday';
};

export const AppProvider = ({ children }) => {
  const todayDay = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState(todayDay);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedId = localStorage.getItem('messmate_session_uid');
      if (savedId) {
        const user = db.getUserById(savedId);
        if (user) return user;
      }
      // Default to initial pilot student for immediate preview
      const defaultStudent = db.getUserById('usr_rahul') || db.getUsers()[0];
      return defaultStudent;
    } catch (e) {
      return db.getUsers()[0];
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedId = localStorage.getItem('messmate_session_uid');
      if (savedId) {
        const user = db.getUserById(savedId);
        if (user) return user.role;
      }
      return 'student';
    } catch (e) {
      return 'student';
    }
  });

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
    { id: 'n_1', title: 'Welcome to MessMate', message: 'Rate today meals to earn health points.', time: 'Today', type: 'info', read: false }
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

  // Refresh user data from db when updated
  const refreshUserData = () => {
    if (currentUser?.id) {
      const freshUser = db.getUserById(currentUser.id);
      if (freshUser) setCurrentUser(freshUser);
    }
  };

  // REAL AUTHENTICATION
  const login = (email, password) => {
    const user = db.getUserByEmail(email);
    if (!user) {
      throw new Error('No account found with this email.');
    }
    if (user.password && user.password !== password) {
      throw new Error('Incorrect password.');
    }
    localStorage.setItem('messmate_session_uid', user.id);
    setCurrentUser(user);
    setCurrentRole(user.role);
    setCurrentPage('dashboard');
    addNotification('Login Successful', `Welcome back, ${user.name}!`, 'success');
    return user;
  };

  const register = (userData) => {
    const newUser = db.registerUser(userData);
    localStorage.setItem('messmate_session_uid', newUser.id);
    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    setCurrentPage('dashboard');
    addNotification('Registration Complete', `Welcome to MessMate, ${newUser.name}!`, 'success');
    return newUser;
  };

  const loginAsUser = (userId) => {
    const user = db.getUserById(userId);
    if (user) {
      localStorage.setItem('messmate_session_uid', user.id);
      setCurrentUser(user);
      setCurrentRole(user.role);
      setCurrentPage('dashboard');
      addNotification('Switched Account', `Logged in as ${user.name} (${user.role.toUpperCase()})`, 'info');
    }
  };

  const logout = () => {
    localStorage.removeItem('messmate_session_uid');
    setCurrentUser(null);
    setCurrentRole('landing');
    setCurrentPage('login');
  };

  const updateUserProfile = (updates) => {
    if (!currentUser?.id) return;
    const updated = db.updateUserProfile(currentUser.id, updates);
    setCurrentUser(updated);
    addNotification('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  // REAL MEALS QUERY & ACTIONS
  const allMeals = db.getAllMeals();
  
  // Calculate dynamic ratings from real database records
  const getEnrichedMeals = (day) => {
    const rawMeals = db.getDayMeals(day);
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

  const saveMeal = (mealData) => {
    db.saveMeal({ ...mealData, day: mealData.day || selectedDay });
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
      userId: currentUser.id,
      userName: currentUser.name,
      mealId,
      mealName: meal?.name || 'Mess Meal',
      rating: stars,
      feedback,
      tags
    });
    setRatingsVersion(v => v + 1);
    refreshUserData();
    addNotification('Rating Saved 🌟', `+20 Health Points awarded to ${currentUser.name}.`, 'success');
  };

  const getUserRating = (mealId) => {
    if (!currentUser) return null;
    return db.getUserRatingForMeal(currentUser.id, mealId);
  };

  // REAL COMPLAINTS
  const allComplaints = db.getAllComplaints();
  const userComplaints = currentUser ? db.getUserComplaints(currentUser.id) : [];

  const createComplaint = (category, description) => {
    if (!currentUser) return;
    const newComp = db.createComplaint({
      userId: currentUser.id,
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
  const userVotedOptionId = currentUser ? db.hasUserVoted(currentPoll.id, currentUser.id) : null;

  const voteDish = (optionId) => {
    if (!currentUser) return;
    try {
      db.castVote({
        pollId: currentPoll.id,
        userId: currentUser.id,
        userName: currentUser.name,
        optionId
      });
      setPollsVersion(v => v + 1);
      refreshUserData();
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
  const consumedProtein = currentUser ? db.getTodayUserProtein(currentUser.id) : 0;
  const proteinTarget = currentUser?.proteinTarget || 120;

  const logProtein = (dishName, proteinGrams) => {
    if (!currentUser) return;
    db.logProtein({
      userId: currentUser.id,
      dishName,
      protein: proteinGrams
    });
    refreshUserData();
    setRatingsVersion(v => v + 1); // trigger state update
    addNotification('Protein Logged 💪', `+${proteinGrams}g protein added to today's log.`, 'success');
  };

  const setProteinTarget = (newTarget) => {
    if (!currentUser) return;
    db.updateUserProfile(currentUser.id, { proteinTarget: Number(newTarget) });
    refreshUserData();
  };

  // REWARDS
  const rewardsCatalog = db.getRewardsCatalog();
  const userRedemptions = currentUser ? db.getUserRedemptions(currentUser.id) : [];

  const redeemReward = (rewardItem) => {
    if (!currentUser) return false;
    try {
      const claimed = db.redeemReward(currentUser.id, currentUser.name, rewardItem);
      refreshUserData();
      setClaimedRewardModal(claimed);
      addNotification('Reward Claimed 🎉', `Claim code: ${claimed.claimCode}`, 'success');
      return true;
    } catch (e) {
      addNotification('Cannot Redeem ⚠️', e.message, 'warning');
      return false;
    }
  };

  // WARDEN METRICS (100% Calculated from Real Database Data)
  const overallMess = db.getOverallMessRating();
  const openComplaintsCount = allComplaints.filter(c => c.status !== 'RESOLVED').length;
  const resolvedComplaintsCount = allComplaints.filter(c => c.status === 'RESOLVED').length;
  const totalVotesCount = currentPoll.totalVotes;
  const allRatings = db.getAllRatings();

  const wardenMetrics = {
    messQualityScore: overallMess.score,
    totalRatings: overallMess.count,
    openComplaints: openComplaintsCount,
    resolvedComplaints: resolvedComplaintsCount,
    studentSatisfaction: Math.round((allRatings.filter(r => r.rating >= 4).length / Math.max(1, allRatings.length)) * 100),
    mealsReviewed: allRatings.length,
    activeVotes: totalVotesCount
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
        getMealStats: db.getMealStats,

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
