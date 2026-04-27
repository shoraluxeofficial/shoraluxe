-- Add 2 new columns to promo_codes table
-- Run once in Supabase SQL Editor

ALTER TABLE promo_codes
  ADD COLUMN IF NOT EXISTS how_to_redeem TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS applicable_products TEXT DEFAULT NULL;
