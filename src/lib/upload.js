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
 * Helper to get optimized Cloudinary URLs with custom transformations.
 * Kept to ensure legacy Cloudinary URLs already in the DB still load properly.
 * @param {string} url Original URL (Cloudinary or Supabase)
 * @param {string} transformations e.g. 'w_800,c_fill'
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, transformations = 'f_auto,q_auto') => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    const [baseUrl, rest] = parts;
    const segments = rest.split('/');
    
    // If the first segment is a transformation block (not a version like v123...)
    if (segments.length > 0 && !segments[0].match(/^v\d+$/)) {
      segments[0] = transformations; // Replace existing transformation
      return `${baseUrl}/upload/${segments.join('/')}`;
    }
    
    // Otherwise insert new transformations
    return `${baseUrl}/upload/${transformations}/${rest}`;
  } catch (e) {
    return url;
  }
};
