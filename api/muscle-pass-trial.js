import { getFirebaseAdminDb } from './_firebaseAdmin.js';

const TRIAL_DURATION_DAYS = 7;
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { action = 'status', userId } = (req.method === 'POST' ? body : req.query) || {};

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const adminDb = getFirebaseAdminDb();

    // ── ACTION: CHECK STATUS ───────────────────────────────────────────────
    if (action === 'status' || req.method === 'GET') {
      let trialData = null;
      let subscriptionData = null;

      if (adminDb) {
        try {
          const trialDoc = await adminDb.collection('musclePassTrials').doc(userId).get();
          if (trialDoc.exists) {
            trialData = trialDoc.data();
          }

          const subDoc = await adminDb.collection('subscriptions').doc(userId).get();
          if (subDoc.exists) {
            subscriptionData = subDoc.data();
          }
        } catch (dbErr) {
          console.warn('[Trial Status DB Warning]:', dbErr.message);
        }
      }

      const now = new Date();
      
      // Check paid subscription first
      const hasPaidActive = subscriptionData?.status === 'ACTIVE' && new Date(subscriptionData?.expiryDate || 0) > now;
      if (hasPaidActive) {
        const expiresAt = new Date(subscriptionData.expiryDate);
        const msLeft = Math.max(0, expiresAt.getTime() - now.getTime());
        return res.status(200).json({
          hasActivePass: true,
          isTrial: false,
          status: 'ACTIVE_PAID',
          planName: subscriptionData.planName || 'Muscle Pass Paid',
          expiresAt: expiresAt.toISOString(),
          msLeft,
          trialClaimed: Boolean(trialData)
        });
      }

      // Check free trial
      if (trialData) {
        const expiresAt = new Date(trialData.expiresAt);
        const isTrialActive = trialData.status === 'ACTIVE' && expiresAt > now;
        const msLeft = Math.max(0, expiresAt.getTime() - now.getTime());

        return res.status(200).json({
          hasActivePass: isTrialActive,
          isTrial: true,
          status: isTrialActive ? 'ACTIVE_TRIAL' : 'EXPIRED_TRIAL',
          planName: '7-Day Free Trial',
          startedAt: trialData.startedAt,
          expiresAt: trialData.expiresAt,
          msLeft,
          trialClaimed: true,
          trialExpired: !isTrialActive
        });
      }

      // No trial claimed yet
      return res.status(200).json({
        hasActivePass: false,
        isTrial: false,
        status: 'NONE',
        trialClaimed: false,
        canStartTrial: true
      });
    }

    // ── ACTION: START TRIAL ────────────────────────────────────────────────
    if (action === 'start_trial') {
      const now = new Date();
      const startedAt = now.toISOString();
      const expiresAt = new Date(now.getTime() + TRIAL_DURATION_MS).toISOString();

      if (adminDb) {
        const trialRef = adminDb.collection('musclePassTrials').doc(userId);
        const userRef = adminDb.collection('users').doc(userId);

        // Server-side enforcement: One free demo per account
        const existingTrial = await trialRef.get();
        if (existingTrial.exists) {
          const data = existingTrial.data();
          return res.status(400).json({
            error: 'You have already used your 7-Day Free Trial on this account.',
            trialClaimed: true,
            status: data.status,
            expiresAt: data.expiresAt
          });
        }

        const newTrial = {
          userId,
          status: 'ACTIVE',
          startedAt,
          expiresAt,
          planId: 'TRIAL_7_DAYS',
          planName: '7-Day Free Trial',
          createdAt: startedAt,
          durationDays: TRIAL_DURATION_DAYS
        };

        await trialRef.set(newTrial);
        try {
          await userRef.update({
            musclePassActive: true,
            musclePassTrialActive: true,
            musclePassExpiry: expiresAt,
            updatedAt: startedAt
          });
        } catch (e) {
          console.warn('[User doc trial flag update warning]:', e.message);
        }

        return res.status(200).json({
          success: true,
          message: '7-Day Free Trial successfully activated! Welcome to Muscle Pass.',
          trial: newTrial
        });
      }

      // Memory fallback for environments without service account configured
      return res.status(200).json({
        success: true,
        message: '7-Day Free Trial activated (local mode).',
        trial: {
          userId,
          status: 'ACTIVE',
          startedAt,
          expiresAt,
          planId: 'TRIAL_7_DAYS',
          planName: '7-Day Free Trial',
          createdAt: startedAt,
          durationDays: TRIAL_DURATION_DAYS
        }
      });
    }

    return res.status(400).json({ error: `Unsupported action "${action}".` });
  } catch (err) {
    console.error('[Muscle Pass Trial API Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}
