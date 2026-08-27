import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, ArrowLeft, Check, Send, Clock, ShieldAlert } from 'lucide-react';

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

  const hasNutrition = meal.calories > 0 || meal.protein > 0;
  const isStudent = currentRole === 'student';
  const isRatingWindowOpen = timingInfo.isRatingAllowed;
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <button
            onClick={() => setSelectedMealModal(null)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-slate-300">{meal.category}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${timingInfo.badgeColor || 'bg-slate-800'}`}>
              {timingInfo.badgeText || 'STATUS'}
            </span>
          </div>

          <button
            onClick={() => setSelectedMealModal(null)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Food Image */}
        <div className="relative h-52 w-full overflow-hidden">
          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-3 left-4 right-4 text-white flex items-end justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black">{meal.name}</h2>
              <span className="text-xs text-slate-300 font-semibold">{meal.time}</span>
            </div>

            <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1 shadow-md">
              {liveStats.rating ? (
                <>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>{liveStats.rating} ★ ({liveStats.ratingCount})</span>
                </>
              ) : (
                <span className="text-slate-300 text-[11px]">No ratings yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Nutrition Cards */}
          {hasNutrition ? (
            <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Calories</span>
                <p className="text-base font-black text-slate-900 dark:text-white">{meal.calories}</p>
                <span className="text-[9px] text-slate-400">kcal</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Protein</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{meal.protein}g</p>
                <span className="text-[9px] text-slate-400">protein</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Carbs</span>
                <p className="text-base font-black text-slate-900 dark:text-white">{meal.carbs || 0}g</p>
                <span className="text-[9px] text-slate-400">carbs</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fats</span>
                <p className="text-base font-black text-slate-900 dark:text-white">{meal.fats || 0}g</p>
                <span className="text-[9px] text-slate-400">fats</span>
              </div>
            </div>
          ) : null}

          {/* Description & Items */}
          {meal.items && (
            <div>
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Menu Items</h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{meal.items}</p>
            </div>
          )}

          {/* Timing & Rating Status Banner */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">{timingInfo.message}</span>
            </div>
            <span className="text-[10px] text-slate-400">Window: {timingInfo.ratingWindowLabel}</span>
          </div>

          {/* RATE MEAL FORM (STUDENT ONLY) */}
          {isStudent && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  {isAlreadyRated ? 'Your Rating' : 'Rate This Meal'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  +1 Health Point
                </span>
              </div>

              {isAlreadyRated ? (
                // Locked / Submitted State
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= (userExistingRating?.rating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-black text-emerald-400">Rating submitted ({userExistingRating.rating}★).</p>
                  {userExistingRating.feedback && (
                    <p className="text-[11px] text-slate-300 italic">"{userExistingRating.feedback}"</p>
                  )}
                  <span className="text-[10px] text-slate-400 block">Submitted ratings cannot be modified.</span>
                </div>
              ) : !isRatingWindowOpen ? (
                // Window Closed Notice
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-center space-y-1 text-xs text-slate-400">
                  <p className="font-bold text-slate-300">Rating is currently disabled for this meal.</p>
                  <p className="text-[11px]">Ratings are accepted strictly during meal service and for 30 minutes after ({timingInfo.ratingWindowLabel}).</p>
                </div>
              ) : (
                // Active Interactive Rating Form with SUBMIT RATING Button
                <form onSubmit={handleSubmitRating} className="space-y-3">
                  
                  {/* Star Selection */}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="flex items-center space-x-2">
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
                      {selectedStars > 0 ? `${selectedStars} / 5 Stars Selected` : 'Tap stars to select rating'}
                    </span>
                  </div>

                  {/* Quick Tags */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {['Tasty', 'Good Quality', 'Good Quantity', 'Average', 'Needs Improvement'].map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedTag === tag ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-emerald-500"
                  />

                  {errorMessage && (
                    <p className="text-xs text-rose-400 font-bold text-center">{errorMessage}</p>
                  )}

                  {submitSuccess && (
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Rating submitted.</span>
                    </div>
                  )}

                  {/* Explicit SUBMIT RATING Button */}
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
            </div>
          )}

          {/* Student Reviews List */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Community Reviews</h4>
            {((allRatings || []).filter(r => r.mealId === meal.id && r.feedback && r.feedback.trim() !== '')).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No written reviews submitted yet for this meal.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {(allRatings || [])
                  .filter(r => r.mealId === meal.id && r.feedback && r.feedback.trim() !== '')
                  .map((rev) => (
                    <div key={rev.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{rev.userName}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-black text-slate-900 dark:text-white">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{rev.feedback}</p>
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
