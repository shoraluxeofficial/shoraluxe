-- Run this in Supabase SQL Editor ONCE to create the combos table
CREATE TABLE IF NOT EXISTS combos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  img TEXT,
  listed_price NUMERIC NOT NULL,
  combo_price NUMERIC NOT NULL,
  promo_code TEXT NOT NULL UNIQUE,
  product_ids JSONB NOT NULL DEFAULT '[]',
  badge TEXT DEFAULT 'COMBO DEAL',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
