import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase.js';

export const PILOT_ACCOUNTS = [
  {
    name: 'Parth Sharma',
    admissionNumber: '2100320100001',
    email: 'parth.sharma@abes.ac.in',
    role: 'student',
    gender: 'Male',
    hostelBlock: 'DNB Block',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 120,
    rewardPoints: 0
  },
  {
    name: 'Mess Committee',
    admissionNumber: 'MC-2026-01',
    email: 'committee@abes.ac.in',
    role: 'mess_committee',
    gender: 'Other',
    hostelBlock: 'Admin Block',
    dietPreference: 'Standard',
    proteinTarget: 100,
    rewardPoints: 0
  },
  {
    name: 'Chief Warden',
    admissionNumber: 'CW-2026-01',
    email: 'warden@abes.ac.in',
    role: 'warden',
    gender: 'Male',
    hostelBlock: 'Hostel Office',
    dietPreference: 'Standard',
    proteinTarget: 100,
    rewardPoints: 0
  },
  {
    name: 'Dr. Anita Sharma',
    admissionNumber: 'OFFICIAL-ANITA',
    email: 'anita@abes.ac.in',
    role: 'warden',
    gender: 'Other',
    hostelBlock: 'ABES Administration',
    dietPreference: 'Standard',
    proteinTarget: 100,
    rewardPoints: 0
  },
  {
    name: 'Prof. Alok Singh',
    admissionNumber: 'OFFICIAL-ALOK',
    email: 'alok@abes.ac.in',
    role: 'warden',
    gender: 'Other',
    hostelBlock: 'ABES Administration',
    dietPreference: 'Standard',
    proteinTarget: 100,
    rewardPoints: 0
  }
];

/**
 * Developer utility to seed pilot accounts into Firebase Auth & Firestore
/**
 * Provisioning is handled via node scripts/provision-officials.mjs outside browser runtime.
 * This stub is kept for backward compatibility without hardcoded credentials.
 */
export const seedPilotAccounts = async () => {
  return { success: true, seeded: 0, message: 'Provisioned via administrative scripts' };
};
