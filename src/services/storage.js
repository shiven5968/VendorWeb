import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase.js';
import { trackEvent, captureException } from './observability.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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
 * Uploads a real meal image file to Firebase Storage.
 * Generates unique path under meal-images/{mealId}/{timestamp}_{safeFileName}
 * Returns the public HTTPS download URL to be stored in Firestore meals/{mealId}.image.
 * 
 * @param {File} file - Browser File object selected by Mess Committee or Warden
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

  try {
    const storageRef = ref(storage, storagePath);

    // 2. Upload file with content type metadata
    const metadata = {
      contentType: file.type || `image/${cleanExt}`,
      customMetadata: {
        mealId: sanitizedMealId,
        originalName: file.name || 'image',
        uploadedAt: new Date().toISOString()
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);

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
    console.error('[Firebase Storage Upload Error]:', err);
    
    captureException(err, {
      operation: 'uploadMealImage',
      mealId: sanitizedMealId,
      storagePath
    });

    trackEvent('meal_image_upload_failed', {
      mealId: sanitizedMealId,
      errorMessage: err.message
    });

    const isPermission = (err.code === 'storage/unauthorized' || (err.message && err.message.toLowerCase().includes('permission')));
    if (isPermission) {
      throw new Error('You do not have permission to upload meal images. Please verify your staff credentials.');
    }

    throw new Error(err.message || 'Image upload failed. Please check your connection and try again.');
  }
};
