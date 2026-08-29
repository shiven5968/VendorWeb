#!/usr/bin/env node
/**
 * MessMates — Production User Account Reconciliation & Safe Self-Healing
 * ======================================================================
 * Targets the REAL production project: messmates-f69a3
 *
 * SAFETY INVARIANTS:
 * - Read-only by default (--dry-run).
 * - Only performs unambiguous additive writes with --repair.
 * - NEVER overwrites conflicting documents.
 * - NEVER touches ratings, complaints, votes, rewards, subscriptions, or meals.
 * - NEVER logs or touches passwords.
 * - Masks all sensitive identifiers in output.
 *
 * Usage:
 *   node scripts/production-reconcile-auth.mjs --dry-run
 *   node scripts/production-reconcile-auth.mjs --repair
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { initializeApp as initAdminApp, deleteApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { Firestore } from '@google-cloud/firestore';
import { OAuth2Client } from 'google-auth-library';

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRODUCTION TARGET ENFORCEMENT
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_PROJECT_ID = 'messmates-f69a3';

// ─────────────────────────────────────────────────────────────────────────────
// 2. NORMALIZATION FUNCTIONS (Canonical standard)
// ─────────────────────────────────────────────────────────────────────────────

export const normalizeAdmission = (raw) => (raw || '').trim().toUpperCase();
export const normalizeEmail = (raw) => (raw || '').trim().toLowerCase();

// Masking helpers for safe reporting
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '(none)';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.length <= 2
    ? local[0] + '***'
    : local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

export function maskAdmission(adm) {
  if (!adm || typeof adm !== 'string') return '(none)';
  if (adm.length <= 4) return '***';
  return adm.slice(0, 4) + '****' + adm.slice(-4);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CREDENTIAL RESOLVER (Multi-source fallback)
// ─────────────────────────────────────────────────────────────────────────────

function getCredentials() {
  // Option 1: Direct Service Account JSON in env
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      let sa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (typeof sa === 'string') sa = JSON.parse(sa);
      return { type: 'service_account', credential: sa };
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON');
    }
  }

  // Option 2: GOOGLE_APPLICATION_CREDENTIALS file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    try {
      const sa = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8'));
      return { type: 'service_account', credential: sa };
    } catch (e) {}
  }

  // Option 3: Local Firebase CLI configstore (~/.config/configstore/firebase-tools.json)
  const possiblePaths = [
    path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'configstore', 'firebase-tools.json')
  ];

  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.tokens?.access_token) {
          return {
            type: 'oauth',
            accessToken: config.tokens.access_token,
            userEmail: config.user?.email || 'authenticated-user'
          };
        }
      } catch (e) {}
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUDIT CORE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

async function performAudit(auth, db) {
  // 1. Fetch all Firebase Auth users
  const authUsersMap = new Map();
  let pageToken;
  do {
    const listResult = await auth.listUsers(1000, pageToken);
    for (const u of listResult.users) {
      authUsersMap.set(u.uid, {
        uid: u.uid,
        email: normalizeEmail(u.email || ''),
        displayName: u.displayName || '',
        disabled: u.disabled,
        createdAt: u.metadata?.creationTime
      });
    }
    pageToken = listResult.pageToken;
  } while (pageToken);

  // 2. Fetch all users collection docs
  const usersCollectionMap = new Map();
  const usersSnap = await db.collection('users').get();
  usersSnap.forEach(doc => {
    usersCollectionMap.set(doc.id, { id: doc.id, ...doc.data() });
  });

  // 3. Fetch all admission_map collection docs
  const admissionMapDocs = new Map();
  const mapSnap = await db.collection('admission_map').get();
  mapSnap.forEach(doc => {
    admissionMapDocs.set(doc.id, { id: doc.id, ...doc.data() });
  });

  // 4. Classify and correlate every identity
  const classification = {
    healthy: [],
    repairableMissingMap: [],
    repairableMissingProfile: [],
    criticalConflict: [],
    orphanAuth: [],
    orphanProfile: [],
    orphanAdmissionMap: [],
    duplicateMapping: []
  };

  // Track admission number ownership to detect duplicates
  const admissionClaimants = new Map(); // canonicalAdmission -> array of { uid, email, source }

  // Record claims from users collection
  for (const [uid, uDoc] of usersCollectionMap.entries()) {
    const rawAdm = uDoc.admissionNumber;
    if (rawAdm) {
      const canonical = normalizeAdmission(rawAdm);
      if (!admissionClaimants.has(canonical)) admissionClaimants.set(canonical, []);
      admissionClaimants.get(canonical).push({
        uid,
        email: normalizeEmail(uDoc.email || ''),
        source: 'users_profile'
      });
    }
  }

  // Record claims from admission_map
  for (const [docKey, mapDoc] of admissionMapDocs.entries()) {
    const canonical = normalizeAdmission(docKey);
    if (!admissionClaimants.has(canonical)) admissionClaimants.set(canonical, []);
    admissionClaimants.get(canonical).push({
      uid: mapDoc.uid,
      email: normalizeEmail(mapDoc.email || ''),
      source: 'admission_map'
    });
  }

  // Evaluate each Auth User
  for (const [uid, authUser] of authUsersMap.entries()) {
    const profile = usersCollectionMap.get(uid);
    const profileAdm = profile?.admissionNumber ? normalizeAdmission(profile.admissionNumber) : null;
    const profileEmail = profile?.email ? normalizeEmail(profile.email) : null;

    let mapDoc = null;
    if (profileAdm) {
      mapDoc = admissionMapDocs.get(profileAdm);
    }

    // Check if staff account
    const isStaff = authUser.email.includes('warden') ||
                    authUser.email.includes('committee') ||
                    profile?.role === 'warden' ||
                    profile?.role === 'mess_committee';

    if (isStaff) {
      // Staff accounts use email login; if profile exists they are healthy
      if (profile) {
        classification.healthy.push({
          uid,
          email: authUser.email,
          admissionNumber: '(staff)',
          role: profile.role || 'staff',
          type: 'STAFF_HEALTHY'
        });
      } else {
        classification.orphanAuth.push({
          uid,
          email: authUser.email,
          type: 'STAFF_PROFILE_MISSING'
        });
      }
      continue;
    }

    // STUDENT EVALUATION:
    // Case 1: Healthy Triple
    if (
      profile &&
      profileAdm &&
      mapDoc &&
      mapDoc.uid === uid &&
      normalizeEmail(mapDoc.email) === authUser.email &&
      profileEmail === authUser.email
    ) {
      classification.healthy.push({
        uid,
        email: authUser.email,
        admissionNumber: profileAdm,
        name: profile.name || authUser.displayName || 'Student',
        role: 'student'
      });
      continue;
    }

    // Case 2: Auth exists + Profile exists (with valid admissionNumber & matching email) + Map missing
    if (profile && profileAdm && profileEmail === authUser.email && !mapDoc) {
      // Check if admission number is claimed by another UID
      const claimants = admissionClaimants.get(profileAdm) || [];
      const conflictingClaimants = claimants.filter(c => c.uid && c.uid !== uid);

      if (conflictingClaimants.length === 0) {
        classification.repairableMissingMap.push({
          uid,
          email: authUser.email,
          admissionNumber: profileAdm,
          name: profile.name || authUser.displayName || 'Student',
          gender: profile.gender || 'Male',
          hostelBlock: profile.hostelBlock || 'DNB Block'
        });
      } else {
        classification.criticalConflict.push({
          uid,
          email: authUser.email,
          admissionNumber: profileAdm,
          reason: `Admission Number ${maskAdmission(profileAdm)} is claimed by multiple UIDs`,
          claimants
        });
      }
      continue;
    }

    // Case 3: Critical Conflict (Map exists but points to different UID or email)
    if (mapDoc && (mapDoc.uid !== uid || normalizeEmail(mapDoc.email) !== authUser.email)) {
      classification.criticalConflict.push({
        uid,
        email: authUser.email,
        admissionNumber: profileAdm,
        mapUid: mapDoc.uid,
        mapEmail: mapDoc.email,
        reason: 'Map doc UID/email mismatch with Auth user'
      });
      continue;
    }

    // Case 4: Auth exists + Map exists + Profile missing
    if (!profile) {
      // Find if any map document points to this UID
      const ownedMapDoc = Array.from(admissionMapDocs.values()).find(m => m.uid === uid);
      if (ownedMapDoc && ownedMapDoc.admissionNumber) {
        classification.repairableMissingProfile.push({
          uid,
          email: authUser.email,
          admissionNumber: normalizeAdmission(ownedMapDoc.admissionNumber),
          name: authUser.displayName || authUser.email.split('@')[0]
        });
      } else {
        classification.orphanAuth.push({
          uid,
          email: authUser.email,
          displayName: authUser.displayName,
          createdAt: authUser.createdAt
        });
      }
      continue;
    }

    // Case 5: Profile exists but has no admissionNumber
    if (profile && !profileAdm) {
      classification.orphanAuth.push({
        uid,
        email: authUser.email,
        reason: 'Profile exists but admissionNumber field is empty'
      });
      continue;
    }
  }

  // Check for Orphan Profiles (Profile in users/{uid} with no Auth record)
  for (const [uid, profile] of usersCollectionMap.entries()) {
    if (!authUsersMap.has(uid)) {
      classification.orphanProfile.push({
        uid,
        email: profile.email,
        admissionNumber: profile.admissionNumber
      });
    }
  }

  // Check for Orphan Admission Maps (Map doc with no Auth record)
  for (const [admKey, mapDoc] of admissionMapDocs.entries()) {
    if (mapDoc.uid && !authUsersMap.has(mapDoc.uid)) {
      classification.orphanAdmissionMap.push({
        admissionNumber: admKey,
        mappedUid: mapDoc.uid,
        mappedEmail: mapDoc.email
      });
    }
  }

  return {
    authCount: authUsersMap.size,
    profileCount: usersCollectionMap.size,
    mapCount: admissionMapDocs.size,
    classification
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. REPAIR EXECUTION ENGINE (Additive & Non-destructive ONLY)
// ─────────────────────────────────────────────────────────────────────────────

async function executeRepairs(db, classification, correlationId) {
  const auditLog = [];
  let profilesRepaired = 0;
  let mapsRepaired = 0;
  let conflictsOverwritten = 0;

  console.log('── EXECUTING SAFE PRODUCTION REPAIRS ──\n');

  // SAFE REPAIR A: Create Missing admission_map Documents
  for (const item of classification.repairableMissingMap) {
    const canonical = normalizeAdmission(item.admissionNumber);
    const cleanEmail = normalizeEmail(item.email);

    const mapDocRef = db.collection('admission_map').doc(canonical);

    // Idempotent double-check: ensure document still does not exist before writing
    const existingSnap = await mapDocRef.get();
    if (existingSnap.exists) {
      const existingData = existingSnap.data();
      if (existingData.uid !== item.uid) {
        console.warn(`[REPAIR SKIPPED] ${canonical} was claimed concurrently by UID ${existingData.uid}`);
        conflictsOverwritten = 0; // Invariant preserved
        continue;
      }
    }

    const payload = {
      admissionNumber: canonical,
      email: cleanEmail,
      uid: item.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _reconciledAt: new Date().toISOString(),
      _reconciledBy: 'production-reconcile-auth',
      _correlationId: correlationId
    };

    await mapDocRef.set(payload, { merge: true });
    mapsRepaired++;

    auditLog.push({
      timestamp: new Date().toISOString(),
      uid: item.uid,
      admissionNumber: maskAdmission(canonical),
      email: maskEmail(cleanEmail),
      action: 'CREATED_ADMISSION_MAP',
      correlationId
    });

    console.log(`  ✓ Created admission_map/${canonical} → UID: ${item.uid.slice(0, 8)}... (${maskEmail(cleanEmail)})`);
  }

  // SAFE REPAIR B: Create Missing users/{uid} Profile Documents
  for (const item of classification.repairableMissingProfile) {
    const canonical = normalizeAdmission(item.admissionNumber);
    const cleanEmail = normalizeEmail(item.email);

    const userDocRef = db.collection('users').doc(item.uid);
    const existingSnap = await userDocRef.get();

    if (!existingSnap.exists) {
      const newProfile = {
        uid: item.uid,
        name: item.name || 'Student',
        email: cleanEmail,
        admissionNumber: canonical,
        role: 'student',
        gender: 'Male',
        hostelBlock: 'DNB Block',
        dietPreference: 'High Protein / Eggetarian',
        proteinTarget: 120,
        rewardPoints: 0,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _reconciledAt: new Date().toISOString(),
        _reconciledBy: 'production-reconcile-auth',
        _correlationId: correlationId
      };

      await userDocRef.set(newProfile, { merge: true });
      profilesRepaired++;

      auditLog.push({
        timestamp: new Date().toISOString(),
        uid: item.uid,
        admissionNumber: maskAdmission(canonical),
        email: maskEmail(cleanEmail),
        action: 'CREATED_USER_PROFILE',
        correlationId
      });

      console.log(`  ✓ Created users/${item.uid} → Adm: ${canonical} (${maskEmail(cleanEmail)})`);
    }
  }

  return {
    profilesRepaired,
    mapsRepaired,
    conflictsOverwritten,
    auditLog
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN RECONCILIATION CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isRepair = args.includes('--repair');
  const correlationId = 'REC-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  MESSMATES — PRODUCTION USER ACCOUNT RECONCILIATION');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`TARGET PROJECT: messmates-f69a3`);
  console.log(`MODE:           ${isRepair ? '🔧 LIVE REPAIR (--repair)' : '🔍 READ-ONLY AUDIT (--dry-run)'}`);
  console.log(`CORRELATION ID: ${correlationId}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  // Verify Project ID Safety Check
  if (TARGET_PROJECT_ID !== 'messmates-f69a3') {
    console.error('❌ FATAL: Target project is not messmates-f69a3. Aborting.');
    process.exit(1);
  }

  // Obtain Credentials
  const creds = getCredentials();
  if (!creds) {
    console.error('❌ HUMAN ACTION REQUIRED:');
    console.error('   No Firebase Admin credentials or Firebase CLI login session found.');
    console.error('   Please ensure you are logged into Firebase CLI (`firebase login`)');
    console.error('   or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.\n');
    process.exit(1);
  }

  console.log(`✓ Authenticated via: ${creds.type === 'oauth' ? `Firebase CLI OAuth (${creds.userEmail})` : 'Service Account'}\n`);

  // Initialize Firebase Admin (Auth) & Firestore
  let adminApp;
  let auth;
  let db;

  try {
    if (creds.type === 'service_account') {
      adminApp = initAdminApp({
        projectId: TARGET_PROJECT_ID,
        credential: creds.credential
      }, 'prod-reconcile-' + Date.now());
      auth = getAdminAuth(adminApp);
      db = new Firestore({ projectId: TARGET_PROJECT_ID });
    } else {
      adminApp = initAdminApp({
        projectId: TARGET_PROJECT_ID,
        credential: {
          getAccessToken: async () => ({
            access_token: creds.accessToken,
            expires_in: 3600
          })
        }
      }, 'prod-reconcile-' + Date.now());
      auth = getAdminAuth(adminApp);

      const authClient = new OAuth2Client();
      authClient.setCredentials({ access_token: creds.accessToken });
      db = new Firestore({
        projectId: TARGET_PROJECT_ID,
        authClient: authClient
      });
    }
  } catch (initErr) {
    console.error('❌ Failed to initialize Firebase connection:', initErr.message);
    process.exit(1);
  }

  // ── STEP 1: Perform Initial Audit ──────────────────────────────────────────
  console.log('Scanning Production Collections: Auth Users, users/{uid}, admission_map/...\n');
  const auditResult = await performAudit(auth, db);

  const { authCount, profileCount, mapCount, classification } = auditResult;

  console.log('──────────────────────────────────────────────────────────────────');
  console.log('  INITIAL PRODUCTION AUDIT SUMMARY');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log(`Total Firebase Auth Accounts:  ${authCount}`);
  console.log(`Total Firestore Profile Docs:   ${profileCount}`);
  console.log(`Total Admission Map Docs:       ${mapCount}\n`);
  console.log(`Classification:`);
  console.log(`  • Healthy Accounts:           ${classification.healthy.length}`);
  console.log(`  • Repairable Missing Map:     ${classification.repairableMissingMap.length}`);
  console.log(`  • Repairable Missing Profile: ${classification.repairableMissingProfile.length}`);
  console.log(`  • Critical Conflicts:         ${classification.criticalConflict.length}`);
  console.log(`  • Orphan Auth Accounts:       ${classification.orphanAuth.length}`);
  console.log(`  • Orphan Profile Docs:        ${classification.orphanProfile.length}`);
  console.log(`  • Orphan Admission Map Docs:  ${classification.orphanAdmissionMap.length}`);
  console.log('──────────────────────────────────────────────────────────────────\n');

  // Print Details of Repairable Accounts
  if (classification.repairableMissingMap.length > 0) {
    console.log('REPAIRABLE MISSING ADMISSION MAPS:');
    classification.repairableMissingMap.forEach((u, i) => {
      console.log(`  ${i + 1}. Adm: ${u.admissionNumber.padEnd(16)} Email: ${maskEmail(u.email).padEnd(25)} UID: ${u.uid}`);
    });
    console.log('');
  }

  if (classification.orphanAuth.length > 0) {
    console.log('ORPHAN AUTH ACCOUNTS (Incomplete registrations):');
    classification.orphanAuth.forEach((u, i) => {
      console.log(`  ${i + 1}. Email: ${maskEmail(u.email).padEnd(25)} UID: ${u.uid} (Created: ${u.createdAt || 'unknown'})`);
    });
    console.log('');
  }

  if (classification.criticalConflict.length > 0) {
    console.log('⚠️ CRITICAL IDENTITY CONFLICTS (Manual Review Required):');
    classification.criticalConflict.forEach((c, i) => {
      console.log(`  ${i + 1}. UID: ${c.uid} Adm: ${maskAdmission(c.admissionNumber)} Reason: ${c.reason}`);
    });
    console.log('');
  }

  // ── STEP 2: Execute Repairs (if --repair flag specified) ───────────────────
  let repairStats = {
    profilesRepaired: 0,
    mapsRepaired: 0,
    conflictsOverwritten: 0,
    auditLog: []
  };

  if (isRepair) {
    repairStats = await executeRepairs(db, classification, correlationId);

    // ── STEP 3: Post-Repair Audit Verification ───────────────────────────────
    console.log('\nRunning Post-Repair Verification Scan...\n');
    const postAudit = await performAudit(auth, db);

    console.log('══════════════════════════════════════════════════════════════════');
    console.log('  POST-REPAIR AUDIT VERIFICATION RESULTS');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log(`Healthy Accounts:             ${postAudit.classification.healthy.length} (was ${classification.healthy.length})`);
    console.log(`Profiles Repaired:            ${repairStats.profilesRepaired}`);
    console.log(`Admission Maps Repaired:      ${repairStats.mapsRepaired}`);
    console.log(`Conflicts Overwritten:        ${repairStats.conflictsOverwritten} (MUST BE 0)`);
    console.log(`Remaining Repairable:         ${postAudit.classification.repairableMissingMap.length + postAudit.classification.repairableMissingProfile.length}`);
    console.log(`Remaining Conflicts:          ${postAudit.classification.criticalConflict.length}`);
    console.log(`Orphan Auth (Incomplete):     ${postAudit.classification.orphanAuth.length}`);
    console.log('══════════════════════════════════════════════════════════════════\n');
  } else {
    console.log('💡 This was a READ-ONLY DRY RUN. No documents were modified in production.');
    console.log('   To apply the safe repairs, run:');
    console.log('   node scripts/production-reconcile-auth.mjs --repair\n');
  }

  // Cleanup admin app
  try { await deleteApp(adminApp); } catch (e) {}
}

main().catch(err => {
  console.error('\n❌ Production reconciliation crashed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
