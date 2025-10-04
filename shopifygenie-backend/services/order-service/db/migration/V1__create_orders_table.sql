-- Order Service: Create orders table
-- Migration: V1__create_orders_table.sql

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on order_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create index on customer_id for customer order queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Create index on status for status-based queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on payment_status for payment queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Create index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
