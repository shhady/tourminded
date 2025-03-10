import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary from the server side
 * @param {string} file - The file path or base64 encoded string
 * @param {string} folder - The folder to upload to
 * @returns {Promise<object>} - The upload result
 */
export const uploadImage = async (file, folder = 'tourminded') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<object>} - The deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Get a signed upload URL for client-side uploads
 * @param {string} folder - The folder to upload to
 * @param {object} options - Additional options
 * @returns {object} - The signed URL and other parameters
 */
export const getSignedUploadParams = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'tourminded',
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
};

export default cloudinary; 