/**
 * MessMates — Client-Side Image Compression Utility
 *
 * Compresses images before upload to Firebase Storage:
 * - Max dimension (width or height): 1200px
 * - Max file size target: ~500KB
 * - Preserves aspect ratio
 * - Outputs optimized JPEG/WEBP Blob/File
 */

const MAX_DIMENSION = 1200;
const TARGET_MAX_BYTES = 500 * 1024; // 500 KB
const INITIAL_QUALITY = 0.82;

/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Returns the compressed File object. If compression fails or is run in
 * a non-browser environment, it safely falls back to the original file.
 *
 * @param {File} file - The image file to compress
 * @param {object} [options]
 * @param {number} [options.maxDimension=1200]
 * @param {number} [options.targetMaxBytes=512000]
 * @param {number} [options.quality=0.82]
 * @returns {Promise<File>} - The compressed File
 */
export const compressImage = async (file, options = {}) => {
  if (!file || typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  // Only compress raster images
  if (!file.type || !file.type.startsWith('image/') || file.type.includes('svg')) {
    return file;
  }

  const maxDim = options.maxDimension || MAX_DIMENSION;
  const targetBytes = options.targetMaxBytes || TARGET_MAX_BYTES;
  const initialQuality = options.quality || INITIAL_QUALITY;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        // Draw image onto canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob with quality reduction if necessary
        const mimeType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
        const fileExt = mimeType === 'image/webp' ? '.webp' : '.jpg';
        const fileName = file.name ? file.name.replace(/\.[^/.]+$/, '') + fileExt : `compressed${fileExt}`;

        const exportCanvas = (quality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }

              // If still larger than target and quality > 0.5, retry with lower quality
              if (blob.size > targetBytes && quality > 0.5) {
                exportCanvas(quality - 0.15);
                return;
              }

              const compressedFile = new File([blob], fileName, {
                type: mimeType,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            mimeType,
            quality
          );
        };

        exportCanvas(initialQuality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Batch compress an array of image files.
 *
 * @param {File[]} files
 * @param {object} [options]
 * @returns {Promise<File[]>}
 */
export const compressImages = async (files, options = {}) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return Promise.all(files.map((file) => compressImage(file, options)));
};
