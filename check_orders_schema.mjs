import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://zahdxekcwdlcbzfsnaej.supabase.co',
  'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'
);
const checkOrdersSchema = async () => {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("Orders schema:", Object.keys(data[0]).join(', '));
        console.log("Full sample record:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("No data or error:", error);
    }
};
checkOrdersSchema();
