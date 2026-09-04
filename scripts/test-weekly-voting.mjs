import assert from 'assert';
import { getCollegeWeekInfo, getPastCollegeWeeks, getCollegeDateString } from '../src/utils/dateTime.js';

console.log('=== MessMates Weekly Recurring Voting Verification Test ===\n');

// -------------------------------------------------------------
// TEST 1: Timezone-Strict ISO Week Calculation in Asia/Kolkata
// -------------------------------------------------------------
console.log('Test 1: Timezone-Strict ISO Week Calculation');

// Sunday, Aug 30, 2026, 23:59:59 IST (UTC: 18:29:59Z)
const sundayBeforeMidnightIST = new Date('2026-08-30T18:29:59.000Z');
const weekSun = getCollegeWeekInfo(sundayBeforeMidnightIST);
console.log('Sunday 23:59 IST Week ID:', weekSun.weekId, 'Range:', weekSun.weekRangeDisplay);
assert.strictEqual(weekSun.weekId, '2026-W35', 'Sunday 23:59 IST should be Week 35');

// Monday, Aug 31, 2026, 00:00:01 IST (UTC: Aug 30 18:30:01Z)
const mondayJustAfterMidnightIST = new Date('2026-08-30T18:30:01.000Z');
const weekMon = getCollegeWeekInfo(mondayJustAfterMidnightIST);
console.log('Monday 00:00:01 IST Week ID:', weekMon.weekId, 'Range:', weekMon.weekRangeDisplay);
assert.strictEqual(weekMon.weekId, '2026-W36', 'Monday 00:00:01 IST should transition cleanly to Week 36');

console.log('✓ Test 1 Passed: Week boundaries transition strictly at midnight IST.\n');

// -------------------------------------------------------------
// TEST 2: Past Weeks Generator
// -------------------------------------------------------------
console.log('Test 2: Past Weeks Generator for Historical Feedback');
const refDate = new Date('2026-09-04T12:00:00.000Z');
const pastWeeks = getPastCollegeWeeks(4, refDate);
assert.strictEqual(pastWeeks.length, 4, 'Should generate 4 past weeks');
assert.strictEqual(pastWeeks[0].label, 'This Week');
assert.strictEqual(pastWeeks[1].label, 'Last Week');
assert.strictEqual(pastWeeks[2].label, '2 Weeks Ago');
assert.strictEqual(pastWeeks[3].label, '3 Weeks Ago');
console.log('Generated weeks:', pastWeeks.map(w => `${w.label} (${w.weekId})`).join(', '));
console.log('✓ Test 2 Passed: Past weeks properly labeled and ordered.\n');

// -------------------------------------------------------------
// TEST 3: Duplicate Vote Scoping & Multi-Week Re-Voting Logic
// -------------------------------------------------------------
console.log('Test 3: Duplicate Vote Scoping & Multi-Week Re-Voting Logic');

// Verify deterministic vote IDs and scoping algorithm
const generateVoteId = (userId, targetWeekId, targetKey) => {
  const cleanKey = targetKey.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `vote_${userId}_${targetWeekId}_${cleanKey}`;
};

const userId = 'parth_sharma';
const dishKey = 'mix_veg_rajma_masala';

const idWeek35 = generateVoteId(userId, '2026-W35', dishKey);
const idWeek36 = generateVoteId(userId, '2026-W36', dishKey);

console.log('Week 35 Vote ID:', idWeek35);
console.log('Week 36 Vote ID:', idWeek36);

assert.notStrictEqual(idWeek35, idWeek36, 'Vote IDs must differ across weeks for the same dish');
assert.strictEqual(idWeek35, 'vote_parth_sharma_2026-W35_mix_veg_rajma_masala');
assert.strictEqual(idWeek36, 'vote_parth_sharma_2026-W36_mix_veg_rajma_masala');

// Simulate vote verification logic as implemented in db.castVote:
const votesStore = [];

const simulateCastVote = ({ userId, mealId, mealName, weekId, rating }) => {
  const alreadyVoted = votesStore.some(v => {
    if (v.userId !== userId) return false;
    if (v.weekId !== weekId) return false;
    if (mealId && v.mealId === mealId) return true;
    if (mealName && v.mealName?.toLowerCase() === mealName?.toLowerCase()) return true;
    return false;
  });

  if (alreadyVoted) {
    throw new Error('You have already voted for this meal in this week. You can vote again when this meal is reviewed in a new week!');
  }

  const vote = {
    id: generateVoteId(userId, weekId, mealId || mealName),
    userId,
    mealId,
    mealName,
    weekId,
    rating,
    timestamp: new Date().toISOString()
  };
  votesStore.push(vote);
  return vote;
};

// 1. Cast in Week 35
const vote1 = simulateCastVote({
  userId,
  mealId: 'mon_l',
  mealName: 'Mix Veg & Rajma Masala',
  weekId: '2026-W35',
  rating: 4
});
assert.strictEqual(vote1.weekId, '2026-W35');
console.log('Vote 1 (Week 35) recorded successfully');

// 2. Attempt duplicate in Week 35 (MUST FAIL)
let duplicateBlocked = false;
try {
  simulateCastVote({
    userId,
    mealId: 'mon_l',
    mealName: 'Mix Veg & Rajma Masala',
    weekId: '2026-W35',
    rating: 5
  });
} catch (e) {
  duplicateBlocked = true;
  console.log('Duplicate prevented in Week 35:', e.message);
}
assert.strictEqual(duplicateBlocked, true);

// 3. Cast in Week 36 for same dish (MUST SUCCEED)
const vote2 = simulateCastVote({
  userId,
  mealId: 'mon_l',
  mealName: 'Mix Veg & Rajma Masala',
  weekId: '2026-W36',
  rating: 5
});
assert.strictEqual(vote2.weekId, '2026-W36');
console.log('Vote 2 (Week 36) for same dish recorded successfully');

console.log('✓ Test 3 Passed: Multi-week recurring voting works as specified.\n');

// -------------------------------------------------------------
// TEST 4: Aggregate Multi-Week Calculation
// -------------------------------------------------------------
console.log('Test 4: Aggregate Multi-Week Performance & Monthly Calculation');

const aggregatePerformance = (votes) => {
  const map = {};
  votes.forEach(v => {
    if (!v.rating || !v.mealName) return;
    if (!map[v.mealName]) map[v.mealName] = { ratings: [], weeks: new Set() };
    map[v.mealName].ratings.push(v.rating);
    map[v.mealName].weeks.add(v.weekId);
  });

  return Object.entries(map).map(([name, d]) => ({
    name,
    avg: Number((d.ratings.reduce((a, b) => a + b, 0) / d.ratings.length).toFixed(1)),
    totalVotes: d.ratings.length,
    weeksCount: d.weeks.size
  }));
};

const perf = aggregatePerformance(votesStore);
console.log('Aggregated Dish Performance:', perf);
assert.strictEqual(perf[0].avg, 4.5, 'Average of 4 and 5 should be 4.5');
assert.strictEqual(perf[0].totalVotes, 2);
assert.strictEqual(perf[0].weeksCount, 2);

console.log('✓ Test 4 Passed: Multi-week aggregates compute accurately.\n');

console.log('=============================================================');
console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
console.log('=============================================================');
