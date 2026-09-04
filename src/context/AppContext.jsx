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
import { collection, onSnapshot, query, where, doc, limit } from 'firebase/firestore';
import { seedPilotAccounts } from '../services/seedUsers';
import { useAuth } from './AuthContext';
import {
  OFFICIAL_MEAL_TIMINGS,
  getMealTimingStatus,
  isRatingAllowedForMeal,
  getActiveAndNextMealSlot,
  formatHourMinute,
  sortMealsByOfficialOrder
} from '../services/mealTiming';

import { 
  COLLEGE_TIMEZONE,
  getCollegeDateString, 
  getCollegeDayName, 
  formatCollegeDateDisplay, 
  getCollegeTimeParts,
  isTodayInCollege,
  getCollegeWeekInfo,
  getPastCollegeWeeks
} from '../utils/dateTime.js';

const AppContext = createContext();

const getTodayDayName = (date = new Date()) => {
  return getCollegeDayName(date);
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

  // REAL CURRENT TIME CLOCK (Ticks dynamically every 10 seconds)
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // 10s live pulse
    return () => clearInterval(timer);
  }, []);

  const todayDay = getTodayDayName(currentTime);
  const collegeTodayDate = getCollegeDateString(currentTime);
  const currentWeekInfo = getCollegeWeekInfo(currentTime);
  const [selectedDay, setSelectedDay] = useState(todayDay);

  // Keep selectedDay in sync if user hasn't explicitly navigated away
  useEffect(() => {
    setSelectedDay(getTodayDayName(currentTime));
  }, [todayDay]);

  // Synchronize current user with AuthContext profile or fallback
  const currentUser = authProfile || (authUser ? {
    uid: authUser.uid,
    id: authUser.uid,
    name: authUser.displayName || '',
    email: authUser.email || '',
    admissionNumber: '',
    role: authRole || 'student',
    hostelBlock: '',
    proteinTarget: 120,
    rewardPoints: 0
  } : null);

  const currentRole = authRole || currentUser?.role || 'student';

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Real-time collections / local state
  const [allMeals, setAllMeals] = useState(() => db.getAllMeals() || INITIAL_MEALS_DB);
  const [allRatings, setAllRatings] = useState(() => db.getAllRatings() || []);
  const [userRatings, setUserRatings] = useState(() => []);
  const [allComplaints, setAllComplaints] = useState(() => db.getAllComplaints() || []);
  const [poll, setPoll] = useState(() => db.getPoll() || null);
  const [votesList, setVotesList] = useState(() => db.getItem('votes', []));
  const [proteinLogs, setProteinLogs] = useState(() => db.getItem('protein_logs', []));
  const [redemptions, setRedemptions] = useState(() => db.getItem('redemptions', []));
  const [usersList, setUsersList] = useState(() => db.getUsers() || INITIAL_USERS);
  const [musclePassSubscription, setMusclePassSubscription] = useState(null);
  const [messPhotos, setMessPhotos] = useState([]);
  const [hygieneChecks, setHygieneChecks] = useState([]);

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
        } catch (e) {
          console.error('Error seeding Firebase database:', e);
        }
      };
      initializeFirebaseData();
    }
  }, []);

  // DAILY LOGIN REWARD: Award +2 Points ONCE per calendar day
  useEffect(() => {
    const studentUid = authUser?.uid || currentUser?.uid;
    if (studentUid && currentRole === 'student') {
      db.awardDailyLoginReward(studentUid).then(res => {
        if (res && res.awarded) {
          addNotification('Daily Login Reward 🎁', '+2 Health Points awarded for logging in today!', 'success');
        }
      }).catch(err => console.warn('Daily login reward notice:', err.message));
    }
  }, [authUser?.uid, currentUser?.uid, currentRole]);

  // Live Firestore Real-Time Subscriptions (Synchronized upon login & role change)
  useEffect(() => {
    if (!isFirebaseConfigured || !authUser) {
      return;
    }

    const currentUid = authUser.uid;
    const isStaffUser = currentRole === 'warden' || currentRole === 'mess_committee' || currentRole === 'committee' || (authUser.email || '').includes('warden') || (authUser.email || '').includes('committee') || authUser.email === 'anita@abes.ac.in' || authUser.email === 'alok@abes.ac.in';

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

    // 2. RATINGS & FEEDBACK: Bounded query for scalability (max 50 recent ratings)
    const unsubRatings = onSnapshot(
      query(collection(firestoreDb, 'ratings'), limit(50)),
      (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setAllRatings(list);
      },
      (err) => console.warn('Firestore ratings listener:', err.message)
    );

    // 2b. USER PERSONAL RATINGS: Listen to current student's full rating history
    let unsubUserRatings = () => {};
    if (currentUid) {
      unsubUserRatings = onSnapshot(
        query(collection(firestoreDb, 'ratings'), where('userId', '==', currentUid)),
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push(doc.data()));
          list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
          setUserRatings(list);
        },
        (err) => console.warn('Firestore user ratings listener:', err.message)
      );
    }

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

    // 4. VOTES: Bounded query for current poll votes
    const unsubVotes = onSnapshot(
      query(collection(firestoreDb, 'votes'), limit(100)),
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

    // 8. MUSCLE PASS SUBSCRIPTION
    const unsubSubscription = onSnapshot(
      doc(firestoreDb, 'subscriptions', currentUid),
      (docSnap) => {
        if (docSnap.exists()) {
          setMusclePassSubscription(docSnap.data());
        } else {
          setMusclePassSubscription(null);
        }
      },
      (err) => console.warn('Firestore subscription listener:', err.message)
    );

    // 9. USERS: Staff directory
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

    // 10. MESS PHOTOS: Daily operational photos (bounded to 50 most recent)
    let unsubMessPhotos = () => {};
    if (isStaffUser) {
      unsubMessPhotos = onSnapshot(
        query(collection(firestoreDb, 'mess_photos'), limit(50)),
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setMessPhotos(list);
        },
        (err) => console.warn('Firestore mess_photos listener:', err.message)
      );
    }

    // 11. HYGIENE CHECKS: Daily hygiene compliance reports (bounded to 30 most recent)
    let unsubHygiene = () => {};
    if (isStaffUser) {
      unsubHygiene = onSnapshot(
        query(collection(firestoreDb, 'hygiene_checks'), limit(30)),
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setHygieneChecks(list);
        },
        (err) => console.warn('Firestore hygiene listener:', err.message)
      );
    }

    return () => {
      unsubMeals();
      unsubRatings();
      unsubUserRatings();
      unsubPolls();
      unsubVotes();
      unsubComplaints();
      unsubProtein();
      unsubRedemptions();
      unsubSubscription();
      unsubUsers();
      unsubMessPhotos();
      unsubHygiene();
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
    // Only allow updating non-identity preferences (dietPreference, avatar, proteinTarget)
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.role;
    delete sanitizedUpdates.email;
    delete sanitizedUpdates.admissionNumber;
    delete sanitizedUpdates.name;
    delete sanitizedUpdates.hostelBlock; // Hostel block is strictly read-only for students

    await authUpdateProfile(sanitizedUpdates);
    addNotification('Preferences Saved', 'Your dietary preferences have been saved.', 'success');
  };

  // 1. STATS CALCULATION
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
    const enriched = rawMeals.map(m => {
      const stats = getMealStats(m.id);
      return {
        ...m,
        rating: stats.rating,
        ratingDisplay: stats.ratingDisplay,
        ratingCount: stats.ratingCount
      };
    });
    // Strictly sort all meals in official order: BREAKFAST -> LUNCH -> SNACKS -> DINNER
    return sortMealsByOfficialOrder(enriched);
  };

  const dayMeals = getEnrichedMeals(selectedDay);
  const todayMeals = getEnrichedMeals(todayDay);

  const saveMeal = async (mealData, targetDay) => {
    try {
      const updatedMeals = await db.saveMeal({ ...mealData, day: targetDay || mealData.day || selectedDay });
      if (!isFirebaseConfigured) {
        setAllMeals(updatedMeals);
      }
      setMealsVersion(v => v + 1);
      addNotification('Meal Saved', `${mealData.name} updated in menu.`, 'success');
      return { success: true, meal: updatedMeals };
    } catch (err) {
      console.error('[Error saving meal to Firestore]:', err);
      addNotification('Save Failed', err.message || 'Could not update meal in database.', 'error');
      throw err;
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      const updatedMeals = await db.deleteMeal(mealId);
      if (!isFirebaseConfigured) {
        setAllMeals(updatedMeals);
      }
      setMealsVersion(v => v + 1);
      addNotification('Meal Deleted', 'Dish removed from menu schedule.', 'warning');
      return { success: true };
    } catch (err) {
      console.error('[Error deleting meal]:', err);
      addNotification('Delete Failed', err.message || 'Could not delete meal.', 'error');
      throw err;
    }
  };

  // 3. TIME-AWARE RATINGS & FEEDBACK (Enforces Official Mess Rating Window)
  const rateMeal = async (mealId, stars, feedback = '', tags = []) => {
    if (!currentUser) {
      const err = new Error('You must be logged in to submit a rating.');
      addNotification('Authentication Required', err.message, 'warning');
      throw err;
    }

    if (currentRole !== 'student') {
      const err = new Error('Only students can rate mess meals.');
      addNotification('Permission Denied', err.message, 'warning');
      throw err;
    }

    const meal = (allMeals || []).find(m => m.id === mealId);
    if (!meal) {
      throw new Error('Meal not found.');
    }

    // Check Meal Service & Rating Window (+30 min rule)
    const isAllowed = isRatingAllowedForMeal(meal.category, currentTime);
    if (!isAllowed) {
      const timing = OFFICIAL_MEAL_TIMINGS[meal.category];
      const err = new Error(`Rating is closed for ${meal.category}. Rating is only allowed during meal service and for 30 minutes after (${timing?.ratingWindowLabel || ''}).`);
      addNotification('Rating Window Closed', err.message, 'warning');
      throw err;
    }

    // Check if user already submitted a rating for this meal occurrence
    const collegeDateToday = getCollegeDateString(currentTime || new Date());
    const existing = getUserRating(mealId, collegeDateToday);
    if (existing) {
      const err = new Error('Rating already submitted for this meal occurrence. Repeated or modified ratings are not allowed.');
      addNotification('Already Rated', err.message, 'info');
      throw err;
    }

    try {
      const ratingEntry = await db.submitRating({
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.name,
        mealId,
        mealName: meal?.name || 'Mess Meal',
        mealCategory: meal?.category || '',
        hostelBlock: currentUser.hostelBlock || '',
        occurrenceDate: collegeDateToday,
        mealOccurrenceId: `${collegeDateToday}_${mealId}`,
        rating: stars,
        feedback,
        tags
      });

      setAllRatings(prev => [ratingEntry, ...prev]);
      setUserRatings(prev => [ratingEntry, ...prev.filter(r => r.id !== ratingEntry.id)]);
      setRatingsVersion(v => v + 1);
      addNotification('Rating Submitted 🌟', '+1 Health Point awarded to your account.', 'success');
      return ratingEntry;
    } catch (e) {
      console.error('[Firebase Error in rateMeal]:', e);
      addNotification('Rating Failed', e.message || 'Could not save rating to cloud.', 'warning');
      throw e;
    }
  };

  const getUserRating = (mealId, targetDate = getCollegeDateString(currentTime || new Date())) => {
    if (!currentUser) return null;
    const uid = currentUser.uid || currentUser.id;

    const findInList = (list) => (list || []).find(r => {
      if (r.userId !== uid) return false;
      const mealMatches = r.mealId === mealId || 
        (r.mealOccurrenceId && r.mealOccurrenceId.endsWith(`_${mealId}`));
      if (!mealMatches) return false;

      if (targetDate) {
        const rDate = r.date || r.occurrenceDate || (r.timestamp ? getCollegeDateString(new Date(r.timestamp)) : null);
        return rDate === targetDate;
      }
      return true;
    });

    return findInList(userRatings) || findInList(allRatings) || null;
  };

  // 4. COMPLAINTS
  const userComplaints = currentUser 
    ? (allComplaints || []).filter(c => c.userId === (currentUser.uid || currentUser.id)) 
    : [];

  const createComplaint = async (category, description) => {
    if (!currentUser) {
      const err = new Error('You must be logged in to submit a complaint.');
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

  // 5. RECURRING WEEKLY VOTING & MEAL FEEDBACK
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

  // Scoped to current week so a new week unlocks the vote
  const userVotedOptionId = (currentUser && enrichedPoll)
    ? ((votesList || []).find(v => {
        if (v.pollId !== enrichedPoll.id || v.userId !== (currentUser.uid || currentUser.id)) return false;
        const vWeek = v.weekId || (v.timestamp ? getCollegeWeekInfo(new Date(v.timestamp)).weekId : null);
        return vWeek === currentWeekInfo.weekId;
      })?.optionId || null)
    : null;

  const voteDish = async (optionId) => {
    if (!currentUser || !enrichedPoll) return;
    try {
      const newVote = await db.castVote({
        pollId: enrichedPoll.id,
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.name,
        optionId,
        weekId: currentWeekInfo.weekId,
        weekStart: currentWeekInfo.weekStartStr,
        weekEnd: currentWeekInfo.weekEndStr
      });
      setVotesList(prev => {
        const exists = prev.some(v => v.id === newVote.id);
        return exists ? prev : [newVote, ...prev];
      });
      if (currentUser) {
        currentUser.rewardPoints = (currentUser.rewardPoints || 0) + 10;
      }
      setPollsVersion(v => v + 1);
      addNotification('Vote Recorded 🗳️', `+10 Health Points earned by ${currentUser.name}.`, 'success');
      return newVote;
    } catch (err) {
      addNotification('Vote Failed', err.message, 'warning');
      throw err;
    }
  };

  const voteWeeklyMeal = async ({ mealId, mealName, mealCategory, rating }) => {
    if (!currentUser) {
      const err = new Error('You must be logged in to submit a vote.');
      addNotification('Authentication Required', err.message, 'warning');
      throw err;
    }
    if (currentRole !== 'student') {
      const err = new Error('Only students can participate in mess voting.');
      addNotification('Permission Denied', err.message, 'warning');
      throw err;
    }
    try {
      const uid = currentUser.uid || currentUser.id;
      const newVote = await db.castVote({
        mealId,
        mealName,
        mealCategory,
        userId: uid,
        userName: currentUser.name || 'Student',
        rating,
        weekId: currentWeekInfo.weekId,
        weekStart: currentWeekInfo.weekStartStr,
        weekEnd: currentWeekInfo.weekEndStr
      });

      setVotesList(prev => {
        const exists = prev.some(v => v.id === newVote.id);
        return exists ? prev : [newVote, ...prev];
      });

      if (currentUser) {
        currentUser.rewardPoints = (currentUser.rewardPoints || 0) + 10;
      }
      setPollsVersion(v => v + 1);
      addNotification('Weekly Feedback Recorded 🗳️', `+10 Health Points earned for reviewing ${mealName}!`, 'success');
      return newVote;
    } catch (err) {
      console.error('[castVote error]:', err);
      addNotification('Vote Failed', err.message || 'Could not record vote.', 'warning');
      throw err;
    }
  };

  const hasUserVotedThisWeek = (targetKey) => {
    if (!currentUser || !targetKey) return null;
    const uid = currentUser.uid || currentUser.id;
    const targetWeekId = currentWeekInfo.weekId;
    return (votesList || []).find(v => {
      if (v.userId !== uid) return false;
      const vWeek = v.weekId || (v.timestamp ? getCollegeWeekInfo(new Date(v.timestamp)).weekId : null);
      if (vWeek !== targetWeekId) return false;
      if (v.pollId === targetKey) return true;
      if (v.mealId === targetKey) return true;
      if (v.mealName && v.mealName.toLowerCase() === targetKey.toLowerCase()) return true;
      return false;
    }) || null;
  };

  const getStudentVotingHistory = (refDate = currentTime) => {
    if (!currentUser) return [];
    const uid = currentUser.uid || currentUser.id;
    const myVotes = (votesList || []).filter(v => v.userId === uid);
    const pastWeeks = getPastCollegeWeeks(4, refDate);

    return pastWeeks.map(week => {
      const weekVotes = myVotes.filter(v => {
        const vWeek = v.weekId || (v.timestamp ? getCollegeWeekInfo(new Date(v.timestamp)).weekId : null);
        return vWeek === week.weekId;
      });
      return {
        ...week,
        votes: weekVotes
      };
    });
  };

  const getOverallMealPerformance = () => {
    const map = {};
    (votesList || []).forEach(v => {
      if (!v.rating || (!v.mealName && !v.mealId)) return;
      const key = v.mealName || v.mealId;
      if (!map[key]) {
        map[key] = {
          mealName: v.mealName || key,
          mealCategory: v.mealCategory || 'Meal',
          ratings: [],
          weeks: new Set()
        };
      }
      map[key].ratings.push(Number(v.rating));
      if (v.weekId) map[key].weeks.add(v.weekId);
    });

    const results = Object.values(map).map(item => {
      const total = item.ratings.length;
      const sum = item.ratings.reduce((a, b) => a + b, 0);
      const avg = total > 0 ? (sum / total) : 0;
      return {
        mealName: item.mealName,
        mealCategory: item.mealCategory,
        avgRating: Number(avg.toFixed(1)),
        totalVotes: total,
        weeksCount: item.weeks.size || 1
      };
    });

    return results.sort((a, b) => b.avgRating - a.avgRating);
  };

  const getMonthlyVotingSummary = () => {
    const now = currentTime;
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthName = now.toLocaleString('en-US', { month: 'long', timeZone: 'Asia/Kolkata' });
    const yearStr = now.getFullYear();

    const monthlyVotes = (votesList || []).filter(v => {
      if (!v.timestamp) return false;
      return v.timestamp.startsWith(currentMonthStr);
    });

    const ratedVotes = monthlyVotes.filter(v => v.rating && v.mealName);
    const totalVotes = monthlyVotes.length;
    const totalRated = ratedVotes.length;

    const avgRating = totalRated > 0
      ? (ratedVotes.reduce((acc, v) => acc + Number(v.rating), 0) / totalRated).toFixed(1)
      : '—';

    const dishScores = {};
    ratedVotes.forEach(v => {
      if (!dishScores[v.mealName]) dishScores[v.mealName] = { sum: 0, count: 0 };
      dishScores[v.mealName].sum += Number(v.rating);
      dishScores[v.mealName].count += 1;
    });

    const dishList = Object.entries(dishScores).map(([name, data]) => ({
      name,
      avg: data.sum / data.count,
      count: data.count
    })).sort((a, b) => b.avg - a.avg);

    const topDish = dishList.length > 0 ? dishList[0] : null;
    const lowestDish = dishList.length > 1 ? dishList[dishList.length - 1] : (dishList.length === 1 && dishList[0].avg < 3 ? dishList[0] : null);

    return {
      monthLabel: `${monthName} ${yearStr}`,
      totalVotes,
      avgRating,
      topDish: topDish ? `${topDish.name} (${topDish.avg.toFixed(1)}★)` : '—',
      lowestDish: lowestDish ? `${lowestDish.name} (${lowestDish.avg.toFixed(1)}★)` : '—'
    };
  };

  const createPoll = async (pollData) => {
    const newPoll = await db.createPoll(pollData);
    if (!isFirebaseConfigured) {
      setPoll(newPoll);
    }
    setPollsVersion(v => v + 1);
    addNotification('Poll Created', 'New dish replacement poll is now live.', 'success');
  };

  const closePoll = async (pollId) => {
    await db.closePoll(pollId);
    if (!isFirebaseConfigured && poll) {
      setPoll(prev => prev ? { ...prev, status: 'CLOSED' } : null);
    }
    setPollsVersion(v => v + 1);
    addNotification('Poll Closed', 'The dish replacement poll has been closed.', 'info');
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

  const isMusclePassActive = Boolean(
    currentUser?.musclePassActive ||
    (musclePassSubscription?.status === 'ACTIVE' && new Date(musclePassSubscription?.expiresAt || 0) > currentTime)
  );

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
    addNotification('Menu Approved ✅', 'Weekly mess menu authorized by ABES Officials.', 'success');
  };

  const uploadMessPhoto = async (photoData, files, onProgress) => {
    if (!currentUser) return;
    try {
      const { saveMessPhoto } = await import('../services/messOperations.js');
      const result = await saveMessPhoto({
        ...photoData,
        uploadedBy: currentUser.uid || currentUser.id,
        uploadedByName: currentUser.name,
        files,
        onProgress
      });
      setMessPhotos(prev => [result, ...prev]);
      addNotification('Photos Uploaded', 'Daily mess photos published successfully.', 'success');
      return result;
    } catch (e) {
      addNotification('Upload Failed', e.message || 'Could not upload photos.', 'error');
      throw e;
    }
  };

  const submitHygieneCheck = async (checkData) => {
    if (!currentUser) return;
    try {
      const { saveHygieneCheck } = await import('../services/messOperations.js');
      const result = await saveHygieneCheck({ ...checkData, submittedBy: currentUser.uid || currentUser.id, submittedByName: currentUser.name });
      setHygieneChecks(prev => [result, ...prev]);
      addNotification('Inspection Submitted', 'Hygiene inspection report saved.', 'success');
      return result;
    } catch (e) {
      addNotification('Submission Failed', e.message || 'Could not save inspection.', 'error');
      throw e;
    }
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
      Breakfast: OFFICIAL_MEAL_TIMINGS.Breakfast.label,
      Lunch: OFFICIAL_MEAL_TIMINGS.Lunch.label,
      Snacks: OFFICIAL_MEAL_TIMINGS.Snacks.label,
      Dinner: OFFICIAL_MEAL_TIMINGS.Dinner.label,
    }
  };

  // Real-time meal slot helpers
  const mealSlotInfo = getActiveAndNextMealSlot(currentTime);
  const getTimingStatus = (category) => getMealTimingStatus(category, currentTime);
  const checkIsRatingAllowed = (category) => isRatingAllowedForMeal(category, currentTime);

  return (
    <AppContext.Provider
      value={{
        // Real-Time Clock & Timers
        currentTime,
        mealSlotInfo,
        getTimingStatus,
        checkIsRatingAllowed,
        officialTimings: OFFICIAL_MEAL_TIMINGS,

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

        // College Timezone & Calendar
        todayDay,
        collegeTodayDate,
        formatCollegeDateDisplay,
        isTodayInCollege,
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
        userRatings,

        // Gym Mode & Muscle Pass
        proteinTarget,
        setProteinTarget,
        consumedProtein,
        logProtein,
        isMusclePassActive,
        musclePassSubscription,

        // Rewards
        rewardPoints: currentUser?.rewardPoints || 0,
        rewardsCatalog,
        userRedemptions,
        redeemReward,

        // Voting & Polls
        poll: enrichedPoll,
        userVotedOptionId,
        voteDish,
        voteWeeklyMeal,
        hasUserVotedThisWeek,
        getStudentVotingHistory,
        getOverallMealPerformance,
        getMonthlyVotingSummary,
        currentWeekInfo,
        votesList,
        createPoll,
        closePoll,

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
        messPhotos,
        hygieneChecks,
        uploadMessPhoto,
        submitHygieneCheck,

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
