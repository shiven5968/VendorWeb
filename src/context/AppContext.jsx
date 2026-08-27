import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, 
  MESS_BLOCK_MAP, 
  INITIAL_MEALS_DB, 
  INITIAL_RATINGS_DB, 
  INITIAL_COMPLAINTS_DB, 
  INITIAL_USERS,
  INITIAL_REWARDS_CATALOG,
  seedFirestoreData
} from '../services/db';
import { db as firestoreDb, isFirebaseConfigured } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { seedPilotAccounts } from '../services/seedUsers';
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

  // Real-time collections / local state
  const [allMeals, setAllMeals] = useState(() => db.getAllMeals() || INITIAL_MEALS_DB);
  const [allRatings, setAllRatings] = useState(() => db.getAllRatings() || []);
  const [allComplaints, setAllComplaints] = useState(() => db.getAllComplaints() || []);
  const [poll, setPoll] = useState(() => db.getPoll() || null);
  const [votesList, setVotesList] = useState(() => db.getItem('votes', []));
  const [proteinLogs, setProteinLogs] = useState(() => db.getItem('protein_logs', []));
  const [redemptions, setRedemptions] = useState(() => db.getItem('redemptions', []));
  const [usersList, setUsersList] = useState(() => db.getUsers() || INITIAL_USERS);

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

  // Firestore Background Seeding (Runs once on mount)
  useEffect(() => {
    if (isFirebaseConfigured) {
      const initializeFirebaseData = async () => {
        try {
          await seedFirestoreData();
          await seedPilotAccounts();
        } catch (e) {
          console.error('Error seeding Firebase database:', e);
        }
      };
      initializeFirebaseData();
    }
  }, []);

  // Live Firestore Real-Time Subscriptions (Synchronized upon login & role change)
  useEffect(() => {
    if (!isFirebaseConfigured || !authUser) {
      return;
    }

    const currentUid = authUser.uid;
    const isStaffUser = currentRole === 'warden' || currentRole === 'mess_committee' || currentRole === 'committee' || (authUser.email || '').includes('warden') || (authUser.email || '').includes('committee');

    // 1. MEALS: Community schedule
    const unsubMeals = onSnapshot(
      collection(firestoreDb, 'meals'),
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        if (list.length > 0) setAllMeals(list);
      },
      (err) => console.warn('Firestore meals listener:', err.message)
    );

    // 2. RATINGS & FEEDBACK: All community ratings
    const unsubRatings = onSnapshot(
      collection(firestoreDb, 'ratings'),
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setAllRatings(list);
      },
      (err) => console.warn('Firestore ratings listener:', err.message)
    );

    // 3. POLLS: Active replacement poll
    const unsubPolls = onSnapshot(
      collection(firestoreDb, 'polls'),
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        const activePoll = list.find(p => p.status === 'ACTIVE') || list[0] || null;
        if (activePoll) setPoll(activePoll);
      },
      (err) => console.warn('Firestore polls listener:', err.message)
    );

    // 4. VOTES: Poll voting numbers
    const unsubVotes = onSnapshot(
      collection(firestoreDb, 'votes'),
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        setVotesList(list);
      },
      (err) => console.warn('Firestore votes listener:', err.message)
    );

    // 5. COMPLAINTS: Staff receives all, Student receives own
    const complaintsTarget = isStaffUser
      ? collection(firestoreDb, 'complaints')
      : query(collection(firestoreDb, 'complaints'), where('userId', '==', currentUid));

    const unsubComplaints = onSnapshot(
      complaintsTarget,
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setAllComplaints(list);
      },
      (err) => console.warn('Firestore complaints listener:', err.message)
    );

    // 6. PROTEIN LOGS: Current student logs
    const proteinTarget = query(collection(firestoreDb, 'protein_logs'), where('userId', '==', currentUid));
    const unsubProtein = onSnapshot(
      proteinTarget,
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        setProteinLogs(list);
      },
      (err) => console.warn('Firestore protein listener:', err.message)
    );

    // 7. REDEMPTIONS: Staff receives all, Student receives own
    const redemptionsTarget = isStaffUser
      ? collection(firestoreDb, 'redemptions')
      : query(collection(firestoreDb, 'redemptions'), where('userId', '==', currentUid));

    const unsubRedemptions = onSnapshot(
      redemptionsTarget,
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        setRedemptions(list);
      },
      (err) => console.warn('Firestore redemptions listener:', err.message)
    );

    // 8. USERS: Staff directory
    let unsubUsers = () => {};
    if (isStaffUser) {
      unsubUsers = onSnapshot(
        collection(firestoreDb, 'users'),
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push(doc.data()));
          if (list.length > 0) setUsersList(list);
        },
        (err) => console.warn('Firestore users listener:', err.message)
      );
    }

    return () => {
      unsubMeals();
      unsubRatings();
      unsubPolls();
      unsubVotes();
      unsubComplaints();
      unsubProtein();
      unsubRedemptions();
      unsubUsers();
    };
  }, [authUser?.uid, currentRole]);

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

  // 1. STATS CALCULATION (Declared FIRST before any functions that invoke it)
  const getMealStats = (mealId) => {
    const mealRatings = (allRatings || []).filter(r => r.mealId === mealId);
    if (mealRatings.length === 0) {
      return { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };
    }
    const sum = mealRatings.reduce((acc, r) => acc + Number(r.rating), 0);
    const avg = Number((sum / mealRatings.length).toFixed(1));
    return { rating: avg, ratingDisplay: `${avg} ★`, ratingCount: mealRatings.length };
  };

  // 2. MEALS QUERY & ACTIONS
  const getEnrichedMeals = (day) => {
    const rawMeals = (allMeals || []).filter(m => (m.day || '').toLowerCase() === (day || '').toLowerCase());
    return rawMeals.map(m => {
      const stats = getMealStats(m.id);
      return {
        ...m,
        rating: stats.rating,
        ratingDisplay: stats.ratingDisplay,
        ratingCount: stats.ratingCount
      };
    });
  };

  const dayMeals = getEnrichedMeals(selectedDay);
  const todayMeals = getEnrichedMeals(todayDay);

  const saveMeal = async (mealData, targetDay) => {
    const updatedMeals = await db.saveMeal({ ...mealData, day: targetDay || mealData.day || selectedDay });
    if (!isFirebaseConfigured) {
      setAllMeals(updatedMeals);
    }
    setMealsVersion(v => v + 1);
    addNotification('Meal Saved', `${mealData.name} updated in menu.`, 'success');
  };

  const deleteMeal = async (mealId) => {
    const updatedMeals = await db.deleteMeal(mealId);
    if (!isFirebaseConfigured) {
      setAllMeals(updatedMeals);
    }
    setMealsVersion(v => v + 1);
    addNotification('Meal Deleted', 'Dish removed from menu schedule.', 'warning');
  };

  // 3. RATINGS & FEEDBACK
  const rateMeal = async (mealId, stars, feedback = '', tags = []) => {
    if (!currentUser) {
      const err = new Error('You must be logged in to submit a rating.');
      console.warn('[MessMates Auth Warning]:', err.message);
      addNotification('Authentication Required', err.message, 'warning');
      throw err;
    }
    const meal = (allMeals || []).find(m => m.id === mealId);
    try {
      const ratingEntry = await db.submitRating({
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.name,
        mealId,
        mealName: meal?.name || 'Mess Meal',
        rating: stars,
        feedback,
        tags
      });
      setAllRatings(prev => {
        const existingIdx = prev.findIndex(r => r.id === ratingEntry.id || (r.userId === ratingEntry.userId && r.mealId === ratingEntry.mealId));
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = ratingEntry;
          return updated;
        }
        return [ratingEntry, ...prev];
      });
      setRatingsVersion(v => v + 1);
      addNotification('Rating Saved 🌟', `+20 Health Points awarded to ${currentUser.name}.`, 'success');
      return ratingEntry;
    } catch (e) {
      console.error('[Firebase Error in rateMeal]:', e);
      addNotification('Rating Failed', e.message || 'Could not save rating to cloud.', 'warning');
      throw e;
    }
  };

  const getUserRating = (mealId) => {
    if (!currentUser) return null;
    return (allRatings || []).find(r => r.userId === (currentUser.uid || currentUser.id) && r.mealId === mealId) || null;
  };

  // 4. COMPLAINTS
  const userComplaints = currentUser 
    ? (allComplaints || []).filter(c => c.userId === (currentUser.uid || currentUser.id)) 
    : [];

  const createComplaint = async (category, description) => {
    if (!currentUser) {
      const err = new Error('You must be logged in to submit a complaint.');
      console.warn('[MessMates Auth Warning]:', err.message);
      addNotification('Authentication Required', err.message, 'warning');
      throw err;
    }
    try {
      const newComp = await db.createComplaint({
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.name,
        block: currentUser.hostelBlock || 'DNB Block',
        category,
        description
      });
      setAllComplaints(prev => {
        const exists = prev.some(c => c.id === newComp.id);
        return exists ? prev : [newComp, ...prev];
      });
      setComplaintsVersion(v => v + 1);
      addNotification('Complaint Logged', 'Your issue was submitted with status PENDING.', 'info');
      return newComp;
    } catch (e) {
      console.error('[Firebase Error in createComplaint]:', e);
      addNotification('Submission Failed', e.message || 'Could not log complaint to cloud.', 'warning');
      throw e;
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const updated = await db.updateComplaintStatus(complaintId, newStatus);
      setAllComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus, ...(newStatus === 'RESOLVED' ? { resolvedAt: new Date().toISOString() } : {}) } : c));
      setComplaintsVersion(v => v + 1);
      addNotification('Status Updated', `Complaint marked as ${newStatus}.`, 'success');
      return updated;
    } catch (e) {
      addNotification('Update Failed', e.message || 'Could not update status.', 'warning');
      throw e;
    }
  };

  // 5. VOTING & POLLS
  const getEnrichedPoll = () => {
    if (!poll) return null;
    const pollVotes = (votesList || []).filter(v => v.pollId === poll.id);
    const totalVotes = pollVotes.length;

    const optionsWithStats = (poll.options || []).map(opt => {
      const optVotes = pollVotes.filter(v => v.optionId === opt.id).length;
      const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
      return {
        ...opt,
        votes: optVotes,
        percent
      };
    });

    return {
      ...poll,
      totalVotes,
      options: optionsWithStats
    };
  };

  const enrichedPoll = getEnrichedPoll();

  const userVotedOptionId = (currentUser && enrichedPoll)
    ? ((votesList || []).find(v => v.pollId === enrichedPoll.id && v.userId === (currentUser.uid || currentUser.id))?.optionId || null)
    : null;

  const voteDish = async (optionId) => {
    if (!currentUser || !enrichedPoll) return;
    try {
      await db.castVote({
        pollId: enrichedPoll.id,
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.name,
        optionId
      });
      if (!isFirebaseConfigured) {
        try {
          setVotesList(JSON.parse(localStorage.getItem('messmates_launch_votes')) || []);
        } catch (e) {}
        setUsersList(db.getUsers());
      }
      setPollsVersion(v => v + 1);
      addNotification('Vote Recorded 🗳️', `+30 Health Points earned by ${currentUser.name}.`, 'success');
    } catch (err) {
      addNotification('Vote Failed', err.message, 'warning');
    }
  };

  const createPoll = async (pollData) => {
    const newPoll = await db.createPoll(pollData);
    if (!isFirebaseConfigured) {
      setPoll(newPoll);
    }
    setPollsVersion(v => v + 1);
    addNotification('Poll Created', 'New dish replacement poll is now live.', 'success');
  };

  // 6. PROTEIN & MUSCLE PASS
  const getTodayUserProtein = () => {
    if (!currentUser) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const userTodayLogs = (proteinLogs || []).filter(
      l => l.userId === (currentUser.uid || currentUser.id) && l.timestamp?.startsWith(todayStr)
    );
    return userTodayLogs.reduce((acc, l) => acc + Number(l.protein), 0);
  };
  const consumedProtein = getTodayUserProtein();
  const proteinTarget = currentUser?.proteinTarget || 120;

  const logProtein = async (dishName, proteinGrams) => {
    if (!currentUser) return;
    await db.logProtein({
      userId: currentUser.uid || currentUser.id,
      dishName,
      protein: proteinGrams
    });
    if (!isFirebaseConfigured) {
      try {
        setProteinLogs(JSON.parse(localStorage.getItem('messmates_launch_protein_logs')) || []);
      } catch (e) {}
    }
    setRatingsVersion(v => v + 1);
    addNotification('Protein Logged 💪', `+${proteinGrams}g protein added to today's log.`, 'success');
  };

  const setProteinTarget = (newTarget) => {
    if (!currentUser) return;
    updateUserProfile({ proteinTarget: Number(newTarget) });
  };

  // 7. REWARDS
  const rewardsCatalog = db.getRewardsCatalog() || INITIAL_REWARDS_CATALOG;
  const userRedemptions = currentUser
    ? (redemptions || []).filter(r => r.userId === (currentUser.uid || currentUser.id))
    : [];

  const redeemReward = async (rewardItem) => {
    if (!currentUser) return false;
    try {
      const claimed = await db.redeemReward(currentUser.uid || currentUser.id, currentUser.name, rewardItem);
      if (!isFirebaseConfigured) {
        try {
          setRedemptions(JSON.parse(localStorage.getItem('messmates_launch_redemptions')) || []);
        } catch (e) {}
        setUsersList(db.getUsers());
      }
      setClaimedRewardModal(claimed);
      addNotification('Reward Claimed 🎉', `Claim code: ${claimed.claimCode}`, 'success');
      return true;
    } catch (e) {
      addNotification('Cannot Redeem ⚠️', e.message, 'warning');
      return false;
    }
  };

  // 8. WARDEN METRICS & GOVERNANCE
  const getWardenMetrics = () => {
    const overallCount = (allRatings || []).length;
    const overallScore = overallCount === 0 
      ? null 
      : Number(((allRatings || []).reduce((acc, r) => acc + Number(r.rating), 0) / overallCount).toFixed(1));
    const overallDisplay = overallCount === 0 ? 'No ratings yet' : `${overallScore} / 5.0`;

    const openComplaintsCount = (allComplaints || []).filter(c => c.status !== 'RESOLVED').length;
    const resolvedComplaintsCount = (allComplaints || []).filter(c => c.status === 'RESOLVED').length;
    const totalVotesCount = enrichedPoll ? (votesList || []).filter(v => v.pollId === enrichedPoll.id).length : 0;

    return {
      messQualityScore: overallScore,
      messQualityDisplay: overallDisplay,
      totalRatings: overallCount,
      openComplaints: openComplaintsCount,
      resolvedComplaints: resolvedComplaintsCount,
      studentSatisfaction: overallCount > 0 
        ? Math.round(((allRatings || []).filter(r => r.rating >= 4).length / overallCount) * 100)
        : 0,
      mealsReviewed: overallCount,
      activeVotes: totalVotesCount
    };
  };

  const wardenMetrics = getWardenMetrics();

  const wardenAnalytics = {
    satisfactionRate: wardenMetrics.studentSatisfaction,
    messQualityScore: wardenMetrics.messQualityScore || 0,
    foodWasteIndex: 0,
    ratingDistribution: [
      { rating: '5 Star', percentage: (allRatings || []).length > 0 ? Math.round(((allRatings || []).filter(r => r.rating === 5).length / allRatings.length) * 100) : 0 },
      { rating: '4 Star', percentage: (allRatings || []).length > 0 ? Math.round(((allRatings || []).filter(r => r.rating === 4).length / allRatings.length) * 100) : 0 },
      { rating: '3 Star', percentage: (allRatings || []).length > 0 ? Math.round(((allRatings || []).filter(r => r.rating === 3).length / allRatings.length) * 100) : 0 },
      { rating: '2 Star', percentage: (allRatings || []).length > 0 ? Math.round(((allRatings || []).filter(r => r.rating === 2).length / allRatings.length) * 100) : 0 },
      { rating: '1 Star', percentage: (allRatings || []).length > 0 ? Math.round(((allRatings || []).filter(r => r.rating === 1).length / allRatings.length) * 100) : 0 },
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
        usersList: usersList,

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
        getMealStats,

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
        poll: enrichedPoll,
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
