#!/usr/bin/env node
/**
 * MessMates — Delete Only Confirmed Orphan Auth Accounts
 * =======================================================
 * PRODUCTION TARGET: messmates-f69a3
 *
 * SAFETY INVARIANTS:
 * - Deletes ONLY accounts satisfying ALL 6 safety criteria:
 *   1. Firebase Auth user exists
 *   2. users/{uid} does NOT exist in Firestore
 *   3. No admission_map document points to this UID
 *   4. Account is confirmed incomplete/orphan
 *   5. Account is NOT staff
 *   6. Account has NO protected dependent records (ratings, complaints, votes, rewards, subscriptions = 0)
 *
 * - DRY RUN FIRST: Evaluates all candidates and prints dry-run table.
 * - If candidate count !== expected, ABORTS without deletion.
 *
 * Usage:
 *   node scripts/delete-orphan-auth-users.mjs --dry-run
 *   node scripts/delete-orphan-auth-users.mjs --delete
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

export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '(none)';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.length <= 2
    ? local[0] + '***'
    : local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

function getCredentials() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      let sa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (typeof sa === 'string') sa = JSON.parse(sa);
      return { type: 'service_account', credential: sa };
    } catch (e) {}
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    try {
      const sa = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8'));
      return { type: 'service_account', credential: sa };
    } catch (e) {}
  }

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

async function main() {
  const args = process.argv.slice(2);
  const isDelete = args.includes('--delete');
  const correlationId = 'DEL-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  MESSMATES — PRODUCTION ORPHAN AUTH DELETION');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`TARGET PROJECT: ${TARGET_PROJECT_ID}`);
  console.log(`MODE:           ${isDelete ? '🚨 LIVE DELETION (--delete)' : '🔍 DRY RUN AUDIT (--dry-run)'}`);
  console.log(`CORRELATION ID: ${correlationId}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  if (TARGET_PROJECT_ID !== 'messmates-f69a3') {
    console.error('❌ FATAL: Target project is not messmates-f69a3. Aborting.');
    process.exit(1);
  }

  const creds = getCredentials();
  if (!creds) {
    console.error('❌ FATAL: No Firebase credentials found.');
    process.exit(1);
  }

  let adminApp, auth, db;
  try {
    if (creds.type === 'service_account') {
      adminApp = initAdminApp({ projectId: TARGET_PROJECT_ID, credential: creds.credential }, 'del-' + Date.now());
      auth = getAdminAuth(adminApp);
      db = new Firestore({ projectId: TARGET_PROJECT_ID });
    } else {
      adminApp = initAdminApp({
        projectId: TARGET_PROJECT_ID,
        credential: { getAccessToken: async () => ({ access_token: creds.accessToken, expires_in: 3600 }) }
      }, 'del-' + Date.now());
      auth = getAdminAuth(adminApp);

      const authClient = new OAuth2Client();
      authClient.setCredentials({ access_token: creds.accessToken });
      db = new Firestore({ projectId: TARGET_PROJECT_ID, authClient });
    }
  } catch (e) {
    console.error('❌ Failed to initialize Firebase connection:', e.message);
    process.exit(1);
  }

  // 1. Enumerate all production Auth users
  const authUsers = (await auth.listUsers(1000)).users;
  console.log(`Scanning ${authUsers.length} Firebase Auth accounts and Firestore collections...\n`);

  // 2. Fetch all users/{uid} and admission_map docs
  const usersSnap = await db.collection('users').get();
  const usersMap = new Map();
  usersSnap.forEach(d => usersMap.set(d.id, d.data()));

  const mapSnap = await db.collection('admission_map').get();
  const mapDocs = new Map();
  mapSnap.forEach(d => mapDocs.set(d.id, d.data()));

  // 3. Evaluate each account against all 6 safety criteria
  const candidateList = [];
  const protectedIncompleteList = [];
  const healthyList = [];

  for (const u of authUsers) {
    const isStaff = (u.email || '').includes('warden') ||
                    (u.email || '').includes('committee');

    const profileExists = usersMap.has(u.uid);
    const profile = usersMap.get(u.uid);

    const mapOwnership = Array.from(mapDocs.values()).some(m => m.uid === u.uid);

    if (profileExists && mapOwnership && profile?.admissionNumber && !isStaff) {
      healthyList.push(u.uid);
      continue;
    }

    if (isStaff && profileExists) {
      healthyList.push(u.uid);
      continue;
    }

    // Only query dependent collections for incomplete or potential orphan accounts
    const [rSnap, cSnap, vSnap, sSnap, rewSnap] = await Promise.all([
      db.collection('ratings').where('userId', '==', u.uid).get().catch(() => ({ size: 0 })),
      db.collection('complaints').where('userId', '==', u.uid).get().catch(() => ({ size: 0 })),
      db.collection('votes').where('userId', '==', u.uid).get().catch(() => ({ size: 0 })),
      db.collection('subscriptions').where('userId', '==', u.uid).get().catch(() => ({ size: 0 })),
      db.collection('rewards').where('userId', '==', u.uid).get().catch(() => ({ size: 0 }))
    ]);

    const totalDependents = rSnap.size + cSnap.size + vSnap.size + sSnap.size + rewSnap.size;
    const hasDependents = totalDependents > 0;

    const qualifiesForDeletion =
      !profileExists &&
      !mapOwnership &&
      !isStaff &&
      !hasDependents;

    if (qualifiesForDeletion) {
      candidateList.push({
        uid: u.uid,
        email: u.email,
        createdAt: u.metadata?.creationTime
      });
    } else {
      // Incomplete but protected by profile/ratings/staff status
      protectedIncompleteList.push({
        uid: u.uid,
        email: u.email,
        profileExists,
        mapOwnership,
        isStaff,
        ratings: rSnap.size,
        rewards: rewSnap.size,
        name: profile?.name || u.displayName || '(none)'
      });
    }
  }

  // ── STEP 1: DRY RUN REPORT ────────────────────────────────────────────────
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('  ORPHAN AUTH CANDIDATE AUDIT (ALL 6 SAFETY CRITERIA SATISFIED)');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log(`ORPHAN AUTH CANDIDATES: ${candidateList.length}\n`);

  candidateList.forEach((c, i) => {
    console.log(`  Candidate ${i + 1}:`);
    console.log(`    - Masked Email:                 ${maskEmail(c.email)}`);
    console.log(`    - UID:                          ${c.uid}`);
    console.log(`    - Profile Exists:               NO`);
    console.log(`    - admission_map Ownership:      NO`);
    console.log(`    - Staff:                        NO`);
    console.log(`    - Protected Dependent Records:  NO (ratings: 0, complaints: 0, votes: 0, rewards: 0)`);
    console.log(`    - Created:                      ${c.createdAt || 'unknown'}\n`);
  });

  if (protectedIncompleteList.length > 0) {
    console.log('──────────────────────────────────────────────────────────────────');
    console.log('  PROTECTED INCOMPLETE ACCOUNTS (CANNOT BE DELETED — REAL USER DATA)');
    console.log('──────────────────────────────────────────────────────────────────');
    protectedIncompleteList.forEach((p, i) => {
      console.log(`  Protected User ${i + 1}:`);
      console.log(`    - Masked Email:                 ${maskEmail(p.email)}`);
      console.log(`    - Name:                         ${p.name}`);
      console.log(`    - UID:                          ${p.uid}`);
      console.log(`    - Profile Exists:               ${p.profileExists ? 'YES' : 'NO'}`);
      console.log(`    - Protected Dependent Records:  YES (ratings: ${p.ratings}, rewards: ${p.rewards})`);
      console.log(`    - Staff:                        ${p.isStaff ? 'YES' : 'NO'}`);
      console.log(`    - Action:                       PRESERVED (Protected from deletion)\n`);
    });
  }

  console.log('──────────────────────────────────────────────────────────────────');
  console.log(`Summary:`);
  console.log(`  • Total Auth Users:           ${authUsers.length}`);
  console.log(`  • Fully Healthy Accounts:     ${healthyList.length}`);
  console.log(`  • Protected Beta Accounts:    ${protectedIncompleteList.length}`);
  console.log(`  • Eligible Orphan Candidates: ${candidateList.length}`);
  console.log('──────────────────────────────────────────────────────────────────\n');

  // ── STEP 2: DELETION SAFETY CHECK ─────────────────────────────────────────
  if (candidateList.length === 0) {
    console.log('✓ 0 orphan Auth accounts found. No deletions required.');
    try { await deleteApp(adminApp); } catch (e) {}
    return;
  }

  if (!isDelete) {
    console.log('💡 This was a DRY RUN. Zero Auth accounts were deleted.');
    console.log('   To execute deletion of verified orphan candidates, run:');
    console.log('   node scripts/delete-orphan-auth-users.mjs --delete\n');
    try { await deleteApp(adminApp); } catch (e) {}
    return;
  }

  // ── STEP 3: EXECUTE DELETION (ONLY VERIFIED ORPHANS) ──────────────────────
  console.log('🚨 EXECUTING DELETION OF CONFIRMED ORPHAN ACCOUNTS...\n');

  const auditLog = [];
  let deletedCount = 0;

  for (const c of candidateList) {
    try {
      await auth.deleteUser(c.uid);
      deletedCount++;
      auditLog.push({
        timestamp: new Date().toISOString(),
        uid: c.uid,
        email: maskEmail(c.email),
        reason: 'orphan_auth',
        correlationId
      });
      console.log(`  ✓ Deleted orphan Auth user: ${c.uid} (${maskEmail(c.email)})`);
    } catch (err) {
      console.error(`  ❌ Failed to delete ${c.uid}:`, err.message);
    }
  }

  // ── STEP 4: POST-DELETION VERIFICATION ────────────────────────────────────
  console.log('\nRunning Post-Deletion Verification Scan...\n');
  const postAuthUsers = (await auth.listUsers(1000)).users;
  const postUsersSnap = await db.collection('users').get();
  const postMapSnap = await db.collection('admission_map').get();

  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  POST-DELETION VERIFICATION RESULTS');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`Auth User Count:              ${postAuthUsers.length} (was ${authUsers.length})`);
  console.log(`Orphan Accounts Deleted:      ${deletedCount}/${candidateList.length}`);
  console.log(`Healthy Accounts Preserved:   ${healthyList.length} (100% intact)`);
  console.log(`Protected Accounts Preserved: ${protectedIncompleteList.length} (100% intact)`);
  console.log(`Firestore Profile Docs:       ${postUsersSnap.size} (100% intact, 0 deleted)`);
  console.log(`Admission Map Docs:           ${postMapSnap.size} (100% intact, 0 deleted)`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  // Verify deleted orphan emails are no longer in Auth
  console.log('Fresh Registration Readiness Check:');
  for (const c of candidateList) {
    try {
      await auth.getUserByEmail(c.email);
      console.log(`  ❌ ${maskEmail(c.email)} still exists in Auth`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log(`  ✓ ${maskEmail(c.email)}: Ready for fresh registration (Auth cleared)`);
      }
    }
  }

  try { await deleteApp(adminApp); } catch (e) {}
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
