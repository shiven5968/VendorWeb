/**
 * Automated Test Suite: Multi-Mess Menu Routing & Student/Official Access Verification
 * 
 * Verifies:
 *   1. 2025B -> junior
 *   2. 2026B -> junior
 *   3. 2024B -> senior
 *   4. 2023B -> senior
 *   5. girls -> girls
 *   6. unknown prefix -> NOT automatically junior (unresolved / null)
 *   7. Normal student cannot manually switch messes (restricted to resolved mess)
 *   8. Officials can still switch and view all 3 messes independently
 *   9. Menu data integrity (7x4 matrix completeness)
 *   10. Strict meal separation (no cross-contamination between messes)
 *   11. Sunday snacks OFF handling across all messes
 */

import { 
  getMessForStudent, 
  MESS_CONFIG, 
  ADMISSION_PREFIX_TO_MESS,
  getMessOptions,
  getMessById,
  isGirlsProfile
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
console.log('TEST SUITE: MULTI-MESS MENU ROUTING & ACCESS VERIFICATION');
console.log('============================================================\n');

// ── TEST 1: ADMISSION NUMBER PREFIX ROUTING ───────────────────────────────
console.log('1. Required Prefix Routing:');

// 2025B -> junior
const res2025 = getMessForStudent({ admissionNumber: '2025B01010012' });
assert(res2025 && res2025.id === 'boys_junior', '2025B -> junior (Boys Junior Mess)');

// 2026B -> junior
const res2026 = getMessForStudent({ admissionNumber: '2026B01010545' });
assert(res2026 && res2026.id === 'boys_junior', '2026B -> junior (Boys Junior Mess)');

// 2024B -> senior
const res2024 = getMessForStudent({ admissionNumber: '2024B1531068' });
assert(res2024 && res2024.id === 'boys_senior', '2024B -> senior (Boys Senior Mess)');

// 2023B -> senior
const res2023 = getMessForStudent({ admissionNumber: '2023B0131224' });
assert(res2023 && res2023.id === 'boys_senior', '2023B -> senior (Boys Senior Mess)');

// ── TEST 2: GIRLS HOSTEL CONTEXT ROUTING ──────────────────────────────────
console.log('\n2. Girls Context Routing:');

const girlsBlocks = ['Block A (Girls)', 'Block B (Girls)', 'Block C (Girls)', 'Girls Hostel Wing'];
girlsBlocks.forEach(block => {
  const result = getMessForStudent({ hostelBlock: block });
  assert(result && result.id === 'girls', `girls (${block}) -> girls (Girls Hostel Mess)`);
});

// Girls context takes priority over admission number
const girlsWithSeniorAdm = getMessForStudent({ 
  admissionNumber: '2024B1531068', 
  hostelBlock: 'Block A (Girls)' 
});
assert(girlsWithSeniorAdm && girlsWithSeniorAdm.id === 'girls', 'Girls profile context takes priority over admission number');

// Female gender context
const girlsGenderProfile = getMessForStudent({ gender: 'Female' });
assert(girlsGenderProfile && girlsGenderProfile.id === 'girls', 'Female profile context -> girls');

// ── TEST 3: NORMALIZATION & TRIMMING ──────────────────────────────────────
console.log('\n3. Normalization (Case-insensitivity & Trimming):');

assert(getMessForStudent({ admissionNumber: '  2025b0101001  ' })?.id === 'boys_junior', 'Lowercase 2025b with spaces -> junior');
assert(getMessForStudent({ admissionNumber: '  2026b0101001  ' })?.id === 'boys_junior', 'Lowercase 2026b with spaces -> junior');
assert(getMessForStudent({ admissionNumber: '  2024b1531068\t' })?.id === 'boys_senior', 'Lowercase 2024b with tab -> senior');
assert(getMessForStudent({ admissionNumber: '2023b0131224\n' })?.id === 'boys_senior', 'Lowercase 2023b with newline -> senior');

// ── TEST 4: UNKNOWN ADMISSION FALLBACK (NEVER JUNIOR) ─────────────────────
console.log('\n4. Unknown Prefix Fallback (NEVER automatically Junior):');

const unknownCases = [
  { profile: { admissionNumber: 'UNKNOWN9999' }, desc: 'Unknown prefix "UNKNOWN9999"' },
  { profile: { admissionNumber: '1999B0000000' }, desc: 'Historical unlisted prefix "1999B0000000"' },
  { profile: { admissionNumber: 'EXT2026001' }, desc: 'Non-standard prefix "EXT2026001"' },
  { profile: { admissionNumber: 'ABCD12345' }, desc: 'Arbitrary string "ABCD12345"' },
  { profile: { admissionNumber: '' }, desc: 'Empty admission number' },
  { profile: {}, desc: 'Empty profile object' },
  { profile: null, desc: 'Null profile' },
  { profile: { admissionNumber: '2027B0101001' }, desc: 'Unregistered batch "2027B0101001"' },
];

unknownCases.forEach(uc => {
  const result = getMessForStudent(uc.profile);
  assert(result === null, `${uc.desc} -> returns null (unresolved)`);
  assert(result?.id !== 'boys_junior', `${uc.desc} -> NOT automatically junior`);
});

// Verify getMenuByMessId for unknown/null messId
assert(getMenuByMessId(null) === null, 'getMenuByMessId(null) returns null (no menu leak)');
assert(getMenuByMessId('unknown') === null, 'getMenuByMessId("unknown") returns null (never junior)');

// ── TEST 5: STUDENT CANNOT MANUALLY SWITCH MESSES ─────────────────────────
console.log('\n5. Student Access Control (Cannot manually switch messes):');

// Simulate the MenuPage active mess resolution logic
function resolveMenuPageActiveMess({ currentUser, currentRole, selectedMessOverride }) {
  const isOfficial = currentRole === 'warden' || currentRole === 'mess_committee' || currentUser?.role === 'warden' || currentUser?.role === 'mess_committee';
  const resolvedMess = getMessForStudent(currentUser);
  // Normal students see ONLY their resolved mess menu and cannot switch
  return isOfficial && selectedMessOverride ? selectedMessOverride : resolvedMess;
}

// Case A: Junior student tries to override to senior
const juniorStudent = { admissionNumber: '2025B0101001', role: 'student' };
const juniorActiveMess = resolveMenuPageActiveMess({
  currentUser: juniorStudent,
  currentRole: 'student',
  selectedMessOverride: MESS_CONFIG.boys_senior // Attempted manual switch!
});
assert(juniorActiveMess.id === 'boys_junior', 'Normal Junior student CANNOT manually switch to Senior (locked to boys_junior)');

// Case B: Senior student tries to override to girls
const seniorStudent = { admissionNumber: '2024B1531068', role: 'student' };
const seniorActiveMess = resolveMenuPageActiveMess({
  currentUser: seniorStudent,
  currentRole: 'student',
  selectedMessOverride: MESS_CONFIG.girls // Attempted manual switch!
});
assert(seniorActiveMess.id === 'boys_senior', 'Normal Senior student CANNOT manually switch to Girls (locked to boys_senior)');

// Case C: Girls student tries to override to junior
const girlsStudent = { hostelBlock: 'Block A (Girls)', role: 'student' };
const girlsActiveMess = resolveMenuPageActiveMess({
  currentUser: girlsStudent,
  currentRole: 'student',
  selectedMessOverride: MESS_CONFIG.boys_junior // Attempted manual switch!
});
assert(girlsActiveMess.id === 'girls', 'Normal Girls student CANNOT manually switch to Junior (locked to girls)');

// ── TEST 6: OFFICIALS RETAIN INDEPENDENT ACCESS TO ALL 3 MESSES ──────────
console.log('\n6. Officials Access (Can switch and view all 3 messes):');

const wardenUser = { role: 'warden', email: 'warden@abes.ac.in' };

// Warden selects Junior
const officialJunior = resolveMenuPageActiveMess({
  currentUser: wardenUser,
  currentRole: 'warden',
  selectedMessOverride: MESS_CONFIG.boys_junior
});
assert(officialJunior.id === 'boys_junior', 'Official can switch to Boys Junior');

// Warden selects Senior
const officialSenior = resolveMenuPageActiveMess({
  currentUser: wardenUser,
  currentRole: 'warden',
  selectedMessOverride: MESS_CONFIG.boys_senior
});
assert(officialSenior.id === 'boys_senior', 'Official can switch to Boys Senior');

// Warden selects Girls
const officialGirls = resolveMenuPageActiveMess({
  currentUser: wardenUser,
  currentRole: 'warden',
  selectedMessOverride: MESS_CONFIG.girls
});
assert(officialGirls.id === 'girls', 'Official can switch to Girls Mess');

// Official getTodayHostelMeals for all 3 messes
const offJuniorToday = getTodayHostelMeals('Monday', null, 'boys_junior');
const offSeniorToday = getTodayHostelMeals('Monday', null, 'boys_senior');
const offGirlsToday = getTodayHostelMeals('Monday', null, 'girls');

assert(offJuniorToday[0].name === 'Veg Fried Idli & Plain Idli', 'Official sees Junior Mon Breakfast: "Veg Fried Idli & Plain Idli"');
assert(offSeniorToday[0].name === 'Matar Kulche & Tea', 'Official sees Senior Mon Breakfast: "Matar Kulche & Tea"');
assert(offGirlsToday[0].name === 'Fried Idli, Sambar & Nariyal Chatni', 'Official sees Girls Mon Breakfast: "Fried Idli, Sambar & Nariyal Chatni"');

// ── TEST 7: MENU DATA INTEGRITY & 7x4 COMPLETENESS ────────────────────────
console.log('\n7. Menu Data Integrity & 7x4 Matrix Completeness:');

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

  assert(mealCount === 28, `${m.name} has exactly 28 meals (7x4)`);
  assert(allHaveTitles, `${m.name}: all 28 meals have titles`);
  assert(allHaveItems, `${m.name}: all 28 meals have non-empty items array`);
});

// ── TEST 8: CROSS-MESS SEPARATION ─────────────────────────────────────────
console.log('\n8. Cross-Mess Separation Verification:');

assert(BOYS_JUNIOR_WEEKLY_MENU.Monday.Breakfast.title !== BOYS_SENIOR_WEEKLY_MENU.Monday.Breakfast.title, 'Junior and Senior Mon Breakfast titles distinct');
assert(BOYS_SENIOR_WEEKLY_MENU.Monday.Breakfast.title !== GIRLS_WEEKLY_MENU.Monday.Breakfast.title, 'Senior and Girls Mon Breakfast titles distinct');
assert(BOYS_JUNIOR_WEEKLY_MENU.Monday.Lunch.title !== BOYS_SENIOR_WEEKLY_MENU.Monday.Lunch.title, 'Junior and Senior Mon Lunch titles distinct');
assert(BOYS_SENIOR_WEEKLY_MENU.Monday.Lunch.title !== GIRLS_WEEKLY_MENU.Monday.Lunch.title, 'Senior and Girls Mon Lunch titles distinct');

// ── TEST 9: SUNDAY SNACKS OFF ACROSS ALL 3 MESSES ─────────────────────────
console.log('\n9. Sunday Snacks OFF Verification:');

assert(BOYS_JUNIOR_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Boys Junior Sunday Snacks is OFF');
assert(BOYS_JUNIOR_WEEKLY_MENU.Sunday.Snacks.calories === '0 kcal', 'Boys Junior Sunday Snacks is 0 kcal');
assert(BOYS_SENIOR_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Boys Senior Sunday Snacks is OFF');
assert(BOYS_SENIOR_WEEKLY_MENU.Sunday.Snacks.calories === '0 kcal', 'Boys Senior Sunday Snacks is 0 kcal');
assert(GIRLS_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Girls Sunday Snacks is OFF');
assert(GIRLS_WEEKLY_MENU.Sunday.Snacks.calories === '0 kcal', 'Girls Sunday Snacks is 0 kcal');

console.log('\n============================================================');
console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION INVARIANTS PASSED PERFECTLY!\n');
  process.exit(0);
}
