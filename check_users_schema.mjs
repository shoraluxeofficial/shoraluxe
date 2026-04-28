import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://zahdxekcwdlcbzfsnaej.supabase.co',
  'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'
);
const checkSchema = async () => {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("Users schema:", Object.keys(data[0]).join(', '));
    } else {
        console.log("No data or error:", error);
    }
};
checkSchema();
