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
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers
SHOPIFY_APP_URL=your_app_url_here

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Port Configuration
PORT=5000
