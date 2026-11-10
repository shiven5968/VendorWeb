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
    avatar: '/founders/parth_avatar_4k.jpg',
    scale: 1.0,
    transformOrigin: '50% 30%',
    objectPosition: '50% 20%',
    linkedin: 'https://www.linkedin.com/in/parth-sharma101004/'
  },
  {
    id: 'founder_shivendra',
    name: 'Shivendra Pratap Singh',
    role: 'CO-FOUNDER',
    year: '2nd Year',
    branch: 'CSE',
    college: 'ABES Engineering College',
    photo: '/founders/shivendra_pratap_singh.jpg',
    avatar: '/founders/shivendra_avatar_4k.jpg',
    scale: 1.0,
    transformOrigin: '50% 30%',
    objectPosition: '50% 20%',
    linkedin: 'https://www.linkedin.com/in/shivendra-pratap-singh-7358b8378/'
  }
];

export const getFounders = () => FOUNDERS;
