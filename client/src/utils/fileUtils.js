/**
 * Downloads a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The name of the file to download
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Gets the file extension from a filename
 * @param {string} filename - The filename to get the extension from
 * @returns {string} The file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - The size in bytes
 * @param {number} decimals - The number of decimal places to show
 * @returns {string} The formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Validates a file's type and size
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Object containing validation result and error message if any
 */
export const validateFile = (file, allowedTypes, maxSize) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type' };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(maxSize)}`,
    };
  }

  return { isValid: true };
};

/**
 * Creates a preview URL for an image file
 * @param {File} file - The image file to create a preview for
 * @returns {Promise<string>} A promise that resolves to the preview URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a file to a base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} A promise that resolves to the base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

/**
 * Generates a unique filename
 * @param {string} originalName - The original filename
 * @param {string} newExtension - The new file extension
 * @returns {string} The new unique filename
 */
export const generateUniqueFilename = (originalName, newExtension) => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 8);
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
  return `${nameWithoutExt}-${timestamp}-${random}.${newExtension}`;
}; 