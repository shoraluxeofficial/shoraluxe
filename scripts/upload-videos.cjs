const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://zahdxekcwdlcbzfsnaej.supabase.co';
const supabaseKey = 'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'; // Anon key might not work for upload without RLS policies
const supabase = createClient(supabaseUrl, supabaseKey);

const videoDir = path.join(__dirname, '..', 'public', 'Watch&shop');
const bucketName = 'Videos';

async function uploadVideos() {
  const files = fs.readdirSync(videoDir);
  console.log(`Found ${files.length} files in ${videoDir}`);

  for (const file of files) {
    if (!file.endsWith('.mp4')) continue;
    
    const filePath = path.join(videoDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`Uploading ${file}...`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(file, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
    }
  }
}

uploadVideos();
