import {
  getCollegeTimeParts,
  getCollegeDayName,
  getCollegeDateOffsetString,
  getCollegeDayNameWithOffset,
  formatCollegeDateWithOffset,
  toCollegeDate
} from '../utils/dateTime.js';

/**
 * Official ABES EC Mess Timings & Rating Windows Service (Asia/Kolkata IST)
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
    name: 'Evening Snacks',
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
  breakfast: 1,
  lunch: 2,
  snacks: 3,
  snack: 3,
  dinner: 4
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
 * Get current time in minutes from midnight strictly in Asia/Kolkata timezone
 */
export const getCurrentMinutes = (date = new Date()) => {
  const { hour, minute } = getCollegeTimeParts(toCollegeDate(date));
  return hour * 60 + minute;
};

const getSlotBounds = (config) => ({
  startMin: toMinutes(config.startHour, config.startMinute),
  endMin: toMinutes(config.endHour, config.endMinute),
  ratingEndMin: toMinutes(
    config.ratingEndHour ?? config.endHour,
    config.ratingEndMinute ?? config.endMinute
  )
});

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
 * Get precise real-time status of a specific meal category in Asia/Kolkata.
 *
 * Possible status values:
 * - 'LIVE': Meal service is active right now (Rating allowed)
 * - 'ENDED_RATING_OPEN': Meal service ended, but +30 min grace rating window is open (Rating allowed)
 * - 'UPCOMING': Meal is scheduled for later (Rating disabled)
 * - 'CLOSED': Meal rating window has ended or kitchen OFF (Rating disabled)
 *
 * Normalized Home card display statuses ('Currently Serving' | 'Upcoming' | 'Completed' | 'Not Available' | 'Next Day'):
 * exposed via `displayStatus`.
 */
export const getMealTimingStatus = (category, now = new Date(), options = {}) => {
  const timings = options.timingsConfig || OFFICIAL_MEAL_TIMINGS;
  const collegeNow = toCollegeDate(now);
  const targetDayName = options.dayName || getCollegeDayName(collegeNow);
  const isSunday = targetDayName === 'Sunday';

  // Sunday Snacks is strictly OFF (Kitchen Closed)
  if (category === 'Snacks' && isSunday) {
    return {
      status: 'CLOSED',
      displayStatus: 'Not Available',
      isLive: false,
      isRatingAllowed: false,
      badgeText: 'OFF',
      badgeColor: 'bg-slate-800/80 text-slate-300',
      label: 'OFF',
      ratingWindowLabel: 'OFF',
      message: 'Snacks are OFF on Sunday evening'
    };
  }

  const config = timings[category];
  if (!config) {
    return {
      status: 'CLOSED',
      displayStatus: 'Not Available',
      isLive: false,
      isRatingAllowed: false,
      label: 'Closed',
      message: 'Not active'
    };
  }

  if (options.isNextDay) {
    const startLabel = formatHourMinute(config.startHour, config.startMinute);
    return {
      status: 'UPCOMING',
      displayStatus: 'Next Day',
      isLive: false,
      isRatingAllowed: false,
      badgeText: options.isPrimary ? 'NEXT UP TOMORROW' : 'NEXT DAY',
      badgeColor: options.isPrimary ? 'bg-emerald-600 text-white' : 'bg-indigo-600/90 text-white',
      label: config.label,
      ratingWindowLabel: config.ratingWindowLabel,
      message: `Scheduled for ${targetDayName} at ${startLabel}`
    };
  }

  const curMin = getCurrentMinutes(collegeNow);
  const { startMin, endMin, ratingEndMin } = getSlotBounds(config);

  if (curMin < startMin) {
    const startLabel = formatHourMinute(config.startHour, config.startMinute);
    return {
      status: 'UPCOMING',
      displayStatus: 'Upcoming',
      isLive: false,
      isRatingAllowed: false,
      badgeText: options.isPrimary ? `NEXT UP • ${startLabel}` : 'UPCOMING',
      badgeColor: options.isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-100',
      label: config.label,
      ratingWindowLabel: config.ratingWindowLabel,
      message: `Starts at ${startLabel} • Rating opens during service`
    };
  }

  if (curMin >= startMin && curMin <= endMin) {
    return {
      status: 'LIVE',
      displayStatus: 'Currently Serving',
      isLive: true,
      isRatingAllowed: true,
      badgeText: 'CURRENTLY SERVING',
      badgeColor: 'bg-emerald-500 text-white animate-pulse',
      label: config.label,
      ratingWindowLabel: config.ratingWindowLabel,
      message: `Live service • Rating open until ${formatHourMinute(config.ratingEndHour, config.ratingEndMinute)}`
    };
  }

  if (curMin > endMin && curMin <= ratingEndMin) {
    return {
      status: 'ENDED_RATING_OPEN',
      displayStatus: 'Currently Serving',
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
    displayStatus: 'Completed',
    isLive: false,
    isRatingAllowed: false,
    badgeText: 'COMPLETED',
    badgeColor: 'bg-slate-800/80 text-slate-300',
    label: config.label,
    ratingWindowLabel: config.ratingWindowLabel,
    message: `Service completed for today (${config.label})`
  };
};

/**
 * Helper to check if rating is allowed right now for a meal (in canonical IST)
 */
export const isRatingAllowedForMeal = (category, now = new Date(), options = {}) => {
  const status = getMealTimingStatus(category, now, options);
  return status.isRatingAllowed;
};

/**
 * Resolves the canonical Home menu context in Asia/Kolkata based on actual service & rating windows.
 *
 * When today's dinner schedule + rating window has completely concluded, automatically rolls over
 * the primary Home menu context to tomorrow's schedule (e.g., late Wednesday night -> Thursday Breakfast).
 * At midnight IST, tomorrow becomes today cleanly without skipping an extra day.
 */
export const resolveHomeMealSchedule = (now = new Date(), timingsConfig = OFFICIAL_MEAL_TIMINGS) => {
  const collegeNow = toCollegeDate(now);
  const curMin = getCurrentMinutes(collegeNow);
  const todayDayName = getCollegeDayName(collegeNow);
  const tomorrowDayName = getCollegeDayNameWithOffset(1, collegeNow);

  const b = getSlotBounds(timingsConfig.Breakfast || OFFICIAL_MEAL_TIMINGS.Breakfast);
  const l = getSlotBounds(timingsConfig.Lunch || OFFICIAL_MEAL_TIMINGS.Lunch);
  const s = getSlotBounds(timingsConfig.Snacks || OFFICIAL_MEAL_TIMINGS.Snacks);
  const d = getSlotBounds(timingsConfig.Dinner || OFFICIAL_MEAL_TIMINGS.Dinner);

  const isAfterDailySchedule = curMin > d.ratingEndMin;
  const isTodaySunday = todayDayName === 'Sunday';

  let primaryCategory = 'Breakfast';
  let phase = 'BEFORE_BREAKFAST';

  if (isAfterDailySchedule) {
    primaryCategory = 'Breakfast';
    phase = 'NEXT_DAY';
  } else if (curMin < b.startMin) {
    primaryCategory = 'Breakfast';
    phase = 'BEFORE_BREAKFAST';
  } else if (curMin <= b.ratingEndMin) {
    primaryCategory = 'Breakfast';
    phase = curMin <= b.endMin ? 'DURING_BREAKFAST' : 'AFTER_BREAKFAST_RATING';
  } else if (curMin < l.startMin) {
    primaryCategory = 'Lunch';
    phase = 'BEFORE_LUNCH';
  } else if (curMin <= l.ratingEndMin) {
    primaryCategory = 'Lunch';
    phase = curMin <= l.endMin ? 'DURING_LUNCH' : 'AFTER_LUNCH_RATING';
  } else if (!isTodaySunday && curMin < s.startMin) {
    primaryCategory = 'Snacks';
    phase = 'BEFORE_SNACKS';
  } else if (!isTodaySunday && curMin <= s.ratingEndMin) {
    primaryCategory = 'Snacks';
    phase = curMin <= s.endMin ? 'DURING_SNACKS' : 'AFTER_SNACKS_RATING';
  } else if (curMin < d.startMin) {
    primaryCategory = 'Dinner';
    phase = 'BEFORE_DINNER';
  } else {
    primaryCategory = 'Dinner';
    phase = curMin <= d.endMin ? 'DURING_DINNER' : 'AFTER_DINNER_RATING';
  }

  const offset = isAfterDailySchedule ? 1 : 0;
  const displayDayName = isAfterDailySchedule ? tomorrowDayName : todayDayName;
  const displayDateStr = getCollegeDateOffsetString(offset, collegeNow);
  const displayDateDisplay = formatCollegeDateWithOffset(offset, collegeNow);

  const sectionHeading = isAfterDailySchedule
    ? `NEXT UP — ${displayDayName.toUpperCase()}'S MEALS`
    : "TODAY'S MEALS";

  const primaryStart = (timingsConfig[primaryCategory] || OFFICIAL_MEAL_TIMINGS[primaryCategory]);
  const primaryDisplayName = primaryCategory === 'Snacks' ? 'Evening Snacks' : primaryCategory;
  const primaryStartFormatted = formatHourMinute(primaryStart.startHour, primaryStart.startMinute);

  let statusSummary;
  if (isAfterDailySchedule) {
    statusSummary = `${todayDayName}'s dinner service has ended • Next up: ${displayDayName} Breakfast at ${primaryStartFormatted}`;
  } else if (phase.startsWith('DURING_')) {
    statusSummary = `${primaryDisplayName} is currently serving • Rating open`;
  } else if (phase.endsWith('_RATING')) {
    statusSummary = `${primaryDisplayName} rating grace period open until ${formatHourMinute(primaryStart.ratingEndHour, primaryStart.ratingEndMinute)}`;
  } else {
    statusSummary = `Next up: ${primaryDisplayName} at ${primaryStartFormatted}`;
  }

  return {
    isNextDayContext: isAfterDailySchedule,
    phase,
    todayDayName,
    todayDateStr: getCollegeDateOffsetString(0, collegeNow),
    todayDateDisplay: formatCollegeDateWithOffset(0, collegeNow),
    displayDayName,
    displayDateStr,
    displayDateDisplay,
    primaryCategory,
    sectionHeading,
    statusSummary,
    currentMinutesIST: curMin
  };
};

/**
 * Determine the current active meal slot and next upcoming meal slot in real-time (Asia/Kolkata IST)
 */
export const getActiveAndNextMealSlot = (now = new Date(), timingsConfig = OFFICIAL_MEAL_TIMINGS) => {
  const collegeNow = toCollegeDate(now);
  const curMin = getCurrentMinutes(collegeNow);
  const isSunday = getCollegeDayName(collegeNow) === 'Sunday';

  const b = getSlotBounds(timingsConfig.Breakfast || OFFICIAL_MEAL_TIMINGS.Breakfast);
  const l = getSlotBounds(timingsConfig.Lunch || OFFICIAL_MEAL_TIMINGS.Lunch);
  const s = getSlotBounds(timingsConfig.Snacks || OFFICIAL_MEAL_TIMINGS.Snacks);
  const d = getSlotBounds(timingsConfig.Dinner || OFFICIAL_MEAL_TIMINGS.Dinner);

  // 1. Before Breakfast
  if (curMin < b.startMin) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Breakfast',
      nextMealLabel: 'Breakfast (7:20 AM)',
      isTomorrow: false,
      isScheduleConcludedForDay: false,
      bannerMessage: 'Breakfast starts at 7:20 AM'
    };
  }

  // 2. Breakfast Window
  if (curMin <= b.ratingEndMin) {
    return {
      currentMealCategory: curMin <= b.endMin ? 'Breakfast' : null,
      activeRatingCategory: 'Breakfast',
      nextMealCategory: 'Lunch',
      nextMealLabel: 'Lunch (12:20 PM)',
      isTomorrow: false,
      isScheduleConcludedForDay: false,
      bannerMessage: curMin <= b.endMin
        ? 'Breakfast is LIVE • Rating Open'
        : 'Breakfast ended • Rating open until 9:00 AM'
    };
  }

  // 3. Post-Breakfast to Pre-Lunch
  if (curMin < l.startMin) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Lunch',
      nextMealLabel: 'Lunch (12:20 PM)',
      isTomorrow: false,
      isScheduleConcludedForDay: false,
      bannerMessage: 'Lunch starts at 12:20 PM'
    };
  }

  // 4. Lunch Window
  if (curMin <= l.ratingEndMin) {
    return {
      currentMealCategory: curMin <= l.endMin ? 'Lunch' : null,
      activeRatingCategory: 'Lunch',
      nextMealCategory: isSunday ? 'Dinner' : 'Snacks',
      nextMealLabel: isSunday ? 'Dinner (7:30 PM)' : 'Evening Snacks (5:00 PM)',
      isTomorrow: false,
      isScheduleConcludedForDay: false,
      bannerMessage: curMin <= l.endMin
        ? 'Lunch is LIVE • Rating Open'
        : 'Lunch ended • Rating open until 2:30 PM'
    };
  }

  // 5. Post-Lunch to Pre-Snacks
  if (!isSunday && curMin < s.startMin) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Snacks',
      nextMealLabel: 'Evening Snacks (5:00 PM)',
      isTomorrow: false,
      isScheduleConcludedForDay: false,
      bannerMessage: 'Evening Snacks start at 5:00 PM'
    };
  }

  // 6. Snacks Window (Mon–Sat)
  if (!isSunday && curMin <= s.ratingEndMin) {
    return {
      currentMealCategory: curMin <= s.endMin ? 'Snacks' : null,
      activeRatingCategory: 'Snacks',
      nextMealCategory: 'Dinner',
      nextMealLabel: 'Dinner (7:30 PM)',
      isTomorrow: false,
      isScheduleConcludedForDay: false,
      bannerMessage: curMin <= s.endMin
        ? 'Evening Snacks are LIVE • Rating Open'
        : 'Snacks ended • Rating open until 6:30 PM'
    };
  }

  // 7. Post-Snacks (or post-Lunch Sunday) to Pre-Dinner
  if (curMin < d.startMin) {
    return {
      currentMealCategory: null,
      activeRatingCategory: null,
      nextMealCategory: 'Dinner',
      nextMealLabel: 'Dinner (7:30 PM)',
      isTomorrow: false,
      isScheduleConcludedForDay: false,
      bannerMessage: 'Dinner starts at 7:30 PM'
    };
  }

  // 8. Dinner Window
  if (curMin <= d.ratingEndMin) {
    return {
      currentMealCategory: curMin <= d.endMin ? 'Dinner' : null,
      activeRatingCategory: 'Dinner',
      nextMealCategory: 'Breakfast',
      nextMealLabel: "Tomorrow's Breakfast (7:20 AM)",
      isTomorrow: true,
      isScheduleConcludedForDay: false,
      bannerMessage: curMin <= d.endMin
        ? 'Dinner is LIVE • Rating Open'
        : 'Dinner ended • Rating open until 9:30 PM'
    };
  }

  // 9. Post-Dinner (after 9:30 PM IST -> Tomorrow becomes active Home schedule)
  return {
    currentMealCategory: null,
    activeRatingCategory: null,
    nextMealCategory: 'Breakfast',
    nextMealLabel: "Tomorrow's Breakfast (7:20 AM)",
    isTomorrow: true,
    isScheduleConcludedForDay: true,
    bannerMessage: "All meals concluded for today • Tomorrow's Breakfast at 7:20 AM"
  };
};
