import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'messmates-f69a3';

let adminDb = null;

export function getFirebaseAdminDb() {
  if (adminDb) return adminDb;

  const hasCredentials = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  if (!hasCredentials) return null;

  const existingApps = getAdminApps();
  let adminApp = existingApps.length > 0 ? existingApps[0] : null;

  if (!adminApp) {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        let serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = initAdminApp({
          credential: cert(serviceAccount),
          projectId: PROJECT_ID
        });
      } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        adminApp = initAdminApp({
          credential: cert({
            projectId: PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          }),
          projectId: PROJECT_ID
        });
      }
    } catch (err) {
      console.warn('[Firebase Admin Init Notice]:', err.message);
      return null;
    }
  }

  if (adminApp) {
    try {
      adminDb = getAdminFirestore(adminApp);
    } catch (e) {
      adminDb = null;
    }
  }

  return adminDb;
}
