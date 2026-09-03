#!/usr/bin/env node
/**
 * MessMates — Administrative Provisioning Script for ABES Officials
 * =================================================================
 * Safely provisions or updates the authorized ABES Officials:
 * 1. anita@abes.ac.in
 * 2. alok@abes.ac.in
 *
 * Credentials are provided via environment variable or CLI argument:
 *   OFFICIAL_PASSWORD="<password>" node scripts/provision-officials.mjs
 *   or: node scripts/provision-officials.mjs "<password>"
 *
 * NEVER hard-code credentials in frontend source code.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const password = process.argv[2] || process.env.OFFICIAL_PASSWORD;
if (!password) {
  console.error('[PROVISION] Error: Password must be provided via OFFICIAL_PASSWORD env var or CLI argument:');
  console.error('  node scripts/provision-officials.mjs "<password>"');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyARw4CyvhbiItVCC4HiKvaR-N8a1nmi3JU',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'messmates-f69a3',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:39348747656:web:8e5b4170ebb25ae2978e3d'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const OFFICIAL_ACCOUNTS = [
  { email: 'anita@abes.ac.in', name: 'Dr. Anita Sharma', admissionNumber: 'OFFICIAL-ANITA' },
  { email: 'alok@abes.ac.in', name: 'Prof. Alok Singh', admissionNumber: 'OFFICIAL-ALOK' }
];

async function main() {
  console.log('[PROVISION] Initializing official account provisioning...');

  for (const acc of OFFICIAL_ACCOUNTS) {
    let user = null;
    try {
      const res = await signInWithEmailAndPassword(auth, acc.email, password);
      user = res.user;
      console.log(`[AUTH] Existing account verified: ${acc.email} (${user.uid})`);
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        const cred = await createUserWithEmailAndPassword(auth, acc.email, password);
        user = cred.user;
        console.log(`[AUTH] Created new account: ${acc.email} (${user.uid})`);
      } else {
        throw e;
      }
    }

    if (user) {
      const profile = {
        uid: user.uid,
        name: acc.name,
        email: acc.email,
        admissionNumber: acc.admissionNumber,
        role: 'warden',
        gender: 'Other',
        hostelBlock: 'ABES Administration',
        dietPreference: 'Standard',
        proteinTarget: 100,
        rewardPoints: 0,
        emailVerified: true,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      console.log(`[FIRESTORE] Official profile written: ${acc.email} (role: warden)`);

      const snap = await getDoc(doc(db, 'users', user.uid));
      console.log(`[VERIFY] Confirmed Firestore role: ${snap.data()?.role}`);
    }
  }

  console.log('[PROVISION] Successfully provisioned all ABES Officials.');
  process.exit(0);
}

main().catch(err => {
  console.error('[PROVISION] Error:', err.message);
  process.exit(1);
});
