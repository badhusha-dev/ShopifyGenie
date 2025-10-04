-- Order Service: Create order items table
-- Migration: V2__create_order_items_table.sql

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on order_id for order item queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Create index on product_id for product order queries
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create index on product_sku for SKU-based queries
CREATE INDEX IF NOT EXISTS idx_order_items_product_sku ON order_items(product_sku);
