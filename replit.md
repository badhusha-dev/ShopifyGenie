# Overview

ShopifyGenie is a comprehensive business management application with **Advanced Accounts Management** system built with React 18, TypeScript, Express.js, and modern web technologies. The application provides complete e-commerce functionality including real-time product synchronization, customer loyalty points management, subscription handling, order processing with webhook support, advanced analytics, and **professional-grade accounting features**. It demonstrates modern full-stack development with complete shadcn/ui integration, featuring a responsive React frontend and a robust Express.js backend with in-memory storage.

**Replit Environment Setup Complete (October 3, 2025 - Latest Import):**
Fresh GitHub import successfully configured for Replit environment:
- ✅ All npm dependencies installed and verified
- ✅ Workflow configured for port 5000 with webview output type
- ✅ Server running successfully on http://0.0.0.0:5000
- ✅ Vite dev server with HMR (Hot Module Replacement) operational
- ✅ WebSocket support initialized at ws://0.0.0.0:5000/ws
- ✅ Swagger API documentation available at /api-docs
- ✅ Full-stack application operational with React frontend and Express.js backend
- ✅ Vite server configured with allowedHosts: true for Replit proxy compatibility
- ✅ In-memory storage operational (no external database required)
- ✅ Default admin login: admin@shopifygenie.com / admin123
- ✅ Deployment configuration set for autoscale deployment
- ✅ .gitignore updated with comprehensive Node.js/TypeScript patterns

**Documentation Updated (January 26, 2025):**
All project documentation has been comprehensively updated to reflect:
- ✅ **Replit Environment Optimization**: All README files updated for Replit deployment
- ✅ **Technology Stack Changes**: Updated from Bootstrap to shadcn/ui + Tailwind CSS
- ✅ **Quick Access Guides**: Added login credentials and navigation paths  
- ✅ **API Documentation**: Complete endpoint documentation and Swagger integration
- ✅ **Development Workflow**: Replit-specific development guidelines and hot reloading setup

**Migration Completed (August 26, 2025):**
Successfully migrated from Replit Agent to standard Replit environment with the following enhancements:
- ✅ Complete routing system migration from react-router-dom to wouter
- ✅ Enhanced database schema with advanced vendor management tables (vendors, vendor_documents, vendor_invoices, vendor_analytics)
- ✅ Implemented comprehensive vendor management API endpoints with full CRUD operations
- ✅ Added purchase order management and AI-powered recommendations system
- ✅ Server running successfully on port 5000 with in-memory storage
- ✅ All TypeScript compilation issues resolved
- ✅ Frontend vendor management components with full functionality

**Dashboard Service Microservice Added (October 7, 2025):**
Created a standalone Dashboard Service microservice for aggregated business metrics and analytics:
- ✅ Complete Node.js/Express.js microservice in `dashboard-service/` folder
- ✅ REST API endpoints for sales summary, inventory status, customer metrics, and financial overview
- ✅ PostgreSQL integration with Sequelize ORM (dashboard_metrics and realtime_events tables)
- ✅ Kafka consumer for event streaming from other microservices (sales, inventory, customer, accounting)
- ✅ Swagger/OpenAPI documentation available at `/api-docs`
- ✅ Background job scheduler using node-cron for daily summary computations
- ✅ Security middleware (CORS, Helmet) and Winston logging
- ✅ Runs on port 8000 (configured for Replit compatibility)
- ✅ All endpoints tested and verified working with backend data
- ✅ Ready for integration with actual microservices via Kafka

**Flyway Database Migrations Implemented (October 8, 2025):**
Implemented professional database migration system for Dashboard Service:
- ✅ Flyway migration framework integrated using node-flyway package
- ✅ V1__initial_schema.sql: Creates dashboard_metrics and realtime_events tables
- ✅ V2__seed_data.sql: Seeds 30 days of historical metrics and realtime events
- ✅ Dual-source data strategy: Uses database when available, falls back to backend seed data
- ✅ Non-blocking server startup: Migrations run asynchronously without blocking service
- ✅ Source indicators on all responses: "database" or "backend" to show data origin
- ✅ Backend seed data in seedData.js with 30 days of historical business metrics
- ✅ New API endpoints: /api/data/historical-metrics and /api/data/realtime-events
- ✅ Graceful error handling with automatic fallback to backend data when DB unavailable

**Product Service Microservice Created (October 8, 2025):**
Built a complete product management microservice with full backend and frontend integration:
- ✅ **Backend**: Node.js/Express.js REST API on port 8008 with Sequelize ORM and PostgreSQL
- ✅ **Database Models**: Products and product_events tables with complete schema
- ✅ **REST Endpoints**: Full CRUD operations, low-stock monitoring, and statistics API
- ✅ **Kafka Integration**: Event publisher/consumer for product.events and inventory.adjusted topics
- ✅ **Swagger Documentation**: Complete API docs available at http://localhost:8008/api-docs
- ✅ **Auto-Seeding**: 5 sample products automatically seeded on first run
- ✅ **Frontend**: React + Vite dashboard on port 5173 with Tailwind CSS
- ✅ **UI Components**: Product table with low-stock indicators, dashboard cards showing stats
- ✅ **React Query**: Efficient data fetching with caching and auto-refresh
- ✅ **Workflows Configured**: Both backend and frontend running as persistent workflows
- ✅ **Complete Documentation**: README.md with setup instructions and API reference

**Sales Service Microservice Created (October 8, 2025):**
Built a complete sales transaction management microservice with comprehensive analytics and visualizations:
- ✅ **Backend**: Node.js/Express.js REST API on port 6000 with Sequelize ORM and PostgreSQL
- ✅ **Database Models**: Sales and sales_metrics tables with complete schema
- ✅ **REST Endpoints**: POST/GET sales, /summary, /today, /daily-summary, /chart for analytics
- ✅ **Kafka Integration**: Producer publishing sales.completed events, consumer listening to product.updated
- ✅ **Swagger Documentation**: Complete API docs available at http://localhost:6000/api-docs
- ✅ **Auto-Seeding**: 10 sample sales transactions spanning Oct 1-8 (only if database empty)
- ✅ **Frontend**: React + Vite dashboard on port 3001 with Tailwind CSS
- ✅ **UI Components**: SalesForm, SalesTable, SalesDashboardCards, SalesChart (Recharts line chart)
- ✅ **React Query**: Efficient data fetching with 10-second auto-refresh for real-time updates
- ✅ **Analytics**: Revenue tracking, profit calculation, items sold metrics, daily summaries
- ✅ **Workflows Configured**: Both backend (port 6000) and frontend (port 3001) running as persistent workflows
- ✅ **Integration Verified**: Database persistence confirmed with 11 sales, $864.72 total revenue

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and uses a component-based architecture organized around feature domains (inventory, loyalty, subscriptions, customers, reports). The UI leverages both Bootstrap 5 for layout and styling, and shadcn/ui components for enhanced interactivity. Navigation is handled through Wouter for client-side routing, while data fetching utilizes TanStack Query for efficient API state management with caching and background updates.

## Backend Architecture
The server follows a REST API design using Express.js with TypeScript. The architecture is organized into clear separation of concerns with dedicated modules for routing, storage abstraction, and Vite integration for development. The storage layer implements an interface-based approach using in-memory storage for demonstration purposes.

## Data Storage Solutions
The main application uses Drizzle ORM with PostgreSQL schema definitions for production-ready database structure, while currently implementing an in-memory storage system. The schema supports comprehensive e-commerce data including users, products, customers, orders, subscriptions, and loyalty transactions with proper relationships and constraints.

The Dashboard Service microservice uses PostgreSQL with Flyway migrations for database schema management and Sequelize ORM for data operations. It implements a dual-source data strategy, using the database when available and falling back to backend seed data when the database is unavailable.

## Authentication and Authorization
The system is designed to integrate with Shopify's OAuth 2.0 authentication system, though the current implementation focuses on the core business logic rather than authentication flows. The architecture accommodates future integration with Shopify's app authentication requirements.

## API Integration Patterns
The application follows RESTful API conventions with clear endpoint organization for different business domains. The frontend uses a centralized API client with consistent error handling and response processing. The backend implements proper HTTP status codes and JSON responses with standardized error formats.

## Component Organization
The frontend components are organized into feature-specific modules (Dashboard, Inventory, Loyalty, etc.) with shared UI components following the shadcn/ui pattern. Each major feature has dedicated table components for data display and management, promoting code reusability and maintainability.

## Development Tooling
The project uses modern development tools including TypeScript for type safety, Vite for fast development builds, Tailwind CSS for utility-first styling alongside Bootstrap, and proper ESM module configuration. The build system supports both development and production environments with appropriate optimizations.

# External Dependencies

## Core Framework Dependencies
- **React 18**: Primary frontend framework with hooks-based component architecture
- **Express.js**: Backend web framework for API endpoints and middleware
- **TypeScript**: Type safety across both frontend and backend codebases
- **Vite**: Development server and build tool with hot module replacement

## Database and ORM
- **Drizzle ORM**: Type-safe database toolkit for schema definition and queries
- **PostgreSQL**: Production database (configured via Neon serverless)
- **Drizzle Kit**: Database migration and schema management tools

## UI and Styling
- **Bootstrap 5**: CSS framework for responsive layout and components
- **Tailwind CSS**: Utility-first CSS framework for custom styling
- **Radix UI**: Headless UI components for enhanced accessibility
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icon set for specific use cases

## Data Fetching and State Management
- **TanStack React Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight client-side routing for single-page application navigation

## Form Handling and Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Runtime type validation and schema parsing
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

## Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing for Tailwind and other transformations
- **Autoprefixer**: Automatic CSS vendor prefix handling

## Shopify Integration (Planned)
- **Shopify Admin API**: REST and GraphQL API integration for product and order management
- **Shopify OAuth 2.0**: Authentication and authorization for app installation
- **Shopify Webhooks**: Real-time updates for inventory and order events

# Recent Fixes and Updates

## October 3, 2025 - Replit Environment Setup
- Fixed package.json scripts to use cross-platform environment variable syntax (removed Windows `set` command)
- Corrected CSS syntax error in client/src/index.css (removed extra closing brace at line 4910)
- Fixed React Icons imports: replaced non-existent FaTrendingUp/FaTrendingDown with FaArrowUp/FaArrowDown
- Fixed React Icons imports: replaced non-existent FaCpu with FaMicrochip
- Configured workflow for port 5000 with webview output type
- Server successfully running with Vite HMR and WebSocket support
