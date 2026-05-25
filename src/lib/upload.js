import { supabase } from './supabase';

/**
 * Uploads a file directly to Supabase storage.
 * @param {File} file The file to upload
 * @param {string} bucket The storage bucket
 * @param {string} folder The folder inside the bucket
 * @returns {Promise<string>} The public URL
 */
export const uploadImage = async (file, bucket = 'brand-assets', folder = 'products') => {
  if (!file) throw new Error('No file provided');

  // Preserve the file extension
  let fileExt = file.name.split('.').pop();
  // If we are passing a blob that was compressed, it might not have a name, default to webp
  if (!fileExt || fileExt === file.name) {
      if (file.type === 'image/webp') fileExt = 'webp';
      else if (file.type === 'image/jpeg') fileExt = 'jpeg';
      else if (file.type === 'image/png') fileExt = 'png';
      else fileExt = 'webp'; // fallback
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type // Ensure proper content type
    });

  if (error) {
    console.error('Supabase Upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Helper to get optimized URLs.
 * Since we no longer use Cloudinary, this simply returns the raw URL.
 * Supabase handles our image delivery and resizing perfectly.
 * @param {string} url Original URL 
 * @param {string} transformations (ignored)
 * @returns {string} URL
 */
export const getOptimizedImageUrl = (url, transformations = '') => {
  return url;
};
