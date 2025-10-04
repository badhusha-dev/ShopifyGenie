// Main shared module exports for ShopifyGenie microservices

export * from './types';
export * from './schemas';
export * from './utils';
export * from './kafka';

// Re-export commonly used items for convenience
export { schemas } from './schemas';
export { utils } from './utils';
export { kafkaService } from './kafka';
export type { User, Product, Customer, Order, ApiResponse, PaginatedResponse } from './types';
export type { EventMessage, OrderCreatedEvent, StockAdjustedEvent, PaymentProcessedEvent } from './kafka';
