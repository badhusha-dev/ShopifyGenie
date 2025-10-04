-- Order Service: Create database and extensions if not exists
-- Migration: V0__create_database.sql
-- This migration ensures the database exists before table creation

-- Note: Database creation must be done outside of Flyway as it connects to the specific database
-- This file is kept for documentation purposes
-- The actual database creation is handled by the init-db.sql script

-- Create UUID extension if not exists (this will work within the database)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify database connection
SELECT current_database() as current_db, current_user as current_user;
