/**
 * Automated Test Suite: Multi-Mess Menu Routing & Strict Block Isolation Verification
 * 
 * Verifies:
 *   1. A Block -> girls, B Block -> girls, C Block -> girls
 *   2. D Block + 2025B -> boys_junior
 *   3. D Block + 2026B -> boys_junior
 *   4. D Block + 2023B -> boys_senior
 *   5. D Block + 2024B -> boys_senior
 *   6. E Block + 2025B -> boys_junior
 *   7. F Block + 2024B -> boys_senior
 *   8. Non-A/B/C -> NEVER girls
 *   9. Regression assertion: "A BOYS hostel student must never resolve to girls."
 *   10. Unknown admission -> null / unresolved
 *   11. Missing hostel block -> unresolved / null
 *   12. Normal student cannot manually switch mess
 *   13. Official can inspect all 3 messes
 *   14. Menu dataset completeness & separation
 *   15. Sunday snacks OFF across all messes
 */

import { 
  getMessForStudent, 
  MESS_CONFIG, 
  isGirlsHostelBlock,
  ADMISSION_PREFIX_TO_MESS,
  getMessOptions,
  getMessById
} from '../src/config/menuGroups.js';

import { 
  BOYS_JUNIOR_WEEKLY_MENU, 
  BOYS_SENIOR_WEEKLY_MENU, 
  GIRLS_WEEKLY_MENU,
  getMenuByMessId,
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
console.log('TEST SUITE: MULTI-MESS MENU ROUTING & STRICT ISOLATION');
console.log('============================================================\n');

// ── TEST 1: STRICT GIRLS HOSTEL BLOCKS (A, B, C ONLY) ─────────────────────
console.log('1. Girls Blocks Resolution (A, B, C ONLY):');

const girlsVariants = [
  'A Block', 'B Block', 'C Block',
  'a block', 'b block', 'c block',
  ' A Block ', ' B Block ', ' C Block ',
  'A', 'B', 'C', 'a', 'b', 'c',
  'Block A', 'Block B', 'Block C',
  'block a', 'block b', 'block c',
  'Block A (Girls)', 'Block B (Girls)', 'Block C (Girls)',
  'A-Block', 'B-Block', 'C-Block'
];

girlsVariants.forEach(block => {
  const isGirls = isGirlsHostelBlock(block);
  assert(isGirls === true, `isGirlsHostelBlock("${block}") === true`);
  const res = getMessForStudent({ hostelBlock: block });
  assert(res && res.id === 'girls', `getMessForStudent({ hostelBlock: "${block}" }) -> girls`);
});

// Explicit required assertions:
assert(getMessForStudent({ hostelBlock: 'A Block' })?.id === 'girls', 'A Block -> girls');
assert(getMessForStudent({ hostelBlock: 'B Block' })?.id === 'girls', 'B Block -> girls');
assert(getMessForStudent({ hostelBlock: 'C Block' })?.id === 'girls', 'C Block -> girls');

// ── TEST 2: BOYS JUNIOR / SENIOR ROUTING ON BOYS BLOCKS ───────────────────
console.log('\n2. Boys Blocks Junior & Senior Routing:');

// D Block
assert(getMessForStudent({ hostelBlock: 'D Block', admissionNumber: '2025B0101001' })?.id === 'boys_junior', 'D Block + 2025B -> boys_junior');
assert(getMessForStudent({ hostelBlock: 'D Block', admissionNumber: '2026B0101001' })?.id === 'boys_junior', 'D Block + 2026B -> boys_junior');
assert(getMessForStudent({ hostelBlock: 'D Block', admissionNumber: '2023B0101001' })?.id === 'boys_senior', 'D Block + 2023B -> boys_senior');
assert(getMessForStudent({ hostelBlock: 'D Block', admissionNumber: '2024B1531068' })?.id === 'boys_senior', 'D Block + 2024B -> boys_senior');

// E Block & F Block
assert(getMessForStudent({ hostelBlock: 'E Block', admissionNumber: '2025B0101001' })?.id === 'boys_junior', 'E Block + 2025B -> boys_junior');
assert(getMessForStudent({ hostelBlock: 'F Block', admissionNumber: '2024B1531068' })?.id === 'boys_senior', 'F Block + 2024B -> boys_senior');

// Campus named boys blocks: DNB, VKB, RKB, ABB
assert(getMessForStudent({ hostelBlock: 'DNB Block', admissionNumber: '2025B0101001' })?.id === 'boys_junior', 'DNB Block + 2025B -> boys_junior');
assert(getMessForStudent({ hostelBlock: 'VKB Block', admissionNumber: '2026B0101001' })?.id === 'boys_junior', 'VKB Block + 2026B -> boys_junior');
assert(getMessForStudent({ hostelBlock: 'RKB Block', admissionNumber: '2023B0101001' })?.id === 'boys_senior', 'RKB Block + 2023B -> boys_senior');
assert(getMessForStudent({ hostelBlock: 'ABB Block', admissionNumber: '2024B1531068' })?.id === 'boys_senior', 'ABB Block + 2024B -> boys_senior');

// Case-insensitivity & whitespace normalization in admission number
assert(getMessForStudent({ hostelBlock: 'DNB Block', admissionNumber: '  2025b0101001  ' })?.id === 'boys_junior', 'DNB Block + " 2025b... " -> boys_junior');
assert(getMessForStudent({ hostelBlock: 'ABB Block', admissionNumber: '2024b1531068\t' })?.id === 'boys_senior', 'ABB Block + "2024b...\t" -> boys_senior');

// ── TEST 3: NON-A/B/C HOSTEL BLOCKS MUST NEVER RESOLVE TO GIRLS ───────────
console.log('\n3. Non-A/B/C Blocks Invariant (NEVER girls):');

const nonGirlsBlocks = [
  'DNB Block', 'VKB Block', 'RKB Block', 'ABB Block',
  'D Block', 'E Block', 'F Block', 'G Block', 'H Block',
  'd block', 'e block', 'f block',
  'Admin Block', 'Hostel Office', 'Girls Hostel Wing'
];

nonGirlsBlocks.forEach(blk => {
  assert(isGirlsHostelBlock(blk) === false, `isGirlsHostelBlock("${blk}") === false`);
  
  // Test with junior admission
  const resJunior = getMessForStudent({ hostelBlock: blk, admissionNumber: '2025B0101001' });
  assert(resJunior?.id !== 'girls', `${blk} with 2025B is NEVER girls (got ${resJunior?.id})`);

  // Test with senior admission
  const resSenior = getMessForStudent({ hostelBlock: blk, admissionNumber: '2024B1531068' });
  assert(resSenior?.id !== 'girls', `${blk} with 2024B is NEVER girls (got ${resSenior?.id})`);

  // Test with unknown admission
  const resUnknown = getMessForStudent({ hostelBlock: blk, admissionNumber: 'UNKNOWN999' });
  assert(resUnknown?.id !== 'girls', `${blk} with UNKNOWN is NEVER girls (got ${resUnknown?.id})`);
});

// ── TEST 4: REGRESSION TEST FOR CURRENT BUG ───────────────────────────────
console.log('\n4. Explicit Regression Assertions for Current Bug:');

// Critical assertion: A BOYS hostel student must never resolve to girls
const boysAccounts = [
  { hostelBlock: 'DNB Block', admissionNumber: '2025B0101001', gender: 'male', desc: 'DNB Junior Boy' },
  { hostelBlock: 'DNB Block', admissionNumber: '2024B1531068', gender: 'male', desc: 'DNB Senior Boy' },
  { hostelBlock: 'ABB Block', admissionNumber: '2025B0101001', gender: 'male', desc: 'ABB Junior Boy' },
  { hostelBlock: 'ABB Block', admissionNumber: '2024B1531068', gender: 'male', desc: 'ABB Senior Boy' },
  { hostelBlock: 'VKB Block', admissionNumber: '2026B0101001', gender: 'male', desc: 'VKB Junior Boy' },
  { hostelBlock: 'RKB Block', admissionNumber: '2023B0101001', gender: 'male', desc: 'RKB Senior Boy' },
  { hostelBlock: 'D Block',   admissionNumber: '2025B0101001', gender: 'male', desc: 'D Block Junior Boy' },
  { hostelBlock: 'DNB Block', admissionNumber: '2025B0101001', gender: 'female', desc: 'DNB Boy with erroneous gender field' }
];

boysAccounts.forEach(account => {
  const res = getMessForStudent(account);
  assert(res?.id !== 'girls', `A BOYS hostel student must never resolve to girls (${account.desc})`);
  assert(res?.id === 'boys_junior' || res?.id === 'boys_senior', `${account.desc} successfully routes to a BOYS mess (${res?.id})`);
});

// ── TEST 5: UNKNOWN / MISSING ALLOCATION SAFETY ───────────────────────────
console.log('\n5. Unknown / Missing Allocation Safety (NEVER girls, NEVER junior fallback):');

// Missing hostel block -> null
assert(getMessForStudent({ hostelBlock: '', admissionNumber: '2025B0101001' }) === null, 'Missing hostel block ("") -> null (unresolved)');
assert(getMessForStudent({ hostelBlock: '   ', admissionNumber: '2025B0101001' }) === null, 'Whitespace hostel block ("   ") -> null (unresolved)');
assert(getMessForStudent({ admissionNumber: '2025B0101001' }) === null, 'Undefined hostel block -> null (unresolved)');
assert(getMessForStudent(null) === null, 'Null profile -> null (unresolved)');
assert(getMessForStudent({}) === null, 'Empty profile -> null (unresolved)');

// Unknown admission number on boys block -> null (NOT boys_junior!)
assert(getMessForStudent({ hostelBlock: 'DNB Block', admissionNumber: 'UNKNOWN999' }) === null, 'DNB Block + UNKNOWN prefix -> null (NOT junior)');
assert(getMessForStudent({ hostelBlock: 'D Block', admissionNumber: '1999B0000000' }) === null, 'D Block + historical unlisted prefix -> null (NOT junior)');
assert(getMessForStudent({ hostelBlock: 'E Block', admissionNumber: 'EXT2026001' }) === null, 'E Block + non-standard prefix -> null (NOT junior)');
assert(getMessForStudent({ hostelBlock: 'ABB Block', admissionNumber: '' }) === null, 'ABB Block + empty admission number -> null (NOT junior)');

// getMenuByMessId for null/unknown
assert(getMenuByMessId(null) === null, 'getMenuByMessId(null) === null');
assert(getMenuByMessId('unknown') === null, 'getMenuByMessId("unknown") === null');

// ── TEST 6: NORMAL STUDENT CANNOT MANUALLY SWITCH MESS ────────────────────
console.log('\n6. Normal Student Access Control:');

function resolveMenuPageActiveMess({ currentUser, currentRole, selectedMessOverride }) {
  const isOfficial = currentRole === 'warden' || currentRole === 'mess_committee' || currentUser?.role === 'warden' || currentUser?.role === 'mess_committee';
  const resolvedMess = getMessForStudent(currentUser);
  return isOfficial && selectedMessOverride ? selectedMessOverride : resolvedMess;
}

// Junior student cannot switch to Senior or Girls
const normalJunior = { hostelBlock: 'DNB Block', admissionNumber: '2025B0101001', role: 'student' };
assert(resolveMenuPageActiveMess({ currentUser: normalJunior, currentRole: 'student', selectedMessOverride: MESS_CONFIG.boys_senior })?.id === 'boys_junior', 'Normal student cannot switch to Senior (locked to boys_junior)');
assert(resolveMenuPageActiveMess({ currentUser: normalJunior, currentRole: 'student', selectedMessOverride: MESS_CONFIG.girls })?.id === 'boys_junior', 'Normal student cannot switch to Girls (locked to boys_junior)');

// Senior student cannot switch to Junior or Girls
const normalSenior = { hostelBlock: 'ABB Block', admissionNumber: '2024B1531068', role: 'student' };
assert(resolveMenuPageActiveMess({ currentUser: normalSenior, currentRole: 'student', selectedMessOverride: MESS_CONFIG.boys_junior })?.id === 'boys_senior', 'Normal student cannot switch to Junior (locked to boys_senior)');
assert(resolveMenuPageActiveMess({ currentUser: normalSenior, currentRole: 'student', selectedMessOverride: MESS_CONFIG.girls })?.id === 'boys_senior', 'Normal student cannot switch to Girls (locked to boys_senior)');

// Girls student cannot switch to Junior or Senior
const normalGirls = { hostelBlock: 'Block A (Girls)', role: 'student' };
assert(resolveMenuPageActiveMess({ currentUser: normalGirls, currentRole: 'student', selectedMessOverride: MESS_CONFIG.boys_junior })?.id === 'girls', 'Normal Girls student cannot switch to Junior (locked to girls)');
assert(resolveMenuPageActiveMess({ currentUser: normalGirls, currentRole: 'student', selectedMessOverride: MESS_CONFIG.boys_senior })?.id === 'girls', 'Normal Girls student cannot switch to Senior (locked to girls)');

// ── TEST 7: OFFICIAL CAN INSPECT ALL 3 MESSES ─────────────────────────────
console.log('\n7. Officials Can Inspect All 3 Messes:');

const wardenUser = { role: 'warden', email: 'warden@abes.ac.in' };

assert(resolveMenuPageActiveMess({ currentUser: wardenUser, currentRole: 'warden', selectedMessOverride: MESS_CONFIG.boys_junior })?.id === 'boys_junior', 'Official can inspect Boys Junior');
assert(resolveMenuPageActiveMess({ currentUser: wardenUser, currentRole: 'warden', selectedMessOverride: MESS_CONFIG.boys_senior })?.id === 'boys_senior', 'Official can inspect Boys Senior');
assert(resolveMenuPageActiveMess({ currentUser: wardenUser, currentRole: 'warden', selectedMessOverride: MESS_CONFIG.girls })?.id === 'girls', 'Official can inspect Girls');

// Official meals resolution
const offJunior = getTodayHostelMeals('Monday', null, 'boys_junior');
const offSenior = getTodayHostelMeals('Monday', null, 'boys_senior');
const offGirls = getTodayHostelMeals('Monday', null, 'girls');

assert(offJunior[0].name === 'Veg Fried Idli & Plain Idli', 'Official sees Junior dishes');
assert(offSenior[0].name === 'Matar Kulche & Tea', 'Official sees Senior dishes');
assert(offGirls[0].name === 'Fried Idli, Sambar & Nariyal Chatni', 'Official sees Girls dishes');

// ── TEST 8: MENU INTEGRITY & DATA SEPARATION ──────────────────────────────
console.log('\n8. Menu Integrity & Data Separation:');

assert(BOYS_JUNIOR_WEEKLY_MENU.Monday.Breakfast.title !== BOYS_SENIOR_WEEKLY_MENU.Monday.Breakfast.title, 'Junior and Senior Mon Breakfast distinct');
assert(BOYS_SENIOR_WEEKLY_MENU.Monday.Breakfast.title !== GIRLS_WEEKLY_MENU.Monday.Breakfast.title, 'Senior and Girls Mon Breakfast distinct');
assert(BOYS_JUNIOR_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Junior Sunday Snacks OFF');
assert(BOYS_SENIOR_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Senior Sunday Snacks OFF');
assert(GIRLS_WEEKLY_MENU.Sunday.Snacks.title === 'OFF', 'Girls Sunday Snacks OFF');

console.log('\n============================================================');
console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED WITH 100% SUCCESS!\n');
  process.exit(0);
}
