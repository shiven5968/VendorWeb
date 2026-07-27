import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS, INITIAL_MEALS, WEEKLY_MESS_MENU, INITIAL_VOTING_POLL, RESTAURANT_VOUCHERS, INITIAL_NOTIFICATIONS, WARDEN_ANALYTICS, RECENT_COMPLAINTS, MESS_BLOCK_MAP } from '../data/mockData';

const AppContext = createContext();

// Dynamic Real-time System Clock Day Detection
const getTodayDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIdx = new Date().getDay();
  return days[dayIdx];
};

export const AppProvider = ({ children }) => {
  // Today's day automatically derived from system clock
  const todayDay = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState(todayDay);

  // LocalStorage Persisted Weekly Menu
  const [weeklyMessMenu, setWeeklyMessMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_weekly_menu');
      return saved ? JSON.parse(saved) : WEEKLY_MESS_MENU;
    } catch (e) {
      return WEEKLY_MESS_MENU;
    }
  });

  // LocalStorage Persisted User Profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.student;
    } catch (e) {
      return DEMO_USERS.student;
    }
  });

  const [currentRole, setCurrentRole] = useState('landing');
  const [currentPage, setCurrentPage] = useState('home');

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  // LocalStorage Persisted Ratings & Protein
  const [userRatings, setUserRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_ratings');
      return saved ? JSON.parse(saved) : { mon_b: 5, fri_b: 5, wed_d: 5 };
    } catch (e) {
      return { mon_b: 5, fri_b: 5, wed_d: 5 };
    }
  });

  const [proteinTarget, setProteinTarget] = useState(120);
  const [consumedProtein, setConsumedProtein] = useState(88);
  const [workoutDays, setWorkoutDays] = useState(5);
  const [fitnessGoal, setFitnessGoal] = useState('Muscle Gain & Hypertrophy');

  const [rewardPoints, setRewardPoints] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_points');
      return saved ? Number(saved) : 450;
    } catch (e) {
      return 450;
    }
  });

  const [claimedRewards, setClaimedRewards] = useState([]);
  
  // LocalStorage Persisted Voting Poll
  const [poll, setPoll] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_poll');
      return saved ? JSON.parse(saved) : INITIAL_VOTING_POLL;
    } catch (e) {
      return INITIAL_VOTING_POLL;
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedMealModal, setSelectedMealModal] = useState(null);
  const [claimedRewardModal, setClaimedRewardModal] = useState(null);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Warden Governance
  const [menuApproved, setMenuApproved] = useState(false);

  // Ensure current day's meals are strictly active for Today
  useEffect(() => {
    setSelectedDay(getTodayDayName());
  }, []);

  // Sync Weekly Menu changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('messmate_weekly_menu', JSON.stringify(weeklyMessMenu));
    } catch (e) {}
  }, [weeklyMessMenu]);

  // Sync Ratings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('messmate_ratings', JSON.stringify(userRatings));
    } catch (e) {}
  }, [userRatings]);

  // Sync Points to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('messmate_points', rewardPoints.toString());
    } catch (e) {}
  }, [rewardPoints]);

  // Sync Poll to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('messmate_poll', JSON.stringify(poll));
    } catch (e) {}
  }, [poll]);

  // Sync User Profile
  useEffect(() => {
    try {
      localStorage.setItem('messmate_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Profile & Device Avatar Upload
  const updateUserProfile = (updatedFields) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedFields,
    }));
    addNotification('Profile Updated', 'Student details saved successfully.', 'success');
  };

  // Role Switcher
  const loginAsRole = (roleKey) => {
    if (roleKey === 'student') {
      setCurrentUser(DEMO_USERS.student);
      setCurrentRole('student');
      setCurrentPage('dashboard');
    } else if (roleKey === 'committee') {
      setCurrentUser(DEMO_USERS.committee);
      setCurrentRole('committee');
      setCurrentPage('dashboard');
    } else if (roleKey === 'warden') {
      setCurrentUser(DEMO_USERS.warden);
      setCurrentRole('warden');
      setCurrentPage('dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('landing');
    setCurrentPage('home');
  };

  // Meal Rating (Strictly for Today's Meals)
  const rateMeal = (mealId, stars) => {
    setUserRatings(prev => ({ ...prev, [mealId]: stars }));
    
    setWeeklyMessMenu(prevMenu => {
      const updated = { ...prevMenu };
      Object.keys(updated).forEach(day => {
        updated[day] = updated[day].map(m => {
          if (m.id === mealId) {
            const newCount = m.ratingCount + 1;
            const newRating = Number(((m.rating * m.ratingCount + stars) / newCount).toFixed(1));
            return { ...m, rating: newRating, ratingCount: newCount };
          }
          return m;
        });
      });
      return updated;
    });

    setRewardPoints(pts => pts + 20);
    addNotification('Rating Saved', `You earned +20 health points for rating this meal.`, 'success');
  };

  // Voting
  const voteDish = (optionId) => {
    if (poll.userVoted) return;

    const updatedOptions = poll.options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });

    const newTotal = poll.totalVotes + 1;
    const recomputedOptions = updatedOptions.map(opt => ({
      ...opt,
      percent: Math.round((opt.votes / newTotal) * 100)
    }));

    setPoll({
      ...poll,
      totalVotes: newTotal,
      userVoted: optionId,
      options: recomputedOptions
    });

    setRewardPoints(pts => pts + 30);
    addNotification('Vote Recorded', 'Thank you for voting. Earned +30 points.', 'success');
  };

  // Redeem Restaurant Coupon
  const redeemReward = (voucher) => {
    if (rewardPoints < voucher.points) {
      addNotification('Insufficient Points', `You need ${voucher.points} points. Keep rating mess meals to earn points.`, 'warning');
      return false;
    }
    setRewardPoints(pts => pts - voucher.points);
    setClaimedRewards(prev => [voucher, ...prev]);
    setClaimedRewardModal(voucher);
    addNotification('Voucher Claimed', `Redeemed ${voucher.title} for ${voucher.restaurantName}.`, 'success');
    return true;
  };

  // Committee Actions
  const saveMeal = (mealData, targetDay = todayDay) => {
    setWeeklyMessMenu(prevMenu => {
      const dayMeals = prevMenu[targetDay] || [];
      let updatedDayMeals;

      if (mealData.id) {
        updatedDayMeals = dayMeals.map(m => m.id === mealData.id ? mealData : m);
      } else {
        const newMeal = {
          ...mealData,
          id: 'm_' + Date.now(),
          rating: 5.0,
          ratingCount: 1,
        };
        updatedDayMeals = [newMeal, ...dayMeals];
      }

      return {
        ...prevMenu,
        [targetDay]: updatedDayMeals,
      };
    });

    addNotification('Menu Saved', `${mealData.name} updated for ${targetDay}.`, 'success');
  };

  const deleteMeal = (mealId, targetDay = todayDay) => {
    setWeeklyMessMenu(prevMenu => ({
      ...prevMenu,
      [targetDay]: (prevMenu[targetDay] || []).filter(m => m.id !== mealId),
    }));
    addNotification('Meal Removed', `Item deleted from ${targetDay} menu.`, 'warning');
  };

  // Warden Approval
  const approveWeeklyMenu = () => {
    setMenuApproved(true);
    addNotification('Menu Approved', 'Chief Warden Pathak Sir approved the weekly menu.', 'success');
  };

  // Notifications
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: 'n_' + Date.now(),
      title,
      message,
      time: 'Just now',
      type,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const userBlock = currentUser?.hostelBlock || 'DNB Block';
  const currentMessInfo = MESS_BLOCK_MAP[userBlock] || MESS_BLOCK_MAP['DNB Block'];

  // Current active day's meals (Strictly today's day)
  const currentDayMeals = weeklyMessMenu[todayDay] || weeklyMessMenu.Friday || [];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        updateUserProfile,
        currentRole,
        currentPage,
        setCurrentPage,
        loginAsRole,
        logout,
        darkMode,
        toggleDarkMode,
        todayDay,
        selectedDay: todayDay,
        setSelectedDay,
        weeklyMessMenu,
        meals: currentDayMeals,
        userRatings,
        rateMeal,
        proteinTarget,
        setProteinTarget,
        consumedProtein,
        setConsumedProtein,
        workoutDays,
        setWorkoutDays,
        fitnessGoal,
        setFitnessGoal,
        rewardPoints,
        claimedRewards,
        redeemReward,
        poll,
        voteDish,
        notifications,
        isNotificationOpen,
        setIsNotificationOpen,
        markAllNotificationsRead,
        unreadCount,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        selectedMealModal,
        setSelectedMealModal,
        claimedRewardModal,
        setClaimedRewardModal,
        isAddMealModalOpen,
        setIsAddMealModalOpen,
        editingMeal,
        setEditingMeal,
        saveMeal,
        deleteMeal,
        menuApproved,
        approveWeeklyMenu,
        wardenAnalytics: WARDEN_ANALYTICS,
        recentComplaints: RECENT_COMPLAINTS,
        restaurantVouchers: RESTAURANT_VOUCHERS,
        currentMessInfo,
        MESS_BLOCK_MAP,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
