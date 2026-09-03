/**
 * MessMates — Role Configuration
 * Maps Firestore role strings to UI labels, colors, and metadata.
 * The Firestore role strings are NEVER changed — only UI labels differ.
 */

export const ROLE_CONFIG = {
  student: {
    firestoreValue: 'student',
    label: 'Student',
    shortLabel: 'Student',
    description: 'Hostel Student',
    color: 'emerald',
    bgClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: 'GraduationCap',
    urlPrefix: '/student'
  },
  mess_committee: {
    firestoreValue: 'mess_committee',
    label: 'Mess Committee',
    shortLabel: 'Committee',
    description: 'Mess Operations Staff',
    color: 'purple',
    bgClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    icon: 'ChefHat',
    urlPrefix: '/committee'
  },
  warden: {
    firestoreValue: 'warden',
    label: 'ABES Officials',
    shortLabel: 'ABES Officials',
    description: 'Authorized ABES Officials',
    color: 'blue',
    bgClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: 'Shield',
    urlPrefix: '/warden'
  }
};

/**
 * Get role config by Firestore role string.
 * @param {string} role - 'student' | 'mess_committee' | 'warden'
 */
export const getRoleConfig = (role) => {
  return ROLE_CONFIG[role] || ROLE_CONFIG.student;
};

/**
 * Get UI label for a role.
 */
export const getRoleLabel = (role) => {
  return getRoleConfig(role).label;
};
