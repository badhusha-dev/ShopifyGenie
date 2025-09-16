@echo off
echo Starting ShopifyGenie Microservices Architecture...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Navigate to microservices directory
cd microservices

echo Building shared library...
cd shared-library
call mvn clean install -DskipTests
cd ..

echo Starting infrastructure services...
docker-compose up -d postgres zookeeper kafka

echo Waiting for infrastructure services to be ready...
timeout /t 30 /nobreak

echo Starting Eureka Server...
docker-compose up -d eureka-server

echo Waiting for Eureka Server to be ready...
timeout /t 15 /nobreak

echo Starting microservices...
docker-compose up -d auth-service customer-service api-gateway

echo Waiting for services to register with Eureka...
timeout /t 30 /nobreak

echo Checking service status...
docker-compose ps

echo.
echo Services are starting up. You can check the status at:
echo - Eureka Dashboard: http://localhost:8761
echo - API Gateway: http://localhost:8080
echo - Auth Service: http://localhost:8081
echo - Customer Service: http://localhost:8082
echo.
echo To view logs: docker-compose logs -f [service-name]
echo To stop all services: docker-compose down
pause
