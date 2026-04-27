-- ============================================================
-- COMBO 1: Every Day Protection Combo — UPDATED PRICING
-- Run this in your Supabase SQL Editor
-- ============================================================

-- STEP 1: Clear all existing promo codes (fresh start)
DELETE FROM promo_codes;

-- STEP 2: Insert/Update the combo product in Supabase products table
-- Price is ₹899 (MRP). With code SL-SUMMERGLOW1 → ₹699
INSERT INTO products (
  id, brand, title, price, original_price, discount, offer,
  rating, reviews_count, img, badge, is_new, is_bestseller,
  category, net_quantity, benefit, skin_type, description,
  benefits, best_for, promo_group
) VALUES (
  14,
  'SHORALUXE',
  'Every Day Protection Combo | Sunscreen 100gm + Face Wash 50ml',
  899,
  NULL,
  NULL,
  'Sun Protection & Daily Cleanse',
  4.9,
  0,
  '/products images/Everyday Protection Combo/combo.jpg',
  'COMBO DEAL',
  true,
  false,
  'combo',
  'Sunscreen 100gm + Face Wash 50ml',
  'Sun Protection & Deep Cleanse',
  'All Skin Types',
  'Get the ultimate daily defence with our Everyday Protection Combo! Includes our Sunscreen Cream SPF 50+++ (100gm) for broad-spectrum UV protection with zero white cast, paired with the Salicylic Acid Face Wash (50ml) to deep-cleanse, unclog pores and prevent breakouts. Together they form the perfect morning routine: cleanse, then protect.',
  'Complete morning skincare routine. Sunscreen protects from UVA/UVB rays. Face wash clears pores and controls oil.',
  'All skin types',
  'COMBO_SUMMER'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount = EXCLUDED.discount,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge;

-- STEP 3: Insert Promo Code SL-SUMMERGLOW1
-- ₹200 OFF → ₹899 - ₹200 = ₹699
INSERT INTO promo_codes (
  code,
  description,
  discount_type,
  discount_value,
  is_active,
  promo_type,
  applicable_category,
  min_order_amount,
  max_uses,
  uses_count
) VALUES (
  'SL-SUMMERGLOW1',
  'Every Day Protection Combo - Sunscreen 100gm + Face Wash 50ml at only ₹699',
  'fixed',
  200,
  true,
  'standard',
  'combo',
  0,
  NULL,
  0
);

-- DONE!
-- Product: listed at ₹899
-- Code: SL-SUMMERGLOW1 → ₹200 off → final price ₹699
