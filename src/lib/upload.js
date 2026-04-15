import { supabase } from './supabase';

/**
 * Uploads a file to Supabase storage and returns the public URL.
 * @param {File} file The file to upload
 * @param {string} bucket The bucket name (e.g., 'brand-assets')
 * @param {string} folder Optional folder path inside the bucket
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFile = async (file, bucket = 'brand-assets', folder = '') => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Create a unique file name to prevent collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    // If bucket doesn't exist, this might fail. 
    // Usually, you should create the bucket in the Supabase dashboard first.
    console.error('Upload error:', error);
    throw error;
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};
