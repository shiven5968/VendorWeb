/**
 * Official MessMates Founding Team Configuration
 * 
 * Centralized data source for the About Us founder profiles.
 */
export const FOUNDERS = [
  {
    id: 'founder_parth',
    name: 'Parth Sharma',
    role: 'FOUNDER & PRODUCT ARCHITECT',
    tagline: 'Product Vision, User Experience & Campus Dining Innovation',
    year: '2nd Year',
    branch: 'AIML',
    college: 'ABES Engineering College',
    photo: '/founders/parth_sharma.jpg',
    avatar: '/founders/parth_avatar_4k.jpg',
    scale: 1.0,
    transformOrigin: '50% 30%',
    objectPosition: '50% 20%',
    linkedin: 'https://www.linkedin.com/in/parth-sharma101004/',
    bio: 'Conceived MessMates to eliminate the daily guesswork from hostel dining. Passionate about applying modern software and intuitive design to empower hostellers with verified meal nutrition, live feedback, and real transparency.',
    highlights: [
      'Product Strategy & UI/UX Architecture',
      '5,000+ Hostellers Empowered',
      'AIML Department • ABES EC'
    ]
  },
  {
    id: 'founder_shivendra',
    name: 'Shivendra Pratap Singh',
    role: 'CO-FOUNDER & TECH LEAD',
    tagline: 'Full-Stack Architecture, Cloud Sync & Systems Engineering',
    year: '2nd Year',
    branch: 'CSE',
    college: 'ABES Engineering College',
    photo: '/founders/shivendra_pratap_singh.jpg',
    avatar: '/founders/shivendra_avatar_4k.jpg',
    scale: 1.0,
    transformOrigin: '50% 30%',
    objectPosition: '50% 20%',
    linkedin: 'https://www.linkedin.com/in/shivendra-pratap-singh-7358b8378/',
    bio: 'Architect behind MessMates real-time database architecture and high-reliability synchronization. Dedicated to crafting resilient, offline-capable digital platforms that keep campus meal schedules, ratings, and rewards live 24/7.',
    highlights: [
      'Full-Stack Cloud Architecture',
      'Real-Time Database Synchronization',
      'CSE Department • ABES EC'
    ]
  }
];

export const getFounders = () => FOUNDERS;
