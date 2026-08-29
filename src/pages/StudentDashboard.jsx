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
  ShieldCheck
} from 'lucide-react';
import { WeeklyMenuReviewSection } from '../components/WeeklyMenuReviewSection';

const MEAL_IMAGES = {
  // Breakfasts
  idli_sambhar: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  matar_kulche: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  aloo_paratha: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
  pav_bhaji: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
  puri_aloo_jalebi: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  aloo_sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",

  // Lunches
  rajma_rice: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  tahri_pulao: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  chhole_rice: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  kadhi_rice: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  aloo_matar_dal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  mix_dal_taroi: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  chole_bhature: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80",

  // Snacks
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  macaroni: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  samosa: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  pakoda: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  chowmein: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  bread_roll: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
  off_snacks: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",

  // Dinners
  arhar_dal_thali: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  kali_masoor_icecream: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  butter_paneer_puri: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  dal_makhani_thali: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  chhole_paratha: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  lauki_kofta_kheer: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
};

const FULL_WEEKLY_MENU = {
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
    Breakfast: { title: "Aaloo Paratha & Muskmelon", items: ["Pickle", "Curd", "Tea", "Muskmelon"], image: MEAL_IMAGES.aloo_paratha, protein: "10g", calories: "450 kcal" },
    Lunch: { title: "Kaabli Chhole & Kashifal", items: ["Roti", "Jeera Rice", "Mix Salad", "Curd", "Lemon 1/2"], image: MEAL_IMAGES.chhole_rice, protein: "17g", calories: "560 kcal" },
    Snacks: { title: "Samosa & Tea", items: ["Samosa", "Tomato & Chilly Sauce", "Tea"], image: MEAL_IMAGES.samosa, protein: "5g", calories: "310 kcal" },
    Dinner: { title: "Butter Paneer Masala / Kadhai Paneer", items: ["Aaloo Jeera", "Puri", "Pulaw", "Mix Salad"], image: MEAL_IMAGES.butter_paneer_puri, protein: "22g", calories: "690 kcal" }
  },
  Thursday: {
    Breakfast: { title: "Pav Bhaji & Papaya", items: ["Pav Bhaji", "Tea", "Milk", "Butter", "Papaya"], image: MEAL_IMAGES.pav_bhaji, protein: "9g", calories: "420 kcal" },
    Lunch: { title: "Kadhi Pakoda & Aaloo Pyaj Sabji", items: ["Rice", "Roti", "Salad", "Papad Fried", "Lemon 1/2"], image: MEAL_IMAGES.kadhi_rice, protein: "13g", calories: "540 kcal" },
    Snacks: { title: "Mix Pakodi / Bread Pakoda", items: ["Chilli & Tomato Sauce", "Tea"], image: MEAL_IMAGES.pakoda, protein: "6g", calories: "330 kcal" },
    Dinner: { title: "Daal Makhani & Mix Veg", items: ["Roti", "Rice", "Gulab Jamun", "Chhachh", "Achar"], image: MEAL_IMAGES.dal_makhani_thali, protein: "18g", calories: "670 kcal" }
  },
  Friday: {
    Breakfast: { title: "Aaloo Paratha & Curd", items: ["Pickle", "Tea", "Banana"], image: MEAL_IMAGES.aloo_paratha, protein: "10g", calories: "450 kcal" },
    Lunch: { title: "Aaloo Matar Jeera & Arhar Daal", items: ["Roti", "Rice", "Mix Salad", "Boondi Raita", "Lemon 1/2"], image: MEAL_IMAGES.aloo_matar_dal, protein: "15g", calories: "550 kcal" },
    Snacks: { title: "Chowmein & Shikanji", items: ["Chilly & Tomato Sauce", "Shikanji"], image: MEAL_IMAGES.chowmein, protein: "7g", calories: "340 kcal" },
    Dinner: { title: "Chhole & Dam Aaloo", items: ["Rice", "Plain Paratha", "Custard", "Mix Salad", "Achar"], image: MEAL_IMAGES.chhole_paratha, protein: "19g", calories: "640 kcal" }
  },
  Saturday: {
    Breakfast: { title: "Puri Aaloo & Jalebi", items: ["Aaloo Tamatar Sabji", "Puri", "Mirchi", "Tea", "Jalebi", "Curd", "Watermelon"], image: MEAL_IMAGES.puri_aloo_jalebi, protein: "8g", calories: "520 kcal" },
    Lunch: { title: "Mix Dal & Taroi", items: ["Roti", "Rice", "Mix Salad", "Curd", "Lemon 1/2"], image: MEAL_IMAGES.mix_dal_taroi, protein: "14g", calories: "490 kcal" },
    Snacks: { title: "Bread Roll & Tea", items: ["Chilly & Tomato Sauce", "Tea"], image: MEAL_IMAGES.bread_roll, protein: "6g", calories: "280 kcal" },
    Dinner: { title: "Arhar Dal & Lauki", items: ["Rice", "Roti", "Mix Salad", "Chhachh"], image: MEAL_IMAGES.arhar_dal_thali, protein: "15g", calories: "510 kcal" }
  },
  Sunday: {
    Breakfast: { title: "Aaloo Sandwich & Cornflakes", items: ["Tomato Sauce", "Milk", "Tea", "Mix Fruit", "Chat Masala"], image: MEAL_IMAGES.aloo_sandwich, protein: "11g", calories: "390 kcal" },
    Lunch: { title: "Chhole Bhature (Big Kabuli)", items: ["Fry Mirch", "Sirka Pyaz", "Jeera Rice", "Cold Drink", "Pickle", "Veg Raita"], image: MEAL_IMAGES.chole_bhature, protein: "21g", calories: "750 kcal" },
    Snacks: { title: "Snacks OFF", items: ["Mess Kitchen Closed for Evening Snacks"], image: MEAL_IMAGES.off_snacks, protein: "0g", calories: "0 kcal" },
    Dinner: { title: "Lauki Kofta & Arabi", items: ["Rice", "Roti", "Chhachh", "Kheer / Sewai"], image: MEAL_IMAGES.lauki_kofta_kheer, protein: "14g", calories: "580 kcal" }
  }
};

const getMealTiming = (mealType, selectedDay) => {
  const isWeekend = ['Saturday', 'Sunday'].includes(selectedDay);
  if (mealType === 'Breakfast') {
    return isWeekend ? '08:00 AM - 09:00 AM' : '07:30 AM - 08:30 AM';
  }
  if (mealType === 'Lunch') {
    return isWeekend ? '12:30 PM - 02:00 PM' : '12:20 PM - 02:00 PM';
  }
  if (mealType === 'Snacks') {
    return selectedDay === 'Sunday' ? 'OFF' : '05:00 PM - 06:00 PM';
  }
  if (mealType === 'Dinner') {
    return '07:30 PM - 09:00 PM';
  }
  return '';
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
    allRatings
  } = useApp();

  const [selectedRatingMealId, setSelectedRatingMealId] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratedSuccessNotice, setRatedSuccessNotice] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const todayDateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

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

  const categoryOrder = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };
  const rawMeals = todayMeals && todayMeals.length > 0 ? todayMeals : [];
  const mealsList = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(cat => {
    const dayMenu = FULL_WEEKLY_MENU[todayDay] || FULL_WEEKLY_MENU['Monday'];
    const staticMeal = dayMenu[cat];
    const matchingDbMeal = rawMeals.find(m => m.category === cat);
    return {
      id: matchingDbMeal?.id || `${todayDay.toLowerCase().substring(0, 3)}_${cat.toLowerCase().substring(0, 1)}`,
      category: cat,
      name: staticMeal.title,
      items: staticMeal.items.join(', '),
      image: staticMeal.image,
      protein: staticMeal.protein.replace('g', ''),
      calories: staticMeal.calories.replace(' kcal', ''),
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
      
      {/* GREETING & LOCATION (DYNAMIC NAME & REAL TIME) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
            alt={currentUser?.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, {currentUser?.name || 'Student'} 👋
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {todayDateString} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentUser?.hostelBlock || 'DNB Block'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
          <MapPin className="w-4 h-4 text-emerald-500" />
          <span>{currentMessInfo.messName}</span>
        </div>
      </div>

      {/* REAL-TIME MEAL SCHEDULE BANNER */}
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

      {/* TODAY'S MENU (TIME-AWARE STATUS BADGES) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>TODAY'S MENU</span>
            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-500 text-white">LIVE SCHEDULE</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">{todayDay}</span>
        </div>

        {mealsList.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No menu items scheduled for today yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealsList.map(meal => {
              const myRating = getUserRating(meal.id);
              const stats = getMealStatsLocal(meal.id);
              const timing = getTimingStatus(meal.category);
              const style = categoryStyles[meal.category] || categoryStyles.Lunch;
              const CategoryIcon = style.icon;

              return (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealModal(meal)}
                  className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div>
                    <div className="relative w-full overflow-hidden">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                      {/* Category Tag */}
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full ${style.bg} text-white text-[10px] font-black flex items-center space-x-1 shadow-md`}>
                        <CategoryIcon className="w-3 h-3" />
                        <span>{meal.category}</span>
                      </span>

                      {/* Live Timing Badge */}
                      <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md ${timing.badgeColor}`}>
                        {timing.badgeText}
                      </span>

                      {/* Official Service Timing */}
                      <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                        {getMealTiming(meal.category, todayDay)}
                      </span>

                      {/* Rating Stats */}
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-0.5 rounded-xl text-[10px] font-black flex items-center space-x-1 shadow-md">
                        {stats.rating ? (
                          <span>⭐ {stats.rating} ({stats.ratingCount} reviews)</span>
                        ) : (
                          <span className="text-slate-300">No ratings yet</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {meal.name}
                      </h3>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                        {meal.items || meal.description}
                      </p>

                      <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                        <span className="text-emerald-600 dark:text-emerald-400">{meal.protein}g protein</span>
                        <span>•</span>
                        <span>{meal.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>VIEW DETAILS</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>

                    <span className="text-[10px] text-slate-400 font-bold">
                      {myRating ? `Rated ${myRating.rating}★` : timing.isRatingAllowed ? 'Rating Open' : 'Rating Closed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
            // Already Rated & Locked State
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-1">
              <p className="text-xs font-black text-emerald-400">
                You have already submitted a rating for this meal ({currentMealUserRating.rating}★).
              </p>
              <p className="text-[11px] text-slate-400">
                Ratings are final to prevent duplicate points and score manipulation.
              </p>
            </div>
          ) : !isTargetRatingAllowed ? (
            // Rating Window Closed State
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-1.5 text-xs text-slate-400">
              <p className="font-bold text-slate-300">
                Rating window for {currentTargetMeal?.category} is currently closed.
              </p>
              <p className="text-[11px]">
                Ratings are accepted strictly during meal hours and for 30 minutes after ({getTimingStatus(currentTargetMeal?.category).ratingWindowLabel}).
              </p>
            </div>
          ) : (
            // Active Rating Submission Form with Explicit SUBMIT RATING Button
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              
              {/* Star Selection with Clear Visual Feedback */}
              <div className="flex flex-col items-center justify-center space-y-1 py-1">
                <div className="flex items-center space-x-3">
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
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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

              {/* Explicit SUBMIT RATING Button */}
              <button
                type="submit"
                disabled={selectedStars === 0 || submittingRating}
                className={`w-full py-3 rounded-xl font-black text-xs transition-all shadow-md ${
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
        
        {/* Dedicated Muscle Pass Entry Card */}
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
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

        {/* Dedicated Voting Poll Card */}
        <div 
          onClick={() => setCurrentPage('voting')}
          className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 cursor-pointer hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Vote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Monthly Mess Voting</h3>
            </div>
            {poll ? (
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{poll.totalVotes} Votes</span>
            ) : null}
          </div>

          {poll ? (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Replace: <strong className="text-amber-500">{poll.dishToReplace}</strong>
              </p>
              {poll.options.slice(0, 2).map(opt => (
                <div key={opt.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-bold">
                  <span>{opt.name}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{opt.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-3 text-center text-xs font-bold text-slate-400">
              No active voting polls right now.
            </div>
          )}

          <div className="pt-1 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>+10 Health Points per vote</span>
            <span className="text-purple-600 dark:text-purple-400 flex items-center">Cast Vote →</span>
          </div>
        </div>

      </div>

      {/* WEEKLY MENU EXPLORER & FOOD RATINGS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <WeeklyMenuReviewSection />
      </div>

    </div>
  );
};
