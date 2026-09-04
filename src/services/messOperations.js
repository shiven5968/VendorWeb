import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db as firestoreDb, storage, isFirebaseConfigured } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { getCollegeDateString } from '../utils/dateTime.js';
import { compressImage } from '../utils/imageCompressor.js';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const UPLOAD_TIMEOUT_MS = 60000; // 60-second watchdog for mobile resilience

const uploadPhoto = async (file, path, onProgress) => {
  if (!isFirebaseConfigured || !storage) throw new Error("Firebase Storage is not configured");
  const storageRef = ref(storage, path);
  const metadata = { contentType: file.type || 'image/jpeg' };
  
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress?.({
          stage: 'UPLOADING',
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes
        });
      },
      (error) => {
        let msg = error.message || 'Storage upload error';
        if (error.code === 'storage/bucket-not-found' || error.code === 'storage/unknown' || error.message?.includes('bucket')) {
          msg = 'Firebase Cloud Storage bucket is not provisioned for this project. Please activate Storage in Firebase Console.';
        } else if (error.code === 'storage/unauthorized') {
          msg = 'Permission denied. Only authorized Mess Committee members can upload photos.';
        } else if (error.code === 'storage/retry-limit-exceeded') {
          msg = 'Upload failed: Storage service unreachable or bucket not provisioned.';
        } else if (error.code === 'storage/canceled') {
          msg = 'Upload was cancelled.';
        }
        reject(new Error(msg));
      },
      async () => {
        onProgress?.({ stage: 'STORAGE_COMPLETE', progress: 100 });
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

export const saveMessPhoto = async ({ date, mealCategory, photoCategory, uploadedBy, uploadedByName, notes, files, onProgress }) => {
  if (!isFirebaseConfigured) {
    throw new Error('Database service is not configured. Please check your environment.');
  }
  const targetDate = date || getCollegeDateString();
  
  try {
    const urls = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const rawFile = files[i];
      if (rawFile.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File ${rawFile.name} exceeds 10MB limit.`);
      }

      // 1. Client-side compression (1200px max dimension, ~500KB target, JPEG/WEBP)
      onProgress?.({ stage: 'COMPRESSING', progress: 0, currentFile: i + 1, totalFiles });
      let fileToUpload = rawFile;
      try {
        fileToUpload = await compressImage(rawFile, { maxDimension: 1200, targetMaxBytes: 500 * 1024 });
      } catch (compErr) {
        console.warn('[saveMessPhoto] Client compression warning:', compErr.message);
      }

      const timestamp = Date.now();
      const safeName = fileToUpload.name ? fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'photo.jpg';
      const storagePath = `mess-photos/${targetDate}/${timestamp}_${safeName}`;
      
      // 2. Upload to native Firebase Storage with real progress
      const downloadUrl = await uploadPhoto(fileToUpload, storagePath, (progressData) => {
        onProgress?.({ ...progressData, currentFile: i + 1, totalFiles });
      });
      urls.push(downloadUrl);
    }
    
    // 3. Save metadata document to Firestore
    onProgress?.({ stage: 'SAVING_METADATA', progress: 100 });
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
    onProgress?.({ stage: 'COMPLETE', progress: 100 });
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
