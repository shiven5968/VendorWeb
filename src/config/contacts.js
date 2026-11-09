/**
 * Official Campus Administration & Mess Committee Contacts
 * 
 * Centralized data source for student inquiries, grievances, and emergency contacts.
 */

export const OFFICIAL_CAMPUS_CONTACTS = {
  warden: {
    id: 'contact_warden',
    title: 'Chief Warden',
    name: 'Chief Warden Office',
    role: 'Hostel Administration & Student Welfare',
    email: 'messmates.tech@gmail.com',
    phone: null,
    location: 'Hostel Office, Campus Dining Hall 1',
    hours: '10:00 AM – 5:00 PM (Monday – Saturday)',
    responsibilities: 'Hostel governance, urgent disciplinary matters, dietary exemptions, and severe mess escalations.'
  },
  committee: {
    id: 'contact_committee',
    title: 'Mess Committee',
    name: 'Student Mess Committee',
    role: 'Mess Operations & Food Quality Supervision',
    email: 'messmates.tech@gmail.com',
    phone: null,
    location: 'Mess Committee Helpdesk, Campus Dining Hall 1',
    hours: 'Active during all meal service times (Breakfast, Lunch, Snacks, Dinner)',
    responsibilities: 'Daily menu execution, hygiene audits, dish replacement voting, and real-time student food feedback.'
  }
};

export const getOfficialContacts = () => {
  return OFFICIAL_CAMPUS_CONTACTS;
};

/**
 * Official MessMates Platform Support Contacts
 */
export const MESSMATES_SUPPORT_CONTACTS = {
  email: 'messmates.tech@gmail.com',
  phone1: '+91 9236581606',
  phone2: '+91 8920336768',
  phones: ['+91 9236581606', '+91 8920336768'],
  rawPhones: ['9236581606', '8920336768'],
  address: 'Empowering Student Dining & Nutrition Across Campus Hostels',
  campus: 'MessMates for Students',
  tagline: 'Know Your Meal Before You Eat It'
};
