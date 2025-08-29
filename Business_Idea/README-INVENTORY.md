
# 📦 ShopifyApp Inventory Management Documentation

*Updated for Replit Environment - January 2025*

## Overview

The ShopifyApp Inventory Management system provides comprehensive tools for tracking products, managing stock levels, monitoring expiry dates, and optimizing inventory operations. Built with modern web technologies and optimized for the Replit development environment.

## 🚀 **Replit Ready Features**
- ✅ **Real-time Updates**: Live inventory tracking with WebSocket support
- ✅ **Interactive UI**: Modern shadcn/ui components with responsive design
- ✅ **API Integration**: Complete REST API with Swagger documentation
- ✅ **Sample Data**: Pre-populated inventory for testing and demonstration
- ✅ **Role-based Access**: Permission-controlled inventory operations

## 🎯 Key Features

### Product Management
- **Complete Product Catalog**: Name, description, pricing, and categorization
- **Stock Level Tracking**: Real-time inventory quantities across locations
- **Low Stock Alerts**: Automated notifications when inventory falls below thresholds
- **Product Categories**: Organized product classification system
- **Pricing Management**: Dynamic pricing with cost tracking

### Advanced Inventory Features
- **FIFO Tracking**: First-in-first-out inventory rotation
- **Expiry Date Management**: Track product expiration and receive alerts
- **Multi-location Support**: Inventory tracking across multiple warehouses
- **Batch/Lot Tracking**: Track supplier batches and lot numbers
- **Restock Recommendations**: AI-powered inventory optimization

### Stock Operations
- **Stock Adjustments**: Manual inventory corrections with audit trail
- **Stock Transfers**: Move inventory between locations
- **Stock Takes**: Physical inventory counting and reconciliation
- **Automated Reordering**: Set reorder points and quantities

## 🚀 Quick Access in Replit

### Accessing Inventory Features
1. **Login**: Use `admin@shopifyapp.com` / `admin123` for full access
2. **Navigation**: Access inventory modules via sidebar:
   - **Main Inventory**: `/inventory` - Product listing and management
   - **Advanced Inventory**: `/advanced-inventory` - FIFO, expiry tracking
   - **Stock Operations**: Direct from inventory table actions

### API Endpoints
Complete inventory API documentation at `/api-docs`:
- **GET** `/api/products` - List all products with filtering
- **POST** `/api/products` - Create new product
- **PUT** `/api/products/{id}` - Update product information
- **DELETE** `/api/products/{id}` - Remove product
- **GET** `/api/products/low-stock` - Low stock alerts
- **POST** `/api/products/{id}/restock` - Add stock levels

## 📊 Product Data Structure

### Core Product Fields

| Field | Type | Description | Required | Example |
|-------|------|-------------|----------|---------|
| `id` | UUID | Unique product identifier | Auto | `550e8400-e29b-...` |
| `name` | String | Product name | Yes | `Premium Widget` |
| `description` | Text | Product description | No | `High-quality widget...` |
| `price` | Decimal | Product price | Yes | `29.99` |
| `stock` | Integer | Current stock level | Yes | `150` |
| `lowStockThreshold` | Integer | Reorder alert level | No | `10` |
| `category` | String | Product category | No | `Electronics` |
| `status` | Enum | Product status | Yes | `active`, `inactive` |
| `shopifyId` | String | Shopify product ID | No | `gid://shopify/Product/...` |
| `shopDomain` | String | Associated shop | Yes | `demo-store.myshopify.com` |

### Advanced Inventory Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `expiryDate` | Date | Product expiration date | `2024-12-31` |
| `batchNumber` | String | Supplier batch/lot number | `BATCH-2024-001` |
| `supplierSku` | String | Supplier SKU code | `SUP-ABC-123` |
| `location` | String | Storage location | `Warehouse A, Shelf 5` |
| `costPrice` | Decimal | Product cost from supplier | `15.50` |
| `weight` | Decimal | Product weight (kg) | `2.5` |
| `dimensions` | JSON | Length/Width/Height | `{"l":10,"w":5,"h":3}` |

## 🛠️ Core Operations

### Creating Products

#### Via UI
1. Navigate to **Inventory** page
2. Click **"Add New Product"** button
3. Fill in product details:
   - Product name (required)
   - Description
   - Price (required)
   - Initial stock quantity
   - Category
   - Low stock threshold
4. Click **"Save Product"**

#### Via API
```bash
curl -X POST http://0.0.0.0:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Widget",
    "description": "High-quality widget for professionals",
    "price": "29.99",
    "stock": 100,
    "category": "Electronics",
    "lowStockThreshold": 10,
    "shopDomain": "demo-store.myshopify.com"
  }'
```

### Stock Management

#### Stock Adjustments
```typescript
// Increase stock
await fetch('/api/products/123/restock', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    quantity: 50,
    reason: 'Purchase order received',
    batchNumber: 'BATCH-2024-001'
  })
});

// Decrease stock (sale, damage, etc.)
await fetch('/api/products/123/adjust-stock', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    adjustment: -25,
    reason: 'Damaged goods',
    notes: 'Water damage during transport'
  })
});
```

#### FIFO Tracking
```typescript
// Record incoming inventory with FIFO
await fetch('/api/inventory/fifo-receipt', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    productId: '123',
    quantity: 100,
    costPrice: 15.50,
    batchNumber: 'BATCH-2024-001',
    expiryDate: '2024-12-31',
    supplierId: 'supplier-123'
  })
});

// Process sale with FIFO
await fetch('/api/inventory/fifo-sale', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    productId: '123',
    quantity: 25,
    salePrice: 29.99,
    orderId: 'order-456'
  })
});
```

## 📊 Inventory Analytics

### Stock Level Reports

#### Current Stock Summary
```json
{
  "totalProducts": 45,
  "totalStock": 2847,
  "lowStockProducts": 3,
  "outOfStockProducts": 1,
  "expiringProducts": 2,
  "totalValue": 89250.50
}
```

#### Low Stock Analysis
| Product | Current Stock | Threshold | Days of Stock | Action Needed |
|---------|---------------|-----------|---------------|---------------|
| Widget A | 5 | 10 | 3 | Order immediately |
| Widget B | 8 | 15 | 5 | Order soon |
| Widget C | 12 | 20 | 7 | Order planned |

### FIFO Analytics

#### Inventory Aging Report
| Product | Batch | Quantity | Age (Days) | Expiry Date | Status |
|---------|-------|----------|------------|-------------|--------|
| Widget A | BATCH-001 | 25 | 45 | 2024-06-30 | Normal |
| Widget B | BATCH-002 | 15 | 67 | 2024-05-15 | Expiring Soon |
| Widget C | BATCH-003 | 8 | 89 | 2024-04-30 | Expired |

#### Cost Analysis (FIFO)
```json
{
  "averageCostPrice": 15.75,
  "currentMargin": 47.2,
  "oldestBatchAge": 89,
  "fastestTurning": "Widget A",
  "slowestTurning": "Widget D"
}
```

## 🔔 Alert System

### Low Stock Alerts
- **Threshold-based**: Automatic alerts when stock falls below set levels
- **Predictive**: AI-powered alerts based on sales velocity
- **Multi-channel**: Email, in-app notifications, and dashboard alerts

### Expiry Alerts
- **30-day warning**: Products expiring within 30 days
- **7-day critical**: Products expiring within 7 days
- **Expired items**: Products past expiry date requiring action

### Stock Movement Alerts
- **Fast movers**: Products with unusually high sales velocity
- **Slow movers**: Products with low turnover requiring attention
- **Zero movement**: Products with no sales in defined period

## 🏪 Multi-location Management

### Location Setup
```typescript
// Create storage location
await fetch('/api/inventory/locations', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    name: 'Warehouse A',
    address: '123 Industrial Blvd, City, State',
    type: 'warehouse',
    capacity: 10000,
    managerId: 'user-123'
  })
});
```

### Stock Transfers
```typescript
// Transfer between locations
await fetch('/api/inventory/transfers', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    productId: '123',
    fromLocationId: 'loc-1',
    toLocationId: 'loc-2',
    quantity: 50,
    reason: 'Rebalancing stock levels',
    transferDate: '2024-01-25'
  })
});
```

## 🤖 AI-Powered Features

### Restock Recommendations
```json
{
  "productId": "123",
  "productName": "Premium Widget",
  "currentStock": 15,
  "recommendedOrder": 100,
  "reasoning": "Based on 30-day sales velocity of 25 units/week",
  "confidence": 87,
  "urgency": "medium",
  "costImpact": 1550.00
}
```

### Demand Forecasting
```json
{
  "productId": "123",
  "forecast": {
    "next7Days": 35,
    "next30Days": 150,
    "next90Days": 450
  },
  "confidence": 92,
  "seasonalTrends": {
    "peak": "Q4",
    "low": "Q1",
    "growth": "+12% YoY"
  }
}
```

## 📱 User Interface Features

### Inventory Dashboard
- **KPI Cards**: Total products, stock value, low stock count
- **Quick Actions**: Add product, bulk import, generate reports
- **Recent Activity**: Latest stock movements and adjustments
- **Alert Center**: Active alerts and notifications

### Product Table Features
- **Advanced Filtering**: By category, stock level, status, expiry
- **Bulk Operations**: Multi-select for bulk updates
- **Inline Editing**: Quick edits without leaving the table
- **Export Options**: CSV, Excel, PDF export capabilities

### Mobile Responsiveness
- **Responsive Design**: Optimized for tablets and smartphones
- **Touch-friendly**: Large buttons and swipe gestures
- **Offline Capability**: Basic functionality when offline
- **Barcode Scanning**: Camera-based product identification

## 🔐 Security & Permissions

### Role-based Access Control

| Role | View Products | Add Products | Edit Products | Delete Products | Manage Stock |
|------|---------------|--------------|---------------|----------------|--------------|
| **SuperAdmin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Staff** | ✅ | ❌ | ✅ (own) | ❌ | ✅ (adjustments) |
| **Customer** | ✅ (public) | ❌ | ❌ | ❌ | ❌ |

### Audit Trail
- **All Changes Logged**: Complete history of inventory modifications
- **User Attribution**: Track who made each change
- **Timestamp Tracking**: When changes were made
- **Reason Codes**: Why changes were made
- **Rollback Capability**: Undo incorrect changes

## 🔗 Integration Features

### Shopify Sync
- **Product Sync**: Bi-directional product information sync
- **Inventory Sync**: Real-time stock level updates
- **Order Processing**: Automatic inventory reduction on sales
- **Webhook Support**: Real-time updates from Shopify

### Third-party Integrations
- **Supplier APIs**: Direct integration with supplier systems
- **Shipping APIs**: Integration with logistics providers
- **Accounting Sync**: Integration with accounting systems
- **Barcode Systems**: Support for various barcode formats

## 🛠️ Development & Testing

### Sample Data
The system includes comprehensive sample data for testing:
```json
{
  "products": [
    {
      "name": "Wireless Bluetooth Headphones",
      "price": 79.99,
      "stock": 50,
      "category": "Electronics",
      "lowStockThreshold": 10
    },
    {
      "name": "Organic Coffee Beans",
      "price": 24.99,
      "stock": 75,
      "category": "Food & Beverage",
      "expiryDate": "2024-12-31"
    }
  ]
}
```

### Testing Scenarios
1. **Stock Management**: Add/remove inventory, test alerts
2. **FIFO Operations**: Create batches, process sales, verify costing
3. **Expiry Tracking**: Set expiry dates, test expiry alerts
4. **Multi-location**: Create locations, transfer stock
5. **Reorder Points**: Test automatic reorder suggestions

## 📈 Performance Optimization

### Database Optimization
- **Indexed Queries**: Optimized database queries for fast retrieval
- **Caching Layer**: In-memory caching for frequently accessed data
- **Pagination**: Efficient loading of large product catalogs
- **Background Jobs**: Async processing for heavy operations

### UI Performance
- **Virtual Scrolling**: Handle large product lists efficiently
- **Lazy Loading**: Load images and data on demand
- **Debounced Search**: Optimized search with reduced API calls
- **Progressive Loading**: Load critical data first

## 📚 Additional Resources

### API Documentation
- **Interactive Docs**: Complete API documentation at `/api-docs`
- **Code Examples**: Ready-to-use code snippets
- **Error Handling**: Comprehensive error response documentation
- **Rate Limiting**: API usage guidelines and limits

### Training Materials
- **User Guides**: Step-by-step operation guides
- **Video Tutorials**: Screen recordings of common tasks
- **Best Practices**: Recommended inventory management workflows
- **Troubleshooting**: Common issues and solutions

---

*This inventory management documentation provides comprehensive coverage of all product and stock management features in the ShopifyApp system. The system is optimized for the Replit development environment while maintaining production-ready standards.*

**Built for modern e-commerce inventory management**

*ShopifyApp Inventory - Intelligent stock management made simple*
