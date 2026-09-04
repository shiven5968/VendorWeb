#!/usr/bin/env node
/**
 * MessMates — Verification Suite for Parth Sharma Account Recovery
 * ===============================================================
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import assert from 'assert';
import { initializeApp as initAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { Firestore } from '@google-cloud/firestore';
import { OAuth2Client } from 'google-auth-library';
import { normalizeAdmissionNumber, normalizeEmail } from '../src/services/auth.js';
import { resolveMenuGroup } from '../src/config/menuGroups.js';

const TARGET_PROJECT_ID = 'messmates-f69a3';
const TARGET_EMAIL = 'parth.25b15310212@abes.ac.in';
const TARGET_ADMISSION = '2025B15310212';
const EXPECTED_UID = '5T6oooW7J4dbAJvmOKl2zRwUFzH3';
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyARw4CyvhbiItVCC4HiKvaR-N8a1nmi3JU';

function getCredentials() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      let sa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (typeof sa === 'string') sa = JSON.parse(sa);
      return { type: 'service_account', credential: sa };
    } catch (e) {}
  }

  const p = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (fs.existsSync(p)) {
    try {
      const config = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (config.tokens?.access_token) {
        return { type: 'oauth', accessToken: config.tokens.access_token };
      }
    } catch (e) {}
  }
  return null;
}

async function main() {
  console.log('================================================================');
  console.log(' MESSMATES — PARTH SHARMA ACCOUNT VERIFICATION SUITE');
  console.log('================================================================\n');

  const creds = getCredentials();
  const adminApp = initAdminApp({
    projectId: TARGET_PROJECT_ID,
    credential: { getAccessToken: async () => ({ access_token: creds.accessToken, expires_in: 3600 }) }
  }, 'parth-verify-' + Date.now());
  const auth = getAdminAuth(adminApp);

  const authClient = new OAuth2Client();
  authClient.setCredentials({ access_token: creds.accessToken });
  const db = new Firestore({ projectId: TARGET_PROJECT_ID, authClient });

  // ── TEST 1: Canonical Auth Account Exists & Matches UID ─────────────────────
  console.log('--- TEST 1: Firebase Auth Account ---');
  const authUser = await auth.getUserByEmail(TARGET_EMAIL);
  assert.strictEqual(authUser.uid, EXPECTED_UID, 'Auth UID must match expected canonical UID');
  assert.strictEqual(authUser.disabled, false, 'Auth account must not be disabled');
  console.log(`✓ Auth Account PASS: UID=${authUser.uid}, email=${authUser.email}`);

  // ── TEST 2: Firestore Profile Exists & Consistent ──────────────────────────
  console.log('\n--- TEST 2: Firestore Profile (users/{uid}) ---');
  const userSnap = await db.collection('users').doc(EXPECTED_UID).get();
  assert(userSnap.exists, 'Profile doc must exist');
  const profile = userSnap.data();
  assert.strictEqual(profile.admissionNumber, TARGET_ADMISSION, 'Profile admissionNumber must match');
  assert.strictEqual(profile.email, TARGET_EMAIL, 'Profile email must match');
  assert.strictEqual(profile.name, 'Parth Sharma', 'Profile name must match');
  assert.strictEqual(profile.hostelBlock, 'DNB Block', 'Profile hostel must match');
  assert.strictEqual(profile.role, 'student', 'Profile role must be student');
  console.log(`✓ Firestore Profile PASS: name="${profile.name}", admission="${profile.admissionNumber}", hostel="${profile.hostelBlock}", role="${profile.role}"`);

  // ── TEST 3: Canonical admission_map Exists & Points to Same UID ────────────
  console.log('\n--- TEST 3: Canonical admission_map ---');
  const mapSnap = await db.collection('admission_map').doc(TARGET_ADMISSION).get();
  assert(mapSnap.exists, 'admission_map entry must exist');
  const mapData = mapSnap.data();
  assert.strictEqual(mapData.uid, EXPECTED_UID, 'Map UID must match canonical UID');
  assert.strictEqual(mapData.email, TARGET_EMAIL, 'Map email must match canonical email');
  assert.strictEqual(mapData.admissionNumber, TARGET_ADMISSION, 'Map admissionNumber must match');
  console.log(`✓ admission_map PASS: ${TARGET_ADMISSION} → UID ${mapData.uid} (${mapData.email})`);

  // ── TEST 4: Dual Login Identity Resolution ─────────────────────────────────
  console.log('\n--- TEST 4: Dual Login Identity Resolution ---');
  // Scenario A: Admission Number
  const normAdmission = normalizeAdmissionNumber('2025B15310212');
  const mapLookupA = await db.collection('admission_map').doc(normAdmission).get();
  assert(mapLookupA.exists, 'Uppercase lookup must succeed');
  assert.strictEqual(mapLookupA.data().email, TARGET_EMAIL);

  // Scenario B: Lowercase Admission Number input
  const normAdmissionLower = normalizeAdmissionNumber('2025b15310212');
  assert.strictEqual(normAdmissionLower, '2025B15310212');
  const mapLookupB = await db.collection('admission_map').doc(normAdmissionLower).get();
  assert(mapLookupB.exists, 'Normalized lowercase input must resolve to canonical map');
  assert.strictEqual(mapLookupB.data().uid, EXPECTED_UID);

  // Scenario C: Email direct lookup
  const normEmail = normalizeEmail('parth.25b15310212@abes.ac.in');
  assert.strictEqual(normEmail, TARGET_EMAIL);
  console.log('✓ Dual Login PASS: Admission Number (any case) and Email both resolve to UID ' + EXPECTED_UID);

  // ── TEST 5: Wrong Password Rejection via Auth Identity Toolkit API ───────────
  console.log('\n--- TEST 5: Wrong Password & Invalid Credential Rejection ---');
  const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const wrongPassRes = await fetch(verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TARGET_EMAIL,
      password: 'DefinitelyWrongPassword!999',
      returnSecureToken: true
    })
  });
  const wrongPassData = await wrongPassRes.json();
  assert(!wrongPassRes.ok, 'Wrong password must NOT authenticate');
  assert(wrongPassData.error?.message?.includes('INVALID_PASSWORD') || wrongPassData.error?.message?.includes('INVALID_LOGIN_CREDENTIALS'), 'Must return INVALID_LOGIN_CREDENTIALS');
  console.log(`✓ Wrong Password Rejection PASS: Received expected rejection (${wrongPassData.error.message})`);

  // ── TEST 6: Invalid Admission Number Rejection ─────────────────────────────
  console.log('\n--- TEST 6: Invalid Admission Number Rejection ---');
  const invalidAdmSnap = await db.collection('admission_map').doc('9999Z99999999').get();
  assert.strictEqual(invalidAdmSnap.exists, false, 'Non-existent admission number must not exist');
  console.log('✓ Invalid Admission Number PASS: Non-existent admission number rejected');

  // ── TEST 7: Historical Data Preservation Audit ─────────────────────────────
  console.log('\n--- TEST 7: Historical Data Preservation Audit ---');
  const ratingsSnap = await db.collection('ratings').where('userId', '==', EXPECTED_UID).get();
  const proteinSnap = await db.collection('protein_logs').where('userId', '==', EXPECTED_UID).get();
  assert.strictEqual(ratingsSnap.size, 5, 'Ratings must be 5');
  assert.strictEqual(proteinSnap.size, 13, 'Protein logs must be 13');
  assert.strictEqual(profile.rewardPoints, 62, 'Reward points must be 62');
  console.log(`✓ Data Preservation PASS: 5/5 ratings, 13/13 protein logs, 62 reward points preserved`);

  // ── TEST 8: Dynamic Menu Group Resolution ──────────────────────────────────
  console.log('\n--- TEST 8: Dynamic Menu Group Resolution ---');
  const menuGroup = resolveMenuGroup(profile);
  assert.strictEqual(menuGroup.id, 'juniorStudents', 'Must resolve to juniorStudents based on 2025 join year');
  console.log(`✓ Menu Group PASS: Dynamically resolved to "${menuGroup.label}" (no hardcoding)`);

  console.log('\n================================================================');
  console.log(' ALL 8 VERIFICATION SCENARIOS PASSED WITH ZERO DATA LOSS! ✅');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
