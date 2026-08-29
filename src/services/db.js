// MessMate Launch Data & Storage Engine
// Clean Zero-Fluff Launch State for ABES College Mess

import { doc, collection, setDoc, addDoc, updateDoc, deleteDoc, getDocs, increment } from 'firebase/firestore';
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
      Dinner: '07:40 PM - 09:00 PM',
    }
  },
  'VKB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:40 PM - 09:00 PM',
    }
  },
  'RKB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:40 PM - 09:00 PM',
    }
  },
  'ABB Block': {
    messName: 'ABES Boys Hostel Mess',
    location: 'Campus Dining Hall 1',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:40 PM - 09:00 PM',
    }
  },
  'Block A (Girls)': {
    messName: 'ABES Girls Dining Hall 1',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:40 PM - 09:00 PM',
    }
  },
  'Block B (Girls)': {
    messName: 'ABES Girls Dining Hall 2',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:40 PM - 09:00 PM',
    }
  },
  'Block C (Girls)': {
    messName: 'ABES Girls Dining Hall 2',
    location: 'Girls Hostel Complex',
    timings: {
      Breakfast: '07:20 AM - 08:30 AM',
      Lunch: '12:20 PM - 02:00 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:40 PM - 09:00 PM',
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

// Launch Menu Schedule (Full 7-Day Source-of-Truth College Mess Cycle: Mon-Sun)
export const INITIAL_MEALS_DB = [
  // Monday
  {
    id: 'mon_b',
    name: 'Veg Fried Idli & Sambhar',
    day: 'Monday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Veg Fried Idli, Plain Idli, Sambhar, Coconut Chutney, Tea, Milk, Fruit',
    servingUsed: '150g Idli (3 pcs), 150g Sambhar, 50g Coconut Chutney, 5g frying oil',
    image: '/meal-images/idli-sambhar.jpg',
    imageSource: 'Local high-res asset',
    calories: 382,
    protein: 10.8,
    carbs: 61.2,
    fats: 9.4,
    fiber: 6.8,
    ingredients: ['Rice', 'Urad Dal', 'Sambhar Dal', 'Coconut', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'mon_l',
    name: 'Mix Veg & Rajma Masala',
    day: 'Monday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Mix Veg, Rajma, Roti, Rice, Mix Salad, Boondi Raita, Lemon',
    servingUsed: '150g Rajma Masala, 150g Mix Veg, 200g Roti (4 pcs), 250g Steamed Rice, 50g Boondi Raita, 50g Salad',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/rajma',
    calories: 898,
    protein: 28.4,
    carbs: 153.2,
    fats: 17.6,
    fiber: 21.5,
    ingredients: ['Kidney Beans', 'Wheat Flour', 'Rice', 'Mix Vegetables', 'Curd', 'Lemon']
  },
  {
    id: 'mon_s',
    name: 'Burger',
    day: 'Monday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Burger, Sauce and Roohafza',
    servingUsed: '180g Veg Aloo Patty Burger, 20g Tomato/Chilli Sauce',
    image: '/meal-images/burger.jpg',
    imageSource: 'Local high-res asset',
    calories: 345,
    protein: 7.8,
    carbs: 52.4,
    fats: 11.6,
    fiber: 4.2,
    ingredients: ['Burger Bun', 'Potato Veg Patty', 'Tomato Sauce', 'Chilly Sauce', 'Roohafza']
  },
  {
    id: 'mon_d',
    name: 'Arhar Dal & Aloo Gobhi',
    day: 'Monday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Arhar Daal, Aloo Gobhi, Rice, Roti, Suji Halwa, Achar, Chhachh',
    servingUsed: '150g Arhar Dal, 150g Aloo Gobhi, 200g Roti (4 pcs), 250g Steamed Rice, 50g Suji Halwa, 15g Achar',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/aloo-gobi',
    calories: 992,
    protein: 27.5,
    carbs: 178.6,
    fats: 18.5,
    fiber: 19.8,
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
    servingUsed: '120g Kulcha (2 pcs), 150g Matar Chaat Gravy, 20g Garnish/Pickle',
    image: '/meal-images/matar-kulche.jpg',
    imageSource: 'Local high-res asset',
    calories: 438,
    protein: 14.6,
    carbs: 76.2,
    fats: 7.8,
    fiber: 9.5,
    ingredients: ['White Peas', 'Maida/Wheat Flour', 'Milk', 'Tea', 'Pickle', 'Fruits']
  },
  {
    id: 'tue_l',
    name: 'Aloo Tamatar Sabji & Tahri',
    day: 'Tuesday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Tahri, Aloo Tamatar Sabji, Roti, Salad, Curd, Lemon, Hari Chutney',
    servingUsed: '250g Vegetable Tahri, 150g Aloo Tamatar Sabji, 200g Roti (4 pcs), 50g Curd, 50g Salad & Chutney',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/tahri',
    calories: 884,
    protein: 23.8,
    carbs: 158.4,
    fats: 16.2,
    fiber: 18.4,
    ingredients: ['Rice', 'Potatoes', 'Tomatoes', 'Wheat Flour', 'Curd', 'Lemon', 'Coriander Chutney']
  },
  {
    id: 'tue_s',
    name: 'Macaroni',
    day: 'Tuesday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Macaroni, Tomato Sauce, Chilly Sauce, Hot Coffee',
    servingUsed: '200g Cooked Masala Macaroni with Veggies, 20g Sauce',
    image: '/meal-images/macaroni.jpg',
    imageSource: 'Local high-res asset',
    calories: 295,
    protein: 7.2,
    carbs: 49.8,
    fats: 7.6,
    fiber: 3.4,
    ingredients: ['Macaroni Pasta', 'Vegetables', 'Tomato Sauce', 'Chilly Sauce', 'Coffee']
  },
  {
    id: 'tue_d',
    name: 'Kali Masoor Dal & Aloo Beans',
    day: 'Tuesday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Kali Masoor Dal, Aloo Beans, Rice, Roti, Ice Cream, Mix Salad, Achar',
    servingUsed: '150g Kali Masoor Dal, 150g Aloo Beans, 200g Roti (4 pcs), 250g Steamed Rice, 50g Vanilla Ice Cream',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/masoor',
    calories: 924,
    protein: 27.9,
    carbs: 161.5,
    fats: 17.8,
    fiber: 20.6,
    ingredients: ['Black Lentils', 'Potatoes', 'French Beans', 'Rice', 'Wheat Flour', 'Milk/Ice Cream']
  },

  // Wednesday
  {
    id: 'wed_b',
    name: 'Aloo Paratha',
    day: 'Wednesday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Aloo Paratha, Pickle, Tea, Fruit',
    servingUsed: '200g Aloo Stuffed Paratha (2 pcs), 10g Tawa Oil, 20g Pickle',
    image: '/meal-images/aloo-paratha.jpg',
    imageSource: 'Local high-res asset',
    calories: 462,
    protein: 9.8,
    carbs: 68.4,
    fats: 16.8,
    fiber: 7.2,
    ingredients: ['Potatoes', 'Wheat Flour', 'Spices', 'Pickle', 'Tea', 'Fruits']
  },
  {
    id: 'wed_l',
    name: 'Kaabli Chhole & Kashifal',
    day: 'Wednesday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Kaabli Chhole (Small), Kashifal, Roti, Jeera Rice, Mix Salad, Curd, Lemon',
    servingUsed: '150g Kaabli Chhole, 150g Kashifal (Kaddu), 200g Roti (4 pcs), 250g Jeera Rice, 50g Curd, 50g Salad',
    image: '/meal-images/kaabli-chhole.jpg',
    imageSource: 'Local high-res asset',
    calories: 892,
    protein: 28.6,
    carbs: 155.8,
    fats: 16.4,
    fiber: 22.4,
    ingredients: ['Chickpeas', 'Pumpkin (Kashifal)', 'Wheat Flour', 'Basmati Rice', 'Curd', 'Lemon']
  },
  {
    id: 'wed_s',
    name: 'Samosa',
    day: 'Wednesday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Samosa, Hot Tea',
    servingUsed: '110g Potato-Pea Samosa (2 pcs), 12g Absorbed Frying Oil',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/samosa',
    calories: 312,
    protein: 5.4,
    carbs: 36.8,
    fats: 16.2,
    fiber: 3.2,
    ingredients: ['Potatoes', 'Green Peas', 'Maida (Flour)', 'Spices', 'Tea']
  },
  {
    id: 'wed_d',
    name: 'Butter Paneer Masala',
    day: 'Wednesday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Butter Paneer Masala OR Kadhai Paneer, Aloo Jeera, Roti/Puri, Pulao, Mix Salad, Achar',
    servingUsed: '150g Butter Paneer Masala (50g paneer), 100g Aloo Jeera, 200g Roti (4 pcs), 250g Vegetable Pulao',
    image: '/meal-images/butter-paneer.jpg',
    imageSource: 'Local high-res asset',
    calories: 1035,
    protein: 33.5,
    carbs: 158.2,
    fats: 30.8,
    fiber: 17.8,
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
    servingUsed: '100g Pav Breads (2 pcs), 200g Mashed Veggie Bhaji, 10g Total Butter',
    image: '/meal-images/pav-bhaji.jpg',
    imageSource: 'Local high-res asset',
    calories: 468,
    protein: 11.2,
    carbs: 68.5,
    fats: 16.5,
    fiber: 7.8,
    ingredients: ['Potatoes', 'Mix Veggies', 'Butter', 'Pav Bread', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'thu_l',
    name: 'Kadhi Rice & Aloo Pyaj Sabji',
    day: 'Thursday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Aloo Pyaj Sabji, Kadhi, Rice, Roti, Salad, Papad Fried, Lemon',
    servingUsed: '150g Besan Kadhi with Pakodas, 150g Aloo Pyaj Sabji, 200g Roti (4 pcs), 250g Rice, 15g Fried Papad',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/kadhi',
    calories: 898,
    protein: 23.4,
    carbs: 156.2,
    fats: 19.2,
    fiber: 17.2,
    ingredients: ['Gram Flour', 'Sour Curd', 'Potatoes', 'Onions', 'Basmati Rice', 'Wheat Flour', 'Papad']
  },
  {
    id: 'thu_s',
    name: 'Bread Pakoda',
    day: 'Thursday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Bread Pakoda, Hot Tea',
    servingUsed: '150g Besan Bread Pakoda (2 pcs), 14g Absorbed Frying Oil',
    image: '/meal-images/bread-pakoda.jpg',
    imageSource: 'Local high-res asset',
    calories: 378,
    protein: 8.4,
    carbs: 44.2,
    fats: 19.0,
    fiber: 4.1,
    ingredients: ['Bread', 'Gram Flour (Besan)', 'Potatoes', 'Spices', 'Tea']
  },
  {
    id: 'thu_d',
    name: 'Daal Makhani & Mix Veg',
    day: 'Thursday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Daal Makhani, Mix Veg, Roti, Rice, Gulab Jamun, Chhachh, Achar',
    servingUsed: '150g Dal Makhani, 150g Mix Veg, 200g Roti (4 pcs), 250g Steamed Rice, 45g Gulab Jamun (1 pc)',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/dal-makhani',
    calories: 1025,
    protein: 27.2,
    carbs: 169.5,
    fats: 26.8,
    fiber: 20.2,
    ingredients: ['Black Urad Dal', 'Butter', 'Cream', 'Mix Vegetables', 'Wheat Flour', 'Rice', 'Gulab Jamun']
  },

  // Friday
  {
    id: 'fri_b',
    name: 'Aloo Tamatar Sabji & Puri',
    day: 'Friday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Puri, Aloo Tamatar Sabji, Jalebi, Curd',
    servingUsed: '120g Deep Fried Puri (4 pcs), 150g Aloo Tamatar Sabji, 40g Jalebi (2 pcs), 50g Curd',
    image: '/meal-images/puri-aloo.jpg',
    imageSource: 'Local high-res asset',
    calories: 642,
    protein: 12.4,
    carbs: 88.5,
    fats: 26.8,
    fiber: 6.8,
    ingredients: ['Puri (Wheat/Maida)', 'Potatoes', 'Tomatoes', 'Jalebi', 'Curd']
  },
  {
    id: 'fri_l',
    name: 'Mix Daal, Tarohi & Roti',
    day: 'Friday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Chana Dal, Shimla Soyabean, Roti, Rice, Mix Salad, Curd, Lemon',
    servingUsed: '150g Chana/Mix Dal, 150g Shimla Soyabean Sabzi, 200g Roti (4 pcs), 250g Rice, 50g Curd',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/mix-dal',
    calories: 886,
    protein: 31.8,
    carbs: 151.2,
    fats: 15.8,
    fiber: 21.8,
    ingredients: ['Chana Dal', 'Soyabean Chunks', 'Capsicum', 'Wheat Flour', 'Rice', 'Curd', 'Lemon']
  },
  {
    id: 'fri_s',
    name: 'Bread Roll',
    day: 'Friday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Bread Roll, Tomato Sauce, Chilly Sauce, Hot Tea',
    servingUsed: '160g Spiced Potato Filled Bread Rolls (2 pcs), 14g Absorbed Frying Oil',
    image: '/meal-images/bread-roll.jpg',
    imageSource: 'Local high-res asset',
    calories: 365,
    protein: 6.8,
    carbs: 46.2,
    fats: 17.5,
    fiber: 3.6,
    ingredients: ['Bread', 'Potatoes', 'Green Chillies', 'Cumin', 'Spices', 'Tea']
  },
  {
    id: 'fri_d',
    name: 'Arhar Daal, Lauki',
    day: 'Friday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Rice, Roti, Coconut Laddoo, Mix Salad, Achar',
    servingUsed: '150g Arhar Dal, 150g Lauki Sabzi, 200g Roti (4 pcs), 250g Steamed Rice, 35g Coconut Laddoo',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/arhar-dal',
    calories: 914,
    protein: 24.8,
    carbs: 166.5,
    fats: 15.8,
    fiber: 18.6,
    ingredients: ['Toor Dal', 'Bottle Gourd (Lauki)', 'Rice', 'Wheat Flour', 'Coconut Laddoo']
  },

  // Saturday
  {
    id: 'sat_b',
    name: 'Aloo Tamatar Sabji & Puri',
    day: 'Saturday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Puri, Aloo Tamatar Sabji, Jalebi, Curd, Watermelon, Tea',
    servingUsed: '120g Deep Fried Puri (4 pcs), 150g Aloo Tamatar Sabji, 40g Jalebi (2 pcs), 50g Curd',
    image: '/meal-images/puri-aloo.jpg',
    imageSource: 'Local high-res asset',
    calories: 642,
    protein: 12.4,
    carbs: 88.5,
    fats: 26.8,
    fiber: 6.8,
    ingredients: ['Puri (Wheat/Maida)', 'Potatoes', 'Tomatoes', 'Jalebi', 'Curd', 'Watermelon', 'Tea']
  },
  {
    id: 'sat_l',
    name: 'Chhole Bhature & Cold Drink',
    day: 'Saturday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Chhole Kabuli (Big), Bhature, Fry Mirch, Sirka Pyaz, Jeera Rice, Cold Drink, Pickle, Veg Raita',
    servingUsed: '140g Bhature (2 pcs), 150g Chhole Gravy, 100g Jeera Rice, 50g Veg Raita, 40g Pickled Onions',
    image: '/meal-images/chhole-bhature.jpg',
    imageSource: 'Local high-res asset',
    calories: 812,
    protein: 20.6,
    carbs: 108.5,
    fats: 32.8,
    fiber: 12.5,
    ingredients: ['Kabuli Chickpeas', 'Maida (Bhature)', 'Green Chillies', 'Vinegar Onions', 'Basmati Rice', 'Cold Drink']
  },
  {
    id: 'sat_s',
    name: 'Chowmein',
    day: 'Saturday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Chowmein, Tomato Sauce, Chilly Sauce, Hot Tea',
    servingUsed: '200g Indian Style Veg Chowmein Noodles, 20g Sauce',
    image: '/meal-images/chowmein.jpg',
    imageSource: 'Local high-res asset',
    calories: 310,
    protein: 7.5,
    carbs: 48.0,
    fats: 10.5,
    fiber: 3.8,
    ingredients: ['Chowmein Noodles', 'Cabbage', 'Capsicum', 'Carrot', 'Tomato Sauce', 'Chilly Sauce', 'Tea']
  },
  {
    id: 'sat_d',
    name: 'Arhar Daal, Lauki',
    day: 'Saturday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Arhar Daal, Lauki, Rice, Roti, Coconut Laddoo, Mix Salad, Achar',
    servingUsed: '150g Arhar Dal, 150g Lauki Sabzi, 200g Roti (4 pcs), 250g Steamed Rice, 35g Coconut Laddoo',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/arhar-dal',
    calories: 914,
    protein: 24.8,
    carbs: 166.5,
    fats: 15.8,
    fiber: 18.6,
    ingredients: ['Toor Dal', 'Bottle Gourd (Lauki)', 'Rice', 'Wheat Flour', 'Coconut Laddoo']
  },

  // Sunday
  {
    id: 'sun_b',
    name: 'Veg Sandwich & Cornflakes',
    day: 'Sunday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Veg. Sandwich, Tomato Sauce, Cornflakes, Milk, Tea, Mix Fruit, Chat Masala',
    servingUsed: '160g Veg Sandwich, 40g Cornflakes, 150ml Toned Warm Milk, 15g Sauce',
    image: '/meal-images/veg-sandwich.jpg',
    imageSource: 'Local high-res asset',
    calories: 428,
    protein: 12.8,
    carbs: 74.5,
    fats: 8.6,
    fiber: 5.8,
    ingredients: ['Bread', 'Vegetables', 'Cornflakes', 'Milk', 'Tea', 'Fruits']
  },
  {
    id: 'sun_l',
    name: 'Chhole Bhature & Cold Drink',
    day: 'Sunday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Chhole Kabuli (Big), Bhature, Fry Mirch, Sirka Pyaz, Jeera Rice, Cold Drink, Pickle, Veg Raita',
    servingUsed: '140g Bhature (2 pcs), 150g Chhole Gravy, 100g Jeera Rice, 50g Veg Raita, 40g Sirka Pyaz',
    image: '/meal-images/chhole-bhature.jpg',
    imageSource: 'Local high-res asset',
    calories: 812,
    protein: 20.6,
    carbs: 108.5,
    fats: 32.8,
    fiber: 12.5,
    ingredients: ['Kabuli Chickpeas', 'Maida (Bhature)', 'Green Chillies', 'Vinegar Onions', 'Basmati Rice', 'Cold Drink']
  },
  {
    id: 'sun_s',
    name: 'Holiday Off',
    day: 'Sunday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'No snacks served on Sunday evening',
    servingUsed: 'No snacks served on Sunday evening (0g)',
    image: '',
    imageSource: '',
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fats: 0.0,
    fiber: 0.0,
    ingredients: []
  },
  {
    id: 'sun_d',
    name: 'Lauki Kofta & Arabi',
    day: 'Sunday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Lauki Kofta, Arabi, Rice, Roti, Rice Kheer OR Sewai, Chhachh, Achar',
    servingUsed: '150g Lauki Kofta (2 pcs), 150g Masala Arabi, 200g Roti (4 pcs), 250g Steamed Rice, 75g Rice Kheer',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    imageSource: 'https://unsplash.com/photos/kofta',
    calories: 1048,
    protein: 26.4,
    carbs: 182.4,
    fats: 23.6,
    fiber: 19.2,
    ingredients: ['Lauki Kofta', 'Arabi', 'Rice', 'Roti', 'Rice Kheer OR Sewai', 'Buttermilk', 'Pickle']
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
        localStorage.setItem(DB_PREFIX + 'initialized_launch_v1', 'true');
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

  async updateMealImage(mealId, imageUrl) {
    if (!mealId || !imageUrl) {
      throw new Error('Meal ID and Image URL are required.');
    }

    if (isFirebaseConfigured) {
      await updateDoc(doc(firestoreDb, 'meals', mealId), {
        image: imageUrl,
        updatedAt: new Date().toISOString()
      });
    }

    const meals = this.getAllMeals();
    const idx = meals.findIndex(m => m.id === mealId);
    if (idx !== -1) {
      meals[idx].image = imageUrl;
      meals[idx].updatedAt = new Date().toISOString();
      this.setItem('meals', meals);
      return meals[idx];
    }
    return null;
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

  async submitRating({ userId, userName, mealId, mealName, rating, feedback = '', tags = [] }) {
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
    
    // Enforce MAX 1 feedback per student per calendar week
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    const currentWeekKey = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

    if (category === 'Feedback') {
      const existingWeeklyFeedback = complaints.find(c => 
        c.userId === userId && 
        c.category === 'Feedback' && 
        (c.weekKey === currentWeekKey || (c.timestamp && new Date(c.timestamp).getTime() > (Date.now() - 7 * 24 * 60 * 60 * 1000)))
      );
      if (existingWeeklyFeedback) {
        throw new Error('Maximum 1 feedback submission allowed per calendar week. You have already submitted feedback for this week.');
      }
    }

    const id = 'cmp_' + Date.now();
    const newComplaint = {
      id,
      userId,
      userName: userName || 'Student',
      block: block || 'DNB Block',
      category: category || 'Quality',
      description: description.trim(),
      status: 'PENDING',
      weekKey: currentWeekKey,
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
  } catch (e) {
    console.error('Error seeding Firestore data:', e);
  }
};

export default db;

