
# ShopifyGenie - Microservices Architecture

A modern e-commerce management platform built with microservices architecture, featuring event-driven communication and scalable design.

## 🏗️ Architecture Overview

This application uses a microservices architecture with the following components:

### **Frontend**
- **React + TypeScript** - Modern UI with Vite build system
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Query** - Server state management

### **Backend Microservices**
- **Eureka Server** (Port 8761) - Service discovery and registration
- **API Gateway** (Port 8080) - Single entry point with load balancing
- **Auth Service** (Port 8081) - Authentication and user management
- **Customer Service** (Port 8082) - Customer management and loyalty programs
- **Product Service** (Port 8083) - Product/inventory management
- **Order Service** (Port 8084) - Order processing and management
- **Notification Service** (Port 8085) - Event-driven notifications

### **Infrastructure**
- **PostgreSQL** (Port 5432) - Primary database
- **Apache Kafka** (Port 9092) - Event streaming platform
- **Zookeeper** (Port 2181) - Kafka coordination service

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Java 17+

### Running the Application

1. **Start Microservices (Recommended)**
   ```bash
   cd microservices
   docker-compose up -d
   ```

2. **Start Frontend**
   ```bash
   npm install
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:8080
   - Eureka Dashboard: http://localhost:8761
## 📁 Project Structure

```
ShopifyGenie/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   └── lib/             # Utilities and API client
│   └── package.json
├── microservices/           # Backend microservices
│   ├── shared-library/      # Common DTOs and events
│   ├── eureka-server/      # Service discovery
│   ├── api-gateway/        # API Gateway
│   ├── auth-service/       # Authentication
│   ├── customer-service/   # Customer management
│   ├── product-service/    # Product management
│   ├── order-service/       # Order processing
│   ├── notification-service/ # Notifications
│   └── docker-compose.yml  # Docker orchestration
└── README.md
```

## 🔧 Development

### Frontend Development
```bash
cd client
npm install
npm run dev
```

### Microservices Development
```bash
cd microservices
# Start infrastructure
docker-compose up -d postgres kafka zookeeper

# Build shared library
cd shared-library
mvn clean install

# Start services individually
cd ../eureka-server
mvn spring-boot:run

cd ../api-gateway
mvn spring-boot:run

# ... and so on for other services
```

## 🌐 API Endpoints

All API requests go through the API Gateway at `http://localhost:8080/api`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer by ID
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product by ID
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/status` - Update order status

## 🔄 Event-Driven Architecture

The microservices communicate through Kafka events:

### Event Types
- **Customer Events**: `CUSTOMER_CREATED`, `CUSTOMER_UPDATED`, `LOYALTY_POINTS_ADDED`
- **Product Events**: `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `STOCK_UPDATED`
- **Order Events**: `ORDER_CREATED`, `ORDER_UPDATED`, `ORDER_COMPLETED`
- **Notification Events**: `USER_REGISTERED`, `LOYALTY_POINTS_ADDED`

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

## 🧪 Testing

```bash
# Test microservices
cd microservices
./test-microservices.sh

# Test frontend
cd client
npm run test
```

## 📊 Monitoring

- **Eureka Dashboard**: http://localhost:8761
- **Service Health**: `GET /actuator/health` on each service
- **Metrics**: `GET /actuator/metrics` on each service

## 🚀 Production Deployment

1. **Environment Variables**
   - Set production database URLs
   - Configure Kafka bootstrap servers
   - Set JWT secrets

2. **Scaling**
   - Scale individual services independently
   - Use load balancers for high availability
   - Implement circuit breakers

3. **Security**
   - Enable HTTPS
   - Implement proper authentication
   - Use secrets management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
