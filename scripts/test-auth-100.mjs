#!/usr/bin/env node
/**
 * MessMates — 100-User Auth Emulator Test
 * =========================================
 * ONLY targets Firebase Emulator Suite.
 * NEVER connects to production Firebase.
 *
 * Emulator targets:
 *   Auth:      127.0.0.1:9099
 *   Firestore: 127.0.0.1:8080
 *
 * Usage:
 *   npm run test:auth100
 */

// ─────────────────────────────────────────────────────────────────────────────
// SET EMULATOR ENV VARS BEFORE ANY FIREBASE IMPORT
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_EMULATOR_HOST = '127.0.0.1:9099';
const FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;
process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;

// ─────────────────────────────────────────────────────────────────────────────
// TOP-LEVEL FIREBASE ADMIN IMPORTS (ESM-compatible)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp as initAdminApp, deleteApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'messmates-f69a3';
const TEST_PASSWORD = 'TestPass#2026!';

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZATION (mirrors src/services/auth.js exactly)
// ─────────────────────────────────────────────────────────────────────────────

const normalizeAdmission = (s) => (s || '').trim().toUpperCase();
const normalizeEmail = (s) => (s || '').trim().toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────
// TEST DATA: 100 deterministic disposable students
// ─────────────────────────────────────────────────────────────────────────────

const TEST_USERS = Array.from({ length: 100 }, (_, i) => {
  const n = String(i + 1).padStart(3, '0');
  return {
    index: i + 1,
    name: `Test Student ${n}`,
    admissionNumber: normalizeAdmission(`TESTMM${n}`),
    email: normalizeEmail(`testmm${n}@example.com`),
    password: TEST_PASSWORD,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    hostelBlock: 'DNB Block',
    role: 'student'
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// RESULT COUNTERS
// ─────────────────────────────────────────────────────────────────────────────

const results = {
  registrations: { pass: 0, fail: 0, errors: [] },
  profiles: { pass: 0, fail: 0, errors: [] },
  admissionMaps: { pass: 0, fail: 0, errors: [] },
  consistency: { pass: 0, fail: 0, errors: [] },
  logins: { pass: 0, fail: 0, errors: [] },
  wrongPassword: { pass: 0, fail: 0, errors: [] },
  invalidAdmission: { pass: 0, fail: 0, errors: [] },
  duplicateProtection: 'UNKNOWN',
  concurrentRegistration: 'UNKNOWN',
  logoutLogin: { pass: 0, fail: 0, errors: [] }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function progressBar(current, total, label) {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 20);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  process.stdout.write(`\r  ${label.padEnd(12)} [${bar}] ${pct}% (${current}/${total})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE: Create one test user via Admin SDK (bypasses OTP/Resend)
// ─────────────────────────────────────────────────────────────────────────────

async function createTestUser(adminAuth, adminDb, u) {
  // Step 1: Create Firebase Auth user
  const authUser = await adminAuth.createUser({
    email: u.email,
    password: u.password,
    displayName: u.name,
    emailVerified: true
  });
  const uid = authUser.uid;

  // Step 2: Create users/{uid}
  const profile = {
    uid,
    name: u.name,
    admissionNumber: u.admissionNumber,
    email: u.email,
    role: u.role,
    gender: u.gender,
    hostelBlock: u.hostelBlock,
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 120,
    rewardPoints: 0,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await adminDb.collection('users').doc(uid).set(profile);

  // Step 3: Create admission_map/{CANONICAL}
  await adminDb.collection('admission_map').doc(u.admissionNumber).set({
    admissionNumber: u.admissionNumber,
    email: u.email,
    uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return { uid, profile };
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE: Simulate admission number login via Auth REST API
// (Tests the canonical lookup: admission_map → email → password verify)
// ─────────────────────────────────────────────────────────────────────────────

async function simulateAdmissionLogin(adminDb, admissionNumber, password) {
  const canonicalAdmission = normalizeAdmission(admissionNumber);

  // Step 1: Admission map lookup (mirrors signInUser)
  const mapSnap = await adminDb.collection('admission_map').doc(canonicalAdmission).get();
  if (!mapSnap.exists) {
    throw new Error(`NO_ADMISSION_MAP: No account found for "${canonicalAdmission}"`);
  }
  const targetEmail = normalizeEmail(mapSnap.data().email);

  // Step 2: Firebase Auth REST sign-in (emulator exposes this endpoint)
  const signInUrl = `http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`;
  const res = await fetch(signInUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: targetEmail, password, returnSecureToken: true })
  });

  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.message || 'UNKNOWN_ERROR';
    if (code.includes('INVALID_PASSWORD') || code.includes('INVALID_LOGIN_CREDENTIALS') || code.includes('INVALID_CREDENTIAL')) {
      throw new Error('WRONG_PASSWORD');
    }
    if (code.includes('EMAIL_NOT_FOUND') || code.includes('USER_NOT_FOUND')) {
      throw new Error('USER_NOT_FOUND');
    }
    throw new Error(`AUTH_REST_ERROR: ${code}`);
  }

  const uid = data.localId;

  // Step 3: Load profile (mirrors signInUser step 3)
  const userSnap = await adminDb.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    throw new Error('PROFILE_MISSING');
  }

  return { uid, email: data.email, profile: userSnap.data() };
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE A: Create 100 students
// ─────────────────────────────────────────────────────────────────────────────

async function phaseRegistration(adminAuth, adminDb) {
  console.log('\n── PHASE A-D: Registration + Profile + Map ──');
  const createdUsers = [];
  const BATCH = 10;

  for (let i = 0; i < TEST_USERS.length; i += BATCH) {
    const batch = TEST_USERS.slice(i, i + BATCH);
    const batchResults = await Promise.allSettled(
      batch.map(u => createTestUser(adminAuth, adminDb, u))
    );

    for (let j = 0; j < batch.length; j++) {
      const u = batch[j];
      const r = batchResults[j];
      if (r.status === 'fulfilled') {
        results.registrations.pass++;
        createdUsers.push({ ...u, uid: r.value.uid });
      } else {
        results.registrations.fail++;
        results.registrations.errors.push(`User ${u.index}: ${r.reason?.message || r.reason}`);
      }
    }

    progressBar(Math.min(i + BATCH, TEST_USERS.length), TEST_USERS.length, 'Creating');
    await sleep(30);
  }
  console.log('');
  return createdUsers;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE B: Verify users/{uid} docs
// ─────────────────────────────────────────────────────────────────────────────

async function phaseProfiles(adminDb, createdUsers) {
  console.log('\n── PHASE B: Verify users/{uid} ──');
  const BATCH = 20;
  for (let i = 0; i < createdUsers.length; i += BATCH) {
    const batch = createdUsers.slice(i, i + BATCH);
    const snaps = await Promise.allSettled(
      batch.map(u => adminDb.collection('users').doc(u.uid).get())
    );
    for (let j = 0; j < batch.length; j++) {
      const u = batch[j];
      const r = snaps[j];
      if (r.status === 'fulfilled' && r.value.exists) {
        results.profiles.pass++;
      } else {
        results.profiles.fail++;
        results.profiles.errors.push(`User ${u.index} uid=${u.uid}: ${r.reason?.message || 'doc missing'}`);
      }
    }
    progressBar(Math.min(i + BATCH, createdUsers.length), createdUsers.length, 'Profiles');
    await sleep(20);
  }
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE C: Verify admission_map
// ─────────────────────────────────────────────────────────────────────────────

async function phaseAdmissionMaps(adminDb, createdUsers) {
  console.log('\n── PHASE C: Verify admission_map ──');
  const BATCH = 20;
  for (let i = 0; i < createdUsers.length; i += BATCH) {
    const batch = createdUsers.slice(i, i + BATCH);
    const snaps = await Promise.allSettled(
      batch.map(u => adminDb.collection('admission_map').doc(u.admissionNumber).get())
    );
    for (let j = 0; j < batch.length; j++) {
      const u = batch[j];
      const r = snaps[j];
      if (r.status === 'fulfilled' && r.value.exists) {
        results.admissionMaps.pass++;
      } else {
        results.admissionMaps.fail++;
        results.admissionMaps.errors.push(`User ${u.index} adm=${u.admissionNumber}: ${r.reason?.message || 'doc missing'}`);
      }
    }
    progressBar(Math.min(i + BATCH, createdUsers.length), createdUsers.length, 'Adm Maps');
    await sleep(20);
  }
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE D: Identity consistency
// ─────────────────────────────────────────────────────────────────────────────

async function phaseConsistency(adminAuth, adminDb, createdUsers) {
  console.log('\n── PHASE D: Identity Consistency ──');
  let checked = 0;

  for (const u of createdUsers) {
    try {
      const [userSnap, mapSnap, authUser] = await Promise.all([
        adminDb.collection('users').doc(u.uid).get(),
        adminDb.collection('admission_map').doc(u.admissionNumber).get(),
        adminAuth.getUser(u.uid)
      ]);

      if (!userSnap.exists || !mapSnap.exists) {
        results.consistency.fail++;
        results.consistency.errors.push(`User ${u.index}: missing doc(s)`);
        continue;
      }

      const profileEmail  = normalizeEmail(userSnap.data().email || '');
      const profileAdmission = normalizeAdmission(userSnap.data().admissionNumber || '');
      const authEmail     = normalizeEmail(authUser.email || '');
      const mapEmail      = normalizeEmail(mapSnap.data().email || '');
      const mapUid        = mapSnap.data().uid;

      const ok = (
        profileEmail === authEmail &&
        profileEmail === mapEmail &&
        profileAdmission === u.admissionNumber &&
        mapUid === u.uid
      );

      if (ok) {
        results.consistency.pass++;
      } else {
        results.consistency.fail++;
        results.consistency.errors.push(
          `User ${u.index}: profEmail=${profileEmail} authEmail=${authEmail} mapEmail=${mapEmail} mapUid=${mapUid} uid=${u.uid}`
        );
      }
    } catch (e) {
      results.consistency.fail++;
      results.consistency.errors.push(`User ${u.index}: ${e.message}`);
    }

    checked++;
    if (checked % 10 === 0) progressBar(checked, createdUsers.length, 'Consist.');
    await sleep(5);
  }
  progressBar(createdUsers.length, createdUsers.length, 'Consist.');
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE E: Login all 100 users
// ─────────────────────────────────────────────────────────────────────────────

async function phaseLogins(adminDb, createdUsers) {
  console.log('\n── PHASE E: Admission Number + Password Login (100) ──');
  const BATCH = 10;

  for (let i = 0; i < createdUsers.length; i += BATCH) {
    const batch = createdUsers.slice(i, i + BATCH);
    const loginResults = await Promise.allSettled(
      batch.map(u => simulateAdmissionLogin(adminDb, u.admissionNumber, u.password))
    );

    for (let j = 0; j < batch.length; j++) {
      const u = batch[j];
      const r = loginResults[j];
      if (r.status === 'fulfilled' && r.value.uid === u.uid) {
        results.logins.pass++;
      } else {
        results.logins.fail++;
        const msg = r.status === 'fulfilled'
          ? `uid mismatch: got ${r.value.uid} expected ${u.uid}`
          : (r.reason?.message || r.reason);
        results.logins.errors.push(`User ${u.index}: ${msg}`);
      }
    }
    progressBar(Math.min(i + BATCH, createdUsers.length), createdUsers.length, 'Logins  ');
    await sleep(30);
  }
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE F: Wrong password (10 accounts)
// ─────────────────────────────────────────────────────────────────────────────

async function phaseWrongPassword(adminDb, createdUsers) {
  console.log('\n── PHASE F: Wrong Password Rejection (10) ──');
  const sample = createdUsers.slice(0, 10);

  for (const u of sample) {
    try {
      await simulateAdmissionLogin(adminDb, u.admissionNumber, 'AbsolutelyWrongPwd999!');
      results.wrongPassword.fail++;
      results.wrongPassword.errors.push(`User ${u.index}: login SUCCEEDED with wrong password!`);
    } catch (e) {
      if (e.message === 'WRONG_PASSWORD' || e.message.includes('WRONG_PASSWORD') || e.message.includes('INVALID')) {
        results.wrongPassword.pass++;
      } else {
        results.wrongPassword.fail++;
        results.wrongPassword.errors.push(`User ${u.index}: unexpected error "${e.message}"`);
      }
    }
    await sleep(15);
  }
  console.log(`  Wrong password rejections: ${results.wrongPassword.pass}/10`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE G: Invalid admission numbers (10)
// ─────────────────────────────────────────────────────────────────────────────

async function phaseInvalidAdmission(adminDb) {
  console.log('\n── PHASE G: Invalid Admission Number Rejection (10) ──');

  const invalids = [
    'INVALID001', 'NOTEXIST002', 'GHOST0001', 'FAKE99999',
    'NOACC0010', 'BADUSER001', 'NOTHERE99', 'MISSMATCH1',
    'ZEROADMIN0', 'NOMAP00001'
  ];

  for (const adm of invalids) {
    try {
      await simulateAdmissionLogin(adminDb, adm, TEST_PASSWORD);
      results.invalidAdmission.fail++;
      results.invalidAdmission.errors.push(`"${adm}": login SUCCEEDED (should have failed)`);
    } catch (e) {
      if (e.message.includes('NO_ADMISSION_MAP') || e.message.includes('No account found')) {
        results.invalidAdmission.pass++;
      } else {
        results.invalidAdmission.fail++;
        results.invalidAdmission.errors.push(`"${adm}": unexpected "${e.message}"`);
      }
    }
    await sleep(10);
  }
  console.log(`  Invalid admission rejections: ${results.invalidAdmission.pass}/10`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE H: Duplicate registration protection
// ─────────────────────────────────────────────────────────────────────────────

async function phaseDuplicateProtection(adminAuth, adminDb, createdUsers) {
  console.log('\n── PHASE H: Duplicate Registration Protection ──');
  const u = createdUsers[0]; // Already registered user

  let duplicateBlocked = false;
  try {
    await adminAuth.createUser({
      email: u.email,
      password: u.password,
      displayName: u.name,
      emailVerified: true
    });
    // Reaching here means duplicate was NOT blocked
    duplicateBlocked = false;
  } catch (e) {
    const code = e.code || e.message || '';
    if (code.includes('already-exists') || code.includes('EMAIL_EXISTS') || code.includes('email-already')) {
      duplicateBlocked = true;
    } else {
      console.warn(`  Unexpected error: ${e.message}`);
    }
  }

  // Verify only one auth user exists for this email
  let authCount = 0;
  try {
    await adminAuth.getUserByEmail(u.email);
    authCount = 1; // getUserByEmail returns exactly one or throws
  } catch (e) {
    authCount = 0;
  }

  // Verify admission_map still points to original UID
  const mapSnap = await adminDb.collection('admission_map').doc(u.admissionNumber).get();
  const mapUidMatch = mapSnap.exists && mapSnap.data().uid === u.uid;

  results.duplicateProtection = duplicateBlocked && authCount === 1 && mapUidMatch ? 'PASS' : 'FAIL';
  console.log(`  Duplicate blocked: ${duplicateBlocked} | Single auth: ${authCount === 1} | Map intact: ${mapUidMatch}`);
  console.log(`  Duplicate Protection: ${results.duplicateProtection}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE I: Concurrent registration protection
// ─────────────────────────────────────────────────────────────────────────────

async function phaseConcurrentRegistration(adminAuth, adminDb) {
  console.log('\n── PHASE I: Concurrent Registration Protection ──');

  const testEmail = normalizeEmail('concurrent_unique_test@example.com');
  const testAdmission = normalizeAdmission('CONCUR_TEST_001');

  // Fire 5 concurrent createUser attempts for the same email
  const attempts = Array.from({ length: 5 }, async (_, i) => {
    try {
      const authUser = await adminAuth.createUser({
        email: testEmail,
        password: TEST_PASSWORD,
        displayName: 'Concurrent Test',
        emailVerified: true
      });
      return { success: true, uid: authUser.uid, attempt: i + 1 };
    } catch (e) {
      return { success: false, error: e.code || e.message, attempt: i + 1 };
    }
  });

  const concurrentResults = await Promise.all(attempts);
  const successes = concurrentResults.filter(r => r.success);
  const failures = concurrentResults.filter(r => !r.success);

  console.log(`  Concurrent successes: ${successes.length} | Rejected: ${failures.length}`);

  // Firebase Auth guarantees atomically exactly 1 can succeed
  results.concurrentRegistration = successes.length === 1 ? 'PASS' : 'FAIL';
  if (successes.length !== 1) {
    console.warn(`  Expected exactly 1 success, got ${successes.length}`);
  }
  console.log(`  Concurrent Registration: ${results.concurrentRegistration}`);

  // Cleanup
  for (const s of successes) {
    try { await adminAuth.deleteUser(s.uid); } catch (e) {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE J: Logout/Login cycle (20 users)
// ─────────────────────────────────────────────────────────────────────────────

async function phaseLogoutLogin(adminAuth, adminDb, createdUsers) {
  console.log('\n── PHASE J: Logout/Login Cycle (20 users) ──');
  const sample = createdUsers.slice(0, 20);

  for (const u of sample) {
    try {
      // Login 1
      const login1 = await simulateAdmissionLogin(adminDb, u.admissionNumber, u.password);
      if (login1.uid !== u.uid) throw new Error(`uid mismatch on first login`);

      // Simulate logout: revoke refresh tokens
      await adminAuth.revokeRefreshTokens(u.uid);
      await sleep(10);

      // Re-login
      const login2 = await simulateAdmissionLogin(adminDb, u.admissionNumber, u.password);
      if (login2.uid !== u.uid) throw new Error(`uid mismatch on second login`);

      results.logoutLogin.pass++;
    } catch (e) {
      results.logoutLogin.fail++;
      results.logoutLogin.errors.push(`User ${u.index}: ${e.message}`);
    }
    await sleep(20);
  }
  console.log(`  Logout/Login: ${results.logoutLogin.pass}/20`);
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL REPORT
// ─────────────────────────────────────────────────────────────────────────────

function printReport(elapsedSec) {
  const overall = (
    results.registrations.pass === 100 &&
    results.profiles.pass === 100 &&
    results.admissionMaps.pass === 100 &&
    results.consistency.pass === 100 &&
    results.logins.pass === 100 &&
    results.wrongPassword.pass === 10 &&
    results.invalidAdmission.pass === 10 &&
    results.duplicateProtection === 'PASS' &&
    results.concurrentRegistration === 'PASS' &&
    results.logoutLogin.pass === 20
  ) ? 'PASS' : 'FAIL';

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  100 USER AUTH TEST — RESULTS');
  console.log('══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Registrations:              ${results.registrations.pass}/100`);
  console.log(`Profiles (users/{uid}):     ${results.profiles.pass}/100`);
  console.log(`Admission Maps:             ${results.admissionMaps.pass}/100`);
  console.log(`Identity Consistency:       ${results.consistency.pass}/100`);
  console.log(`Logins:                     ${results.logins.pass}/100`);
  console.log(`Wrong Password Rejections:  ${results.wrongPassword.pass}/10`);
  console.log(`Invalid Admission Reject:   ${results.invalidAdmission.pass}/10`);
  console.log(`Duplicate Protection:       ${results.duplicateProtection}`);
  console.log(`Concurrent Registration:    ${results.concurrentRegistration}`);
  console.log(`Logout/Login:               ${results.logoutLogin.pass}/20`);
  console.log('');
  console.log(`Test time: ${elapsedSec}s`);
  console.log(`OVERALL: ${overall}`);
  console.log('══════════════════════════════════════════════════════════');

  const allErrors = [
    ...results.registrations.errors.map(e => `[REG]     ${e}`),
    ...results.profiles.errors.map(e => `[PROFILE] ${e}`),
    ...results.admissionMaps.errors.map(e => `[MAP]     ${e}`),
    ...results.consistency.errors.map(e => `[CONSIST] ${e}`),
    ...results.logins.errors.map(e => `[LOGIN]   ${e}`),
    ...results.wrongPassword.errors.map(e => `[WRONGPW] ${e}`),
    ...results.invalidAdmission.errors.map(e => `[INVADM]  ${e}`),
    ...results.logoutLogin.errors.map(e => `[LOGOUT]  ${e}`)
  ];

  if (allErrors.length > 0) {
    console.log('\n── FAILED CASES ──');
    allErrors.forEach(e => console.log(e));
  }

  console.log('\nProduction untouched: YES');
  console.log(`FIREBASE_AUTH_EMULATOR_HOST = ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  console.log(`FIRESTORE_EMULATOR_HOST     = ${process.env.FIRESTORE_EMULATOR_HOST}\n`);

  return overall;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  MessMates — 100-User Auth Emulator Test');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`AUTH EMULATOR TARGET:      ${AUTH_EMULATOR_HOST}`);
  console.log(`FIRESTORE EMULATOR TARGET: ${FIRESTORE_EMULATOR_HOST}`);
  console.log('');
  console.log('⚠  PRODUCTION SAFETY: Emulator env vars are set.');
  console.log('   ALL operations target local emulator, NOT production.');
  console.log('══════════════════════════════════════════════════════════');

  // ── EMULATOR REACHABILITY CHECK ────────────────────────────────────────────
  try {
    const res = await fetch(`http://${AUTH_EMULATOR_HOST}/`);
    // 200 or any response = emulator is running
    console.log(`\n  ✓ Auth emulator reachable (HTTP ${res.status})`);
  } catch (e) {
    const msg = e?.cause?.code || e.message || '';
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed') || msg.includes('ENOTFOUND')) {
      console.error(`\n❌ ABORT: Auth Emulator NOT reachable at ${AUTH_EMULATOR_HOST}`);
      console.error('   Start it with: firebase emulators:start --only auth,firestore');
      console.error('   Then re-run:   npm run test:auth100\n');
      process.exit(1);
    }
    console.warn(`  Emulator root check warning (non-fatal): ${e.message}`);
  }

  // ── ADMIN SDK INIT ─────────────────────────────────────────────────────────
  let adminApp, adminAuth, adminDb;
  try {
    adminApp = initAdminApp({ projectId: PROJECT_ID }, `test-harness-${Date.now()}`);
    adminAuth = getAdminAuth(adminApp);
    adminDb = getAdminFirestore(adminApp);
    adminDb.settings({ host: FIRESTORE_EMULATOR_HOST, ssl: false });
    console.log('  ✓ Firebase Admin SDK initialized (emulator mode)\n');
  } catch (e) {
    console.error('❌ Failed to initialize Firebase Admin:', e.message);
    process.exit(1);
  }

  const startTime = Date.now();

  // ── PRE-TEST CLEANUP: Clear any previous emulator test runs ───────────────
  console.log('── PRE-TEST: Cleaning any previous test users from emulator ──');
  const BATCH_CLEANUP = 20;
  for (let i = 0; i < TEST_USERS.length; i += BATCH_CLEANUP) {
    const batch = TEST_USERS.slice(i, i + BATCH_CLEANUP);
    await Promise.allSettled(
      batch.map(async (u) => {
        try {
          const existing = await adminAuth.getUserByEmail(u.email);
          if (existing) {
            await adminAuth.deleteUser(existing.uid);
            await adminDb.collection('users').doc(existing.uid).delete();
          }
        } catch (e) {}
        try {
          await adminDb.collection('admission_map').doc(u.admissionNumber).delete();
        } catch (e) {}
      })
    );
  }
  console.log('  ✓ Emulator test space cleared\n');

  // ── RUN ALL PHASES ─────────────────────────────────────────────────────────
  const createdUsers = await phaseRegistration(adminAuth, adminDb);
  await phaseProfiles(adminDb, createdUsers);
  await phaseAdmissionMaps(adminDb, createdUsers);
  await phaseConsistency(adminAuth, adminDb, createdUsers);
  await phaseLogins(adminDb, createdUsers);
  await phaseWrongPassword(adminDb, createdUsers);
  await phaseInvalidAdmission(adminDb);
  await phaseDuplicateProtection(adminAuth, adminDb, createdUsers);
  await phaseConcurrentRegistration(adminAuth, adminDb);
  await phaseLogoutLogin(adminAuth, adminDb, createdUsers);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const overall = printReport(elapsed);

  // Cleanup Admin SDK app
  try { await deleteApp(adminApp); } catch (e) {}

  process.exit(overall === 'PASS' ? 0 : 1);
}

main().catch(err => {
  console.error('\n❌ Test harness fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
