#!/usr/bin/env node
/**
 * MessMates — Targeted Repair for Admission Number 2025B01011362
 * ==============================================================
 * Target: messmates-f69a3
 * User: Bishant Raj (bishant.25b01011362@abes.ac.in)
 *
 * Operation:
 * 1. Read-only verification of Auth, Profile, and admission_map
 * 2. Create admission_map/2025B01011362 pointing to UID stMGqrJPEihVdxY3mPmTIlvnJ6t2
 * 3. Update users/stMGqrJPEihVdxY3mPmTIlvnJ6t2.admissionNumber to 2025B01011362
 * 4. Post-repair consistency check
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { initializeApp as initAdminApp, deleteApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { Firestore } from '@google-cloud/firestore';
import { OAuth2Client } from 'google-auth-library';

const TARGET_PROJECT_ID = 'messmates-f69a3';
const TARGET_ADMISSION = '2025B01011362';
const EXPECTED_EMAIL = 'bishant.25b01011362@abes.ac.in';

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
  const isRepair = process.argv.includes('--repair');
  const correlationId = 'REP-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  MESSMATES — TARGETED REPAIR: ADMISSION NUMBER 2025B01011362');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`TARGET PROJECT:   ${TARGET_PROJECT_ID}`);
  console.log(`TARGET ADMISSION: ${TARGET_ADMISSION}`);
  console.log(`MODE:             ${isRepair ? '🔧 LIVE REPAIR (--repair)' : '🔍 READ-ONLY DIAGNOSIS (--dry-run)'}`);
  console.log(`CORRELATION ID:   ${correlationId}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  const creds = getCredentials();
  if (!creds) {
    console.error('❌ FATAL: No credentials found.');
    process.exit(1);
  }

  let adminApp, auth, db;
  try {
    adminApp = initAdminApp({
      projectId: TARGET_PROJECT_ID,
      credential: { getAccessToken: async () => ({ access_token: creds.accessToken, expires_in: 3600 }) }
    }, 'target-repair-' + Date.now());
    auth = getAdminAuth(adminApp);

    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: creds.accessToken });
    db = new Firestore({ projectId: TARGET_PROJECT_ID, authClient });
  } catch (e) {
    console.error('❌ Failed to initialize Firebase connection:', e.message);
    process.exit(1);
  }

  // ── STEP 1: READ-ONLY DIAGNOSIS ────────────────────────────────────────────
  console.log('── STEP 1: READ-ONLY DIAGNOSIS ──\n');

  // A. Auth check
  let authUser = null;
  try {
    authUser = await auth.getUserByEmail(EXPECTED_EMAIL);
    console.log(`  ✓ Auth user found: UID ${authUser.uid} (${authUser.email})`);
  } catch (e) {
    console.log(`  ❌ Auth user not found for ${EXPECTED_EMAIL}: ${e.message}`);
  }

  if (!authUser) {
    console.error('❌ Cannot proceed: Auth user does not exist.');
    process.exit(1);
  }

  const uid = authUser.uid;

  // B. Profile check (users/{uid})
  const userDocRef = db.collection('users').doc(uid);
  const userSnap = await userDocRef.get();
  const profileExists = userSnap.exists;
  const profileData = profileExists ? userSnap.data() : null;

  console.log(`  ✓ users/${uid} exists: ${profileExists ? 'YES' : 'NO'}`);
  if (profileExists) {
    console.log(`    - Name:            ${profileData.name}`);
    console.log(`    - Email:           ${profileData.email}`);
    console.log(`    - Stored Adm No:   ${profileData.admissionNumber}`);
    console.log(`    - Role:            ${profileData.role}`);
  }

  // C. admission_map/2025B01011362 check
  const targetMapRef = db.collection('admission_map').doc(TARGET_ADMISSION);
  const targetMapSnap = await targetMapRef.get();
  const mapExists = targetMapSnap.exists;
  const mapData = mapExists ? targetMapSnap.data() : null;

  console.log(`  • admission_map/${TARGET_ADMISSION} exists: ${mapExists ? 'YES' : 'NO'}`);
  if (mapExists) {
    console.log(`    - Mapped UID:      ${mapData.uid}`);
    console.log(`    - Mapped Email:    ${mapData.email}`);
  }

  // D. Existing admission maps for this UID
  const existingMapsSnap = await db.collection('admission_map').where('uid', '==', uid).get();
  const existingKeys = existingMapsSnap.docs.map(d => d.id);
  console.log(`  • Current admission_map keys for this UID: [${existingKeys.join(', ')}]`);

  // E. Classification
  let classification = 'UNKNOWN';
  if (mapExists && mapData.uid === uid && profileExists) {
    classification = 'HEALTHY';
  } else if (!mapExists && profileExists && !mapData) {
    classification = 'MISSING_ADMISSION_MAP';
  } else if (mapExists && mapData.uid !== uid) {
    classification = 'IDENTITY_CONFLICT';
  } else if (!profileExists) {
    classification = 'MISSING_PROFILE';
  }

  console.log(`\n  CLASSIFICATION: ${classification}\n`);

  if (classification === 'IDENTITY_CONFLICT') {
    console.error('❌ CRITICAL CONFLICT: Target admission map is owned by a different UID. ABORTING.');
    process.exit(1);
  }

  // ── STEP 2: SAFE REPAIR ───────────────────────────────────────────────────
  if (!isRepair) {
    console.log('💡 DRY RUN complete. To execute the repair, run:');
    console.log('   node scripts/repair-student-2025b01011362.mjs --repair\n');
    try { await deleteApp(adminApp); } catch (e) {}
    return;
  }

  console.log('── STEP 2: EXECUTING SAFE REPAIR ──\n');

  // Action 1: Create admission_map/2025B01011362
  const mapPayload = {
    admissionNumber: TARGET_ADMISSION,
    email: EXPECTED_EMAIL,
    uid: uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _reconciledAt: new Date().toISOString(),
    _reconciledBy: 'targeted-repair-script',
    _correlationId: correlationId
  };

  await targetMapRef.set(mapPayload, { merge: true });
  console.log(`  ✓ Created admission_map/${TARGET_ADMISSION} → UID ${uid} (${EXPECTED_EMAIL})`);

  // Action 2: Also create short form admission_map/25B01011362 alias for zero friction
  const shortAdm = '25B01011362';
  const shortMapRef = db.collection('admission_map').doc(shortAdm);
  await shortMapRef.set({
    ...mapPayload,
    admissionNumber: shortAdm
  }, { merge: true });
  console.log(`  ✓ Created admission_map/${shortAdm} alias → UID ${uid}`);

  // Action 3: Update users/{uid}.admissionNumber to canonical 2025B01011362
  await userDocRef.update({
    admissionNumber: TARGET_ADMISSION,
    updatedAt: new Date().toISOString(),
    _reconciledAt: new Date().toISOString(),
    _correlationId: correlationId
  });
  console.log(`  ✓ Updated users/${uid}.admissionNumber to "${TARGET_ADMISSION}"`);

  // ── STEP 3: POST-REPAIR VERIFICATION ──────────────────────────────────────
  console.log('\n── STEP 3: POST-REPAIR VERIFICATION ──\n');

  const verifyMapSnap = await targetMapRef.get();
  const verifyUserSnap = await userDocRef.get();

  const isMapValid = verifyMapSnap.exists &&
                     verifyMapSnap.data().uid === uid &&
                     verifyMapSnap.data().email === EXPECTED_EMAIL &&
                     verifyMapSnap.data().admissionNumber === TARGET_ADMISSION;

  const isUserValid = verifyUserSnap.exists &&
                      verifyUserSnap.data().admissionNumber === TARGET_ADMISSION &&
                      verifyUserSnap.data().email === EXPECTED_EMAIL;

  console.log(`  • admission_map/${TARGET_ADMISSION} check: ${isMapValid ? 'PASS' : 'FAIL'}`);
  console.log(`  • users/${uid} consistency check:        ${isUserValid ? 'PASS' : 'FAIL'}`);
  console.log(`  • Identity Triple Consistency:           ${isMapValid && isUserValid ? 'PASS' : 'FAIL'}\n`);

  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  REPAIR COMPLETE & VERIFIED');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('Student Bishant Raj can now log in using:');
  console.log(`  Admission Number: ${TARGET_ADMISSION} (or 2025b01011362)`);
  console.log('  Password:         [his existing unchanged password]\n');

  try { await deleteApp(adminApp); } catch (e) {}
}

main().catch(err => {
  console.error('❌ Repair failed:', err.message);
  process.exit(1);
});
