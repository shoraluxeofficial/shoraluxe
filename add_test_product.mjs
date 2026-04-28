import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zahdxekcwdlcbzfsnaej.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const insertTestProduct = async () => {
  const newProduct = {
    title: 'Test Order Workflow Product (Live Testing)',
    description: 'This is a test product created for testing the live order checkout flow with Razorpay. It costs ₹2.',
    price: 2,
    original_price: 2,
    img: 'https://images.unsplash.com/photo-1616812480665-27a9202611a4?w=500&q=80',
    category: 'single',
    stock: 100,
    status: 'active',
    ingredients: ['Test'],
    how_to_use: ['Test'],
    benefits: ['Testing live payment gateway.'],
    rating: 5,
    reviews_count: 1
  };

  const { data, error } = await supabase.from('products').insert([newProduct]).select();

  if (error) {
    console.error('Error inserting product:', error);
  } else {
    console.log('Successfully inserted test product:', data);
  }
};

insertTestProduct();
