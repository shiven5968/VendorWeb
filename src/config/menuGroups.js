/**
 * MessMates — Configurable Menu Group Architecture
 * 
 * Menu groups define which student population gets which menu.
 * This is configurable — new groups can be added without modifying
 * component logic. In future, this can be fetched from Firestore
 * menu_groups collection.
 *
 * Current ABES deployment:
 *   Junior Students (1st + 2nd Year) → default menu
 *   Senior Students (3rd + 4th Year) → default menu (same for now, configurable)
 *   Girls Hostel → girls menu (when available)
 */

export const MENU_GROUP_CONFIG = {
  juniorStudents: {
    id: 'juniorStudents',
    label: 'Junior Students',
    shortLabel: 'Junior',
    years: [1, 2],
    hostelTypes: null,
    menuId: 'default',
    description: '1st & 2nd Year',
    color: 'emerald',
    icon: 'GraduationCap'
  },
  seniorStudents: {
    id: 'seniorStudents',
    label: 'Senior Students',
    shortLabel: 'Senior',
    years: [3, 4],
    hostelTypes: null,
    menuId: 'default',
    description: '3rd & 4th Year',
    color: 'blue',
    icon: 'GraduationCap'
  },
  girlsHostel: {
    id: 'girlsHostel',
    label: 'Girls Hostel',
    shortLabel: 'Girls',
    years: null,
    hostelTypes: ['Block A (Girls)', 'Block B (Girls)', 'Block C (Girls)'],
    menuId: 'default',
    description: 'Girls Hostel',
    color: 'pink',
    icon: 'Home'
  }
};

/**
 * Resolves a student's menu group from their profile.
 * Falls back to juniorStudents if year/hostel cannot be determined.
 *
 * @param {object} profile - Firestore user profile
 * @returns {object} - menu group config object
 */
export const resolveMenuGroup = (profile) => {
  if (!profile) return MENU_GROUP_CONFIG.juniorStudents;

  // Check hostel type first (Girls Hostel takes priority)
  const hostelBlock = profile.hostelBlock || '';
  if (
    hostelBlock.toLowerCase().includes('girls') ||
    hostelBlock.toLowerCase().includes('block a') ||
    hostelBlock.toLowerCase().includes('block b') ||
    hostelBlock.toLowerCase().includes('block c')
  ) {
    return MENU_GROUP_CONFIG.girlsHostel;
  }

  // Try to resolve year from admission number
  // ABES admission numbers: 2025B01011362 → 2025 = join year
  const admissionNumber = profile.admissionNumber || '';
  const currentYear = new Date().getFullYear();
  let yearOfStudy = null;

  if (admissionNumber.length >= 4) {
    const joinYear = parseInt(admissionNumber.substring(0, 4), 10);
    if (!isNaN(joinYear)) {
      yearOfStudy = currentYear - joinYear + 1;
    }
  }

  // Fallback: check profile.year directly
  if (yearOfStudy === null && profile.year) {
    yearOfStudy = parseInt(profile.year, 10);
  }

  if (yearOfStudy !== null) {
    if (yearOfStudy >= 3) return MENU_GROUP_CONFIG.seniorStudents;
    return MENU_GROUP_CONFIG.juniorStudents;
  }

  return MENU_GROUP_CONFIG.juniorStudents;
};

/**
 * Returns all menu group options as an array (for dropdowns, selectors).
 */
export const getMenuGroupOptions = () => Object.values(MENU_GROUP_CONFIG);
