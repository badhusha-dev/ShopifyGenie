# 🚀 Event-Driven Architecture Example: OrderCreated → StockAdjusted Flow

This document demonstrates the complete event-driven flow in the ShopifyGenie microservices architecture.

## 📋 Overview

When a new order is created, the following event-driven flow occurs:

1. **Order Service** creates an order and publishes `OrderCreated` event
2. **Product Service** consumes `OrderCreated` event and adjusts inventory
3. **Product Service** publishes `StockAdjusted` event
4. **Accounting Service** can consume both events for financial processing

## 🔄 Complete Event Flow

### 1. Order Creation (Order Service)

```typescript
// POST /orders
{
  "customerId": "customer-001",
  "items": [
    {
      "productId": "product-001",
      "quantity": 2,
      "unitPrice": 99.99
    },
    {
      "productId": "product-002", 
      "quantity": 1,
      "unitPrice": 49.99
    }
  ],
  "totalAmount": 249.97,
  "currency": "USD",
  "shippingAddress": {...},
  "billingAddress": {...}
}
```

### 2. OrderCreated Event Published

```typescript
// Published to 'order-events' topic
{
  "eventType": "OrderCreated",
  "data": {
    "orderId": "order-123",
    "orderNumber": "ORD-1704364800000",
    "customerId": "customer-001",
    "items": [
      {
        "productId": "product-001",
        "quantity": 2,
        "unitPrice": 99.99
      },
      {
        "productId": "product-002",
        "quantity": 1, 
        "unitPrice": 49.99
      }
    ],
    "totalAmount": 249.97,
    "currency": "USD"
  },
  "timestamp": "2024-01-04T10:00:00.000Z",
  "source": "order-service",
  "version": "1.0"
}
```

### 3. Product Service Consumes OrderCreated

```typescript
// Product Service event handler
async function handleOrderCreatedEvent(event: EventMessage) {
  const orderData = event.data as OrderCreatedEvent;
  
  for (const item of orderData.items) {
    // Get current inventory
    const inventory = await db.select()
      .from(stockAdjustments)
      .where(eq(stockAdjustments.productId, item.productId));
    
    const currentRecord = inventory[0];
    const newQuantity = currentRecord.quantityOnHand - item.quantity;
    
    // Update inventory
    await db.update(stockAdjustments)
      .set({ 
        quantityOnHand: newQuantity,
        updatedAt: new Date()
      })
      .where(eq(stockAdjustments.productId, item.productId));
    
    // Publish StockAdjusted event
    await kafkaService.publishStockAdjusted({
      productId: item.productId,
      quantityAdjusted: -item.quantity,
      newQuantity: newQuantity,
      reason: `Order ${orderData.orderNumber} - Inventory reserved`,
      orderId: orderData.orderId
    });
  }
}
```

### 4. StockAdjusted Event Published

```typescript
// Published to 'inventory-events' topic
{
  "eventType": "StockAdjusted",
  "data": {
    "productId": "product-001",
    "quantityAdjusted": -2,
    "newQuantity": 98,
    "reason": "Order ORD-1704364800000 - Inventory reserved",
    "orderId": "order-123"
  },
  "timestamp": "2024-01-04T10:00:01.000Z",
  "source": "product-service",
  "version": "1.0"
}
```

### 5. Low Stock Alert (if applicable)

```typescript
// If newQuantity <= reorderPoint
{
  "id": "alert-456",
  "productId": "product-001",
  "alertType": "low_stock",
  "message": "Low stock alert: Product product-001 has 8 units remaining (reorder point: 10)",
  "severity": "warning",
  "isResolved": false,
  "createdAt": "2024-01-04T10:00:01.000Z"
}
```

## 🏗️ Database Schema Updates

### Before Order Creation

```sql
-- Inventory table
SELECT * FROM inventory WHERE product_id = 'product-001';
-- Result: quantity_on_hand = 100, reorder_point = 10
```

### After Order Processing

```sql
-- Inventory table
SELECT * FROM inventory WHERE product_id = 'product-001';
-- Result: quantity_on_hand = 98, reorder_point = 10

-- Inventory alerts (if low stock)
SELECT * FROM inventory_alerts WHERE product_id = 'product-001';
-- Result: New low stock alert created
```

## 🎯 Testing the Flow

### 1. Start Services with Kafka

```bash
cd shopifygenie-backend
docker-compose up -d zookeeper kafka postgres
npm run dev
```

### 2. Create an Order

```bash
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "customerId": "customer-001",
    "items": [
      {
        "productId": "product-001",
        "quantity": 5,
        "unitPrice": 99.99
      }
    ],
    "totalAmount": 499.95,
    "currency": "USD",
    "shippingAddress": {...},
    "billingAddress": {...}
  }'
```

### 3. Monitor Events

Check the logs to see:
- Order Service: "OrderCreated event published"
- Product Service: "Processing OrderCreated event"
- Product Service: "Stock adjusted for product"
- Product Service: "StockAdjusted event published"

### 4. Verify Inventory Update

```bash
curl -X GET http://localhost:5000/products/product-001/inventory \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🔍 Event Monitoring

### Kafka Topics Created

- `order-events` - Order-related events
- `inventory-events` - Inventory-related events  
- `payment-events` - Payment-related events

### Event Types

- `OrderCreated` - New order placed
- `StockAdjusted` - Inventory quantity changed
- `PaymentProcessed` - Payment completed
- `OrderStatusChanged` - Order status updated

## 🚨 Error Handling

### Event Processing Failures

- Retry mechanism built into KafkaJS
- Dead letter queue for failed messages
- Graceful degradation (order creation succeeds even if events fail)

### Database Transaction Safety

- Each event handler runs in its own transaction
- Rollback on processing failure
- Idempotent event processing

## 📊 Monitoring & Observability

### Logs to Monitor

```bash
# Order Service logs
"OrderCreated event published for order: order-123"

# Product Service logs  
"Processing OrderCreated event for order: order-123"
"Stock adjusted for product product-001: -5 (new quantity: 95)"
"StockAdjusted event published"

# Low stock alerts
"Low stock alert created for product: product-001"
```

### Health Checks

```bash
# Check service health
curl http://localhost:5000/health/services

# Check Kafka connectivity
curl http://localhost:5002/health  # Product Service
curl http://localhost:5004/health  # Order Service
```

This event-driven architecture ensures loose coupling between services while maintaining data consistency and providing real-time inventory updates across the system.
