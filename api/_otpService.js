import crypto from 'crypto';

// In-memory server-side session cache for OTP verification
// Structure: Map<email, { code, sessionToken, expiresAt, attempts, lastSentAt, admissionNumber, name, verified }>
const serverOtpSessions = new Map();

// 10 minutes validity
export const OTP_EXPIRY_MS = 10 * 60 * 1000;
// 30 seconds resend cooldown
export const RESEND_COOLDOWN_MS = 30 * 1000;
// Maximum 5 verification attempts
export const MAX_ATTEMPTS = 5;

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
 * Generates a secure 6-digit numeric OTP
 */
export function generateSecureOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Generates a secure random session token
 */
export function generateSessionToken() {
  return 'mm_sess_' + crypto.randomBytes(16).toString('hex');
}

/**
 * Send 6-digit OTP via Resend API
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
  const existingSession = serverOtpSessions.get(cleanEmail);

  // Check 30-second resend cooldown
  if (existingSession && (now - existingSession.lastSentAt) < RESEND_COOLDOWN_MS) {
    const remainingSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existingSession.lastSentAt)) / 1000);
    throw new Error(`Please wait ${remainingSec} seconds before requesting a new verification code.`);
  }

  // Generate 6-digit OTP
  const otp = generateSecureOTP();
  const sessionToken = generateSessionToken();
  const expiresAt = now + OTP_EXPIRY_MS;

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'MessMates <onboarding@resend.dev>';

  let emailSent = false;
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
                            <span style="font-size: 11px; font-weight: 600; color: #15803d; display: block; margin-top: 8px;">⏱️ Valid for 10 minutes</span>
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
      emailSent = true;
      resendMessageId = resData.id;
    } catch (err) {
      console.error('[Resend Error]:', err);
      throw new Error(`Failed to deliver OTP to ${cleanEmail}: ${err.message}`);
    }
  } else {
    // If RESEND_API_KEY is not configured, throw clear actionable error
    throw new Error('RESEND_API_KEY is not configured on the server. Please configure RESEND_API_KEY in your server environment.');
  }

  // Store in-memory session (never expose OTP to client)
  serverOtpSessions.set(cleanEmail, {
    code: otp,
    sessionToken,
    expiresAt,
    attempts: 0,
    lastSentAt: now,
    admissionNumber: cleanAdmission,
    name: cleanName,
    verified: false,
    resendMessageId
  });

  return {
    success: true,
    sessionToken,
    email: cleanEmail,
    messageId: resendMessageId,
    message: `Verification code sent to ${cleanEmail}`
  };
}

/**
 * Verify 6-digit OTP code on the server
 */
export async function verifyOtpCode({ email, otp, sessionToken }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }

  const session = serverOtpSessions.get(cleanEmail);
  if (!session) {
    throw new Error('No active verification session found. Please request a new verification code.');
  }

  if (Date.now() > session.expiresAt) {
    serverOtpSessions.delete(cleanEmail);
    throw new Error('Verification code has expired (10 minutes limit). Please request a new code.');
  }

  if (session.sessionToken !== sessionToken) {
    throw new Error('Session token mismatch. Please request a new verification code.');
  }

  session.attempts += 1;
  if (session.attempts > MAX_ATTEMPTS) {
    serverOtpSessions.delete(cleanEmail);
    throw new Error('Too many invalid attempts. Please request a fresh verification code.');
  }

  if (session.code !== cleanOtp) {
    const remaining = MAX_ATTEMPTS - session.attempts;
    throw new Error(`Invalid verification code. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
  }

  // OTP verified successfully! Generate single-use verification proof
  const verificationProofToken = 'mm_proof_' + crypto.randomBytes(24).toString('hex');
  session.verified = true;
  session.verificationProofToken = verificationProofToken;

  // Clear code from memory to prevent replay
  delete session.code;

  return {
    verified: true,
    email: cleanEmail,
    admissionNumber: session.admissionNumber,
    verificationProofToken
  };
}
