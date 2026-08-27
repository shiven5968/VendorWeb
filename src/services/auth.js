import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase.js';
import { db as localDb } from './db.js';
import { 
  isValidAbesEmail, 
  checkRegistrationEligibility, 
  sendRegistrationOTP, 
  verifyRegistrationOTP 
} from './otp.js';

// Helper to translate Firebase Auth error codes into clean user messages
export const formatAuthError = (error) => {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account is already registered with this college email.';
    case 'auth/invalid-email':
      return 'Please enter a valid college email ending with @abes.ac.in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No registered account found. Please register first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect admission number or password.';
    case 'auth/network-request-failed':
      return 'Network connection error. Check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again in a few minutes.';
    default:
      return error.message || 'Authentication failed. Please check your details.';
  }
};

/**
 * Register a new student user after OTP verification:
 * 1. Creates Firebase Auth account with email and password
 * 2. Updates Firebase display name
 * 3. Creates Firestore document in 'users' collection with role = 'student' and emailVerified = true
 * 4. Indexes admissionNumber in 'admission_map' collection for seamless Admission No. logins
 */
export const signUpStudent = async ({ 
  name, 
  admissionNumber, 
  email, 
  password, 
  gender, 
  hostelBlock,
  isOtpVerified = true 
}) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanAdmission = (admissionNumber || '').trim();

  if (!isOtpVerified) {
    throw new Error('College email OTP verification is required before creating an account.');
  }

  if (!isValidAbesEmail(cleanEmail)) {
    throw new Error('Registration requires an official ABES college email (@abes.ac.in).');
  }

  if (isFirebaseConfigured) {
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // 2. Update Auth Display Name
      await updateProfile(user, { displayName: cleanName });

      // 3. Create Firestore User Document (/users/{uid})
      const userProfile = {
        uid: user.uid,
        name: cleanName,
        admissionNumber: cleanAdmission,
        email: cleanEmail,
        role: 'student',
        gender: gender || 'Male',
        hostelBlock: hostelBlock || 'DNB Block',
        dietPreference: 'High Protein / Eggetarian',
        proteinTarget: 120,
        rewardPoints: 0,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', user.uid), userProfile);
      } catch (firestoreErr) {
        console.warn('Firestore user profile creation notice:', firestoreErr.message);
      }

      // 4. Index Admission Number mapping for unauthenticated admission number login
      if (cleanAdmission) {
        try {
          await setDoc(doc(db, 'admission_map', cleanAdmission), {
            admissionNumber: cleanAdmission,
            email: cleanEmail,
            uid: user.uid,
            createdAt: new Date().toISOString()
          });
        } catch (mapErr) {
          console.warn('Admission map index notice:', mapErr.message);
        }
      }
      
      localDb.registerUser({
        ...userProfile,
        id: user.uid
      });

      return { user, profile: userProfile };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  } else {
    // Local-First Fallback
    const localUser = localDb.registerUser({
      name: cleanName,
      admissionNumber: cleanAdmission,
      email: cleanEmail,
      role: 'student',
      gender,
      hostelBlock,
      emailVerified: true
    });
    return {
      user: { uid: localUser.id, email: localUser.email, displayName: localUser.name },
      profile: localUser
    };
  }
};

/**
 * Sign in existing user:
 * - Students: Log in using Admission Number + Password (mapped via admission_map / local cache)
 * - Staff: Log in using Official College Email + Password
 */
export const signInUser = async (emailOrAdmission, password) => {
  const cleanInput = (emailOrAdmission || '').trim();
  if (!cleanInput) {
    throw new Error('Please enter your Admission Number or email.');
  }

  let targetEmail = cleanInput.toLowerCase();

  // If user entered Admission Number (no '@'), resolve email
  if (!cleanInput.includes('@')) {
    let resolved = false;

    // 1. Try admission_map index in Firestore
    if (isFirebaseConfigured) {
      try {
        const mapRef = doc(db, 'admission_map', cleanInput);
        const mapSnap = await getDoc(mapRef);
        if (mapSnap.exists() && mapSnap.data().email) {
          targetEmail = mapSnap.data().email.toLowerCase();
          resolved = true;
        }
      } catch (e) {
        // Fallback to local DB and pilot accounts
      }
    }

    // 2. Check local registered user cache
    if (!resolved) {
      const localUser = localDb.getUsers().find(
        u => (u.admissionNumber || '').toLowerCase() === cleanInput.toLowerCase()
      );
      if (localUser && localUser.email) {
        targetEmail = localUser.email.toLowerCase();
        resolved = true;
      }
    }

    // 3. Check pilot seed accounts (e.g. Parth Sharma 2100320100001)
    if (!resolved) {
      if (cleanInput === '2100320100001') {
        targetEmail = 'parth.sharma@abes.ac.in';
        resolved = true;
      } else if (cleanInput.toUpperCase() === 'MC-2026-01') {
        targetEmail = 'committee@abes.ac.in';
        resolved = true;
      } else if (cleanInput.toUpperCase() === 'CW-2026-01') {
        targetEmail = 'warden@abes.ac.in';
        resolved = true;
      }
    }

    if (!resolved) {
      throw new Error(`No registered student account found for Admission Number "${cleanInput}". Please register first.`);
    }
  }

  if (isFirebaseConfigured) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      const user = userCredential.user;

      // Fetch Firestore Profile
      let profile = await getUserProfile(user.uid);

      if (!profile) {
        profile = {
          uid: user.uid,
          name: user.displayName || targetEmail.split('@')[0],
          email: targetEmail,
          admissionNumber: !cleanInput.includes('@') ? cleanInput : '',
          role: targetEmail.includes('warden') ? 'warden' : targetEmail.includes('committee') ? 'mess_committee' : 'student',
          hostelBlock: 'DNB Block',
          emailVerified: true,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', user.uid), profile);
        } catch (e) {
          console.warn('Firestore profile write notice:', e.message);
        }
      }

      return { user, profile };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  } else {
    // Local-First Fallback
    let localUser = localDb.getUserByEmail(targetEmail);
    if (!localUser && !targetEmail.includes('@')) {
      localUser = localDb.getUsers().find(u => (u.admissionNumber || '').toLowerCase() === targetEmail.toLowerCase());
    }

    if (!localUser || localUser.password !== password) {
      throw new Error('Invalid admission number or password.');
    }
    return {
      user: { uid: localUser.id, email: localUser.email, displayName: localUser.name },
      profile: localUser
    };
  }
};

/**
 * Sign out user from Firebase Auth
 */
export const signOutUser = async () => {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  }
  localStorage.removeItem('messmate_session_uid');
};

/**
 * Send password reset email for an Admission Number or College Email
 */
export const sendPasswordResetForIdentifier = async (emailOrAdmission) => {
  const cleanInput = (emailOrAdmission || '').trim();
  if (!cleanInput) {
    throw new Error('Please enter your Admission Number or College Email.');
  }

  let targetEmail = cleanInput.toLowerCase();

  // If admission number entered, resolve to registered email
  if (!cleanInput.includes('@')) {
    let resolved = false;

    if (isFirebaseConfigured) {
      try {
        const mapSnap = await getDoc(doc(db, 'admission_map', cleanInput));
        if (mapSnap.exists() && mapSnap.data().email) {
          targetEmail = mapSnap.data().email.toLowerCase();
          resolved = true;
        }
      } catch (err) {
        // Fallback to local DB and pilot accounts
      }
    }

    if (!resolved) {
      const localUser = localDb.getUsers().find(
        u => (u.admissionNumber || '').toLowerCase() === cleanInput.toLowerCase()
      );
      if (localUser && localUser.email) {
        targetEmail = localUser.email.toLowerCase();
        resolved = true;
      }
    }

    if (!resolved) {
      if (cleanInput === '2100320100001') {
        targetEmail = 'parth.sharma@abes.ac.in';
        resolved = true;
      } else if (cleanInput.toUpperCase() === 'MC-2026-01') {
        targetEmail = 'committee@abes.ac.in';
        resolved = true;
      } else if (cleanInput.toUpperCase() === 'CW-2026-01') {
        targetEmail = 'warden@abes.ac.in';
        resolved = true;
      }
    }

    if (!resolved) {
      throw new Error(`No account found for Admission Number "${cleanInput}".`);
    }
  }

  if (isFirebaseConfigured) {
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      return { success: true, email: targetEmail };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  } else {
    return { success: true, email: targetEmail };
  }
};

/**
 * Fetch Firestore user profile by UID
 */
export const getUserProfile = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      }
      return null;
    } catch (e) {
      console.warn('Could not fetch Firestore profile:', e);
      return null;
    }
  }
  return localDb.getUserById(uid);
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfileDoc = async (uid, updates) => {
  const cleanUpdates = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, cleanUpdates);
    } catch (e) {
      console.warn('Firestore update warning:', e);
    }
  }

  return localDb.updateUserProfile(uid, cleanUpdates);
};

export { 
  isValidAbesEmail, 
  checkRegistrationEligibility, 
  sendRegistrationOTP, 
  verifyRegistrationOTP 
};
