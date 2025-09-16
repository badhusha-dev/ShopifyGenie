# ShopifyGenie Microservices Architecture

This project has been restructured into a microservices architecture with Kafka integration for event-driven communication.

## Architecture Overview

The application is now split into the following microservices:

### Core Services

1. **Eureka Server** (Port: 8761)
   - Service discovery and registration
   - Central registry for all microservices

2. **API Gateway** (Port: 8080)
   - Single entry point for all client requests
   - Load balancing and routing
   - Circuit breaker pattern implementation

3. **Auth Service** (Port: 8081)
   - User authentication and authorization
   - JWT token management
   - User profile management

4. **Customer Service** (Port: 8082)
   - Customer management
   - Loyalty points system
   - Customer search and filtering

5. **Product Service** (Port: 8083)
   - Product/inventory management
   - Stock tracking
   - Product categorization

6. **Order Service** (Port: 8084)
   - Order processing and management
   - Order status tracking
   - Order analytics

7. **Notification Service** (Port: 8085)
   - Email notifications
   - Webhook management
   - Event processing

### Infrastructure Services

- **PostgreSQL** (Port: 5432) - Primary database
- **Apache Kafka** (Port: 9092) - Event streaming platform
- **Zookeeper** (Port: 2181) - Kafka coordination service

## Event-Driven Architecture

The microservices communicate through Kafka events:

### Event Types

1. **Customer Events**
   - `CUSTOMER_CREATED`
   - `CUSTOMER_UPDATED`
   - `CUSTOMER_DELETED`
   - `LOYALTY_POINTS_ADDED`
   - `LOYALTY_POINTS_USED`

2. **Product Events**
   - `PRODUCT_CREATED`
   - `PRODUCT_UPDATED`
   - `PRODUCT_DELETED`
   - `STOCK_UPDATED`

3. **Order Events**
   - `ORDER_CREATED`
   - `ORDER_UPDATED`
   - `ORDER_CANCELLED`
   - `ORDER_COMPLETED`

4. **Notification Events**
   - `USER_REGISTERED`
   - `USER_DELETED`
   - `LOYALTY_POINTS_ADDED`
   - `LOYALTY_POINTS_USED`

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Java 17+
- Maven 3.6+

### Running with Docker Compose

1. **Start all services:**
   ```bash
   cd microservices
   docker-compose up -d
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f [service-name]
   ```

### Running Locally

1. **Start Infrastructure Services:**
   ```bash
   # Start PostgreSQL
   docker run -d --name postgres -e POSTGRES_DB=shopify_genie -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=badsha@123 -p 5432:5432 postgres:15
   
   # Start Kafka and Zookeeper
   docker-compose -f docker-compose-infrastructure.yml up -d
   ```

2. **Build Shared Library:**
   ```bash
   cd microservices/shared-library
   mvn clean install
   ```

3. **Start Services in Order:**
   ```bash
   # 1. Eureka Server
   cd microservices/eureka-server
   mvn spring-boot:run
   
   # 2. API Gateway
   cd microservices/api-gateway
   mvn spring-boot:run
   
   # 3. Microservices
   cd microservices/auth-service
   mvn spring-boot:run
   
   cd microservices/customer-service
   mvn spring-boot:run
   
   # ... and so on for other services
   ```

## API Endpoints

All API requests go through the API Gateway at `http://localhost:8080`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer by ID
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer
- `GET /api/customers/search?q={query}` - Search customers
- `POST /api/customers/{id}/loyalty/add?points={points}` - Add loyalty points
- `POST /api/customers/{id}/loyalty/use?points={points}` - Use loyalty points

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product by ID
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/search?q={query}` - Search products
- `GET /api/products/category/{category}` - Get products by category

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/status?status={status}` - Update order status
- `POST /api/orders/{id}/cancel` - Cancel order
- `GET /api/orders/status/{status}` - Get orders by status
- `GET /api/orders/customer/{customerId}` - Get orders by customer

## Service Discovery

- **Eureka Dashboard:** http://localhost:8761
- **API Gateway:** http://localhost:8080

## Monitoring and Observability

### Health Checks
Each service exposes health check endpoints:
- `GET /actuator/health` - Service health status

### Metrics
- `GET /actuator/metrics` - Service metrics
- `GET /actuator/prometheus` - Prometheus metrics

## Development

### Adding New Microservices

1. Create service directory in `microservices/`
2. Add service to `docker-compose.yml`
3. Update API Gateway routes
4. Register service with Eureka

### Event-Driven Development

1. Define events in `shared-library`
2. Implement producers in relevant services
3. Implement consumers in interested services
4. Test event flow

## Troubleshooting

### Common Issues

1. **Service Discovery Issues:**
   - Ensure Eureka Server is running first
   - Check service registration in Eureka dashboard

2. **Kafka Connection Issues:**
   - Verify Kafka and Zookeeper are running
   - Check Kafka bootstrap servers configuration

3. **Database Connection Issues:**
   - Ensure PostgreSQL is running
   - Verify database credentials and connection string

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service
```

## Testing

### Run tests for a single service
```bash
cd microservices/auth-service
./mvnw test
```

### Run tests for all services (sequentially)
```bash
for d in auth-service customer-service product-service order-service notification-service api-gateway; do \
  (cd microservices/$d && ./mvnw -q test) || exit 1; \
done
```

Notes:
- Tests use a lightweight context-load approach by default. For services that require infrastructure beans (DB/Kafka/Eureka), tests activate a `test` profile and mock external beans.
- To add more tests, place them under `src/test/java` inside each service module.

## Production Considerations

1. **Security:**
   - Enable HTTPS
   - Implement proper authentication
   - Use secrets management

2. **Scalability:**
   - Configure horizontal scaling
   - Implement load balancing
   - Use database connection pooling

3. **Monitoring:**
   - Implement centralized logging
   - Set up metrics collection
   - Configure alerting

4. **Resilience:**
   - Implement circuit breakers
   - Configure retry policies
   - Set up health checks
