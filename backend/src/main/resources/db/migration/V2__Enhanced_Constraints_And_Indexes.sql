-- Additional features and constraints for ShopifyGenie database
-- This migration adds additional constraints and features

-- Add unique constraints (PostgreSQL doesn't support IF NOT EXISTS with ADD CONSTRAINT)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_customers_email') THEN
        ALTER TABLE customers ADD CONSTRAINT uk_customers_email UNIQUE (email);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_username') THEN
        ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_users_email') THEN
        ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
    END IF;
END $$;

-- Add check constraints (PostgreSQL doesn't support IF NOT EXISTS with ADD CONSTRAINT)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_customers_loyalty_points') THEN
        ALTER TABLE customers ADD CONSTRAINT chk_customers_loyalty_points CHECK (loyalty_points >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price') THEN
        ALTER TABLE products ADD CONSTRAINT chk_products_price CHECK (price >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock') THEN
        ALTER TABLE products ADD CONSTRAINT chk_products_stock CHECK (stock >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_quantity') THEN
        ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity CHECK (quantity > 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_unit_price') THEN
        ALTER TABLE order_items ADD CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_total_price') THEN
        ALTER TABLE order_items ADD CONSTRAINT chk_order_items_total_price CHECK (total_price >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_total') THEN
        ALTER TABLE orders ADD CONSTRAINT chk_orders_total CHECK (total >= 0);
    END IF;
END $$;

-- Add additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_customers_shopify_customer_id ON customers(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_products_shopify_product_id ON products(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_products_shopify_variant_id ON products(shopify_variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_shopify_order_id ON orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Add comments to tables for documentation
COMMENT ON TABLE users IS 'User authentication and management';
COMMENT ON TABLE customers IS 'Customer information and loyalty data';
COMMENT ON TABLE products IS 'Product catalog with Shopify integration';
COMMENT ON TABLE orders IS 'Order management with status tracking';
COMMENT ON TABLE order_items IS 'Order line items with product details';
COMMENT ON TABLE shopify_configs IS 'Shopify store configuration and credentials';

-- Add comments to important columns
COMMENT ON COLUMN users.role IS 'User role: USER or ADMIN';
COMMENT ON COLUMN customers.loyalty_points IS 'Customer loyalty points for rewards program';
COMMENT ON COLUMN products.shopify_product_id IS 'Shopify product ID for integration';
COMMENT ON COLUMN products.shopify_variant_id IS 'Shopify variant ID for integration';
COMMENT ON COLUMN orders.status IS 'Order status: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED';
COMMENT ON COLUMN shopify_configs.is_active IS 'Whether this Shopify configuration is active';
COMMENT ON COLUMN shopify_configs.token_expires_at IS 'When the access token expires';
