-- Sample data for ShopifyGenie database
-- This migration adds sample data for testing and development

-- Insert sample users
INSERT INTO users (username, email, password, role, enabled) VALUES
('admin', 'admin@shopifygenie.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF6gU9b4aN9z1pJ8vJ8vJ8v', 'ADMIN', true),
('user1', 'user1@shopifygenie.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF6gU9b4aN9z1pJ8vJ8vJ8v', 'USER', true),
('user2', 'user2@shopifygenie.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfF6gU9b4aN9z1pJ8vJ8vJ8v', 'USER', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (user_id, name, email, phone, address, loyalty_points, is_active) VALUES
(1, 'John Doe', 'john.doe@example.com', '+1234567890', '123 Main St, City, State 12345', 150, true),
(1, 'Jane Smith', 'jane.smith@example.com', '+1234567891', '456 Oak Ave, City, State 12345', 75, true),
(2, 'Bob Johnson', 'bob.johnson@example.com', '+1234567892', '789 Pine Rd, City, State 12345', 200, true),
(2, 'Alice Brown', 'alice.brown@example.com', '+1234567893', '321 Elm St, City, State 12345', 50, true),
(3, 'Charlie Wilson', 'charlie.wilson@example.com', '+1234567894', '654 Maple Dr, City, State 12345', 300, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (user_id, name, description, price, stock, category, is_active) VALUES
(1, 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 50, 'Electronics', true),
(1, 'Smart Watch', 'Fitness tracking smart watch with heart rate monitor', 299.99, 30, 'Electronics', true),
(1, 'Coffee Maker', 'Automatic coffee maker with programmable settings', 89.99, 25, 'Appliances', true),
(2, 'Running Shoes', 'Comfortable running shoes for all terrains', 129.99, 40, 'Sports', true),
(2, 'Yoga Mat', 'Non-slip yoga mat for home workouts', 39.99, 60, 'Sports', true),
(3, 'Laptop Stand', 'Adjustable laptop stand for ergonomic work', 49.99, 35, 'Office', true),
(3, 'Desk Lamp', 'LED desk lamp with adjustable brightness', 79.99, 20, 'Office', true)
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (customer_id, user_id, total, status, billing_address, shipping_address) VALUES
(1, 1, 199.99, 'CONFIRMED', '123 Main St, City, State 12345', '123 Main St, City, State 12345'),
(2, 1, 299.99, 'SHIPPED', '456 Oak Ave, City, State 12345', '456 Oak Ave, City, State 12345'),
(3, 2, 169.98, 'PENDING', '789 Pine Rd, City, State 12345', '789 Pine Rd, City, State 12345'),
(4, 2, 39.99, 'DELIVERED', '321 Elm St, City, State 12345', '321 Elm St, City, State 12345'),
(5, 3, 129.90, 'CONFIRMED', '654 Maple Dr, City, State 12345', '654 Maple Dr, City, State 12345')
ON CONFLICT DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 199.99, 199.99),
(2, 2, 1, 299.99, 299.99),
(3, 4, 1, 129.99, 129.99),
(3, 5, 1, 39.99, 39.99),
(4, 5, 1, 39.99, 39.99),
(5, 4, 1, 129.99, 129.99)
ON CONFLICT DO NOTHING;

-- Insert sample Shopify configurations
INSERT INTO shopify_configs (user_id, shop_domain, access_token, api_key, api_secret, scopes, is_active) VALUES
(1, 'demo-shop.myshopify.com', 'shpat_demo_token_123', 'demo_api_key', 'demo_api_secret', 'read_products,write_products,read_orders,write_orders', true),
(2, 'test-store.myshopify.com', 'shpat_test_token_456', 'test_api_key', 'test_api_secret', 'read_products,write_products', true)
ON CONFLICT DO NOTHING;
