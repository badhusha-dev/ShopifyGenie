-- Auth Service: Create users table
-- Migration: V1__create_users_table.sql

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES (
    'admin-001',
    'admin@shopifygenie.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Super',
    'Admin',
    'super_admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default staff user (password: staff123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES (
    'staff-001',
    'staff@shopifygenie.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- staff123
    'Staff',
    'User',
    'staff',
    true,
    true
) ON CONFLICT (email) DO NOTHING;
