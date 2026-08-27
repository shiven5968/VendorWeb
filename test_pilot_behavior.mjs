import { 
  OFFICIAL_MEAL_TIMINGS, 
  getMealTimingStatus, 
  isRatingAllowedForMeal, 
  getActiveAndNextMealSlot, 
  formatHourMinute 
} from './src/services/mealTiming.js';

console.log('=== TEST 1: MEAL TIMINGS & RATING WINDOWS ===');

// Helper to create a local Date at specific hours and minutes today
const createTime = (hours, minutes) => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// 1. 06:30 AM (Before Breakfast)
const t630 = createTime(6, 30);
const slot630 = getActiveAndNextMealSlot(t630);
console.log('06:30 AM Slot:', slot630);
console.assert(slot630.nextMealCategory === 'Breakfast', '06:30 AM next should be Breakfast');
console.assert(!isRatingAllowedForMeal('Breakfast', t630), '06:30 AM Breakfast rating should be closed');

// 2. 07:30 AM (During Breakfast)
const t730 = createTime(7, 30);
const b730Status = getMealTimingStatus('Breakfast', t730);
console.log('07:30 AM Breakfast Status:', b730Status);
console.assert(b730Status.status === 'LIVE', '07:30 AM Breakfast should be LIVE');
console.assert(isRatingAllowedForMeal('Breakfast', t730) === true, '07:30 AM Breakfast rating should be allowed');

// 3. 08:45 AM (Post-Breakfast Service, but within +30m rating window)
const t845 = createTime(8, 45);
const b845Status = getMealTimingStatus('Breakfast', t845);
console.log('08:45 AM Breakfast Status:', b845Status);
console.assert(b845Status.status === 'ENDED_RATING_OPEN', '08:45 AM Breakfast should be ENDED_RATING_OPEN');
console.assert(isRatingAllowedForMeal('Breakfast', t845) === true, '08:45 AM Breakfast rating should be allowed');

// 4. 09:15 AM (Breakfast rating window closed)
const t915 = createTime(9, 15);
const b915Status = getMealTimingStatus('Breakfast', t915);
console.log('09:15 AM Breakfast Status:', b915Status);
console.assert(b915Status.status === 'CLOSED', '09:15 AM Breakfast should be CLOSED');
console.assert(isRatingAllowedForMeal('Breakfast', t915) === false, '09:15 AM Breakfast rating should NOT be allowed');

// 5. 13:00 (1:00 PM - During Lunch)
const t1300 = createTime(13, 0);
const l1300Status = getMealTimingStatus('Lunch', t1300);
console.log('1:00 PM Lunch Status:', l1300Status);
console.assert(l1300Status.status === 'LIVE', '1:00 PM Lunch should be LIVE');
console.assert(isRatingAllowedForMeal('Lunch', t1300) === true, '1:00 PM Lunch rating should be allowed');

// 6. 14:15 (2:15 PM - Post-Lunch Service, within +30m rating window)
const t1415 = createTime(14, 15);
const l1415Status = getMealTimingStatus('Lunch', t1415);
console.log('2:15 PM Lunch Status:', l1415Status);
console.assert(l1415Status.status === 'ENDED_RATING_OPEN', '2:15 PM Lunch should be ENDED_RATING_OPEN');
console.assert(isRatingAllowedForMeal('Lunch', t1415) === true, '2:15 PM Lunch rating should be allowed');

// 7. 18:02 (6:02 PM - Post-Snacks Service, within +30m rating window ending 6:30 PM)
const t1802 = createTime(18, 2);
const s1802Status = getMealTimingStatus('Snacks', t1802);
console.log('6:02 PM Snacks Status:', s1802Status);
console.assert(s1802Status.status === 'ENDED_RATING_OPEN', '6:02 PM Snacks should be ENDED_RATING_OPEN');
console.assert(isRatingAllowedForMeal('Snacks', t1802) === true, '6:02 PM Snacks rating should be allowed');
console.assert(isRatingAllowedForMeal('Lunch', t1802) === false, '6:02 PM Lunch rating should be CLOSED');

// 8. 21:31 (9:31 PM - Post-Dinner, rating window closed at 9:30 PM)
const t2131 = createTime(21, 31);
const d2131Status = getMealTimingStatus('Dinner', t2131);
console.log('9:31 PM Dinner Status:', d2131Status);
console.assert(d2131Status.status === 'CLOSED', '9:31 PM Dinner should be CLOSED');
console.assert(isRatingAllowedForMeal('Dinner', t2131) === false, '9:31 PM Dinner rating should NOT be allowed');
const slot2131 = getActiveAndNextMealSlot(t2131);
console.log('9:31 PM Slot:', slot2131);
console.assert(slot2131.nextMealCategory === 'Breakfast' && slot2131.isTomorrow === true, '9:31 PM next meal should be Tomorrow Breakfast');

console.log('\nALL 8 TIMING VERIFICATION TESTS PASSED SUCCESSFULLY! ✅\n');
