import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://zahdxekcwdlcbzfsnaej.supabase.co',
  'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'
);
const checkOrderItemsSchema = async () => {
    const { data, error } = await supabase.from('order_items').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("OrderItems schema:", Object.keys(data[0]).join(', '));
        console.log("Full sample record:", JSON.stringify(data[0], null, 2));
    } else {
        // Try to insert a dummy record to trigger a "column does not exist" error which might show valid columns
        const { error: insError } = await supabase.from('order_items').insert([{ invalid_col: 1 }]);
        console.log("Schema hints from error:", insError?.message);
    }
};
checkOrderItemsSchema();
