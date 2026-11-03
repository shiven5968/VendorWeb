import { getFirebaseAdminDb } from './_firebaseAdmin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const adminDb = getFirebaseAdminDb();

    // ── GET: FETCH MEAL LOGS ───────────────────────────────────────────────
    if (req.method === 'GET') {
      const { userId, date, weekly } = req.query || {};

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

      if (weekly === 'true') {
        // Return last 7 daily summaries for weekly insights
        let weeklyLogs = [];
        if (adminDb) {
          const snap = await adminDb
            .collection('musclePassDailySummaries')
            .where('userId', '==', userId)
            .orderBy('dateIST', 'desc')
            .limit(7)
            .get();
          snap.forEach(d => weeklyLogs.push(d.data()));
        }
        return res.status(200).json({ weeklySummaries: weeklyLogs.reverse() });
      }

      const targetDate = date || new Date().toISOString().split('T')[0];
      let logs = [];
      let dailySummary = null;

      if (adminDb) {
        const snap = await adminDb
          .collection('musclePassMealLogs')
          .where('userId', '==', userId)
          .where('dateIST', '==', targetDate)
          .get();
        snap.forEach(d => logs.push(d.data()));

        const sumDoc = await adminDb
          .collection('musclePassDailySummaries')
          .doc(`${userId}_${targetDate}`)
          .get();
        if (sumDoc.exists) {
          dailySummary = sumDoc.data();
        }
      }

      return res.status(200).json({
        dateIST: targetDate,
        logs,
        summary: dailySummary
      });
    }

    // ── POST: SAVE / UPDATE MEAL LOG ───────────────────────────────────────
    if (req.method === 'POST') {
      const {
        userId,
        dateIST,
        mealType, // 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' | 'Outside'
        status = 'COMPLETED', // 'COMPLETED' | 'SKIPPED' | 'PARTIAL'
        items = [],
        proteinConsumed = 0,
        caloriesConsumed = 0,
        targetProteinG = 120,
        notes = ''
      } = body;

      if (!userId || !dateIST || !mealType) {
        return res.status(400).json({ error: 'User ID, dateIST, and mealType are required.' });
      }

      const now = new Date().toISOString();
      const docId = `${userId}_${dateIST}_${mealType.toLowerCase()}`;

      const logData = {
        userId,
        dateIST,
        mealType,
        status,
        items: Array.isArray(items) ? items : [],
        proteinConsumed: Math.max(0, Math.round(Number(proteinConsumed) * 10) / 10),
        caloriesConsumed: Math.max(0, Math.round(Number(caloriesConsumed))),
        notes: notes || '',
        updatedAt: now
      };

      if (adminDb) {
        const logRef = adminDb.collection('musclePassMealLogs').doc(docId);
        await logRef.set(logData, { merge: true });

        // Recalculate daily summary atomically
        const allLogsSnap = await adminDb
          .collection('musclePassMealLogs')
          .where('userId', '==', userId)
          .where('dateIST', '==', dateIST)
          .get();

        let dayProtein = 0;
        let dayCalories = 0;
        let completedMeals = 0;

        allLogsSnap.forEach(d => {
          const l = d.data();
          dayProtein += Number(l.proteinConsumed) || 0;
          dayCalories += Number(l.caloriesConsumed) || 0;
          if (l.status !== 'SKIPPED') completedMeals++;
        });

        dayProtein = Math.round(dayProtein * 10) / 10;
        const target = Math.max(1, Number(targetProteinG) || 120);
        const remainingProtein = Math.max(0, Math.round((target - dayProtein) * 10) / 10);
        const completionPercentage = Math.min(100, Math.round((dayProtein / target) * 100));

        const summaryData = {
          userId,
          dateIST,
          targetProteinG: target,
          consumedProteinG: dayProtein,
          remainingProteinG: remainingProtein,
          completionPercentage,
          consumedCalories: dayCalories,
          mealsCompleted: completedMeals,
          updatedAt: now
        };

        await adminDb
          .collection('musclePassDailySummaries')
          .doc(`${userId}_${dateIST}`)
          .set(summaryData, { merge: true });

        return res.status(200).json({
          success: true,
          message: `${mealType} log saved successfully.`,
          log: logData,
          summary: summaryData
        });
      }

      // Memory fallback mode
      return res.status(200).json({
        success: true,
        message: `${mealType} log saved (local mode).`,
        log: logData
      });
    }

    // ── DELETE: REMOVE A MEAL LOG ──────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { userId, dateIST, mealType, targetProteinG = 120 } = req.query || {};

      if (!userId || !dateIST || !mealType) {
        return res.status(400).json({ error: 'User ID, dateIST, and mealType are required to delete a log.' });
      }

      const docId = `${userId}_${dateIST}_${mealType.toLowerCase()}`;

      if (adminDb) {
        await adminDb.collection('musclePassMealLogs').doc(docId).delete();

        // Recalculate summary after deletion
        const allLogsSnap = await adminDb
          .collection('musclePassMealLogs')
          .where('userId', '==', userId)
          .where('dateIST', '==', dateIST)
          .get();

        let dayProtein = 0;
        let dayCalories = 0;
        let completedMeals = 0;

        allLogsSnap.forEach(d => {
          const l = d.data();
          dayProtein += Number(l.proteinConsumed) || 0;
          dayCalories += Number(l.caloriesConsumed) || 0;
          if (l.status !== 'SKIPPED') completedMeals++;
        });

        dayProtein = Math.round(dayProtein * 10) / 10;
        const target = Math.max(1, Number(targetProteinG) || 120);
        const remainingProtein = Math.max(0, Math.round((target - dayProtein) * 10) / 10);
        const completionPercentage = Math.min(100, Math.round((dayProtein / target) * 100));

        const summaryData = {
          userId,
          dateIST,
          targetProteinG: target,
          consumedProteinG: dayProtein,
          remainingProteinG: remainingProtein,
          completionPercentage,
          consumedCalories: dayCalories,
          mealsCompleted: completedMeals,
          updatedAt: new Date().toISOString()
        };

        await adminDb
          .collection('musclePassDailySummaries')
          .doc(`${userId}_${dateIST}`)
          .set(summaryData, { merge: true });

        return res.status(200).json({
          success: true,
          message: `${mealType} log removed.`,
          summary: summaryData
        });
      }

      return res.status(200).json({ success: true, message: 'Log deleted (local mode).' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Muscle Pass Logs API Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}
