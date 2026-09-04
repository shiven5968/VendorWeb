import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db as firestoreDb, storage, isFirebaseConfigured } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { getCollegeDateString } from '../utils/dateTime.js';
import { compressImage } from '../utils/imageCompressor.js';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const UPLOAD_TIMEOUT_MS = 60000; // 60-second watchdog for mobile resilience

const uploadPhotoWithTimeout = async (file, path) => {
  if (!isFirebaseConfigured || !storage) throw new Error("Firebase Storage is not configured");
  const storageRef = ref(storage, path);
  const metadata = { contentType: file.type || 'image/jpeg' };
  
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    let timeoutTimer = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error('Upload timed out. Please check your network connection and try again.'));
    }, UPLOAD_TIMEOUT_MS);

    uploadTask.on(
      'state_changed',
      () => {},
      (error) => {
        clearTimeout(timeoutTimer);
        reject(error);
      },
      async () => {
        clearTimeout(timeoutTimer);
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

export const saveMessPhoto = async ({ date, mealCategory, photoCategory, uploadedBy, uploadedByName, notes, files }) => {
  if (!isFirebaseConfigured) {
    throw new Error('Database service is not configured. Please check your environment.');
  }
  const targetDate = date || getCollegeDateString();
  
  try {
    const urls = [];
    for (const rawFile of files) {
      if (rawFile.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File ${rawFile.name} exceeds 10MB limit.`);
      }

      // 1. Client-side compression (1200px max dimension, ~500KB target, JPEG/WEBP)
      let fileToUpload = rawFile;
      try {
        fileToUpload = await compressImage(rawFile, { maxDimension: 1200, targetMaxBytes: 500 * 1024 });
      } catch (compErr) {
        console.warn('[saveMessPhoto] Client compression warning:', compErr.message);
      }

      const timestamp = Date.now();
      const safeName = fileToUpload.name ? fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'photo.jpg';
      const storagePath = `mess-photos/${targetDate}/${timestamp}_${safeName}`;
      
      // 2. Upload to native Firebase Storage - NO silent inline data-URL fallback!
      try {
        const downloadUrl = await uploadPhotoWithTimeout(fileToUpload, storagePath);
        urls.push(downloadUrl);
      } catch (storageErr) {
        console.error('[saveMessPhoto] Cloud Storage upload error:', storageErr);
        throw new Error('Photo upload service is currently unavailable. Please check your connection or contact support.');
      }
    }
    
    const photoData = {
      date: targetDate,
      mealCategory,
      photoCategory,
      uploadedBy,
      uploadedByName,
      notes: notes || '',
      urls,
      status: 'published',
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(firestoreDb, 'mess_photos'), photoData);
    return { id: docRef.id, ...photoData };
  } catch (err) {
    console.error('Failed to save mess photo:', err);
    throw new Error(err.message || 'Failed to save mess photo.');
  }
};

export const saveHygieneCheck = async ({ date, submittedBy, submittedByName, items, overallStatus, notes }) => {
  if (!isFirebaseConfigured) return null;
  const targetDate = date || getCollegeDateString();
  
  try {
    const checkData = {
      date: targetDate,
      submittedBy,
      submittedByName,
      items,
      overallStatus,
      notes: notes || '',
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(firestoreDb, 'hygiene_checks'), checkData);
    return { id: docRef.id, ...checkData };
  } catch (err) {
    console.error('Failed to save hygiene check:', err);
    throw new Error(err.message || 'Failed to save hygiene check.');
  }
};

export const getMessPhotos = async (date) => {
  if (!isFirebaseConfigured) return [];
  
  try {
    const q = query(
      collection(firestoreDb, 'mess_photos'),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Failed to fetch mess photos:', err);
    return [];
  }
};

export const getHygieneChecks = async (date) => {
  if (!isFirebaseConfigured) return [];
  
  try {
    const q = query(
      collection(firestoreDb, 'hygiene_checks'),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Failed to fetch hygiene checks:', err);
    return [];
  }
};
