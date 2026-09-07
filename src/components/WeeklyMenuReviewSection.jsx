import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, Sun, UtensilsCrossed, Coffee, Moon, X, Check, Send, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Naina Caters (I & II Year Menu : ABES Boys' Hostel)
const BOYS_MENU_DATA = {
  Monday: {
    Breakfast: ["Veg Fried Idli / Plain Idli / Sambhar Bada", "Sambhar", "Coconut Chutney", "Lal Chutney", "Tea", "Milk", "Banana"],
    Lunch: ["Mix Veg", "Rajma", "Roti", "Rice", "Mix Salad", "Boondi Raita", "Lemon 1/2"],
    Snacks: ["Burger", "Sauce (Chilly & Tomato)", "Roohafza"],
    Dinner: ["Arhar Daal", "Aloo Shimla Mirch", "Rice", "Roti", "Suji Halwa", "Matar Mushroom + Moong Dal Halwa (Monthly Special)", "Chhachh"]
  },
  Tuesday: {
    Breakfast: ["Matar Kulche", "Milk", "Tea", "Watermelon"],
    Lunch: ["Tahri", "Aaloo Tamatar Sabji", "Roti", "Salad", "Curd", "Lemon 1/2", "Hari Chutney"],
    Snacks: ["Macroni", "Tomato & Chilly Sauce", "Coffee"],
    Dinner: ["Kali Masoor Dal", "Bhindi", "Rice", "Roti", "Icecream (Mango/Butterscotch/Chocolate)", "Mix Salad", "Achar"]
  },
  Wednesday: {
    Breakfast: ["Aaloo Paratha", "Pickle", "Curd", "Tea", "Muskmelon"],
    Lunch: ["Kaabli Chhole (Small)", "Kashifal", "Roti", "Jeera Rice", "Mix Salad", "Curd", "Lemon 1/2"],
    Snacks: ["Samosa", "Tomato & Chilly Sauce", "Tea"],
    Dinner: ["Butter Paneer Masala / Kadhai Paneer", "Aaloo Jeera", "Puri", "Pulaw", "Mix Salad"]
  },
  Thursday: {
    Breakfast: ["Pav Bhaji", "Tea", "Milk", "Butter", "Papaya"],
    Lunch: ["Aaloo Pyaj Sabji", "Kadhi", "Rice", "Roti", "Salad", "Papad Fried", "Lemon 1/2"],
    Snacks: ["Mix Pakodi / Bread Pakoda", "Chilli & Tomato Sauce", "Tea"],
    Dinner: ["Daal Makhani", "Mix Veg", "Roti", "Rice", "Gulab Jamun", "Chhachh", "Achar"]
  },
  Friday: {
    Breakfast: ["Gobhi Paratha", "Pickle", "Curd", "Tea", "Banana"],
    Lunch: ["Mix Daal", "Tarohi", "Roti", "Rice", "Mix Salad", "Curd", "Lemon 1/2"],
    Snacks: ["Chowmein", "Chilly & Tomato Sauce", "Hot Tea"],
    Dinner: ["Arhar Daal", "Lauki", "Rice", "Roti", "Coconut Laddoo", "Mix Salad", "Achar"]
  },
  Saturday: {
    Breakfast: ["Aaloo Tamatar Sabji", "Puri", "Mirchi", "Tea", "Jalebi", "Curd", "Watermelon"],
    Lunch: ["Chhole Kabuli (Big)", "Bhature", "Fry Mirch", "Sirka Pyaz", "Jeera Rice", "Cold Drink", "Pickle", "Veg Raita"],
    Snacks: ["Bread Roll", "Chilly & Tomato Sauce", "Tea"],
    Dinner: ["Arhar Dal", "Lauki", "Rice", "Roti", "Mix Salad", "Chhachh"]
  },
  Sunday: {
    Breakfast: ["Veg Sandwich", "Tomato Sauce", "Cornflakes", "Milk", "Tea", "Mix Fruit", "Chat Masala"],
    Lunch: ["Chhole Kabuli (Big)", "Bhature", "Fry Mirch", "Sirka Pyaz", "Jeera Rice", "Cold Drink", "Pickle", "Veg Raita"],
    Snacks: ["OFF"],
    Dinner: ["Lauki Kofta", "Arabi", "Rice", "Roti", "Chhachh", "Kheer / Sewai"]
  }
};

const GIRLS_MENU_DATA = {
  Monday: {
    Breakfast: ["Fried Idli & Sambar", "Nariyal Chatni", "Tea with Ginger", "Milk", "Banana"],
    Lunch: ["Arhar Daal", "Mix Veg Paneer", "Boondi Raita", "Rice", "Chapati", "Salad (Onion)", "1/2 Lemon"],
    Snacks: ["Bread Pakoda / Mix Pakodi", "Tomato Sauce", "Green Chatni", "Tea"],
    Dinner: ["Butter Masala / Kadhai Paneer", "Aloo Chokha", "Chapati", "Rice", "Ice Cream", "Mix Salad"]
  },
  Tuesday: {
    Breakfast: ["Aloo Onion Parantha", "Tea (Ginger)", "Milk", "Pickle", "Muskmelon / Seasonal Fruit"],
    Lunch: ["Black Chana Gravy", "Aloo Beans", "Chapati", "Rice", "Curd (Beetroot)", "Salad", "1/2 Lemon"],
    Snacks: ["Chowmein", "Tomato/Green Chilli Sauce", "Shikanji"],
    Dinner: ["Aloo Tamatar", "Bhindi", "Plain Parantha", "Rice", "Gulab Jamun", "Chhachh"]
  },
  Wednesday: {
    Breakfast: ["Bread Butter Jam & Cornflakes", "Amul Butter", "Tea (Ginger)", "Milk", "Banana"],
    Lunch: ["Kadhi", "Aloo Jeera", "Chapati", "Rice", "Fried Mirchi", "Papad", "Masala Onion Laccha", "1/2 Lemon"],
    Snacks: ["Poha / Namkeen Jave", "Tomato/Green Chilli Sauce", "Roohafza"],
    Dinner: ["Manchoorian / Black Masoor Daal", "Aloo Tikki", "Curd", "Fried Rice / Plain Rice", "Fruit Custard", "Cold Drink (Monthly)"]
  },
  Thursday: {
    Breakfast: ["Plain/Methi Parantha & Aloo Jeera Dry", "Tea (Ginger)", "Milk", "Papaya"],
    Lunch: ["Arhar Daal", "Lauki", "Boondi Raita", "Chapati", "Rice", "Salad", "1/2 Lemon"],
    Snacks: ["Macroni", "Tomato/Green Chilli Sauce", "Tang"],
    Dinner: ["Chhole Masala & Aloo Shimla Mirch", "Chapati", "Rice", "Salad", "Sweet Sewai"]
  },
  Friday: {
    Breakfast: ["Matar Kulcha / Aloo Sandwich", "Tomato Sauce", "Tea (Ginger)", "Milk", "Watermelon"],
    Lunch: ["Rajma", "Aloo Jeera (Kasuri Methi)", "Chapati", "Rice", "Curd", "Beetroot Salad", "1/2 Lemon"],
    Snacks: ["Papdi Chaat / Black Chana Chaat", "Tomato/Green Chilli Sauce", "Coffee"],
    Dinner: ["Sabut Lal Masoor Daal", "Arbi Dry", "Matar Mushroom (Monthly)", "Chapati", "Rice", "Nariyal Laddoo / Moong Dal Halwa", "Mix Salad"]
  },
  Saturday: {
    Breakfast: ["Aloo Tomato Sabji (Bhandara)", "Plain Poori / Palak Poori", "Tea (Ginger)", "Milk", "Pickle", "Papaya", "Jalebi"],
    Lunch: ["Mix Daal", "Aloo Soyabean", "Chapati", "Rice", "Veg Raita", "Salad", "1/2 Lemon"],
    Snacks: ["Samosa (1 Pc Big) & Tea", "Saunth", "Green Chatni", "Tea"],
    Dinner: ["Rajma", "Aloo Baingan", "Chapati", "Rice", "Chhachh"]
  },
  Sunday: {
    Breakfast: ["Aloo Onion Parantha", "Green Chatni", "Tea (Ginger)", "Milk", "Pickle", "Watermelon"],
    Lunch: ["Chhole Bhature", "Jeera Rice", "Fried Mirchi", "Masala Onion Laccha", "Cold Drink"],
    Snacks: ["OFF"],
    Dinner: ["Chana Daal", "Kathal", "Chapati", "Rice", "Kheer", "Mix Salad"]
  }
};

const MEAL_SLOTS = [
  { name: 'Breakfast', time: '07:20 AM - 08:30 AM', icon: Sun, color: 'text-amber-500 bg-amber-500/10' },
  { name: 'Lunch', time: '12:20 PM - 02:00 PM', icon: UtensilsCrossed, color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'Snacks', time: '05:00 PM - 06:00 PM', icon: Coffee, color: 'text-orange-500 bg-orange-500/10' },
  { name: 'Dinner', time: '07:30 PM - 09:00 PM', icon: Moon, color: 'text-indigo-500 bg-indigo-500/10' }
];

export const WeeklyMenuReviewSection = () => {
  const { currentUser } = useApp();
  const girlsHostels = ["Block A (Girls)", "Block B (Girls)", "Block C (Girls)"];
  const isGirlsHostel = currentUser && girlsHostels.includes(currentUser.hostelBlock);
  const MENU_DATA = isGirlsHostel ? GIRLS_MENU_DATA : BOYS_MENU_DATA;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // 1. Navigation States: Auto-select today
  const [selectedDay, setSelectedDay] = useState(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return days.includes(todayStr) ? todayStr : 'Monday';
  });

  const [selectedSlot, setSelectedSlot] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 18) return 'Snacks';
    return 'Dinner';
  });

  // 2. Local Ratings & Reviews Simulation State (complemented with LocalStorage)
  const [ratingsDb, setRatingsDb] = useState(() => {
    const saved = localStorage.getItem('messmates_ratings');
    if (saved) return JSON.parse(saved);
    
    // Seed default baseline ratings for a realistic look across both menus
    const initialDb = {};
    const seedMenus = [BOYS_MENU_DATA, GIRLS_MENU_DATA];
    seedMenus.forEach(menu => {
      Object.keys(menu).forEach(day => {
        Object.keys(menu[day]).forEach(slot => {
          menu[day][slot].forEach(item => {
            if (item !== 'OFF') {
              const seedRating = parseFloat((3.8 + Math.random() * 0.9).toFixed(1));
              const seedCount = Math.floor(5 + Math.random() * 25);
              initialDb[`${day}_${slot}_${item}`] = {
                rating: seedRating,
                count: seedCount,
                reviews: []
              };
            }
          });
        });
      });
    });
    return initialDb;
  });

  // Save ratingsDb changes
  useEffect(() => {
    localStorage.setItem('messmates_ratings', JSON.stringify(ratingsDb));
  }, [ratingsDb]);

  // 3. Modal / Slide-over State
  const [activeRateItem, setActiveRateItem] = useState(null); // { item, day, slot }
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);

  const handleRateClick = (item) => {
    setActiveRateItem({
      item,
      day: selectedDay,
      slot: selectedSlot
    });
    setStarRating(5);
    setReviewText('');
    setSelectedTag('');
    setShowSuccessCheck(false);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!activeRateItem) return;

    const key = `${activeRateItem.day}_${activeRateItem.slot}_${activeRateItem.item}`;
    const current = ratingsDb[key] || { rating: 0, count: 0, reviews: [] };
    
    // Calculate new average rating
    const newCount = current.count + 1;
    const newRating = parseFloat(((current.rating * current.count + starRating) / newCount).toFixed(1));
    
    // Construct review payload
    const newReview = {
      id: Math.random().toString(36).substr(2, 9),
      userName: currentUser?.name || 'Student',
      hostelBlock: currentUser?.hostelBlock || 'DNB Block',
      rating: starRating,
      reviewText: reviewText.trim(),
      tag: selectedTag,
      timestamp: new Date().toISOString()
    };

    // Update state
    setRatingsDb(prev => ({
      ...prev,
      [key]: {
        rating: newRating,
        count: newCount,
        reviews: [newReview, ...current.reviews]
      }
    }));

    // Log Firestore-structured payload
    console.log('--- FIRESTORE PAYLOAD GENERATED ---', {
      day: activeRateItem.day,
      mealType: activeRateItem.slot,
      foodItem: activeRateItem.item,
      rating: starRating,
      reviewText: reviewText.trim(),
      tag: selectedTag,
      hostelBlock: currentUser?.hostelBlock || 'DNB Block',
      submittedBy: currentUser?.uid || 'anonymous_uid',
      timestamp: new Date()
    });

    // Show visual success verification
    setShowSuccessCheck(true);
    setTimeout(() => {
      setActiveRateItem(null);
      setShowSuccessCheck(false);
    }, 1500);
  };

  const activeItems = MENU_DATA[selectedDay]?.[selectedSlot] || [];

  return (
    <div className="w-full space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>WEEKLY MENU EXPLORER</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isGirlsHostel ? "ABES Girls' Hostel Official Menu (w.e.f. 05 May 2026)" : "ABES Boys' Hostel Official Menu (Naina Caters)"} • Day-wise food item reviews
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Interactive Student Rating</span>
        </div>
      </div>

      {/* 1. DAYS NAVIGATION */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
        {days.map(day => {
          const isSelected = selectedDay === day;
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. MEAL SLOTS NAVIGATION */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {MEAL_SLOTS.map(slot => {
          const isSelected = selectedSlot === slot.name;
          const SlotIcon = slot.icon;
          
          return (
            <button
              key={slot.name}
              onClick={() => setSelectedSlot(slot.name)}
              className={`p-3.5 rounded-3xl border transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                  : 'bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`p-2 rounded-xl ${slot.color}`}>
                  <SlotIcon className="w-4 h-4" />
                </span>
                <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {slot.name}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{slot.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{slot.time}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. FOOD ITEMS GRID */}
      {activeItems.length === 1 && activeItems[0] === 'OFF' ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-2">
          <Coffee className="w-8 h-8 text-slate-400" />
          <span className="text-sm font-black text-slate-500">MESS KITCHEN IS CLOSED</span>
          <span className="text-xs text-slate-400 font-semibold">No snacks served on Sunday evening. Enjoy your holiday!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activeItems.map(item => {
            const key = `${selectedDay}_${selectedSlot}_${item}`;
            const meta = ratingsDb[key] || { rating: 4.0, count: 0, reviews: [] };
            
            return (
              <div
                key={item}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-emerald-500/20 hover:shadow-md transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {item}
                    </h4>
                    <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg whitespace-nowrap">
                      Fresh
                    </span>
                  </div>
                  
                  {/* Rating display */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">{meta.rating}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-[10px]">{meta.count} reviews</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800/80">
                  {meta.reviews.length > 0 ? (
                    <div className="flex items-center text-[10px] text-emerald-500 font-bold space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">"{meta.reviews[0].reviewText}"</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold italic">No feedback comments yet</span>
                  )}
                  
                  <button
                    onClick={() => handleRateClick(item)}
                    className="px-3.5 py-1.5 text-[10px] font-black rounded-xl bg-slate-100 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white transition-all"
                  >
                    RATE ITEM
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. RATING INTERACTIVE MODAL */}
      {activeRateItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                  {activeRateItem.day} • {activeRateItem.slot}
                </span>
                <h3 className="text-base font-extrabold leading-tight">Rate Food Item</h3>
              </div>
              <button
                onClick={() => setActiveRateItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRatingSubmit} className="p-5 space-y-4">
              
              {/* Target Item card info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item being evaluated</span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-snug">
                  {activeRateItem.item}
                </h4>
              </div>

              {showSuccessCheck ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/40">
                    <Check className="w-7 h-7" />
                  </div>
                  <h5 className="text-sm font-black text-emerald-500">Rating Saved Successfully!</h5>
                  <p className="text-[11px] text-slate-400 font-bold">Feedback logged for Firestore sync</p>
                </div>
              ) : (
                <>
                  {/* Star Rating Selection */}
                  <div className="space-y-1.5 text-center">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Food Quality Rating
                    </label>
                    <div className="flex items-center justify-center space-x-2 py-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setStarRating(star)}
                          className="p-1 hover:scale-125 transition-transform duration-200"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= starRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black">
                      {starRating === 5 ? 'Excellent!' : starRating === 4 ? 'Good Quality' : starRating === 3 ? 'Average' : starRating === 2 ? 'Sub-par' : 'Terrible'}
                    </span>
                  </div>

                  {/* Feedback Chips / Tags */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Quick tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {['Tasty', 'Too Salty', 'Oily / Greasy', 'Served Cold', 'Under-cooked', 'Clean & Fresh'].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                            selectedTag === tag
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Text Feedback */}
                  <div className="space-y-1.5">
                    <label htmlFor="feedback-input" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Add Optional Feedback
                    </label>
                    <textarea
                      id="feedback-input"
                      rows="3"
                      placeholder="Share details (e.g., roti was hard, sambhar had great spice level)..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SUBMIT RATING</span>
                  </button>
                </>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
