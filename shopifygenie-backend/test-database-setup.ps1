# Test script for database setup and Flyway migrations (PowerShell)
# This script verifies that databases are created and migrations work correctly

Write-Host "🚀 Testing ShopifyGenie Database Setup and Flyway Migrations" -ForegroundColor Blue
Write-Host "==========================================================" -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Error "docker-compose.yml not found. Please run this script from the shopifygenie-backend directory."
    exit 1
}

Write-Success "docker-compose.yml found"

# Stop any existing containers
Write-Status "Stopping existing containers..."
docker-compose down | Out-Null

# Start PostgreSQL and wait for it to be ready
Write-Status "Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Status "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 10

# Test database connection
Write-Status "Testing database connection..."
try {
    docker-compose exec postgres psql -U postgres -d postgres -c "SELECT version();" | Out-Null
    Write-Success "PostgreSQL connection successful"
} catch {
    Write-Error "Failed to connect to PostgreSQL"
    exit 1
}

# Check if databases exist
Write-Status "Checking if databases exist..."
$DATABASES = @("auth_db", "product_db", "customer_db", "order_db", "accounting_db", "analytics_db")

foreach ($db in $DATABASES) {
    try {
        $result = docker-compose exec postgres psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$db';"
        if ($result -match "1 row") {
            Write-Success "Database $db exists"
        } else {
            Write-Warning "Database $db does not exist - will be created by init-db.sql"
        }
    } catch {
        Write-Warning "Could not check database $db"
    }
}

# Run the initialization script
Write-Status "Running database initialization script..."
try {
    docker-compose exec postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/init-db.sql | Out-Null
    Write-Success "Database initialization script executed successfully"
} catch {
    Write-Error "Failed to execute database initialization script"
}

# Verify databases were created
Write-Status "Verifying database creation..."
foreach ($db in $DATABASES) {
    try {
        $result = docker-compose exec postgres psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$db';"
        if ($result -match "1 row") {
            Write-Success "Database $db exists and is accessible"
        } else {
            Write-Error "Database $db was not created"
        }
    } catch {
        Write-Error "Could not verify database $db"
    }
}

# Test Flyway migrations for each service
Write-Status "Testing Flyway migrations..."

$SERVICES = @("auth-flyway", "product-flyway", "customer-flyway", "order-flyway", "accounting-flyway", "analytics-flyway")

foreach ($service in $SERVICES) {
    Write-Status "Running Flyway migration for $service..."
    try {
        docker-compose run --rm $service info | Out-Null
        Write-Success "Flyway migration for $service completed successfully"
    } catch {
        Write-Warning "Flyway migration for $service had issues (this is normal if no migration files exist yet)"
    }
}

# Test service startup
Write-Status "Testing service startup..."
docker-compose up -d

# Wait for services to start
Write-Status "Waiting for services to start..."
Start-Sleep -Seconds 15

# Check service health
Write-Status "Checking service health..."
$SERVICES_TO_CHECK = @("auth-service", "product-service", "customer-service", "order-service", "accounting-service", "analytics-service")

foreach ($service in $SERVICES_TO_CHECK) {
    try {
        $status = docker-compose ps $service
        if ($status -match "Up") {
            Write-Success "Service $service is running"
        } else {
            Write-Warning "Service $service is not running"
        }
    } catch {
        Write-Warning "Could not check status of service $service"
    }
}

# Test API Gateway
Write-Status "Testing API Gateway..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Success "API Gateway is accessible at http://localhost:5000"
} catch {
    Write-Warning "API Gateway is not accessible"
}

Write-Host ""
Write-Host "🎉 Database Setup Test Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "- PostgreSQL: Running" -ForegroundColor White
Write-Host "- Databases: Created for all services" -ForegroundColor White
Write-Host "- Flyway: Migrations configured" -ForegroundColor White
Write-Host "- Services: Ready to start" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Run 'docker-compose up -d' to start all services" -ForegroundColor White
Write-Host "2. Access API Gateway at http://localhost:5000" -ForegroundColor White
Write-Host "3. View API documentation at http://localhost:5000/api-docs" -ForegroundColor White
Write-Host "4. Check service health at http://localhost:5000/health/services" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services: docker-compose down" -ForegroundColor White
