import { verifyOtpCode } from './_otpService.js';
import crypto from 'crypto';

// Server-side timeout (25 seconds)
const SERVER_TIMEOUT_MS = 25000;

function generateRequestId() {
  return 'MM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export default async function handler(req, res) {
  const requestId = generateRequestId();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Request-Id', requestId);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed', requestId });
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Verification timed out. Please try again.')), SERVER_TIMEOUT_MS)
  );

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { email, otp, sessionId, sessionToken } = body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email address is required.', requestId });
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return res.status(400).json({ message: 'Please enter a valid 6-digit verification code.', requestId });
    }

    const result = await Promise.race([
      verifyOtpCode({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        sessionId: sessionId || sessionToken,
        sessionToken: sessionToken || sessionId
      }),
      timeoutPromise
    ]);

    return res.status(200).json({ ...result, requestId });

  } catch (err) {
    const msg = err.message || 'Verification failed.';

    // Expired → 410 Gone
    if (msg.toLowerCase().includes('expired')) {
      return res.status(410).json({ message: 'Code expired. Please request a new verification code.', requestId });
    }

    // Too many attempts → 429
    if (msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('attempts')) {
      return res.status(429).json({ message: msg, requestId });
    }

    // No session → 404
    if (msg.toLowerCase().includes('no active') || msg.toLowerCase().includes('session')) {
      return res.status(404).json({ message: 'No active verification session found. Please request a new code.', requestId });
    }

    // Timeout → 504
    if (msg.includes('timed out')) {
      return res.status(504).json({ message: msg, requestId });
    }

    // Wrong OTP → 400
    console.error(`[${requestId}] OTP verify error:`, msg);
    return res.status(400).json({ message: msg, requestId });
  }
}
