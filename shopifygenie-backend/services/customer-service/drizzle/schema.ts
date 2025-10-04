// Customer Service Database Schema
import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Customers table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  dateOfBirth: timestamp('date_of_birth'),
  gender: text('gender'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer loyalty points table
export const loyaltyPoints = pgTable('loyalty_points', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  points: integer('points').notNull().default(0),
  tier: text('tier', { enum: ['bronze', 'silver', 'gold', 'platinum'] }).default('bronze'),
  totalEarned: integer('total_earned').notNull().default(0),
  totalRedeemed: integer('total_redeemed').notNull().default(0),
  lastActivity: timestamp('last_activity'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Loyalty transactions table
export const loyaltyTransactions = pgTable('loyalty_transactions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['earn', 'redeem', 'expire', 'adjustment'] }).notNull(),
  points: integer('points').notNull(),
  description: text('description').notNull(),
  orderId: text('order_id'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customer preferences table
export const customerPreferences = pgTable('customer_preferences', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  preference: text('preference').notNull(),
  value: text('value'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer segments table
export const customerSegments = pgTable('customer_segments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  criteria: text('criteria').notNull(), // JSON string
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer segment assignments table
export const customerSegmentAssignments = pgTable('customer_segment_assignments', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  segmentId: text('segment_id').notNull().references(() => customerSegments.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPoints);
export const selectLoyaltyPointsSchema = createSelectSchema(loyaltyPoints);

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions);
export const selectLoyaltyTransactionSchema = createSelectSchema(loyaltyTransactions);

export const insertCustomerPreferenceSchema = createInsertSchema(customerPreferences);
export const selectCustomerPreferenceSchema = createSelectSchema(customerPreferences);

export const insertCustomerSegmentSchema = createInsertSchema(customerSegments);
export const selectCustomerSegmentSchema = createSelectSchema(customerSegments);

// Custom validation schemas
export const createCustomerSchema = insertCustomerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCustomerSchema = insertCustomerSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loyaltyTransactionSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(['earn', 'redeem', 'expire', 'adjustment']),
  points: z.number().int(),
  description: z.string().min(1).max(200),
  orderId: z.string().uuid().optional(),
  expiresAt: z.date().optional(),
});

export const createCustomerPreferenceSchema = insertCustomerPreferenceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createCustomerSegmentSchema = insertCustomerSegmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type NewLoyaltyPoints = typeof loyaltyPoints.$inferInsert;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type NewLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;
export type CustomerPreference = typeof customerPreferences.$inferSelect;
export type NewCustomerPreference = typeof customerPreferences.$inferInsert;
export type CustomerSegment = typeof customerSegments.$inferSelect;
export type NewCustomerSegment = typeof customerSegments.$inferInsert;

export type CreateCustomerRequest = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerRequest = z.infer<typeof updateCustomerSchema>;
export type LoyaltyTransactionRequest = z.infer<typeof loyaltyTransactionSchema>;
export type CreateCustomerPreferenceRequest = z.infer<typeof createCustomerPreferenceSchema>;
export type CreateCustomerSegmentRequest = z.infer<typeof createCustomerSegmentSchema>;
