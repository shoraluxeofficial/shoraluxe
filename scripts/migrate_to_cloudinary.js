import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Config Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, ensure RLS allows updates or use service role if available
const supabase = createClient(supabaseUrl, supabaseKey);

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dfr0tlcdb',
  api_key: '646691683244414',
  api_secret: 'TH3uBM99wDHq1FWIC5N0m8qjiZ0', // Provided by user
  secure: true
});

async function migrateImages() {
  console.log('🚀 Starting image migration to Cloudinary...');

  // 1. Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }

  console.log(`📦 Found ${products.length} products to check.`);

  for (const product of products) {
    console.log(`\n🔍 Checking product: ${product.title} (ID: ${product.id})`);
    let needsUpdate = false;
    let newImg = product.img;
    let newGallery = product.gallery;

    // Check main image
    if (product.img && !product.img.includes('cloudinary.com')) {
      try {
        console.log(`📤 Uploading main image: ${product.img}`);
        const result = await cloudinary.uploader.upload(product.img, {
          folder: 'shoraluxe/products',
          use_filename: true,
          unique_filename: true
        });
        newImg = result.secure_url;
        needsUpdate = true;
        console.log(`✅ Main image migrated: ${newImg}`);
      } catch (err) {
        console.error(`❌ Failed to migrate main image for product ${product.id}:`, err.message);
      }
    }

    // Check gallery images
    if (product.gallery) {
      const galleryItems = Array.isArray(product.gallery) 
        ? product.gallery 
        : product.gallery.split('\n').filter(Boolean);
      
      const updatedGallery = [];
      let galleryChanged = false;

      for (const item of galleryItems) {
        if (item && !item.includes('cloudinary.com')) {
          try {
            console.log(`📤 Uploading gallery image: ${item}`);
            const result = await cloudinary.uploader.upload(item, {
              folder: 'shoraluxe/gallery',
              use_filename: true,
              unique_filename: true
            });
            updatedGallery.push(result.secure_url);
            galleryChanged = true;
            needsUpdate = true;
          } catch (err) {
            console.error(`❌ Failed to migrate gallery image ${item}:`, err.message);
            updatedGallery.push(item); // keep original if failed
          }
        } else {
          updatedGallery.push(item);
        }
      }

      if (galleryChanged) {
        newGallery = updatedGallery; // Store as array if database supports it, or join with \n
      }
    }

    // 2. Update product in Supabase if changed
    if (needsUpdate) {
      console.log(`💾 Saving updates for product ${product.id}...`);
      
      // Handle gallery format (ensure it matches DB expectation, usually text or jsonb)
      const updatePayload = {
        img: newImg,
        gallery: newGallery
      };

      const { error: updateError } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error updating product ${product.id}:`, updateError.message);
      } else {
        console.log(`✨ Product ${product.id} successfully updated with Cloudinary URLs.`);
      }
    } else {
      console.log(`⏭️ Product ${product.id} already uses Cloudinary or has no images.`);
    }
  }

  console.log('\n🏁 Migration finished!');
}

migrateImages();
