/**
 * MessMates — Muscle Pass Client Service
 * Bridges UI to Vercel serverless backend with resilient local caching.
 */

import { getCollegeDateString } from '../utils/dateTime.js';

const STORAGE_KEYS = {
  TRIAL: 'messmates_mp_trial_',
  PROFILE: 'messmates_mp_profile_',
  LOGS: 'messmates_mp_logs_',
  SUMMARIES: 'messmates_mp_summaries_'
};

/**
 * Format milliseconds remaining into human-readable IST string.
 * Example: "6 days 14 hours left", "8 hours 20 mins left"
 */
export function formatTimeRemaining(ms) {
  if (!ms || ms <= 0) return 'Expired';
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hr${hours > 1 ? 's' : ''} left`;
  }
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''} left`;
  }
  return `${minutes} min${minutes > 1 ? 's' : ''} left`;
}

/**
 * Starts 7-day free trial on the server.
 */
export async function startTrial(userId) {
  if (!userId) throw new Error('User must be signed in to start the free demo.');

  try {
    const res = await fetch('/api/muscle-pass-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start_trial', userId })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Unable to start 7-day free trial.');
    }

    // Cache locally
    try {
      localStorage.setItem(`${STORAGE_KEYS.TRIAL}${userId}`, JSON.stringify(data.trial));
    } catch (e) {}

    return data.trial;
  } catch (err) {
    // If backend endpoint is unreachable (e.g. offline dev), provide safe local trial
    console.warn('[Trial start fallback]:', err.message);
    const now = new Date();
    const trial = {
      userId,
      status: 'ACTIVE',
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      planId: 'TRIAL_7_DAYS',
      planName: '7-Day Free Trial',
      durationDays: 7
    };
    try {
      localStorage.setItem(`${STORAGE_KEYS.TRIAL}${userId}`, JSON.stringify(trial));
    } catch (e) {}
    return trial;
  }
}

/**
 * Checks server for trial/subscription entitlement status.
 */
export async function checkStatus(userId) {
  if (!userId) return { hasActivePass: false, status: 'NONE', trialClaimed: false };

  try {
    const res = await fetch(`/api/muscle-pass-trial?action=status&userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Status check fallback]:', err.message);
  }

  // Local fallback
  try {
    const cached = localStorage.getItem(`${STORAGE_KEYS.TRIAL}${userId}`);
    if (cached) {
      const trial = JSON.parse(cached);
      const now = new Date();
      const expiresAt = new Date(trial.expiresAt);
      const isActive = expiresAt > now;
      return {
        hasActivePass: isActive,
        isTrial: true,
        status: isActive ? 'ACTIVE_TRIAL' : 'EXPIRED_TRIAL',
        planName: trial.planName || '7-Day Free Trial',
        startedAt: trial.startedAt,
        expiresAt: trial.expiresAt,
        msLeft: Math.max(0, expiresAt.getTime() - now.getTime()),
        trialClaimed: true,
        trialExpired: !isActive
      };
    }
  } catch (e) {}

  return { hasActivePass: false, status: 'NONE', trialClaimed: false, canStartTrial: true };
}

/**
 * Gets student nutrition profile.
 */
export async function getNutritionProfile(userId) {
  if (!userId) return null;

  try {
    const res = await fetch(`/api/muscle-pass-profile?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.exists && data.profile) {
        try {
          localStorage.setItem(`${STORAGE_KEYS.PROFILE}${userId}`, JSON.stringify(data.profile));
        } catch (e) {}
        return data.profile;
      }
    }
  } catch (err) {
    console.warn('[Profile fetch fallback]:', err.message);
  }

  // Local cache fallback
  try {
    const cached = localStorage.getItem(`${STORAGE_KEYS.PROFILE}${userId}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return null;
}

/**
 * Saves student nutrition profile.
 */
export async function saveNutritionProfile(userId, profileData) {
  if (!userId) throw new Error('User ID is required.');

  try {
    const res = await fetch('/api/muscle-pass-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...profileData })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save nutrition profile.');
    }

    try {
      localStorage.setItem(`${STORAGE_KEYS.PROFILE}${userId}`, JSON.stringify(data.profile));
    } catch (e) {}

    return data.profile;
  } catch (err) {
    console.warn('[Profile save fallback]:', err.message);
    const localProfile = {
      userId,
      ...profileData,
      proteinPerKg: Math.round((Number(profileData.dailyProteinTargetG) / Number(profileData.weightKg)) * 10) / 10,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`${STORAGE_KEYS.PROFILE}${userId}`, JSON.stringify(localProfile));
    } catch (e) {}
    return localProfile;
  }
}

/**
 * Fetches daily meal logs for a given IST date.
 */
export async function getDailyLogs(userId, dateIST = getCollegeDateString()) {
  if (!userId) return { logs: [], summary: null };

  try {
    const res = await fetch(`/api/muscle-pass-logs?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(dateIST)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Logs fetch fallback]:', err.message);
  }

  // Local fallback
  try {
    const key = `${STORAGE_KEYS.LOGS}${userId}_${dateIST}`;
    const raw = localStorage.getItem(key);
    return {
      dateIST,
      logs: raw ? JSON.parse(raw) : [],
      summary: null
    };
  } catch (e) {
    return { dateIST, logs: [], summary: null };
  }
}

/**
 * Saves a meal log.
 */
export async function logMeal(logData) {
  const { userId, dateIST = getCollegeDateString() } = logData;
  if (!userId) throw new Error('User ID is required.');

  try {
    const res = await fetch('/api/muscle-pass-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Meal log fallback]:', err.message);
  }

  // Local cache update
  try {
    const key = `${STORAGE_KEYS.LOGS}${userId}_${dateIST}`;
    const raw = localStorage.getItem(key);
    let logs = raw ? JSON.parse(raw) : [];
    logs = logs.filter(l => l.mealType !== logData.mealType);
    logs.push(logData);
    localStorage.setItem(key, JSON.stringify(logs));
  } catch (e) {}

  return { success: true, log: logData };
}

/**
 * Deletes a meal log.
 */
export async function deleteMealLog(userId, dateIST, mealType, targetProteinG = 120) {
  try {
    const res = await fetch(
      `/api/muscle-pass-logs?userId=${encodeURIComponent(userId)}&dateIST=${encodeURIComponent(dateIST)}&mealType=${encodeURIComponent(mealType)}&targetProteinG=${targetProteinG}`,
      { method: 'DELETE' }
    );
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Delete log fallback]:', err.message);
  }

  // Local cache remove
  try {
    const key = `${STORAGE_KEYS.LOGS}${userId}_${dateIST}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      let logs = JSON.parse(raw);
      logs = logs.filter(l => l.mealType !== mealType);
      localStorage.setItem(key, JSON.stringify(logs));
    }
  } catch (e) {}

  return { success: true };
}

/**
 * Fetches last 7 daily summaries for weekly trends.
 */
export async function getWeeklySummaries(userId) {
  if (!userId) return [];

  try {
    const res = await fetch(`/api/muscle-pass-logs?userId=${encodeURIComponent(userId)}&weekly=true`);
    if (res.ok) {
      const data = await res.json();
      return data.weeklySummaries || [];
    }
  } catch (err) {
    console.warn('[Weekly summaries fallback]:', err.message);
  }

  return [];
}
