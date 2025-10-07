# Dashboard Service - Quick Start Guide

## 🚀 Running the Service

### Option 1: Using the start script
```bash
cd dashboard-service
./start.sh
```

### Option 2: Using Node directly
```bash
cd dashboard-service
PORT=8000 node src/server.js
```

### Option 3: Using npm (if you add to package.json)
```bash
cd dashboard-service
npm start
```

## 📡 Available Endpoints

Once running on port 8000, you can access:

### Health Check
```bash
curl http://localhost:8000/health
```

### Sales Summary
```bash
curl http://localhost:8000/api/dashboard/sales-summary
```
Returns: `{"success":true,"data":{"totalSales":125000,"totalRevenue":145000,"totalProfit":45000,"date":"2025-10-07"}}`

### Inventory Status
```bash
curl http://localhost:8000/api/dashboard/inventory-status
```
Returns: `{"success":true,"data":{"lowStockCount":15,"totalItems":342,"date":"2025-10-07"}}`

### Customer Metrics
```bash
curl http://localhost:8000/api/dashboard/customer-metrics
```
Returns: `{"success":true,"data":{"newCustomers":28,"activeCustomers":1547,"churnRate":2.3,"date":"2025-10-07"}}`

### Financial Overview
```bash
curl http://localhost:8000/api/dashboard/financial-overview
```
Returns: `{"success":true,"data":{"cashFlow":89000,"accountsReceivable":67000,"accountsPayable":34000,"date":"2025-10-07"}}`

### API Documentation (Swagger UI)
Open in browser: `http://localhost:8000/api-docs`

## 📊 Test All Endpoints at Once

```bash
# Health check
curl http://localhost:8000/health

# All dashboard endpoints
curl http://localhost:8000/api/dashboard/sales-summary
curl http://localhost:8000/api/dashboard/inventory-status
curl http://localhost:8000/api/dashboard/customer-metrics
curl http://localhost:8000/api/dashboard/financial-overview
```

## 🔧 Configuration

Environment variables (in `.env`):
- `PORT=8000` - Service port
- `DATABASE_URL` - PostgreSQL connection string
- `KAFKA_BROKER` - Kafka broker address (optional)
- `KAFKA_CLIENT_ID` - Kafka client identifier
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (info/debug/error)

## 🗃️ Database

The service automatically creates two tables:
- `dashboard_metrics` - Stores aggregated daily metrics
- `realtime_events` - Stores event data from Kafka consumers

## 📨 Kafka Integration

The service listens to these topics (when Kafka is configured):
- `sales.completed` (sales-service)
- `inventory.updated` (inventory-service)
- `customer.registered` (customer-service)
- `transaction.recorded` (accounting-service)

## 🕐 Background Jobs

A cron job runs daily at midnight to compute summary metrics.

## ✅ Verified Working

All endpoints tested and confirmed working with mock data.
Ready for integration with actual microservices.
