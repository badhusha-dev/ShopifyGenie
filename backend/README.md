# ShopifyGenie Backend

A Spring Boot 3 backend application that can operate in **dual mode**:
- **Standalone E-commerce System** (when Shopify is not connected)
- **Shopify-integrated App** (when user configures Shopify credentials)

## Features

- **Spring Boot 3** with Java 17
- **JWT Authentication** for secure API access
- **PostgreSQL Database** with Spring Data JPA
- **Dual Mode Operation**:
  - Standalone e-commerce with local database
  - Shopify integration with automatic sync
- **E-commerce Core Modules**:
  - Products: CRUD operations with inventory management
  - Customers: CRUD with loyalty points system
  - Orders: Full order lifecycle management
- **Shopify Integration** with REST and GraphQL APIs
- **Webhook Support** with HMAC validation
- **OpenAPI Documentation** with Swagger UI
- **User Management** with role-based access
- **Shopify Configuration Management** per user/store

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Docker (optional)

## Quick Start

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE shopify_genie;
CREATE USER shopify_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE shopify_genie TO shopify_user;
```

### 2. Environment Configuration

Create `application-local.yml` or set environment variables:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shopify_genie
    username: shopify_user
    password: your_password

jwt:
  secret: your-256-bit-secret-key-here-make-it-long-and-secure
  expiration: 86400000

shopify:
  api-version: 2024-01
  webhook-secret: your-webhook-secret
  client-id: your-client-id
  client-secret: your-client-secret
```

### 3. Build and Run

```bash
# Build the application
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/api-docs`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and get JWT token

### E-commerce Core (Standalone Mode)

#### Products
- `GET /api/products` - Get user's products (from local DB or Shopify)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (syncs to Shopify if configured)
- `PUT /api/products/{id}` - Update product (syncs to Shopify if configured)
- `DELETE /api/products/{id}` - Delete product (marks as inactive)
- `GET /api/products/search?q={term}` - Search products
- `GET /api/products/category/{category}` - Get products by category
- `POST /api/products/sync/shopify` - Sync products from Shopify

#### Customers
- `GET /api/customers` - Get user's customers (from local DB or Shopify)
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create customer (syncs to Shopify if configured)
- `PUT /api/customers/{id}` - Update customer (syncs to Shopify if configured)
- `DELETE /api/customers/{id}` - Delete customer (marks as inactive)
- `GET /api/customers/search?q={term}` - Search customers
- `POST /api/customers/{id}/loyalty/add?points={points}` - Add loyalty points
- `POST /api/customers/{id}/loyalty/use?points={points}` - Use loyalty points
- `POST /api/customers/sync/shopify` - Sync customers from Shopify

#### Orders
- `GET /api/orders` - Get user's orders (from local DB or Shopify)
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create order (syncs to Shopify if configured)
- `PUT /api/orders/{id}/status?status={status}` - Update order status
- `POST /api/orders/{id}/cancel` - Cancel order (restores stock)
- `GET /api/orders/status/{status}` - Get orders by status
- `GET /api/orders/customer/{customerId}` - Get orders by customer
- `GET /api/orders/date-range?startDate={date}&endDate={date}` - Get orders by date range
- `GET /api/orders/stats/count/{status}` - Get order count by status
- `GET /api/orders/stats/revenue/{status}` - Get total revenue by status
- `POST /api/orders/sync/shopify` - Sync orders from Shopify

### Shopify Configuration

- `POST /api/config/shopify` - Save Shopify credentials
- `GET /api/config/shopify` - Get user's Shopify configurations
- `GET /api/config/shopify/{id}` - Get specific configuration
- `PUT /api/config/shopify/{id}` - Update configuration
- `DELETE /api/config/shopify/{id}` - Delete configuration

### Shopify API Integration

- `GET /api/shopify/products` - Fetch products from Shopify
- `POST /api/shopify/products` - Create product in Shopify
- `PUT /api/shopify/products/{id}` - Update product in Shopify
- `GET /api/shopify/orders` - Fetch orders from Shopify
- `POST /api/shopify/orders` - Create order in Shopify
- `GET /api/shopify/customers` - Fetch customers from Shopify
- `POST /api/shopify/graphql` - Execute GraphQL queries

### Webhooks

- `POST /api/webhooks/orders/create` - Handle order creation webhook
- `POST /api/webhooks/products/update` - Handle product update webhook
- `POST /api/webhooks/customers/create` - Handle customer creation webhook
- `POST /api/webhooks/app/uninstalled` - Handle app uninstall webhook

## Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login and Get JWT Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. Save Shopify Configuration

```bash
curl -X POST http://localhost:8080/api/config/shopify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shopDomain": "your-shop.myshopify.com",
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret",
    "accessToken": "your-access-token",
    "scopes": "read_products,write_products,read_orders"
  }'
```

### 4. Create a Product (Works in both modes)

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "description": "A sample product description",
    "price": 29.99,
    "stock": 100,
    "category": "Electronics"
  }'
```

### 5. Create a Customer (Works in both modes)

```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  }'
```

### 6. Create an Order (Works in both modes)

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "orderItems": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Main St, City, State",
    "billingAddress": "123 Main St, City, State"
  }'
```

### 7. Sync from Shopify (Shopify mode only)

```bash
curl -X POST http://localhost:8080/api/products/sync/shopify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dual Mode Operation

### Standalone Mode (No Shopify Configuration)
- All e-commerce operations work with local PostgreSQL database
- Products, customers, and orders are stored locally
- Full CRUD operations available
- No external dependencies

### Shopify Integration Mode (With Shopify Configuration)
- Automatic sync between local database and Shopify
- Local operations sync to Shopify (if configured)
- Shopify webhooks sync to local database
- Fallback to local operations if Shopify sync fails
- Manual sync endpoints available

## Security

- **JWT Authentication**: All API endpoints (except auth and webhooks) require JWT authentication
- **HMAC Validation**: Webhooks are validated using Shopify's HMAC signature
- **User Isolation**: Users can only access their own data and configurations
- **Password Encryption**: Passwords are encrypted using BCrypt
- **Data Validation**: All inputs validated using Bean Validation
- **CORS Configuration**: Configured to allow requests from frontend development servers

### CORS Settings
The backend allows cross-origin requests from:
- **Vite Dev Server**: `http://localhost:5000` (primary)
- **React Dev Server**: `http://localhost:3000`
- **Vite Default**: `http://localhost:5173`
- **Localhost Variants**: `http://127.0.0.1:*` for all ports

CORS configuration includes:
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Allowed headers: All headers (including Authorization for JWT)
- Credentials: Enabled for authentication
- Preflight caching: 1 hour

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Encrypted password
- `role` - User role (USER, ADMIN)
- `enabled` - Account status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Products Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `name` - Product name
- `description` - Product description
- `price` - Product price (decimal)
- `stock` - Available stock quantity
- `category` - Product category
- `shopify_product_id` - Shopify product ID (if synced)
- `shopify_variant_id` - Shopify variant ID (if synced)
- `is_active` - Product status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Customers Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `name` - Customer name
- `email` - Customer email (unique per user)
- `phone` - Customer phone
- `address` - Customer address
- `loyalty_points` - Loyalty points balance
- `shopify_customer_id` - Shopify customer ID (if synced)
- `is_active` - Customer status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Orders Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `customer_id` - Foreign key to customers table
- `total` - Order total amount
- `status` - Order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- `shipping_address` - Shipping address
- `billing_address` - Billing address
- `shopify_order_id` - Shopify order ID (if synced)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Order Items Table
- `id` - Primary key
- `order_id` - Foreign key to orders table
- `product_id` - Foreign key to products table
- `quantity` - Item quantity
- `unit_price` - Unit price at time of order
- `total_price` - Total price for this item

### Shopify Configs Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `shop_domain` - Shopify shop domain
- `api_key` - Shopify API key
- `api_secret` - Shopify API secret
- `access_token` - Shopify access token
- `scopes` - Granted scopes
- `token_expires_at` - Token expiration
- `is_active` - Configuration status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Testing CORS Configuration

To verify that CORS is properly configured, you can use the provided test script or manual curl commands:

### Using the Test Script
```bash
# Make sure the backend is running first
./test-cors.sh
```

### Manual Testing
To verify that CORS is properly configured, you can test with a simple curl command:

```bash
# Test CORS preflight request
curl -X OPTIONS http://localhost:8080/api/products \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

Expected response headers should include:
- `Access-Control-Allow-Origin: http://localhost:5000`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS`
- `Access-Control-Allow-Headers: *`
- `Access-Control-Allow-Credentials: true`

### Frontend Integration Test

From your React/Vite frontend, you can test the connection:

```javascript
// Test API connection
fetch('http://localhost:8080/api/products', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Development

### Project Structure

```
src/main/java/com/shopifygenie/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities
├── repository/     # Data access layer
├── security/       # Security configuration
├── service/        # Business logic
└── util/           # Utility classes
```

### Running Tests

```bash
mvn test
```

### Docker Support

```bash
# Build Docker image
docker build -t shopify-genie-backend .

# Run with Docker
docker run -p 8080:8080 shopify-genie-backend
```

## Configuration

### Application Properties

| Property | Description | Default |
|----------|-------------|---------|
| `spring.datasource.url` | Database URL | `jdbc:postgresql://localhost:5432/shopify_genie` |
| `jwt.secret` | JWT signing secret | Required |
| `jwt.expiration` | JWT expiration time (ms) | `86400000` |
| `shopify.api-version` | Shopify API version | `2024-01` |
| `shopify.webhook-secret` | Webhook HMAC secret | Required |
| `server.port` | Application port | `8080` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
