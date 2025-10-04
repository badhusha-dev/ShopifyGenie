#!/bin/bash

# Generate Drizzle migrations for all services
echo "Generating Drizzle migrations for all services..."

# Auth Service
echo "Generating migrations for Auth Service..."
cd services/auth-service
npx drizzle-kit generate
cd ../..

# Product Service
echo "Generating migrations for Product Service..."
cd services/product-service
npx drizzle-kit generate
cd ../..

# Customer Service
echo "Generating migrations for Customer Service..."
cd services/customer-service
npx drizzle-kit generate
cd ../..

# Order Service
echo "Generating migrations for Order Service..."
cd services/order-service
npx drizzle-kit generate
cd ../..

# Accounting Service
echo "Generating migrations for Accounting Service..."
cd services/accounting-service
npx drizzle-kit generate
cd ../..

# Analytics Service
echo "Generating migrations for Analytics Service..."
cd services/analytics-service
npx drizzle-kit generate
cd ../..

echo "All migrations generated successfully!"
