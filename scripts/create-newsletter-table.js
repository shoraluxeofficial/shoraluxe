const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function setup() {
  // Try inserting a test row — if table doesn't exist, it will fail
  // We'll use the Supabase REST API directly to create the table
  console.log('Supabase URL:', process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
  
  // First check if table exists
  const { data, error } = await s.from('newsletter_subscribers').select('id').limit(1);
  
  if (error && error.code === '42P01') {
    console.log('Table does not exist. Please run this SQL in Supabase Dashboard > SQL Editor:');
    console.log(`
CREATE TABLE newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'footer',
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all" ON newsletter_subscribers
  FOR SELECT USING (true);
    `);
  } else if (error) {
    console.log('Other error:', error.message);
  } else {
    console.log('Table already exists! Rows:', data?.length || 0);
  }
}

setup();
