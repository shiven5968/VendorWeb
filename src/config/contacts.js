/**
 * Official Campus Administration & Mess Committee Contacts
 * 
 * Centralized data source for student inquiries, grievances, and emergency contacts.
 * IMPORTANT: Only verified official college emails are listed. 
 * Phone numbers are left null if not provided in college database to avoid inventing numbers.
 */

export const OFFICIAL_CAMPUS_CONTACTS = {
  warden: {
    id: 'contact_warden',
    title: 'Chief Warden',
    name: 'Chief Warden Office',
    role: 'Hostel Administration & Student Welfare',
    email: 'warden@abes.ac.in',
    phone: null, // Official phone number not defined in database
    location: 'Hostel Office, Campus Dining Hall 1',
    hours: '10:00 AM – 5:00 PM (Monday – Saturday)',
    responsibilities: 'Hostel governance, urgent disciplinary matters, dietary exemptions, and severe mess escalations.'
  },
  committee: {
    id: 'contact_committee',
    title: 'Mess Committee',
    name: 'Student Mess Committee',
    role: 'Mess Operations & Food Quality Supervision',
    email: 'committee@abes.ac.in',
    phone: null, // Official phone number not defined in database
    location: 'Mess Committee Helpdesk, Campus Dining Hall 1',
    hours: 'Active during all meal service times (Breakfast, Lunch, Snacks, Dinner)',
    responsibilities: 'Daily menu execution, hygiene audits, dish replacement voting, and real-time student food feedback.'
  }
};

export const getOfficialContacts = () => {
  return OFFICIAL_CAMPUS_CONTACTS;
};
