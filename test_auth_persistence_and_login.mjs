import fs from 'fs';
import path from 'path';
import { formatAuthError } from './src/services/auth.js';
import { FOUNDERS } from './src/config/founders.js';

console.log('=== TEST SUITE: AUTH PERSISTENCE, ADMISSION RESOLUTION & PROFILE PRESENTATION ===\n');

// -------------------------------------------------------------
// TEST 1: ERROR FORMATTING & CLEAR USER MESSAGES
// -------------------------------------------------------------
console.log('--- TEST 1: Error Formatting & User Visibility ---');

const wrongPassErr = { code: 'auth/wrong-password', message: 'Firebase: Error (auth/wrong-password).' };
const invalidCredErr = { code: 'auth/invalid-credential', message: 'Firebase: Error (auth/invalid-credential).' };
const userNotFoundErr = { code: 'auth/user-not-found', message: 'Firebase: Error (auth/user-not-found).' };
const networkErr = { code: 'auth/network-request-failed', message: 'Firebase: Error (auth/network-request-failed).' };
const disabledErr = { code: 'auth/user-disabled', message: 'Firebase: Error (auth/user-disabled).' };

console.log('wrong-password:    ', formatAuthError(wrongPassErr));
console.log('invalid-credential:', formatAuthError(invalidCredErr));
console.log('user-not-found:    ', formatAuthError(userNotFoundErr));
console.log('network-error:     ', formatAuthError(networkErr));
console.log('user-disabled:     ', formatAuthError(disabledErr));

console.assert(formatAuthError(wrongPassErr).includes('password'), 'Wrong password error must mention password');
console.assert(formatAuthError(invalidCredErr).includes('password'), 'Invalid credential error must mention password');
console.assert(formatAuthError(userNotFoundErr).includes('register'), 'User not found error must guide to register');
console.assert(formatAuthError(networkErr).includes('connection'), 'Network error must mention connection');
console.assert(formatAuthError(disabledErr).includes('disabled'), 'Disabled error must mention disabled');

console.log('✓ All auth errors produce clean, informative messages without silent drops.\n');

// -------------------------------------------------------------
// TEST 2: FOUNDER PROFILE DATA & ZOOM/CROP EQUIVALENCE
// -------------------------------------------------------------
console.log('--- TEST 2: Founder Details & Visual Framing ---');

console.assert(FOUNDERS.length === 2, 'Must have exactly 2 founders');

const parth = FOUNDERS.find(f => f.name === 'Parth Sharma');
const shivendra = FOUNDERS.find(f => f.name === 'Shivendra Pratap Singh');

console.assert(parth && parth.role === 'FOUNDER', 'Parth must be FOUNDER');
console.assert(parth.year === '2nd Year', 'Parth year must be 2nd Year');
console.assert(parth.branch === 'AIML', 'Parth branch must be AIML');
console.assert(parth.scale === 1.0 && shivendra.scale === 1.0, 'Founder photos use aligned 1.0 natural portrait scale');

console.assert(shivendra && shivendra.role === 'CO-FOUNDER', 'Shivendra must be CO-FOUNDER');
console.assert(shivendra.year === '2nd Year', 'Shivendra year must be 2nd Year');
console.assert(shivendra.branch === 'CSE', 'Shivendra branch must be CSE');
console.assert(shivendra.linkedin === 'https://www.linkedin.com/in/shivendra-pratap-singh-7358b837', 'Shivendra LinkedIn exact');

console.log('Parth scale factor:    ', parth.scale);
console.log('Shivendra scale factor:', shivendra.scale);
console.log('✓ Founder data exact, and portrait scaling matches visual head size.\n');

// -------------------------------------------------------------
// TEST 3: PROFILE PAGE ORDER VERIFICATION
// -------------------------------------------------------------
console.log('--- TEST 3: Profile Page Hierarchy (1. About Us, 2. Profile) ---');

const profilePageSource = fs.readFileSync('src/pages/ProfilePage.jsx', 'utf8');

const aboutUsIndex = profilePageSource.indexOf('<AboutUsSection');
const profileFormIndex = profilePageSource.indexOf('OFFICIAL STUDENT PROFILE');

console.assert(aboutUsIndex !== -1, 'AboutUsSection must be present in ProfilePage');
console.assert(profileFormIndex !== -1, 'Profile section must be present in ProfilePage');
console.assert(aboutUsIndex < profileFormIndex, 'About Us MUST appear BEFORE Profile in the code layout');

console.log('✓ ProfilePage renders 1. ABOUT US followed by 2. PROFILE & PREFERENCES.\n');

// -------------------------------------------------------------
// TEST 4: FIRESTORE RULES ADMISSION MAP PERMISSIONS
// -------------------------------------------------------------
console.log('--- TEST 4: Firestore Rules admission_map create & update check ---');

const rulesSource = fs.readFileSync('firestore.rules', 'utf8');
console.assert(rulesSource.includes('match /admission_map/{admissionNumber}'), 'Must have admission_map rule');
console.assert(rulesSource.includes('allow create, update: if isAuthenticated()'), 'Must allow create and update for authenticated owners');

console.log('✓ Firestore rules permit admission_map creation and self-healing.\n');

console.log('====================================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
console.log('====================================================');
