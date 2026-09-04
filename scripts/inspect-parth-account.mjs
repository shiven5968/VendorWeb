#!/usr/bin/env node
/**
 * MessMates — Read-Only Inspection for Parth Sharma
 * Target: messmates-f69a3
 * Email: parth.25b15310212@abes.ac.in
 * Admission Number: 2025B15310212
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { initializeApp as initAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { Firestore } from '@google-cloud/firestore';
import { OAuth2Client } from 'google-auth-library';

const TARGET_PROJECT_ID = 'messmates-f69a3';
const TARGET_EMAIL = 'parth.25b15310212@abes.ac.in';
const TARGET_ADMISSION = '2025B15310212';
const TARGET_NAME = 'Parth Sharma';

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
  console.log(' MESSMATES — READ-ONLY INSPECTION FOR PARTH SHARMA');
  console.log('================================================================');

  const creds = getCredentials();
  if (!creds) {
    console.error('❌ FATAL: No credentials found.');
    process.exit(1);
  }

  const adminApp = initAdminApp({
    projectId: TARGET_PROJECT_ID,
    credential: { getAccessToken: async () => ({ access_token: creds.accessToken, expires_in: 3600 }) }
  }, 'inspect-' + Date.now());
  const auth = getAdminAuth(adminApp);

  const authClient = new OAuth2Client();
  authClient.setCredentials({ access_token: creds.accessToken });
  const db = new Firestore({ projectId: TARGET_PROJECT_ID, authClient });

  // 1. Check Firebase Auth
  console.log('\n1. FIREBASE AUTHENTICATION:');
  let authUserByEmail = null;
  try {
    authUserByEmail = await auth.getUserByEmail(TARGET_EMAIL);
    console.log(`   ✓ Found user by email (${TARGET_EMAIL}):`);
    console.log(`     - UID: ${authUserByEmail.uid}`);
    console.log(`     - Email: ${authUserByEmail.email}`);
    console.log(`     - Created: ${authUserByEmail.metadata.creationTime}`);
    console.log(`     - Last Sign-in: ${authUserByEmail.metadata.lastSignInTime}`);
    console.log(`     - Disabled: ${authUserByEmail.disabled}`);
  } catch (e) {
    console.log(`   ❌ No Auth user found for email ${TARGET_EMAIL} (${e.code || e.message})`);
  }

  // Also list all Auth users in case of case-variant or different email
  let matchingAuthUsers = [];
  try {
    const listUsersResult = await auth.listUsers(1000);
    for (const u of listUsersResult.users) {
      const uEmail = (u.email || '').toLowerCase();
      if (
        uEmail.includes('25b15310212') ||
        uEmail.includes('parth') ||
        (u.displayName && u.displayName.toLowerCase().includes('parth'))
      ) {
        matchingAuthUsers.push(u);
      }
    }
    console.log(`   - Scanned ${listUsersResult.users.length} total Auth accounts.`);
    if (matchingAuthUsers.length > 0) {
      console.log(`   - Found ${matchingAuthUsers.length} potential matching Auth account(s):`);
      matchingAuthUsers.forEach(u => {
        console.log(`     * UID: ${u.uid} | Email: ${u.email} | Display: ${u.displayName}`);
      });
    } else {
      console.log('   - No matching Auth accounts found by keyword scan.');
    }
  } catch (e) {
    console.log('   (Unable to list all users: ' + e.message + ')');
  }

  // 2. Check admission_map
  console.log('\n2. ADMISSION_MAP COLLECTION:');
  const admissionVariants = [
    TARGET_ADMISSION,
    TARGET_ADMISSION.toLowerCase(),
    TARGET_ADMISSION.toUpperCase()
  ];
  const uniqueVariants = [...new Set(admissionVariants)];
  for (const variant of uniqueVariants) {
    const mapDoc = await db.collection('admission_map').doc(variant).get();
    if (mapDoc.exists) {
      console.log(`   ✓ admission_map/${variant} EXISTS:`, mapDoc.data());
    } else {
      console.log(`   ❌ admission_map/${variant} does NOT exist.`);
    }
  }

  // Also scan all admission_map docs for target email or UID
  const allMapSnaps = await db.collection('admission_map').get();
  console.log(`   - Total admission_map entries: ${allMapSnaps.size}`);
  allMapSnaps.forEach(docSnap => {
    const d = docSnap.data();
    if (
      docSnap.id.toLowerCase().includes('15310212') ||
      (d.email && d.email.toLowerCase().includes('25b15310212')) ||
      (d.email && d.email.toLowerCase().includes('parth'))
    ) {
      console.log(`   - Matched admission_map entry [${docSnap.id}]:`, d);
    }
  });

  // 3. Check users/{uid}
  console.log('\n3. USERS COLLECTION:');
  const userDocs = await db.collection('users').get();
  console.log(`   - Total users docs: ${userDocs.size}`);
  let matchedUserDocs = [];
  userDocs.forEach(docSnap => {
    const d = docSnap.data();
    const adm = (d.admissionNumber || '').toLowerCase();
    const email = (d.email || '').toLowerCase();
    const name = (d.name || '').toLowerCase();
    if (
      adm.includes('15310212') ||
      email.includes('25b15310212') ||
      (email.includes('parth') && !email.includes('anita')) ||
      name.includes('parth')
    ) {
      matchedUserDocs.push({ id: docSnap.id, ...d });
    }
  });

  if (matchedUserDocs.length > 0) {
    console.log(`   ✓ Found ${matchedUserDocs.length} matching user profile(s):`);
    matchedUserDocs.forEach(u => {
      console.log(`     * ID/UID: ${u.id}`);
      console.log(`       Name: ${u.name}`);
      console.log(`       Email: ${u.email}`);
      console.log(`       Admission: ${u.admissionNumber}`);
      console.log(`       Hostel: ${u.hostelBlock}`);
      console.log(`       Role: ${u.role}`);
      console.log(`       CollegeId: ${u.collegeId}`);
      console.log(`       RewardPoints: ${u.rewardPoints}`);
    });
  } else {
    console.log('   ❌ No matching user document found in /users.');
  }

  // 4. Check historical data collections (ratings, complaints, rewards, votes, subscriptions, protein, etc.)
  console.log('\n4. HISTORICAL DATA AUDIT:');
  const collectionsToCheck = [
    'ratings',
    'complaints',
    'rewards',
    'votes',
    'subscriptions',
    'meal_subscriptions',
    'protein_logs',
    'health_logs',
    'food_welfare_points'
  ];

  const candidateUids = new Set();
  if (authUserByEmail) candidateUids.add(authUserByEmail.uid);
  matchingAuthUsers.forEach(u => candidateUids.add(u.uid));
  matchedUserDocs.forEach(u => candidateUids.add(u.id));

  console.log(`   - Candidate UIDs for Parth Sharma: [${[...candidateUids].join(', ')}]`);

  for (const colName of collectionsToCheck) {
    try {
      const colRef = db.collection(colName);
      const snap = await colRef.get();
      let matchCount = 0;
      snap.forEach(d => {
        const data = d.data();
        const uidMatches = [
          data.uid,
          data.userId,
          data.studentId,
          data.authorUid,
          data.submittedBy
        ].filter(Boolean);

        const emailMatches = [
          data.email,
          data.studentEmail,
          data.userEmail
        ].filter(Boolean).map(e => e.toLowerCase());

        const admMatches = [
          data.admissionNumber,
          data.admissionNo
        ].filter(Boolean).map(a => a.toLowerCase());

        const hasUidMatch = uidMatches.some(id => candidateUids.has(id));
        const hasEmailMatch = emailMatches.some(e => e.includes('25b15310212') || e.includes('parth'));
        const hasAdmMatch = admMatches.some(a => a.includes('15310212'));

        if (hasUidMatch || hasEmailMatch || hasAdmMatch) {
          matchCount++;
          console.log(`     - [${colName}/${d.id}]:`, JSON.stringify(data));
        }
      });
      console.log(`   - Collection '${colName}': ${snap.size} total docs, ${matchCount} matching Parth Sharma.`);
    } catch (err) {
      console.log(`   - Collection '${colName}': (not present or inaccessible: ${err.message})`);
    }
  }

  console.log('\n================================================================');
  console.log(' INSPECTION COMPLETE');
  console.log('================================================================\n');
}

main().catch(e => {
  console.error('Fatal error during inspection:', e);
  process.exit(1);
});
