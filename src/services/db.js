// MessMate Unified Local-First Database & Auth Service
// Pilot-Ready Data Engine for ABES College Mess

const DB_PREFIX = 'messmates_db_';

export const MESS_BLOCK_MAP = {
  'DNB Block': {
    messName: 'Naina Caters - ABES Boys Hostel Mess',
    location: 'ABES EC & ABESBS Campus, Ghaziabad',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'VKB Block': {
    messName: 'Naina Caters - ABES Boys Hostel Mess',
    location: 'ABES EC & ABESBS Campus, Ghaziabad',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'Kalpana Chawla (Girls)': {
    messName: 'Naina Caters - ABES Girls Dining Hall 1',
    location: 'ABES EC Girls Campus, Ghaziabad',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  },
  'Sarojini Block (Girls)': {
    messName: 'Naina Caters - ABES Girls Dining Hall 2',
    location: 'ABES EC Girls Campus, Ghaziabad',
    timings: {
      Breakfast: '07:30 AM - 09:30 AM',
      Lunch: '12:30 PM - 02:30 PM',
      Snacks: '05:00 PM - 06:00 PM',
      Dinner: '07:30 PM - 09:30 PM',
    }
  }
};

// Initial Seed Users (Boys, Girls, Committee, Warden)
export const INITIAL_USERS = [
  {
    id: 'usr_rahul',
    name: 'Rahul Verma',
    email: 'rahul.verma@hostel.edu',
    password: 'password123',
    role: 'student',
    hostelBlock: 'DNB Block',
    roomNumber: '304',
    gender: 'Male',
    year: '2nd Year CSE',
    branch: 'Computer Science',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 120,
    rewardPoints: 420,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-01'
  },
  {
    id: 'usr_ananya',
    name: 'Ananya Singh',
    email: 'ananya.singh@hostel.edu',
    password: 'password123',
    role: 'student',
    hostelBlock: 'Kalpana Chawla (Girls)',
    roomNumber: '212',
    gender: 'Female',
    year: '3rd Year IT',
    branch: 'Information Technology',
    dietPreference: 'Pure Vegetarian',
    proteinTarget: 100,
    rewardPoints: 510,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-05'
  },
  {
    id: 'usr_parth',
    name: 'Parth Sharma',
    email: 'parth.sharma@hostel.edu',
    password: 'password123',
    role: 'student',
    hostelBlock: 'DNB Block',
    roomNumber: '215',
    gender: 'Male',
    year: '2nd Year AIML',
    branch: 'Artificial Intelligence & Machine Learning',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 120,
    rewardPoints: 450,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-10'
  },
  {
    id: 'usr_priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@hostel.edu',
    password: 'password123',
    role: 'student',
    hostelBlock: 'Sarojini Block (Girls)',
    roomNumber: '108',
    gender: 'Female',
    year: '2nd Year ECE',
    branch: 'Electronics & Comm.',
    dietPreference: 'Vegan Clean',
    proteinTarget: 90,
    rewardPoints: 380,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-08-12'
  },
  {
    id: 'usr_committee',
    name: 'Mess Committee',
    email: 'committee@hostel.edu',
    password: 'password123',
    role: 'committee',
    hostelBlock: 'Admin Block',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=300',
    department: 'Student Mess Executive Committee',
    createdAt: '2026-08-01'
  },
  {
    id: 'usr_warden',
    name: 'Pathak Sir',
    email: 'warden@hostel.edu',
    password: 'password123',
    role: 'warden',
    hostelBlock: 'Hostel Office',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    designation: 'Chief Warden',
    createdAt: '2026-08-01'
  }
];

// Initial Weekly Meals
export const INITIAL_MEALS_DB = [
  // Monday
  {
    id: 'mon_b',
    name: 'Aloo Pyaaz Paratha & Curd',
    day: 'Monday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Stuffed Paratha, Fresh Curd, Pickle, Green Tea / Hot Chai',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    calories: 420,
    protein: 11,
    carbs: 62,
    fats: 14,
    ingredients: ['Whole Wheat', 'Potato', 'Onion', 'Curd', 'Green Chilli', 'Spices'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'mon_l',
    name: 'Rajma Masala & Steamed Basmati',
    day: 'Monday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Slow-cooked Punjabi Rajma, Basmati Rice, Phulka, Cucumber Salad',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 580,
    protein: 20,
    carbs: 88,
    fats: 12,
    ingredients: ['Red Kidney Beans', 'Basmati Rice', 'Whole Wheat', 'Tomato Gravy', 'Ginger-Garlic'],
    allergens: ['Gluten']
  },
  {
    id: 'mon_s',
    name: 'High-Protein Roasted Sprouts Chaat',
    day: 'Monday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Moong Sprouts, Chopped Tomato, Lemon Dressing, Special Chai',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    calories: 220,
    protein: 14,
    carbs: 34,
    fats: 3,
    ingredients: ['Sprouted Moong', 'Onion', 'Tomato', 'Lemon', 'Chaat Masala'],
    allergens: []
  },
  {
    id: 'mon_d',
    name: 'Paneer Makhani & Butter Roti',
    day: 'Monday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Cottage Cheese Butter Gravy, Hot Tawa Rotis, Jeera Pulao, Dal Fry',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 640,
    protein: 22,
    carbs: 70,
    fats: 24,
    ingredients: ['Fresh Paneer', 'Cashew Cream', 'Tomato Puree', 'Wheat Roti', 'Butter'],
    allergens: ['Dairy', 'Nuts', 'Gluten']
  },

  // Tuesday
  {
    id: 'tue_b',
    name: 'South Indian Idli Sambar & Coconut Chutney',
    day: 'Tuesday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Steamed Rice Cakes, Vegetable Dal Sambar, Fresh Coconut Chutney, Coffee',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 340,
    protein: 10,
    carbs: 58,
    fats: 6,
    ingredients: ['Fermented Rice & Urad Dal', 'Drumsticks', 'Toor Dal', 'Coconut'],
    allergens: []
  },
  {
    id: 'tue_l',
    name: 'Kadhi Pakora & Jeera Rice',
    day: 'Tuesday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Traditional Dahi Kadhi with Crispy Pakoras, Cumin Rice, Roti, Salad',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    calories: 520,
    protein: 15,
    carbs: 82,
    fats: 16,
    ingredients: ['Curd', 'Besan Gram Flour', 'Basmati Rice', 'Fenugreek Spices'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'tue_s',
    name: 'Corn & Paneer Sautéed Cups',
    day: 'Tuesday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Sweet Corn Kernels, Crumbled Paneer, Black Pepper, Hot Masala Tea',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
    calories: 210,
    protein: 12,
    carbs: 28,
    fats: 5,
    ingredients: ['Sweet Corn', 'Paneer', 'Black Pepper', 'Butter'],
    allergens: ['Dairy']
  },
  {
    id: 'tue_d',
    name: 'Dal Tadka, Mix Veg & Phulka',
    day: 'Tuesday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Yellow Arhar Dal Double Tadka, Seasonal Mix Veg, Rotis, Gulab Jamun',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 590,
    protein: 16,
    carbs: 76,
    fats: 18,
    ingredients: ['Yellow Lentils', 'Carrots', 'Beans', 'Cauliflower', 'Whole Wheat'],
    allergens: ['Gluten', 'Dairy']
  },

  // Wednesday
  {
    id: 'wed_b',
    name: 'Methi Paratha & White Butter',
    day: 'Wednesday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Fresh Fenugreek Flatbread, Curd, Homemade White Butter, Boiled Eggs / Banana',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    calories: 430,
    protein: 14,
    carbs: 58,
    fats: 16,
    ingredients: ['Fresh Fenugreek', 'Wheat Flour', 'Butter', 'Curd', 'Eggs'],
    allergens: ['Dairy', 'Gluten', 'Egg']
  },
  {
    id: 'wed_l',
    name: 'Chole Bhature & Boondi Raita',
    day: 'Wednesday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Amritsari Spiced Chole, Crisp Fluffy Bhature, Roasted Cumin Raita, Pickled Onions',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    calories: 680,
    protein: 18,
    carbs: 92,
    fats: 24,
    ingredients: ['Kabuli Chickpeas', 'Flour', 'Curd', 'Spices', 'Mint Sauce'],
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'wed_s',
    name: 'Crispy Veg Cutlet & Green Chutney',
    day: 'Wednesday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Minced Veggie & Potato Cutlets, Mint Coriander Dip, Ginger Chai',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
    calories: 240,
    protein: 6,
    carbs: 36,
    fats: 8,
    ingredients: ['Potatoes', 'Carrots', 'Peas', 'Breadcrumbs', 'Mint'],
    allergens: ['Gluten']
  },
  {
    id: 'wed_d',
    name: 'Paneer Do Pyaza & Dal Makhani',
    day: 'Wednesday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Caramelized Onion Paneer, Creamy Black Dal Makhani, Tawa Roti, Rice Kheer',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 690,
    protein: 26,
    carbs: 74,
    fats: 28,
    ingredients: ['Paneer', 'Black Urad Dal', 'Onions', 'Butter', 'Whole Milk'],
    allergens: ['Dairy', 'Gluten']
  },

  // Thursday
  {
    id: 'thu_b',
    name: 'Poha with Roasted Peanuts & Sprouts',
    day: 'Thursday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Flattened Rice Tempered with Mustard & Curry Leaves, Crunchy Peanuts, Lemon Tea',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 360,
    protein: 12,
    carbs: 60,
    fats: 9,
    ingredients: ['Flattened Rice', 'Peanuts', 'Curry Leaves', 'Turmeric', 'Green Peas'],
    allergens: ['Peanuts']
  },
  {
    id: 'thu_l',
    name: 'Black Chana Curry & Steamed Rice',
    day: 'Thursday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'High-Fiber Kala Chana Gravy, Steamed Rice, Tawa Roti, Lemon Onion Salad',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 550,
    protein: 19,
    carbs: 84,
    fats: 11,
    ingredients: ['Black Chickpeas', 'Rice', 'Wheat Flour', 'Ginger', 'Tomato'],
    allergens: ['Gluten']
  },
  {
    id: 'thu_s',
    name: 'Bun Maska & Masala Chai',
    day: 'Thursday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Warm Soft Bun with Salted Butter, Adrak Elaichi Chai',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
    calories: 270,
    protein: 7,
    carbs: 38,
    fats: 11,
    ingredients: ['Wheat Bun', 'Butter', 'Cardamom', 'Milk Tea'],
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'thu_d',
    name: 'Soya Chaap Gravy & Roti',
    day: 'Thursday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'High Protein Soya Chaap in Spicy Onion Gravy, Arhar Dal, Phulka, Steamed Rice',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 610,
    protein: 25,
    carbs: 72,
    fats: 19,
    ingredients: ['Soya Chunks', 'Wheat Flour', 'Tomato', 'Coriander', 'Ghee'],
    allergens: ['Soy', 'Gluten', 'Dairy']
  },

  // Friday
  {
    id: 'fri_b',
    name: 'Masala Dosa, Sambar & Chutneys',
    day: 'Friday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Crisp Fermented Rice Crepe with Spiced Potato Mash, Sambar, 2 Chutneys, Milk',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    calories: 460,
    protein: 13,
    carbs: 72,
    fats: 13,
    ingredients: ['Rice', 'Urad Dal', 'Potatoes', 'Mustard Seeds', 'Coconut'],
    allergens: ['Dairy']
  },
  {
    id: 'fri_l',
    name: 'Dal Makhani & Shahi Pulao',
    day: 'Friday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Rich Creamy Dal Makhani, Saffron Pulao, Whole Wheat Roti, Mixed Vegetable Raita',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 630,
    protein: 21,
    carbs: 85,
    fats: 20,
    ingredients: ['Black Lentils', 'Kidney Beans', 'Basmati Rice', 'Curd', 'Butter'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'fri_s',
    name: 'Crispy Veg Samosa & Sweet Imli Chutney',
    day: 'Friday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Two Crisp Potato Peas Samosas, Tamarind & Mint Chutneys, Hot Tea',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
    calories: 310,
    protein: 6,
    carbs: 42,
    fats: 14,
    ingredients: ['Potatoes', 'Green Peas', 'Wheat Flour', 'Tamarind', 'Cumin'],
    allergens: ['Gluten']
  },
  {
    id: 'fri_d',
    name: 'Special Matar Paneer & Butter Naan',
    day: 'Friday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Fresh Cottage Cheese & Sweet Green Peas in Rich Gravy, Butter Naan, Rice, Rasgulla',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 680,
    protein: 24,
    carbs: 80,
    fats: 26,
    ingredients: ['Paneer', 'Green Peas', 'Tomato Gravy', 'Refined & Whole Wheat Flour', 'Ghee'],
    allergens: ['Dairy', 'Gluten']
  },

  // Saturday
  {
    id: 'sat_b',
    name: 'Pav Bhaji & Lemon Wedges',
    day: 'Saturday',
    category: 'Breakfast',
    time: '07:30 AM - 09:30 AM',
    items: 'Buttered Mumbai Pav Buns, Mashed Spiced Veg Bhaji, Diced Onions, Lemon',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    calories: 480,
    protein: 11,
    carbs: 68,
    fats: 17,
    ingredients: ['Pav Bread', 'Potatoes', 'Cauliflower', 'Capsicum', 'Butter', 'Spices'],
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'sat_l',
    name: 'Hyderabadi Veg Biryani & Mirchi Salan',
    day: 'Saturday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Dum Cooked Aromatic Basmati Rice with Soya & Veggies, Spicy Peanut Salan, Raita',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600',
    calories: 650,
    protein: 18,
    carbs: 92,
    fats: 21,
    ingredients: ['Basmati Rice', 'Soya Chunks', 'Beans', 'Fried Onions', 'Mint', 'Yogurt'],
    allergens: ['Dairy', 'Soy', 'Peanuts']
  },
  {
    id: 'sat_s',
    name: 'Bhelpuri & Sweet Corn',
    day: 'Saturday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Puffed Rice, Sev, Onions, Sweet Corn, Tangy Sauces, Cold Coffee',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    calories: 230,
    protein: 6,
    carbs: 42,
    fats: 5,
    ingredients: ['Puffed Rice', 'Gram Flour Sev', 'Sweet Corn', 'Tamarind'],
    allergens: []
  },
  {
    id: 'sat_d',
    name: 'Shahi Paneer, Dal Palak & Jeera Rice',
    day: 'Saturday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Royal Cashew Gravy Cottage Cheese, Spinach Lentils, Cumin Rice, Phulka',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 670,
    protein: 26,
    carbs: 74,
    fats: 26,
    ingredients: ['Paneer', 'Spinach', 'Moong Dal', 'Cashews', 'Cream', 'Whole Wheat'],
    allergens: ['Dairy', 'Nuts', 'Gluten']
  },

  // Sunday
  {
    id: 'sun_b',
    name: 'Bedmi Puri & Aloo Sabzi with Halwa',
    day: 'Sunday',
    category: 'Breakfast',
    time: '08:00 AM - 10:00 AM',
    items: 'Spiced Lentil Stuffed Crispy Puris, Mathura Aloo Gravy, Sooji Halwa, Fresh Buttermilk',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    calories: 590,
    protein: 14,
    carbs: 82,
    fats: 24,
    ingredients: ['Whole Wheat', 'Urad Dal', 'Potatoes', 'Semolina', 'Ghee'],
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'sun_l',
    name: 'Sunday Feast: Paneer Lababdar & Veg Pulao',
    day: 'Sunday',
    category: 'Lunch',
    time: '12:30 PM - 02:30 PM',
    items: 'Rich Tomato Cheese Curry, Saffron Pulao, Tawa Paratha, Boondi Raita, Ice Cream',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    calories: 720,
    protein: 25,
    carbs: 88,
    fats: 28,
    ingredients: ['Paneer', 'Basmati Rice', 'Butter', 'Cream', 'Spices'],
    allergens: ['Dairy', 'Gluten']
  },
  {
    id: 'sun_s',
    name: 'Club Veg Sandwich & Lemonade',
    day: 'Sunday',
    category: 'Snacks',
    time: '05:00 PM - 06:00 PM',
    items: 'Grilled Whole Wheat Sandwich with Cucumber, Tomato & Cheese, Fresh Lemon Water',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
    calories: 260,
    protein: 9,
    carbs: 38,
    fats: 8,
    ingredients: ['Whole Wheat Bread', 'Cheese Slice', 'Cucumber', 'Tomato', 'Butter'],
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'sun_d',
    name: 'Moong Dal Khichdi & Aloo Bharta (Light Dinner)',
    day: 'Sunday',
    category: 'Dinner',
    time: '07:30 PM - 09:30 PM',
    items: 'Desi Ghee Tempered Khichdi, Mashed Potato Roast, Roasted Papad, Fresh Curd, Pickle',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
    calories: 490,
    protein: 16,
    carbs: 78,
    fats: 12,
    ingredients: ['Rice', 'Yellow Moong Dal', 'Potatoes', 'Pure Cow Ghee', 'Cumin'],
    allergens: ['Dairy']
  }
];

// Initial Real Ratings from 10+ students across hostel blocks
export const INITIAL_RATINGS_DB = [
  { id: 'rat_1', userId: 'usr_rahul', userName: 'Rahul Verma', mealId: 'fri_b', mealName: 'Masala Dosa, Sambar & Chutneys', rating: 5, feedback: 'Dosa was hot and crispy, sambar was flavorful!', tags: ['Tasty', 'Good Quality'], timestamp: '2026-08-25T08:15:00Z' },
  { id: 'rat_2', userId: 'usr_ananya', userName: 'Ananya Singh', mealId: 'fri_b', mealName: 'Masala Dosa, Sambar & Chutneys', rating: 5, feedback: 'Coconut chutney was very fresh today.', tags: ['Tasty'], timestamp: '2026-08-25T08:30:00Z' },
  { id: 'rat_3', userId: 'usr_priya', userName: 'Priya Sharma', mealId: 'fri_b', mealName: 'Masala Dosa, Sambar & Chutneys', rating: 4, feedback: 'Good portion size.', tags: ['Good Quantity'], timestamp: '2026-08-25T08:45:00Z' },
  { id: 'rat_4', userId: 'usr_rahul', userName: 'Rahul Verma', mealId: 'fri_l', mealName: 'Dal Makhani & Shahi Pulao', rating: 5, feedback: 'Very rich and creamy.', tags: ['Tasty', 'Good Quality'], timestamp: '2026-08-25T13:10:00Z' },
  { id: 'rat_5', userId: 'usr_ananya', userName: 'Ananya Singh', mealId: 'fri_l', mealName: 'Dal Makhani & Shahi Pulao', rating: 4, feedback: 'Good high protein lunch.', tags: ['Good Quality'], timestamp: '2026-08-25T13:20:00Z' },
  { id: 'rat_6', userId: 'usr_parth', userName: 'Parth Sharma', mealId: 'fri_l', mealName: 'Dal Makhani & Shahi Pulao', rating: 5, feedback: 'Best meal of the week.', tags: ['Tasty'], timestamp: '2026-08-25T13:30:00Z' },
  { id: 'rat_7', userId: 'usr_rahul', userName: 'Rahul Verma', mealId: 'fri_s', mealName: 'Crispy Veg Samosa & Sweet Imli Chutney', rating: 4, feedback: 'Nice evening snack with chai.', tags: ['Tasty'], timestamp: '2026-08-25T17:25:00Z' },
  { id: 'rat_8', userId: 'usr_ananya', userName: 'Ananya Singh', mealId: 'fri_d', mealName: 'Special Matar Paneer & Butter Naan', rating: 5, feedback: 'Paneer quality is Grade A.', tags: ['Tasty', 'Good Quality'], timestamp: '2026-08-25T20:10:00Z' },
  { id: 'rat_9', userId: 'usr_priya', userName: 'Priya Sharma', mealId: 'fri_d', mealName: 'Special Matar Paneer & Butter Naan', rating: 4, feedback: 'Hot naans served on time.', tags: ['Good Quantity'], timestamp: '2026-08-25T20:30:00Z' },
  { id: 'rat_10', userId: 'usr_parth', userName: 'Parth Sharma', mealId: 'wed_l', mealName: 'Chole Bhature & Boondi Raita', rating: 5, feedback: 'Super tasty!', tags: ['Tasty'], timestamp: '2026-08-24T13:00:00Z' }
];

// Initial Real Complaints
export const INITIAL_COMPLAINTS_DB = [
  {
    id: 'cmp_1',
    userId: 'usr_rahul',
    userName: 'Rahul Verma',
    block: 'DNB Block',
    category: 'Quality',
    description: 'The dal on Thursday was slightly too watery compared to usual standard.',
    status: 'IN REVIEW',
    timestamp: '2026-08-25T14:30:00Z'
  },
  {
    id: 'cmp_2',
    userId: 'usr_ananya',
    userName: 'Ananya Singh',
    block: 'Kalpana Chawla (Girls)',
    category: 'Cleanliness',
    description: 'Please ensure water cooler in Girls dining hall is sanitized on weekends.',
    status: 'RESOLVED',
    timestamp: '2026-08-24T18:00:00Z',
    resolvedAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'cmp_3',
    userId: 'usr_priya',
    userName: 'Priya Sharma',
    block: 'Sarojini Block (Girls)',
    category: 'Menu',
    description: 'Requesting more high-protein sprout salad varieties during evening snacks.',
    status: 'PENDING',
    timestamp: '2026-08-26T09:15:00Z'
  }
];

// Initial Active Voting Poll
export const INITIAL_POLL_DB = {
  id: 'poll_101',
  dishToReplace: 'Aloo Tamatar',
  currentRating: 2.3,
  category: 'Dinner',
  options: [
    { id: 'opt_chole', name: 'Chole Masala', protein: '14g' },
    { id: 'opt_rajma', name: 'Rajma Rasila', protein: '15g' },
    { id: 'opt_mixveg', name: 'Mix Veg Korma', protein: '9g' }
  ],
  status: 'ACTIVE',
  closingDate: 'Aug 27, 2026 - 10:00 PM',
  createdAt: '2026-08-25T10:00:00Z'
};

// Initial Real Votes Records (1 vote per user)
export const INITIAL_VOTES_DB = [
  { id: 'v_1', pollId: 'poll_101', userId: 'usr_rahul', userName: 'Rahul Verma', optionId: 'opt_chole', timestamp: '2026-08-25T11:00:00Z' },
  { id: 'v_2', pollId: 'poll_101', userId: 'usr_ananya', userName: 'Ananya Singh', optionId: 'opt_chole', timestamp: '2026-08-25T11:30:00Z' },
  { id: 'v_3', pollId: 'poll_101', userId: 'usr_priya', userName: 'Priya Sharma', optionId: 'opt_rajma', timestamp: '2026-08-25T12:00:00Z' },
  { id: 'v_4', pollId: 'usr_seed_1', userName: 'Arjun Mehta', optionId: 'opt_chole', timestamp: '2026-08-25T13:00:00Z' },
  { id: 'v_5', pollId: 'usr_seed_2', userName: 'Sneha Roy', optionId: 'opt_rajma', timestamp: '2026-08-25T14:00:00Z' },
  { id: 'v_6', pollId: 'usr_seed_3', userName: 'Deepak Joshi', optionId: 'opt_chole', timestamp: '2026-08-25T15:00:00Z' },
  { id: 'v_7', pollId: 'usr_seed_4', userName: 'Kavita Nair', optionId: 'opt_mixveg', timestamp: '2026-08-25T16:00:00Z' }
];

// Initial Health Rewards Catalog (Strictly Healthy Items)
export const HEALTHY_REWARDS_CATALOG = [
  {
    id: 'r_fruit',
    name: 'Fresh Fruit Bowl',
    points: 150,
    category: 'Fruit',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    description: 'Seasonal cut apples, bananas, pomegranates & papaya with honey chia seeds.'
  },
  {
    id: 'r_milk',
    name: 'Extra Fresh Milk Pack',
    points: 100,
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
    description: '500ml pasteurized pure toned milk token for gym recovery.'
  },
  {
    id: 'r_curd',
    name: 'Chilled Fresh Curd Bowl',
    points: 80,
    category: 'Probiotic',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    description: 'Probiotic fresh set curd bowl for optimal digestion.'
  },
  {
    id: 'r_sprouts',
    name: 'High-Protein Sprouts Box',
    points: 120,
    category: 'Protein',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
    description: 'Sprouted green moong & black chana box with lemon seasoning.'
  },
  {
    id: 'r_snack',
    name: 'Healthy Roasted Nut Box',
    points: 200,
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1622484210800-c0953a559d24?auto=format&fit=crop&q=80&w=400',
    description: 'Roasted almonds, walnuts, pumpkin seeds and roasted chana pack.'
  },
  {
    id: 'r_gym',
    name: 'Campus Gym / Wellness Pass',
    points: 300,
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
    description: '1-Week VIP Access to ABES campus cardio & weight training facility.'
  }
];

// STORAGE HELPERS
const getStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(DB_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const setStorage = (key, data) => {
  try {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

// INITIALIZE DATABASE TABLES
export const initDB = () => {
  if (!localStorage.getItem(DB_PREFIX + 'initialized')) {
    setStorage('users', INITIAL_USERS);
    setStorage('meals', INITIAL_MEALS_DB);
    setStorage('ratings', INITIAL_RATINGS_DB);
    setStorage('complaints', INITIAL_COMPLAINTS_DB);
    setStorage('poll', INITIAL_POLL_DB);
    setStorage('votes', INITIAL_VOTES_DB);
    setStorage('rewards_catalog', HEALTHY_REWARDS_CATALOG);
    setStorage('redemptions', []);
    setStorage('protein_logs', []);
    localStorage.setItem(DB_PREFIX + 'initialized', 'true');
  }
};

// CALL ONCE ON IMPORT
initDB();

// DATABASE API
export const db = {
  // USERS & AUTH
  getUsers: () => getStorage('users', INITIAL_USERS),
  
  getUserById: (id) => {
    const users = getStorage('users', INITIAL_USERS);
    return users.find(u => u.id === id) || null;
  },

  getUserByEmail: (email) => {
    const users = getStorage('users', INITIAL_USERS);
    return users.find(u => u.email?.toLowerCase() === email?.toLowerCase()) || null;
  },

  registerUser: (userData) => {
    const users = getStorage('users', INITIAL_USERS);
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'student',
      hostelBlock: userData.hostelBlock || 'DNB Block',
      roomNumber: userData.roomNumber || '',
      gender: userData.gender || 'Male',
      year: userData.year || '2nd Year',
      branch: userData.branch || 'Engineering',
      dietPreference: userData.dietPreference || 'High Protein / Eggetarian',
      proteinTarget: Number(userData.proteinTarget) || 120,
      rewardPoints: 200, // Welcome bonus points
      avatar: userData.gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
      createdAt: new Date().toISOString()
    };
    const updated = [newUser, ...users];
    setStorage('users', updated);
    return newUser;
  },

  updateUserProfile: (userId, updates) => {
    const users = getStorage('users', INITIAL_USERS);
    let updatedUser = null;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });
    setStorage('users', updatedUsers);
    return updatedUser;
  },

  // MEALS & MENUS
  getAllMeals: () => getStorage('meals', INITIAL_MEALS_DB),

  getDayMeals: (day) => {
    const meals = getStorage('meals', INITIAL_MEALS_DB);
    return meals.filter(m => m.day === day);
  },

  getMealById: (id) => {
    const meals = getStorage('meals', INITIAL_MEALS_DB);
    return meals.find(m => m.id === id) || null;
  },

  saveMeal: (mealData) => {
    const meals = getStorage('meals', INITIAL_MEALS_DB);
    let updatedMeals;
    if (mealData.id) {
      updatedMeals = meals.map(m => m.id === mealData.id ? { ...m, ...mealData } : m);
    } else {
      const newMeal = {
        ...mealData,
        id: 'm_' + Date.now(),
        rating: 5.0,
        ratingCount: 0
      };
      updatedMeals = [newMeal, ...meals];
    }
    setStorage('meals', updatedMeals);
    return updatedMeals;
  },

  deleteMeal: (mealId) => {
    const meals = getStorage('meals', INITIAL_MEALS_DB);
    const updated = meals.filter(m => m.id !== mealId);
    setStorage('meals', updated);
    return updated;
  },

  // RATINGS & REAL-TIME STATS
  getAllRatings: () => getStorage('ratings', INITIAL_RATINGS_DB),

  getMealRatings: (mealId) => {
    const ratings = getStorage('ratings', INITIAL_RATINGS_DB);
    return ratings.filter(r => r.mealId === mealId);
  },

  getMealStats: (mealId) => {
    const ratings = getStorage('ratings', INITIAL_RATINGS_DB);
    const mealRatings = ratings.filter(r => r.mealId === mealId);
    if (mealRatings.length === 0) {
      return { rating: 4.5, ratingCount: 0 };
    }
    const sum = mealRatings.reduce((acc, r) => acc + Number(r.rating), 0);
    const avg = Number((sum / mealRatings.length).toFixed(1));
    return { rating: avg, ratingCount: mealRatings.length };
  },

  getUserRatingForMeal: (userId, mealId) => {
    const ratings = getStorage('ratings', INITIAL_RATINGS_DB);
    return ratings.find(r => r.userId === userId && r.mealId === mealId) || null;
  },

  submitRating: ({ userId, userName, mealId, mealName, rating, feedback = '', tags = [] }) => {
    const ratings = getStorage('ratings', INITIAL_RATINGS_DB);
    const existingIndex = ratings.findIndex(r => r.userId === userId && r.mealId === mealId);
    
    const ratingEntry = {
      id: existingIndex >= 0 ? ratings[existingIndex].id : 'rat_' + Date.now(),
      userId,
      userName,
      mealId,
      mealName,
      rating: Number(rating),
      feedback: feedback.trim(),
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      timestamp: new Date().toISOString()
    };

    let updatedRatings;
    if (existingIndex >= 0) {
      updatedRatings = [...ratings];
      updatedRatings[existingIndex] = ratingEntry;
    } else {
      updatedRatings = [ratingEntry, ...ratings];
    }
    setStorage('ratings', updatedRatings);

    // Award +20 points to user
    db.adjustUserPoints(userId, 20);

    return ratingEntry;
  },

  getOverallMessRating: () => {
    const ratings = getStorage('ratings', INITIAL_RATINGS_DB);
    if (ratings.length === 0) return { score: 4.4, count: 0 };
    const sum = ratings.reduce((acc, r) => acc + Number(r.rating), 0);
    return {
      score: Number((sum / ratings.length).toFixed(1)),
      count: ratings.length
    };
  },

  // COMPLAINTS
  getAllComplaints: () => getStorage('complaints', INITIAL_COMPLAINTS_DB),

  getUserComplaints: (userId) => {
    const complaints = getStorage('complaints', INITIAL_COMPLAINTS_DB);
    return complaints.filter(c => c.userId === userId);
  },

  createComplaint: ({ userId, userName, block, category, description }) => {
    const complaints = getStorage('complaints', INITIAL_COMPLAINTS_DB);
    const newComplaint = {
      id: 'cmp_' + Date.now(),
      userId,
      userName,
      block,
      category,
      description: description.trim(),
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    const updated = [newComplaint, ...complaints];
    setStorage('complaints', updated);
    return newComplaint;
  },

  updateComplaintStatus: (complaintId, newStatus) => {
    const complaints = getStorage('complaints', INITIAL_COMPLAINTS_DB);
    const updated = complaints.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: newStatus,
          resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : c.resolvedAt
        };
      }
      return c;
    });
    setStorage('complaints', updated);
    return updated;
  },

  // VOTING & POLLS
  getPoll: () => {
    const poll = getStorage('poll', INITIAL_POLL_DB);
    const votes = getStorage('votes', INITIAL_VOTES_DB);
    const pollVotes = votes.filter(v => v.pollId === poll.id);
    const totalVotes = pollVotes.length;

    // Calculate real percentages dynamically from database vote records
    const optionsWithStats = poll.options.map(opt => {
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
  },

  hasUserVoted: (pollId, userId) => {
    const votes = getStorage('votes', INITIAL_VOTES_DB);
    const userVote = votes.find(v => v.pollId === pollId && v.userId === userId);
    return userVote ? userVote.optionId : null;
  },

  castVote: ({ pollId, userId, userName, optionId }) => {
    const votes = getStorage('votes', INITIAL_VOTES_DB);
    const existing = votes.find(v => v.pollId === pollId && v.userId === userId);
    if (existing) {
      throw new Error('You have already voted in this poll.');
    }
    const newVote = {
      id: 'v_' + Date.now(),
      pollId,
      userId,
      userName,
      optionId,
      timestamp: new Date().toISOString()
    };
    const updated = [newVote, ...votes];
    setStorage('votes', updated);

    // Award +30 points
    db.adjustUserPoints(userId, 30);

    return newVote;
  },

  createPoll: (pollData) => {
    const newPoll = {
      id: 'poll_' + Date.now(),
      dishToReplace: pollData.dishToReplace,
      currentRating: Number(pollData.currentRating) || 2.5,
      category: pollData.category || 'Dinner',
      options: pollData.options.map((opt, i) => ({
        id: 'opt_' + i + '_' + Date.now(),
        name: opt.name,
        protein: opt.protein || '12g'
      })),
      status: 'ACTIVE',
      closingDate: pollData.closingDate || 'In 24 Hours',
      createdAt: new Date().toISOString()
    };
    setStorage('poll', newPoll);
    return newPoll;
  },

  // PROTEIN LOGGING & GYM MODE
  getTodayUserProtein: (userId) => {
    const logs = getStorage('protein_logs', []);
    const todayStr = new Date().toISOString().split('T')[0];
    const userTodayLogs = logs.filter(l => l.userId === userId && l.date === todayStr);
    return userTodayLogs.reduce((acc, l) => acc + Number(l.protein), 0);
  },

  logProtein: ({ userId, dishName, protein }) => {
    const logs = getStorage('protein_logs', []);
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog = {
      id: 'plog_' + Date.now(),
      userId,
      dishName,
      protein: Number(protein),
      date: todayStr,
      timestamp: new Date().toISOString()
    };
    setStorage('protein_logs', [newLog, ...logs]);
    return newLog;
  },

  // REWARDS
  getRewardsCatalog: () => getStorage('rewards_catalog', HEALTHY_REWARDS_CATALOG),

  adjustUserPoints: (userId, delta) => {
    const users = getStorage('users', INITIAL_USERS);
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, rewardPoints: Math.max(0, (u.rewardPoints || 0) + delta) };
      }
      return u;
    });
    setStorage('users', updatedUsers);
  },

  redeemReward: (userId, userName, rewardItem) => {
    const user = db.getUserById(userId);
    if (!user || (user.rewardPoints || 0) < rewardItem.points) {
      throw new Error('Insufficient health points to redeem this item.');
    }
    // Deduct points
    db.adjustUserPoints(userId, -rewardItem.points);

    const redemptions = getStorage('redemptions', []);
    const newRedemption = {
      id: 'red_' + Date.now(),
      userId,
      userName,
      rewardId: rewardItem.id,
      rewardName: rewardItem.name,
      pointsSpent: rewardItem.points,
      claimCode: 'HEALTHY-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      status: 'CLAIMED',
      timestamp: new Date().toISOString()
    };
    setStorage('redemptions', [newRedemption, ...redemptions]);
    return newRedemption;
  },

  getUserRedemptions: (userId) => {
    const redemptions = getStorage('redemptions', []);
    return redemptions.filter(r => r.userId === userId);
  }
};
