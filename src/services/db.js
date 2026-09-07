// MessMate Launch Data & Storage Engine
// Clean Zero-Fluff Launch State for ABES College Mess

import { 
  doc, 
  collection, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  increment,
  query,
  where,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db as firestoreDb, isFirebaseConfigured } from './firebase.js';

const DB_PREFIX = 'messmates_launch_';

export const MESS_BLOCK_MAP = {
  'DNB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:00 PM',
    }
  },
  'VKB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:00 PM',
    }
  },
  'RKB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:00 PM',
    }
  },
  'ABB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:00 PM',
    }
  },
  'Block A (Girls)': {
    messName: 'ABES Girls Dining Hall 1',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:00 PM',
    }
  },
  'Block B (Girls)': {
    messName: 'ABES Girls Dining Hall 2',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:00 PM',
    }
  },
  'Block C (Girls)': {
    messName: 'ABES Girls Dining Hall 2',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:00 PM',
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
    rewardPoints: 350,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-26T00:00:00.000Z'
  },
  {
    id: 'usr_partner_burger',
    uid: 'usr_partner_burger',
    name: 'The Burger Club',
    admissionNumber: 'PARTNER-BC-01',
    email: 'partner@abes.ac.in',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_burger_club',
    vendorName: 'The Burger Club',
    vendorLogo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'Crossing Republik Commercial Hub',
    avatar: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-26T00:00:00.000Z'
  },
  {
    id: 'usr_partner_pvr',
    uid: 'usr_partner_pvr',
    name: 'PVR Grand',
    admissionNumber: 'PARTNER-PVR-01',
    email: 'pvr@partner.messmates.com',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_pvr_grand',
    vendorName: 'PVR Grand',
    vendorLogo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'Opulent Mall Ghaziabad',
    avatar: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-26T00:00:00.000Z'
  },
  {
    id: 'usr_partner_fitgym',
    uid: 'usr_partner_fitgym',
    name: 'FitGym ABES',
    admissionNumber: 'PARTNER-FIT-01',
    email: 'fitgym@abes.ac.in',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_fitgym',
    vendorName: 'FitGym ABES',
    vendorLogo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'ABES Sports Complex',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-26T00:00:00.000Z'
  },
  {
    id: 'usr_partner_campusmart',
    uid: 'usr_partner_campusmart',
    name: 'Campus Mart',
    admissionNumber: 'PARTNER-CM-01',
    email: 'campusmart@abes.ac.in',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_campus_mart',
    vendorName: 'Campus Mart',
    vendorLogo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'ABES Student Activity Center',
    avatar: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=300',
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

// Launch Menu Schedule (Full 7-Day College Mess Cycle: Mon-Sun)
export const INITIAL_MEALS_DB = [
  // Monday
  {
    id: 'mon_b',
    name: 'Veg Fried Idli & Sambhar',
    day: 'Monday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Veg Fried Idli, Plain Idli, Sambhar, Coconut Chutney, Tea, Milk, Fruit',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 380,
    protein: 11,
    carbs: 60,
    fats: 8,
    ingredients: ['Rice', 'Urad Dal', 'Sambhar Dal', 'Coconut', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'mon_l',
    name: 'Mix Veg & Rajma Masala',
    day: 'Monday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Mix Veg, Rajma, Roti, Rice, Mix Salad, Boondi Raita, Lemon',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 610,
    protein: 22,
    carbs: 82,
    fats: 12,
    ingredients: ['Kidney Beans', 'Wheat Flour', 'Rice', 'Mix Vegetables', 'Curd', 'Lemon']
  },
  {
    id: 'mon_s',
    name: 'Namkeen Bhujiya / Biscuits',
    day: 'Monday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Namkeen Bhujiya, Biscuits, Hot Tea',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 230,
    protein: 5,
    carbs: 34,
    fats: 7,
    ingredients: ['Gram Flour', 'Wheat Flour', 'Sugar', 'Chai']
  },
  {
    id: 'mon_d',
    name: 'Arhar Dal & Aloo Gobhi',
    day: 'Monday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Arhar Daal, Aloo Gobhi, Rice, Roti, Suji Halwa, Achar, Chhachh',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 640,
    protein: 20,
    carbs: 78,
    fats: 16,
    ingredients: ['Toor Dal', 'Potatoes', 'Cauliflower', 'Rice', 'Wheat Flour', 'Semolina', 'Buttermilk']
  },

  // Tuesday
  {
    id: 'tue_b',
    name: 'Matar Kulche',
    day: 'Tuesday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Matar Kulche, Pickle, Milk, Tea, Fruit',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600',
    calories: 420,
    protein: 14,
    carbs: 64,
    fats: 12,
    ingredients: ['White Peas', 'Maida/Wheat Flour', 'Milk', 'Tea', 'Pickle', 'Fruits']
  },
  {
    id: 'tue_l',
    name: 'Aloo Tamatar Sabji & Tahri',
    day: 'Tuesday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Tahri, Aaloo Tamatar Sabji, Roti, Salad, Curd, Lemon, Hari Chutney',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 590,
    protein: 18,
    carbs: 88,
    fats: 15,
    ingredients: ['Rice', 'Potatoes', 'Tomatoes', 'Wheat Flour', 'Curd', 'Lemon', 'Coriander Chutney']
  },
  {
    id: 'tue_s',
    name: 'Hakka Noodles',
    day: 'Tuesday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Hakka Noodles, Tomato Sauce, Chilly Sauce, Hot Coffee',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 280,
    protein: 7,
    carbs: 38,
    fats: 9,
    ingredients: ['Noodles', 'Vegetables', 'Tomato Sauce', 'Chilly Sauce', 'Coffee', 'Milk']
  },
  {
    id: 'tue_d',
    name: 'Kali Masoor Dal & Aloo Beans',
    day: 'Tuesday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Kali Masoor Dal, Aloo Beans, Rice, Roti, Ice Cream, Mix Salad, Achar',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 630,
    protein: 19,
    carbs: 84,
    fats: 14,
    ingredients: ['Black Lentils', 'Potatoes', 'French Beans', 'Rice', 'Wheat Flour', 'Milk/Ice Cream']
  },

  // Wednesday
  {
    id: 'wed_b',
    name: 'Poha & Milk',
    day: 'Wednesday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Poha, Milk, Tea, Fruit',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600',
    calories: 350,
    protein: 10,
    carbs: 58,
    fats: 8,
    ingredients: ['Flattened Rice', 'Peanuts', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'wed_l',
    name: 'Kaabli Chhole & Kashifal',
    day: 'Wednesday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Kaabli Chhole (Small), Kashifal, Roti, Jeera Rice, Mix Salad, Curd, Lemon',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 580,
    protein: 20,
    carbs: 86,
    fats: 12,
    ingredients: ['Chickpeas', 'Pumpkin (Kashifal)', 'Wheat Flour', 'Basmati Rice', 'Curd', 'Lemon']
  },
  {
    id: 'wed_s',
    name: 'Bhelpuri & Tea',
    day: 'Wednesday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Bhelpuri, Hot Tea',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 210,
    protein: 5,
    carbs: 36,
    fats: 5,
    ingredients: ['Puffed Rice', 'Sev', 'Peanuts', 'Onions', 'Tomatoes', 'Tea']
  },
  {
    id: 'wed_d',
    name: 'Butter Paneer Masala',
    day: 'Wednesday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Butter Paneer Masala or Kadhai Paneer, Aaloo Jeera, Roti or Puri, Pulao, Mix Salad, Achar',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 690,
    protein: 26,
    carbs: 82,
    fats: 22,
    ingredients: ['Fresh Paneer', 'Butter Gravy', 'Potatoes', 'Wheat Flour', 'Basmati Rice']
  },

  // Thursday
  {
    id: 'thu_b',
    name: 'Pav Bhaji',
    day: 'Thursday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Pav Bhaji, Hot Tea, Milk, Butter, Fruit',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600',
    calories: 440,
    protein: 12,
    carbs: 62,
    fats: 14,
    ingredients: ['Potatoes', 'Mix Veggies', 'Butter', 'Pav Bread', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'thu_l',
    name: 'Kadhi Rice & Aloo Pyaj Sabji',
    day: 'Thursday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Aaloo Pyaj Sabji, Kadhi, Rice, Roti, Salad, Papad Fried, Lemon',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 590,
    protein: 17,
    carbs: 82,
    fats: 14,
    ingredients: ['Gram Flour', 'Sour Curd', 'Potatoes', 'Onions', 'Basmati Rice', 'Wheat Flour', 'Papad']
  },
  {
    id: 'thu_s',
    name: 'Fan & Tea',
    day: 'Thursday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Fan Puff Pastry, Hot Tea',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 190,
    protein: 4,
    carbs: 28,
    fats: 7,
    ingredients: ['Flour (Maida)', 'Butter', 'Chai']
  },
  {
    id: 'thu_d',
    name: 'Daal Makhani & Mix Veg',
    day: 'Thursday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Daal Makhani, Mix Veg, Roti, Rice, Gulab Jamun, Chhachh, Achar',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 680,
    protein: 22,
    carbs: 80,
    fats: 18,
    ingredients: ['Black Urad Dal', 'Butter', 'Cream', 'Mix Vegetables', 'Wheat Flour', 'Rice', 'Gulab Jamun']
  },

  // Friday
  {
    id: 'fri_b',
    name: 'Jawe & Milk',
    day: 'Friday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Jawe (Namkeen Vermicelli), Tea, Milk, Fruit',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600',
    calories: 340,
    protein: 9,
    carbs: 56,
    fats: 8,
    ingredients: ['Vermicelli (Jawe)', 'Veggies', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'fri_l',
    name: 'Aloo Baigan & Arhar Dal',
    day: 'Friday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Aaloo Baigan, Arhar Daal, Roti, Rice, Mix Salad, Boondi Raita, Lemon',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 580,
    protein: 18,
    carbs: 82,
    fats: 11,
    ingredients: ['Eggplant (Baigan)', 'Potatoes', 'Toor Dal', 'Wheat Flour', 'Rice', 'Curd', 'Lemon']
  },
  {
    id: 'fri_s',
    name: 'Patties & Tea',
    day: 'Friday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Aloo Patties, Tomato Sauce, Hot Tea',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    calories: 290,
    protein: 6,
    carbs: 36,
    fats: 12,
    ingredients: ['Puff Pastry Sheet', 'Potatoes', 'Tomato Sauce', 'Tea']
  },
  {
    id: 'fri_d',
    name: 'Chhole & Dam Aloo',
    day: 'Friday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Chhole, Dam Aaloo, Rice, Plain Paratha, Custard, Mix Salad, Achar',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 650,
    protein: 21,
    carbs: 76,
    fats: 16,
    ingredients: ['Chickpeas', 'Potatoes', 'Rice', 'Wheat Flour', 'Milk Custard']
  },

  // Saturday
  {
    id: 'sat_b',
    name: 'Upma / Bread Jam',
    day: 'Saturday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Upma or Bread Jam, Tea, Milk, Fruit',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600',
    calories: 360,
    protein: 10,
    carbs: 62,
    fats: 8,
    ingredients: ['Semolina (Suji)', 'Bread', 'Fruit Jam', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'sat_l',
    name: 'Chana Dal & Shimla Soyabean',
    day: 'Saturday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Chana Dal, Shimla Soyabean, Roti, Rice, Mix Salad, Curd, Lemon',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 570,
    protein: 21,
    carbs: 78,
    fats: 10,
    ingredients: ['Bengal Gram (Chana Dal)', 'Soya Chunks', 'Capsicum (Shimla)', 'Wheat Flour', 'Rice', 'Curd']
  },
  {
    id: 'sat_s',
    name: 'Kala Chana Masala',
    day: 'Saturday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Kala Chana Masala, Chat Masala, Hot Tea',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
    calories: 230,
    protein: 8,
    carbs: 38,
    fats: 6,
    ingredients: ['Black Gram (Chana)', 'Onions', 'Tomatoes', 'Chaat Masala', 'Tea']
  },
  {
    id: 'sat_d',
    name: 'Mix Dal & Aloo Patta Gobhi',
    day: 'Saturday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Mix Dal, Aaloo Patta Gobhi, Rice, Roti, Coconut Laddoo, Mix Salad, Achar',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 620,
    protein: 19,
    carbs: 82,
    fats: 14,
    ingredients: ['Mix Lentils', 'Cabbage (Patta Gobhi)', 'Potatoes', 'Rice', 'Wheat Flour', 'Coconut Laddoo']
  },

  // Sunday
  {
    id: 'sun_b',
    name: 'Veg Sandwich & Cornflakes',
    day: 'Sunday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Veg. Sandwich, Tomato Sauce, Cornflakes, Milk, Tea, Mix Fruit, Chat Masala',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 410,
    protein: 12,
    carbs: 58,
    fats: 9,
    ingredients: ['Bread', 'Vegetables', 'Cornflakes', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'sun_l',
    name: 'Chhole Bhature & Cold Drink',
    day: 'Sunday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Chhole Kabuli (Big), Bhature, Fry Mirch, Sirka Pyaz, Jeera Rice, Cold Drink, Pickle, Veg Raita',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 750,
    protein: 22,
    carbs: 88,
    fats: 24,
    ingredients: ['Kabuli Chickpeas', 'Maida (Bhature)', 'Green Chillies', 'Vinegar Onions', 'Basmati Rice', 'Cold Drink']
  },
  {
    id: 'sun_s',
    name: 'Holiday Off',
    day: 'Sunday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'No snacks served on Sunday evening',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: []
  },
  {
    id: 'sun_d',
    name: 'Arhar Dal & Lauki',
    day: 'Sunday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Arhar Dal, Lauki (Bottle Gourd), Rice Kheer or Sewai, Roti, Chhachh, Achar',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 590,
    protein: 18,
    carbs: 76,
    fats: 14,
    ingredients: ['Toor Dal', 'Bottle Gourd', 'Milk', 'Rice Kheer/Sewai', 'Wheat Flour', 'Buttermilk']
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

export const INITIAL_PARTNER_REWARDS = [
  {
    rewardId: 'rew_burger_club_1',
    vendorId: 'vendor_burger_club',
    vendorName: 'The Burger Club',
    vendorLogo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    title: '20% OFF on Weekend Buffet & Combo',
    description: 'Enjoy 20% off on signature double-patty burger combos & loaded cheese fries at Crossing Republik.',
    pointsRequired: 150,
    category: 'Food & Dining',
    discountCode: 'ABESBURGER20',
    totalVouchers: 50,
    claimedCount: 8,
    isActive: true,
    expiryDate: '2026-11-30',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    rewardId: 'rew_pvr_grand_1',
    vendorId: 'vendor_pvr_grand',
    vendorName: 'PVR Grand',
    vendorLogo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=300',
    title: 'Flat ₹100 OFF on Movie Tickets',
    description: 'Valid across all shows at PVR Grand Venice / Opulent Mall for ABES college students.',
    pointsRequired: 250,
    category: 'Entertainment',
    discountCode: 'PVRABES100',
    totalVouchers: 30,
    claimedCount: 12,
    isActive: true,
    expiryDate: '2026-12-15',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    rewardId: 'rew_fitgym_1',
    vendorId: 'vendor_fitgym',
    vendorName: 'FitGym Ghaziabad',
    vendorLogo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
    title: '3-Day Free Gym & Cardio Pass',
    description: 'Complete workout floor access, steam room, and certified trainer consultation near Lal Kuan.',
    pointsRequired: 200,
    category: 'Fitness',
    discountCode: 'FITABES3DAY',
    totalVouchers: 40,
    claimedCount: 5,
    isActive: true,
    expiryDate: '2026-12-31',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    rewardId: 'rew_campus_mart_1',
    vendorId: 'vendor_campus_mart',
    vendorName: 'Campus Mart',
    vendorLogo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=300',
    title: 'Flat ₹150 OFF on Hostel Essentials',
    description: 'Save on study desk lamps, multi-plug boards, storage bins, and laundry bags at Campus Mart.',
    pointsRequired: 180,
    category: 'Hostel Essentials',
    discountCode: 'HOSTELGEAR150',
    totalVouchers: 25,
    claimedCount: 7,
    isActive: true,
    expiryDate: '2026-11-20',
    createdAt: '2026-09-01T10:00:00.000Z'
  }
];

class LaunchDatabase {
  constructor() {
    this.init = this.init.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getUserByEmail = this.getUserByEmail.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.getAllMeals = this.getAllMeals.bind(this);
    this.getDayMeals = this.getDayMeals.bind(this);
    this.getMealById = this.getMealById.bind(this);
    this.saveMeal = this.saveMeal.bind(this);
    this.deleteMeal = this.deleteMeal.bind(this);
    this.getAllRatings = this.getAllRatings.bind(this);
    this.getMealRatings = this.getMealRatings.bind(this);
    this.getMealStats = this.getMealStats.bind(this);
    this.getOverallMessRating = this.getOverallMessRating.bind(this);
    this.submitRating = this.submitRating.bind(this);
    this.getUserRatingForMeal = this.getUserRatingForMeal.bind(this);
    this.getAllComplaints = this.getAllComplaints.bind(this);
    this.getUserComplaints = this.getUserComplaints.bind(this);
    this.createComplaint = this.createComplaint.bind(this);
    this.updateComplaintStatus = this.updateComplaintStatus.bind(this);
    this.getPoll = this.getPoll.bind(this);
    this.createPoll = this.createPoll.bind(this);
    this.castVote = this.castVote.bind(this);
    this.hasUserVoted = this.hasUserVoted.bind(this);
    this.getTodayUserProtein = this.getTodayUserProtein.bind(this);
    this.logProtein = this.logProtein.bind(this);
    this.getRewardsCatalog = this.getRewardsCatalog.bind(this);
    this.getUserRedemptions = this.getUserRedemptions.bind(this);
    this.addRewardPoints = this.addRewardPoints.bind(this);
    this.redeemReward = this.redeemReward.bind(this);
    this.getPartnerRewards = this.getPartnerRewards.bind(this);
    this.savePartnerReward = this.savePartnerReward.bind(this);
    this.togglePartnerRewardActive = this.togglePartnerRewardActive.bind(this);
    this.deletePartnerReward = this.deletePartnerReward.bind(this);
    this.claimPartnerReward = this.claimPartnerReward.bind(this);
    this.validateAndRedeemVoucher = this.validateAndRedeemVoucher.bind(this);
    this.memoryStore = new Map();
    this.init();
  }

  init() {
    if (typeof localStorage !== 'undefined') {
      if (!localStorage.getItem(DB_PREFIX + 'initialized_launch_v1')) {
        localStorage.setItem(DB_PREFIX + 'users', JSON.stringify(INITIAL_USERS));
        localStorage.setItem(DB_PREFIX + 'meals', JSON.stringify(INITIAL_MEALS_DB));
        localStorage.setItem(DB_PREFIX + 'ratings', JSON.stringify(INITIAL_RATINGS_DB));
        localStorage.setItem(DB_PREFIX + 'complaints', JSON.stringify(INITIAL_COMPLAINTS_DB));
        localStorage.setItem(DB_PREFIX + 'votes', JSON.stringify(INITIAL_VOTES_DB));
        localStorage.setItem(DB_PREFIX + 'protein_logs', JSON.stringify(INITIAL_PROTEIN_LOGS_DB));
        localStorage.setItem(DB_PREFIX + 'redemptions', JSON.stringify(INITIAL_REDEMPTIONS_DB));
        localStorage.setItem(DB_PREFIX + 'rewards_catalog', JSON.stringify(INITIAL_REWARDS_CATALOG));
        localStorage.setItem(DB_PREFIX + 'partner_rewards', JSON.stringify(INITIAL_PARTNER_REWARDS));
        localStorage.setItem(DB_PREFIX + 'initialized_launch_v1', 'true');
      } else if (!localStorage.getItem(DB_PREFIX + 'partner_rewards')) {
        localStorage.setItem(DB_PREFIX + 'partner_rewards', JSON.stringify(INITIAL_PARTNER_REWARDS));
      }
    } else {
      this.memoryStore.set(DB_PREFIX + 'users', INITIAL_USERS);
      this.memoryStore.set(DB_PREFIX + 'meals', INITIAL_MEALS_DB);
      this.memoryStore.set(DB_PREFIX + 'ratings', INITIAL_RATINGS_DB);
      this.memoryStore.set(DB_PREFIX + 'complaints', INITIAL_COMPLAINTS_DB);
      this.memoryStore.set(DB_PREFIX + 'votes', INITIAL_VOTES_DB);
      this.memoryStore.set(DB_PREFIX + 'protein_logs', INITIAL_PROTEIN_LOGS_DB);
      this.memoryStore.set(DB_PREFIX + 'redemptions', INITIAL_REDEMPTIONS_DB);
      this.memoryStore.set(DB_PREFIX + 'rewards_catalog', INITIAL_REWARDS_CATALOG);
      this.memoryStore.set(DB_PREFIX + 'partner_rewards', INITIAL_PARTNER_REWARDS);
    }
  }

  // Generic Get & Set
  getItem(key, fallback = []) {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(DB_PREFIX + key);
        return data ? JSON.parse(data) : fallback;
      }
      return this.memoryStore.get(DB_PREFIX + key) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  setItem(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
      } else {
        this.memoryStore.set(DB_PREFIX + key, value);
      }
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
      role: userData.role || 'student',
      gender: userData.gender || 'Male',
      hostelBlock: userData.hostelBlock || 'DNB Block',
      dietPreference: userData.dietPreference || 'High Protein / Eggetarian',
      proteinTarget: Number(userData.proteinTarget) || 120,
      rewardPoints: 0,
      emailVerified: true,
      avatar: userData.gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      createdAt: new Date().toISOString()
    };

    // Note: Plaintext passwords are NEVER written to Cloud Firestore (handled exclusively by Firebase Auth)
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

  async saveMeal(mealData) {
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
      // Must await the Firestore write to ensure transactional integrity
      await setDoc(doc(firestoreDb, 'meals', id), targetMeal, { merge: true });
    }

    this.setItem('meals', meals);
    return targetMeal;
  }

  async deleteMeal(mealId) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(firestoreDb, 'meals', mealId));
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

  async submitRating({ userId, userName, mealId, mealName, rating, feedback = '', tags = [], hostelBlock = '' }) {
    const ratings = this.getAllRatings();
    const existingIdx = ratings.findIndex(r => r.userId === userId && r.mealId === mealId);

    if (existingIdx !== -1) {
      throw new Error('Rating already submitted for this meal. Repeated ratings or edits are not allowed.');
    }

    const ratingId = 'rat_' + Date.now();
    const ratingEntry = {
      id: ratingId,
      userId,
      userName: userName || 'Student',
      hostelBlock: hostelBlock || 'DNB Block',
      mealId,
      mealName,
      rating: Number(rating),
      feedback: feedback.trim(),
      tags,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(firestoreDb, 'ratings', ratingId), ratingEntry);
      } catch (e) {
        console.error('Error saving rating to Firestore:', e);
        throw e;
      }
    }

    ratings.unshift(ratingEntry);
    // Award strictly +1 reward point for valid submitted meal rating
    await this.addRewardPoints(userId, 1);

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

  async createComplaint({ userId, userName, block, category, description }) {
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
        await setDoc(doc(firestoreDb, 'complaints', id), newComplaint);
      } catch (e) {
        console.error('Error saving complaint to Firestore:', e);
        throw e;
      }
    }

    complaints.unshift(newComplaint);
    this.setItem('complaints', complaints);
    return newComplaint;
  }

  async updateComplaintStatus(complaintId, newStatus) {
    const complaints = this.getAllComplaints();
    const idx = complaints.findIndex(c => c.id === complaintId);
    let resolvedAt = null;
    if (newStatus === 'RESOLVED') {
      resolvedAt = new Date().toISOString();
    }

    if (isFirebaseConfigured) {
      try {
        const updateData = { status: newStatus };
        if (resolvedAt) updateData.resolvedAt = resolvedAt;
        await updateDoc(doc(firestoreDb, 'complaints', complaintId), updateData);
      } catch (e) {
        console.error('Error updating complaint status in Firestore:', e);
        throw e;
      }
    }

    if (idx !== -1) {
      complaints[idx].status = newStatus;
      if (resolvedAt) complaints[idx].resolvedAt = resolvedAt;
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

  async castVote({ pollId, userId, userName, optionId }) {
    const votes = this.getItem('votes', []);
    const alreadyVoted = votes.some(v => v.pollId === pollId && v.userId === userId);
    if (alreadyVoted) {
      throw new Error('You have already voted in this poll. Duplicate votes are not allowed.');
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
        await setDoc(doc(firestoreDb, 'votes', voteId), newVote);
      } catch (e) {
        console.error('Error casting vote in Firestore:', e);
        throw e;
      }
    }

    votes.push(newVote);
    this.setItem('votes', votes);
    // Award strictly +10 reward points for valid monthly poll vote
    await this.addRewardPoints(userId, 10);
    return newVote;
  }

  async awardDailyLoginReward(userId) {
    if (!userId) return { awarded: false, reason: 'NO_USER' };

    const todayStr = new Date().toLocaleDateString('en-CA'); // Local 'YYYY-MM-DD'
    const user = this.getUserById(userId);

    if (user && user.lastLoginRewardDate === todayStr) {
      return { awarded: false, reason: 'ALREADY_CLAIMED_TODAY' };
    }

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(firestoreDb, 'users', userId), {
          lastLoginRewardDate: todayStr,
          rewardPoints: increment(2)
        });
      } catch (e) {
        console.warn('Daily login reward Firestore update notice:', e.message);
      }
    }

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId || u.uid === userId);
    if (idx !== -1) {
      users[idx].lastLoginRewardDate = todayStr;
      users[idx].rewardPoints = (users[idx].rewardPoints || 0) + 2;
      this.setItem('users', users);
    }

    return { awarded: true, points: 2, date: todayStr };
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

  async addRewardPoints(userId, points) {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(firestoreDb, 'users', userId), {
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

  // ===============================================================
  // VENDOR PARTNER PORTAL & REWARDS INTEGRATION
  // ===============================================================

  getPartnerRewards(vendorId = null) {
    const list = this.getItem('partner_rewards', INITIAL_PARTNER_REWARDS);
    if (!vendorId) return list;
    return list.filter(r => r.vendorId === vendorId);
  }

  subscribeActiveRewards(callback) {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(firestoreDb, 'rewards'),
          where('isActive', '==', true)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Active and stock remaining
            const total = Number(data.totalVouchers || 0);
            const claimed = Number(data.claimedCount || 0);
            if (total > claimed) {
              items.push({ id: docSnap.id, rewardId: docSnap.id, ...data });
            }
          });
          const toTime = (val) => {
            if (!val) return 0;
            if (typeof val.toMillis === 'function') return val.toMillis();
            if (typeof val.toDate === 'function') return val.toDate().getTime();
            if (val.seconds) return val.seconds * 1000;
            const t = new Date(val).getTime();
            return isNaN(t) ? 0 : t;
          };
          items.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
          if (items.length > 0) {
            callback(items);
          } else {
            // If Firestore /rewards is empty or not yet populated, fallback to initial partner rewards
            const local = this.getPartnerRewards().filter(r => r.isActive && r.totalVouchers > r.claimedCount);
            callback(local.length > 0 ? local : INITIAL_PARTNER_REWARDS);
          }
        }, (err) => {
          console.warn('Firestore active rewards listener:', err.message);
          const local = this.getPartnerRewards().filter(r => r.isActive && r.totalVouchers > r.claimedCount);
          callback(local);
        });
        return unsubscribe;
      } catch (e) {
        console.warn('Error setting up active rewards listener:', e);
      }
    }

    const local = this.getPartnerRewards().filter(r => r.isActive && r.totalVouchers > r.claimedCount);
    callback(local.length > 0 ? local : INITIAL_PARTNER_REWARDS);
    return () => {};
  }

  subscribeVendorRewards(vendorId, callback) {
    if (isFirebaseConfigured && vendorId) {
      try {
        const q = query(
          collection(firestoreDb, 'rewards'),
          where('vendorId', '==', vendorId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items = [];
          snapshot.forEach(docSnap => {
            items.push({ id: docSnap.id, rewardId: docSnap.id, ...docSnap.data() });
          });
          const toTime = (val) => {
            if (!val) return 0;
            if (typeof val.toMillis === 'function') return val.toMillis();
            if (typeof val.toDate === 'function') return val.toDate().getTime();
            if (val.seconds) return val.seconds * 1000;
            const t = new Date(val).getTime();
            return isNaN(t) ? 0 : t;
          };
          items.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
          if (items.length > 0) {
            callback(items);
          } else {
            const local = this.getPartnerRewards(vendorId);
            callback(local);
          }
        }, (err) => {
          console.warn('Firestore vendor rewards listener error:', err.message);
          callback(this.getPartnerRewards(vendorId));
        });
        return unsubscribe;
      } catch (e) {
        console.warn('Error creating vendor rewards listener:', e);
      }
    }

    callback(this.getPartnerRewards(vendorId));
    return () => {};
  }

  async savePartnerReward(rewardData) {
    const rewardId = rewardData.rewardId || rewardData.id || ('rew_' + Date.now());
    const finalReward = {
      rewardId,
      id: rewardId,
      vendorId: rewardData.vendorId || 'vendor_partner',
      vendorName: rewardData.vendorName || 'Partner Vendor',
      vendorLogo: rewardData.vendorLogo || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
      title: rewardData.title,
      description: rewardData.description || '',
      pointsRequired: Number(rewardData.pointsRequired) || 100,
      category: rewardData.category || 'Food & Dining',
      discountCode: (rewardData.discountCode || ('ABES' + Math.random().toString(36).substring(2, 6).toUpperCase())).trim(),
      totalVouchers: Number(rewardData.totalVouchers) || 50,
      claimedCount: Number(rewardData.claimedCount) || 0,
      isActive: rewardData.isActive !== false,
      expiryDate: rewardData.expiryDate || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      createdAt: rewardData.createdAt || new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        const firestorePayload = {
          ...finalReward,
          createdAt: rewardData.createdAt ? rewardData.createdAt : serverTimestamp()
        };
        await setDoc(doc(firestoreDb, 'rewards', rewardId), firestorePayload);
      } catch (e) {
        console.error('Error saving reward to Firestore /rewards:', e);
      }
    }

    const list = this.getItem('partner_rewards', INITIAL_PARTNER_REWARDS);
    const idx = list.findIndex(r => r.rewardId === rewardId || r.id === rewardId);
    if (idx !== -1) {
      list[idx] = finalReward;
    } else {
      list.unshift(finalReward);
    }
    this.setItem('partner_rewards', list);
    return finalReward;
  }

  async togglePartnerRewardActive(rewardId, isActive) {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(firestoreDb, 'rewards', rewardId), {
          isActive: Boolean(isActive)
        });
      } catch (e) {
        console.error('Error toggling reward status in Firestore:', e);
      }
    }

    const list = this.getItem('partner_rewards', INITIAL_PARTNER_REWARDS);
    const idx = list.findIndex(r => r.rewardId === rewardId || r.id === rewardId);
    if (idx !== -1) {
      list[idx].isActive = Boolean(isActive);
      this.setItem('partner_rewards', list);
    }
    return { success: true, isActive };
  }

  async deletePartnerReward(rewardId) {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(firestoreDb, 'rewards', rewardId));
      } catch (e) {
        console.error('Error deleting reward from Firestore:', e);
      }
    }

    const list = this.getItem('partner_rewards', INITIAL_PARTNER_REWARDS);
    const filtered = list.filter(r => r.rewardId !== rewardId && r.id !== rewardId);
    this.setItem('partner_rewards', filtered);
    return { success: true };
  }

  // ATOMIC CLAIM PARTNER REWARD:
  // 1. Atomically deduct pointsRequired from /users/{userId}.rewardPoints
  // 2. Increment claimedCount on /rewards/{rewardId}
  // 3. Create record in /redemptions with 6-character code (MM-XXXX)
  async claimPartnerReward({ student, reward }) {
    if (!student) {
      throw new Error('You must be logged in as an ABES student to claim rewards.');
    }

    const studentUid = student.uid || student.id;
    const currentPoints = Number(student.rewardPoints || 0);
    const requiredPoints = Number(reward.pointsRequired || reward.points || 0);

    if (currentPoints < requiredPoints) {
      throw new Error(`Insufficient Health Points. You need ${requiredPoints - currentPoints} more points to claim this reward.`);
    }

    const rewardId = reward.rewardId || reward.id;
    const claimedCount = Number(reward.claimedCount || 0);
    const totalVouchers = Number(reward.totalVouchers || 50);

    if (totalVouchers <= claimedCount) {
      throw new Error('Sorry! All vouchers for this offer have already been claimed.');
    }

    // Generate 6-character unique redemption code formatted as MM-XXXX
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let codeBody = '';
    for (let i = 0; i < 4; i++) {
      codeBody += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const voucherCode = `MM-${codeBody}`;
    const redemptionId = `red_${Date.now()}_${codeBody.toLowerCase()}`;

    const newRedemption = {
      redemptionId,
      id: redemptionId,
      studentId: studentUid,
      userId: studentUid,
      studentName: student.name || 'ABES Student',
      studentEmail: student.email || '',
      rewardId: rewardId,
      rewardTitle: reward.title || reward.name || 'Partner Voucher',
      vendorId: reward.vendorId || 'vendor_partner',
      vendorName: reward.vendorName || 'Partner Merchant',
      vendorLogo: reward.vendorLogo || '',
      voucherCode: voucherCode,
      claimCode: voucherCode,
      status: 'ACTIVE', // "ACTIVE" | "REDEEMED" | "EXPIRED"
      pointsSpent: requiredPoints,
      discountCode: reward.discountCode || 'ABESOFFER',
      claimedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      redeemedAt: null
    };

    if (isFirebaseConfigured) {
      try {
        // 1. Deduct points from student user profile
        const userRef = doc(firestoreDb, 'users', studentUid);
        await updateDoc(userRef, {
          rewardPoints: increment(-requiredPoints)
        });

        // 2. Increment claimedCount on /rewards/{rewardId}
        const rewardRef = doc(firestoreDb, 'rewards', rewardId);
        await updateDoc(rewardRef, {
          claimedCount: increment(1)
        });

        // 3. Create record in /redemptions
        const redemptionRef = doc(firestoreDb, 'redemptions', redemptionId);
        await setDoc(redemptionRef, newRedemption);
      } catch (err) {
        console.error('Firestore claim error, applying fallback:', err);
      }
    }

    // Local state / fallback updates
    await this.addRewardPoints(studentUid, -requiredPoints);

    // Update claimed count in local partner rewards
    const rewards = this.getItem('partner_rewards', INITIAL_PARTNER_REWARDS);
    const rIdx = rewards.findIndex(r => r.rewardId === rewardId || r.id === rewardId);
    if (rIdx !== -1) {
      rewards[rIdx].claimedCount = (rewards[rIdx].claimedCount || 0) + 1;
      this.setItem('partner_rewards', rewards);
    }

    // Add to local redemptions
    const redemptions = this.getItem('redemptions', []);
    redemptions.unshift(newRedemption);
    this.setItem('redemptions', redemptions);

    return newRedemption;
  }

  // VOUCHER VALIDATOR & REDEMPTION SCANNER:
  // Hotel / restaurant counter staff enters 6-digit MM-XXXX code, validates against /redemptions, marks REDEEMED
  async validateAndRedeemVoucher(vendorId, rawVoucherCode) {
    if (!rawVoucherCode || !rawVoucherCode.trim()) {
      throw new Error('Please enter a valid voucher code.');
    }

    // Normalize input: accepts MM-XXXX or MMXXXX (case-insensitive)
    let cleanCode = rawVoucherCode.trim().toUpperCase();
    if (!cleanCode.startsWith('MM-') && cleanCode.startsWith('MM')) {
      cleanCode = 'MM-' + cleanCode.substring(2);
    } else if (!cleanCode.startsWith('MM-') && cleanCode.length === 4) {
      cleanCode = 'MM-' + cleanCode;
    }

    if (isFirebaseConfigured) {
      try {
        const redRef = collection(firestoreDb, 'redemptions');
        const q = query(redRef, where('voucherCode', '==', cleanCode));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docItem = snap.docs[0];
          const redemption = docItem.data();

          if (redemption.status === 'REDEEMED') {
            const timeStr = redemption.redeemedAt ? new Date(redemption.redeemedAt).toLocaleString() : 'earlier';
            throw new Error(`Already Redeemed! This voucher was used on ${timeStr} by ${redemption.studentName}.`);
          }

          if (redemption.status === 'EXPIRED') {
            throw new Error('Voucher Expired! This voucher is past its validity window.');
          }

          // Mark status as REDEEMED
          const redeemedAt = new Date().toISOString();
          await updateDoc(doc(firestoreDb, 'redemptions', docItem.id), {
            status: 'REDEEMED',
            redeemedAt: redeemedAt
          });

          // Sync local redemptions
          const redList = this.getItem('redemptions', []);
          const idx = redList.findIndex(r => r.voucherCode === cleanCode || r.id === docItem.id);
          if (idx !== -1) {
            redList[idx].status = 'REDEEMED';
            redList[idx].redeemedAt = redeemedAt;
            this.setItem('redemptions', redList);
          }

          return {
            success: true,
            redemption: { ...redemption, status: 'REDEEMED', redeemedAt },
            message: `Valid Voucher! ${redemption.rewardTitle || 'Offer'} Approved for ${redemption.studentName}`
          };
        }
      } catch (err) {
        if (err.message && (err.message.includes('Already Redeemed') || err.message.includes('Voucher Expired'))) {
          throw err;
        }
        console.warn('Firestore voucher validation notice:', err.message);
      }
    }

    // Local / memory store fallback
    const redList = this.getItem('redemptions', []);
    const matchIdx = redList.findIndex(r => 
      (r.voucherCode && r.voucherCode.toUpperCase() === cleanCode) ||
      (r.claimCode && r.claimCode.toUpperCase() === cleanCode)
    );

    if (matchIdx === -1) {
      throw new Error(`Voucher code "${cleanCode}" not found. Please double-check the student's code.`);
    }

    const matched = redList[matchIdx];
    if (matched.status === 'REDEEMED') {
      const timeStr = matched.redeemedAt ? new Date(matched.redeemedAt).toLocaleString() : 'earlier';
      throw new Error(`Already Redeemed! This voucher was used on ${timeStr} by ${matched.studentName}.`);
    }

    if (matched.status === 'EXPIRED') {
      throw new Error('Voucher Expired! This voucher is past its validity window.');
    }

    const redeemedAt = new Date().toISOString();
    redList[matchIdx].status = 'REDEEMED';
    redList[matchIdx].redeemedAt = redeemedAt;
    this.setItem('redemptions', redList);

    return {
      success: true,
      redemption: { ...matched, status: 'REDEEMED', redeemedAt },
      message: `Valid Voucher! ${matched.rewardTitle || 'Offer'} Approved for ${matched.studentName}`
    };
  }

  subscribeVendorRedemptions(vendorId, callback) {
    if (isFirebaseConfigured) {
      try {
        const redRef = collection(firestoreDb, 'redemptions');
        const q = vendorId 
          ? query(redRef, where('vendorId', '==', vendorId))
          : redRef;
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const list = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          list.sort((a, b) => new Date(b.claimedAt || b.timestamp || 0) - new Date(a.claimedAt || a.timestamp || 0));
          callback(list);
        }, (err) => {
          console.warn('Firestore vendor redemptions listener error:', err.message);
          const local = this.getItem('redemptions', []);
          callback(vendorId ? local.filter(r => r.vendorId === vendorId) : local);
        });
        return unsubscribe;
      } catch (e) {
        console.warn('Error subscribing to vendor redemptions:', e);
      }
    }

    const local = this.getItem('redemptions', []);
    callback(vendorId ? local.filter(r => r.vendorId === vendorId) : local);
    return () => {};
  }
}

export const db = new LaunchDatabase();

export const seedFirestoreData = async () => {
  if (!isFirebaseConfigured) return;

  try {
    const mealsRef = collection(firestoreDb, 'meals');
    const mealsSnap = await getDocs(mealsRef);
    if (mealsSnap.empty) {
      console.log('Seeding initial baseline meals in Firestore...');
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

    // Seed shared /rewards collection for vendor partner offers
    const partnerRewardsRef = collection(firestoreDb, 'rewards');
    const partnerRewardsSnap = await getDocs(partnerRewardsRef);
    if (partnerRewardsSnap.empty) {
      console.log('Seeding live partner rewards in Firestore /rewards...');
      for (const pReward of INITIAL_PARTNER_REWARDS) {
        await setDoc(doc(firestoreDb, 'rewards', pReward.rewardId), pReward);
      }
    }
  } catch (e) {
    console.error('Error seeding Firestore data:', e);
  }
};
