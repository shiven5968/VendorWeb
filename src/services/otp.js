import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase.js';
import { db as localDb } from './db.js';

/**
 * Validates that an email belongs to the official ABES Engineering College domain (@abes.ac.in)
 */
export const isValidAbesEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  // Valid email regex requiring @abes.ac.in domain
  const abesRegex = /^[a-zA-Z0-9._%+-]+@abes\.ac\.in$/i;
  return abesRegex.test(clean);
};

/**
 * Pre-registration check for Admission Number and College Email uniqueness
 */
export const checkRegistrationEligibility = async (admissionNumber, email) => {
  const cleanAdmission = (admissionNumber || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanAdmission) {
    throw new Error('Admission Number is required.');
  }

  if (!cleanEmail) {
    throw new Error('College Email is required.');
  }

  if (!isValidAbesEmail(cleanEmail)) {
    throw new Error('Registration is restricted to official ABES college emails (@abes.ac.in).');
  }

  // 1. Check Admission Number uniqueness in Firestore
  if (isFirebaseConfigured) {
    try {
      const mapSnap = await getDoc(doc(db, 'admission_map', cleanAdmission));
      if (mapSnap.exists()) {
        throw new Error(`Admission Number "${cleanAdmission}" is already registered. Please sign in instead.`);
      }
    } catch (err) {
      if (err.message && err.message.includes('already registered')) throw err;
      // Continue if unauthenticated rules restrict reading other docs
    }
  }

  const localUserByAdmission = localDb.getUsers().find(
    u => (u.admissionNumber || '').toLowerCase() === cleanAdmission.toLowerCase()
  );
  if (localUserByAdmission) {
    throw new Error(`Admission Number "${cleanAdmission}" is already registered. Please sign in.`);
  }

  // 2. Check Email uniqueness in local cache
  const localUserByEmail = localDb.getUserByEmail(cleanEmail);
  if (localUserByEmail) {
    throw new Error(`An account with college email "${cleanEmail}" is already registered.`);
  }

  return { eligible: true };
};

/**
 * Request a 6-digit verification code to the student's ABES college email.
 * Calls the secure serverless backend endpoint (/api/send-otp).
 *
 * NOTE: We do NOT call checkRegistrationEligibility here.
 * That check would block partial-registration recovery (a student who previously
 * got as far as creating the admission_map entry but failed on Firestore profile
 * would be permanently locked out). Uniqueness is enforced atomically inside
 * signUpStudent instead.
 */
export const sendRegistrationOTP = async ({ email, admissionNumber, name }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanAdmission = (admissionNumber || '').trim();
  const cleanName = (name || 'Student').trim();

  // Basic validation only
  if (!cleanEmail || !isValidAbesEmail(cleanEmail)) {
    throw new Error('Please enter a valid ABES college email (@abes.ac.in).');
  }
  if (!cleanAdmission) {
    throw new Error('Admission Number is required.');
  }

  const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const sendApiUrl = metaEnv.VITE_OTP_API_URL || '/api/send-otp';

  try {
    const res = await fetch(sendApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        admissionNumber: cleanAdmission,
        name: cleanName
      })
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.message || 'Unable to send verification code. Please try again.');
    }

    return {
      success: true,
      sessionId: data.sessionId || data.sessionToken,
      sessionToken: data.sessionToken || data.sessionId,
      email: cleanEmail,
      messageId: data.messageId,
      message: data.message || `We sent a 6-digit verification code to ${cleanEmail}`
    };
  } catch (err) {
    console.error('[MessMates OTP Request Error]:', err.message);
    throw new Error(err.message || 'Unable to send verification code. Please try again.');
  }
};

/**
 * Verify the 6-digit OTP entered by the student on the secure serverless backend
 */
export const verifyRegistrationOTP = async ({ email, otp, sessionToken, sessionId }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();
  const targetId = (sessionId || sessionToken || '').trim();

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }

  const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const verifyApiUrl = metaEnv.VITE_OTP_VERIFY_API_URL || '/api/verify-otp';

  try {
    const res = await fetch(verifyApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        otp: cleanOtp,
        sessionId: targetId,
        sessionToken: targetId
      })
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.message || 'Verification failed. Please check the code.');
    }

    return {
      verified: true,
      email: cleanEmail,
      admissionNumber: data.admissionNumber,
      verificationProofToken: data.verificationProofToken
    };
  } catch (err) {
    throw new Error(err.message || 'Verification failed. Please try again.');
  }
};
