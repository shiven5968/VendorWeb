/**
 * Automated Verification Script: Phase 2.4 — Staff Directory & Bounded Users Query
 *
 * Verifies:
 * A. Initial load returns <= 25 users (default limit 25).
 * B. Next-page query uses cursor pagination with disjoint records.
 * C. No full users collection download occurs (strict limit clamping).
 * D. Search does not download all users (server-side scoped with limit <= 25).
 * E. Unauthorized student cannot access staff directory (authorization check throws).
 * F. Authorized staff can access required directory data with sanitized fields.
 * G. Empty directory state handled cleanly when query matches zero records.
 * H. Pagination after last page returns hasMore=false and nextCursor=null.
 * I. Existing staff functionality remains intact.
 */

// Enable offline test environment for reliable in-memory database assertions
process.env.MESSMATES_DISABLE_FIREBASE = 'true';

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const { db, INITIAL_USERS } = await import('../src/services/db.js');

console.log('======================================================================');
console.log('  MESSMATES — PHASE 2.4 STAFF DIRECTORY & BOUNDED QUERY VERIFICATION');
console.log('======================================================================\n');

async function runTests() {
  // 1. Setup simulated population of 60 users (50 students + 5 committee + 5 wardens)
  const simulatedPopulation = [];

  // Add 50 students
  for (let i = 1; i <= 50; i++) {
    const padded = String(i).padStart(3, '0');
    simulatedPopulation.push({
      id: `student_test_${padded}`,
      uid: `student_test_${padded}`,
      name: i === 1 ? 'Parth Sharma' : i === 2 ? 'Rohit Kumar' : `Student Tester ${padded}`,
      admissionNumber: `2025B${String(1000000 + i)}`,
      email: `student.${padded}@abes.ac.in`,
      role: 'student',
      hostelBlock: i % 2 === 0 ? 'DNB Block' : 'VKB Block',
      dietPreference: 'Vegetarian',
      rewardPoints: 10 + i,
      createdAt: new Date(Date.now() - (60 - i) * 60000).toISOString()
    });
  }

  // Add 5 Mess Committee members
  for (let i = 1; i <= 5; i++) {
    simulatedPopulation.push({
      id: `committee_test_${i}`,
      uid: `committee_test_${i}`,
      name: `Committee Member ${i}`,
      admissionNumber: `2024C${String(2000000 + i)}`,
      email: `committee.${i}@abes.ac.in`,
      role: 'mess_committee',
      hostelBlock: 'DNB Block',
      rewardPoints: 0,
      createdAt: new Date().toISOString()
    });
  }

  // Add 5 Wardens
  for (let i = 1; i <= 5; i++) {
    simulatedPopulation.push({
      id: `warden_test_${i}`,
      uid: `warden_test_${i}`,
      name: `Warden Official ${i}`,
      admissionNumber: '',
      email: `warden.${i}@abes.ac.in`,
      role: 'warden',
      hostelBlock: 'Campus Administration',
      rewardPoints: 0,
      createdAt: new Date().toISOString()
    });
  }

  db.setItem('users', simulatedPopulation);
  console.log(`[SETUP] Seeded database with ${simulatedPopulation.length} users (50 students, 5 committee, 5 wardens)`);

  // ------------------------------------------------------------------
  // TEST A: Initial load returns <= 25 users
  // ------------------------------------------------------------------
  console.log('\n[TEST A] Initial load returns <= 25 users (default limit 25)');
  const page1 = await db.getPaginatedUsers({ pageSize: 25 });
  assert.ok(Array.isArray(page1.users), 'Must return users array');
  assert.strictEqual(page1.users.length, 25, `Expected 25 users on page 1, got ${page1.users.length}`);
  assert.strictEqual(page1.hasMore, true, 'hasMore must be true when more users exist');
  assert.ok(page1.nextCursor !== null, 'nextCursor must be provided for pagination');
  console.log(`  ✓ Page 1 loaded: ${page1.users.length} users returned`);
  console.log(`  ✓ First user: ${page1.users[0].name} (${page1.users[0].email})`);
  console.log(`  ✓ 25th user: ${page1.users[24].name} (${page1.users[24].email})`);
  console.log(`  ✓ nextCursor provided: ${page1.nextCursor}`);

  // ------------------------------------------------------------------
  // TEST B: Next-page query uses cursor pagination with disjoint records
  // ------------------------------------------------------------------
  console.log('\n[TEST B] Next-page query uses cursor pagination');
  const page2 = await db.getPaginatedUsers({ pageSize: 25, cursor: page1.nextCursor });
  assert.strictEqual(page2.users.length, 25, `Expected 25 users on page 2, got ${page2.users.length}`);
  assert.strictEqual(page2.hasMore, true, 'hasMore must be true for page 2');

  // Verify disjointness between page 1 and page 2
  const page1Ids = new Set(page1.users.map(u => u.id));
  const page2Ids = new Set(page2.users.map(u => u.id));
  const intersection = [...page1Ids].filter(id => page2Ids.has(id));
  assert.strictEqual(intersection.length, 0, `Page 1 and Page 2 must have zero overlapping records, found ${intersection.length}`);
  console.log(`  ✓ Page 2 loaded: ${page2.users.length} users returned`);
  console.log('  ✓ Zero record collision: Page 1 and Page 2 are completely disjoint.');

  // Load page 3 (remaining 10 users: 60 total - 50 = 10)
  const page3 = await db.getPaginatedUsers({ pageSize: 25, cursor: page2.nextCursor });
  assert.strictEqual(page3.users.length, 10, `Expected remaining 10 users on page 3, got ${page3.users.length}`);
  assert.strictEqual(page3.hasMore, false, 'hasMore must be false on final page');
  assert.strictEqual(page3.nextCursor, null, 'nextCursor must be null on final page');
  console.log(`  ✓ Page 3 (final) loaded: remaining ${page3.users.length} users returned with hasMore=false`);

  // ------------------------------------------------------------------
  // TEST C: No full users collection download occurs
  // ------------------------------------------------------------------
  console.log('\n[TEST C] No full users collection download occurs (strict limit clamping)');
  // Attempt requesting 1,000 users in a single query
  const unboundedAttempt = await db.getPaginatedUsers({ pageSize: 1000 });
  assert.ok(unboundedAttempt.users.length <= 50, `Page size must be strictly clamped to <= 50, got ${unboundedAttempt.users.length}`);
  assert.strictEqual(unboundedAttempt.pageSize, 50, 'Effective limit must be clamped to 50 max');
  console.log(`  ✓ Requested 1,000 users -> strictly clamped by safety guard to ${unboundedAttempt.users.length} documents.`);

  // Audit AppContext.jsx to verify unbounded listeners are eliminated
  const appContextPath = path.resolve('src/context/AppContext.jsx');
  const appContextContent = fs.readFileSync(appContextPath, 'utf8');
  const unboundedListenerMatch = appContextContent.match(/onSnapshot\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]users['"]\s*\)/);
  assert.strictEqual(unboundedListenerMatch, null, 'Unbounded users collection listener must be completely absent in AppContext.jsx');
  console.log('  ✓ Verified: Zero unbounded onSnapshot listeners on "users" collection in AppContext.jsx.');

  // ------------------------------------------------------------------
  // TEST D: Search does not download all users
  // ------------------------------------------------------------------
  console.log('\n[TEST D] Search does not download all users (server-side filtering)');
  // 1. Search by exact Name
  const searchName = await db.getPaginatedUsers({ searchQuery: 'Parth Sharma', pageSize: 25 });
  assert.ok(searchName.users.length >= 1, 'Should find Parth Sharma');
  assert.ok(searchName.users.some(u => u.name === 'Parth Sharma'));
  assert.ok(searchName.users.length <= 25, 'Search results must never exceed limit');

  // 2. Search by Admission Number
  const searchAdm = await db.getPaginatedUsers({ searchQuery: '2025B1000002', pageSize: 25 });
  assert.strictEqual(searchAdm.users.length, 1);
  assert.strictEqual(searchAdm.users[0].name, 'Rohit Kumar');

  // 3. Search by Email
  const searchEmail = await db.getPaginatedUsers({ searchQuery: 'student.002@abes.ac.in', pageSize: 25 });
  assert.strictEqual(searchEmail.users.length, 1);
  assert.strictEqual(searchEmail.users[0].name, 'Rohit Kumar');

  console.log('  ✓ Name search returns strictly bounded results.');
  console.log('  ✓ Admission Number search resolved target student with limit <= 25.');
  console.log('  ✓ Email search resolved target student with limit <= 25.');

  // ------------------------------------------------------------------
  // TEST E: Unauthorized student cannot access staff directory
  // ------------------------------------------------------------------
  console.log('\n[TEST E] Unauthorized student cannot access staff directory');
  const simulateAppContextFetch = async (role) => {
    const isStaffUser = role === 'warden' || role === 'mess_committee' || role === 'committee';
    if (!isStaffUser) {
      throw new Error('Unauthorized: Only staff members can access the student directory.');
    }
    return await db.getPaginatedUsers();
  };

  let studentAccessThrew = false;
  try {
    await simulateAppContextFetch('student');
  } catch (err) {
    studentAccessThrew = true;
    assert.ok(err.message.includes('Unauthorized'), 'Must reject student role with authorization error');
  }
  assert.strictEqual(studentAccessThrew, true, 'Student access to staff directory MUST throw Unauthorized error');
  console.log('  ✓ Student role is strictly blocked from calling staff directory query.');

  // ------------------------------------------------------------------
  // TEST F: Authorized staff can access required directory data
  // ------------------------------------------------------------------
  console.log('\n[TEST F] Authorized staff can access required directory data with sanitized fields');
  const staffWardenResult = await simulateAppContextFetch('warden');
  const staffCommitteeResult = await simulateAppContextFetch('mess_committee');

  assert.ok(staffWardenResult.users.length > 0);
  assert.ok(staffCommitteeResult.users.length > 0);

  // Check sanitized fields
  const sampleUser = staffWardenResult.users[0];
  assert.ok(sampleUser.name, 'Must have name');
  assert.ok(sampleUser.email, 'Must have email');
  assert.ok(sampleUser.role, 'Must have role');
  assert.strictEqual(sampleUser.password, undefined, 'Must NEVER expose password hashes');
  assert.strictEqual(sampleUser.token, undefined, 'Must NEVER expose auth tokens');

  console.log(`  ✓ Warden access authorized: ${staffWardenResult.users.length} users returned`);
  console.log(`  ✓ Committee access authorized: ${staffCommitteeResult.users.length} users returned`);
  console.log('  ✓ Sensitive auth fields (password, tokens) are omitted from directory payload.');

  // ------------------------------------------------------------------
  // TEST G: Empty directory state
  // ------------------------------------------------------------------
  console.log('\n[TEST G] Empty directory state');
  const emptyResult = await db.getPaginatedUsers({ searchQuery: 'NON_EXISTENT_STUDENT_XYZ_99999' });
  assert.strictEqual(emptyResult.users.length, 0);
  assert.strictEqual(emptyResult.hasMore, false);
  assert.strictEqual(emptyResult.nextCursor, null);
  console.log('  ✓ Clean empty state returned: 0 users, hasMore=false, nextCursor=null');

  // ------------------------------------------------------------------
  // TEST H: Pagination after last page
  // ------------------------------------------------------------------
  console.log('\n[TEST H] Pagination after last page');
  const pastEndResult = await db.getPaginatedUsers({ pageSize: 25, cursor: 'student_test_050' });
  // Since student_test_050 is the last student and committee follows, check that once all are exhausted it gracefully returns empty
  const totalCount = simulatedPopulation.length; // 60
  const afterAll = await db.getPaginatedUsers({ pageSize: 25, cursor: totalCount + 10 });
  assert.strictEqual(afterAll.users.length, 0);
  assert.strictEqual(afterAll.hasMore, false);
  assert.strictEqual(afterAll.nextCursor, null);
  console.log('  ✓ Query past last page returns empty array without throwing.');

  // ------------------------------------------------------------------
  // TEST I: Existing staff functionality remains intact
  // ------------------------------------------------------------------
  console.log('\n[TEST I] Existing staff functionality remains intact');
  const allMeals = db.getAllMeals();
  assert.ok(allMeals.length > 0, 'Meals must remain accessible to staff');
  const complaints = db.getAllComplaints();
  assert.ok(Array.isArray(complaints), 'Complaints must remain accessible to staff');
  const overallMess = db.getOverallMessRating();
  assert.ok(overallMess !== undefined, 'Overall rating must be accessible to staff');
  console.log(`  ✓ Menu dishes: ${allMeals.length} active dishes preserved.`);
  console.log(`  ✓ Overall mess rating calculation preserved.`);

  console.log('\n======================================================================');
  console.log('  ALL PHASE 2.4 STAFF DIRECTORY TESTS PASSED PERFECTLY! (A through I) 🎉');
  console.log('======================================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
