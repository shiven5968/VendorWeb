/**
 * MessMates — Centralized Mess Configuration & Routing
 *
 * Canonical mess identifiers:
 *   boys_junior  → Boys Junior Mess  (I Year & II Year — Naina Caters)
 *   boys_senior  → Boys Senior Mess  (III Year, IV Year, MBA & MCA — Star Caterers)
 *   girls        → Girls Hostel Mess (Session 2026-27 — ABES EC & ABES BS)
 *
 * ABSOLUTE ROUTING RULES:
 *   1. Hostel block is the primary source of truth for Girls vs Boys.
 *   2. ONLY A Block, B Block, C Block (normalized) resolve to Girls.
 *   3. EVERY OTHER non-empty hostel block (DNB, VKB, RKB, ABB, D, E, F, etc.) is BOYS.
 *   4. For BOYS:
 *        2025B* / 2026B* → boys_junior
 *        2023B* / 2024B* → boys_senior
 *        other / unknown → null (unresolved / Mess Allocation Pending)
 *   5. Missing / empty hostelBlock → null (unresolved / Mess Allocation Pending)
 *   6. Gender is NEVER used as a routing override.
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

// ── ADMISSION PREFIX → MESS ROUTING MAP (FOR BOYS) ───────────────────────
export const ADMISSION_PREFIX_TO_MESS = {
  '2026B': 'boys_junior',
  '2025B': 'boys_junior',
  '2024B': 'boys_senior',
  '2023B': 'boys_senior',
};

/**
 * Normalizes a hostel block string and checks whether it represents
 * exclusively Girls Hostel Block A, B, or C.
 *
 * Allowed Girls Blocks (case/spacing normalized):
 *   - "A", "A Block", "Block A", "Block A (Girls)", "a block", "a"
 *   - "B", "B Block", "Block B", "Block B (Girls)", "b block", "b"
 *   - "C", "C Block", "Block C", "Block C (Girls)", "c block", "c"
 *
 * ANY OTHER HOSTEL BLOCK (e.g. DNB, VKB, RKB, ABB, D, E, F, G, H)
 * RETURNS FALSE AND IS TREATED AS BOYS.
 * Missing/empty string returns false.
 *
 * @param {string} rawBlock
 * @returns {boolean}
 */
export const isGirlsHostelBlock = (rawBlock) => {
  if (!rawBlock || typeof rawBlock !== 'string') return false;

  // 1. Strip "(Girls)" / "girls" annotation if present
  let clean = rawBlock.replace(/\(girls\)/gi, '').replace(/\bgirls\b/gi, '').trim();

  // 2. Normalize hyphens, underscores, and collapse multiple spaces
  clean = clean.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();

  // 3. Strictly match A, B, or C Block patterns:
  const isA = /^a$/i.test(clean) || /^a\s+block$/i.test(clean) || /^block\s+a$/i.test(clean);
  const isB = /^b$/i.test(clean) || /^b\s+block$/i.test(clean) || /^block\s+b$/i.test(clean);
  const isC = /^c$/i.test(clean) || /^c\s+block$/i.test(clean) || /^block\s+c$/i.test(clean);

  return isA || isB || isC;
};

/**
 * Resolve a student's mess from their profile.
 *
 * ABSOLUTE PRECEDENCE:
 *   STEP 1: Read student's hostelBlock / block allocation.
 *   STEP 2: Normalize hostel block.
 *   STEP 3:
 *     IF block is A/B/C:
 *         mess = girls
 *     ELSE IF block is known/non-empty:
 *         student is BOYS
 *         THEN use admission prefix:
 *             2025B / 2026B -> boys_junior
 *             2023B / 2024B -> boys_senior
 *             other prefix  -> null (unresolved / Mess Allocation Pending)
 *     ELSE:
 *         unresolved / Mess Allocation Pending (null)
 *
 * @param {object} profile - Firestore user profile
 * @returns {object|null} - MESS_CONFIG entry, or null if unresolved
 */
export const getMessForStudent = (profile) => {
  if (!profile) return null;

  // STEP 1 & 2: Read and normalize student's hostelBlock allocation
  const rawBlock = typeof profile.hostelBlock === 'string' ? profile.hostelBlock.trim()
    : (typeof profile.block === 'string' ? profile.block.trim() : '');

  // Missing or empty hostel block -> unresolved / Mess Allocation Pending
  // (NEVER fallback to Girls or random Boys mess)
  if (!rawBlock) {
    return null;
  }

  // STEP 3: IF block is A/B/C -> girls
  if (isGirlsHostelBlock(rawBlock)) {
    return MESS_CONFIG.girls;
  }

  // ELSE: Any other valid/known non-empty hostel block is established as BOYS.
  // Then use admission number prefix to route to Junior or Senior:
  let admissionNumber = (profile.admissionNumber || '').trim().toUpperCase();

  // If admissionNumber is missing, attempt extraction from student institutional email
  if (!admissionNumber && typeof profile.email === 'string') {
    const emailMatch = profile.email.match(/(20[2-3][0-9]B|[2-3][0-9]B)\w*/i);
    if (emailMatch) {
      admissionNumber = emailMatch[0].toUpperCase();
    }
  }

  if (admissionNumber) {
    // Normalize 2-digit batch prefix to 4 digits (e.g. "25B..." -> "2025B...")
    let normalized = admissionNumber;
    if (/^[2-3][0-9]B/i.test(normalized)) {
      normalized = '20' + normalized;
    }

    if (normalized.length >= 5) {
      const prefix5 = normalized.substring(0, 5); // e.g. "2025B", "2026B", "2024B", "2023B"
      if (prefix5 === '2025B' || prefix5 === '2026B') {
        return MESS_CONFIG.boys_junior;
      }
      if (prefix5 === '2023B' || prefix5 === '2024B') {
        return MESS_CONFIG.boys_senior;
      }
    }
  }

  // Known Boys hostel block but unknown / unlisted admission prefix -> unresolved / null
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
