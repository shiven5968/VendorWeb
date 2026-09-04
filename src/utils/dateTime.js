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
