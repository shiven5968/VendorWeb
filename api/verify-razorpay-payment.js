import crypto from 'crypto';
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'messmates-f69a3';

let adminDb = null;

function getFirebaseAdminDb() {
  if (adminDb) return adminDb;

  const hasCredentials = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  if (!hasCredentials) return null;

  const existingApps = getAdminApps();
  let adminApp = existingApps.length > 0 ? existingApps[0] : null;

  if (!adminApp) {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        let serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
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
      }
    } catch (err) {
      console.warn('[Firebase Admin Payment Init Notice]:', err.message);
      return null;
    }
  }

  if (adminApp) {
    try {
      adminDb = getAdminFirestore(adminApp);
    } catch (e) {
      adminDb = null;
    }
  }
  return adminDb;
}

export default async function handler(req, res) {
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId = 'muscle_pass_monthly'
    } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return res.status(400).json({ message: 'Missing required payment verification parameters.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(400).json({ message: 'RAZORPAY_KEY_SECRET is not configured on the server.' });
    }

    // Cryptographic HMAC SHA-256 Signature Verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        verified: false,
        message: 'Payment verification failed: Invalid cryptographic signature.'
      });
    }

    // Payment Verified! Calculate 30-day subscription expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscriptionData = {
      userId,
      planId,
      status: 'ACTIVE',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      amountPaid: 299,
      currency: 'INR'
    };

    // Persist Subscription to Firestore via Admin SDK
    const adminFirestore = getFirebaseAdminDb();
    if (adminFirestore) {
      try {
        await adminFirestore.collection('subscriptions').doc(userId).set(subscriptionData);
        await adminFirestore.collection('users').doc(userId).update({
          musclePassActive: true,
          musclePassExpiry: expiresAt.toISOString()
        });
      } catch (dbErr) {
        console.warn('[Firestore Subscription Save Notice]:', dbErr.message);
      }
    }

    return res.status(200).json({
      verified: true,
      message: 'Muscle Pass subscription activated successfully!',
      subscription: subscriptionData
    });
  } catch (err) {
    console.error('[Razorpay Verification Error]:', err);
    return res.status(500).json({ message: err.message || 'Payment verification failed.' });
  }
}
