#!/bin/bash

echo "Testing ShopifyGenie Microservices..."

# Test Eureka Server
echo "Testing Eureka Server..."
curl -s http://localhost:8761/actuator/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Eureka Server is running"
else
    echo "✗ Eureka Server is not responding"
fi

# Test API Gateway
echo "Testing API Gateway..."
curl -s http://localhost:8080/actuator/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ API Gateway is running"
else
    echo "✗ API Gateway is not responding"
fi

# Test Auth Service
echo "Testing Auth Service..."
curl -s http://localhost:8081/actuator/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Auth Service is running"
else
    echo "✗ Auth Service is not responding"
fi

# Test Customer Service
echo "Testing Customer Service..."
curl -s http://localhost:8082/actuator/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Customer Service is running"
else
    echo "✗ Customer Service is not responding"
fi

# Test Kafka
echo "Testing Kafka..."
docker exec shopifygenie-kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Kafka is running"
else
    echo "✗ Kafka is not responding"
fi

echo ""
echo "Testing complete!"
echo "You can access the services at:"
echo "- Eureka Dashboard: http://localhost:8761"
echo "- API Gateway: http://localhost:8080"
echo "- Swagger UI: http://localhost:8080/swagger-ui.html"
