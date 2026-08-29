import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase.js';
import { trackEvent, captureException } from './observability.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const UPLOAD_TIMEOUT_MS = 15000; // 15-second watchdog to prevent hanging

/**
 * Validates meal image file type and size.
 */
export const validateMealImage = (file) => {
  if (!file) {
    throw new Error('No image file selected. Please choose a valid photo.');
  }

  const fileType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();
  const isValidType = ALLOWED_IMAGE_TYPES.includes(fileType) || 
                      /\.(jpg|jpeg|png|webp)$/i.test(fileName);

  if (!isValidType) {
    throw new Error('Invalid image format. Please choose a JPG, PNG, or WEBP image under 5 MB.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`Image size (${sizeInMB} MB) exceeds maximum allowed size of 5 MB.`);
  }

  return true;
};

/**
 * Translates Firebase Storage errors into clear, actionable user messages.
 */
export const formatStorageError = (err) => {
  if (!err) return 'Image upload failed. Please try again.';

  const code = err.code || '';
  const msg = (err.message || '').toLowerCase();

  if (code === 'storage/unauthorized' || msg.includes('permission') || msg.includes('unauthorized')) {
    return 'You do not have permission to upload meal images. Please verify your staff login.';
  }

  if (code === 'storage/canceled' || msg.includes('canceled') || msg.includes('timeout') || msg.includes('too long')) {
    return 'Image upload is taking too long. Please check your connection and try again.';
  }

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/network-request-failed' || msg.includes('network')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }

  if (code === 'storage/quota-exceeded' || msg.includes('quota')) {
    return 'Firebase Storage quota exceeded. Please contact the system administrator.';
  }

  if (code === 'storage/unknown' || msg.includes('404') || msg.includes('not found') || msg.includes('bucket')) {
    return 'Firebase Storage service is unreachable or unprovisioned. Please verify Storage is enabled in Firebase Console.';
  }

  return err.message || 'Image upload failed. Please check your connection and try again.';
};

/**
 * Uploads a real meal image file to Firebase Storage with timeout protection.
 * Generates unique path under meal-images/{mealId}/{timestamp}_{safeFileName}
 * Returns the public HTTPS download URL to be stored in Firestore meals/{mealId}.image.
 * 
 * @param {File|Blob|Uint8Array} file - Browser File object selected by Mess Committee or Warden
 * @param {string} mealId - ID of the meal document
 * @returns {Promise<{ success: boolean, downloadUrl: string, path: string }>}
 */
export const uploadMealImage = async (file, mealId = 'dish') => {
  // 1. Validate file constraints
  validateMealImage(file);

  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage is not configured. Please check your cloud configuration.');
  }

  const sanitizedMealId = String(mealId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const extension = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  
  const rawFileName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase() : `dish_${timestamp}.${cleanExt}`;
  const safeFileName = rawFileName.endsWith(`.${cleanExt}`) ? rawFileName : `${rawFileName}.${cleanExt}`;
  
  // Canonical upload path: meal-images/{mealId}/{timestamp}_{safeFileName}
  const storagePath = `meal-images/${sanitizedMealId}/${timestamp}_${safeFileName}`;

  trackEvent('meal_image_upload_started', {
    mealId: sanitizedMealId,
    fileSize: file.size,
    fileType: file.type || `image/${cleanExt}`
  });

  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || `image/${cleanExt}`,
    customMetadata: {
      mealId: sanitizedMealId,
      originalName: file.name || 'image',
      uploadedAt: new Date().toISOString()
    }
  };

  // 2. Upload with uploadBytesResumable and a 15-second watchdog
  let uploadTask = null;
  let timeoutTimer = null;

  try {
    uploadTask = uploadBytesResumable(storageRef, file, metadata);

    const uploadPromise = new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        () => {}, // progress listener
        (error) => reject(error),
        () => resolve(uploadTask.snapshot)
      );
    });

    const timeoutPromise = new Promise((_, reject) => {
      timeoutTimer = setTimeout(() => {
        try {
          if (uploadTask && typeof uploadTask.cancel === 'function') {
            uploadTask.cancel();
          }
        } catch (e) {}
        reject(new Error('Image upload is taking too long. Please check your connection and try again.'));
      }, UPLOAD_TIMEOUT_MS);
    });

    const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
    clearTimeout(timeoutTimer);

    // 3. Retrieve permanent HTTPS download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    trackEvent('meal_image_upload_success', {
      mealId: sanitizedMealId,
      storagePath
    });

    return {
      success: true,
      downloadUrl,
      path: storagePath
    };
  } catch (err) {
    if (timeoutTimer) clearTimeout(timeoutTimer);

    console.error('[Firebase Storage Upload Error]:', err);
    
    captureException(err, {
      operation: 'uploadMealImage',
      mealId: sanitizedMealId,
      storagePath,
      code: err.code || 'UNKNOWN'
    });

    trackEvent('meal_image_upload_failed', {
      mealId: sanitizedMealId,
      errorCode: err.code || 'UNKNOWN',
      errorMessage: err.message
    });

    throw new Error(formatStorageError(err));
  }
};
