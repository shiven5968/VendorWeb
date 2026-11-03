import { getFirebaseAdminDb } from './_firebaseAdmin.js';

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

    const { userId } = req.method === 'POST' ? (body || {}) : (req.query || {});

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const adminDb = getFirebaseAdminDb();

    // ── GET PROFILE ────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (adminDb) {
        const docSnap = await adminDb.collection('musclePassProfiles').doc(userId).get();
        if (docSnap.exists) {
          return res.status(200).json({ exists: true, profile: docSnap.data() });
        }
      }
      return res.status(200).json({ exists: false, profile: null });
    }

    // ── SAVE / UPDATE PROFILE ──────────────────────────────────────────────
    if (req.method === 'POST') {
      const {
        weightKg,
        dailyProteinTargetG,
        heightCm = null,
        age = null,
        goal = 'Muscle Gain',
        activityLevel = 'Moderate',
        dietaryPreference = 'Vegetarian',
        allergies = [],
        preferredPortion = 'Regular',
        appetitePreference = 'Normal'
      } = body;

      const numWeight = Number(weightKg);
      const numTarget = Number(dailyProteinTargetG);

      if (!numWeight || numWeight <= 20 || numWeight >= 300) {
        return res.status(400).json({ error: 'Please enter a valid body weight in kg (between 20 and 300).' });
      }

      if (!numTarget || numTarget <= 20 || numTarget >= 400) {
        return res.status(400).json({ error: 'Please enter a realistic daily protein target in grams (between 20 and 400).' });
      }

      const now = new Date().toISOString();
      const profileData = {
        userId,
        weightKg: Math.round(numWeight * 10) / 10,
        dailyProteinTargetG: Math.round(numTarget),
        heightCm: heightCm ? Number(heightCm) : null,
        age: age ? Number(age) : null,
        goal,
        activityLevel,
        dietaryPreference,
        allergies: Array.isArray(allergies) ? allergies : [],
        preferredPortion,
        appetitePreference,
        proteinPerKg: Math.round((numTarget / numWeight) * 10) / 10,
        updatedAt: now
      };

      if (adminDb) {
        const profileRef = adminDb.collection('musclePassProfiles').doc(userId);
        const existing = await profileRef.get();
        if (!existing.exists) {
          profileData.createdAt = now;
        }
        await profileRef.set(profileData, { merge: true });

        // Update user doc for backward compatibility
        try {
          await adminDb.collection('users').doc(userId).update({
            proteinTarget: profileData.dailyProteinTargetG,
            dietPreference: profileData.dietaryPreference,
            updatedAt: now
          });
        } catch (e) {}
      }

      return res.status(200).json({
        success: true,
        message: 'Nutrition profile saved successfully!',
        profile: profileData
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Muscle Pass Profile API Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}
