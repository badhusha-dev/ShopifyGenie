
-- V2__Enhanced_Inventory_And_Vendors.sql
-- Enhanced inventory and vendor management

-- Warehouses table
CREATE TABLE warehouses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_domain TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    manager TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_domain TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    contact_person TEXT,
    category TEXT,
    tax_id TEXT,
    currency TEXT DEFAULT 'USD',
    payment_terms INTEGER DEFAULT 30,
    rating INTEGER DEFAULT 5,
    status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    total_spent DECIMAL(12, 2) DEFAULT '0',
    outstanding_dues DECIMAL(12, 2) DEFAULT '0',
    credits_balance DECIMAL(12, 2) DEFAULT '0',
    prepayments_balance DECIMAL(12, 2) DEFAULT '0',
    last_order_date TIMESTAMP,
    average_payment_days INTEGER DEFAULT 30,
    on_time_payment_rate DECIMAL(5, 2) DEFAULT '100.00',
    dispute_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory batches table
CREATE TABLE inventory_batches (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR REFERENCES products(id),
    warehouse_id VARCHAR REFERENCES warehouses(id),
    vendor_id VARCHAR REFERENCES vendors(id),
    batch_number TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    remaining_quantity INTEGER NOT NULL,
    cost_price DECIMAL(10, 2),
    expiry_date TIMESTAMP,
    manufactured_date TIMESTAMP,
    received_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stock adjustments table
CREATE TABLE stock_adjustments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR REFERENCES products(id),
    warehouse_id VARCHAR REFERENCES warehouses(id),
    batch_id VARCHAR REFERENCES inventory_batches(id),
    adjustment_type TEXT NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason TEXT,
    adjusted_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_domain TEXT NOT NULL,
    vendor_id VARCHAR REFERENCES vendors(id),
    warehouse_id VARCHAR REFERENCES warehouses(id),
    po_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(12, 2),
    paid_amount DECIMAL(12, 2) DEFAULT '0',
    order_date TIMESTAMP DEFAULT NOW(),
    expected_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Purchase order items table
CREATE TABLE purchase_order_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id VARCHAR REFERENCES purchase_orders(id),
    product_id VARCHAR REFERENCES products(id),
    quantity INTEGER NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vendor payments table
CREATE TABLE vendor_payments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR REFERENCES vendors(id),
    purchase_order_id VARCHAR REFERENCES purchase_orders(id),
    amount DECIMAL(12, 2),
    payment_method TEXT,
    payment_date TIMESTAMP DEFAULT NOW(),
    reference TEXT,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE stock_movements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR REFERENCES products(id),
    batch_id VARCHAR REFERENCES inventory_batches(id),
    warehouse_id VARCHAR REFERENCES warehouses(id),
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reference TEXT,
    reference_type TEXT,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
