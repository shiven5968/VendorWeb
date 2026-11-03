import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, ArrowLeft, Check, Send, Clock } from 'lucide-react';
import { OFFICIAL_MEAL_TIMINGS } from '../services/mealTiming';

export const MealDetailModal = () => {
  const { 
    selectedMealModal, 
    setSelectedMealModal, 
    rateMeal, 
    getUserRating, 
    getMealStats, 
    allRatings, 
    getTimingStatus, 
    currentRole 
  } = useApp();

  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!selectedMealModal) return null;

  const meal = selectedMealModal;
  const userExistingRating = getUserRating(meal.id);
  const liveStats = getMealStats ? getMealStats(meal.id) : { rating: null, ratingDisplay: 'No ratings yet', ratingCount: 0 };
  const timingInfo = getTimingStatus ? getTimingStatus(meal.category) : { isRatingAllowed: true, message: '' };

  const isSundaySnack = meal.id === 'sun_s' || (meal.day === 'Sunday' && meal.category === 'Snacks') || (meal.calories === 0 && meal.category === 'Snacks');
  const hasNutrition = (meal.calories > 0 || meal.protein > 0) && !isSundaySnack;
  const isStudent = currentRole === 'student';
  const isRatingWindowOpen = timingInfo.isRatingAllowed && !isSundaySnack;
  const isAlreadyRated = Boolean(userExistingRating);

  const handleSubmitRating = async (e) => {
    e?.preventDefault();
    if (submittingRating || selectedStars === 0 || isAlreadyRated || !isRatingWindowOpen) return;

    try {
      setSubmittingRating(true);
      setErrorMessage('');
      await rateMeal(meal.id, selectedStars, feedbackText, selectedTag ? [selectedTag] : []);
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-white dark:bg-slate-900 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedMealModal(null)}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{meal.category}</span>
            {timingInfo.isLive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Now</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setSelectedMealModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Food Image */}
        {meal.image ? (
          <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-3.5 left-4 right-4 text-white flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">{meal.name}</h2>
                <span className="text-xs text-slate-300 font-medium">{OFFICIAL_MEAL_TIMINGS[meal.category]?.label || meal.time}</span>
              </div>

              <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                {liveStats.rating ? (
                  <>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>{liveStats.rating} ({liveStats.ratingCount})</span>
                  </>
                ) : (
                  <span className="text-slate-300 text-[11px]">Unrated</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-800 text-center space-y-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{meal.name}</h2>
            <span className="text-xs text-slate-500 font-medium">{OFFICIAL_MEAL_TIMINGS[meal.category]?.label || meal.time}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Nutrition Cards */}
          {hasNutrition ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Nutritional Breakdown
                </span>
                <span className="text-[11px] text-slate-400">Standard Mess Serving</span>
              </div>
              <div className="grid grid-cols-5 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Calories</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{meal.calories}</p>
                  <span className="text-[9px] text-slate-400">kcal</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Protein</span>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{meal.protein}g</p>
                  <span className="text-[9px] text-slate-400">protein</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Carbs</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{meal.carbs || 0}g</p>
                  <span className="text-[9px] text-slate-400">carbs</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Fat</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{meal.fats ?? meal.fat ?? 0}g</p>
                  <span className="text-[9px] text-slate-400">fat</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Fiber</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{meal.fiber || 0}g</p>
                  <span className="text-[9px] text-slate-400">fiber</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calculated in accordance with ICMR-NIN IFCT standards for standardized hostel preparation.
              </p>
            </div>
          ) : isSundaySnack ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sunday Evening: Kitchen Closed</span>
              <p className="text-[11px] text-slate-400">Evening snacks are officially OFF on Sunday.</p>
            </div>
          ) : null}

          {/* Serving Size */}
          {(meal.servingUsed || meal.servingSize) && !isSundaySnack && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Serving Allocation</h4>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{meal.servingUsed || meal.servingSize}</p>
            </div>
          )}

          {/* Description & Items */}
          {meal.items && !isSundaySnack && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Items Prepared</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{meal.items}</p>
            </div>
          )}

          {/* Timing & Rating Status Banner */}
          {!isSundaySnack && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{timingInfo.message}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{timingInfo.ratingWindowLabel}</span>
            </div>
          )}

          {/* RATE MEAL FORM (STUDENT ONLY) */}
          {isStudent && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isAlreadyRated ? 'Your Rating' : 'Rate This Meal'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/20">
                  +1 Health Point
                </span>
              </div>

              {isAlreadyRated ? (
                // Locked / Submitted State
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center space-y-1.5">
                  <div className="flex items-center justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= (userExistingRating?.rating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Rating recorded ({userExistingRating.rating}★)</p>
                  {userExistingRating.feedback && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">"{userExistingRating.feedback}"</p>
                  )}
                  <span className="text-[10px] text-slate-400 block">Submitted ratings cannot be edited.</span>
                </div>
              ) : isSundaySnack ? (
                // Sunday Snack Closed Notice
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center space-y-1 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Sunday Snacks are OFF</p>
                  <p className="text-[11px]">Mess kitchen is closed on Sunday evening.</p>
                </div>
              ) : !isRatingWindowOpen ? (
                // Window Closed Notice
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-center space-y-1 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Rating currently closed</p>
                  <p className="text-[11px]">Accepted during service hours and up to 30 mins after ({timingInfo.ratingWindowLabel}).</p>
                </div>
              ) : (
                // Active Interactive Rating Form
                <form onSubmit={handleSubmitRating} className="space-y-3">
                  
                  {/* Star Selection */}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setSelectedStars(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-all ${
                              star <= selectedStars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {selectedStars > 0 ? `${selectedStars} / 5 Stars` : 'Tap stars to rate'}
                    </span>
                  </div>

                  {/* Quick Tags */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          selectedTag === tag ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Optional Comment */}
                  <input
                    type="text"
                    placeholder="Optional feedback comment..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  />

                  {errorMessage && (
                    <p className="text-xs text-rose-500 font-medium text-center">{errorMessage}</p>
                  )}

                  {submitSuccess && (
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium text-center flex items-center justify-center space-x-1">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Rating submitted.</span>
                    </div>
                  )}

                  {/* SUBMIT RATING Button */}
                  <button
                    type="submit"
                    disabled={selectedStars === 0 || submittingRating}
                    className={`w-full py-2.5 rounded-xl font-medium text-xs transition-colors ${
                      selectedStars > 0 && !submittingRating
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {submittingRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Student Reviews List */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Community Reviews</h4>
            {((allRatings || []).filter(r => r.mealId === meal.id && r.feedback && r.feedback.trim() !== '')).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No written reviews submitted yet for this meal.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {(allRatings || [])
                  .filter(r => r.mealId === meal.id && r.feedback && r.feedback.trim() !== '')
                  .map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{rev.userName}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{rev.feedback}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
