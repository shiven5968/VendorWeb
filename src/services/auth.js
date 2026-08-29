import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase.js';
import { db as localDb } from './db.js';
import {
  isValidAbesEmail,
  sendRegistrationOTP,
  verifyRegistrationOTP
} from './otp.js';

// ─────────────────────────────────────────────
// CANONICAL NORMALIZATION
// ─────────────────────────────────────────────

/**
 * Canonical admission number: trim whitespace, uppercase.
 * Admission numbers at ABES are purely numeric strings.
 * "2400320106436", " 2400320106436 " → "2400320106436"
 */
export const normalizeAdmissionNumber = (raw) =>
  (raw || '').trim().toUpperCase();

/**
 * Canonical email: trim + lowercase.
 */
export const normalizeEmail = (raw) =>
  (raw || '').trim().toLowerCase();

// ─────────────────────────────────────────────
// ERROR TRANSLATION
// ─────────────────────────────────────────────

/**
 * Translates Firebase Auth error codes into clean, user-facing messages.
 */
export const formatAuthError = (error) => {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'email-already-in-use';   // sentinel — callers handle this specifically
    case 'auth/invalid-email':
      return 'Please enter a valid college email ending with @abes.ac.in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No registered account found for this Admission Number. Please register first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please verify your password and try again.';
    case 'auth/user-disabled':
      return 'This student account has been disabled. Please contact the Chief Warden.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes before trying again.';
    default:
      return error.message || 'Authentication failed. Please check your details.';
  }
};

// ─────────────────────────────────────────────
// INTEGRITY CHECK HELPERS
// ─────────────────────────────────────────────

/**
 * Checks whether a complete, consistent account triple exists:
 *   - users/{uid} document
 *   - admission_map/{admissionNumber} document pointing to same uid+email
 *
 * Returns an object describing the health of the account.
 */
export const checkAccountIntegrity = async (uid, email, admissionNumber) => {
  const result = {
    userDocExists: false,
    admissionMapExists: false,
    mapUidMatch: false,
    mapEmailMatch: false,
    isHealthy: false,
    userProfile: null,
    mapData: null
  };

  if (!isFirebaseConfigured) return result;

  const normalAdmission = normalizeAdmissionNumber(admissionNumber);
  const normalEmail = normalizeEmail(email);

  try {
    const [userSnap, mapSnap] = await Promise.all([
      getDoc(doc(db, 'users', uid)),
      normalAdmission ? getDoc(doc(db, 'admission_map', normalAdmission)) : Promise.resolve({ exists: () => false })
    ]);

    result.userDocExists = userSnap.exists();
    if (result.userDocExists) result.userProfile = userSnap.data();

    result.admissionMapExists = mapSnap.exists && mapSnap.exists();
    if (result.admissionMapExists) {
      result.mapData = mapSnap.data();
      result.mapUidMatch = result.mapData.uid === uid;
      result.mapEmailMatch = normalizeEmail(result.mapData.email) === normalEmail;
    }

    result.isHealthy =
      result.userDocExists &&
      result.admissionMapExists &&
      result.mapUidMatch &&
      result.mapEmailMatch;
  } catch (e) {
    console.warn('[checkAccountIntegrity] error:', e.message);
  }

  return result;
};

// ─────────────────────────────────────────────
// REGISTRATION — ATOMIC + RECOVERABLE
// ─────────────────────────────────────────────

/**
 * Register a new student after OTP verification.
 *
 * State machine:
 *   STEP 1  Validate inputs
 *   STEP 2  Check if same email already has a Firebase Auth account (recovery path)
 *   STEP 3  Create Firebase Auth user  (or recover existing partial account)
 *   STEP 4  Write users/{uid}          (idempotent merge)
 *   STEP 5  Write admission_map/{n}    (idempotent merge)
 *   STEP 6  Verify all records exist
 *   STEP 7  Return success
 *
 * If any Firestore step fails AFTER the Auth user is created, we throw with a
 * specific message and the caller should retry — subsequent retries detect the
 * existing Auth user and repair missing Firestore documents rather than trying
 * to create a duplicate account.
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
  const cleanEmail = normalizeEmail(email);
  const cleanName = (name || '').trim();
  const cleanAdmission = normalizeAdmissionNumber(admissionNumber);

  // ── STEP 1: Validate ──────────────────────────────────────────────────
  if (!isOtpVerified) {
    throw new Error('College email OTP verification is required before creating an account.');
  }
  if (!isValidAbesEmail(cleanEmail)) {
    throw new Error('Registration requires an official ABES college email (@abes.ac.in).');
  }
  if (!cleanName) throw new Error('Full name is required.');
  if (!cleanAdmission) throw new Error('Admission Number is required.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

  if (!isFirebaseConfigured) {
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

  // ── STEP 2: Check if Firebase Auth account already exists for this email ──
  let existingAuthUser = null;
  try {
    const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
    if (methods && methods.length > 0) {
      // Account exists in Firebase Auth — this is a recovery scenario
      existingAuthUser = true;
    }
  } catch (e) {
    // fetchSignInMethodsForEmail can throw on network issues — non-fatal
    console.warn('[signUpStudent] fetchSignInMethods error:', e.message);
  }

  let authUser = null;

  if (existingAuthUser) {
    // ── RECOVERY PATH: Auth account exists but registration may be incomplete ──
    // We cannot sign in on behalf of the user with their password here to get
    // the UID (we don't know if it's the same person), BUT we can attempt
    // signInWithEmailAndPassword with the password they supplied — if it
    // matches, this is clearly the same person continuing a failed registration.
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      authUser = cred.user;
    } catch (signInErr) {
      // Wrong password for existing account → different person or wrong input
      if (
        signInErr.code === 'auth/wrong-password' ||
        signInErr.code === 'auth/invalid-credential'
      ) {
        throw new Error(
          'An account already exists for this email. If this is your account, please log in ' +
          'using your Admission Number and password. If you believe this is an error, please ' +
          'contact support.'
        );
      }
      throw new Error(
        'An account already exists for this email but could not be verified. ' +
        'Please try logging in instead.'
      );
    }

    // Signed in successfully — check integrity
    const integrity = await checkAccountIntegrity(authUser.uid, cleanEmail, cleanAdmission);

    if (integrity.isHealthy) {
      // Fully valid account — tell user to log in, do not re-register
      await signOut(auth);
      throw new Error(
        'An account already exists for this email and Admission Number. ' +
        'Please log in using your Admission Number and password.'
      );
    }

    if (integrity.admissionMapExists && !integrity.mapUidMatch) {
      // The admission number is already claimed by a DIFFERENT uid — integrity violation
      await signOut(auth);
      throw new Error(
        'This Admission Number is already linked to a different account. ' +
        'Please contact support to resolve this.'
      );
    }

    // Partial registration — repair missing Firestore records below
    console.info('[signUpStudent] Recovering partial registration for', cleanEmail);

  } else {
    // ── NORMAL PATH: Create new Firebase Auth user ─────────────────────
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      authUser = userCredential.user;
    } catch (err) {
      const msg = formatAuthError(err);
      if (msg === 'email-already-in-use') {
        // Race condition — another tab/request created the account between our
        // fetchSignInMethodsForEmail check and createUser. Retry via recovery path.
        throw new Error(
          'An account for this email was just created. Please refresh and try logging in ' +
          'with your Admission Number and password.'
        );
      }
      throw new Error(msg);
    }
  }

  // ── STEP 3: Update Firebase display name ─────────────────────────────
  try {
    await updateProfile(authUser, { displayName: cleanName });
  } catch (e) {
    console.warn('[signUpStudent] updateProfile notice:', e.message);
  }

  // ── STEP 4: Create/repair users/{uid} (idempotent merge) ──────────────
  const userProfile = {
    uid: authUser.uid,
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

  let userDocWritten = false;
  try {
    await setDoc(doc(db, 'users', authUser.uid), userProfile, { merge: true });
    userDocWritten = true;
  } catch (firestoreErr) {
    console.error('[signUpStudent] Firestore users write FAILED:', firestoreErr.message);
    // We do NOT swallow this silently — throw with specific message
    throw new Error(
      'Your account was created but your profile could not be saved. ' +
      'Please try again — the system will automatically recover your registration.'
    );
  }

  // ── STEP 5: Create/repair admission_map/{admissionNumber} (idempotent merge) ──
  let mapWritten = false;
  if (cleanAdmission) {
    try {
      await setDoc(doc(db, 'admission_map', cleanAdmission), {
        admissionNumber: cleanAdmission,
        email: cleanEmail,
        uid: authUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      mapWritten = true;
    } catch (mapErr) {
      console.error('[signUpStudent] admission_map write FAILED:', mapErr.message);
      throw new Error(
        'Your profile was saved but the login mapping could not be created. ' +
        'Please try again — the system will automatically recover this.'
      );
    }
  }

  // ── STEP 6: Verify integrity ──────────────────────────────────────────
  if (!userDocWritten || (cleanAdmission && !mapWritten)) {
    throw new Error(
      'Account creation incomplete. Please try logging in — the system will attempt to repair your account.'
    );
  }

  // Also write to local cache for offline fallback
  try {
    localDb.registerUser({ ...userProfile, id: authUser.uid });
  } catch (e) { /* non-critical */ }

  return { user: authUser, profile: userProfile };
};

// ─────────────────────────────────────────────
// LOGIN — RELIABLE + SPECIFIC ERRORS
// ─────────────────────────────────────────────

/**
 * Sign in with Admission Number + Password (students)
 * or College Email + Password (staff).
 *
 * Uses a SINGLE canonical admission_map key lookup (no case-variant guessing).
 * Implements self-healing for missing admission_map entries.
 */
export const signInUser = async (emailOrAdmission, password) => {
  const cleanInput = (emailOrAdmission || '').trim();
  if (!cleanInput) {
    throw new Error('Please enter your Admission Number or email.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const isEmailLogin = cleanInput.includes('@');
  let targetEmail = isEmailLogin ? normalizeEmail(cleanInput) : null;

  // ── STEP 1: Resolve Admission Number → Email ──────────────────────────
  if (!isEmailLogin) {
    const canonicalAdmission = normalizeAdmissionNumber(cleanInput);

    if (isFirebaseConfigured) {
      let mapData = null;

      // Single canonical lookup (no multi-case guessing)
      try {
        const mapSnap = await getDoc(doc(db, 'admission_map', canonicalAdmission));
        if (mapSnap.exists() && mapSnap.data().email) {
          mapData = mapSnap.data();
        }
      } catch (e) {
        if (e.code === 'unavailable' || e.code === 'resource-exhausted') {
          throw new Error(
            'Network connection failed. Please check your internet and try again.'
          );
        }
        console.warn('[signInUser] admission_map lookup error:', e.message);
      }

      if (mapData) {
        targetEmail = normalizeEmail(mapData.email);
      } else {
        // Check local cache as fallback (for offline scenarios)
        const localUser = localDb.getUsers().find(
          u => normalizeAdmissionNumber(u.admissionNumber) === canonicalAdmission
        );
        if (localUser && localUser.email) {
          targetEmail = normalizeEmail(localUser.email);
        }
      }
    } else {
      // Local fallback
      const localUser = localDb.getUsers().find(
        u => normalizeAdmissionNumber(u.admissionNumber) === normalizeAdmissionNumber(cleanInput)
      );
      if (localUser && localUser.email) {
        targetEmail = normalizeEmail(localUser.email);
      }
    }

    if (!targetEmail) {
      throw new Error(
        `No registered student account found for Admission Number "${cleanInput}". ` +
        'Please verify your admission number or create an account.'
      );
    }
  }

  // ── STEP 2: Firebase Auth sign-in ─────────────────────────────────────
  if (!isFirebaseConfigured) {
    // Local fallback
    let localUser = localDb.getUserByEmail(targetEmail);
    if (!localUser || localUser.password !== password) {
      throw new Error('Incorrect Admission Number or password. Please try again.');
    }
    return {
      user: { uid: localUser.id, email: localUser.email, displayName: localUser.name },
      profile: localUser
    };
  }

  let firebaseUser;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
    firebaseUser = userCredential.user;
  } catch (err) {
    const code = err.code || '';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }
    if (code === 'auth/user-not-found') {
      throw new Error(
        'No account found for this Admission Number. Please register first.'
      );
    }
    if (code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Please contact the Chief Warden.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please wait a few minutes before trying again.');
    }
    if (code === 'auth/network-request-failed') {
      throw new Error('Network connection failed. Please check your internet and try again.');
    }
    throw new Error(err.message || 'Login failed. Please check your credentials.');
  }

  // ── STEP 3: Load Firestore profile ────────────────────────────────────
  let profile = null;
  try {
    const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userSnap.exists()) {
      profile = userSnap.data();
    }
  } catch (e) {
    if (e.code === 'unavailable' || e.code === 'resource-exhausted') {
      // Temporary Firestore unavailability — do NOT treat as logged-out
      throw new Error(
        'Your account exists but profile data could not be loaded due to a network issue. ' +
        'Please try again in a moment.'
      );
    }
    console.warn('[signInUser] profile fetch error:', e.message);
  }

  // ── STEP 4: Self-heal missing profile (staff accounts or partial registrations) ──
  if (!profile) {
    const role = targetEmail.includes('warden')
      ? 'warden'
      : targetEmail.includes('committee')
      ? 'mess_committee'
      : 'student';

    profile = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || targetEmail.split('@')[0],
      email: targetEmail,
      admissionNumber: !isEmailLogin ? normalizeAdmissionNumber(cleanInput) : '',
      role,
      hostelBlock: 'DNB Block',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
    } catch (e) {
      console.warn('[signInUser] profile self-heal write notice:', e.message);
    }
  }

  // ── STEP 5: Self-heal missing admission_map (safe — only for authenticated owner) ──
  if (!isEmailLogin) {
    const canonicalAdmission = normalizeAdmissionNumber(cleanInput);
    const profileAdmission = normalizeAdmissionNumber(profile.admissionNumber || cleanInput);

    // Only self-heal if profile confirms same admission number
    if (profileAdmission === canonicalAdmission) {
      try {
        const existingMap = await getDoc(doc(db, 'admission_map', canonicalAdmission));
        if (!existingMap.exists()) {
          // Map is missing — recreate safely (this user is authenticated, owns this UID)
          await setDoc(doc(db, 'admission_map', canonicalAdmission), {
            admissionNumber: canonicalAdmission,
            email: targetEmail,
            uid: firebaseUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          console.info('[signInUser] admission_map self-healed for', canonicalAdmission);
        } else {
          const mapData = existingMap.data();
          // Verify the map points to the right uid — if not, flag integrity issue
          if (mapData.uid !== firebaseUser.uid) {
            console.error(
              '[signInUser] INTEGRITY VIOLATION: admission_map uid mismatch for',
              canonicalAdmission
            );
            throw new Error(
              'Your account information needs verification. Please contact support.'
            );
          }
        }
      } catch (e) {
        if (e.message.includes('contact support')) throw e;
        console.warn('[signInUser] admission_map self-heal notice:', e.message);
      }
    }
  }

  return { user: firebaseUser, profile };
};

// ─────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────

export const signOutUser = async () => {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[signOutUser] error:', e);
    }
  }
  // Clear local session cache on sign-out
  try { localStorage.removeItem('messmate_session_uid'); } catch (e) {}
};

// ─────────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────────

/**
 * Send password reset email for an Admission Number or College Email.
 * Resolves admission number → canonical email before calling Firebase.
 */
export const sendPasswordResetForIdentifier = async (emailOrAdmission) => {
  const cleanInput = (emailOrAdmission || '').trim();
  if (!cleanInput) {
    throw new Error('Please enter your Admission Number or College Email.');
  }

  let targetEmail = cleanInput.includes('@') ? normalizeEmail(cleanInput) : null;

  if (!targetEmail) {
    const canonicalAdmission = normalizeAdmissionNumber(cleanInput);

    if (isFirebaseConfigured) {
      try {
        const mapSnap = await getDoc(doc(db, 'admission_map', canonicalAdmission));
        if (mapSnap.exists() && mapSnap.data().email) {
          targetEmail = normalizeEmail(mapSnap.data().email);
        }
      } catch (e) {
        console.warn('[sendPasswordReset] admission_map lookup error:', e.message);
      }
    }

    if (!targetEmail) {
      const localUser = localDb.getUsers().find(
        u => normalizeAdmissionNumber(u.admissionNumber) === canonicalAdmission
      );
      if (localUser && localUser.email) {
        targetEmail = normalizeEmail(localUser.email);
      }
    }

    if (!targetEmail) {
      throw new Error(
        `No registered account found for Admission Number "${cleanInput}".`
      );
    }
  }

  if (!isValidAbesEmail(targetEmail)) {
    throw new Error('Password reset requires a verified @abes.ac.in college email.');
  }

  if (isFirebaseConfigured) {
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      return { success: true, email: targetEmail };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  }

  return { success: true, email: targetEmail };
};

// ─────────────────────────────────────────────
// PROFILE READ / WRITE
// ─────────────────────────────────────────────

export const getUserProfile = async (uid) => {
  if (!uid) return null;

  if (isFirebaseConfigured) {
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) return userSnap.data();
    } catch (e) {
      console.warn('[getUserProfile] Firestore notice:', e.message);
    }
  }

  return localDb.getUserById(uid);
};

export const updateUserProfileDoc = async (uid, updates) => {
  if (!uid) return null;

  // Prevent role escalation from client
  const { role: _strip, uid: _stripUid, ...safeUpdates } = updates;
  const sanitized = {
    ...safeUpdates,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'users', uid), sanitized);
    } catch (e) {
      console.warn('[updateUserProfileDoc] Firestore notice:', e.message);
    }
  }

  return localDb.updateUserProfile(uid, sanitized);
};

// ─────────────────────────────────────────────
// ADMIN DIAGNOSTICS (Developer/Warden only)
// ─────────────────────────────────────────────

/**
 * Safe diagnostic utility: checks the consistency of a student account.
 * Returns HEALTHY / INCOMPLETE / INCONSISTENT status.
 * Never modifies data without explicit repair=true flag.
 * Never bulk-deletes.
 */
export const diagnoseStudentAccount = async ({ admissionNumber, email }) => {
  if (!isFirebaseConfigured) {
    return { status: 'UNKNOWN', reason: 'Firebase not configured.' };
  }

  const canonicalAdmission = admissionNumber ? normalizeAdmissionNumber(admissionNumber) : null;
  const canonicalEmail = email ? normalizeEmail(email) : null;

  const report = {
    input: { admissionNumber: canonicalAdmission, email: canonicalEmail },
    authUserExists: null,
    authUid: null,
    userDocExists: null,
    admissionMapExists: null,
    mapUidMatch: null,
    mapEmailMatch: null,
    profileMatchesMap: null,
    status: 'UNKNOWN',
    issues: []
  };

  // Resolve via admission_map first
  let resolvedUid = null;
  let resolvedEmail = canonicalEmail;

  if (canonicalAdmission) {
    try {
      const mapSnap = await getDoc(doc(db, 'admission_map', canonicalAdmission));
      if (mapSnap.exists()) {
        report.admissionMapExists = true;
        const mapData = mapSnap.data();
        resolvedUid = mapData.uid;
        resolvedEmail = normalizeEmail(mapData.email);
        report.mapEmailMatch = resolvedEmail === canonicalEmail || !canonicalEmail;
      } else {
        report.admissionMapExists = false;
        report.issues.push('admission_map entry missing');
      }
    } catch (e) {
      report.issues.push('admission_map read error: ' + e.message);
    }
  }

  if (resolvedUid) {
    try {
      const userSnap = await getDoc(doc(db, 'users', resolvedUid));
      report.userDocExists = userSnap.exists();
      if (report.userDocExists) {
        const userData = userSnap.data();
        report.authUid = resolvedUid;
        report.profileMatchesMap =
          normalizeAdmissionNumber(userData.admissionNumber) === canonicalAdmission &&
          normalizeEmail(userData.email) === resolvedEmail;
        if (!report.profileMatchesMap) {
          report.issues.push('Profile admission/email does not match admission_map');
        }
      } else {
        report.issues.push('users/{uid} document missing');
      }
    } catch (e) {
      report.issues.push('users/{uid} read error: ' + e.message);
    }
  }

  // Determine status
  if (report.issues.length === 0 && report.admissionMapExists && report.userDocExists) {
    report.status = 'HEALTHY';
  } else if (report.admissionMapExists || report.userDocExists) {
    report.status = 'INCOMPLETE';
  } else {
    report.status = 'INCONSISTENT';
  }

  return report;
};

// Re-export OTP helpers so callers don't need to import from two places
export {
  isValidAbesEmail,
  sendRegistrationOTP,
  verifyRegistrationOTP
};
