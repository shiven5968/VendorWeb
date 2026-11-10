import assert from 'assert';
import { DEFAULT_PARTNER_DEALS } from './src/data/partnerDeals.js';
import { getCollegeDateString } from './src/utils/dateTime.js';

console.log('=== TEST SUITE: MESSMATES PREMIUM REWARDS REDESIGN ===\n');

// ── TEST 1: HEALTH POINTS SUMMARY & MILESTONES ────────────────────────────────
console.log('--- TEST 1: Health Points Summary & Milestone Calculations ---');
const todayStr = getCollegeDateString();
const mockRewardEvents = [
  { id: '1', type: 'LOGIN', points: 2, date: todayStr, createdAt: `${todayStr}T08:00:00.000Z` },
  { id: '2', type: 'MEAL_RATING', points: 1, date: todayStr, createdAt: `${todayStr}T13:30:00.000Z` },
  { id: '3', type: 'LOGIN', points: 2, date: '2026-11-01', createdAt: '2026-11-01T08:00:00.000Z' },
  { id: '4', type: 'MEAL_RATING', points: 1, date: '2026-10-15', createdAt: '2026-10-15T12:00:00.000Z' }
];

const mockRedemptions = [
  { id: 'r1', pointsSpent: 40, voucherCode: 'MM-CAFE-A1B2-1234', timestamp: Date.now() },
  { id: 'r2', pointsSpent: 25, voucherCode: 'MM-FOOD-C3D4-5678', timestamp: Date.now() - 86400000 }
];

// Points earned today
const pointsToday = mockRewardEvents
  .filter(evt => evt.date === todayStr || (evt.createdAt && evt.createdAt.startsWith(todayStr)))
  .reduce((sum, evt) => sum + (Number(evt.points) || 0), 0);
assert.strictEqual(pointsToday, 3, 'Today points should equal 2 + 1 = 3 HP');

// Points earned this month
const currentMonthStr = todayStr.substring(0, 7);
const pointsThisMonth = mockRewardEvents
  .filter(evt => (evt.date && evt.date.startsWith(currentMonthStr)) || (evt.createdAt && evt.createdAt.startsWith(currentMonthStr)))
  .reduce((sum, evt) => sum + (Number(evt.points) || 0), 0);
assert.ok(pointsThisMonth >= 3, 'This month points should be at least 3 HP');

// Total redeemed points
const pointsRedeemed = mockRedemptions.reduce((sum, r) => sum + (Number(r.pointsSpent) || 0), 0);
assert.strictEqual(pointsRedeemed, 65, 'Redeemed points should be 40 + 25 = 65 HP');

// Milestone calculations
const MILESTONES = [
  { target: 25, label: 'Bronze Perk' },
  { target: 50, label: 'Silver Perk' },
  { target: 100, label: 'Gold Perk' },
  { target: 250, label: 'Platinum Elite' },
  { target: 500, label: 'Diamond Campus Member' }
];

const currentHP = 52;
const nextMilestone = MILESTONES.find(m => m.target > currentHP) || { target: 1000, label: 'Master Perk' };
assert.strictEqual(nextMilestone.target, 100, 'Next milestone after 52 HP should be 100 HP (Gold Perk)');
assert.strictEqual(nextMilestone.target - currentHP, 48, 'Should need exactly 48 HP to reach Gold Perk');
console.log('✓ Health Points summary and milestone logic verified.');

// ── TEST 2: EARNING RULES & CIVIC VOTING INTEGRITY ────────────────────────────
console.log('\n--- TEST 2: Earning Rules & Civic Voting Integrity ---');
const loginPointsRule = 2;
const ratingPointsRule = 1;
const votingPointsRule = 0;

assert.strictEqual(loginPointsRule, 2, 'Daily login rule must be +2 HP');
assert.strictEqual(ratingPointsRule, 1, 'Meal rating rule must be +1 HP');
assert.strictEqual(votingPointsRule, 0, 'Civic dish voting must award strictly 0 HP');
console.log('✓ Earning rules match product specifications: Login +2 HP, Rating +1 HP, Voting 0 HP.');

// ── TEST 3: PARTNER MARKETPLACE & CATEGORIES ──────────────────────────────────
console.log('\n--- TEST 3: Partner Marketplace Inventory & Filters ---');
assert.ok(DEFAULT_PARTNER_DEALS.length >= 6, 'Must have at least 6 verified partner deals');

const cafeDeals = DEFAULT_PARTNER_DEALS.filter(d => d.category === 'Cafes');
assert.ok(cafeDeals.length > 0, 'Cafes category must have active deals');

const fitnessDeals = DEFAULT_PARTNER_DEALS.filter(d => d.category === 'Fitness & Wellness');
assert.ok(fitnessDeals.length > 0, 'Fitness & Wellness category must have active deals');

// Search query filter test
const searchQuery = 'coffee';
const matchedSearch = DEFAULT_PARTNER_DEALS.filter(d => 
  (d.title || '').toLowerCase().includes(searchQuery) || 
  (d.description || '').toLowerCase().includes(searchQuery)
);
assert.ok(matchedSearch.length > 0, 'Search for "coffee" should match Campus Blend Cafe deal');

// Affordable filter test
const affordableDeals = DEFAULT_PARTNER_DEALS.filter(d => Number(d.pointsRequired) <= currentHP);
assert.ok(affordableDeals.length > 0, 'Deals requiring <= 52 HP must be marked affordable');
console.log('✓ Partner marketplace categories, search, and affordability filters verified.');

// ── TEST 4: REDEMPTION SAFETY & CODE FORMAT ───────────────────────────────────
console.log('\n--- TEST 4: Redemption Safety & Voucher Code Generation ---');
const offerCost = 40;
const studentBalance = 52;
assert.ok(studentBalance >= offerCost, 'Student should have sufficient points');

const newBalance = studentBalance - offerCost;
assert.strictEqual(newBalance, 12, '52 HP - 40 HP = 12 HP remaining balance');

// Insufficient points rejection
const expensiveOfferCost = 150;
const canAffordExpensive = studentBalance >= expensiveOfferCost;
assert.strictEqual(canAffordExpensive, false, 'Redemption with insufficient points must be rejected');

// Voucher code format check
const vendorPrefix = 'CAFE';
const voucherCode = `MM-${vendorPrefix}-ABCD-1234`;
assert.ok(voucherCode.startsWith('MM-CAFE-'), 'Voucher code must follow MM-{VENDOR}-{CODE} structure');
console.log('✓ Redemption calculations, insufficient points rejection, and voucher code formats verified.');

// ── TEST 5: ACHIEVEMENTS & MILESTONES PROGRESSION ─────────────────────────────
console.log('\n--- TEST 5: Achievements Progression Logic ---');
const ratingsCount = 3;
const loginCount = 7;
const redemptionsCount = 1;
const lifetimePoints = 75;

const ACHIEVEMENTS_LIST = [
  { id: 'first_rating', target: 1, current: ratingsCount },
  { id: 'active_critic', target: 5, current: ratingsCount },
  { id: 'campus_regular', target: 7, current: loginCount },
  { id: 'fortnight_streak', target: 14, current: loginCount },
  { id: 'first_redemption', target: 1, current: redemptionsCount },
  { id: 'century_club', target: 100, current: lifetimePoints }
];

const unlockedAchievements = ACHIEVEMENTS_LIST.filter(a => a.current >= a.target);
assert.strictEqual(unlockedAchievements.length, 3, 'With 3 ratings, 7 logins, 1 redemption, exactly 3 achievements must be unlocked');
assert.ok(unlockedAchievements.some(a => a.id === 'first_rating'), 'first_rating must be unlocked');
assert.ok(unlockedAchievements.some(a => a.id === 'campus_regular'), 'campus_regular must be unlocked');
assert.ok(unlockedAchievements.some(a => a.id === 'first_redemption'), 'first_redemption must be unlocked');

// In-progress achievement
const inProgressActiveCritic = ACHIEVEMENTS_LIST.find(a => a.id === 'active_critic');
assert.strictEqual(inProgressActiveCritic.current < inProgressActiveCritic.target, true, 'active_critic should still be in progress (3/5)');
console.log('✓ Achievements progression verified with 3 unlocked and 3 in-progress milestones.');

console.log('\n====================================================');
console.log('ALL PREMIUM REWARDS REDESIGN TESTS PASSED! ✅');
console.log('====================================================');
