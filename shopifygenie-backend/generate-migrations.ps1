# Generate Drizzle migrations for all services
Write-Host "Generating Drizzle migrations for all services..." -ForegroundColor Green

# Auth Service
Write-Host "Generating migrations for Auth Service..." -ForegroundColor Yellow
Set-Location services/auth-service
npx drizzle-kit generate
Set-Location ../..

# Product Service
Write-Host "Generating migrations for Product Service..." -ForegroundColor Yellow
Set-Location services/product-service
npx drizzle-kit generate
Set-Location ../..

# Customer Service
Write-Host "Generating migrations for Customer Service..." -ForegroundColor Yellow
Set-Location services/customer-service
npx drizzle-kit generate
Set-Location ../..

# Order Service
Write-Host "Generating migrations for Order Service..." -ForegroundColor Yellow
Set-Location services/order-service
npx drizzle-kit generate
Set-Location ../..

# Accounting Service
Write-Host "Generating migrations for Accounting Service..." -ForegroundColor Yellow
Set-Location services/accounting-service
npx drizzle-kit generate
Set-Location ../..

# Analytics Service
Write-Host "Generating migrations for Analytics Service..." -ForegroundColor Yellow
Set-Location services/analytics-service
npx drizzle-kit generate
Set-Location ../..

Write-Host "All migrations generated successfully!" -ForegroundColor Green
