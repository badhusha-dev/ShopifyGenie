# Overview

ShopifyGenie is a comprehensive business management application featuring an **Advanced Accounts Management** system, designed to provide complete e-commerce functionality. It includes real-time product synchronization, customer loyalty points, subscription handling, order processing, advanced analytics, and **professional-grade accounting features**. The project aims to demonstrate modern full-stack development using a responsive React frontend and a robust Express.js backend, with a focus on microservices architecture for scalability.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React, utilizing a component-based architecture organized by feature domains. It leverages shadcn/ui components for enhanced interactivity and Tailwind CSS for styling. Wouter handles client-side routing, and TanStack Query manages efficient API state with caching and background updates.

## Backend Architecture
The backend follows a REST API design using Express.js with TypeScript. It's structured with clear separation of concerns, including dedicated modules for routing and storage abstraction. The application is evolving into a microservices architecture, with dedicated services for Dashboard, Product, Sales, and Customer management.

## Microservices Architecture
The application employs a microservices architecture, with each service running independently:
- **Dashboard Service**: Provides aggregated business metrics and analytics with PostgreSQL, Sequelize, and Kafka for event streaming. Utilizes Flyway for database migrations.
- **Product Service**: Manages product data with full CRUD operations, low-stock monitoring, and statistics. Uses PostgreSQL, Sequelize, and Kafka for event publishing/consumption.
- **Sales Service**: Handles sales transactions, analytics, and visualizations. Uses PostgreSQL, Sequelize, and Kafka for sales event processing.
- **Customer Service**: Manages customer data and an advanced 4-tier loyalty points system (Bronze, Silver, Gold, Platinum). Uses PostgreSQL, Sequelize, and Kafka for customer and loyalty events.

## Data Storage Solutions
The main application uses Drizzle ORM with PostgreSQL schema definitions (currently using in-memory storage for demonstration). Microservices like Dashboard, Product, Sales, and Customer each use PostgreSQL with Sequelize ORM for persistent data storage and Flyway for database migrations.

## UI/UX Decisions
The application primarily uses shadcn/ui components and Tailwind CSS for a modern, responsive design. Radix UI provides headless components, and Lucide React along with Font Awesome are used for iconography.

### Navigation System
- **Slide-Out Menu**: Streamlined navigation with a collapsible sidebar that slides out from the left
  - Hidden by default to maximize screen real estate
  - Smooth slide animation with cubic-bezier easing for professional feel
  - Overlay darkens the content when menu is open
  - Works consistently across all screen sizes (mobile, tablet, desktop)
  - Hamburger menu button in top navigation bar triggers the slide-out
  - Click outside or press overlay to close the menu

# External Dependencies

## Core Frameworks
- **React 18**: Frontend framework.
- **Express.js**: Backend web framework.
- **TypeScript**: Language for type safety.
- **Vite**: Development server and build tool.

## Database and ORM
- **PostgreSQL**: Primary database for microservices and planned for the main app.
- **Drizzle ORM**: For main application schema definition and queries.
- **Sequelize ORM**: Used by microservices for database interactions.
- **Flyway**: Database migration framework (used in Dashboard Service).

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Component library built on Radix UI.
- **Radix UI**: Headless UI components.
- **Lucide React & Font Awesome**: Icon libraries.

## Data Management
- **TanStack React Query**: Server state management and caching.
- **Wouter**: Lightweight client-side routing.

## Messaging Queue
- **Kafka**: For inter-service communication and event streaming between microservices.

## Form Handling and Validation
- **React Hook Form**: Form management.
- **Zod**: Schema validation.

## Planned Integrations
- **Shopify Admin API**: For product and order management.
- **Shopify OAuth 2.0**: For authentication.
- **Shopify Webhooks**: For real-time event updates.