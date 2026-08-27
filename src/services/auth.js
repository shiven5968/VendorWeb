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
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { db as localDb } from './db';

// Helper to translate Firebase Auth error codes into clean user messages
export const formatAuthError = (error) => {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account is already registered with this email.';
    case 'auth/invalid-email':
      return 'Please enter a valid college email format (e.g. student@abes.ac.in).';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No registered account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/network-request-failed':
      return 'Network connection error. Check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again in a few minutes.';
    default:
      return error.message || 'Authentication failed. Please check your details.';
  }
};

/**
 * Register a new student user:
 * 1. Creates Firebase Auth account
 * 2. Updates display name
 * 3. Creates Firestore document in 'users' collection with role = 'student'
 */
export const signUpStudent = async ({ name, admissionNumber, email, password, gender, hostelBlock }) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanAdmission = admissionNumber ? admissionNumber.trim() : '';

  if (isFirebaseConfigured) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Update Auth Display Name
      await updateProfile(user, { displayName: cleanName });

      // Create Firestore User Document (users/{uid})
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', user.uid), userProfile);
      } catch (firestoreErr) {
        console.warn('Firestore user profile creation notice:', firestoreErr.message);
      }
      
      localDb.registerUser({
        ...userProfile,
        id: user.uid,
        password
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
      password,
      role: 'student',
      gender,
      hostelBlock
    });
    return {
      user: { uid: localUser.id, email: localUser.email, displayName: localUser.name },
      profile: localUser
    };
  }
};

/**
 * Sign in existing user:
 * 1. Signs in via Firebase Auth
 * 2. Fetches user document from Firestore 'users/{uid}'
 * 3. Returns user & profile with role ('student' | 'mess_committee' | 'warden')
 */
export const signInUser = async (emailOrAdmission, password) => {
  const cleanInput = emailOrAdmission.trim().toLowerCase();
  
  // Resolve email if user entered admission number
  let targetEmail = cleanInput;
  if (!cleanInput.includes('@')) {
    const matchedUser = localDb.getUsers().find(u => (u.admissionNumber || '').toLowerCase() === cleanInput);
    if (matchedUser) {
      targetEmail = matchedUser.email;
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
          role: targetEmail.includes('warden') ? 'warden' : targetEmail.includes('committee') ? 'mess_committee' : 'student',
          hostelBlock: 'DNB Block',
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
      throw new Error('Invalid college email/admission number or password.');
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
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  if (isFirebaseConfigured) {
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return true;
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  } else {
    return true;
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
