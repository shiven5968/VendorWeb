/**
 * MessMates — Centralized Mess Configuration & Routing
 *
 * Canonical mess identifiers:
 *   boys_junior  → Boys Junior Mess  (I Year & II Year — Naina Caters)
 *   boys_senior  → Boys Senior Mess  (III Year, IV Year, MBA & MCA — Star Caterers)
 *   girls        → Girls Hostel Mess
 *
 * Routing rules:
 *   2026B* / 2025B*                 → boys_junior
 *   2024B* / 2023B*                 → boys_senior
 *   Girls hostel block context      → girls
 *   Unknown / unmatched             → null (unresolved — NEVER silently assigned to Junior)
 *
 * Invariant: Admission number is normalized (trim + uppercase) before matching.
 * Unknown prefixes are NEVER silently classified as Junior.
 */

// ── CANONICAL MESS CONFIG ─────────────────────────────────────────────────
export const MESS_CONFIG = {
  boys_junior: {
    id: 'boys_junior',
    label: 'Boys Junior Mess',
    shortLabel: 'Junior',
    description: 'I Year & II Year — Naina Caters',
    caterer: 'Naina Caters',
    effectiveDate: '18 Sept 2026',
    years: [1, 2],
    hostelTypes: null,
    menuId: 'boys_junior',
    color: 'emerald',
    scopeKey: 'boys_junior',
  },
  boys_senior: {
    id: 'boys_senior',
    label: 'Boys Senior Mess',
    shortLabel: 'Senior',
    description: 'III Year, IV Year, MBA & MCA — Star Caterers',
    caterer: 'Star Caterers',
    effectiveDate: '24 Aug 2026',
    years: [3, 4],
    hostelTypes: null,
    menuId: 'boys_senior',
    color: 'blue',
    scopeKey: 'boys_senior',
  },
  girls: {
    id: 'girls',
    label: 'Girls Hostel Mess',
    shortLabel: 'Girls',
    description: 'Girls Hostel — Session 2026-27',
    caterer: 'ABES EC & ABES BS',
    effectiveDate: '19 Sept 2026',
    years: null,
    hostelTypes: ['Block A (Girls)', 'Block B (Girls)', 'Block C (Girls)'],
    menuId: 'girls',
    color: 'rose',
    scopeKey: 'girls',
  },
};

// ── ADMISSION PREFIX → MESS ROUTING MAP ──────────────────────────────────
// Only explicitly-known prefixes are mapped.
// Unknown prefixes are UNRESOLVED and must NEVER be mapped to Junior.
export const ADMISSION_PREFIX_TO_MESS = {
  '2026B': 'boys_junior',
  '2025B': 'boys_junior',
  '2024B': 'boys_senior',
  '2023B': 'boys_senior',
};

// ── Girls hostel & profile context check ──────────────────────────────────
export const isGirlsProfile = (profile) => {
  if (!profile) return false;
  const hostelBlock = profile.hostelBlock || profile.block || '';
  if (typeof hostelBlock === 'string') {
    const lower = hostelBlock.toLowerCase();
    if (
      lower.includes('(girls)') ||
      lower.includes('girls') ||
      (lower.includes('block') && (lower.includes(' a') || lower.includes(' b') || lower.includes(' c')))
    ) {
      return true;
    }
  }
  if (profile.hostelType && typeof profile.hostelType === 'string' && profile.hostelType.toLowerCase().includes('girls')) {
    return true;
  }
  if (profile.gender && typeof profile.gender === 'string' && (profile.gender.toLowerCase() === 'female' || profile.gender.toLowerCase() === 'f')) {
    return true;
  }
  return false;
};

/**
 * Resolve a student's mess from their profile.
 *
 * Rules:
 *  1. Verified Girls Hostel / Girls profile context → girls
 *  2. 2025B* / 2026B* → boys_junior
 *  3. 2023B* / 2024B* → boys_senior
 *  4. Unknown / unmatched → null (unresolved). NEVER automatically Junior.
 *
 * @param {object} profile - Firestore user profile
 * @returns {object|null} - MESS_CONFIG entry, or null if unresolved
 */
export const getMessForStudent = (profile) => {
  if (!profile) return null;

  // 1. Verified Girls Hostel context takes highest priority
  if (isGirlsProfile(profile)) {
    return MESS_CONFIG.girls;
  }

  // 2. Admission number prefix matching (normalized: trimmed + uppercase)
  const admissionNumber = (profile.admissionNumber || '').trim().toUpperCase();
  if (admissionNumber.length >= 5) {
    const prefix5 = admissionNumber.substring(0, 5); // e.g. "2026B"
    const messId = ADMISSION_PREFIX_TO_MESS[prefix5];
    if (messId && MESS_CONFIG[messId]) {
      return MESS_CONFIG[messId];
    }
  }

  // 3. Unknown or unlisted prefix → returns null (safe unresolved behavior)
  // NEVER silently classify unknown students as boys_junior
  return null;
};

// ── Backward-compatibility alias ──────────────────────────────────────────
/**
 * @deprecated Use getMessForStudent() instead.
 */
export const resolveMenuGroup = getMessForStudent;

// ── Utility helpers ───────────────────────────────────────────────────────
/**
 * Returns all valid mess options as an array (for dropdowns, official selectors).
 */
export const getMessOptions = () => Object.values(MESS_CONFIG);

/**
 * @deprecated Use getMessOptions() instead.
 */
export const getMenuGroupOptions = getMessOptions;

/**
 * Returns MESS_CONFIG entry by messId, or null if invalid.
 */
export const getMessById = (messId) => MESS_CONFIG[messId] || null;

/**
 * Routing lookup table for verification and tests.
 */
export const ROUTING_TABLE = [
  { prefix: '2026B', messId: 'boys_junior', label: 'Boys Junior' },
  { prefix: '2025B', messId: 'boys_junior', label: 'Boys Junior' },
  { prefix: '2024B', messId: 'boys_senior', label: 'Boys Senior' },
  { prefix: '2023B', messId: 'boys_senior', label: 'Boys Senior' },
];

// Backward-compatible config shape for legacy components
export const MENU_GROUP_CONFIG = {
  juniorStudents: MESS_CONFIG.boys_junior,
  seniorStudents: MESS_CONFIG.boys_senior,
  girlsHostel: MESS_CONFIG.girls,
};
