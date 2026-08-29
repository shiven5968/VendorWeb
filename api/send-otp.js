import { sendOtpEmail } from './_otpService.js';
import crypto from 'crypto';

// Server-side timeout (25 seconds — Vercel serverless limit is 30s)
const SERVER_TIMEOUT_MS = 25000;

function generateRequestId() {
  return 'MM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export default async function handler(req, res) {
  const requestId = generateRequestId();

  // Security headers
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

  // Timeout wrapper — prevents infinite hang
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please try again.')), SERVER_TIMEOUT_MS)
  );

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    // Validate required fields before doing any work
    const { email, admissionNumber, name } = body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        message: 'Email address is required.',
        requestId
      });
    }

    if (!admissionNumber || typeof admissionNumber !== 'string') {
      return res.status(400).json({
        message: 'Admission Number is required.',
        requestId
      });
    }

    // Race send-OTP against server timeout
    const result = await Promise.race([
      sendOtpEmail({ email: email.trim().toLowerCase(), admissionNumber: admissionNumber.trim(), name: (name || 'Student').trim() }),
      timeoutPromise
    ]);

    return res.status(200).json({ ...result, requestId });

  } catch (err) {
    // Categorize error for appropriate HTTP status
    const msg = err.message || 'Failed to send verification code.';

    // Rate-limit / cooldown → 429
    if (msg.includes('Please wait') || msg.includes('rate limit') || msg.includes('too many')) {
      return res.status(429).json({ message: msg, requestId });
    }

    // Configuration error (missing API key etc.) → 503
    if (msg.includes('not configured') || msg.includes('RESEND_API_KEY')) {
      console.error(`[${requestId}] OTP service configuration error:`, msg);
      return res.status(503).json({
        message: 'Verification service is temporarily unavailable. Please try again shortly.',
        requestId
      });
    }

    // Timeout → 504
    if (msg.includes('timed out')) {
      return res.status(504).json({ message: msg, requestId });
    }

    // All other errors → 400 with safe message (no internal detail)
    console.error(`[${requestId}] OTP send error:`, msg);
    return res.status(400).json({
      message: 'Unable to send verification code. Please try again.',
      requestId
    });
  }
}
