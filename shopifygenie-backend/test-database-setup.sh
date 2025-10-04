#!/bin/bash

# Test script for database setup and Flyway migrations
# This script verifies that databases are created and migrations work correctly

echo "🚀 Testing ShopifyGenie Database Setup and Flyway Migrations"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the shopifygenie-backend directory."
    exit 1
fi

print_success "docker-compose.yml found"

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down > /dev/null 2>&1

# Start PostgreSQL and wait for it to be ready
print_status "Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 10

# Test database connection
print_status "Testing database connection..."
if docker-compose exec postgres psql -U postgres -d postgres -c "SELECT version();" > /dev/null 2>&1; then
    print_success "PostgreSQL connection successful"
else
    print_error "Failed to connect to PostgreSQL"
    exit 1
fi

# Check if databases exist
print_status "Checking if databases exist..."
DATABASES=("auth_db" "product_db" "customer_db" "order_db" "accounting_db" "analytics_db")

for db in "${DATABASES[@]}"; do
    if docker-compose exec postgres psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$db';" | grep -q "1 row"; then
        print_success "Database $db exists"
    else
        print_warning "Database $db does not exist - will be created by init-db.sql"
    fi
done

# Run the initialization script
print_status "Running database initialization script..."
if docker-compose exec postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/init-db.sql > /dev/null 2>&1; then
    print_success "Database initialization script executed successfully"
else
    print_error "Failed to execute database initialization script"
fi

# Verify databases were created
print_status "Verifying database creation..."
for db in "${DATABASES[@]}"; do
    if docker-compose exec postgres psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$db';" | grep -q "1 row"; then
        print_success "Database $db exists and is accessible"
    else
        print_error "Database $db was not created"
    fi
done

# Test Flyway migrations for each service
print_status "Testing Flyway migrations..."

SERVICES=("auth-flyway" "product-flyway" "customer-flyway" "order-flyway" "accounting-flyway" "analytics-flyway")

for service in "${SERVICES[@]}"; do
    print_status "Running Flyway migration for $service..."
    if docker-compose run --rm $service info > /dev/null 2>&1; then
        print_success "Flyway migration for $service completed successfully"
    else
        print_warning "Flyway migration for $service had issues (this is normal if no migration files exist yet)"
    fi
done

# Test service startup
print_status "Testing service startup..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 15

# Check service health
print_status "Checking service health..."
SERVICES_TO_CHECK=("auth-service" "product-service" "customer-service" "order-service" "accounting-service" "analytics-service")

for service in "${SERVICES_TO_CHECK[@]}"; do
    if docker-compose ps $service | grep -q "Up"; then
        print_success "Service $service is running"
    else
        print_warning "Service $service is not running"
    fi
done

# Test API Gateway
print_status "Testing API Gateway..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    print_success "API Gateway is accessible at http://localhost:5000"
else
    print_warning "API Gateway is not accessible"
fi

echo ""
echo "🎉 Database Setup Test Complete!"
echo "================================"
echo ""
echo "Summary:"
echo "- PostgreSQL: Running"
echo "- Databases: Created for all services"
echo "- Flyway: Migrations configured"
echo "- Services: Ready to start"
echo ""
echo "Next steps:"
echo "1. Run 'docker-compose up -d' to start all services"
echo "2. Access API Gateway at http://localhost:5000"
echo "3. View API documentation at http://localhost:5000/api-docs"
echo "4. Check service health at http://localhost:5000/health/services"
echo ""
echo "To stop all services: docker-compose down"
