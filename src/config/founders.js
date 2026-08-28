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
    scale: 1.05,
    transformOrigin: '50% 25%',
    objectPosition: '50% 20%',
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
    scale: 1.05,
    transformOrigin: '50% 25%',
    objectPosition: '50% 15%',
    linkedin: 'https://www.linkedin.com/in/shivendra-pratap-singh-7358b837',
    bio: 'Leading full-stack engineering, real-time database sync, and high-reliability systems.'
  }
];

export const getFounders = () => FOUNDERS;
