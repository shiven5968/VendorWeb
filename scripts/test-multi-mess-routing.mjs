/**
 * Automated Test Suite: Multi-Mess Menu Routing & Separation Verification
 * 
 * Verifies:
 *   1. Admission number prefix routing (2026B, 2025B, 2024B, 2023B, unknown)
 *   2. Girls hostel context priority routing
 *   3. Case-insensitivity and whitespace trimming
 *   4. Safe fallback for unlisted prefixes (no silent wrong-mess assignments)
 *   5. Complete 7x4 matrix coverage for all 3 messes (Boys Junior, Boys Senior, Girls)
 *   6. Strict meal dataset separation (no cross-mess meal contamination)
 *   7. Sunday snacks OFF handling across all messes
 */

import { 
  getMessForStudent, 
  MESS_CONFIG, 
  DEFAULT_MESS_ID,
  ADMISSION_PREFIX_TO_MESS,
  getMessOptions,
  getMessById
} from '../src/config/menuGroups.js';

import { 
  BOYS_JUNIOR_WEEKLY_MENU, 
  BOYS_SENIOR_WEEKLY_MENU, 
  GIRLS_WEEKLY_MENU,
  getMenuByMessId,
  getHostelMenu,
  getTodayHostelMeals
} from '../src/data/hostelMenus.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('TEST SUITE: MULTI-MESS MENU ROUTING & SEPARATION');
console.log('============================================================\n');

// ── TEST 1: ADMISSION NUMBER ROUTING (Cases A–D) ──────────────────────────
console.log('1. Admission Prefix Routing Matrix:');

const testCases = [
  { profile: { admissionNumber: '2026B01010545' }, expected: 'boys_junior', desc: '2026B prefix routes to Boys Junior' },
  { profile: { admissionNumber: '2025B01010012' }, expected: 'boys_junior', desc: '2025B prefix routes to Boys Junior' },
  { profile: { admissionNumber: '2024B1531068' },  expected: 'boys_senior', desc: '2024B prefix routes to Boys Senior' },
  { profile: { admissionNumber: '2023B0131224' },  expected: 'boys_senior', desc: '2023B prefix routes to Boys Senior' },
];

testCases.forEach(tc => {
  const result = getMessForStudent(tc.profile);
  assert(result.id === tc.expected, `${tc.desc} (got ${result.id})`);
});

// ── TEST 2: GIRLS HOSTEL CONTEXT PRIORITY (Cases E & H) ───────────────────
console.log('\n2. Girls Hostel Context Priority:');

const girlsBlocks = ['Block A (Girls)', 'Block B (Girls)', 'Block C (Girls)', 'Girls Hostel Wing'];
girlsBlocks.forEach(block => {
  const result = getMessForStudent({ hostelBlock: block });
  assert(result.id === 'girls', `Hostel block "${block}" routes to Girls Mess`);
});

// Case H: Girls context overrides senior admission number
const girlsWithSeniorAdm = getMessForStudent({ 
  admissionNumber: '2024B1531068', 
  hostelBlock: 'Block A (Girls)' 
});
assert(girlsWithSeniorAdm.id === 'girls', 'Girls hostel block takes priority over senior admission number');

// ── TEST 3: NORMALIZATION & TRIMMING (Case F) ──────────────────────────────
console.log('\n3. Normalization (Case-insensitivity & Trimming):');

const normCases = [
  { profile: { admissionNumber: '  2026b0101001  ' }, expected: 'boys_junior', desc: 'Lowercase + whitespace 2026b' },
  { profile: { admissionNumber: '  2024b1531068\t' },  expected: 'boys_senior', desc: 'Lowercase + whitespace 2024b' },
  { profile: { admissionNumber: '2023b0131224' },      expected: 'boys_senior', desc: 'Lowercase 2023b' },
  { profile: { admissionNumber: '2025B01010092\n' },   expected: 'boys_junior', desc: 'Trailing newline 2025B' }
];

normCases.forEach(nc => {
  const result = getMessForStudent(nc.profile);
  assert(result.id === nc.expected, `${nc.desc} (got ${result.id})`);
});

// ── TEST 4: SAFE FALLBACK (Case G) ────────────────────────────────────────
console.log('\n4. Safe Fallback Behavior:');

const fallbackCases = [
  { profile: null, desc: 'Null profile falls back to default mess' },
  { profile: {}, desc: 'Empty profile falls back to default mess' },
  { profile: { admissionNumber: '' }, desc: 'Empty admission number falls back to default mess' },
  { profile: { admissionNumber: 'UNKNOWN9999' }, desc: 'Unknown prefix falls back to default mess' },
  { profile: { admissionNumber: '1999B0000000' }, desc: 'Historical unlisted prefix falls back to default mess' },
  { profile: { admissionNumber: 'EXT2026001' }, desc: 'Non-standard prefix falls back to default mess' },
];

fallbackCases.forEach(fc => {
  const result = getMessForStudent(fc.profile);
  assert(result.id === DEFAULT_MESS_ID, `${fc.desc} (got ${result.id}, expected ${DEFAULT_MESS_ID})`);
});

// ── TEST 5: MENU DATA INTEGRITY & 7x4 COMPLETENESS ────────────────────────
console.log('\n5. Menu Data Integrity & 7x4 Matrix Completeness:');

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const categories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const menus = [
  { name: 'Boys Junior', data: BOYS_JUNIOR_WEEKLY_MENU, id: 'boys_junior' },
  { name: 'Boys Senior', data: BOYS_SENIOR_WEEKLY_MENU, id: 'boys_senior' },
  { name: 'Girls',       data: GIRLS_WEEKLY_MENU,        id: 'girls' }
];

menus.forEach(m => {
  let mealCount = 0;
  let allHaveTitles = true;
  let allHaveItems = true;

  days.forEach(day => {
    assert(m.data[day] !== undefined, `${m.name} has menu for ${day}`);
    categories.forEach(cat => {
      const meal = m.data[day]?.[cat];
      if (meal) {
        mealCount++;
        if (!meal.title) allHaveTitles = false;
        if (!Array.isArray(meal.items) || meal.items.length === 0) allHaveItems = false;
      }
    });
  });

  assert(mealCount === 28, `${m.name} has exactly 28 meals (7 days x 4 categories) — counted: ${mealCount}`);
  assert(allHaveTitles, `${m.name}: all 28 meals have titles`);
  assert(allHaveItems, `${m.name}: all 28 meals have non-empty items array`);
});

// ── TEST 6: MENU SEPARATION (NO CROSS-CONTAMINATION) ──────────────────────
console.log('\n6. Cross-Mess Separation Verification:');

// Monday Breakfast differences
const bjMonB = BOYS_JUNIOR_WEEKLY_MENU.Monday.Breakfast;
const bsMonB = BOYS_SENIOR_WEEKLY_MENU.Monday.Breakfast;
const glMonB = GIRLS_WEEKLY_MENU.Monday.Breakfast;

assert(bjMonB.title === 'Veg Fried Idli & Plain Idli', `Boys Junior Mon Breakfast is "${bjMonB.title}" (Naina Caters)`);
assert(bsMonB.title === 'Matar Kulche & Tea', `Boys Senior Mon Breakfast is "${bsMonB.title}" (Star Caterers)`);
assert(glMonB.title === 'Fried Idli, Sambar & Nariyal Chatni', `Girls Mon Breakfast is "${glMonB.title}" (GH Session 2026-27)`);

assert(bjMonB.title !== bsMonB.title, 'Boys Junior and Senior Mon Breakfast titles are strictly distinct');
assert(bsMonB.title !== glMonB.title, 'Boys Senior and Girls Mon Breakfast titles are strictly distinct');

// Monday Lunch differences
const bjMonL = BOYS_JUNIOR_WEEKLY_MENU.Monday.Lunch;
const bsMonL = BOYS_SENIOR_WEEKLY_MENU.Monday.Lunch;
const glMonL = GIRLS_WEEKLY_MENU.Monday.Lunch;

assert(bjMonL.title === 'Mix Veg & Rajma', `Boys Junior Mon Lunch: "${bjMonL.title}"`);
assert(bsMonL.title === 'Mix Veg with Paneer & Arhar Dal', `Boys Senior Mon Lunch: "${bsMonL.title}"`);
assert(glMonL.title === 'Arhar Daal & Mix Veg with Paneer', `Girls Mon Lunch: "${glMonL.title}"`);

// Tuesday Snacks differences
const bjTueS = BOYS_JUNIOR_WEEKLY_MENU.Tuesday.Snacks;
const bsTueS = BOYS_SENIOR_WEEKLY_MENU.Tuesday.Snacks;
const glTueS = GIRLS_WEEKLY_MENU.Tuesday.Snacks;

assert(bjTueS.title === 'Macaroni / Chowmein', `Boys Junior Tue Snacks: "${bjTueS.title}"`);
assert(bsTueS.title === 'Macroni / Chana Chaat & Coffee', `Boys Senior Tue Snacks: "${bsTueS.title}"`);
assert(glTueS.title === 'Chowmein & Coffee', `Girls Tue Snacks: "${glTueS.title}"`);

// ── TEST 7: SUNDAY SNACKS OFF VERIFICATION ─────────────────────────────────
console.log('\n7. Sunday Snacks OFF Verification:');

assert(BOYS_JUNIOR_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Boys Junior Sunday Snacks is OFF');
assert(BOYS_JUNIOR_WEEKLY_MENU.Sunday.Snacks.calories === '0 kcal', 'Boys Junior Sunday Snacks is 0 kcal');

assert(BOYS_SENIOR_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Boys Senior Sunday Snacks is OFF');
assert(BOYS_SENIOR_WEEKLY_MENU.Sunday.Snacks.calories === '0 kcal', 'Boys Senior Sunday Snacks is 0 kcal');

assert(GIRLS_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Girls Sunday Snacks is OFF');
assert(GIRLS_WEEKLY_MENU.Sunday.Snacks.calories === '0 kcal', 'Girls Sunday Snacks is 0 kcal');

// ── TEST 8: OFFICIALS RESOLUTION & HELPERS ─────────────────────────────────
console.log('\n8. Officials Resolution & Helpers:');

assert(getMenuByMessId('boys_junior') === BOYS_JUNIOR_WEEKLY_MENU, 'getMenuByMessId("boys_junior") returns Junior menu');
assert(getMenuByMessId('boys_senior') === BOYS_SENIOR_WEEKLY_MENU, 'getMenuByMessId("boys_senior") returns Senior menu');
assert(getMenuByMessId('girls') === GIRLS_WEEKLY_MENU, 'getMenuByMessId("girls") returns Girls menu');
assert(getMenuByMessId('unknown') === BOYS_JUNIOR_WEEKLY_MENU, 'getMenuByMessId("unknown") safely falls back to Junior menu');

const todaySeniorMeals = getTodayHostelMeals('Monday', null, 'boys_senior');
assert(todaySeniorMeals.length === 4, 'getTodayHostelMeals for Senior returns 4 meals');
assert(todaySeniorMeals[0].name === 'Matar Kulche & Tea', 'getTodayHostelMeals Senior Monday Breakfast matches');
assert(todaySeniorMeals[0].id === 'boys_senior_monday_breakfast', 'getTodayHostelMeals uses mess-scoped meal ID');

const todayJuniorMeals = getTodayHostelMeals('Monday', null, 'boys_junior');
assert(todayJuniorMeals[0].name === 'Veg Fried Idli & Plain Idli', 'getTodayHostelMeals Junior Monday Breakfast matches');

const todayGirlsMeals = getTodayHostelMeals('Monday', null, 'girls');
assert(todayGirlsMeals[0].name === 'Fried Idli, Sambar & Nariyal Chatni', 'getTodayHostelMeals Girls Monday Breakfast matches');

console.log('\n============================================================');
console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL MULTI-MESS ROUTING & SEPARATION INVARIANTS VERIFIED!\n');
  process.exit(0);
}
