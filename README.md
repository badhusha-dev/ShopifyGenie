# ShopifyApp - Inventory & Loyalty Management

A simplified Shopify App built with React, Express.js, and Bootstrap for managing inventory, loyalty points, and subscriptions.

## Features

### 🎯 Core Features
- **Inventory Management**: Sync products from Shopify, track stock levels, low-stock alerts
- **Loyalty Points System**: Earn points on purchases ($1 spent = 1 point), customer dashboard
- **Basic Subscriptions**: Create and manage customer subscriptions
- **Customer Dashboard**: View order history, loyalty points, and subscription status
- **Real-time Webhooks**: Automatic inventory and loyalty updates from Shopify orders
- **Analytics & Reports**: Basic sales analytics and business insights

### 🛠️ Technical Stack
- **Frontend**: React + Bootstrap 5 + Font Awesome icons
- **Backend**: Express.js (Node.js)
- **Storage**: In-memory storage for demo purposes
- **Shopify Integration**: Admin API (REST + GraphQL) + OAuth 2.0
- **Styling**: Bootstrap 5 with custom Shopify-inspired theme

## Quick Start

### Prerequisites
- Node.js 16+ installed
- Shopify Partner account and test store
- Basic knowledge of React and Express.js

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopify-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Shopify app credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:5000/api

## Environment Variables

Create a `.env` file with the following variables:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,write_inventory
SHOPIFY_APP_URL=https://your-repl-name.replit.app
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here

# Database Configuration (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/shopify_app

# Session Configuration
SESSION_SECRET=your_session_secret_here_generate_random_string

# Port Configuration
PORT=5000

# Environment
NODE_ENV=development
```

## Shopify Integration Setup

### 1. Create Shopify Partner Account
1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Create a new app
3. Note down your API key and secret

### 2. Configure OAuth
- **App URL**: `https://your-repl-name.replit.app`
- **Allowed redirection URLs**: `https://your-repl-name.replit.app/auth/callback`

### 3. Configure Webhooks
Set up the following webhooks in your Shopify app:
- **Orders Create**: `https://your-repl-name.replit.app/webhooks/orders/create`

### 4. Test Integration
1. Click "Connect Shopify Store" in the dashboard
2. Authorize your test store
3. Use "Sync with Shopify" to pull data
