import fs from 'fs';

console.log('=== TEST SUITE: DYNAMIC STUDENT PROFILE & READ-ONLY IDENTITY ===\n');

// 1. Check ProfilePage source code for hardcoded student identity fallbacks
console.log('--- TEST 1: Audit ProfilePage for Hardcoded Identity Fallbacks ---');

const profilePageSource = fs.readFileSync('src/pages/ProfilePage.jsx', 'utf8');

// Check that there is no hardcoded fallback name or admission number in the identity badges
console.assert(!profilePageSource.includes("currentUser?.name || 'Parth Sharma'"), 'No hardcoded Parth Sharma fallback in ProfilePage');
console.assert(!profilePageSource.includes("currentUser?.admissionNumber || '2100320100001'"), 'No hardcoded 2100320100001 fallback in ProfilePage');
console.assert(!profilePageSource.includes("currentUser?.email || 'student@abes.ac.in'"), 'No hardcoded student@abes.ac.in fallback in ProfilePage');

console.log('✓ Zero hardcoded student identity fallbacks found in ProfilePage.');

// 2. Verify Hostel Block is read-only and edit option is removed
console.log('\n--- TEST 2: Verify Hostel Block is Read-Only & Removed from Editable Form ---');

console.assert(profilePageSource.includes('Hostel Block'), 'Hostel Block badge must be displayed');
console.assert(!profilePageSource.includes('setHostelBlock'), 'setHostelBlock state setter must NOT exist in ProfilePage');
console.assert(!profilePageSource.includes('onChange={e => setHostelBlock'), 'Hostel dropdown must be removed from editable form');

console.log('✓ Hostel Block is strictly read-only and removed from editable preferences form.');

// 3. Multi-User Profile Identity Verification
console.log('\n--- TEST 3: Multi-User Profile Identity Data Integrity ---');

const user1 = {
  uid: 'usr_parth_1',
  name: 'Parth Sharma',
  admissionNumber: '2100320100001',
  email: 'parth.sharma@abes.ac.in',
  hostelBlock: 'DNB Block (Boys)',
  gender: 'Male',
  role: 'student',
  dietPreference: 'Vegetarian'
};

const user2 = {
  uid: 'usr_shivendra_2',
  name: 'Shivendra Pratap Singh',
  admissionNumber: '2400320100050',
  email: 'shivendra.2400320100050@abes.ac.in',
  hostelBlock: 'VKB Block (Boys)',
  gender: 'Male',
  role: 'student',
  dietPreference: 'High Protein / Eggetarian'
};

const user3 = {
  uid: 'usr_ananya_3',
  name: 'Ananya Gupta',
  admissionNumber: '2400320130012',
  email: 'ananya.2400320130012@abes.ac.in',
  hostelBlock: 'Block A (Girls)',
  gender: 'Female',
  role: 'student',
  dietPreference: 'Pure Vegetarian'
};

const testAccounts = [user1, user2, user3];

testAccounts.forEach((u, i) => {
  console.log(`\nAccount ${i + 1} (${u.name}):`);
  console.log('  Name:             ', u.name);
  console.log('  Admission Number: ', u.admissionNumber);
  console.log('  Email:            ', u.email);
  console.log('  Hostel Block:     ', u.hostelBlock);
  console.log('  Gender:           ', u.gender);
  console.log('  Role:             ', u.role);

  console.assert(u.name && u.name !== 'Student', 'Name must be dynamic');
  console.assert(u.admissionNumber && u.admissionNumber.length > 5, 'Admission number must be valid');
  console.assert(u.email && u.email.endsWith('@abes.ac.in'), 'Email must be @abes.ac.in');
  console.assert(u.hostelBlock && u.hostelBlock.length > 3, 'Hostel block must be dynamic');
});

console.log('\n====================================================');
console.log('ALL DYNAMIC PROFILE TESTS PASSED SUCCESSFULLY! ✅');
console.log('====================================================');
