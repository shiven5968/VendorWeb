import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  Star, 
  MapPin, 
  Sun, 
  Moon, 
  Coffee, 
  ChevronRight,
  Dumbbell,
  Vote,
  Award,
  Send,
  Check,
  Clock,
  Flame,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { WeeklyMenuReviewSection } from '../components/WeeklyMenuReviewSection';
import { resolveMenuGroup } from '../config/menuGroups';
import { formatCollegeDateDisplay, formatRatingRelativeTime } from '../utils/dateTime';
import { OFFICIAL_MEAL_TIMINGS } from '../services/mealTiming';

const MEAL_IMAGES = {
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

const GH_IMAGES = {
  fried_idli: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  black_chana_gravy: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  bread_butter_cornflakes: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  manchurian_rice: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  papdi_chaat: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  palak_poori: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  chana_dal_kathal: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
};

const BOYS_WEEKLY_MENU = {
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

const FULL_WEEKLY_MENU = BOYS_WEEKLY_MENU;

const GIRLS_WEEKLY_MENU = {
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

const getActiveMenu = (user) => {
  const girlsHostels = ["Block A (Girls)", "Block B (Girls)", "Block C (Girls)"];
  if (user && girlsHostels.includes(user.hostelBlock)) {
    return GIRLS_WEEKLY_MENU;
  }
  return BOYS_WEEKLY_MENU; // Default to Boys (DNB, VKB, RKB, ABB)
};

const getMealTiming = (mealType, selectedDay) => {
  if (selectedDay === 'Sunday' && mealType === 'Snacks') {
    return 'OFF';
  }
  return OFFICIAL_MEAL_TIMINGS[mealType]?.label || '';
};

export const StudentDashboard = () => {
  const { 
    currentUser, 
    todayDay,
    todayMeals,
    rateMeal, 
    getUserRating, 
    getMealStats, 
    setSelectedMealModal, 
    currentMessInfo,
    setCurrentPage,
    proteinTarget,
    consumedProtein,
    poll,
    currentTime,
    mealSlotInfo,
    getTimingStatus,
    checkIsRatingAllowed,
    allRatings,
    rewardPoints
  } = useApp();

  const [selectedRatingMealId, setSelectedRatingMealId] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratedSuccessNotice, setRatedSuccessNotice] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const todayDateString = formatCollegeDateDisplay(currentTime);
  const menuGroup = resolveMenuGroup(currentUser);

  const categoryStyles = {
    Breakfast: { bg: 'bg-amber-500', icon: Sun },
    Lunch: { bg: 'bg-emerald-600', icon: UtensilsCrossed },
    Snacks: { bg: 'bg-orange-500', icon: Coffee },
    Dinner: { bg: 'bg-indigo-600', icon: Moon },
  };

  const remainingProtein = Math.max(0, proteinTarget - consumedProtein);
  const proteinPercent = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));

  const getMealStatsLocal = (mealId) => {
    const mealRatings = (allRatings || []).filter(r => r.mealId === mealId);
    if (mealRatings.length === 0) {
      return { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };
    }
    const sum = mealRatings.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    const avg = parseFloat((sum / mealRatings.length).toFixed(1));
    return {
      rating: avg,
      ratingDisplay: `⭐ ${avg} (${mealRatings.length} reviews)`,
      ratingCount: mealRatings.length
    };
  };

  const activeMenu = getActiveMenu(currentUser);
  const girlsHostels = ["Block A (Girls)", "Block B (Girls)", "Block C (Girls)"];
  const isGirlsHostel = currentUser && girlsHostels.includes(currentUser.hostelBlock);

  const categoryOrder = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };
  const rawMeals = todayMeals && todayMeals.length > 0 ? todayMeals : [];
  const mealsList = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(cat => {
    const dayMenu = activeMenu[todayDay] || activeMenu['Monday'];
    const staticMeal = dayMenu[cat] || { title: `${cat} Menu`, items: [], image: '', protein: '15g', calories: '500 kcal' };
    const matchingDbMeal = rawMeals.find(m => m.category === cat);
    return {
      id: matchingDbMeal?.id || `${todayDay.toLowerCase().substring(0, 3)}_${cat.toLowerCase().substring(0, 1)}`,
      category: cat,
      name: staticMeal.title || matchingDbMeal?.name,
      items: (staticMeal.items && staticMeal.items.length > 0 ? staticMeal.items.join(', ') : matchingDbMeal?.items) || '',
      image: staticMeal.image || matchingDbMeal?.image,
      protein: (staticMeal.protein || matchingDbMeal?.protein || '14g').replace('g', ''),
      calories: (staticMeal.calories || matchingDbMeal?.calories || '520 kcal').replace(' kcal', ''),
      ...(matchingDbMeal || {})
    };
  });

  // Active rating meal slot determination
  const activeRatingMeal = mealsList.find(m => checkIsRatingAllowed(m.category));
  const defaultTargetMeal = activeRatingMeal || mealsList[0];
  const currentTargetMealId = selectedRatingMealId || defaultTargetMeal?.id || '';
  const currentTargetMeal = mealsList.find(m => m.id === currentTargetMealId) || defaultTargetMeal;

  const currentMealUserRating = currentTargetMeal ? getUserRating(currentTargetMeal.id) : null;
  const isTargetRatingAllowed = currentTargetMeal ? checkIsRatingAllowed(currentTargetMeal.category) : false;

  const handleRatingSubmit = async (e) => {
    e?.preventDefault();
    if (!currentTargetMeal || selectedStars === 0 || submittingRating || currentMealUserRating || !isTargetRatingAllowed) {
      return;
    }

    try {
      setSubmittingRating(true);
      setRatingError('');
      await rateMeal(currentTargetMeal.id, selectedStars, feedbackText, selectedTag ? [selectedTag] : []);
      setRatedSuccessNotice(true);
      setSelectedStars(0);
      setFeedbackText('');
      setSelectedTag('');
      setTimeout(() => setRatedSuccessNotice(false), 3000);
    } catch (err) {
      setRatingError(err.message || 'Rating submission failed.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      
      {/* GREETING & LOCATION (DYNAMIC STUDENT IDENTITY & COLLEGE CALENDAR) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
            alt={currentUser?.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, {currentUser?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 flex flex-wrap items-center gap-1.5">
              <span>{todayDateString}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentUser?.hostelBlock || 'DNB Block'}</span>
              {menuGroup && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    <GraduationCap className="w-3 h-3" />
                    <span>{menuGroup.label}</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {rewardPoints > 0 && (
            <button
              onClick={() => setCurrentPage('rewards')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{rewardPoints} pts</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>{currentMessInfo?.messName || 'ABES Mess'}</span>
          </div>
        </div>
      </div>

      {/* REAL-TIME MEAL SCHEDULE BANNER */}
      {mealSlotInfo && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">Current Mess State</span>
              <p className="text-xs sm:text-sm font-black text-white">{mealSlotInfo.bannerMessage}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400">Next:</span>
            <span className="text-emerald-400">{mealSlotInfo.nextMealLabel}</span>
          </div>
        </div>
      )}

      {/* TODAY'S 4 MEALS GRID (FOOD IS THE FOCUS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Today's Meals
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-500 text-white">
                {isGirlsHostel ? "GIRLS' HOSTEL MENU" : "BOYS' HOSTEL MENU"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Full day menu for {todayDay} · Tap dish to view nutrition breakdown
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('menu')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>Full Week Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mealsList.map(meal => {
            const style = categoryStyles[meal.category] || categoryStyles.Lunch;
            const CategoryIcon = style.icon;
            const timing = getTimingStatus(meal.category);
            const stats = getMealStatsLocal(meal.id);
            const myRating = getUserRating(meal.id);

            return (
              <div
                key={meal.id}
                onClick={() => setSelectedMealModal(meal)}
                className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div>
                  <div className="relative w-full overflow-hidden">
                    {meal.image ? (
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                        <Coffee className="w-8 h-8 text-orange-400 mb-1.5 opacity-80" />
                        <span className="text-xs font-black text-white">HOLIDAY OFF</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Mess closed for evening snacks</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

                    {/* Category Tag */}
                    <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full ${style.bg} text-white text-[10px] font-black flex items-center space-x-1 shadow-md`}>
                      <CategoryIcon className="w-3 h-3" />
                      <span>{meal.category}</span>
                    </span>

                    {/* Live Timing Badge */}
                    <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md ${timing.badgeColor}`}>
                      {timing.badgeText}
                    </span>

                    {/* Official Service Timing */}
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                      {getMealTiming(meal.category, todayDay)}
                    </span>

                    {/* Rating Stats */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-xl text-[10px] font-black flex items-center space-x-1 shadow-md">
                      {stats.rating ? (
                        <span>⭐ {stats.rating} ({stats.ratingCount})</span>
                      ) : (
                        <span className="text-slate-300">New Dish</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {meal.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                      {meal.items || meal.description}
                    </p>

                    <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                      <span className="text-emerald-600 dark:text-emerald-400">{meal.protein}g protein</span>
                      <span>•</span>
                      <span>{meal.calories} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                    <span>VIEW DETAILS</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>

                  <span className="text-[10px] font-bold">
                    {myRating ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatRatingRelativeTime(myRating.timestamp)} ({myRating.rating}★)
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {timing.isRatingAllowed ? 'Rating Open' : 'Rating Closed'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIME-AWARE RATING CARD: “How was your meal?” */}
      {mealsList.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">How was your meal?</h3>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              +1 Health Point per Review
            </span>
          </div>

          {/* Meal Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Meal</label>
            <select
              value={currentTargetMealId}
              onChange={(e) => {
                setSelectedRatingMealId(e.target.value);
                setSelectedStars(0);
                setRatingError('');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 outline-none"
            >
              {mealsList.map(m => {
                const isAllowed = checkIsRatingAllowed(m.category);
                const rated = getUserRating(m.id);
                return (
                  <option key={m.id} value={m.id}>
                    {m.category}: {m.name} {rated ? '(Already Rated ★)' : isAllowed ? '(Rating Open)' : '(Rating Closed)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Rating State Switch */}
          {currentMealUserRating ? (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/30 text-center space-y-1.5">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                <Check className="w-3 h-3" />
                <span>Recorded · Locked</span>
              </div>
              <p className="text-xs font-black text-emerald-400">
                {formatRatingRelativeTime(currentMealUserRating.timestamp)} ({currentMealUserRating.rating || currentMealUserRating}★).
              </p>
              <p className="text-[11px] text-slate-400">
                Ratings are recorded to improve mess quality and cannot be modified.
              </p>
            </div>
          ) : !isTargetRatingAllowed ? (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-1.5 text-xs text-slate-400">
              <p className="font-bold text-slate-300">
                Rating window for {currentTargetMeal?.category} is currently closed.
              </p>
              <p className="text-[11px]">
                Ratings are accepted strictly during meal hours and for 30 minutes after ({getTimingStatus(currentTargetMeal?.category).ratingWindowLabel}).
              </p>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-3.5">
              <div className="flex flex-col items-center justify-center space-y-1 py-1">
                <div className="flex items-center space-x-2.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSelectedStars(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= selectedStars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-slate-300">
                  {selectedStars > 0 ? `${selectedStars} / 5 Stars Selected` : 'Tap to select stars'}
                </span>
              </div>

              {/* Quick Tag Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      selectedTag === tag
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Optional Comment Input */}
              <input
                type="text"
                placeholder="Optional review comment..."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-emerald-500"
              />

              {ratingError && (
                <p className="text-xs text-rose-400 font-bold text-center">{ratingError}</p>
              )}

              {/* SUBMIT RATING Button */}
              <button
                type="submit"
                disabled={selectedStars === 0 || submittingRating}
                className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-md ${
                  selectedStars > 0 && !submittingRating
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {submittingRating ? 'SUBMITTING...' : 'SUBMIT RATING'}
              </button>
            </form>
          )}

          {ratedSuccessNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1.5 border border-emerald-500/30">
              <Check className="w-4 h-4" />
              <span>Rating submitted. +1 Health Point awarded!</span>
            </div>
          )}
        </div>
      )}

      {/* MUSCLE PASS & ACTIVE VOTING SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Muscle Pass Entry Card */}
        <div 
          onClick={() => setCurrentPage('muscle-pass')}
          className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 cursor-pointer hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Muscle Pass</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Target: {proteinTarget}g</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Consumed: <strong className="text-emerald-600 dark:text-emerald-400">{consumedProtein}g</strong></span>
              <span>Remaining: <strong className="text-slate-900 dark:text-white">{remainingProtein}g</strong></span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${proteinPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Gym Mode & Protein Diet Plans</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center">Open Section →</span>
          </div>
        </div>

        {/* Voting Poll Card */}
        <div 
          onClick={() => setCurrentPage('voting')}
          className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 cursor-pointer hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Vote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Dish Voting</h3>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Live Poll</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Vote on upcoming dishes and suggest recipe improvements democratically.
          </p>

          <div className="pt-1 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Active Student Polls</span>
            <span className="text-purple-600 dark:text-purple-400 flex items-center">Vote Now →</span>
          </div>
        </div>

      </div>

      {/* WEEKLY MENU REVIEW SECTION */}
      <WeeklyMenuReviewSection />

    </div>
  );
};
