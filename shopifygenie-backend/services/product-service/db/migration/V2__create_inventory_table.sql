-- Product Service: Create inventory table
-- Migration: V2__create_inventory_table.sql

CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_location VARCHAR(100),
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- Create index on warehouse_location for location-based queries
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_location ON inventory(warehouse_location);

-- Create index on quantity_available for low stock alerts
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_available ON inventory(quantity_available);

-- Insert sample inventory data
INSERT INTO inventory (id, product_id, warehouse_location, quantity_on_hand, reorder_point, reorder_quantity)
VALUES 
    ('inv-001', 'product-001', 'main-warehouse', 100, 10, 50),
    ('inv-002', 'product-002', 'main-warehouse', 50, 5, 25),
    ('inv-003', 'product-003', 'main-warehouse', 25, 5, 20)
ON CONFLICT (id) DO NOTHING;
