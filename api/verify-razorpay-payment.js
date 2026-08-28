import crypto from 'crypto';
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'messmates-f69a3';

const SERVER_PLANS = {
  MUSCLE_MONTHLY: { id: 'MUSCLE_MONTHLY', durationDays: 30, price: 69, name: 'Muscle Pass 1 Month' },
  MUSCLE_3_MONTHS: { id: 'MUSCLE_3_MONTHS', durationDays: 90, price: 149, name: 'Muscle Pass 3 Months' },
  MUSCLE_6_MONTHS: { id: 'MUSCLE_6_MONTHS', durationDays: 180, price: 249, name: 'Muscle Pass 6 Months' },
  MUSCLE_YEARLY: { id: 'MUSCLE_YEARLY', durationDays: 365, price: 449, name: 'Muscle Pass 1 Year' },
};

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
      planId = 'MUSCLE_MONTHLY'
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

    // Check for existing subscription for idempotency
    const adminFirestore = getFirebaseAdminDb();
    if (adminFirestore) {
      try {
        const subDoc = await adminFirestore.collection('subscriptions').doc(userId).get();
        if (subDoc.exists) {
          const existing = subDoc.data();
          if (existing.paymentId === razorpay_payment_id || existing.orderId === razorpay_order_id) {
            return res.status(200).json({
              verified: true,
              message: `${existing.planName || 'Muscle Pass'} subscription already active (Idempotent).`,
              subscription: existing
            });
          }
        }
      } catch (checkErr) {
        console.warn('[Idempotent Check Notice]:', checkErr.message);
      }
    }

    // Resolve Plan & Duration
    const planConfig = SERVER_PLANS[planId] || SERVER_PLANS.MUSCLE_MONTHLY;
    const durationDays = planConfig.durationDays;

    const now = new Date();
    const startDate = now.toISOString();
    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const subscriptionData = {
      userId,
      planId: planConfig.id,
      planName: planConfig.name,
      amount: planConfig.price,
      currency: 'INR',
      startDate,
      expiryDate,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'ACTIVE',
      updatedAt: startDate
    };

    // Persist Subscription to Firestore via Admin SDK
    if (adminFirestore) {
      try {
        await adminFirestore.collection('subscriptions').doc(userId).set(subscriptionData, { merge: true });
        await adminFirestore.collection('users').doc(userId).update({
          musclePassActive: true,
          musclePassPlanId: planConfig.id,
          musclePassExpiry: expiryDate,
          updatedAt: startDate
        });
      } catch (dbErr) {
        console.warn('[Firestore Subscription Save Notice]:', dbErr.message);
      }
    }

    return res.status(200).json({
      verified: true,
      message: `${planConfig.name} subscription activated successfully!`,
      subscription: subscriptionData
    });
  } catch (err) {
    console.error('[Razorpay Verification Error]:', err);
    return res.status(500).json({ message: err.message || 'Payment verification failed.' });
  }
}
