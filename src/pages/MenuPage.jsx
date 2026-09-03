import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealCard, WeeklyDayPicker, SectionHeader, EmptyState, Modal, RatingStars } from '../components/ui';
import { UtensilsCrossed, Star } from 'lucide-react';

export const MenuPage = () => {
  const { 
    selectedDay, 
    setSelectedDay, 
    todayDay,
    meals,
    getUserRating,
    checkIsRatingAllowed,
    rateMeal
  } = useApp();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedMealToRate, setSelectedMealToRate] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const handleRateClick = (meal) => {
    setSelectedMealToRate(meal);
    setRatingValue(getUserRating(meal.id) || 0);
    setRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!selectedMealToRate || ratingValue === 0 || ratingSubmitting) return;
    try {
      setRatingSubmitting(true);
      await rateMeal(selectedMealToRate.id, ratingValue);
      setRatingModalOpen(false);
    } catch (error) {
      console.error("Error rating meal:", error);
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <SectionHeader 
        title="Weekly Menu" 
        subtitle={`Viewing schedule for ${selectedDay}`} 
      />

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20 z-10">
        <WeeklyDayPicker 
          days={days} 
          selectedDay={selectedDay} 
          onDayChange={setSelectedDay} 
          todayDay={todayDay} 
        />
      </div>

      <div className="mt-6">
        {meals && meals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meals.map(meal => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                onRate={() => handleRateClick(meal)}
                userRating={getUserRating(meal.id)}
                showRating={selectedDay === todayDay && checkIsRatingAllowed(meal.category)}
              />
            ))}
          </div>
        ) : (
          <div className="pt-12">
            <EmptyState 
              icon={UtensilsCrossed} 
              title="No Menu Available" 
              description={`The menu for ${selectedDay} has not been published yet.`} 
            />
          </div>
        )}
      </div>

      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title={`Rate ${selectedMealToRate?.category}`}>
        <div className="space-y-6 py-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{selectedMealToRate?.name}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">How was the food? Your feedback helps improve the mess.</p>
            <RatingStars value={ratingValue} onChange={setRatingValue} size="lg" />
          </div>
          <button 
            onClick={submitRating}
            disabled={ratingValue === 0 || ratingSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
