// Order Service Database Schema
import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerId: text('customer_id').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] }).notNull().default('pending'),
  totalAmount: real('total_amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  shippingAddress: text('shipping_address').notNull(), // JSON string
  billingAddress: text('billing_address').notNull(), // JSON string
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  shippingMethod: text('shipping_method'),
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  productSku: text('product_sku'),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Order status history table
export const orderStatusHistory = pgTable('order_status_history', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] }).notNull(),
  notes: text('notes'),
  updatedBy: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  paymentMethod: text('payment_method').notNull(),
  paymentProvider: text('payment_provider').notNull(), // stripe, paypal, etc.
  transactionId: text('transaction_id'),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull().default('pending'),
  gatewayResponse: text('gateway_response'), // JSON string
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Shipping table
export const shipping = pgTable('shipping', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  carrier: text('carrier').notNull(),
  service: text('service').notNull(),
  trackingNumber: text('tracking_number'),
  status: text('status', { enum: ['pending', 'in_transit', 'delivered', 'exception'] }).notNull().default('pending'),
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  shippingAddress: text('shipping_address').notNull(), // JSON string
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory);
export const selectOrderStatusHistorySchema = createSelectSchema(orderStatusHistory);

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

export const insertShippingSchema = createInsertSchema(shipping);
export const selectShippingSchema = createSelectSchema(shipping);

// Custom validation schemas
export const createOrderSchema = insertOrderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrderSchema = insertOrderSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createOrderItemSchema = insertOrderItemSchema.omit({
  id: true,
  createdAt: true,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  notes: z.string().optional(),
});

export const createPaymentSchema = insertPaymentSchema.omit({
  id: true,
  createdAt: true,
});

export const createShippingSchema = insertShippingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Shipping = typeof shipping.$inferSelect;
export type NewShipping = typeof shipping.$inferInsert;

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
export type UpdateOrderRequest = z.infer<typeof updateOrderSchema>;
export type CreateOrderItemRequest = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof updateOrderStatusSchema>;
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export type CreateShippingRequest = z.infer<typeof createShippingSchema>;
