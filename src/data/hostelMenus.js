// Centralized Weekly Menus & Hostel Definitions for ABES EC / ABESBS Campus

export const BOYS_HOSTEL_BLOCKS = [
  'DNB Block',
  'VKB Block',
  'RKB Block',
  'ABB Block'
];

export const GIRLS_HOSTEL_BLOCKS = [
  'Block A (Girls)',
  'Block B (Girls)',
  'Block C (Girls)'
];

export const isGirlsHostelBlock = (hostelBlock) => {
  if (!hostelBlock || typeof hostelBlock !== 'string') return false;
  const lower = hostelBlock.toLowerCase();
  return (
    lower.includes('(girls)') ||
    lower.includes('girls') ||
    lower.includes('block a') ||
    lower.includes('block b') ||
    lower.includes('block c')
  );
};

export const MEAL_IMAGES = {
  // Breakfasts
  idli_sambhar: "/meal-images/veg-fried-idli.jpg",
  matar_kulche: "/meal-images/matar-kulche.jpg",
  aloo_paratha: "/meal-images/aloo-paratha.jpg",
  pav_bhaji: "/meal-images/pav-bhaji.jpg",
  puri_aloo_jalebi: "/meal-images/puri-aloo-tamatar.jpg",
  aloo_sandwich: "/meal-images/veg-sandwich.jpg",

  // Lunches
  rajma_rice: "/meal-images/rajma-masala.jpg",
  tahri_pulao: "/meal-images/aloo-tamatar-tahri.jpg",
  chhole_rice: "/meal-images/kaabli-chhole.jpg",
  kadhi_rice: "/meal-images/kadhi-rice.jpg",
  mix_dal_taroi: "/meal-images/mix-dal-tarohi.jpg",
  chole_bhature: "/meal-images/chhole-bhature.jpg",

  // Snacks
  burger: "/meal-images/burger.jpg",
  macaroni: "/meal-images/macaroni.jpg",
  samosa: "/meal-images/samosa.jpg",
  pakoda: "/meal-images/bread-pakoda.jpg",
  chowmein: "/meal-images/chowmein.jpg",
  bread_roll: "/meal-images/bread-roll.jpg",
  off_snacks: "",

  // Dinners
  arhar_dal_thali: "/meal-images/arhar-dal-aloo-gobhi.jpg",
  kali_masoor_icecream: "/meal-images/kali-masoor-aloo-beans.jpg",
  butter_paneer_puri: "/meal-images/butter-paneer.jpg",
  dal_makhani_thali: "/meal-images/dal-makhani-mix-veg.jpg",
  arhar_dal_lauki: "/meal-images/arhar-dal-lauki.jpg",
  lauki_kofta_kheer: "/meal-images/lauki-kofta-arabi.jpg"
};

export const GH_IMAGES = {
  fried_idli: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  black_chana_gravy: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  bread_butter_cornflakes: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  manchurian_rice: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  papdi_chaat: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  palak_poori: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  chana_dal_kathal: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
};

export const BOYS_WEEKLY_MENU = {
  Monday: {
    Breakfast: { title: "Veg Fried Idli / Plain Idli / Sambhar Bada", items: ["Sambhar", "Coconut Chutney", "Lal Chutney", "Tea", "Milk", "Banana"], image: MEAL_IMAGES.idli_sambhar, protein: "12g", calories: "380 kcal" },
    Lunch: { title: "Mix Veg & Rajma Chawal", items: ["Rajma", "Roti", "Rice", "Mix Salad", "Boondi Raita", "Lemon 1/2"], image: MEAL_IMAGES.rajma_rice, protein: "18g", calories: "580 kcal" },
    Snacks: { title: "Veg Burger & Roohafza", items: ["Burger", "Chilly & Tomato Sauce", "Roohafza"], image: MEAL_IMAGES.burger, protein: "7g", calories: "320 kcal" },
    Dinner: { title: "Arhar Daal & Aloo Shimla Mirch", items: ["Rice", "Roti", "Suji Halwa", "Moong Dal Halwa (Monthly)", "Chhachh"], image: MEAL_IMAGES.arhar_dal_thali, protein: "16g", calories: "620 kcal" }
  },
  Tuesday: {
    Breakfast: { title: "Matar Kulche & Watermelon", items: ["Matar Kulche", "Milk", "Tea", "Watermelon"], image: MEAL_IMAGES.matar_kulche, protein: "14g", calories: "410 kcal" },
    Lunch: { title: "Tahri & Aaloo Tamatar Sabji", items: ["Roti", "Salad", "Curd", "Lemon 1/2", "Hari Chutney"], image: MEAL_IMAGES.tahri_pulao, protein: "11g", calories: "510 kcal" },
    Snacks: { title: "Macaroni & Coffee", items: ["Macaroni", "Tomato & Chilly Sauce", "Coffee"], image: MEAL_IMAGES.macaroni, protein: "6g", calories: "290 kcal" },
    Dinner: { title: "Kali Masoor Dal & Bhindi", items: ["Rice", "Roti", "Icecream (Mango/Butterscotch/Chocolate)", "Mix Salad", "Achar"], image: MEAL_IMAGES.kali_masoor_icecream, protein: "15g", calories: "600 kcal" }
  },
  Wednesday: {
    Breakfast: { title: "Aloo Paratha & Muskmelon", items: ["Pickle", "Curd", "Tea", "Muskmelon"], image: MEAL_IMAGES.aloo_paratha, protein: "10g", calories: "450 kcal" },
    Lunch: { title: "Kaabli Chhole & Kashifal", items: ["Roti", "Jeera Rice", "Mix Salad", "Curd", "Lemon 1/2"], image: MEAL_IMAGES.chhole_rice, protein: "17g", calories: "560 kcal" },
    Snacks: { title: "Samosa & Tea", items: ["Samosa", "Tomato & Chilly Sauce", "Tea"], image: MEAL_IMAGES.samosa, protein: "5g", calories: "310 kcal" },
    Dinner: { title: "Butter Paneer Masala / Kadhai Paneer", items: ["Aaloo Jeera", "Puri", "Pulaw", "Mix Salad"], image: MEAL_IMAGES.butter_paneer_puri, protein: "22g", calories: "690 kcal" }
  },
  Thursday: {
    Breakfast: { title: "Pav Bhaji & Papaya", items: ["Pav Bhaji", "Tea", "Milk", "Butter", "Papaya"], image: MEAL_IMAGES.pav_bhaji, protein: "9g", calories: "420 kcal" },
    Lunch: { title: "Kadhi Pakoda & Aaloo Pyaj Sabji", items: ["Rice", "Roti", "Salad", "Papad Fried", "Lemon 1/2"], image: MEAL_IMAGES.kadhi_rice, protein: "13g", calories: "540 kcal" },
    Snacks: { title: "Bread Pakoda & Tea", items: ["Bread Pakoda", "Chilli & Tomato Sauce", "Tea"], image: MEAL_IMAGES.pakoda, protein: "8g", calories: "370 kcal" },
    Dinner: { title: "Daal Makhani & Mix Veg", items: ["Roti", "Rice", "Gulab Jamun", "Chhachh", "Achar"], image: MEAL_IMAGES.dal_makhani_thali, protein: "18g", calories: "670 kcal" }
  },
  Friday: {
    Breakfast: { title: "Gobhi Paratha", items: ["Gobhi Paratha", "Pickle", "Curd", "Tea", "Banana"], image: MEAL_IMAGES.aloo_paratha, protein: "9g", calories: "445 kcal" },
    Lunch: { title: "Mix Daal, Tarohi & Roti", items: ["Chana Dal", "Shimla Soyabean", "Roti", "Rice", "Mix Salad", "Curd", "Lemon 1/2"], image: MEAL_IMAGES.mix_dal_taroi, protein: "31g", calories: "880 kcal" },
    Snacks: { title: "Chowmein & Shikanji", items: ["Chowmein", "Chilly & Tomato Sauce", "Hot Tea"], image: MEAL_IMAGES.chowmein, protein: "7g", calories: "310 kcal" },
    Dinner: { title: "Arhar Daal & Lauki", items: ["Rice", "Roti", "Coconut Laddoo", "Mix Salad", "Achar"], image: MEAL_IMAGES.arhar_dal_lauki, protein: "24g", calories: "910 kcal" }
  },
  Saturday: {
    Breakfast: { title: "Aloo Tamatar Sabji & Puri", items: ["Aaloo Tamatar Sabji", "Puri", "Mirchi", "Tea", "Jalebi", "Curd", "Watermelon"], image: MEAL_IMAGES.puri_aloo_jalebi, protein: "12g", calories: "640 kcal" },
    Lunch: { title: "Chhole Bhature & Cold Drink", items: ["Chhole Kabuli (Big)", "Bhature", "Fry Mirch", "Sirka Pyaz", "Jeera Rice", "Cold Drink", "Pickle", "Veg Raita"], image: MEAL_IMAGES.chole_bhature, protein: "21g", calories: "810 kcal" },
    Snacks: { title: "Bread Roll & Tea", items: ["Bread Roll", "Chilly & Tomato Sauce", "Tea"], image: MEAL_IMAGES.bread_roll, protein: "6g", calories: "360 kcal" },
    Dinner: { title: "Arhar Dal & Lauki", items: ["Rice", "Roti", "Mix Salad", "Chhachh"], image: MEAL_IMAGES.arhar_dal_lauki, protein: "24g", calories: "910 kcal" }
  },
  Sunday: {
    Breakfast: { title: "Veg Sandwich & Cornflakes", items: ["Veg Sandwich", "Tomato Sauce", "Cornflakes", "Milk", "Tea", "Mix Fruit", "Chat Masala"], image: MEAL_IMAGES.aloo_sandwich, protein: "12g", calories: "420 kcal" },
    Lunch: { title: "Chhole Bhature (Big Kabuli)", items: ["Fry Mirch", "Sirka Pyaz", "Jeera Rice", "Cold Drink", "Pickle", "Veg Raita"], image: MEAL_IMAGES.chole_bhature, protein: "21g", calories: "810 kcal" },
    Snacks: { title: "Holiday Off", items: ["No snacks served on Sunday evening"], image: "", protein: "0g", calories: "0 kcal" },
    Dinner: { title: "Lauki Kofta & Arabi", items: ["Rice", "Roti", "Chhachh", "Kheer / Sewai"], image: MEAL_IMAGES.lauki_kofta_kheer, protein: "26g", calories: "1040 kcal" }
  }
};

export const GIRLS_WEEKLY_MENU = {
  Monday: {
    Breakfast: { title: "Fried Idli & Sambar", items: ["Nariyal Chatni", "Tea with Ginger", "Milk", "Banana"], image: GH_IMAGES.fried_idli, protein: "11g", calories: "360 kcal" },
    Lunch: { title: "Arhar Daal & Mix Veg Paneer", items: ["Boondi Raita", "Rice", "Chapati", "Salad (Onion)", "1/2 Lemon"], image: MEAL_IMAGES.arhar_dal_thali, protein: "17g", calories: "570 kcal" },
    Snacks: { title: "Bread Pakoda / Mix Pakodi", items: ["Tomato Sauce", "Green Chatni", "Tea"], image: MEAL_IMAGES.pakoda, protein: "6g", calories: "320 kcal" },
    Dinner: { title: "Butter Masala / Kadhai Paneer", items: ["Aloo Chokha", "Chapati", "Rice", "Ice Cream", "Mix Salad"], image: MEAL_IMAGES.butter_paneer_puri, protein: "20g", calories: "680 kcal" }
  },
  Tuesday: {
    Breakfast: { title: "Aloo Onion Parantha", items: ["Tea (Ginger)", "Milk", "Pickle", "Muskmelon / Seasonal Fruit"], image: MEAL_IMAGES.aloo_paratha, protein: "10g", calories: "440 kcal" },
    Lunch: { title: "Black Chana Gravy & Aloo Beans", items: ["Chapati", "Rice", "Curd (Beetroot)", "Salad", "1/2 Lemon"], image: GH_IMAGES.black_chana_gravy, protein: "16g", calories: "530 kcal" },
    Snacks: { title: "Chowmein & Shikanji", items: ["Tomato/Green Chilli Sauce", "Shikanji"], image: MEAL_IMAGES.chowmein, protein: "7g", calories: "340 kcal" },
    Dinner: { title: "Aloo Tamatar & Bhindi", items: ["Plain Parantha", "Rice", "Gulab Jamun", "Chhachh"], image: MEAL_IMAGES.arhar_dal_thali, protein: "12g", calories: "590 kcal" }
  },
  Wednesday: {
    Breakfast: { title: "Bread Butter Jam & Cornflakes", items: ["Amul Butter", "Tea (Ginger)", "Milk", "Banana"], image: GH_IMAGES.bread_butter_cornflakes, protein: "9g", calories: "380 kcal" },
    Lunch: { title: "Kadhi & Aloo Jeera", items: ["Chapati", "Rice", "Fried Mirchi", "Papad", "Masala Onion Laccha", "1/2 Lemon"], image: MEAL_IMAGES.kadhi_rice, protein: "13g", calories: "520 kcal" },
    Snacks: { title: "Poha / Namkeen Jave", items: ["Tomato/Green Chilli Sauce", "Roohafza"], image: MEAL_IMAGES.macaroni, protein: "6g", calories: "290 kcal" },
    Dinner: { title: "Manchoorian / Black Masoor Daal", items: ["Aloo Tikki", "Curd", "Fried Rice / Plain Rice", "Fruit Custard", "Cold Drink (Monthly)"], image: GH_IMAGES.manchurian_rice, protein: "15g", calories: "650 kcal" }
  },
  Thursday: {
    Breakfast: { title: "Plain/Methi Parantha & Aloo Jeera Dry", items: ["Tea (Ginger)", "Milk", "Papaya"], image: MEAL_IMAGES.aloo_paratha, protein: "9g", calories: "430 kcal" },
    Lunch: { title: "Arhar Daal & Lauki", items: ["Boondi Raita", "Chapati", "Rice", "Salad", "1/2 Lemon"], image: MEAL_IMAGES.aloo_matar_dal, protein: "14g", calories: "500 kcal" },
    Snacks: { title: "Macroni & Tang", items: ["Tomato/Green Chilli Sauce", "Tang"], image: MEAL_IMAGES.macaroni, protein: "6g", calories: "290 kcal" },
    Dinner: { title: "Chhole Masala & Aloo Shimla Mirch", items: ["Chapati", "Rice", "Salad", "Sweet Sewai"], image: MEAL_IMAGES.chhole_paratha, protein: "18g", calories: "630 kcal" }
  },
  Friday: {
    Breakfast: { title: "Matar Kulcha / Aloo Sandwich", items: ["Tomato Sauce", "Tea (Ginger)", "Milk", "Watermelon"], image: MEAL_IMAGES.matar_kulche, protein: "12g", calories: "420 kcal" },
    Lunch: { title: "Rajma & Aloo Jeera (Kasuri Methi)", items: ["Chapati", "Rice", "Curd", "Beetroot Salad", "1/2 Lemon"], image: MEAL_IMAGES.rajma_rice, protein: "17g", calories: "570 kcal" },
    Snacks: { title: "Papdi Chaat / Black Chana Chaat", items: ["Tomato/Green Chilli Sauce", "Coffee"], image: GH_IMAGES.papdi_chaat, protein: "7g", calories: "310 kcal" },
    Dinner: { title: "Sabut Lal Masoor Daal & Arbi Dry", items: ["Matar Mushroom (Monthly)", "Chapati", "Rice", "Nariyal Laddoo / Moong Dal Halwa", "Mix Salad"], image: MEAL_IMAGES.dal_makhani_thali, protein: "17g", calories: "660 kcal" }
  },
  Saturday: {
    Breakfast: { title: "Aloo Tomato Sabji (Bhandara)", items: ["Plain Poori / Palak Poori", "Tea (Ginger)", "Milk", "Pickle", "Papaya", "Jalebi"], image: GH_IMAGES.palak_poori, protein: "9g", calories: "510 kcal" },
    Lunch: { title: "Mix Daal & Aloo Soyabean", items: ["Chapati", "Rice", "Veg Raita", "Salad", "1/2 Lemon"], image: MEAL_IMAGES.mix_dal_taroi, protein: "16g", calories: "520 kcal" },
    Snacks: { title: "Samosa (1 Pc Big) & Tea", items: ["Saunth", "Green Chatni", "Tea"], image: MEAL_IMAGES.samosa, protein: "5g", calories: "310 kcal" },
    Dinner: { title: "Rajma & Aloo Baingan", items: ["Chapati", "Rice", "Chhachh"], image: MEAL_IMAGES.rajma_rice, protein: "17g", calories: "580 kcal" }
  },
  Sunday: {
    Breakfast: { title: "Aloo Onion Parantha", items: ["Green Chatni", "Tea (Ginger)", "Milk", "Pickle", "Watermelon"], image: MEAL_IMAGES.aloo_paratha, protein: "10g", calories: "440 kcal" },
    Lunch: { title: "Chhole Bhature & Jeera Rice", items: ["Fried Mirchi", "Masala Onion Laccha", "Cold Drink"], image: MEAL_IMAGES.chole_bhature, protein: "20g", calories: "740 kcal" },
    Snacks: { title: "Snacks OFF", items: ["Mess Kitchen Closed"], image: MEAL_IMAGES.off_snacks, protein: "0g", calories: "0 kcal" },
    Dinner: { title: "Chana Daal & Kathal", items: ["Chapati", "Rice", "Kheer", "Mix Salad"], image: GH_IMAGES.chana_dal_kathal, protein: "15g", calories: "590 kcal" }
  }
};

export const getHostelMenu = (hostelBlock) => {
  if (isGirlsHostelBlock(hostelBlock)) {
    return GIRLS_WEEKLY_MENU;
  }
  return BOYS_WEEKLY_MENU;
};

export const getTodayHostelMeals = (dayName, hostelBlock) => {
  const menuData = getHostelMenu(hostelBlock);
  const dayMenu = menuData[dayName] || menuData['Monday'];
  const mealCategories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  
  return mealCategories.map(cat => {
    const meal = dayMenu[cat] || { title: `${cat} Special`, items: [], image: '', protein: '12g', calories: '400 kcal' };
    return {
      id: `${hostelBlock || 'hostel'}_${dayName}_${cat}`.toLowerCase().replace(/\s+/g, '_'),
      name: meal.title,
      category: cat,
      day: dayName,
      description: meal.items?.join(', ') || '',
      items: meal.items || [],
      imageUrl: meal.image || '',
      protein: meal.protein || '12g',
      calories: meal.calories || '400 kcal',
      isVeg: true,
      special: meal.title.includes('Special') || meal.title.includes('Monthly')
    };
  });
};
