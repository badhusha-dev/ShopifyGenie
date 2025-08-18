# Overview

ShopifyApp is a simplified inventory and loyalty management system built as a Shopify integration. The application provides core e-commerce functionality including product inventory tracking, customer loyalty points management, subscription handling, and basic analytics. It serves as a demonstration of modern full-stack development with Shopify API integration, featuring a clean React frontend with Bootstrap styling and an Express.js backend with in-memory storage for demo purposes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and uses a component-based architecture organized around feature domains (inventory, loyalty, subscriptions, customers, reports). The UI leverages both Bootstrap 5 for layout and styling, and shadcn/ui components for enhanced interactivity. Navigation is handled through Wouter for client-side routing, while data fetching utilizes TanStack Query for efficient API state management with caching and background updates.

## Backend Architecture
The server follows a REST API design using Express.js with TypeScript. The architecture is organized into clear separation of concerns with dedicated modules for routing, storage abstraction, and Vite integration for development. The storage layer implements an interface-based approach that currently uses in-memory storage but can be easily swapped for persistent databases.

## Data Storage Solutions
The application uses Drizzle ORM with PostgreSQL schema definitions for production-ready database structure, while currently implementing an in-memory storage system for demonstration purposes. The schema supports comprehensive e-commerce data including users, products, customers, orders, subscriptions, and loyalty transactions with proper relationships and constraints.

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