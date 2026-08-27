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

// In-memory / session storage active OTP sessions (keyed by email)
const otpSessions = new Map();

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

  // 1. Check Admission Number uniqueness
  if (isFirebaseConfigured) {
    try {
      const mapSnap = await getDoc(doc(db, 'admission_map', cleanAdmission));
      if (mapSnap.exists()) {
        throw new Error(`Admission Number "${cleanAdmission}" is already registered. Please sign in instead.`);
      }
    } catch (err) {
      if (err.message.includes('already registered')) throw err;
      console.warn('Admission map check notice:', err.message);
    }
  }

  const localUserByAdmission = localDb.getUsers().find(
    u => (u.admissionNumber || '').toLowerCase() === cleanAdmission.toLowerCase()
  );
  if (localUserByAdmission) {
    throw new Error(`Admission Number "${cleanAdmission}" is already registered. Please sign in.`);
  }

  // 2. Check Email uniqueness
  const localUserByEmail = localDb.getUserByEmail(cleanEmail);
  if (localUserByEmail) {
    throw new Error(`An account with college email "${cleanEmail}" is already registered.`);
  }

  return { eligible: true };
};

/**
 * Request a 6-digit verification code to the student's ABES college email
 */
export const sendRegistrationOTP = async ({ email, admissionNumber, name }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanAdmission = (admissionNumber || '').trim();

  // Validate before sending
  await checkRegistrationEligibility(cleanAdmission, cleanEmail);

  // Generate secure 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionToken = 'otp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpSessions.set(cleanEmail, {
    code,
    sessionToken,
    expiresAt,
    attempts: 0,
    admissionNumber: cleanAdmission,
    name: name?.trim()
  });

  const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const otpApiUrl = metaEnv.VITE_OTP_API_URL;
  if (otpApiUrl) {
    try {
      const res = await fetch(otpApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code,
          name: name?.trim(),
          admissionNumber: cleanAdmission
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to dispatch email verification code.');
      }
    } catch (apiErr) {
      console.error('OTP Provider dispatch error:', apiErr);
      throw new Error(`Could not deliver OTP to ${cleanEmail}: ${apiErr.message}`);
    }
  } else {
    // Development / Pilot Architecture Logger
    console.info(
      `%c[MessMates OTP Service]%c Code sent to ${cleanEmail}: %c${code}%c (Valid for 10 mins)`,
      'color: #10b981; font-weight: bold;',
      'color: inherit;',
      'color: #3b82f6; font-weight: 900; font-size: 14px;',
      'color: inherit;'
    );
  }

  return {
    success: true,
    sessionToken,
    email: cleanEmail,
    message: `Verification code sent to ${cleanEmail}`
  };
};

/**
 * Verify the 6-digit OTP entered by the student
 */
export const verifyRegistrationOTP = async ({ email, otp, sessionToken }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }

  const session = otpSessions.get(cleanEmail);
  if (!session) {
    throw new Error('No active verification session found. Please request a new code.');
  }

  if (Date.now() > session.expiresAt) {
    otpSessions.delete(cleanEmail);
    throw new Error('Verification code has expired (10 minutes limit). Please request a new code.');
  }

  if (session.sessionToken !== sessionToken) {
    throw new Error('Session mismatch. Please request a fresh verification code.');
  }

  session.attempts += 1;
  if (session.attempts > 5) {
    otpSessions.delete(cleanEmail);
    throw new Error('Too many invalid attempts. Please request a new verification code.');
  }

  if (session.code !== cleanOtp) {
    const remaining = 5 - session.attempts;
    throw new Error(`Invalid verification code. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
  }

  // OTP verified successfully
  otpSessions.delete(cleanEmail);

  return {
    verified: true,
    email: cleanEmail,
    admissionNumber: session.admissionNumber
  };
};
