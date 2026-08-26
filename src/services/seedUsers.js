import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

export const PILOT_ACCOUNTS = [
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@hostel.edu',
    password: 'password123',
    role: 'student',
    gender: 'Male',
    hostelBlock: 'DNB Block',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 120,
    rewardPoints: 420
  },
  {
    name: 'Ananya Singh',
    email: 'ananya.singh@hostel.edu',
    password: 'password123',
    role: 'student',
    gender: 'Female',
    hostelBlock: 'Kalpana Chawla (Girls)',
    dietPreference: 'Pure Vegetarian',
    proteinTarget: 100,
    rewardPoints: 510
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@hostel.edu',
    password: 'password123',
    role: 'student',
    gender: 'Female',
    hostelBlock: 'Sarojini Block (Girls)',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 110,
    rewardPoints: 340
  },
  {
    name: 'Parth Sharma',
    email: 'parth.sharma@hostel.edu',
    password: 'password123',
    role: 'student',
    gender: 'Male',
    hostelBlock: 'DNB Block',
    dietPreference: 'High Protein / Eggetarian',
    proteinTarget: 130,
    rewardPoints: 480
  },
  {
    name: 'Mess Committee',
    email: 'committee@hostel.edu',
    password: 'password123',
    role: 'mess_committee',
    gender: 'Other',
    hostelBlock: 'Admin Block',
    dietPreference: 'Standard',
    proteinTarget: 100,
    rewardPoints: 0
  },
  {
    name: 'Pathak Sir',
    email: 'warden@hostel.edu',
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
    console.log('Firebase environment keys not set. Pilot accounts active in local database.');
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
        // Account already exists in Firebase Auth
        console.log(`Account ${account.email} already exists in Firebase.`);
      } else {
        console.warn(`Error seeding account ${account.email}:`, err.message);
      }
    }
  }

  return { success: true, seeded: seededCount };
};
