# 🗄️ Database Setup Guide for ShopifyGenie Microservices

This guide explains how to set up and manage databases for the ShopifyGenie microservices architecture with Flyway migrations.

## 📋 Overview

The ShopifyGenie microservices architecture uses:
- **PostgreSQL** as the primary database
- **Separate databases** for each microservice
- **Flyway** for automated database migrations
- **Docker Compose** for orchestration

## 🏗️ Database Architecture

### Service-Specific Databases

| Service | Database | Purpose |
|---------|----------|---------|
| Auth Service | `auth_db` | User authentication, JWT tokens |
| Product Service | `product_db` | Product catalog, inventory |
| Customer Service | `customer_db` | Customer profiles, loyalty |
| Order Service | `order_db` | Orders, payments, shipping |
| Accounting Service | `accounting_db` | Financial transactions, reports |
| Analytics Service | `analytics_db` | Sales data, analytics |

## 🚀 Quick Start

### 1. Start the Database Infrastructure

```bash
# Start PostgreSQL with automatic database creation
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
docker-compose exec postgres psql -U postgres -c "SELECT version();"
```

### 2. Run Database Initialization

The `init-db.sql` script automatically:
- Creates all service databases if they don't exist
- Grants proper permissions
- Installs required extensions (uuid-ossp)

```bash
# The initialization script runs automatically when PostgreSQL starts
# You can also run it manually:
docker-compose exec postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/init-db.sql
```

### 3. Run Flyway Migrations

```bash
# Run migrations for all services
docker-compose up -d auth-flyway product-flyway customer-flyway order-flyway accounting-flyway analytics-flyway

# Or start all services (migrations run automatically)
docker-compose up -d
```

## 🔧 Database Creation Process

### Automatic Database Creation

The `init-db.sql` script includes robust database creation with:

```sql
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
```

### Manual Database Creation

If you need to create databases manually:

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d postgres

# Create databases
CREATE DATABASE auth_db;
CREATE DATABASE product_db;
CREATE DATABASE customer_db;
CREATE DATABASE order_db;
CREATE DATABASE accounting_db;
CREATE DATABASE analytics_db;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE product_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE customer_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE order_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE accounting_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO postgres;
```

## 🗂️ Flyway Migration Structure

### Migration File Naming Convention

Flyway migrations follow this naming pattern:
```
V{version}__{description}.sql
```

Examples:
- `V0__create_database.sql` - Database initialization
- `V1__create_users_table.sql` - Create users table
- `V2__create_refresh_tokens_table.sql` - Create refresh tokens table

### Service Migration Directories

```
services/
├── auth-service/db/migration/
│   ├── V0__create_database.sql
│   ├── V1__create_users_table.sql
│   └── V2__create_refresh_tokens_table.sql
├── product-service/db/migration/
│   ├── V0__create_database.sql
│   ├── V1__create_products_table.sql
│   └── V2__create_inventory_table.sql
├── order-service/db/migration/
│   ├── V0__create_database.sql
│   ├── V1__create_orders_table.sql
│   └── V2__create_order_items_table.sql
└── ... (other services)
```

## 🧪 Testing Database Setup

### Automated Testing Script

Run the comprehensive test script:

```bash
# Linux/Mac
chmod +x test-database-setup.sh
./test-database-setup.sh

# Windows PowerShell
.\test-database-setup.ps1
```

### Manual Testing

```bash
# 1. Check if databases exist
docker-compose exec postgres psql -U postgres -d postgres -c "
SELECT datname, datowner, encoding 
FROM pg_database 
WHERE datname IN ('auth_db', 'product_db', 'customer_db', 'order_db', 'accounting_db', 'analytics_db')
ORDER BY datname;
"

# 2. Test Flyway migrations
docker-compose run --rm auth-flyway info
docker-compose run --rm product-flyway info

# 3. Check service health
curl http://localhost:5000/health/services
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Already Exists Error

**Problem**: `ERROR: database "auth_db" already exists`

**Solution**: The script handles this gracefully with the `IF NOT EXISTS` check.

#### 2. Permission Denied

**Problem**: `ERROR: permission denied for database`

**Solution**: Ensure the postgres user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
```

#### 3. Flyway Migration Fails

**Problem**: Flyway can't connect to database

**Solution**: Check database exists and is accessible:
```bash
docker-compose exec postgres psql -U postgres -d auth_db -c "SELECT 1;"
```

#### 4. Extension Not Found

**Problem**: `ERROR: extension "uuid-ossp" does not exist`

**Solution**: Install the extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Debug Commands

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Check Flyway logs
docker-compose logs auth-flyway

# Connect to specific database
docker-compose exec postgres psql -U postgres -d auth_db

# List all databases
docker-compose exec postgres psql -U postgres -d postgres -c "\l"

# Check migration status
docker-compose run --rm auth-flyway info
```

## 📊 Database Monitoring

### Health Checks

```bash
# Check all databases
docker-compose exec postgres psql -U postgres -d postgres -c "
SELECT 
    datname as database_name,
    numbackends as active_connections,
    xact_commit as committed_transactions,
    xact_rollback as rolled_back_transactions
FROM pg_stat_database 
WHERE datname IN ('auth_db', 'product_db', 'customer_db', 'order_db', 'accounting_db', 'analytics_db');
"

# Check table sizes
docker-compose exec postgres psql -U postgres -d auth_db -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Performance Monitoring

```bash
# Check active queries
docker-compose exec postgres psql -U postgres -d postgres -c "
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    state,
    query
FROM pg_stat_activity 
WHERE datname IN ('auth_db', 'product_db', 'customer_db', 'order_db', 'accounting_db', 'analytics_db');
"
```

## 🔄 Migration Management

### Adding New Migrations

1. Create a new migration file:
```bash
# Example: Add a new table to auth service
touch services/auth-service/db/migration/V3__create_user_sessions_table.sql
```

2. Write the migration SQL:
```sql
-- V3__create_user_sessions_table.sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
```

3. Run the migration:
```bash
docker-compose run --rm auth-flyway migrate
```

### Rolling Back Migrations

```bash
# Check migration history
docker-compose run --rm auth-flyway history

# Undo last migration (if supported)
docker-compose run --rm auth-flyway undo
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Run the test script: `./test-database-setup.sh`
3. Verify database connectivity
4. Check Flyway migration status

The database setup is designed to be robust and handle common scenarios automatically. The initialization script includes error handling and will not fail if databases already exist.
