import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS, INITIAL_MEALS, WEEKLY_MESS_MENU, INITIAL_VOTING_POLL, RESTAURANT_VOUCHERS, INITIAL_NOTIFICATIONS, WARDEN_ANALYTICS, RECENT_COMPLAINTS, MESS_BLOCK_MAP } from '../data/mockData';

const AppContext = createContext();

// Dynamic Real-time System Clock Day Detection
const getTodayDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIdx = new Date().getDay();
  return days[dayIdx] || 'Friday';
};

export const AppProvider = ({ children }) => {
  const todayDay = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState(todayDay);

  // LocalStorage Persisted Weekly Menu with safe fallback
  const [weeklyMessMenu, setWeeklyMessMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_weekly_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.Friday) return parsed;
      }
      return WEEKLY_MESS_MENU;
    } catch (e) {
      return WEEKLY_MESS_MENU;
    }
  });

  // LocalStorage Persisted User Profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
      return DEMO_USERS.student;
    } catch (e) {
      return DEMO_USERS.student;
    }
  });

  const [currentRole, setCurrentRole] = useState('landing');
  const [currentPage, setCurrentPage] = useState('home');
  const [darkMode, setDarkMode] = useState(false);

  // LocalStorage Persisted Ratings
  const [userRatings, setUserRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('messmate_ratings');
      return saved ? JSON.parse(saved) : { fri_b: 5, wed_d: 5 };
    } catch (e) {
      return { fri_b: 5, wed_d: 5 };
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

  // Notifications & Search
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedMealModal, setSelectedMealModal] = useState(null);
  const [claimedRewardModal, setClaimedRewardModal] = useState(null);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Warden Governance
  const [menuApproved, setMenuApproved] = useState(false);

  // Sync to LocalStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('messmate_weekly_menu', JSON.stringify(weeklyMessMenu));
    } catch (e) {}
  }, [weeklyMessMenu]);

  useEffect(() => {
    try {
      localStorage.setItem('messmate_ratings', JSON.stringify(userRatings));
    } catch (e) {}
  }, [userRatings]);

  useEffect(() => {
    try {
      localStorage.setItem('messmate_points', rewardPoints.toString());
    } catch (e) {}
  }, [rewardPoints]);

  useEffect(() => {
    try {
      localStorage.setItem('messmate_poll', JSON.stringify(poll));
    } catch (e) {}
  }, [poll]);

  useEffect(() => {
    try {
      localStorage.setItem('messmate_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

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

  // Profile Update Function
  const updateUserProfile = (updatedFields) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedFields,
    }));
    addNotification('Profile Updated', 'Student profile details updated.', 'success');
  };

  // Login Function
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

  // Meal Rating Function
  const rateMeal = (mealId, stars) => {
    setUserRatings(prev => ({ ...prev, [mealId]: stars }));
    
    setWeeklyMessMenu(prevMenu => {
      const updated = { ...prevMenu };
      Object.keys(updated).forEach(day => {
        if (Array.isArray(updated[day])) {
          updated[day] = updated[day].map(m => {
            if (m.id === mealId) {
              const newCount = (m.ratingCount || 100) + 1;
              const newRating = Number((((m.rating || 4.5) * (m.ratingCount || 100) + stars) / newCount).toFixed(1));
              return { ...m, rating: newRating, ratingCount: newCount };
            }
            return m;
          });
        }
      });
      return updated;
    });

    setRewardPoints(pts => pts + 20);
    addNotification('Rating Saved 🌟', `You earned +20 health points for rating this meal.`, 'success');
  };

  // Voting Function
  const voteDish = (optionId) => {
    setPoll(prevPoll => {
      if (prevPoll.userVoted) return prevPoll;
      const updatedOptions = prevPoll.options.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      const newTotal = prevPoll.totalVotes + 1;
      const recomputed = updatedOptions.map(opt => ({
        ...opt,
        percent: Math.round((opt.votes / newTotal) * 100)
      }));
      return {
        ...prevPoll,
        totalVotes: newTotal,
        userVoted: optionId,
        options: recomputed
      };
    });

    setRewardPoints(pts => pts + 30);
    addNotification('Vote Recorded 🗳️', 'Thank you for voting. Earned +30 points.', 'success');
  };

  // Redeem Restaurant Voucher Function
  const redeemReward = (voucher) => {
    if (rewardPoints < voucher.points) {
      addNotification('Insufficient Points ⚠️', `You need ${voucher.points} points. Keep rating mess meals to earn points.`, 'warning');
      return false;
    }
    setRewardPoints(pts => pts - voucher.points);
    setClaimedRewards(prev => [voucher, ...prev]);
    setClaimedRewardModal(voucher);
    addNotification('Voucher Claimed 🎉', `Redeemed ${voucher.title} for ${voucher.restaurantName}.`, 'success');
    return true;
  };

  // Committee Actions: Add / Edit / Delete Menu Item
  const saveMeal = (mealData, targetDay = selectedDay) => {
    setWeeklyMessMenu(prevMenu => {
      const dayKey = targetDay || todayDay;
      const dayMeals = Array.isArray(prevMenu[dayKey]) ? prevMenu[dayKey] : [];
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
        [dayKey]: updatedDayMeals,
      };
    });

    addNotification('Menu Saved 📝', `${mealData.name} updated for ${targetDay}.`, 'success');
  };

  const deleteMeal = (mealId, targetDay = selectedDay) => {
    setWeeklyMessMenu(prevMenu => {
      const dayKey = targetDay || todayDay;
      return {
        ...prevMenu,
        [dayKey]: (prevMenu[dayKey] || []).filter(m => m.id !== mealId),
      };
    });
    addNotification('Meal Removed 🗑️', `Item deleted from ${targetDay} menu.`, 'warning');
  };

  // Warden Approval
  const approveWeeklyMenu = () => {
    setMenuApproved(true);
    addNotification('Menu Approved ✅', 'Chief Warden Pathak Sir approved the weekly menu.', 'success');
  };

  // Notifications Management
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

  // Current active day's meals - Guaranteed non-empty array fallback
  const rawMeals = weeklyMessMenu[selectedDay] || weeklyMessMenu[todayDay] || WEEKLY_MESS_MENU[todayDay] || WEEKLY_MESS_MENU.Friday;
  const currentDayMeals = Array.isArray(rawMeals) && rawMeals.length > 0 ? rawMeals : WEEKLY_MESS_MENU.Friday;

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
        selectedDay,
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
