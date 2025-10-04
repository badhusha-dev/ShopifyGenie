-- PostgreSQL initialization script for ShopifyGenie microservices
-- This script creates separate databases for each microservice with proper error handling

-- Function to create database if it doesn't exist
CREATE OR REPLACE FUNCTION create_database_if_not_exists(db_name TEXT)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = db_name) THEN
        EXECUTE format('CREATE DATABASE %I', db_name);
        RAISE NOTICE 'Database % created successfully', db_name;
    ELSE
        RAISE NOTICE 'Database % already exists', db_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create databases for each service (only if they don't exist)
SELECT create_database_if_not_exists('auth_db');
SELECT create_database_if_not_exists('product_db');
SELECT create_database_if_not_exists('customer_db');
SELECT create_database_if_not_exists('order_db');
SELECT create_database_if_not_exists('accounting_db');
SELECT create_database_if_not_exists('analytics_db');

-- Grant permissions to postgres user (with error handling)
DO $$
BEGIN
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE product_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE customer_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE order_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE accounting_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE analytics_db TO postgres;
    RAISE NOTICE 'Database permissions granted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END;
$$;

-- Function to create extensions in a database
CREATE OR REPLACE FUNCTION create_extensions_in_db(db_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        DO $$
        BEGIN
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            RAISE NOTICE ''Extensions created in database %'', %L;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE ''Error creating extensions in database %: %'', %L, SQLERRM;
        END;
        $$;
    ', db_name, db_name, db_name);
END;
$$ LANGUAGE plpgsql;

-- Create extensions in each database
SELECT create_extensions_in_db('auth_db');
SELECT create_extensions_in_db('product_db');
SELECT create_extensions_in_db('customer_db');
SELECT create_extensions_in_db('order_db');
SELECT create_extensions_in_db('accounting_db');
SELECT create_extensions_in_db('analytics_db');

-- Clean up helper functions
DROP FUNCTION IF EXISTS create_database_if_not_exists(TEXT);
DROP FUNCTION IF EXISTS create_extensions_in_db(TEXT);

-- Verify database creation
SELECT 
    datname as database_name,
    datowner as owner,
    encoding,
    datcollate,
    datctype,
    datistemplate,
    datallowconn,
    datconnlimit,
    datlastsysoid,
    datfrozenxid,
    datminmxid,
    dattablespace,
    datacl
FROM pg_database 
WHERE datname IN ('auth_db', 'product_db', 'customer_db', 'order_db', 'accounting_db', 'analytics_db')
ORDER BY datname;
