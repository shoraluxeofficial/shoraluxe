-- Run this in your Supabase SQL Editor to add cloud cart support

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cart_items JSONB DEFAULT '[]'::jsonb;

-- Ensure the column is accessible
COMMENT ON COLUMN users.cart_items IS 'Stores the user''s cart state for cross-device syncing';
