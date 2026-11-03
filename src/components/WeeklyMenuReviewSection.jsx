import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, Sun, UtensilsCrossed, Coffee, Moon, X, Check, Send, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { getMessForStudent, isGirlsHostelBlock } from '../config/menuGroups';
import { getMenuByMessId } from '../data/hostelMenus';

const MEAL_SLOTS = [
  { name: 'Breakfast', time: '07:20 AM - 08:30 AM', icon: Sun, color: 'text-amber-500 bg-amber-500/10' },
  { name: 'Lunch', time: '12:20 PM - 02:00 PM', icon: UtensilsCrossed, color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'Snacks', time: '05:00 PM - 06:00 PM', icon: Coffee, color: 'text-orange-500 bg-orange-500/10' },
  { name: 'Dinner', time: '07:30 PM - 09:00 PM', icon: Moon, color: 'text-indigo-500 bg-indigo-500/10' }
];

export const WeeklyMenuReviewSection = () => {
  const { currentUser } = useApp();
  const studentMess = getMessForStudent(currentUser);
  const fallbackMenuId = isGirlsHostelBlock(currentUser?.hostelBlock || currentUser?.block) ? 'girls' : 'boys_junior';
  const weeklyMenu = getMenuByMessId(studentMess ? (studentMess.menuId || studentMess.id) : fallbackMenuId);

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
    
    // Seed default baseline ratings for a realistic look across all 3 menus
    const initialDb = {};
    const seedMessIds = ['boys_junior', 'boys_senior', 'girls'];
    seedMessIds.forEach(messId => {
      const menu = getMenuByMessId(messId);
      if (!menu) return;
      Object.keys(menu).forEach(day => {
        Object.keys(menu[day]).forEach(slot => {
          (menu[day][slot]?.items || []).forEach(item => {
            if (item && item !== 'OFF') {
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

    // Show visual success verification
    setShowSuccessCheck(true);
    setTimeout(() => {
      setActiveRateItem(null);
      setShowSuccessCheck(false);
    }, 1500);
  };

  const activeMeal = weeklyMenu ? weeklyMenu[selectedDay]?.[selectedSlot] : null;
  const activeItems = activeMeal?.items || [];

  return (
    <div className="w-full space-y-5">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Weekly Menu Explorer</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {studentMess ? `${studentMess.label} ${studentMess.caterer ? `(${studentMess.caterer}, W.E.F. ${studentMess.effectiveDate})` : ''} · Verified hostel preparation schedule` : 'Official hostel mess schedule · Verified preparation schedule'}
          </p>
        </div>
        
        <div className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Interactive Dish Rating</span>
        </div>
      </div>

      {/* 1. DAYS NAVIGATION */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {days.map(day => {
          const isSelected = selectedDay === day;
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
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
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between space-y-2.5 cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`p-1.5 rounded-lg ${slot.color}`}>
                  <SlotIcon className="w-3.5 h-3.5" />
                </span>
                <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md ${
                  isSelected ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {slot.name}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{slot.name}</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{slot.time}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. FOOD ITEMS GRID */}
      {activeItems.length === 1 && activeItems[0] === 'OFF' ? (
        <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5">
          <Coffee className="w-6 h-6 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mess Kitchen Closed</span>
          <span className="text-[11px] text-slate-400">Snacks are OFF on Sunday evening</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeItems.map(item => {
            const key = `${selectedDay}_${selectedSlot}_${item}`;
            const meta = ratingsDb[key] || { rating: 4.0, count: 0, reviews: [] };
            
            return (
              <div
                key={item}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 hover:shadow-sm transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {item}
                    </h4>
                    <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md whitespace-nowrap">
                      Fresh
                    </span>
                  </div>
                  
                  {/* Rating display */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{meta.rating}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[11px]">{meta.count} reviews</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {meta.reviews.length > 0 ? (
                    <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">"{meta.reviews[0].reviewText}"</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No comments yet</span>
                  )}
                  
                  <button
                    onClick={() => handleRateClick(item)}
                    className="px-3 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Rate item
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. RATING INTERACTIVE MODAL */}
      {activeRateItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  {activeRateItem.day} • {activeRateItem.slot}
                </span>
                <h3 className="text-base font-semibold leading-tight text-white">Rate Food Item</h3>
              </div>
              <button
                onClick={() => setActiveRateItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRatingSubmit} className="p-5 space-y-4">
              
              {/* Target Item card info */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Item being evaluated</span>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5 leading-snug">
                  {activeRateItem.item}
                </h4>
              </div>

              {showSuccessCheck ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Rating Recorded</h5>
                  <p className="text-xs text-slate-400">Feedback synced to community ledger</p>
                </div>
              ) : (
                <>
                  {/* Star Rating Selection */}
                  <div className="space-y-1.5 text-center">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Food Quality Rating
                    </label>
                    <div className="flex items-center justify-center space-x-1.5 py-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setStarRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 transition-all ${
                              star <= starRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {starRating === 5 ? 'Excellent' : starRating === 4 ? 'Good Quality' : starRating === 3 ? 'Average' : starRating === 2 ? 'Sub-par' : 'Needs Improvement'}
                    </span>
                  </div>

                  {/* Feedback Chips / Tags */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block text-center">
                      Quick tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {['Tasty', 'Too Salty', 'Oily / Greasy', 'Served Cold', 'Under-cooked', 'Clean & Fresh'].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            selectedTag === tag
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Text Feedback */}
                  <div className="space-y-1">
                    <label htmlFor="feedback-input" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      id="feedback-input"
                      rows="3"
                      placeholder="Share details (e.g., roti was tender, spice level was balanced)..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none placeholder:text-slate-400"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-none"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Rating</span>
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
