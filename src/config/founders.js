/**
 * Official MessMates Founding Team Configuration
 * 
 * Centralized data source for the About Us founder profiles.
 */
export const FOUNDERS = [
  {
    id: 'founder_parth',
    name: 'Parth Sharma',
    role: 'FOUNDER',
    year: '2nd Year',
    branch: 'AIML',
    college: 'ABES Engineering College',
    photo: '/founders/parth_sharma.jpg',
    objectPosition: '50% 48%', // Centers on Parth's face and upper torso
    linkedin: 'https://www.linkedin.com/in/parth-sharma101004',
    bio: 'Leading product architecture, user experience design, and college mess pilot execution.'
  },
  {
    id: 'founder_shivendra',
    name: 'Shivendra Pratap Singh',
    role: 'CO-FOUNDER',
    year: '2nd Year',
    branch: 'CSE',
    college: 'ABES Engineering College',
    photo: '/founders/shivendra_pratap_singh.jpg',
    objectPosition: '50% 15%', // Centers on Shivendra's portrait
    linkedin: 'https://www.linkedin.com/in/shivendra-pratap-singh-7358b837',
    bio: 'Leading full-stack engineering, real-time database sync, and high-reliability systems.'
  }
];

export const getFounders = () => FOUNDERS;
