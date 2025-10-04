# ShopifyGenie Microservices Backend

A comprehensive microservices architecture for Shopify e-commerce management, built with Express.js, TypeScript, and Docker.

## 🏗️ Architecture Overview

This backend consists of 6 microservices and 1 API Gateway:

- **API Gateway** (Port 5000) - Routes requests and handles authentication
- **Auth Service** (Port 5001) - JWT authentication, user management
- **Product Service** (Port 5002) - Inventory management, product catalog
- **Customer Service** (Port 5003) - Customer profiles, loyalty programs
- **Order Service** (Port 5004) - Order processing, payment handling
- **Accounting Service** (Port 5005) - Journal entries, financial reports
- **Analytics Service** (Port 5006) - Sales trends, AI recommendations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional)
- npm or yarn

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd shopifygenie-backend
npm run install:all
```

2. **Start all services in development mode:**
```bash
npm run dev
```

3. **Access the application:**
- API Gateway: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

### Docker Setup

1. **Build and start all services:**
```bash
npm run docker:build
npm run docker:up
```

2. **View logs:**
```bash
npm run docker:logs
```

3. **Stop services:**
```bash
npm run docker:down
```

## 🔐 Authentication

### Default Users

- **Super Admin**: `admin@shopifygenie.com` / `admin123`
- **Admin**: `admin@shopifyapp.com` / `admin123`
- **Staff**: `staff@shopifyapp.com` / `staff123`
- **Customer**: `customer@example.com` / `customer123`

### API Authentication

All protected endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:5000/products
```

## 📚 API Endpoints

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Products (`/products`)
- `GET /products` - List products (with pagination & filtering)
- `GET /products/:id` - Get product details
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:id/adjust-stock` - Adjust stock levels
- `GET /products/:id/stock-adjustments` - Get stock history
- `GET /inventory/alerts` - Get inventory alerts
- `GET /inventory/low-stock` - Get low stock products

### Customers (`/customers`)
- `GET /customers` - List customers
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/:id/loyalty-transactions` - Get loyalty history
- `POST /customers/:id/loyalty-transactions` - Add loyalty points
- `GET /customers/:id/analytics` - Get customer analytics
- `GET /customers/top-loyalty` - Get top customers

### Orders (`/orders`)
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status
- `POST /orders/:id/payment` - Process payment
- `GET /orders/analytics` - Get order analytics

### Accounting (`/accounts`, `/journal-entries`, `/reports`)
- `GET /accounts` - Chart of accounts
- `POST /accounts` - Create account
- `GET /journal-entries` - List journal entries
- `POST /journal-entries` - Create journal entry
- `GET /reports/financial` - Financial reports

### Analytics (`/analytics`, `/dashboard`)
- `GET /dashboard/stats` - Dashboard statistics
- `GET /analytics/trends` - Sales trends
- `GET /analytics/recommendations` - AI recommendations
- `GET /analytics/forecast` - Sales forecasting

## 🔌 WebSocket Support

Real-time updates via WebSocket:

```javascript
const socket = io('http://localhost:5000');

// Join order room for real-time updates
socket.emit('join-room', `order-${orderId}`);

// Listen for order updates
socket.on('order-update', (data) => {
  console.log('Order updated:', data);
});

// Listen for inventory alerts
socket.on('inventory-alert', (data) => {
  console.log('Inventory alert:', data);
});
```

## 🛠️ Development

### Project Structure

```
shopifygenie-backend/
├── api-gateway/           # API Gateway service
│   ├── index.ts
│   ├── package.json
│   └── Dockerfile
├── services/              # Microservices
│   ├── auth-service/
│   ├── product-service/
│   ├── customer-service/
│   ├── order-service/
│   ├── accounting-service/
│   └── analytics-service/
├── shared/                # Shared code
│   ├── types/            # TypeScript interfaces
│   ├── schemas/          # Zod validation schemas
│   └── utils/            # Utility functions
├── docker-compose.yml    # Docker orchestration
└── package.json         # Root package.json
```

### Adding New Services

1. Create service directory in `services/`
2. Add service configuration to `docker-compose.yml`
3. Update API Gateway routing
4. Add service URL to environment variables

### Environment Variables

```bash
# API Gateway
API_GATEWAY_PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000

# Service URLs (for API Gateway)
AUTH_SERVICE_URL=http://localhost:5001
PRODUCT_SERVICE_URL=http://localhost:5002
CUSTOMER_SERVICE_URL=http://localhost:5003
ORDER_SERVICE_URL=http://localhost:5004
ACCOUNTING_SERVICE_URL=http://localhost:5005
ANALYTICS_SERVICE_URL=http://localhost:5006
```

## 🧪 Testing

### Health Checks

Check individual service health:
```bash
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # Product Service
curl http://localhost:5003/health  # Customer Service
curl http://localhost:5004/health  # Order Service
curl http://localhost:5005/health  # Accounting Service
curl http://localhost:5006/health  # Analytics Service
```

Check all services via API Gateway:
```bash
curl http://localhost:5000/health/services
```

### Sample API Calls

**Login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shopifygenie.com","password":"admin123"}'
```

**Get Products:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/products
```

**Create Order:**
```bash
curl -X POST http://localhost:5000/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_001",
    "items": [
      {"productId": "product_001", "quantity": 2, "price": "99.99"}
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

## 🚀 Production Deployment

### Docker Production

1. **Build production images:**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy with environment variables:**
```bash
export JWT_SECRET=your-production-secret
export CORS_ORIGIN=https://yourdomain.com
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

Create `.env` file:
```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=https://yourdomain.com
```

## 📊 Monitoring

### Health Monitoring

Each service provides health check endpoints:
- Individual service health: `GET /health`
- Service status via API Gateway: `GET /health/services`

### Logging

All services use structured logging with timestamps and service identification.

### Metrics

Services expose basic metrics:
- Request count
- Response times
- Error rates
- Active connections (WebSocket)

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 5000-5006 are available
2. **Service communication**: Check service URLs in API Gateway
3. **Authentication**: Verify JWT_SECRET is consistent across services
4. **CORS issues**: Update CORS_ORIGIN environment variable

### Debug Mode

Enable debug logging:
```bash
DEBUG=shopifygenie:* npm run dev
```

### Service Dependencies

Services start in this order:
1. Auth Service (no dependencies)
2. Product Service (no dependencies)
3. Customer Service (no dependencies)
4. Order Service (depends on Product/Customer)
5. Accounting Service (no dependencies)
6. Analytics Service (no dependencies)
7. API Gateway (depends on all services)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api-docs`

---

**ShopifyGenie Microservices Backend** - Built with ❤️ for modern e-commerce management.
