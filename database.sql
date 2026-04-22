-- ============================================================
-- SHORALUXE COMPLETE DATABASE SCHEMA
-- Covers: Auth, Products, Orders, Reviews, Homepage CMS
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- Used by: Admin Users, Auth, Checkout
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passcode_hash VARCHAR(255),
    mobile_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ============================================================
-- TABLE: devices
-- Used by: Auth (device trust for session)
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    is_trusted BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(user_id, device_id)
);

-- ============================================================
-- TABLE: otp_logs
-- Used by: Auth OTP flow
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,   -- 'sms' or 'email'
    otp_code VARCHAR(255) NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ============================================================
-- TABLE: products
-- Used by: Admin Products, ShopContext, Checkout, Homepage
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) DEFAULT 'SHORALUXE',
    title VARCHAR(500) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    discount VARCHAR(50),
    offer TEXT,
    badge VARCHAR(50),
    size TEXT,                   -- JSON string of variants [{label, price, mrp, discount, usp}]
    benefit VARCHAR(255),
    skin_type VARCHAR(100),
    img TEXT,
    gallery JSONB DEFAULT '[]',  -- array of image URLs
    description TEXT,
    how_to_use JSONB DEFAULT '[]', -- array of steps
    ingredients TEXT,
    best_for TEXT,
    benefits TEXT,
    cautions TEXT,
    net_quantity VARCHAR(100),
    ideal_for JSONB DEFAULT '[]', -- array of strings
    rating NUMERIC(3,1) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    is_sale BOOLEAN DEFAULT false,
    stock INT DEFAULT 100,
    status VARCHAR(20) DEFAULT 'active',  -- active, draft, out-of-stock
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ============================================================
-- TABLE: orders
-- Used by: Admin Orders, Admin Revenue, Admin Dashboard, Checkout
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address JSONB NOT NULL,     -- { flat_no, address_line1, landmark, city, state, pincode, address_type, alternate_phone }
    items JSONB NOT NULL,                -- array of cart items
    subtotal NUMERIC(10,2) DEFAULT 0,
    shipping_fee NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'razorpay' or 'cod'
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
    order_status VARCHAR(50) DEFAULT 'placed',    -- placed, confirmed, processing, packed, shipped, delivered, cancelled
    razorpay_payment_id VARCHAR(255),
    shiprocket_awb VARCHAR(100),
    tracking_url TEXT,
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ============================================================
-- TABLE: reviews
-- Used by: Admin Reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255),
    product_name VARCHAR(500),
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
    review_text TEXT,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ============================================================
-- TABLE: homepage_sections
-- Used by: Admin Homepage CMS (hero, cta, quiz, videoBanners, watchAndShop)
-- ============================================================
CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name VARCHAR(100) UNIQUE NOT NULL,  -- hero, cta, quiz, videoBanners, watchAndShop, brandPromise
    content JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ============================================================
-- Seed: Default homepage sections so CMS works on first load
-- ============================================================
INSERT INTO homepage_sections (section_name, content) VALUES
('hero', '[
  {"img": "/Banners/1000000387.jpg.jpeg", "url": "/shop", "alt": "Premium Care"},
  {"img": "/Banners/1000000389 (1).jpg.jpeg", "url": "/shop", "alt": "Luxury Serums"}
]'::jsonb),
('cta', '{
  "heading": "Your Journey to Radiant Skin Starts Here",
  "text": "Discover the perfect blend of science and nature.",
  "tag": "Limited Edition",
  "buttonText": "SHOP THE COLLECTION",
  "bgImage": ""
}'::jsonb),
('quiz', '{
  "heading": "Build Your Perfect Routine, Instantly.",
  "text": "Answer a few quick questions.",
  "buttonText": "Start The Quiz"
}'::jsonb),
('videoBanners', '[
  {"url": "", "title": "Pure Texture", "desc": "The science of silky hydration."},
  {"url": "", "title": "Radiant Glow",  "desc": "Unlock your natural luminosity safely."}
]'::jsonb),
('watchAndShop', '[]'::jsonb),
('brandPromise', '[]'::jsonb)
ON CONFLICT (section_name) DO NOTHING;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
