import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates meal image file type and size.
 */
export const validateMealImage = (file) => {
  if (!file) {
    throw new Error('No image file selected.');
  }

  const fileType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();
  const isValidType = ALLOWED_IMAGE_TYPES.includes(fileType) || 
                      /\.(jpg|jpeg|png|webp)$/i.test(fileName);

  if (!isValidType) {
    throw new Error('Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`Image size (${sizeInMB} MB) exceeds maximum allowed size of 5 MB.`);
  }

  return true;
};

/**
 * Uploads a real meal image file to Firebase Storage.
 * Returns the public download URL to be stored in Firestore meals/{mealId}.image.
 * 
 * @param {File} file - Browser File object selected by Mess Committee
 * @param {string} mealId - ID of the meal document
 * @returns {Promise<{ success: boolean, downloadUrl: string, path: string }>}
 */
export const uploadMealImage = async (file, mealId = 'dish') => {
  // 1. Validate file constraints
  validateMealImage(file);

  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage is not configured. Please verify your connection.');
  }

  try {
    // 2. Generate clean storage path
    const extension = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
    const timestamp = Date.now();
    const sanitizedMealId = String(mealId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `meals/${sanitizedMealId}_${timestamp}.${cleanExt}`;

    const storageRef = ref(storage, storagePath);

    // 3. Upload file with content type metadata
    const metadata = {
      contentType: file.type || `image/${cleanExt}`,
      customMetadata: {
        mealId: String(mealId),
        uploadedAt: new Date().toISOString()
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);

    // 4. Retrieve permanent download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      downloadUrl,
      path: storagePath
    };
  } catch (err) {
    console.error('[Firebase Storage Upload Error]:', err);
    throw new Error(err.message || 'Failed to upload meal image to Firebase Storage.');
  }
};
