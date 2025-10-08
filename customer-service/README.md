# Customer Service Microservice

Customer Service microservice for managing customer profiles, loyalty points, and analytics in a Shopify-like business management system.

## Features

- **Customer Management**: Register, update, view, and deactivate customers
- **Loyalty Program**: Automatic points calculation and tier management
- **Tier System**: Bronze (0-99), Silver (100-499), Gold (500-999), Platinum (1000+)
- **Real-time Analytics**: Customer metrics and loyalty distribution
- **Kafka Integration**: Event-driven architecture for sales processing
- **React Dashboard**: Real-time customer visualization with auto-refresh

## Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL with Sequelize ORM
- KafkaJS for event streaming
- Winston for logging
- Swagger UI for API documentation

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Query for data fetching
- Recharts for loyalty visualization

## Installation

### Backend
```bash
cd customer-service
npm install
npm run dev
```

### Frontend
```bash
cd customer-service/frontend
npm install
npm run dev
```

## API Endpoints

### Customer Management
- `POST /api/customers` - Register new customer
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Deactivate customer

### Analytics & Loyalty
- `GET /api/customers/loyalty` - Get loyalty tiers
- `GET /api/customers/analytics` - Get customer analytics

### Documentation
- Swagger UI: http://localhost:5004/api-docs
- Health Check: http://localhost:5004/health

## Loyalty Points Logic

- **Points Calculation**: 1 point per $10 spent
- **Tier Thresholds**:
  - Bronze: 0-99 points (0% discount)
  - Silver: 100-499 points (5% discount)
  - Gold: 500-999 points (10% discount)
  - Platinum: 1000+ points (15% discount)

## Kafka Integration

**Consumes:**
- `sales.completed` - Adds loyalty points to customer

**Publishes:**
- `customer.registered` - New customer created
- `customer.updated` - Customer information updated
- `customer.tier-upgraded` - Customer reached new loyalty tier

## Environment Variables

```env
PORT=5004
DATABASE_URL=postgres://user:pass@localhost:5432/customerdb
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=customer-service
NODE_ENV=development
```

## Sample Data

The service automatically seeds 8 sample customers with varying loyalty tiers on first run.

## Frontend Dashboard

Access the customer dashboard at http://localhost:3002

Features:
- Customer registration form
- Real-time customer table with tier badges
- Summary cards (total, active, inactive customers)
- Loyalty tier distribution pie chart
- Auto-refresh every 10 seconds
