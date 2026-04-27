import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLargeFiles() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) return console.error(error);

  console.log('--- FILES ABOVE 10MB (STILL ON SUPABASE) ---');
  products.forEach(p => {
    if (p.img && !p.img.includes('cloudinary.com')) {
      console.log(`Product: ${p.title} (ID: ${p.id})`);
      console.log(`Main Image: ${p.img}`);
    }
    if (p.gallery) {
      const items = Array.isArray(p.gallery) ? p.gallery : p.gallery.split('\n');
      items.forEach(item => {
        if (item && !item.includes('cloudinary.com')) {
          console.log(`Product: ${p.title} (ID: ${p.id})`);
          console.log(`Gallery Image: ${item}`);
        }
      });
    }
  });
}

checkLargeFiles();
