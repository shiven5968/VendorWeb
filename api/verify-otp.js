import { verifyOtpCode } from './_otpService.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const { email, otp, sessionToken } = body || {};
    const result = await verifyOtpCode({ email, otp, sessionToken });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Verification failed.' });
  }
}
