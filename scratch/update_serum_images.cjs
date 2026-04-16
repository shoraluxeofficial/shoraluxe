const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zahdxekcwdlcbzfsnaej.supabase.co';
const supabaseKey = 'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_';
const supabase = createClient(supabaseUrl, supabaseKey);

const mainImg = '/Vitamin C & Niacinamide Face Serum/070FCDFF-3614-4A4B-86CA-AF1D83AF3D4D.jpeg';
const gallery = [
  '/Vitamin C & Niacinamide Face Serum/070FCDFF-3614-4A4B-86CA-AF1D83AF3D4D.jpeg',
  '/Vitamin C & Niacinamide Face Serum/0B854F8D-9D8D-4F9F-A7C3-586B00A2921C.png',
  '/Vitamin C & Niacinamide Face Serum/22D1B635-B0B4-4642-801F-3D1F8EFAEE80.png',
  '/Vitamin C & Niacinamide Face Serum/3C3E2161-147D-4A76-ADFF-64471E27912C.png',
  '/Vitamin C & Niacinamide Face Serum/491AA1B9-AB96-4170-A651-0C43BBACF160.png',
  '/Vitamin C & Niacinamide Face Serum/50AC8D9A-E0BF-4D26-9867-1F811B25C718.png',
  '/Vitamin C & Niacinamide Face Serum/67AE1B19-61C1-4F5C-A2D1-EAFC96DA6616.png',
  '/Vitamin C & Niacinamide Face Serum/95D473CC-8AB3-4E45-B0E9-BF0A08A9B4E2.png'
];

async function updateSerum() {
  console.log('Finding product...');
  const { data: products, error: findError } = await supabase
    .from('products')
    .select('id, title')
    .ilike('title', '%Vitamin C & Niacinamide Face Serum%');

  if (findError) {
    console.error('Error finding product:', findError);
    return;
  }

  if (!products || products.length === 0) {
    console.log('Product not found in Supabase.');
    return;
  }

  const productId = products[0].id;
  console.log(`Found product: ${products[0].title} (ID: ${productId})`);

  console.log('Updating images...');
  const { error: updateError } = await supabase
    .from('products')
    .update({
      img: mainImg,
      gallery: gallery
    })
    .eq('id', productId);

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Successfully updated images in Supabase!');
  }
}

updateSerum();
