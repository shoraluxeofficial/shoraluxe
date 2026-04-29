import { supabase } from '../server/config/db.js';

async function setup() {
    console.log('Setting up Biometric Vault...');
    const sql = `
    CREATE TABLE IF NOT EXISTS user_credentials (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        credential_id TEXT NOT NULL UNIQUE,
        public_key TEXT NOT NULL,
        counter BIGINT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    `;
    
    try {
        // Since we might not have RPC 'exec_sql', we'll just check if the table exists
        const { error: checkError } = await supabase.from('user_credentials').select('id').limit(1);
        
        if (checkError && checkError.code === 'PGRST116') {
             console.log('Table does not exist. Please run the following SQL in your Supabase SQL Editor:');
             console.log(sql);
        } else if (checkError) {
            console.log('Table might not exist or there is an error:', checkError.message);
            console.log('Please run the following SQL in your Supabase SQL Editor to be safe:');
            console.log(sql);
        } else {
            console.log('Biometric vault is already set up or accessible!');
        }
    } catch (e) {
        console.log('Error checking table:', e.message);
    }
    process.exit(0);
}

setup();
