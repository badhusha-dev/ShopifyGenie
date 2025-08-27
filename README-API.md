
# ShopifyApp Backend API Documentation

*Updated for Replit Environment - January 2025*

## 🚀 **API Overview**

The ShopifyApp backend provides a comprehensive REST API built with Express.js and TypeScript, featuring authentication, business management, accounting, and AI-powered insights. The API is fully documented with Swagger/OpenAPI and optimized for the Replit development environment.

### ✅ **Replit Environment Ready**
- **Base URL**: `http://0.0.0.0:5000/api` (development)
- **Interactive Documentation**: `/api-docs` (Swagger UI)
- **WebSocket Endpoint**: `ws://0.0.0.0:5000/ws`
- **API Specification**: `/api-docs.json` (OpenAPI JSON)

## 📋 **Quick Start**

### Authentication
All protected endpoints require JWT authentication via Bearer token:

```bash
# Login to get token
curl -X POST http://0.0.0.0:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@shopifyapp.com", "password": "admin123"}'

# Use token in subsequent requests
curl -X GET http://0.0.0.0:5000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Default Credentials
- **Email**: `admin@shopifyapp.com`
- **Password**: `admin123`
- **Role**: Super Admin (full access)

## 🔐 **Authentication & Authorization**

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | User logout | No |

### Role-Based Access Control

| Role | Permissions | Description |
|------|-------------|-------------|
| **superadmin** | Full system access | Can manage users, roles, and system settings |
| **admin** | Business management | Can manage inventory, customers, orders, accounting |
| **staff** | Read/limited write | Can view reports, manage basic operations |
| **customer** | Own data only | Can view own orders, loyalty points, invoices |

### Permission System

Permissions are organized by modules and actions:

```typescript
// Permission format: "module:action"
permissions = {
  "inventory:view", "inventory:create", "inventory:edit", "inventory:delete",
  "customers:view", "customers:create", "customers:edit", "customers:delete",
  "orders:view", "orders:create", "orders:edit", "orders:delete",
  "accounting:view", "accounting:create", "accounting:edit", "accounting:delete",
  "reports:view", "reports:export",
  "users:view", "users:create", "users:edit", "users:delete",
  "settings:view", "settings:edit"
}
```

## 📊 **Core API Modules**

### 1. Dashboard & Analytics

#### Get Dashboard Statistics
```http
GET /api/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalRevenue": 15750.50,
  "totalOrders": 125,
  "totalCustomers": 89,
  "totalProducts": 45,
  "lowStockProducts": 3
}
```

#### Sales Trends
```http
GET /api/analytics/sales-trends
Authorization: Bearer {token}
```

#### Top Products
```http
GET /api/analytics/top-products
Authorization: Bearer {token}
```

### 2. Product & Inventory Management

#### Get All Products
```http
GET /api/products?shop={shopDomain}
Authorization: Bearer {token}
```

#### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Premium Widget",
  "description": "High-quality widget for professionals",
  "price": "29.99",
  "stock": 100,
  "category": "Electronics",
  "shopDomain": "demo-store.myshopify.com"
}
```

#### Update Product
```http
PUT /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": "39.99",
  "stock": 150
}
```

#### Low Stock Products
```http
GET /api/products/low-stock?threshold=10&shop={shopDomain}
```

### 3. Customer Management

#### Get All Customers
```http
GET /api/customers?shop={shopDomain}
Authorization: Bearer {token}
```

#### Create Customer
```http
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "loyaltyPoints": 0,
  "totalSpent": "0",
  "shopDomain": "demo-store.myshopify.com"
}
```

#### Get Customer Details
```http
GET /api/customers/{id}
Authorization: Bearer {token}
```

### 4. Order Management

#### Get All Orders
```http
GET /api/orders?shop={shopDomain}
Authorization: Bearer {token}
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "total": "99.99",
  "status": "pending",
  "shopDomain": "demo-store.myshopify.com"
}
```

#### Get Customer Orders
```http
GET /api/customers/{id}/orders
Authorization: Bearer {token}
```

### 5. Loyalty System

#### Get Loyalty Transactions
```http
GET /api/loyalty/transactions
Authorization: Bearer {token}
```

#### Redeem Points
```http
POST /api/customer/redeem-points
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "points": 100,
  "description": "Redeemed for 10% discount"
}
```

#### Get Customer Tier Info
```http
GET /api/loyalty/customer-tier/{customerId}
Authorization: Bearer {token}
```

### 6. Subscription Management

#### Get Subscriptions
```http
GET /api/subscriptions
Authorization: Bearer {token}
```

#### Create Subscription
```http
POST /api/subscriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "productId": "product-uuid",
  "frequency": "monthly",
  "price": "29.99",
  "status": "active"
}
```

## 💰 **Accounting Module API**

### Chart of Accounts

#### Get All Accounts
```http
GET /api/accounts
Authorization: Bearer {token}
```

#### Create Account
```http
POST /api/accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "accountCode": "1001",
  "accountName": "Cash - Operating Account",
  "accountType": "Asset",
  "accountSubtype": "Current Asset",
  "normalBalanceType": "Debit",
  "description": "Primary business checking account"
}
```

#### Get Accounts Hierarchy
```http
GET /api/accounts/hierarchy
Authorization: Bearer {token}
```

### Journal Entries

#### Get Journal Entries
```http
GET /api/journal-entries?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### Create Journal Entry
```http
POST /api/journal-entries
Authorization: Bearer {token}
Content-Type: application/json

{
  "transactionDate": "2024-01-15",
  "reference": "Order #1001",
  "description": "Sale of merchandise to customer",
  "lines": [
    {
      "accountId": "1001",
      "description": "Cash received from sale",
      "debitAmount": "159.00",
      "creditAmount": "0"
    },
    {
      "accountId": "4000",
      "description": "Sales revenue",
      "debitAmount": "0",
      "creditAmount": "140.00"
    },
    {
      "accountId": "2200",
      "description": "Sales tax collected",
      "debitAmount": "0",
      "creditAmount": "19.00"
    }
  ]
}
```

#### Post Journal Entry
```http
POST /api/journal-entries/{id}/post
Authorization: Bearer {token}
```

### General Ledger

#### Get General Ledger
```http
GET /api/general-ledger?accountId={accountId}&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### Get Account Ledger
```http
GET /api/general-ledger/account/{accountId}?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Accounts Receivable

#### Get All Receivables
```http
GET /api/accounts-receivable?status=pending
Authorization: Bearer {token}
```

#### Create Invoice
```http
POST /api/accounts-receivable
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "invoiceNumber": "INV-2024-001",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-14",
  "totalAmount": "159.00",
  "status": "pending"
}
```

#### Aging Report
```http
GET /api/accounts-receivable/aging-report
Authorization: Bearer {token}
```

### Accounts Payable

#### Get All Payables
```http
GET /api/accounts-payable?status=pending
Authorization: Bearer {token}
```

#### Create Bill
```http
POST /api/accounts-payable
Authorization: Bearer {token}
Content-Type: application/json

{
  "vendorId": "vendor-uuid",
  "billNumber": "BILL-2024-001",
  "billDate": "2024-01-20",
  "dueDate": "2024-02-19",
  "totalAmount": "850.00",
  "status": "pending"
}
```

### Wallets & Credits

#### Get Wallets
```http
GET /api/wallets?entityType=customer
Authorization: Bearer {token}
```

#### Adjust Wallet Balance
```http
POST /api/wallets/{id}/adjust
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.00,
  "description": "Loyalty reward credit"
}
```

### Financial Reports

#### Balance Sheet
```http
GET /api/reports/balance-sheet?asOfDate=2024-12-31
Authorization: Bearer {token}
```

#### Profit & Loss Statement
```http
GET /api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### Cash Flow Statement
```http
GET /api/reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### Trial Balance
```http
GET /api/reports/trial-balance?asOfDate=2024-12-31
Authorization: Bearer {token}
```

## 🏢 **Vendor Management API**

### Vendors

#### Get All Vendors
```http
GET /api/vendors?shop={shopDomain}
Authorization: Bearer {token}
```

#### Create Vendor
```http
POST /api/vendors
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "ABC Supplier",
  "email": "contact@abcsupplier.com",
  "phone": "+1-555-0123",
  "contactPerson": "John Smith",
  "address": "123 Business St, City, State 12345",
  "paymentTerms": "Net 30"
}
```

### Purchase Orders

#### Get Purchase Orders
```http
GET /api/purchase-orders?shop={shopDomain}
Authorization: Bearer {token}
```

#### Create Purchase Order
```http
POST /api/purchase-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "vendorId": "vendor-uuid",
  "orderDate": "2024-01-10",
  "expectedDelivery": "2024-01-20",
  "totalAmount": 2500.00,
  "status": "pending"
}
```

#### Receive Purchase Order
```http
POST /api/purchase-orders/{id}/receive
Authorization: Bearer {token}
Content-Type: application/json

{
  "receivedItems": [
    {
      "productId": "product-uuid",
      "quantityReceived": 100,
      "unitCost": "25.00"
    }
  ],
  "warehouseId": "warehouse-uuid"
}
```

### Vendor Analytics

#### Get Vendor Analytics
```http
GET /api/vendor-analytics?vendorId={vendorId}&days=90
Authorization: Bearer {token}
```

#### Purchase Order Recommendations
```http
GET /api/purchase-order-recommendations?warehouseId={warehouseId}
Authorization: Bearer {token}
```

## 🤖 **AI & Analytics API**

### AI Recommendations

#### Get Customer Recommendations
```http
GET /api/ai/recommendations/{customerId}?limit=5
Authorization: Bearer {token}
```

### Sales Forecasting

#### Get Sales Forecast
```http
GET /api/ai/sales-forecast?days=30
Authorization: Bearer {token}
```

**Response:**
```json
{
  "forecast": 125000,
  "confidence": 87,
  "dailyAverage": 4167,
  "historicalOrders": 156,
  "trends": {
    "growth": "+5%",
    "seasonal": "+10%",
    "overall": "positive"
  }
}
```

### Business Insights

#### Get Business Insights
```http
GET /api/ai/business-insights?days=30
Authorization: Bearer {token}
```

**Response:**
```json
{
  "healthScore": 78,
  "metrics": {
    "totalRevenue": 45230.50,
    "avgOrderValue": 125.30,
    "repeatRate": 34.5,
    "stockHealthScore": 82.1,
    "lowStockCount": 3
  },
  "insights": [
    {
      "type": "success",
      "message": "Strong 34.5% repeat customer rate indicates good customer satisfaction",
      "action": "Continue current customer retention strategies"
    }
  ]
}
```

## 👤 **User Management API**

### Users (Admin/SuperAdmin Only)

#### Get All Users
```http
GET /api/users?shop={shopDomain}
Authorization: Bearer {token}
```

#### Create User
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "staff"
}
```

#### Update User
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Smith",
  "role": "admin"
}
```

#### Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

### Role & Permission Management

#### Get User Permissions
```http
GET /api/user-permissions
Authorization: Bearer {token}
```

#### Get Role Permissions
```http
GET /api/role-permissions/{role}
Authorization: Bearer {token}
```

#### Update Role Permissions (SuperAdmin Only)
```http
PUT /api/role-permissions/{role}
Authorization: Bearer {token}
Content-Type: application/json

{
  "permissions": {
    "inventory:view": true,
    "inventory:create": true,
    "inventory:edit": false,
    "inventory:delete": false
  }
}
```

## 🔗 **Shopify Integration API**

### OAuth Authentication

#### Initialize OAuth
```http
GET /auth?shop={shopDomain}
```

#### OAuth Callback
```http
GET /auth/callback
```

### Data Synchronization

#### Sync All Data
```http
POST /api/shopify/sync
Content-Type: application/json

{
  "shop": "demo-store.myshopify.com"
}
```

### Webhooks

#### Order Created Webhook
```http
POST /webhooks/orders/create
X-Shopify-Hmac-Sha256: {signature}
X-Shopify-Shop-Domain: {shopDomain}
Content-Type: application/json

{
  "id": 12345,
  "email": "customer@example.com",
  "total_price": "159.00",
  "financial_status": "paid",
  "line_items": [...]
}
```

## ⚠️ **Error Handling**

### Standard Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

### Authentication Errors

```json
// Missing token
{
  "error": "No token provided",
  "statusCode": 401
}

// Invalid token
{
  "error": "Invalid token",
  "statusCode": 401
}

// Insufficient permissions
{
  "error": "Insufficient permissions",
  "statusCode": 403
}
```

### Validation Errors

```json
// Zod validation error
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "statusCode": 422
}
```

## 🧪 **Testing the API**

### Using Swagger UI

1. Navigate to `http://0.0.0.0:5000/api-docs`
2. Click "Authorize" and enter your Bearer token
3. Test endpoints interactively

### Using cURL

```bash
# Get auth token
TOKEN=$(curl -X POST http://0.0.0.0:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shopifyapp.com","password":"admin123"}' \
  | jq -r '.token')

# Test protected endpoint
curl -X GET http://0.0.0.0:5000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Login and get token
const loginResponse = await fetch('http://0.0.0.0:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@shopifyapp.com',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Use token for API calls
const productsResponse = await fetch('http://0.0.0.0:5000/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const products = await productsResponse.json();
```

## 🚀 **Rate Limiting & Performance**

### Rate Limits

- **Development**: 5000 requests per minute
- **Production**: 1000 requests per minute
- **Authentication**: 100 requests per minute

### Optimization Features

- **Response Caching**: In-memory caching for frequently accessed data
- **Query Optimization**: Efficient database queries with proper indexing
- **Compression**: Gzip compression for responses
- **Request Validation**: Early request validation to prevent unnecessary processing

## 🔄 **WebSocket API**

### Connection

```javascript
const ws = new WebSocket('ws://0.0.0.0:5000/ws');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Real-time Events

- **order:created** - New order notifications
- **inventory:low_stock** - Low stock alerts
- **customer:loyalty_update** - Loyalty point changes
- **system:notification** - System-wide notifications

## 📝 **API Versioning**

- **Current Version**: v1 (implicit in `/api/` endpoints)
- **Backwards Compatibility**: Maintained for at least 6 months
- **Deprecation Notices**: Announced 90 days in advance

## 🔧 **Development Environment**

### Local Development Setup

1. **Environment Variables**: Copy `.env.example` to `.env`
2. **Start Server**: Run `npm run dev`
3. **API Documentation**: Visit `/api-docs`
4. **Database**: In-memory storage (development)

### Production Configuration

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/shopifyapp
JWT_SECRET=your_production_jwt_secret
```

## 📚 **Additional Resources**

- **API Documentation**: `http://0.0.0.0:5000/api-docs` (Interactive Swagger UI)
- **OpenAPI Specification**: `http://0.0.0.0:5000/api-docs.json`
- **Main Documentation**: [README.md](README.md)
- **Accounting Module**: [README-ACCOUNTS.md](README-ACCOUNTS.md)
- **Design System**: [README-DESIGN.md](README-DESIGN.md)

---

**Built with Express.js, TypeScript, and modern API patterns**

*ShopifyApp API - Comprehensive business management platform*
