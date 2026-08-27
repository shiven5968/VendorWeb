// MessMate Launch Data & Storage Engine
// Clean Zero-Fluff Launch State for ABES College Mess

import { doc, collection, setDoc, addDoc, updateDoc, deleteDoc, getDocs, increment } from 'firebase/firestore';
import { db as firestoreDb, isFirebaseConfigured } from './firebase';

const DB_PREFIX = 'messmates_launch_';

export const MESS_BLOCK_MAP = {
  'DNB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'VKB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'RKB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'ABB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'Kalpana Chawla (Girls)': {
    messName: 'ABES Girls Dining Hall 1',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'Sarojini Block (Girls)': {
    messName: 'ABES Girls Dining Hall 2',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'Kasturba Block (Girls)': {
    messName: 'ABES Girls Dining Hall 2',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  }
};

// Initial Pilot Accounts (1 legitimate student, 1 committee, 1 warden)
export const INITIAL_USERS = [
  {
    id: 'usr_parth',
    uid: 'usr_parth',
    name: 'Parth Sharma',
    admissionNumber: '2100320100001',
    email: 'parth.sharma@abes.ac.in',
    password: 'password123',
    role: 'student',
    gender: 'Male',
    hostelBlock: 'DNB Block',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 120,
    rewardPoints: 0,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-26T00:00:00.000Z'
  },
  {
    id: 'usr_committee',
    uid: 'usr_committee',
    name: 'Mess Committee',
    admissionNumber: 'MC-2026-01',
    email: 'committee@abes.ac.in',
    password: 'password123',
    role: 'mess_committee',
    gender: 'Other',
    hostelBlock: 'Admin Block',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-26T00:00:00.000Z'
  },
  {
    id: 'usr_warden',
    uid: 'usr_warden',
    name: 'Chief Warden',
    admissionNumber: 'CW-2026-01',
    email: 'warden@abes.ac.in',
    password: 'password123',
    role: 'warden',
    gender: 'Male',
    hostelBlock: 'Hostel Office',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-26T00:00:00.000Z'
  }
];

// Launch Menu Schedule
export const INITIAL_MEALS_DB = [
  {
    id: 'wed_b',
    name: 'Aloo Pyaz Paratha & Fresh Curd',
    day: 'Wednesday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Stuffed Parathas, Fresh Curd, Mint Chutney, Butter, Tea',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    calories: 420,
    protein: 14,
    carbs: 62,
    fats: 14,
    ingredients: ['Wheat Flour', 'Potatoes', 'Onions', 'Fresh Curd', 'Spices']
  },
  {
    id: 'wed_l',
    name: 'Chole Masala, Jeera Rice & Poori',
    day: 'Wednesday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Punjabi Chole, Jeera Pulao, Fresh Poori, Boondi Raita, Onion Salad',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 620,
    protein: 21,
    carbs: 88,
    fats: 18,
    ingredients: ['Chickpeas', 'Basmati Rice', 'Wheat Flour', 'Curd', 'Indian Masalas']
  },
  {
    id: 'wed_s',
    name: 'Veg Cutlet & Adrak Chai',
    day: 'Wednesday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Crispy Veg Cutlet, Mint Dip, Masala Chai',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 240,
    protein: 6,
    carbs: 34,
    fats: 8,
    ingredients: ['Mix Veggies', 'Potatoes', 'Breadcrumbs', 'Milk', 'Ginger Tea']
  },
  {
    id: 'wed_d',
    name: 'Paneer Butter Masala & Roti',
    day: 'Wednesday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Fresh Paneer Butter Masala, Tawa Roti, Yellow Dal Fry, Jeera Rice, Gulab Jamun',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 680,
    protein: 26,
    carbs: 82,
    fats: 22,
    ingredients: ['Fresh Paneer', 'Butter Gravy', 'Wheat Flour', 'Toor Dal', 'Rice']
  },
  // Thursday
  {
    id: 'thu_b',
    name: 'Poha & Jalebi with Sprouts',
    day: 'Thursday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Indori Poha, Lemon, Sev, Moong Sprouts, Hot Jalebi, Tea',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600',
    calories: 380,
    protein: 11,
    carbs: 64,
    fats: 9,
    ingredients: ['Flattened Rice', 'Peanuts', 'Moong Sprouts', 'Mustard Seeds', 'Tea']
  },
  {
    id: 'thu_l',
    name: 'Rajma Masala & Steamed Rice',
    day: 'Thursday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Kashmiri Rajma, Long Grain Rice, Roti, Cucumber Salad, Curd',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 590,
    protein: 23,
    carbs: 85,
    fats: 12,
    ingredients: ['Kidney Beans', 'Rice', 'Wheat Flour', 'Tomato Puree', 'Spices']
  },
  {
    id: 'thu_s',
    name: 'Mix Veg Pakora & Chai',
    day: 'Thursday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Crispy Onion & Potato Pakora, Green Chutney, Hot Tea',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 270,
    protein: 7,
    carbs: 32,
    fats: 11,
    ingredients: ['Gram Flour', 'Onions', 'Potatoes', 'Spices', 'Chai']
  },
  {
    id: 'thu_d',
    name: 'Dal Makhani & Butter Roti',
    day: 'Thursday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Slow Cooked Dal Makhani, Mixed Vegetable Sabzi, Tawa Roti, Rice, Kheer',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 640,
    protein: 22,
    carbs: 84,
    fats: 18,
    ingredients: ['Black Urad Dal', 'Butter', 'Fresh Cream', 'Wheat Flour', 'Rice']
  },
  // Friday
  {
    id: 'fri_b',
    name: 'Masala Dosa, Sambar & Coconut Chutney',
    day: 'Friday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Crispy Dosa, Potato Masala, Vegetable Sambar, Coconut Chutney, Filter Coffee',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 410,
    protein: 10,
    carbs: 68,
    fats: 11,
    ingredients: ['Rice Batter', 'Urad Dal', 'Potatoes', 'Sambar Veggies', 'Coconut']
  },
  {
    id: 'fri_l',
    name: 'Shahi Paneer, Pulao & Naan',
    day: 'Friday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Shahi Paneer, Peas Pulao, Butter Tandoori Roti, Boondi Raita, Salad',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 690,
    protein: 25,
    carbs: 86,
    fats: 22,
    ingredients: ['Paneer', 'Cashew Paste', 'Rice', 'Wheat Flour', 'Green Peas']
  },
  {
    id: 'fri_s',
    name: 'Samosa & Chai',
    day: 'Friday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Crispy Samosa, Imli Chutney, Ginger Tea',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 280,
    protein: 6,
    carbs: 36,
    fats: 12,
    ingredients: ['Potatoes', 'Green Peas', 'Maida', 'Spices', 'Tea']
  },
  {
    id: 'fri_d',
    name: 'Kadhai Paneer & Missi Roti',
    day: 'Friday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Kadhai Paneer, Missi Roti, Chana Dal Fry, Jeera Rice, Rasgulla',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 670,
    protein: 27,
    carbs: 80,
    fats: 20,
    ingredients: ['Paneer', 'Bell Peppers', 'Gram Flour', 'Wheat Flour', 'Chana Dal']
  }
];

// Launch state: EMPTY records (0 fake reviews, 0 fake complaints, 0 fake votes)
export const INITIAL_RATINGS_DB = [];
export const INITIAL_COMPLAINTS_DB = [];
export const INITIAL_VOTES_DB = [];
export const INITIAL_PROTEIN_LOGS_DB = [];
export const INITIAL_REDEMPTIONS_DB = [];

export const INITIAL_REWARDS_CATALOG = [
  {
    id: 'rew_1',
    name: 'Fresh Fruit Bowl',
    category: 'Nutrition',
    points: 100,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    description: 'Fresh seasonal fruits from mess fruit counter.'
  },
  {
    id: 'rew_2',
    name: 'Full Cream Milk (500ml)',
    category: 'Protein Boost',
    points: 150,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
    description: 'Hot boiled full cream milk with optional turmeric.'
  },
  {
    id: 'rew_3',
    name: 'Fresh Sweet Curd Pot',
    category: 'Probiotic',
    points: 80,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
    description: 'Fresh homestyle chilled curd cup.'
  },
  {
    id: 'rew_4',
    name: 'High-Protein Sprout Salad',
    category: 'Gym Fuel',
    points: 120,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
    description: 'Sprouted moong & chana with chopped cucumber and lemon.'
  },
  {
    id: 'rew_5',
    name: 'Healthy Campus Snack Box',
    category: 'Wellness',
    points: 200,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    description: 'Roasted makhana, almonds, walnuts & roasted chana.'
  }
];

class LaunchDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(DB_PREFIX + 'initialized_launch_v1')) {
      localStorage.setItem(DB_PREFIX + 'users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem(DB_PREFIX + 'meals', JSON.stringify(INITIAL_MEALS_DB));
      localStorage.setItem(DB_PREFIX + 'ratings', JSON.stringify(INITIAL_RATINGS_DB));
      localStorage.setItem(DB_PREFIX + 'complaints', JSON.stringify(INITIAL_COMPLAINTS_DB));
      localStorage.setItem(DB_PREFIX + 'votes', JSON.stringify(INITIAL_VOTES_DB));
      localStorage.setItem(DB_PREFIX + 'protein_logs', JSON.stringify(INITIAL_PROTEIN_LOGS_DB));
      localStorage.setItem(DB_PREFIX + 'redemptions', JSON.stringify(INITIAL_REDEMPTIONS_DB));
      localStorage.setItem(DB_PREFIX + 'rewards_catalog', JSON.stringify(INITIAL_REWARDS_CATALOG));
      localStorage.setItem(DB_PREFIX + 'initialized_launch_v1', 'true');
    }
  }

  // Generic Get & Set
  getItem(key, fallback = []) {
    try {
      const data = localStorage.getItem(DB_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // USERS & AUTH
  getUsers() {
    return this.getItem('users', INITIAL_USERS);
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id || u.uid === id) || null;
  }

  getUserByEmail(email) {
    if (!email) return null;
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  registerUser(userData) {
    const users = this.getUsers();
    const cleanEmail = userData.email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return existing;
    }

    const id = userData.id || userData.uid || ('usr_' + Date.now());
    const newUser = {
      id,
      uid: id,
      name: userData.name,
      admissionNumber: userData.admissionNumber || '',
      email: cleanEmail,
      password: userData.password || 'password123',
      role: userData.role || 'student',
      gender: userData.gender || 'Male',
      hostelBlock: userData.hostelBlock || 'DNB Block',
      dietPreference: userData.dietPreference || 'High Protein / Eggetarian',
      proteinTarget: Number(userData.proteinTarget) || 120,
      rewardPoints: 0,
      avatar: userData.gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'users', id), newUser);
      } catch (e) {
        console.error('Error saving user profile to Firestore:', e);
      }
    }

    users.push(newUser);
    this.setItem('users', users);
    return newUser;
  }

  updateUserProfile(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId || u.uid === userId);
    if (index !== -1) {
      const updated = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
      
      if (isFirebaseConfigured) {
        try {
          updateDoc(doc(firestoreDb, 'users', userId), { ...updates, updatedAt: new Date().toISOString() });
        } catch (e) {
          console.error('Error updating user profile in Firestore:', e);
        }
      }

      users[index] = updated;
      this.setItem('users', users);
      return users[index];
    }
    return null;
  }

  // MEALS & MENU
  getAllMeals() {
    return this.getItem('meals', INITIAL_MEALS_DB);
  }

  getDayMeals(day) {
    const meals = this.getAllMeals();
    return meals.filter(m => m.day?.toLowerCase() === day.toLowerCase());
  }

  getMealById(id) {
    const meals = this.getAllMeals();
    return meals.find(m => m.id === id) || null;
  }

  saveMeal(mealData) {
    const meals = this.getAllMeals();
    let id = mealData.id;
    let targetMeal = null;

    if (id) {
      const idx = meals.findIndex(m => m.id === id);
      if (idx !== -1) {
        targetMeal = { ...meals[idx], ...mealData };
        meals[idx] = targetMeal;
      } else {
        targetMeal = { ...mealData };
        meals.push(targetMeal);
      }
    } else {
      id = 'meal_' + Date.now();
      targetMeal = {
        ...mealData,
        id
      };
      meals.push(targetMeal);
    }

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'meals', id), targetMeal, { merge: true });
      } catch (e) {
        console.error('Error saving meal to Firestore:', e);
      }
    }

    this.setItem('meals', meals);
    return targetMeal;
  }

  deleteMeal(mealId) {
    if (isFirebaseConfigured) {
      try {
        deleteDoc(doc(firestoreDb, 'meals', mealId));
      } catch (e) {
        console.error('Error deleting meal from Firestore:', e);
      }
    }
    const meals = this.getAllMeals();
    const filtered = meals.filter(m => m.id !== mealId);
    this.setItem('meals', filtered);
  }

  // RATINGS & FEEDBACK (100% Dynamic from real records)
  getAllRatings() {
    return this.getItem('ratings', []);
  }

  getMealRatings(mealId) {
    const ratings = this.getAllRatings();
    return ratings.filter(r => r.mealId === mealId);
  }

  getMealStats(mealId) {
    const ratings = this.getMealRatings(mealId);
    if (ratings.length === 0) {
      return { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };
    }
    const sum = ratings.reduce((acc, cur) => acc + Number(cur.rating), 0);
    const avg = Number((sum / ratings.length).toFixed(1));
    return { rating: avg, ratingDisplay: `${avg} ★`, ratingCount: ratings.length };
  }

  getOverallMessRating() {
    const ratings = this.getAllRatings();
    if (ratings.length === 0) {
      return { score: null, scoreDisplay: 'No ratings yet', count: 0 };
    }
    const sum = ratings.reduce((acc, cur) => acc + Number(cur.rating), 0);
    const avg = Number((sum / ratings.length).toFixed(1));
    return { score: avg, scoreDisplay: `${avg} / 5.0`, count: ratings.length };
  }

  submitRating({ userId, userName, mealId, mealName, rating, feedback = '', tags = [] }) {
    const ratings = this.getAllRatings();
    const existingIdx = ratings.findIndex(r => r.userId === userId && r.mealId === mealId);

    const ratingId = existingIdx !== -1 ? ratings[existingIdx].id : 'rat_' + Date.now();
    const ratingEntry = {
      id: ratingId,
      userId,
      userName: userName || 'Student',
      mealId,
      mealName,
      rating: Number(rating),
      feedback: feedback.trim(),
      tags,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'ratings', ratingId), ratingEntry);
      } catch (e) {
        console.error('Error saving rating to Firestore:', e);
      }
    }

    if (existingIdx !== -1) {
      ratings[existingIdx] = ratingEntry;
    } else {
      ratings.unshift(ratingEntry);
      // Award 20 health points
      this.addRewardPoints(userId, 20);
    }

    this.setItem('ratings', ratings);
    return ratingEntry;
  }

  getUserRatingForMeal(userId, mealId) {
    const ratings = this.getAllRatings();
    return ratings.find(r => r.userId === userId && r.mealId === mealId) || null;
  }

  // COMPLAINTS
  getAllComplaints() {
    return this.getItem('complaints', []);
  }

  getUserComplaints(userId) {
    const complaints = this.getAllComplaints();
    return complaints.filter(c => c.userId === userId);
  }

  createComplaint({ userId, userName, block, category, description }) {
    const complaints = this.getAllComplaints();
    const id = 'cmp_' + Date.now();
    const newComplaint = {
      id,
      userId,
      userName: userName || 'Student',
      block: block || 'DNB Block',
      category: category || 'Quality',
      description: description.trim(),
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'complaints', id), newComplaint);
      } catch (e) {
        console.error('Error saving complaint to Firestore:', e);
      }
    }

    complaints.unshift(newComplaint);
    this.setItem('complaints', complaints);
    return newComplaint;
  }

  updateComplaintStatus(complaintId, newStatus) {
    const complaints = this.getAllComplaints();
    const idx = complaints.findIndex(c => c.id === complaintId);
    if (idx !== -1) {
      complaints[idx].status = newStatus;
      let resolvedAt = null;
      if (newStatus === 'RESOLVED') {
        resolvedAt = new Date().toISOString();
        complaints[idx].resolvedAt = resolvedAt;
      }

      if (isFirebaseConfigured) {
        try {
          const updateData = { status: newStatus };
          if (resolvedAt) updateData.resolvedAt = resolvedAt;
          updateDoc(doc(firestoreDb, 'complaints', complaintId), updateData);
        } catch (e) {
          console.error('Error updating complaint status in Firestore:', e);
        }
      }

      this.setItem('complaints', complaints);
      return complaints[idx];
    }
    return null;
  }

  // POLLS & VOTING
  getPoll() {
    const poll = this.getItem('poll', null);
    if (!poll) return null;

    const votes = this.getItem('votes', []);
    const pollVotes = votes.filter(v => v.pollId === poll.id);
    const totalVotes = pollVotes.length;

    const enrichedOptions = poll.options.map(opt => {
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
      options: enrichedOptions
    };
  }

  createPoll(pollData) {
    const pollId = 'poll_' + Date.now();
    const newPoll = {
      id: pollId,
      dishToReplace: pollData.dishToReplace,
      options: pollData.options.map((opt, i) => ({
        id: 'opt_' + (i + 1),
        name: opt.name,
        protein: opt.protein || '14g'
      })),
      closingDate: pollData.closingDate || 'Tomorrow at 10:00 PM',
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'polls', pollId), newPoll);
      } catch (e) {
        console.error('Error creating poll in Firestore:', e);
      }
    }

    this.setItem('poll', newPoll);
    return newPoll;
  }

  castVote({ pollId, userId, userName, optionId }) {
    const votes = this.getItem('votes', []);
    const alreadyVoted = votes.some(v => v.pollId === pollId && v.userId === userId);
    if (alreadyVoted) {
      throw new Error('You have already voted in this poll.');
    }

    const voteId = 'vote_' + Date.now();
    const newVote = {
      id: voteId,
      pollId,
      userId,
      userName: userName || 'Student',
      optionId,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'votes', voteId), newVote);
      } catch (e) {
        console.error('Error casting vote in Firestore:', e);
      }
    }

    votes.push(newVote);
    this.setItem('votes', votes);
    this.addRewardPoints(userId, 30);
    return newVote;
  }

  hasUserVoted(pollId, userId) {
    if (!pollId || !userId) return null;
    const votes = this.getItem('votes', []);
    const vote = votes.find(v => v.pollId === pollId && v.userId === userId);
    return vote ? vote.optionId : null;
  }

  // PROTEIN LOGS (Gym Mode)
  getTodayUserProtein(userId) {
    if (!userId) return 0;
    const logs = this.getItem('protein_logs', []);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.userId === userId && l.timestamp.startsWith(todayStr));
    return todayLogs.reduce((acc, cur) => acc + Number(cur.protein), 0);
  }

  logProtein({ userId, dishName, protein }) {
    const logs = this.getItem('protein_logs', []);
    const logId = 'plog_' + Date.now();
    const newLog = {
      id: logId,
      userId,
      dishName,
      protein: Number(protein),
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'protein_logs', logId), newLog);
      } catch (e) {
        console.error('Error logging protein to Firestore:', e);
      }
    }

    logs.push(newLog);
    this.setItem('protein_logs', logs);
    return newLog;
  }

  // REWARDS
  getRewardsCatalog() {
    return this.getItem('rewards_catalog', INITIAL_REWARDS_CATALOG);
  }

  getUserRedemptions(userId) {
    const redemptions = this.getItem('redemptions', []);
    return redemptions.filter(r => r.userId === userId);
  }

  addRewardPoints(userId, points) {
    if (isFirebaseConfigured) {
      try {
        updateDoc(doc(firestoreDb, 'users', userId), {
          rewardPoints: increment(points)
        });
      } catch (e) {
        console.error('Error adjusting user points in Firestore:', e);
      }
    }

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId || u.uid === userId);
    if (idx !== -1) {
      users[idx].rewardPoints = Math.max(0, (users[idx].rewardPoints || 0) + Number(points));
      this.setItem('users', users);
    }
  }

  redeemReward(userId, userName, rewardItem) {
    const user = this.getUserById(userId);
    if (!user || (user.rewardPoints || 0) < rewardItem.points) {
      throw new Error('Insufficient Health Points to claim this reward.');
    }

    const redemptionId = 'red_' + Date.now();
    const claimCode = 'HEALTHY-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const newRedemption = {
      id: redemptionId,
      userId,
      userName: userName || user.name,
      rewardId: rewardItem.id,
      rewardName: rewardItem.name,
      pointsSpent: rewardItem.points,
      claimCode,
      status: 'READY FOR COLLECTION',
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(firestoreDb, 'redemptions', redemptionId), newRedemption);
      } catch (e) {
        console.error('Error redeeming reward in Firestore:', e);
      }
    }

    this.addRewardPoints(userId, -rewardItem.points);

    const redemptions = this.getItem('redemptions', []);
    redemptions.unshift(newRedemption);
    this.setItem('redemptions', redemptions);
    return newRedemption;
  }
}

export const db = new LaunchDatabase();

export const seedFirestoreData = async () => {
  if (!isFirebaseConfigured) return;

  try {
    const mealsRef = collection(firestoreDb, 'meals');
    const mealsSnap = await getDocs(mealsRef);
    if (mealsSnap.empty) {
      console.log('Seeding initial meals to Firestore...');
      for (const meal of INITIAL_MEALS_DB) {
        await setDoc(doc(firestoreDb, 'meals', meal.id), meal);
      }
    }

    const rewardsRef = collection(firestoreDb, 'rewards_catalog');
    const rewardsSnap = await getDocs(rewardsRef);
    if (rewardsSnap.empty) {
      console.log('Seeding healthy rewards catalog to Firestore...');
      for (const reward of INITIAL_REWARDS_CATALOG) {
        await setDoc(doc(firestoreDb, 'rewards_catalog', reward.id), reward);
      }
    }

  } catch (e) {
    console.error('Error seeding Firestore data:', e);
  }
};
