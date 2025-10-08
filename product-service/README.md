# Product Service Microservice

A complete e-commerce product management microservice built with Node.js, Express, PostgreSQL, Kafka, and React.

## 🚀 Features

### Backend
- **REST API** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **Kafka** integration for event publishing/consuming
- **Swagger API Documentation** at `/api-docs`
- **Health Check** endpoint at `/health`
- Product CRUD operations
- Low stock monitoring
- Event-driven architecture

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Query** for data fetching
- Product table with stock indicators
- Dashboard cards showing statistics
- Real-time data refresh

## 📋 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Soft delete product
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/stats` - Get product statistics

### System
- `GET /health` - Health check
- `GET /api-docs` - Swagger documentation

## 🏃 Running the Service

### Backend
```bash
cd product-service
npm install
npm run dev
```
Backend runs on **port 8008**

### Frontend
```bash
cd product-service/frontend
npm install
npm run dev
```
Frontend runs on **port 5173**

## 🔗 Access Points

- **Backend API**: http://localhost:8008/api/products
- **Swagger Docs**: http://localhost:8008/api-docs
- **Frontend Dashboard**: http://localhost:5173
- **Health Check**: http://localhost:8008/health

## 📦 Database Schema

### Products Table
- id (UUID, Primary Key)
- name (String)
- category (String)
- sku (String, Unique)
- price (Decimal)
- stock (Integer)
- low_stock_threshold (Integer)
- is_active (Boolean)
- created_at, updated_at (Timestamps)

### Product Events Table
- id (Integer, Primary Key)
- event_type (String)
- product_id (Integer)
- payload (JSONB)
- created_at (Timestamp)

## 📡 Kafka Integration

### Published Events (Topic: `product.events`)
- `product.created` - When a new product is added
- `product.updated` - When product info is updated
- `product.deleted` - When a product is soft deleted

### Consumed Events (Topic: `inventory.adjusted`)
- Listens for inventory adjustments from other services
- Automatically updates product stock levels

## 🛠️ Environment Variables

```env
PORT=8008
DATABASE_URL=postgres://user:pass@localhost:5432/productdb
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=product-service
NODE_ENV=development
```

## 📊 Sample Data

The service auto-seeds with 5 sample products:
- Wireless Mouse (Electronics) - $29.99
- USB-C Cable (Accessories) - $15.99 (Low Stock)
- Laptop Stand (Office) - $45.00
- Mechanical Keyboard (Electronics) - $89.99 (Low Stock)
- Desk Organizer (Office) - $19.99

## 🔐 Security

- **Helmet.js** for HTTP security headers
- **CORS** enabled for cross-origin requests
- Input validation on all endpoints
- Soft delete implementation for data integrity

## 🧪 Testing

Test the API with curl:
```bash
# Get all products
curl http://localhost:8008/api/products

# Get product stats
curl http://localhost:8008/api/products/stats

# Get low stock products
curl http://localhost:8008/api/products/low-stock

# Create a product
curl -X POST http://localhost:8008/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","sku":"NEW-001","price":99.99,"stock":100,"category":"Test"}'
```

## 📈 Next Steps

1. **Connect to real Kafka** - Update KAFKA_BROKER with production broker URL
2. **Add authentication** - Secure endpoints with JWT tokens
3. **Add validation** - Implement request body validation with Joi/Zod
4. **Add tests** - Write unit and integration tests
5. **Deploy** - Use Docker for containerized deployment
