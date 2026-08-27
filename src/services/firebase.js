import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyARw4CyvhbiItVCC4HiKvaR-N8a1nmi3JU';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'messmates-f69a3';

// Check if environment variables are populated with real keys
export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes('Placeholder') &&
  !apiKey.includes('your-api-key') &&
  apiKey.trim().length > 15
);

// Firebase configuration with live production fallback for cloud deployments (e.g. Vercel)
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'messmates-f69a3.firebaseapp.com',
  projectId: projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'messmates-f69a3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '39348747656',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:39348747656:web:8e5b4170ebb25ae2978e3d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-4EPLXE763Y'
};

// Initialize Firebase App singleton without duplicates
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable local persistence so session persists across refreshes & tabs
if (typeof window !== 'undefined') {
  try {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence notice:', err.message);
    });
  } catch (e) {
    // Silent fallback
  }
}

export default app;
