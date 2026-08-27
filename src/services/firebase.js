import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Check if environment variables are populated with real keys
export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes('Placeholder') &&
  !apiKey.includes('your-api-key') &&
  !apiKey.includes('your-') &&
  apiKey.trim().length > 15
);

// Firebase configuration from environment variables with intelligent fallbacks
const firebaseConfig = {
  apiKey: apiKey || 'AIzaSyDemoPlaceholderApiKeyForBuildValidationOnly',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : 'messmates-abes.firebaseapp.com'),
  projectId: projectId || 'messmates-abes',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.firebasestorage.app` : 'messmates-abes.firebasestorage.app'),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456'
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
