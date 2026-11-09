/**
 * MessMates — Institutional Registry
 *
 * Provides centralized configuration for multi-college dining intelligence.
 * All institutions are registered with strict status gating ('active', 'pilot', 'pending', 'disabled').
 * Only 'active' and 'pilot' institutions are permitted to initiate campus authentication.
 */

export const INSTITUTION_STATUSES = {
  ACTIVE: 'active',
  PILOT: 'pilot',
  PENDING: 'pending',
  DISABLED: 'disabled'
};

export const INSTITUTIONS = [
  {
    id: 'abes_ec',
    name: 'ABES Engineering College',
    shortName: 'ABES EC',
    aliases: ['abes', 'abesec', 'abes ec', 'abes engineering college', 'aktu abes', 'ghaziabad engineering'],
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    country: 'India',
    pincode: '201009',
    campusType: 'Engineering & Technology Campus',
    status: 'active', // Active partner campus with live mess menu & auth
    statusBadge: 'Active Campus',
    badgeVariant: 'active', // 'active' | 'pilot' | 'pending' | 'disabled'
    emailDomains: ['abes.ac.in'],
    primaryEmailDomain: '@abes.ac.in',
    admissionNumberLabel: 'Admission Number',
    admissionNumberPlaceholder: 'e.g. 2025B0101001 or 2400320100001',
    admissionHelpText: 'Your official ABES student admission number (13 digits or 2025B/2026B prefix)',
    hostelBlocks: [
      'DNB Block',
      'VKB Block',
      'RKB Block',
      'GH Block',
      'Day Scholar'
    ],
    defaultHostelBlock: 'DNB Block',
    caterers: [
      { id: 'naina', name: 'Naina Caters', messType: 'boys_junior', label: 'Boys Junior Mess' },
      { id: 'star', name: 'Star Caterers', messType: 'boys_senior', label: 'Boys Senior Mess' },
      { id: 'abes_girls', name: 'ABES EC & ABES BS', messType: 'girls', label: 'Girls Hostel Mess' }
    ],
    rolesAllowed: ['student', 'committee', 'warden'],
    officialsPortalLabel: 'ABES Officials',
    committeePortalLabel: 'Mess Committee',
    supportEmail: 'messmates.tech@gmail.com',
    authType: 'firebase_with_brevo_otp',
    tagline: 'Campus dining made intelligent, transparent, and simple.'
  },
  {
    id: 'mmmut',
    name: 'Madan Mohan Malaviya University of Technology',
    shortName: 'MMMUT',
    aliases: ['mmmut', 'mmm', 'gorakhpur engineering', 'malaviya', 'mmec', 'mmmut gorakhpur'],
    city: 'Gorakhpur',
    state: 'Uttar Pradesh',
    country: 'India',
    pincode: '273010',
    campusType: 'State Technical University',
    status: 'pending',
    statusBadge: 'Waitlist Open',
    badgeVariant: 'pending',
    emailDomains: ['mmmut.ac.in'],
    primaryEmailDomain: '@mmmut.ac.in',
    admissionNumberLabel: 'Roll Number / Reg No.',
    admissionNumberPlaceholder: 'e.g. 2024011001',
    admissionHelpText: 'University examination roll number',
    hostelBlocks: ['Subhash Bhawan', 'Raman Bhawan', 'Tagore Bhawan', 'Sarojini Bhawan'],
    defaultHostelBlock: 'Subhash Bhawan',
    caterers: [],
    rolesAllowed: ['student'],
    officialsPortalLabel: 'MMMUT Officials',
    committeePortalLabel: 'Student Mess Council',
    supportEmail: 'messmates.tech@gmail.com',
    authType: 'standard_email',
    tagline: 'Student dining intelligence coming soon to MMMUT Gorakhpur.',
    onboardingMessage: 'MessMates is currently rolling out student meal tracking and dining intelligence across Uttar Pradesh universities. Active dining access is in onboarding verification for MMMUT. Join the campus waitlist or invite your hostel mess committee to activate.'
  },
  {
    id: 'prsu',
    name: 'Prof. Rajendra Singh (Rajju Bhaiya) University',
    shortName: 'PRSU / Rajju Bhaiya University',
    aliases: ['prsu', 'rajju bhaiya', 'rajju bhaiya university', 'allahabad state university', 'prsu prayagraj'],
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    country: 'India',
    pincode: '211013',
    campusType: 'State University',
    status: 'pending',
    statusBadge: 'Waitlist Open',
    badgeVariant: 'pending',
    emailDomains: ['prsu.ac.in'],
    primaryEmailDomain: '@prsu.ac.in',
    admissionNumberLabel: 'Enrollment Number',
    admissionNumberPlaceholder: 'e.g. PRSU2024001',
    admissionHelpText: 'Your official university enrollment number',
    hostelBlocks: ['University Boys Hostel', 'University Girls Hostel'],
    defaultHostelBlock: 'University Boys Hostel',
    caterers: [],
    rolesAllowed: ['student'],
    officialsPortalLabel: 'University Officials',
    committeePortalLabel: 'Mess Committee',
    supportEmail: 'messmates.tech@gmail.com',
    authType: 'standard_email',
    tagline: 'Transparent student dining coming soon to Rajju Bhaiya University.',
    onboardingMessage: 'Campus Onboarding in Progress. University dining review and nutritional tracking are currently undergoing administrative authorization.'
  },
  {
    id: 'iit_delhi',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
    aliases: ['iitd', 'iit delhi', 'indian institute of technology delhi', 'hauz khas'],
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110016',
    campusType: 'Institute of National Importance',
    status: 'pending',
    statusBadge: 'Waitlist Open',
    badgeVariant: 'pending',
    emailDomains: ['iitd.ac.in'],
    primaryEmailDomain: '@iitd.ac.in',
    admissionNumberLabel: 'Entry Number',
    admissionNumberPlaceholder: 'e.g. 2024CS10001',
    admissionHelpText: 'IITD Entry Number',
    hostelBlocks: ['Kumaon', 'Nilgiri', 'Aravali', 'Karakoram', 'Jwalamukhi', 'Himadri', 'Kailash'],
    defaultHostelBlock: 'Kumaon',
    caterers: [],
    rolesAllowed: ['student'],
    officialsPortalLabel: 'Hostel Coordinating Committee',
    committeePortalLabel: 'Mess Committee (BRCA/BSW)',
    supportEmail: 'messmates.tech@gmail.com',
    authType: 'standard_email',
    tagline: 'Intelligent hostel nutrition and dining management.',
    onboardingMessage: 'IIT Delhi campus waitlist is open. Active student dining integration will be launched in partnership with hostel mess secretaries.'
  },
  {
    id: 'bits_pilani',
    name: 'Birla Institute of Technology and Science, Pilani',
    shortName: 'BITS Pilani',
    aliases: ['bits', 'bits pilani', 'pilani', 'birlainstitute'],
    city: 'Pilani',
    state: 'Rajasthan',
    country: 'India',
    pincode: '333031',
    campusType: 'Deemed University',
    status: 'pending',
    statusBadge: 'Waitlist Open',
    badgeVariant: 'pending',
    emailDomains: ['pilani.bits-pilani.ac.in'],
    primaryEmailDomain: '@pilani.bits-pilani.ac.in',
    admissionNumberLabel: 'BITS ID',
    admissionNumberPlaceholder: 'e.g. 2024A7PS0001P',
    admissionHelpText: 'Official BITS Campus Identification Number',
    hostelBlocks: ['Ram Bhawan', 'Budh Bhawan', 'Krishna Bhawan', 'Meera Bhawan', 'Malaviya Bhawan'],
    defaultHostelBlock: 'Ram Bhawan',
    caterers: [],
    rolesAllowed: ['student'],
    officialsPortalLabel: 'SSMS / Student Welfare',
    committeePortalLabel: 'Mess Advisory Council',
    supportEmail: 'messmates.tech@gmail.com',
    authType: 'standard_email',
    tagline: 'Student mess management and high-protein nutrition tracking.',
    onboardingMessage: 'BITS Pilani dining access is currently pending campus mess committee integration.'
  }
];

export const DEFAULT_INSTITUTION_ID = 'abes_ec';

/**
 * Retrieve institution by its canonical ID
 */
export function getInstitutionById(id) {
  if (!id) return null;
  const clean = String(id).trim().toLowerCase();
  return INSTITUTIONS.find(inst => inst.id.toLowerCase() === clean) || null;
}

/**
 * Filter institutions based on student search input (Name, Short Name, City, State, or Aliases)
 */
export function searchInstitutions(queryStr = '') {
  const clean = (queryStr || '').trim().toLowerCase();
  if (!clean) return INSTITUTIONS;

  return INSTITUTIONS.filter(inst => {
    const nameMatch = inst.name.toLowerCase().includes(clean);
    const shortMatch = inst.shortName.toLowerCase().includes(clean);
    const cityMatch = inst.city.toLowerCase().includes(clean);
    const stateMatch = inst.state.toLowerCase().includes(clean);
    const aliasMatch = (inst.aliases || []).some(a => a.toLowerCase().includes(clean));

    return nameMatch || shortMatch || cityMatch || stateMatch || aliasMatch;
  });
}

/**
 * Check if an institution is active/pilot (approved for real student login)
 */
export function isInstitutionActive(instOrId) {
  const inst = typeof instOrId === 'string' ? getInstitutionById(instOrId) : instOrId;
  return Boolean(inst && (inst.status === 'active' || inst.status === 'pilot'));
}

/**
 * Get the default active institution (ABES Engineering College)
 */
export function getDefaultInstitution() {
  return getInstitutionById(DEFAULT_INSTITUTION_ID) || INSTITUTIONS[0];
}
