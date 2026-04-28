import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://zahdxekcwdlcbzfsnaej.supabase.co',
  'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'
);

// Test with EXACT columns we are now sending
const testPayload = {
  customer_name: 'SCHEMA_TEST_DELETE',
  customer_phone: '9999999999',
  customer_email: 'test@test.com',
  shipping_address: { flat_no: '1', city: 'Test', state: 'Test', pincode: '500001' },
  total_amount: 2,
  subtotal: 2,
  shipping_charge: 0,
  discount_amount: 0,
  payment_status: 'paid',
  payment_method: 'razorpay',
  order_status: 'placed',
  razorpay_payment_id: 'test_pay_id',
};

const { data, error } = await supabase.from('orders').insert([testPayload]).select();
if (error) {
  console.log('❌ STILL FAILING:', error.message);
} else {
  console.log('✅ SUCCESS! All columns valid.');
  console.log('Full schema:', Object.keys(data[0]).join(', '));
  // Clean up
  await supabase.from('orders').delete().eq('customer_name', 'SCHEMA_TEST_DELETE');
  console.log('Test row cleaned up.');
}
