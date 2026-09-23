/**
 * MessMates — Centralized Mess Configuration & Routing
 *
 * Canonical mess identifiers:
 *   boys_junior  → Boys Junior Mess  (I Year & II Year — Naina Caters)
 *   boys_senior  → Boys Senior Mess  (III Year, IV Year, MBA & MCA — Star Caterers)
 *   girls        → Girls Hostel Mess
 *
 * Routing rules:
 *   2026B* → boys_junior
 *   2025B* → boys_junior
 *   2024B* → boys_senior
 *   2023B* → boys_senior
 *   Girls hostel block context → girls
 *   Unknown prefix → safe fallback (boys_junior)
 *
 * IMPORTANT: Admission number is normalized (trim + uppercase) before matching.
 * Unknown prefixes are never silently routed to the wrong mess.
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
// Only explicitly-known prefixes are listed.
// Unlisted prefixes fall back to the safe default.
export const ADMISSION_PREFIX_TO_MESS = {
  '2026B': 'boys_junior',
  '2025B': 'boys_junior',
  '2024B': 'boys_senior',
  '2023B': 'boys_senior',
};

// ── SAFE DEFAULT (fallback for unknown prefixes) ──────────────────────────
export const DEFAULT_MESS_ID = 'boys_junior';

// ── Girls hostel block check ───────────────────────────────────────────────
const isGirlsBlock = (hostelBlock) => {
  if (!hostelBlock || typeof hostelBlock !== 'string') return false;
  const lower = hostelBlock.toLowerCase();
  return (
    lower.includes('(girls)') ||
    lower.includes('girls') ||
    (lower.includes('block') && (lower.includes(' a') || lower.includes(' b') || lower.includes(' c')))
  );
};

/**
 * Resolve a student's mess from their profile.
 *
 * Priority:
 *  1. Girls hostel block → girls
 *  2. Admission prefix (2026B, 2025B → junior; 2024B, 2023B → senior)
 *  3. Safe fallback (boys_junior)
 *
 * @param {object} profile - Firestore user profile
 * @returns {object} - MESS_CONFIG entry
 */
export const getMessForStudent = (profile) => {
  if (!profile) return MESS_CONFIG[DEFAULT_MESS_ID];

  // 1. Girls hostel block takes priority
  const hostelBlock = profile.hostelBlock || '';
  if (isGirlsBlock(hostelBlock)) {
    return MESS_CONFIG.girls;
  }

  // 2. Admission number prefix matching
  const admissionNumber = (profile.admissionNumber || '').trim().toUpperCase();
  if (admissionNumber.length >= 5) {
    const prefix5 = admissionNumber.substring(0, 5); // e.g. "2026B"
    const messId = ADMISSION_PREFIX_TO_MESS[prefix5];
    if (messId && MESS_CONFIG[messId]) {
      return MESS_CONFIG[messId];
    }
  }

  // 3. Safe fallback — never silently assign wrong mess
  return MESS_CONFIG[DEFAULT_MESS_ID];
};

// ── Backward-compatibility alias ──────────────────────────────────────────
/**
 * @deprecated Use getMessForStudent() instead.
 * Kept for backward-compatibility with components that imported resolveMenuGroup.
 */
export const resolveMenuGroup = getMessForStudent;

// ── Utility helpers ───────────────────────────────────────────────────────
/**
 * Returns all mess options as an array (for dropdowns, selectors).
 */
export const getMessOptions = () => Object.values(MESS_CONFIG);

/**
 * @deprecated Use getMessOptions() instead.
 */
export const getMenuGroupOptions = getMessOptions;

/**
 * Returns MESS_CONFIG entry by messId, or default.
 */
export const getMessById = (messId) => MESS_CONFIG[messId] || MESS_CONFIG[DEFAULT_MESS_ID];

/**
 * Routing lookup table for tests and external consumers.
 */
export const ROUTING_TABLE = [
  { prefix: '2026B', messId: 'boys_junior', label: 'Boys Junior' },
  { prefix: '2025B', messId: 'boys_junior', label: 'Boys Junior' },
  { prefix: '2024B', messId: 'boys_senior', label: 'Boys Senior' },
  { prefix: '2023B', messId: 'boys_senior', label: 'Boys Senior' },
];

// Keep old MENU_GROUP_CONFIG shape for any components that destructure it
export const MENU_GROUP_CONFIG = {
  juniorStudents: MESS_CONFIG.boys_junior,
  seniorStudents: MESS_CONFIG.boys_senior,
  girlsHostel: MESS_CONFIG.girls,
};
