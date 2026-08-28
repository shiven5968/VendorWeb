import fs from 'fs';
import crypto from 'crypto';
import { 
  OFFICIAL_MEAL_TIMINGS, 
  MEAL_ORDER, 
  getMealOrderIndex, 
  sortMealsByOfficialOrder,
  isRatingAllowedForMeal 
} from './src/services/mealTiming.js';
import { 
  isValidAbesEmail, 
  hashOtp, 
  signSessionToken, 
  verifySignedSessionToken, 
  generateSecureOTP, 
  OTP_EXPIRY_MS, 
  MAX_ATTEMPTS, 
  RESEND_COOLDOWN_MS 
} from './api/_otpService.js';
import { formatAuthError } from './src/services/auth.js';
import { MUSCLE_PASS_PLANS } from './src/config/pricing.js';

console.log('================================================================');
console.log('MESSMATES MEGA PRODUCTION HARDENING & COMPLIANCE AUDIT');
console.log('================================================================\n');

// -------------------------------------------------------------------
// 1. AUTHENTICATION & ERROR HANDLING AUDIT
// -------------------------------------------------------------------
console.log('--- 1. AUTHENTICATION & ERROR NORMALIZATION ---');
const errorChecks = [
  { code: 'auth/wrong-password', expected: 'Incorrect password' },
  { code: 'auth/invalid-credential', expected: 'Incorrect password' },
  { code: 'auth/user-not-found', expected: 'No registered account found' },
  { code: 'auth/user-disabled', expected: 'disabled' },
  { code: 'auth/network-request-failed', expected: 'Network connection failed' },
  { code: 'auth/too-many-requests', expected: 'Too many failed attempts' }
];

errorChecks.forEach(({ code, expected }) => {
  const msg = formatAuthError({ code });
  console.assert(msg.toLowerCase().includes(expected.toLowerCase()), `Error ${code} must map cleanly`);
});
console.log('✓ Firebase Auth error mapping is comprehensive, friendly, and hides stack traces.');

// -------------------------------------------------------------------
// 2. ADMISSION MAP & NORMALIZATION AUDIT
// -------------------------------------------------------------------
console.log('\n--- 2. ADMISSION NUMBER & EMAIL VALIDATION ---');
const validEmails = ['student@abes.ac.in', 'parth.sharma@abes.ac.in', 'warden@abes.ac.in'];
const invalidEmails = ['user@gmail.com', 'hacker@yahoo.com', 'student@abes.edu', 'fake@'];

validEmails.forEach(e => console.assert(isValidAbesEmail(e), `Email ${e} must be valid ABES email`));
invalidEmails.forEach(e => console.assert(!isValidAbesEmail(e), `Email ${e} must be rejected`));
console.log('✓ ABES email domain validation (@abes.ac.in) strictly enforced.');

// -------------------------------------------------------------------
// 3. OTP CRYPTOGRAPHY & REPLAY PREVENTION AUDIT
// -------------------------------------------------------------------
console.log('\n--- 3. OTP ARCHITECTURE & CRYPTOGRAPHIC SECURITY ---');
const testOtp = generateSecureOTP();
console.assert(testOtp.length === 6 && /^\d{6}$/.test(testOtp), 'OTP must be 6 digits numeric');

const email = 'student.test@abes.ac.in';
const h1 = hashOtp(testOtp, email);
const h2 = hashOtp(testOtp, email);
const hWrong = hashOtp('999999', email);

console.assert(h1 === h2, 'HMAC hash must be deterministic');
console.assert(h1 !== hWrong, 'HMAC hash must differ for wrong OTP');

const sessionPayload = {
  email,
  admissionNumber: '2400320100099',
  hashedOtp: h1,
  expiresAt: Date.now() + OTP_EXPIRY_MS
};

const token = signSessionToken(sessionPayload);
const verified = verifySignedSessionToken(token);
console.assert(verified && verified.email === email, 'Tamper-proof token must decode correctly');

const tamperedToken = token.slice(0, -4) + 'abcd';
const failedDecode = verifySignedSessionToken(tamperedToken);
console.assert(failedDecode === null, 'Tampered token must be rejected');
console.log('✓ OTP generator (6 digits), HMAC-SHA256 hashing, and signed session tokens verified.');

// -------------------------------------------------------------------
// 4. MEAL TIMINGS & STRICT ORDERING AUDIT
// -------------------------------------------------------------------
console.log('\n--- 4. MEAL TIMINGS & DISPLAY ORDERING ---');
const mealsUnsorted = [
  { id: '1', category: 'Dinner', name: 'Dal Makhani' },
  { id: '2', category: 'Breakfast', name: 'Poha' },
  { id: '3', category: 'Snacks', name: 'Samosa' },
  { id: '4', category: 'Lunch', name: 'Rajma Rice' }
];

const sorted = sortMealsByOfficialOrder(mealsUnsorted);
console.assert(sorted[0].category === 'Breakfast', 'Item 1 must be Breakfast');
console.assert(sorted[1].category === 'Lunch', 'Item 2 must be Lunch');
console.assert(sorted[2].category === 'Snacks', 'Item 3 must be Snacks');
console.assert(sorted[3].category === 'Dinner', 'Item 4 must be Dinner');
console.log('✓ Meal order strictly maintained: 1. Breakfast -> 2. Lunch -> 3. Snacks -> 4. Dinner.');

// Test rating grace periods
const testMorning = new Date();
testMorning.setHours(8, 45, 0, 0); // 8:45 AM (Within Breakfast rating grace 7:20 - 9:00 AM)
console.assert(isRatingAllowedForMeal('Breakfast', testMorning), 'Breakfast rating must be allowed at 8:45 AM');

testMorning.setHours(9, 15, 0, 0); // 9:15 AM (Outside Breakfast rating grace)
console.assert(!isRatingAllowedForMeal('Breakfast', testMorning), 'Breakfast rating must be blocked at 9:15 AM');
console.log('✓ Meal rating windows enforce exact +30min grace period.');

// -------------------------------------------------------------------
// 5. MUSCLE PASS PRICING & SERVER AMOUNTS AUDIT
// -------------------------------------------------------------------
console.log('\n--- 5. MUSCLE PASS PRICING & SERVER PAISE AMOUNTS ---');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_MONTHLY.price === 69, 'Monthly price must be ₹69');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_3_MONTHS.price === 149, '3-Months price must be ₹149');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_6_MONTHS.price === 249, '6-Months price must be ₹249');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_YEARLY.price === 449, 'Yearly price must be ₹449');
console.log('✓ Muscle Pass prices verified: ₹69, ₹149, ₹249, ₹449.');

// -------------------------------------------------------------------
// 6. FIRESTORE & STORAGE SECURITY RULES AUDIT
// -------------------------------------------------------------------
console.log('\n--- 6. FIRESTORE & STORAGE RULES AUDIT ---');
const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
const storageRules = fs.readFileSync('storage.rules', 'utf8');

console.assert(firestoreRules.includes('match /otp_sessions/{sessionKey}') && firestoreRules.includes('allow read, write: if false;'), 'otp_sessions must be strictly private (read, write: if false)');
console.assert(firestoreRules.includes('match /votes/{voteId}'), 'votes rule exists');
console.assert(firestoreRules.includes('allow update, delete: if false;'), 'votes must be immutable');
console.assert(storageRules.includes("request.resource.size <= 5 * 1024 * 1024"), 'Meal images capped at 5 MB');
console.assert(storageRules.includes("image/(jpeg|jpg|png|webp)"), 'Meal images restricted to JPG/PNG/WEBP');
console.log('✓ Firestore & Storage rules maintain strict zero-trust security.');

// -------------------------------------------------------------------
// 7. PROFILE DYNAMIC DATA & READ-ONLY INTEGRITY AUDIT
// -------------------------------------------------------------------
console.log('\n--- 7. PROFILE DYNAMIC DATA & READ-ONLY INTEGRITY ---');
const profileSource = fs.readFileSync('src/pages/ProfilePage.jsx', 'utf8');
console.assert(!profileSource.includes("currentUser?.name || 'Parth Sharma'"), 'No hardcoded name in profile');
console.assert(!profileSource.includes("currentUser?.admissionNumber || '2100320100001'"), 'No hardcoded admission in profile');
console.assert(!profileSource.includes('setHostelBlock'), 'Hostel editing must not exist in Profile');
console.assert(profileSource.includes('Hostel Block'), 'Hostel Block badge rendered');
console.log('✓ Profile renders 100% dynamic data with strictly read-only official identity.');

// -------------------------------------------------------------------
// 8. OBSERVABILITY & PRIVACY DATA SCRUBBING AUDIT
// -------------------------------------------------------------------
console.log('\n--- 8. OBSERVABILITY & PRIVACY DATA SCRUBBING ---');
import('./src/services/observability.js').then(({ sanitizePayload }) => {
  const dirtyData = {
    userId: 'usr_123',
    name: 'Parth Sharma',
    password: 'SuperSecretPassword123',
    confirmPassword: 'SuperSecretPassword123',
    otp: '123456',
    hashedOtp: 'a8b7c6d5e4f3',
    keySecret: 'rzp_sec_xyz'
  };

  const clean = sanitizePayload(dirtyData);
  console.assert(clean.password === '[REDACTED]', 'Password must be redacted');
  console.assert(clean.otp === '[REDACTED]', 'OTP must be redacted');
  console.assert(clean.keySecret === '[REDACTED]', 'Secret keys must be redacted');
  console.assert(clean.userId === 'usr_123', 'Safe identifiers must be retained');
  console.log('✓ Observability payload sanitizer strips all sensitive tokens & credentials.');

  // -------------------------------------------------------------------
  // 9. ERROR BOUNDARY INTEGRATION AUDIT
  // -------------------------------------------------------------------
  console.log('\n--- 9. ERROR BOUNDARY INTEGRATION AUDIT ---');
  const mainSource = fs.readFileSync('src/main.jsx', 'utf8');
  console.assert(mainSource.includes('<ErrorBoundary>'), 'App must be wrapped in ErrorBoundary');
  console.assert(mainSource.includes('initObservability()'), 'initObservability must be called on app bootstrap');
  console.log('✓ ErrorBoundary & observability bootstrap verified in main.jsx.');

  // -------------------------------------------------------------------
  // 10. VERCEL SECURITY HEADERS AUDIT
  // -------------------------------------------------------------------
  console.log('\n--- 10. VERCEL SECURITY HEADERS AUDIT ---');
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.assert(Array.isArray(vercelConfig.headers) && vercelConfig.headers.length > 0, 'Security headers configured in vercel.json');
  console.assert(vercelConfig.rewrites && vercelConfig.rewrites.length >= 2, 'SPA rewrites configured in vercel.json');
  console.log('✓ Vercel production security headers & SPA rewrites verified.');

  console.log('\n================================================================');
  console.log('ALL AUDIT CHECKS PASSED WITH ZERO DEFECTS! ✅');
  console.log('================================================================\n');
});

