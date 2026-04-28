import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://zahdxekcwdlcbzfsnaej.supabase.co',
  'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'
);
const listTables = async () => {
    // There's no direct way to list tables via anon key easily, 
    // but I can try to query common names to see which ones respond.
    const commonTables = ['orders', 'order_items', 'products', 'users'];
    for (const table of commonTables) {
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error) {
            console.log(`Table found: ${table}`);
        } else {
            console.log(`Table NOT found or error for ${table}:`, error.message);
        }
    }
};
listTables();
