/**
 * MessMates — College Timezone & Date Utility
 * Canonical Timezone: Asia/Kolkata (ABES Engineering College, Ghaziabad, UP)
 * 
 * Guarantees that menu schedules, daily operational photos, hygiene inspections,
 * meal ratings, and dashboard timestamps all resolve using the same standard college time.
 * At 12:00 AM midnight Asia/Kolkata, date transitions cleanly to the next calendar day.
 */

export const COLLEGE_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns a new Date object representing the current instant.
 */
export function getCollegeNow() {
  return new Date();
}

/**
 * Returns today's calendar date in YYYY-MM-DD string formatted in Asia/Kolkata.
 * Example: "2026-09-04"
 */
export function getCollegeDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: COLLEGE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

/**
 * Returns the weekday name (e.g., 'Monday', 'Tuesday', ..., 'Sunday') in Asia/Kolkata.
 */
export function getCollegeDayName(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: COLLEGE_TIMEZONE,
    weekday: 'long'
  });
  return formatter.format(date);
}

/**
 * Formats a date for student, committee, and executive headers in Asia/Kolkata.
 * Example: "Friday, Sep 4, 2026"
 */
export function formatCollegeDateDisplay(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: COLLEGE_TIMEZONE,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return formatter.format(date);
}

/**
 * Returns current hours (0-23) and minutes (0-59) in Asia/Kolkata.
 */
export function getCollegeTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: COLLEGE_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  return { hour, minute };
}

/**
 * Returns whether a given date matches today's college date.
 */
export function isTodayInCollege(targetDate) {
  if (!targetDate) return false;
  const targetStr = typeof targetDate === 'string' 
    ? targetDate.split('T')[0] 
    : getCollegeDateString(targetDate);
  return targetStr === getCollegeDateString();
}

/**
 * Returns a college date string for N days in the past in Asia/Kolkata.
 */
export function getPastCollegeDateString(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getCollegeDateString(d);
}

/**
 * Formats a timestamp into full date and time string in Asia/Kolkata (IST).
 * Example: "04 Sep 2026, 05:30 PM IST"
 */
export function formatCollegeDateTime(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: COLLEGE_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${formatter.format(date)} IST`;
}

/**
 * Formats a rating timestamp into human-readable contextual wording in Asia/Kolkata.
 * Rules:
 * - Today (0 days ago in Asia/Kolkata): "You rated this meal today"
 * - Yesterday (1 day ago in Asia/Kolkata): "You rated this meal yesterday"
 * - 2-7 days ago: "You rated this meal last week · [Date]"
 * - > 7 days ago: "You rated this meal on [Date]"
 */
export function formatRatingRelativeTime(timestamp) {
  if (!timestamp) return 'You rated this meal';

  try {
    const ratingDate = new Date(timestamp);
    if (isNaN(ratingDate.getTime())) return 'You rated this meal';

    const ratingDateStr = getCollegeDateString(ratingDate);
    const todayDateStr = getCollegeDateString(new Date());

    const [rY, rM, rD] = ratingDateStr.split('-').map(Number);
    const [tY, tM, tD] = todayDateStr.split('-').map(Number);

    const rUtc = Date.UTC(rY, rM - 1, rD);
    const tUtc = Date.UTC(tY, tM - 1, tD);
    const diffDays = Math.round((tUtc - rUtc) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'You rated this meal today';
    } else if (diffDays === 1) {
      return 'You rated this meal yesterday';
    } else if (diffDays <= 7) {
      const dateFormatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: COLLEGE_TIMEZONE,
        day: 'numeric',
        month: 'short'
      }).format(ratingDate);
      return `You rated this meal last week · ${dateFormatted}`;
    } else {
      const dateFormatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: COLLEGE_TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(ratingDate);
      return `You rated this meal on ${dateFormatted}`;
    }
  } catch (err) {
    return 'You rated this meal';
  }
}

/**
 * Returns deterministic week information in Asia/Kolkata timezone.
 * A week starts on Monday 12:00 AM IST and ends on Sunday 11:59 PM IST.
 * Sunday 23:59 IST belongs to current week, Monday 00:00 IST belongs to next week.
 */
export function getCollegeWeekInfo(dateInput = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: COLLEGE_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
    const dateStr = formatter.format(validDate);
    const [y, m, d] = dateStr.split('-').map(Number);

    // Current date in UTC with IST calendar values
    const current = new Date(Date.UTC(y, m - 1, d));
    const day = current.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const diffToMonday = (day === 0 ? -6 : 1 - day);

    const monday = new Date(current);
    monday.setUTCDate(current.getUTCDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    // ISO-8601 week number calculation based on Thursday of the week
    const thursday = new Date(monday);
    thursday.setUTCDate(monday.getUTCDate() + 3);
    const isoYear = thursday.getUTCFullYear();
    const yearStart = new Date(Date.UTC(isoYear, 0, 1));
    const weekNumber = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
    const weekId = `${isoYear}-W${String(weekNumber).padStart(2, '0')}`;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const monMonth = monthNames[monday.getUTCMonth()];
    const sunMonth = monthNames[sunday.getUTCMonth()];
    const monDay = monday.getUTCDate();
    const sunDay = sunday.getUTCDate();
    const sunYear = sunday.getUTCFullYear();

    const weekRangeDisplay = monMonth === sunMonth
      ? `${monDay} – ${sunDay} ${sunMonth} ${sunYear}`
      : `${monDay} ${monMonth} – ${sunDay} ${sunMonth} ${sunYear}`;

    const monthLabel = `${fullMonthNames[validDate.getMonth()]} ${validDate.getFullYear()}`;

    return {
      weekId,
      weekNumber,
      year: isoYear,
      weekStartStr: monday.toISOString().split('T')[0],
      weekEndStr: sunday.toISOString().split('T')[0],
      weekRangeDisplay,
      monthLabel
    };
  } catch (e) {
    return {
      weekId: '2026-W36',
      weekNumber: 36,
      year: 2026,
      weekStartStr: '2026-08-31',
      weekEndStr: '2026-09-06',
      weekRangeDisplay: '31 Aug – 6 Sep 2026',
      monthLabel: 'September 2026'
    };
  }
}

/**
 * Returns recent college weeks for historical feedback navigation.
 * Count defaults to 4 weeks.
 */
export function getPastCollegeWeeks(count = 4, referenceDate = new Date()) {
  const weeks = [];
  const currentWeekInfo = getCollegeWeekInfo(referenceDate);

  for (let i = 0; i < count; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - (i * 7));
    const info = getCollegeWeekInfo(d);
    const label = i === 0 
      ? 'This Week' 
      : i === 1 
      ? 'Last Week' 
      : i === 2 
      ? '2 Weeks Ago' 
      : i === 3 
      ? '3 Weeks Ago' 
      : `${i} Weeks Ago`;

    // Avoid duplicate week entries if referenceDate shifted within same week
    if (!weeks.some(w => w.weekId === info.weekId)) {
      weeks.push({
        ...info,
        label,
        isCurrent: info.weekId === currentWeekInfo.weekId
      });
    }
  }

  return weeks;
}

/**
 * Returns the YYYY-MM-DD date string for a specific weekday in the current college week.
 * Example: getCollegeDateForDayInCurrentWeek('Friday') => '2026-09-04'
 */
export function getCollegeDateForDayInCurrentWeek(dayName, referenceDate = new Date()) {
  const weekInfo = getCollegeWeekInfo(referenceDate);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIdx = days.indexOf(dayName);
  if (dayIdx === -1) return getCollegeDateString(referenceDate);
  
  const [y, m, d] = weekInfo.weekStartStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(y, m - 1, d + dayIdx));
  return targetDate.toISOString().split('T')[0];
}
