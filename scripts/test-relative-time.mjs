import { formatRatingRelativeTime, getCollegeDateString } from '../src/utils/dateTime.js';

const now = new Date();

// Test today
const todayText = formatRatingRelativeTime(now.toISOString());
console.log("Today:", todayText);
if (todayText !== "You rated this meal today") throw new Error("Today failed");

// Test yesterday
const yesterday = new Date(now.getTime() - 25 * 3600 * 1000);
const yesterdayText = formatRatingRelativeTime(yesterday.toISOString());
console.log("Yesterday:", yesterdayText);
if (yesterdayText !== "You rated this meal yesterday") throw new Error("Yesterday failed");

// Test 5 days ago
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 3600 * 1000);
const fiveDaysText = formatRatingRelativeTime(fiveDaysAgo.toISOString());
console.log("5 days ago:", fiveDaysText);
if (!fiveDaysText.startsWith("You rated this meal last week")) throw new Error("5 days ago failed: " + fiveDaysText);

// Test 20 days ago
const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 3600 * 1000);
const twentyDaysText = formatRatingRelativeTime(twentyDaysAgo.toISOString());
console.log("20 days ago:", twentyDaysText);
if (!twentyDaysText.startsWith("You rated this meal on")) throw new Error("20 days ago failed: " + twentyDaysText);

console.log("✓ ALL RELATIVE TIME TESTS PASSED!");
