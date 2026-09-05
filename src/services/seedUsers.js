import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase.js';

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
    rewardPoints: 350
  },
  {
    name: 'The Burger Club',
    admissionNumber: 'PARTNER-BC-01',
    email: 'partner@abes.ac.in',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_burger_club',
    vendorName: 'The Burger Club',
    vendorLogo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'Crossing Republik Commercial Hub',
    dietPreference: 'Standard',
    proteinTarget: 0,
    rewardPoints: 0
  },
  {
    name: 'PVR Grand',
    admissionNumber: 'PARTNER-PVR-01',
    email: 'pvr@partner.messmates.com',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_pvr_grand',
    vendorName: 'PVR Grand',
    vendorLogo: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'Opulent Mall Ghaziabad',
    dietPreference: 'Standard',
    proteinTarget: 0,
    rewardPoints: 0
  },
  {
    name: 'FitGym ABES',
    admissionNumber: 'PARTNER-FIT-01',
    email: 'fitgym@abes.ac.in',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_fitgym',
    vendorName: 'FitGym ABES',
    vendorLogo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'ABES Sports Complex',
    dietPreference: 'Standard',
    proteinTarget: 0,
    rewardPoints: 0
  },
  {
    name: 'Campus Mart',
    admissionNumber: 'PARTNER-CM-01',
    email: 'campusmart@abes.ac.in',
    password: 'password123',
    role: 'partner',
    vendorId: 'vendor_campus_mart',
    vendorName: 'Campus Mart',
    vendorLogo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=300',
    gender: 'Other',
    hostelBlock: 'ABES Student Activity Center',
    dietPreference: 'Standard',
    proteinTarget: 0,
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
        vendorId: account.vendorId || null,
        vendorName: account.vendorName || null,
        vendorLogo: account.vendorLogo || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profileDoc);
      
      // Index in admission_map
      if (account.admissionNumber) {
        await setDoc(doc(db, 'admission_map', account.admissionNumber), {
          admissionNumber: account.admissionNumber,
          email: account.email,
          uid: user.uid,
          createdAt: new Date().toISOString()
        });
      }

      seededCount++;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        // Ensure admission_map document exists even if user is already in Auth
        if (account.admissionNumber) {
          try {
            await setDoc(doc(db, 'admission_map', account.admissionNumber), {
              admissionNumber: account.admissionNumber,
              email: account.email
            }, { merge: true });
          } catch (e) {
            // Ignore if silent
          }
        }
      } else {
        console.warn(`Error seeding account ${account.email}:`, err.message);
      }
    }
  }

  return { success: true, seeded: seededCount };
};
