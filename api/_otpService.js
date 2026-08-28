import crypto from 'crypto';
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// 10 minutes validity
export const OTP_EXPIRY_MS = 10 * 60 * 1000;
// 30 seconds resend cooldown
export const RESEND_COOLDOWN_MS = 30 * 1000;
// Maximum 5 verification attempts
export const MAX_ATTEMPTS = 5;

// Secret salt for HMAC hashing OTP codes and signing session tokens (Plaintext OTP is NEVER stored)
const OTP_SALT = process.env.OTP_SECRET_SALT || 'messmates_abes_ec_otp_salt_sec_2026';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'messmates-f69a3';

let adminDb = null;

/**
 * Privileged Firebase Admin SDK Firestore instance
 * Bypasses client-side security rules; accessible ONLY on serverless backend
 */
function getFirebaseAdminDb() {
  if (adminDb) return adminDb;

  const hasCredentials = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  if (!hasCredentials) {
    return null;
  }

  const existingApps = getAdminApps();
  let adminApp = existingApps.length > 0 ? existingApps[0] : null;

  if (!adminApp) {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (typeof serviceAccount === 'string') {
          serviceAccount = JSON.parse(serviceAccount);
        }
        adminApp = initAdminApp({
          credential: cert(serviceAccount),
          projectId: PROJECT_ID
        });
      } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        adminApp = initAdminApp({
          credential: cert({
            projectId: PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          }),
          projectId: PROJECT_ID
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        adminApp = initAdminApp({
          projectId: PROJECT_ID
        });
      }
    } catch (initErr) {
      console.warn('[Firebase Admin Init Notice]:', initErr.message);
      return null;
    }
  }

  if (adminApp) {
    try {
      adminDb = getAdminFirestore(adminApp);
    } catch (e) {
      console.warn('[Firebase Admin Firestore Notice]:', e.message);
      adminDb = null;
    }
  }
  return adminDb;
}

/**
 * Validates that an email belongs to the official ABES college domain (@abes.ac.in)
 */
export function isValidAbesEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  const abesRegex = /^[a-zA-Z0-9._%+-]+@abes\.ac\.in$/i;
  return abesRegex.test(clean);
}

/**
 * Generates a secure HMAC SHA-256 hash of the OTP + email
 */
export function hashOtp(otp, email) {
  return crypto
    .createHmac('sha256', OTP_SALT)
    .update(`${email.trim().toLowerCase()}:${otp.trim()}`)
    .digest('hex');
}

/**
 * Generates a tamper-proof cryptographically signed session token
 */
export function signSessionToken(payload) {
  const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', OTP_SALT).update(dataStr).digest('base64url');
  return `${dataStr}.${sig}`;
}

/**
 * Decodes and verifies a signed session token
 */
export function verifySignedSessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [dataStr, sig] = token.split('.');
  if (!dataStr || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', OTP_SALT).update(dataStr).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString('utf-8'));
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Generates a secure 6-digit numeric OTP
 */
export function generateSecureOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Dispatch 6-digit OTP via Resend API and manage durable session in Firestore via Firebase Admin SDK
 */
export async function sendOtpEmail({ email, admissionNumber, name }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanAdmission = (admissionNumber || '').trim();
  const cleanName = (name || 'Student').trim();

  if (!cleanEmail || !isValidAbesEmail(cleanEmail)) {
    throw new Error('Registration is restricted to official ABES college emails (@abes.ac.in).');
  }

  if (!cleanAdmission) {
    throw new Error('Admission Number is required.');
  }

  const now = Date.now();

  // 1. Check existing session in Cloud Firestore for 30s cooldown via Firebase Admin SDK
  const adminFirestore = getFirebaseAdminDb();
  if (adminFirestore) {
    try {
      const existingDoc = await adminFirestore.collection('otp_sessions').doc(cleanEmail).get();
      if (existingDoc.exists) {
        const data = existingDoc.data();
        if (data.lastSentAt && (now - data.lastSentAt) < RESEND_COOLDOWN_MS) {
          const remainingSec = Math.ceil((RESEND_COOLDOWN_MS - (now - data.lastSentAt)) / 1000);
          throw new Error(`Please wait ${remainingSec} seconds before requesting a new verification code.`);
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('Please wait')) {
        throw err;
      }
    }
  }

  // 2. Generate cryptographically strong 6-digit OTP and HMAC hash
  const otp = generateSecureOTP();
  const hashedOtp = hashOtp(otp, cleanEmail);
  const expiresAt = now + OTP_EXPIRY_MS;

  // Create tamper-proof signed session token containing challenge parameters
  const sessionPayload = {
    email: cleanEmail,
    admissionNumber: cleanAdmission,
    name: cleanName,
    hashedOtp,
    createdAt: now,
    expiresAt,
    lastSentAt: now,
    nonce: crypto.randomBytes(8).toString('hex')
  };
  const signedSessionToken = signSessionToken(sessionPayload);

  // 3. Send email via Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'MessMates <verify@messmates.jo3.org>';

  let resendMessageId = null;

  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MessMates Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #059669; padding: 28px 24px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">MessMates</h1>
                      <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">Know Your Meal Before You Eat It • ABES EC</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Hello ${cleanName},</p>
                      <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
                        Thank you for registering on <strong>MessMates</strong>. Please use the following 6-digit verification code to verify your college email identity and activate your student account:
                      </p>

                      <!-- Code Box -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                        <tr>
                          <td align="center" style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 14px; padding: 20px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #166534; display: block; margin-bottom: 8px;">Your Verification Code</span>
                            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #065f46; font-family: Consolas, 'Courier New', monospace; display: block;">${otp}</span>
                            <span style="font-size: 11px; font-weight: 600; color: #15803d; display: block; margin-top: 8px;">Valid for 10 minutes.</span>
                          </td>
                        </tr>
                      </table>

                      <!-- Details -->
                      <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; border: 1px solid #edf2f7;">
                        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;"><strong>Admission No:</strong> ${cleanAdmission}</p>
                        <p style="margin: 0; font-size: 12px; color: #64748b;"><strong>Email:</strong> ${cleanEmail}</p>
                      </div>

                      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
                        If you did not request this verification code, please disregard this email. Do not share this code with anyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
                      <p style="color: #94a3b8; font-size: 11px; margin: 0;">© 2026 MessMates • ABES Engineering College, Ghaziabad</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanEmail],
          subject: `MessMates Verification Code: ${otp}`,
          html: emailHtml
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Resend API returned error.');
      }
      resendMessageId = resData.id;
    } catch (err) {
      console.error('[Resend Error]:', err);
      throw new Error(`Unable to send verification code: ${err.message}`);
    }
  } else {
    throw new Error('Unable to send verification code: RESEND_API_KEY is not configured on the server.');
  }

  // 4. Save PRIVILEGED OTP Session via Firebase Admin SDK (/otp_sessions/{cleanEmail})
  // Direct client access is DENIED in security rules. Accessible ONLY via server.
  if (adminFirestore) {
    try {
      await adminFirestore.collection('otp_sessions').doc(cleanEmail).set({
        sessionId: signedSessionToken,
        email: cleanEmail,
        admissionNumber: cleanAdmission,
        name: cleanName,
        hashedOtp,
        createdAt: now,
        expiresAt,
        lastSentAt: now,
        attempts: 0,
        verified: false,
        resendMessageId: resendMessageId || null,
        verificationProofToken: null
      });
    } catch (dbErr) {
      console.warn('[Firebase Admin Session Save Notice]:', dbErr.message);
    }
  }

  return {
    success: true,
    sessionId: signedSessionToken,
    sessionToken: signedSessionToken,
    email: cleanEmail,
    messageId: resendMessageId,
    message: `We sent a 6-digit verification code to ${cleanEmail}`
  };
}

/**
 * Verify 6-digit OTP code using privileged Firebase Admin SDK & cryptographic token validation
 */
export async function verifyOtpCode({ email, otp, sessionId, sessionToken }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();
  const targetToken = (sessionId || sessionToken || '').trim();

  if (!cleanEmail) {
    throw new Error('College email is required.');
  }

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }

  let sessionData = null;
  const adminFirestore = getFirebaseAdminDb();

  // 1. Try reading durable session via privileged Firebase Admin SDK
  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('otp_sessions').doc(cleanEmail).get();
      if (snap.exists) {
        sessionData = snap.data();
      }
    } catch (err) {
      console.warn('[Firebase Admin Read Notice]:', err.message);
    }
  }

  // 2. If Admin Firestore is not available, decode and verify signed session token
  if (!sessionData) {
    const decodedToken = verifySignedSessionToken(targetToken);
    if (decodedToken && decodedToken.email === cleanEmail) {
      sessionData = decodedToken;
    }
  }

  if (!sessionData) {
    throw new Error('No active verification session found. Please request a new verification code.');
  }

  // 3. Validate Expiry (10 minutes)
  if (Date.now() > sessionData.expiresAt) {
    if (adminFirestore) {
      try { await adminFirestore.collection('otp_sessions').doc(cleanEmail).delete(); } catch (e) {}
    }
    throw new Error('Code expired. Request a new code.');
  }

  // 4. Validate Max Attempts (5 attempts limit)
  if ((sessionData.attempts || 0) >= MAX_ATTEMPTS) {
    if (adminFirestore) {
      try { await adminFirestore.collection('otp_sessions').doc(cleanEmail).delete(); } catch (e) {}
    }
    throw new Error('Too many invalid attempts. Please request a new verification code.');
  }

  // 5. Compare cryptographic HMAC hash
  const computedHash = hashOtp(cleanOtp, cleanEmail);

  if (computedHash !== sessionData.hashedOtp) {
    const newAttempts = (sessionData.attempts || 0) + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      if (adminFirestore) {
        try { await adminFirestore.collection('otp_sessions').doc(cleanEmail).delete(); } catch (e) {}
      }
      throw new Error('Too many invalid attempts. Please request a new verification code.');
    }

    if (adminFirestore) {
      try {
        await adminFirestore.collection('otp_sessions').doc(cleanEmail).update({ attempts: newAttempts });
      } catch (e) {}
    }

    const remaining = MAX_ATTEMPTS - newAttempts;
    throw new Error(`Invalid verification code. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
  }

  // 6. OTP Verified! Issue single-use server verification proof and clear hash to prevent replay
  const verificationProofToken = 'mm_proof_' + crypto.randomBytes(24).toString('hex');

  if (adminFirestore) {
    try {
      await adminFirestore.collection('otp_sessions').doc(cleanEmail).update({
        verified: true,
        hashedOtp: null,
        verificationProofToken
      });
    } catch (e) {}
  }

  return {
    verified: true,
    email: cleanEmail,
    admissionNumber: sessionData.admissionNumber,
    verificationProofToken
  };
}
