import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

export const PILOT_ACCOUNTS = [
  {
    name: 'Parth Sharma',
    admissionNumber: '2100320100001',
    email: 'parth.sharma@abes.ac.in',
    password: 'password123',
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
    password: 'password123',
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
    password: 'password123',
    role: 'warden',
    gender: 'Male',
    hostelBlock: 'Hostel Office',
    dietPreference: 'Standard',
    proteinTarget: 100,
    rewardPoints: 0
  }
];

/**
 * Developer utility to seed pilot accounts into Firebase Auth & Firestore
 */
export const seedPilotAccounts = async () => {
  if (!isFirebaseConfigured) {
    return { success: true, seeded: 0, message: 'Active in local store' };
  }

  let seededCount = 0;
  for (const account of PILOT_ACCOUNTS) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: account.name });

      const profileDoc = {
        uid: user.uid,
        name: account.name,
        admissionNumber: account.admissionNumber,
        email: account.email,
        role: account.role,
        gender: account.gender,
        hostelBlock: account.hostelBlock,
        dietPreference: account.dietPreference,
        proteinTarget: account.proteinTarget,
        rewardPoints: account.rewardPoints,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profileDoc);
      seededCount++;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        // Account already exists
      } else {
        console.warn(`Error seeding account ${account.email}:`, err.message);
      }
    }
  }

  return { success: true, seeded: seededCount };
};
