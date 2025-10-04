-- Product Service: Create products table
-- Migration: V1__create_products_table.sql

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category VARCHAR(100),
    brand VARCHAR(100),
    weight DECIMAL(8,2),
    dimensions JSONB,
    images JSONB,
    tags JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_digital BOOLEAN NOT NULL DEFAULT false,
    requires_shipping BOOLEAN NOT NULL DEFAULT true,
    track_inventory BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on SKU for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create index on brand for filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
