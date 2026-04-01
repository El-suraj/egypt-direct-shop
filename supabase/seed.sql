-- Seed data for Egypt Direct Shop
-- This file contains sample data for development and testing

-- Clear existing data (if migrating)
-- DELETE FROM public.order_items;
-- DELETE FROM public.orders;
-- DELETE FROM public.cart_items;
-- DELETE FROM public.wishlists;
-- DELETE FROM public.product_variants;
-- DELETE FROM public.products;
-- DELETE FROM public.vendors;
-- DELETE FROM public.categories;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Arabian Clothing', 'arabian-clothing', 'Abayas, jalabiyas, turbans, veils, hijabs, and traditional Islamic wear', 'https://images.unsplash.com/photo-1596667022600-92f886e8eff0?w=500'),
('22222222-2222-2222-2222-222222222222', 'Western Clothing', 'western-clothing', 'Casual and formal Western apparel for men and women', 'https://images.unsplash.com/photo-1558618666-fcd25c75533f?w=500'),
('33333333-3333-3333-3333-333333333333', 'Bags & Accessories', 'bags-accessories', 'Handbags, clutches, totes, and fashion accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'),
('44444444-4444-4444-4444-444444444444', 'Shoes', 'shoes', 'Footwear for all occasions', 'https://images.unsplash.com/photo-1542562528-06ce1b1e676a?w=500');

-- ============================================
-- VENDORS
-- ============================================
INSERT INTO public.vendors (id, name, slug, description, logo_url, location, verified, rating, total_sales) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Abayas Luxe', 'abayas-luxe', 'Premium handcrafted abayas and jalabiyas from Dubai', 'https://images.unsplash.com/photo-1508541914411-b34d9a6ad5d2?w=100', 'Dubai, UAE', true, 4.9, 2850),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Islamic Fashion Hub', 'islamic-fashion-hub', 'Curated collection of hijabs, turbans, and modest wear', 'https://images.unsplash.com/photo-1595612144880-3e5d1b6d263d?w=100', 'Cairo, Egypt', true, 4.8, 2120),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Western Style Cairo', 'western-style-cairo', 'Contemporary Western clothing and casual apparel', 'https://images.unsplash.com/photo-1506617356184-e96b9ff42c51?w=100', 'Giza, Egypt', true, 4.7, 1580),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Elegant Bags & Shoes', 'elegant-bags-shoes', 'Designer handbags and footwear for every occasion', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100', 'Alexandria, Egypt', true, 4.8, 1920),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Hijab Fashion Gallery', 'hijab-fashion-gallery', 'Wide selection of hijabs, veils, and Islamic accessories', 'https://images.unsplash.com/photo-1595612144880-3e5d1b6d263d?w=100', 'Helwan, Egypt', false, 4.6, 1340);

-- ============================================
-- PRODUCTS - ARABIAN CLOTHING (MAIN FOCUS)
-- ============================================
INSERT INTO public.products (id, name, slug, description, category_id, vendor_id, price_egp, price_ngn, shipping_fee_ngn, service_fee_ngn, image_url, images, badge, in_stock, rating, review_count) VALUES
('11111111-2222-3333-4444-555555555551', 'Premium Black Abaya', 'premium-black-abaya', 'Luxurious handcrafted abaya with intricate embroidery and pearl detailing', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1899, 95000, 5000, 2000, 'https://images.unsplash.com/photo-1596667022600-92f886e8eff0?w=500', ARRAY['https://images.unsplash.com/photo-1596667022600-92f886e8eff0?w=500', 'https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=500'], 'Bestseller', true, 4.9, 487),
('11111111-2222-3333-4444-555555555552', 'Embroidered Jalabiya - Man', 'embroidered-jalabiya-man', 'Traditional embroidered jalabiya with comfortable fit for daily wear', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1299, 65000, 4000, 1500, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500', ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500'], 'New', true, 4.8, 234),
('11111111-2222-3333-4444-555555555553', 'Silk Abaya with Gold Details', 'silk-abaya-gold', 'Premium silk abaya adorned with gold embroidery and sequins', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2499, 125000, 5500, 2000, 'https://images.unsplash.com/photo-1496009710541-87ec3f3f47b6?w=500', ARRAY['https://images.unsplash.com/photo-1496009710541-87ec3f3f47b6?w=500'], 'Bestseller', true, 4.9, 612),
('11111111-2222-3333-4444-555555555554', 'Open Abaya with Sleeves', 'open-abaya-sleeves', 'Modern open-design abaya with flowing sleeves and subtle embroidery', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1599, 80000, 4500, 1500, 'https://images.unsplash.com/photo-1567036782867-e71b99932e29?w=500', ARRAY['https://images.unsplash.com/photo-1567036782867-e71b99932e29?w=500'], 'Sale', true, 4.7, 389),
('11111111-2222-3333-4444-555555555555', 'Chiffon Hijab - Premium Quality', 'chiffon-hijab-premium', 'Breathable chiffon hijab available in 12 colors with soft texture', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 349, 17500, 2000, 1000, 'https://images.unsplash.com/photo-1595612144880-3e5d1b6d263d?w=500', ARRAY['https://images.unsplash.com/photo-1595612144880-3e5d1b6d263d?w=500'], NULL, true, 4.8, 756),
('11111111-2222-3333-4444-555555555556', 'Turban - Elegant Cotton Wrap', 'turban-elegant-cotton', 'Traditional turban with comfortable wrap design for men and women', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 249, 12500, 2000, 1000, 'https://images.unsplash.com/photo-1530323169035-7b8498b1b675?w=500', ARRAY['https://images.unsplash.com/photo-1530323169035-7b8498b1b675?w=500'], NULL, true, 4.6, 234),
('11111111-2222-3333-4444-555555555557', 'Niqab with Eye Veil - Comfortable Fit', 'niqab-eye-veil', 'Complete niqab set with comfortable fit and quality stitching', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 199, 10000, 1500, 800, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', ARRAY['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'], 'New', true, 4.7, 145),
('11111111-2222-3333-4444-555555555558', 'Al-Amira Veil - Two Piece Set', 'al-amira-veil-set', 'Traditional Al-Amira veil with soft fabric and elegant drape', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 299, 15000, 2000, 1000, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'], NULL, true, 4.6, 123);

-- ============================================
-- PRODUCTS - WESTERN CLOTHING
-- ============================================
INSERT INTO public.products (id, name, slug, description, category_id, vendor_id, price_egp, price_ngn, shipping_fee_ngn, service_fee_ngn, image_url, images, badge, in_stock, rating, review_count) VALUES
('22222222-2222-3333-4444-555555555561', 'Premium Cotton T-Shirt - Unisex', 'premium-cotton-tshirt', '100% organic cotton comfortable t-shirt available in 10 colors', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 349, 17500, 3000, 1000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], NULL, true, 4.7, 456),
('22222222-2222-3333-4444-555555555562', 'Classic Blue Denim Jeans', 'classic-blue-denim-jeans', 'Comfortable denim jeans with perfect fit for casual everyday wear', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 899, 45000, 4000, 1500, 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500', ARRAY['https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500'], 'Bestseller', true, 4.8, 589),
('22222222-2222-3333-4444-555555555563', 'Elegant White Dress Shirt', 'elegant-white-dress-shirt', 'Professional dress shirt perfect for office and formal occasions', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 749, 37500, 3500, 1500, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500', ARRAY['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500'], NULL, true, 4.7, 267),
('22222222-2222-3333-4444-555555555564', 'Casual Summer Dress - Floral', 'casual-summer-dress-floral', 'Lightweight summer dress with floral pattern perfect for warm weather', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 699, 35000, 3500, 1500, 'https://images.unsplash.com/photo-1595777707802-51b40f980c69?w=500', ARRAY['https://images.unsplash.com/photo-1595777707802-51b40f980c69?w=500'], 'Sale', true, 4.6, 178),
('22222222-2222-3333-4444-555555555565', 'Stylish Winter Jacket - Wool', 'stylish-winter-jacket-wool', 'Warm wool jacket with water-resistant coating for winter season', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1699, 85000, 5000, 2000, 'https://images.unsplash.com/photo-1539533057592-4cb0c6a0444d?w=500', ARRAY['https://images.unsplash.com/photo-1539533057592-4cb0c6a0444d?w=500'], 'New', true, 4.8, 234),
('22222222-2222-3333-4444-555555555566', 'Casual Hoodie - Comfortable Fit', 'casual-hoodie-comfortable', 'Comfortable hoodie with soft fleece lining for relaxed style', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 599, 30000, 3000, 1000, 'https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=500', ARRAY['https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=500'], NULL, true, 4.6, 145);

-- ============================================
-- PRODUCTS - BAGS & ACCESSORIES
-- ============================================
INSERT INTO public.products (id, name, slug, description, category_id, vendor_id, price_egp, price_ngn, shipping_fee_ngn, service_fee_ngn, image_url, images, badge, in_stock, rating, review_count) VALUES
('33333333-2222-3333-4444-555555555571', 'Luxury Leather Handbag', 'luxury-leather-handbag', 'Premium leather handbag with spacious compartments and elegant design', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1299, 65000, 4000, 1500, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'], 'Bestseller', true, 4.8, 456),
('33333333-2222-3333-4444-555555555572', 'Classic Leather Clutch - Evening', 'classic-leather-clutch', 'Elegant clutch perfect for evening occasions and formal events', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 699, 35000, 2500, 1000, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'], 'New', true, 4.7, 234),
('33333333-2222-3333-4444-555555555573', 'Tote Bag - Luxury Canvas', 'tote-bag-luxury-canvas', 'Spacious tote bag made from premium canvas with leather handles', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 799, 40000, 3500, 1500, 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500', ARRAY['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500'], NULL, true, 4.6, 178),
('33333333-2222-3333-4444-555555555574', 'Crossbody Bag - Travel Friendly', 'crossbody-bag-travel', 'Practical crossbody bag with multiple pockets for travel and daily use', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 599, 30000, 3000, 1500, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], 'Sale', true, 4.5, 145),
('33333333-2222-3333-4444-555555555575', 'Designer Abaya Accessory Bag', 'designer-abaya-bag', 'Matching bag designed to complement abayas and jalabiyas', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 899, 45000, 3500, 1500, 'https://images.unsplash.com/photo-1590883669635-c6e07a1ad257?w=500', ARRAY['https://images.unsplash.com/photo-1590883669635-c6e07a1ad257?w=500'], 'Bestseller', true, 4.8, 267);

-- ============================================
-- PRODUCTS - SHOES
-- ============================================
INSERT INTO public.products (id, name, slug, description, category_id, vendor_id, price_egp, price_ngn, shipping_fee_ngn, service_fee_ngn, image_url, images, badge, in_stock, rating, review_count) VALUES
('44444444-2222-3333-4444-555555555581', 'Comfortable Leather Shoes - Formal', 'comfortable-leather-shoes-formal', 'Premium leather formal shoes perfect for office and formal occasions', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 899, 45000, 4000, 1500, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], 'Bestseller', true, 4.8, 512),
('44444444-2222-3333-4444-555555555582', 'Running Athletic Shoes - Mesh', 'running-athletic-shoes-mesh', 'Lightweight breathable running shoes with memory foam and grip soles', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 799, 40000, 4000, 1500, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500', ARRAY['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500'], 'Sale', true, 4.7, 389),
('44444444-2222-3333-4444-555555555583', 'Casual Sneakers - Comfortable', 'casual-sneakers-comfortable', 'Stylish casual sneakers suitable for everyday wear and casual outings', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 649, 32500, 3500, 1500, 'https://images.unsplash.com/photo-1616707267537-b85faf00c4b7?w=500', ARRAY['https://images.unsplash.com/photo-1616707267537-b85faf00c4b7?w=500'], 'New', true, 4.6, 234),
('44444444-2222-3333-4444-555555555584', 'Elegant Heeled Sandals - Women', 'elegant-heeled-sandals-women', 'Stylish heeled sandals perfect for evening events and formal occasions', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 799, 40000, 3500, 1500, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'], NULL, true, 4.7, 178),
('44444444-2222-3333-4444-555555555585', 'Flat Slip-On Shoes - Versatile', 'flat-slip-on-shoes-versatile', 'Comfortable slip-on flat shoes suitable for all seasons and occasions', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 549, 27500, 3000, 1500, 'https://images.unsplash.com/photo-1543259741-2ea3ebee61fa?w=500', ARRAY['https://images.unsplash.com/photo-1543259741-2ea3ebee61fa?w=500'], 'Bestseller', true, 4.8, 412);

-- ============================================
-- PRODUCT VARIANTS (sizing and colors)
-- ============================================
INSERT INTO public.product_variants (product_id, size, color, in_stock, stock_count, price_adjustment_ngn) VALUES
-- Abaya Variants - Premium Black
('11111111-2222-3333-4444-555555555551', 'S', 'Black', true, 15, 0),
('11111111-2222-3333-4444-555555555551', 'M', 'Black', true, 20, 0),
('11111111-2222-3333-4444-555555555551', 'L', 'Black', true, 18, 0),
('11111111-2222-3333-4444-555555555551', 'XL', 'Black', true, 12, 2000),
('11111111-2222-3333-4444-555555555551', 'XXL', 'Black', true, 8, 3000),

-- Jalabiya Variants - Man
('11111111-2222-3333-4444-555555555552', 'M', 'White', true, 25, 0),
('11111111-2222-3333-4444-555555555552', 'L', 'White', true, 20, 0),
('11111111-2222-3333-4444-555555555552', 'XL', 'White', true, 15, 1000),
('11111111-2222-3333-4444-555555555552', 'M', 'Beige', true, 18, 500),
('11111111-2222-3333-4444-555555555552', 'L', 'Beige', true, 14, 500),

-- Silk Abaya with Gold - Variants
('11111111-2222-3333-4444-555555555553', 'S', 'Black', true, 10, 0),
('11111111-2222-3333-4444-555555555553', 'M', 'Black', true, 12, 0),
('11111111-2222-3333-4444-555555555553', 'L', 'Black', true, 10, 0),
('11111111-2222-3333-4444-555555555553', 'XL', 'Black', true, 6, 3000),

-- Open Abaya Variants
('11111111-2222-3333-4444-555555555554', 'S', 'Navy', true, 16, 0),
('11111111-2222-3333-4444-555555555554', 'M', 'Navy', true, 18, 0),
('11111111-2222-3333-4444-555555555554', 'L', 'Navy', true, 14, 0),
('11111111-2222-3333-4444-555555555554', 'XL', 'Navy', true, 10, 1000),

-- Chiffon Hijab - Multiple Color Variants
('11111111-2222-3333-4444-555555555555', 'OS', 'Black', true, 50, 0),
('11111111-2222-3333-4444-555555555555', 'OS', 'White', true, 45, 0),
('11111111-2222-3333-4444-555555555555', 'OS', 'Navy', true, 40, 0),
('11111111-2222-3333-4444-555555555555', 'OS', 'Beige', true, 35, 0),
('11111111-2222-3333-4444-555555555555', 'OS', 'Pink', true, 30, 0),

-- T-Shirt Western - Variants
('22222222-2222-3333-4444-555555555561', 'S', 'Black', true, 30, 0),
('22222222-2222-3333-4444-555555555561', 'M', 'Black', true, 40, 0),
('22222222-2222-3333-4444-555555555561', 'L', 'Black', true, 35, 0),
('22222222-2222-3333-4444-555555555561', 'XL', 'Black', true, 20, 1000),
('22222222-2222-3333-4444-555555555561', 'M', 'White', true, 45, 0),
('22222222-2222-3333-4444-555555555561', 'M', 'Gray', true, 38, 0),

-- Denim Jeans Variants
('22222222-2222-3333-4444-555555555562', '28', 'Blue', true, 22, 0),
('22222222-2222-3333-4444-555555555562', '30', 'Blue', true, 25, 0),
('22222222-2222-3333-4444-555555555562', '32', 'Blue', true, 20, 0),
('22222222-2222-3333-4444-555555555562', '34', 'Blue', true, 15, 500),
('22222222-2222-3333-4444-555555555562', '30', 'Black', true, 18, 0),

-- Leather Handbag Variants
('33333333-2222-3333-4444-555555555571', 'OS', 'Black', true, 12, 0),
('33333333-2222-3333-4444-555555555571', 'OS', 'Brown', true, 10, 0),
('33333333-2222-3333-4444-555555555571', 'OS', 'Red', true, 8, 1000),

-- Shoes - Formal Variants
('44444444-2222-3333-4444-555555555581', '7', 'Black', true, 15, 0),
('44444444-2222-3333-4444-555555555581', '8', 'Black', true, 18, 0),
('44444444-2222-3333-4444-555555555581', '9', 'Black', true, 20, 0),
('44444444-2222-3333-4444-555555555581', '10', 'Black', true, 16, 0),
('44444444-2222-3333-4444-555555555581', '9', 'Brown', true, 12, 0),

-- Running Shoes Variants
('44444444-2222-3333-4444-555555555582', '7', 'White', true, 16, 0),
('44444444-2222-3333-4444-555555555582', '8', 'White', true, 20, 0),
('44444444-2222-3333-4444-555555555582', '9', 'White', true, 22, 0),
('44444444-2222-3333-4444-555555555582', '10', 'White', true, 18, 0),
('44444444-2222-3333-4444-555555555582', '9', 'Black', true, 15, 0);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
