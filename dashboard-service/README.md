# Dashboard Service

A microservice for aggregated business metrics and real-time analytics in a Shopify-like business management system.

## 🎯 Overview

This service provides REST API endpoints for business KPIs and consumes events from other microservices via Kafka to aggregate metrics in real-time.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Kafka broker (optional for development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database and Kafka settings
```

3. Run the service:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

Once running, access the Swagger UI documentation at:
```
http://localhost:5001/api-docs
```

## 🔌 API Endpoints

### Dashboard Metrics

- **GET** `/api/dashboard/sales-summary`
  - Returns total sales, revenue, and profit
  
- **GET** `/api/dashboard/inventory-status`
  - Returns low stock count and total items
  
- **GET** `/api/dashboard/customer-metrics`
  - Returns new customers, active customers, and churn rate
  
- **GET** `/api/dashboard/financial-overview`
  - Returns cash flow, receivables, and payables

- **GET** `/api/dashboard/realtime`
  - WebSocket endpoint information (stub)

### Health Check

- **GET** `/health`
  - Service health status

## 📡 Kafka Topics

The service consumes events from:

- `sales.completed` (from sales-service)
- `inventory.updated` (from inventory-service)
- `customer.registered` (from customer-service)
- `transaction.recorded` (from accounting-service)

## 🗄️ Database Schema

### Tables

**dashboard_metrics**
- Stores daily aggregated metrics
- Fields: date, totalSales, totalRevenue, totalProfit, lowStockCount, totalItems, newCustomers, activeCustomers, churnRate, cashFlow, accountsReceivable, accountsPayable

**realtime_events**
- Stores real-time event data
- Fields: eventType, eventSource, eventData, processedAt

## 🔧 Configuration

Environment variables (.env):

```
PORT=5001
DATABASE_URL=postgresql://user:pass@localhost:5432/dashboarddb
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=dashboard-service
NODE_ENV=development
LOG_LEVEL=info
```

## 📁 Project Structure

```
dashboard-service/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── kafka.js
│   │   ├── logger.js
│   │   └── swagger.js
│   ├── controllers/
│   │   └── dashboardController.js
│   ├── routes/
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   └── dashboardService.js
│   ├── models/
│   │   ├── DashboardMetrics.js
│   │   ├── RealtimeEvents.js
│   │   └── index.js
│   ├── kafka/
│   │   └── consumer.js
│   ├── utils/
│   │   ├── cronJobs.js
│   │   └── errorHandler.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## 🕐 Background Jobs

Daily summary computation runs at midnight using node-cron:
- Aggregates previous day's metrics
- Logs summary statistics

## 🔒 Security

- Helmet.js for security headers
- CORS enabled
- Error handling middleware
- Input validation (implement as needed)

## 🧪 Testing

Example request:
```bash
curl http://localhost:5001/api/dashboard/sales-summary
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalSales": 125000.00,
    "totalRevenue": 145000.00,
    "totalProfit": 45000.00,
    "date": "2025-10-07"
  }
}
```

## 📝 Notes

- Service uses mock/seed data for initial development
- Kafka consumer will retry connection if broker is unavailable
- Database tables are auto-created on first run (Sequelize sync)
- Service continues running even if Kafka/DB are unavailable

## 🚢 Deployment

For Replit deployment:
1. Set environment variables in Replit Secrets
2. Ensure PostgreSQL database is provisioned
3. Configure Kafka broker (or skip for development)
4. Run with `npm start`
