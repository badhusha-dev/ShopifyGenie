
-- V1__Initial_Schema.sql
-- Initial database schema for Shopify app

-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    permissions TEXT,
    shop_domain TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    operation TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Role permissions table
CREATE TABLE role_permissions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    permission_name TEXT NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    shopify_id TEXT UNIQUE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2),
    category TEXT,
    image_url TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    shopify_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT '0',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    shopify_id TEXT UNIQUE,
    customer_id VARCHAR REFERENCES customers(id),
    total DECIMAL(10, 2) NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR REFERENCES customers(id),
    product_id VARCHAR REFERENCES products(id),
    status TEXT NOT NULL DEFAULT 'active',
    frequency TEXT NOT NULL,
    next_delivery TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty transactions table
CREATE TABLE loyalty_transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR REFERENCES customers(id),
    order_id VARCHAR REFERENCES orders(id),
    points INTEGER NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
