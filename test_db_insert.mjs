import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://zahdxekcwdlcbzfsnaej.supabase.co',
  'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'
);
const testInsert = async () => {
    const payload = {
        customer_name: "Test User",
        customer_email: "test@example.com",
        customer_phone: "1234567890",
        shipping_address: { test: "address" },
        subtotal: 0,
        shipping_charge: 0,
        total_amount: 0,
        payment_status: "pending",
        payment_method: "razorpay",
        order_status: "placed"
    };
    const { data, error } = await supabase.from('orders').insert([payload]).select();
    if (error) {
        console.log("Insert failed as expected:", error.message);
    } else {
        console.log("Insert SUCCEEDED! ID:", data[0].id);
        // Clean up
        await supabase.from('orders').delete().eq('id', data[0].id);
    }
};
testInsert();
