/**
 * MESSMATES — HOME REDESIGN, NAVIGATION & SMART IST SCHEDULING VERIFICATION SUITE
 *
 * Tests Phase 3–9 engineering contracts:
 *   1. Canonical Asia/Kolkata (IST) Date/Time & Firestore Timestamp Conversion
 *   2. Full Daily Phase Machine (Before Breakfast -> Post-Dinner Rollover -> Clean Midnight Reset)
 *   3. Sunday Special Rules (Snacks OFF, Dinner next after Lunch, Sunday night -> Monday rollover)
 *   4. Home Component & Navigation Structural Contracts (BottomNav 6 items, Navbar account sheet,
 *      unified MealCard, Home 4-meal focus, no inline weekly duplicate, VIEW FULL WEEK MENU CTA,
 *      MenuPage Back to Home, ProfilePage safe label, Modal/Drawer mobile sizing)
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

import {
  toCollegeDate,
  getCollegeDateString,
  getCollegeDateOffsetString,
  getCollegeDayName,
  getCollegeDayNameWithOffset,
  getCollegeTimeParts,
} from '../src/utils/dateTime.js';

import {
  OFFICIAL_MEAL_TIMINGS,
  MEAL_ORDER,
  getMealTimingStatus,
  getActiveAndNextMealSlot,
  resolveHomeMealSchedule,
} from '../src/services/mealTiming.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${label}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${label}\n    -> ${err.message}`);
  }
}

function readSrc(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

console.log('====================================================================');
console.log('  MESSMATES — HOME REDESIGN & IST SCHEDULING TEST SUITE');
console.log('====================================================================\n');

// ---------------------------------------------------------------------------
// 1. Canonical Asia/Kolkata (IST) & Timestamp Handling
// ---------------------------------------------------------------------------
console.log('[SECTION 1] Canonical IST DateTime & Firestore Timestamp Handling');

check('Converts late-UTC timestamp (Wed 18:35 UTC) to Thursday 00:05 IST without day drift', () => {
  const lateUtc = new Date('2026-11-11T18:35:00Z');
  assert.strictEqual(getCollegeDateString(lateUtc), '2026-11-12');
  assert.strictEqual(getCollegeDayName(lateUtc), 'Thursday');
  const parts = getCollegeTimeParts(lateUtc);
  assert.strictEqual(parts.hour, 0);
  assert.strictEqual(parts.minute, 5);
});

check('Supports Firestore Timestamp-like objects (.toDate()) and epoch ms consistently', () => {
  const iso = '2026-11-11T18:45:00Z';
  const expectedDate = new Date(iso);
  const firestoreLike = { toDate: () => expectedDate };
  assert.strictEqual(toCollegeDate(firestoreLike).getTime(), expectedDate.getTime());
  assert.strictEqual(getCollegeDateString(firestoreLike), '2026-11-12');
  assert.strictEqual(getCollegeDateOffsetString(1, firestoreLike), '2026-11-13');
  assert.strictEqual(getCollegeDayNameWithOffset(1, firestoreLike), 'Friday');
  assert.strictEqual(getCollegeDateString(expectedDate.getTime()), '2026-11-12');
});

// ---------------------------------------------------------------------------
// 2. Smart Meal Timing & Next-Day Rollover (Weekday)
// ---------------------------------------------------------------------------
console.log('\n[SECTION 2] Full IST Weekday State Machine & Post-Dinner Rollover');

check('06:30 IST -> BEFORE_BREAKFAST on same day with TODAY\'S MEALS', () => {
  const res = resolveHomeMealSchedule(new Date('2026-11-11T01:00:00Z'));
  assert.strictEqual(res.phase, 'BEFORE_BREAKFAST');
  assert.strictEqual(res.isNextDayContext, false);
  assert.strictEqual(res.todayDayName, 'Wednesday');
  assert.strictEqual(res.displayDayName, 'Wednesday');
  assert.strictEqual(res.primaryCategory, 'Breakfast');
  assert.strictEqual(res.sectionHeading, "TODAY'S MEALS");
});

check('08:00 IST -> DURING_BREAKFAST live & rating open', () => {
  const now = new Date('2026-11-11T02:30:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.phase, 'DURING_BREAKFAST');
  assert.strictEqual(res.primaryCategory, 'Breakfast');
  const status = getMealTimingStatus('Breakfast', now, { dayName: res.displayDayName });
  assert.strictEqual(status.isLive, true);
  assert.strictEqual(status.isRatingAllowed, true);
  assert.strictEqual(status.displayStatus, 'Currently Serving');
});

check('10:00 IST -> BEFORE_LUNCH', () => {
  const res = resolveHomeMealSchedule(new Date('2026-11-11T04:30:00Z'));
  assert.strictEqual(res.phase, 'BEFORE_LUNCH');
  assert.strictEqual(res.primaryCategory, 'Lunch');
});

check('13:00 IST -> DURING_LUNCH live & rating open', () => {
  const now = new Date('2026-11-11T07:30:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.phase, 'DURING_LUNCH');
  assert.strictEqual(res.primaryCategory, 'Lunch');
  const status = getMealTimingStatus('Lunch', now, { dayName: res.displayDayName });
  assert.strictEqual(status.isLive, true);
  assert.strictEqual(status.isRatingAllowed, true);
});

check('15:30 IST (Weekday) -> BEFORE_SNACKS', () => {
  const res = resolveHomeMealSchedule(new Date('2026-11-11T10:00:00Z'));
  assert.strictEqual(res.phase, 'BEFORE_SNACKS');
  assert.strictEqual(res.primaryCategory, 'Snacks');
});

check('17:30 IST (Weekday) -> DURING_SNACKS live & rating open', () => {
  const now = new Date('2026-11-11T12:00:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.phase, 'DURING_SNACKS');
  assert.strictEqual(res.primaryCategory, 'Snacks');
  const status = getMealTimingStatus('Snacks', now, { dayName: res.displayDayName });
  assert.strictEqual(status.isLive, true);
  assert.strictEqual(status.isRatingAllowed, true);
});

check('18:45 IST -> BEFORE_DINNER', () => {
  const res = resolveHomeMealSchedule(new Date('2026-11-11T13:15:00Z'));
  assert.strictEqual(res.phase, 'BEFORE_DINNER');
  assert.strictEqual(res.primaryCategory, 'Dinner');
});

check('20:15 IST -> DURING_DINNER live & rating open', () => {
  const now = new Date('2026-11-11T14:45:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.phase, 'DURING_DINNER');
  assert.strictEqual(res.primaryCategory, 'Dinner');
  const status = getMealTimingStatus('Dinner', now, { dayName: res.displayDayName });
  assert.strictEqual(status.isLive, true);
  assert.strictEqual(status.isRatingAllowed, true);
});

check('21:15 IST -> AFTER_DINNER_RATING grace period (same day, rating still open)', () => {
  const now = new Date('2026-11-11T15:45:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.phase, 'AFTER_DINNER_RATING');
  assert.strictEqual(res.isNextDayContext, false);
  assert.strictEqual(res.displayDayName, 'Wednesday');
  const status = getMealTimingStatus('Dinner', now, { dayName: res.displayDayName });
  assert.strictEqual(status.status, 'ENDED_RATING_OPEN');
  assert.strictEqual(status.isLive, false);
  assert.strictEqual(status.isRatingAllowed, true);
});

check('21:31 IST -> NEXT_DAY rollover to Thursday immediately after +30 min dinner window', () => {
  const now = new Date('2026-11-11T16:01:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.phase, 'NEXT_DAY');
  assert.strictEqual(res.isNextDayContext, true);
  assert.strictEqual(res.todayDayName, 'Wednesday');
  assert.strictEqual(res.displayDayName, 'Thursday');
  assert.strictEqual(res.displayDateStr, '2026-11-12');
  assert.strictEqual(res.primaryCategory, 'Breakfast');
  assert.strictEqual(res.sectionHeading, "NEXT UP — THURSDAY'S MEALS");
});

check('23:24 IST -> NEXT_DAY shows Thursday Breakfast NEXT UP TOMORROW & concluded day banner', () => {
  const now = new Date('2026-11-11T17:54:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.isNextDayContext, true);
  assert.strictEqual(res.displayDayName, 'Thursday');
  const bfast = getMealTimingStatus('Breakfast', now, {
    dayName: res.displayDayName,
    isNextDay: true,
    isPrimary: true,
  });
  assert.strictEqual(bfast.displayStatus, 'Next Day');
  assert.strictEqual(bfast.badgeText, 'NEXT UP TOMORROW');
  assert.strictEqual(bfast.isRatingAllowed, false);
  const slot = getActiveAndNextMealSlot(now);
  assert.strictEqual(slot.isTomorrow, true);
  assert.strictEqual(slot.isScheduleConcludedForDay, true);
});

check('00:05 IST -> Clean midnight reset to Thursday BEFORE_BREAKFAST without skipping an extra day', () => {
  const now = new Date('2026-11-11T18:35:00Z');
  const res = resolveHomeMealSchedule(now);
  assert.strictEqual(res.isNextDayContext, false);
  assert.strictEqual(res.phase, 'BEFORE_BREAKFAST');
  assert.strictEqual(res.todayDayName, 'Thursday');
  assert.strictEqual(res.displayDayName, 'Thursday');
  assert.strictEqual(res.displayDateStr, '2026-11-12');
  assert.strictEqual(res.sectionHeading, "TODAY'S MEALS");
});

check('Dinner official ratingWindowLabel typo fixed (7:30 PM – 9:30 PM)', () => {
  assert.strictEqual(OFFICIAL_MEAL_TIMINGS.Dinner.ratingWindowLabel, '7:30 PM – 9:30 PM');
});

// ---------------------------------------------------------------------------
// 3. Sunday Edge Cases
// ---------------------------------------------------------------------------
console.log('\n[SECTION 3] Sunday Special Rules');

check('Sunday 14:30 IST & 17:30 IST -> Snacks is OFF and Dinner is next after Lunch', () => {
  const sunAfterLunch = new Date('2026-11-08T09:00:00Z'); // 14:30 IST Sunday
  const slotAfterLunch = getActiveAndNextMealSlot(sunAfterLunch);
  assert.strictEqual(slotAfterLunch.nextMealCategory, 'Dinner');

  const sunSnacksTime = new Date('2026-11-08T12:00:00Z'); // 17:30 IST Sunday
  const sched = resolveHomeMealSchedule(sunSnacksTime);
  assert.strictEqual(sched.phase, 'BEFORE_DINNER');
  assert.strictEqual(sched.primaryCategory, 'Dinner');

  const snackStatus = getMealTimingStatus('Snacks', sunSnacksTime, { dayName: 'Sunday' });
  assert.strictEqual(snackStatus.status, 'CLOSED');
  assert.strictEqual(snackStatus.label, 'OFF');
  assert.strictEqual(snackStatus.badgeText, 'OFF');
  assert.strictEqual(snackStatus.displayStatus, 'Not Available');
});

check('Sunday 22:00 IST -> Rolls over cleanly to Monday Breakfast', () => {
  const sunNight = new Date('2026-11-08T16:30:00Z');
  const sched = resolveHomeMealSchedule(sunNight);
  assert.strictEqual(sched.isNextDayContext, true);
  assert.strictEqual(sched.todayDayName, 'Sunday');
  assert.strictEqual(sched.displayDayName, 'Monday');
  assert.strictEqual(sched.displayDateStr, '2026-11-09');
  assert.strictEqual(sched.sectionHeading, "NEXT UP — MONDAY'S MEALS");
});

// ---------------------------------------------------------------------------
// 4. Component, Navigation & Architectural Contracts
// ---------------------------------------------------------------------------
console.log('\n[SECTION 4] Component, Navigation & Architectural Contracts');

check('BottomNav renders exact 6 navigation items in specified order with 54px touch height', () => {
  const src = readSrc('src/components/BottomNav.jsx');
  assert.ok(src.includes('grid-cols-6'), 'Expected grid-cols-6 for 6 equal mobile tabs');
  assert.ok(src.includes('min-h-[54px]'), 'Expected min-h-[54px] accessible touch height');

  const expectedOrder = [
    { id: 'dashboard', label: 'Home' },
    { id: 'muscle-pass', label: 'Muscle Pass' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'voting', label: 'Voting' },
    { id: 'profile', label: 'Profile' },
  ];

  let prevIdx = -1;
  for (const item of expectedOrder) {
    const idIdx = src.indexOf(`id: '${item.id}'`);
    assert.ok(idIdx > prevIdx, `Expected item ${item.id} (${item.label}) in strict sequence`);
    const labelIdx = src.indexOf(`label: '${item.label}'`, idIdx);
    assert.ok(labelIdx > idIdx && labelIdx - idIdx < 120, `Expected label '${item.label}' on '${item.id}'`);
    prevIdx = idIdx;
  }
});

check('Navbar provides compact mobile account menu (Profile, Full Week Menu, Sign Out) & desktop controls', () => {
  const src = readSrc('src/components/Navbar.jsx');
  assert.ok(src.includes('aria-label="Account Menu"'), 'Expected mobile Account Menu button');
  assert.ok(src.includes('Sign Out'), 'Expected accessible Sign Out action');
  assert.ok(src.includes('Full Week Menu'), 'Expected Full Week Menu shortcut');
  assert.ok(src.includes('Profile & Settings'), 'Expected Profile & Settings shortcut');
});

check('MealCard enforces unified 16:9 aspect-video cover, data-meal-card, View Details & Rate Meal', () => {
  const src = readSrc('src/components/ui/MealCard.jsx');
  assert.ok(src.includes('aspect-video'), 'Expected unified 16:9 cover image aspect-video');
  assert.ok(src.includes('data-meal-card'), 'Expected data-meal-card marker for layout verification');
  assert.ok(src.includes('View Details'), 'Expected View Details CTA');
  assert.ok(src.includes('Rate Meal'), 'Expected Rate Meal CTA');
  assert.ok(src.includes('min-h-[44px]'), 'Expected >=44px action buttons');
});

check('StudentDashboard shows Home 4 chronological MealCards, Health Points always visible, VIEW FULL WEEK MENU CTA, and NO inline weekly schedule or Monday fallback', () => {
  assert.deepStrictEqual(MEAL_ORDER, ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], 'MEAL_ORDER must be strict chronological');
  const src = readSrc('src/pages/StudentDashboard.jsx');
  assert.ok(src.includes('MEAL_ORDER.map'), 'Expected StudentDashboard to iterate MEAL_ORDER');
  assert.ok(src.includes('<MealCard'), 'Expected unified MealCard component usage');
  assert.ok(!src.includes('weekly-menu-schedule'), 'Inline #weekly-menu-schedule must be removed from Home');
  assert.ok(!src.includes("|| activeMenu['Monday']"), 'Must NOT silently fall back to Monday menu');
  assert.ok(src.includes('VIEW FULL WEEK MENU'), 'Expected VIEW FULL WEEK MENU CTA');
  assert.ok(src.includes('Health Points'), 'Expected always-visible Health Points card');
  assert.ok(src.includes("setCurrentPage('menu')"), 'Expected VIEW FULL WEEK MENU CTA to navigate to menu page');
  assert.ok(src.includes('w-full min-w-0'), 'Expected w-full min-w-0 flex overflow protection');
});

check('MenuPage provides Back to Home return navigation and uses shared MealCard', () => {
  const src = readSrc('src/pages/MenuPage.jsx');
  assert.ok(src.includes('Back to Home'), 'Expected Back to Home button on MenuPage');
  assert.ok(src.includes("setCurrentPage('dashboard')"), 'Expected Back to Home to navigate back to dashboard home');
  assert.ok(src.includes('<MealCard'), 'Expected MenuPage to share unified MealCard');
  assert.ok(src.includes('w-full min-w-0'), 'Expected w-full min-w-0 flex overflow protection');
});

check('AppContext uses IST getCollegeDateString(currentTime) for protein calculation & exposes homeScheduleContext', () => {
  const src = readSrc('src/context/AppContext.jsx');
  assert.ok(src.includes('homeScheduleContext'), 'Expected homeScheduleContext exposed by AppContext');
  assert.ok(src.includes('getCollegeDateString(currentTime)'), 'Expected IST date lookup for today protein');
  assert.ok(!src.includes("currentTime.toISOString().split('T')[0]"), 'Must NOT use UTC split for IST daily protein');
});

check('ProfilePage, Modal & NotificationDrawer mobile safety guards intact', () => {
  const profileSrc = readSrc('src/pages/ProfilePage.jsx');
  assert.ok(!profileSrc.includes('menuGroup.name'), 'ProfilePage must use menuGroup?.label instead of menuGroup.name');
  assert.ok(profileSrc.includes("menuGroup?.label || 'Pending Allocation'"), 'Expected safe menuGroup label fallback');

  const modalSrc = readSrc('src/components/ui/Modal.jsx');
  assert.ok(modalSrc.includes('max-h-[90dvh]'), 'Modal should use 90dvh for mobile keyboards/chrome');
  assert.ok(modalSrc.includes('min-w-[44px] min-h-[44px]'), 'Modal close button should meet 44px target');

  const drawerSrc = readSrc('src/components/NotificationDrawer.jsx');
  assert.ok(drawerSrc.includes('pl-4 sm:pl-10'), 'NotificationDrawer should allow full width on 320px screens');
  assert.ok(drawerSrc.includes('min-w-[44px] min-h-[44px]'), 'NotificationDrawer close button should meet 44px target');
});

console.log('\n====================================================================');
console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================================');

if (failed > 0) {
  process.exit(1);
}
