import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zahdxekcwdlcbzfsnaej.supabase.co';
const supabaseKey = 'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'; // Anon key
const supabase = createClient(supabaseUrl, supabaseKey);

async function listFolder(bucket, folderPath) {
  let allFiles = [];
  const { data, error } = await supabase.storage.from(bucket).list(folderPath, { limit: 100 });
  if (error || !data) return [];
  
  for (const item of data) {
    if (item.id === null) {
      const subFiles = await listFolder(bucket, `${folderPath}/${item.name}`);
      allFiles = allFiles.concat(subFiles);
    } else {
      allFiles.push(item);
    }
  }
  return allFiles;
}

async function getStorageSize() {
  console.log('Calculating storage...');
  const { data: rootItems, error } = await supabase.storage.from('brand-assets').list('', { limit: 100 });
  if (error || !rootItems) {
    console.error('Failed to fetch root items', error);
    return;
  }
  
  let totalBytes = 0;
  let totalFiles = 0;
  for (const item of rootItems) {
    if (item.id === null) {
      const files = await listFolder('brand-assets', item.name);
      totalFiles += files.length;
      files.forEach(f => {
        totalBytes += f.metadata?.size || 0;
      });
    } else {
      totalFiles++;
      totalBytes += item.metadata?.size || 0;
    }
  }
  
  console.log('Total Files:', totalFiles);
  console.log('Total MB:', (totalBytes / (1024 * 1024)).toFixed(2) + ' MB');
}

getStorageSize();
