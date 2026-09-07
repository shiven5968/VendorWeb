/**
 * Official ABES EC Mess Timings & Rating Windows Service
 * 
 * Timings:
 * - BREAKFAST: 7:20 AM – 8:30 AM  | Rating window: 7:20 AM – 9:00 AM (+30 min)
 * - LUNCH:     12:20 PM – 2:00 PM | Rating window: 12:20 PM – 2:30 PM (+30 min)
 * - SNACKS:    5:00 PM – 6:00 PM  | Rating window: 5:00 PM – 6:30 PM (+30 min)
 * - DINNER:    7:30 PM – 9:00 PM  | Rating window: 7:30 PM – 9:30 PM (+30 min)
 */

export const OFFICIAL_MEAL_TIMINGS = {
  Breakfast: {
    category: 'Breakfast',
    name: 'Breakfast',
    startHour: 7,
    startMinute: 20,
    endHour: 8,
    endMinute: 30,
    ratingEndHour: 9,
    ratingEndMinute: 0,
    label: '7:20 AM – 8:30 AM',
    ratingWindowLabel: '7:20 AM – 9:00 AM',
    serviceWindow: '07:20 - 08:30',
    ratingWindow: '07:20 - 09:00'
  },
  Lunch: {
    category: 'Lunch',
    name: 'Lunch',
    startHour: 12,
    startMinute: 20,
    endHour: 14,
    endMinute: 0,
    ratingEndHour: 14,
    ratingEndMinute: 30,
    label: '12:20 PM – 2:00 PM',
    ratingWindowLabel: '12:20 PM – 2:30 PM',
    serviceWindow: '12:20 - 14:00',
    ratingWindow: '12:20 - 14:30'
  },
  Snacks: {
    category: 'Snacks',
    name: 'Snacks',
    startHour: 17,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    ratingEndHour: 18,
    ratingEndMinute: 30,
    label: '5:00 PM – 6:00 PM',
    ratingWindowLabel: '5:00 PM – 6:30 PM',
    serviceWindow: '17:00 - 18:00',
    ratingWindow: '17:00 - 18:30'
  },
  Dinner: {
    category: 'Dinner',
    name: 'Dinner',
    startHour: 19,
    startMinute: 30,
    endHour: 21,
    endMinute: 0,
    ratingEndHour: 21,
    ratingEndMinute: 30,
    label: '7:30 PM – 9:00 PM',
    ratingWindowLabel: '7:30 PM – 9:30 PM',
    serviceWindow: '19:30 - 21:00',
    ratingWindow: '19:30 - 21:30'
  }
};

export const MEAL_ORDER = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export const MEAL_ORDER_MAP = {
  'breakfast': 1,
  'lunch': 2,
  'snacks': 3,
  'snack': 3,
  'dinner': 4
};

/**
 * Get numerical index (1 to 4) for consistent meal category sorting.
 */
export const getMealOrderIndex = (category) => {
  const normalized = (category || '').toLowerCase().trim();
  return MEAL_ORDER_MAP[normalized] || 99;
};

/**
 * Centrally sorts any meal list in strict official order:
 * 1. BREAKFAST -> 2. LUNCH -> 3. SNACKS -> 4. DINNER
 */
export const sortMealsByOfficialOrder = (mealsList = []) => {
  if (!Array.isArray(mealsList)) return [];
  return [...mealsList].sort((a, b) => {
    const orderA = getMealOrderIndex(a.category);
    const orderB = getMealOrderIndex(b.category);
    return orderA - orderB;
  });
};

/**
 * Convert hours and minutes to minutes from midnight
 */
export const toMinutes = (hours, minutes) => hours * 60 + minutes;

/**
 * Get current time in minutes from midnight for a given Date object (local timezone)
 */
export const getCurrentMinutes = (date = new Date()) => {
  return date.getHours() * 60 + date.getMinutes();
};

/**
 * Get precise real-time status of a specific meal category
 * 
 * Possible status values:
 * - 'LIVE': Meal service is active right now (Rating allowed)
 * - 'ENDED_RATING_OPEN': Meal service ended, but +30 min grace rating window is open (Rating allowed)
 * - 'UPCOMING': Meal is scheduled for later today (Rating disabled)
 * - 'CLOSED': Meal rating window has ended for today (Rating disabled)
 */
export const getMealTimingStatus = (category, now = new Date()) => {
  const config = OFFICIAL_MEAL_TIMINGS[category];
  if (!config) {
    return {
      status: 'CLOSED',
      isLive: false,
      isRatingAllowed: false,
      label: 'Closed',
      message: 'Not active'
    };
  }

  const curMin = getCurrentMinutes(now);
  const startMin = toMinutes(config.startHour, config.startMinute);
  const endMin = toMinutes(config.endHour, config.endMinute);
  const ratingEndMin = toMinutes(config.ratingEndHour, config.ratingEndMinute);

  if (curMin < startMin) {
    return {
      status: 'UPCOMING',
      isLive: false,
      isRatingAllowed: false,
      badgeText: 'UPCOMING',
      badgeColor: 'bg-slate-700 text-slate-200',
      label: config.label,
      ratingWindowLabel: config.ratingWindowLabel,
      message: `Rating opens at ${formatHourMinute(config.startHour, config.startMinute)}`
    };
  }

  if (curMin >= startMin && curMin <= endMin) {
    return {
      status: 'LIVE',
      isLive: true,
      isRatingAllowed: true,
      badgeText: 'LIVE NOW',
      badgeColor: 'bg-emerald-500 text-white animate-pulse',
      label: config.label,
      ratingWindowLabel: config.ratingWindowLabel,
      message: `Live service • Rating open until ${formatHourMinute(config.ratingEndHour, config.ratingEndMinute)}`
    };
  }

  if (curMin > endMin && curMin <= ratingEndMin) {
    return {
      status: 'ENDED_RATING_OPEN',
      isLive: false,
      isRatingAllowed: true,
      badgeText: 'RATING OPEN',
      badgeColor: 'bg-amber-500 text-white',
      label: config.label,
      ratingWindowLabel: config.ratingWindowLabel,
      message: `Service ended • Rating closes at ${formatHourMinute(config.ratingEndHour, config.ratingEndMinute)}`
    };
  }

  return {
    status: 'CLOSED',
    isLive: false,
    isRatingAllowed: false,
    badgeText: 'RATING CLOSED',
    badgeColor: 'bg-slate-800/80 text-slate-400',
    label: config.label,
    ratingWindowLabel: config.ratingWindowLabel,
    message: `Rating window closed for today (${config.ratingWindowLabel})`
  };
};

/**
 * Helper to check if rating is allowed right now for a meal
 */
export const isRatingAllowedForMeal = (category, now = new Date()) => {
  const status = getMealTimingStatus(category, now);
  return status.isRatingAllowed;
};

/**
 * Format 24-hour hour & minute into human-readable 12-hour AM/PM string
 */
export const formatHourMinute = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute < 10 ? `0${minute}` : minute;
  return `${displayHour}:${displayMinute} ${period}`;
};

/**
 * Determine the current active meal slot and next upcoming meal slot in real-time
 */
export const getActiveAndNextMealSlot = (now = new Date()) => {
  const curMin = getCurrentMinutes(now);

  const bStart = toMinutes(7, 20);
  const bRatingEnd = toMinutes(9, 0);

  const lStart = toMinutes(12, 20);
  const lRatingEnd = toMinutes(14, 30);

  const sStart = toMinutes(17, 0);
  const sRatingEnd = toMinutes(18, 30);

  const dStart = toMinutes(19, 30);
  const dRatingEnd = toMinutes(21, 30);

  // 1. Before Breakfast (Midnight – 7:20 AM)
  if (curMin < bStart) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Breakfast',
      nextMealLabel: 'Breakfast (7:20 AM)',
      isTomorrow: false,
      bannerMessage: 'Breakfast starts at 7:20 AM'
    };
  }

  // 2. Breakfast Window (7:20 AM – 9:00 AM)
  if (curMin <= bRatingEnd) {
    return {
      currentMealCategory: curMin <= toMinutes(8, 30) ? 'Breakfast' : null,
      activeRatingCategory: 'Breakfast',
      nextMealCategory: 'Lunch',
      nextMealLabel: 'Lunch (12:20 PM)',
      isTomorrow: false,
      bannerMessage: curMin <= toMinutes(8, 30) 
        ? 'Breakfast is LIVE • Rating Open' 
        : 'Breakfast ended • Rating open until 9:00 AM'
    };
  }

  // 3. Post-Breakfast to Pre-Lunch (9:00 AM – 12:20 PM)
  if (curMin < lStart) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Lunch',
      nextMealLabel: 'Lunch (12:20 PM)',
      isTomorrow: false,
      bannerMessage: 'Lunch starts at 12:20 PM'
    };
  }

  // 4. Lunch Window (12:20 PM – 2:30 PM)
  if (curMin <= lRatingEnd) {
    return {
      currentMealCategory: curMin <= toMinutes(14, 0) ? 'Lunch' : null,
      activeRatingCategory: 'Lunch',
      nextMealCategory: 'Snacks',
      nextMealLabel: 'Snacks (5:00 PM)',
      isTomorrow: false,
      bannerMessage: curMin <= toMinutes(14, 0) 
        ? 'Lunch is LIVE • Rating Open' 
        : 'Lunch ended • Rating open until 2:30 PM'
    };
  }

  // 5. Post-Lunch to Pre-Snacks (2:30 PM – 5:00 PM)
  if (curMin < sStart) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Snacks',
      nextMealLabel: 'Snacks (5:00 PM)',
      isTomorrow: false,
      bannerMessage: 'Evening Snacks start at 5:00 PM'
    };
  }

  // 6. Snacks Window (5:00 PM – 6:30 PM)
  if (curMin <= sRatingEnd) {
    return {
      currentMealCategory: curMin <= toMinutes(18, 0) ? 'Snacks' : null,
      activeRatingCategory: 'Snacks',
      nextMealCategory: 'Dinner',
      nextMealLabel: 'Dinner (7:30 PM)',
      isTomorrow: false,
      bannerMessage: curMin <= toMinutes(18, 0) 
        ? 'Evening Snacks are LIVE • Rating Open' 
        : 'Snacks ended • Rating open until 6:30 PM'
    };
  }

  // 7. Post-Snacks to Pre-Dinner (6:30 PM – 7:30 PM)
  if (curMin < dStart) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Dinner',
      nextMealLabel: 'Dinner (7:30 PM)',
      isTomorrow: false,
      bannerMessage: 'Dinner starts at 7:30 PM'
    };
  }

  // 8. Dinner Window (7:30 PM – 9:30 PM)
  if (curMin <= dRatingEnd) {
    return {
      currentMealCategory: curMin <= toMinutes(21, 0) ? 'Dinner' : null,
      activeRatingCategory: 'Dinner',
      nextMealCategory: 'Breakfast',
      nextMealLabel: "Tomorrow's Breakfast (7:20 AM)",
      isTomorrow: true,
      bannerMessage: curMin <= toMinutes(21, 0) 
        ? 'Dinner is LIVE • Rating Open' 
        : 'Dinner ended • Rating open until 9:30 PM'
    };
  }

  // 9. Post-Dinner (9:30 PM – Midnight)
  return {
    currentMealCategory: null,
    activeRatingCategory: null,
    nextMealCategory: 'Breakfast',
    nextMealLabel: "Tomorrow's Breakfast (7:20 AM)",
    isTomorrow: true,
    bannerMessage: "All meals concluded for today • Tomorrow's Breakfast at 7:20 AM"
  };
};
