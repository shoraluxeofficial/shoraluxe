import { supabase } from './supabase';

/**
 * Uploads a file to Cloudinary and returns the optimized secure URL.
 * @param {File} file The file to upload
 * @returns {Promise<string>} The optimized URL
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided');

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    
    // Return optimized URL by default: auto format, auto quality
    // We insert 'f_auto,q_auto' into the URL
    // For videos, this enables adaptive streaming/optimization
    return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

/**
 * Helper to get optimized Cloudinary URLs with custom transformations
 * @param {string} url Original Cloudinary URL
 * @param {string} transformations e.g. 'w_800,c_fill'
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, transformations = 'f_auto,q_auto') => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transformations}/`);
};

/**
 * Uploads a file to Supabase storage (Fallback/Legacy)
 */
export const uploadFile = async (file, bucket = 'brand-assets', folder = '') => {
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
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
