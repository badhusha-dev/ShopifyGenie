// Analytics Service Database Schema
import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Analytics events table
export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(),
  entityType: text('entity_type').notNull(), // order, product, customer, etc.
  entityId: text('entity_id').notNull(),
  properties: text('properties').notNull(), // JSON string
  userId: text('user_id'),
  sessionId: text('session_id'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Sales analytics table
export const salesAnalytics = pgTable('sales_analytics', {
  id: text('id').primaryKey(),
  date: timestamp('date').notNull(),
  totalSales: real('total_sales').notNull(),
  totalOrders: integer('total_orders').notNull(),
  averageOrderValue: real('average_order_value').notNull(),
  newCustomers: integer('new_customers').notNull().default(0),
  returningCustomers: integer('returning_customers').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product analytics table
export const productAnalytics = pgTable('product_analytics', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  date: timestamp('date').notNull(),
  views: integer('views').notNull().default(0),
  purchases: integer('purchases').notNull().default(0),
  revenue: real('revenue').notNull().default(0),
  conversionRate: real('conversion_rate').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer analytics table
export const customerAnalytics = pgTable('customer_analytics', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  date: timestamp('date').notNull(),
  totalSpent: real('total_spent').notNull().default(0),
  totalOrders: integer('total_orders').notNull().default(0),
  averageOrderValue: real('average_order_value').notNull().default(0),
  lastPurchaseDate: timestamp('last_purchase_date'),
  customerLifetimeValue: real('customer_lifetime_value').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forecasting models table
export const forecastingModels = pgTable('forecasting_models', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['sales', 'inventory', 'demand', 'revenue'] }).notNull(),
  entityId: text('entity_id'), // product_id, category_id, etc.
  modelData: text('model_data').notNull(), // JSON string containing model parameters
  accuracy: real('accuracy'),
  lastTrained: timestamp('last_trained'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forecasting predictions table
export const forecastingPredictions = pgTable('forecasting_predictions', {
  id: text('id').primaryKey(),
  modelId: text('model_id').notNull().references(() => forecastingModels.id, { onDelete: 'cascade' }),
  predictionDate: timestamp('prediction_date').notNull(),
  predictedValue: real('predicted_value').notNull(),
  confidence: real('confidence').notNull(),
  actualValue: real('actual_value'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reports table
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['sales', 'product', 'customer', 'inventory', 'custom'] }).notNull(),
  parameters: text('parameters').notNull(), // JSON string
  data: text('data').notNull(), // JSON string containing report data
  generatedBy: text('generated_by').notNull(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// Dashboard widgets table
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  widgetType: text('widget_type').notNull(),
  title: text('title').notNull(),
  configuration: text('configuration').notNull(), // JSON string
  position: integer('position').notNull(),
  size: text('size', { enum: ['small', 'medium', 'large'] }).notNull().default('medium'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents);
export const selectAnalyticsEventSchema = createSelectSchema(analyticsEvents);

export const insertSalesAnalyticsSchema = createInsertSchema(salesAnalytics);
export const selectSalesAnalyticsSchema = createSelectSchema(salesAnalytics);

export const insertProductAnalyticsSchema = createInsertSchema(productAnalytics);
export const selectProductAnalyticsSchema = createSelectSchema(productAnalytics);

export const insertCustomerAnalyticsSchema = createInsertSchema(customerAnalytics);
export const selectCustomerAnalyticsSchema = createSelectSchema(customerAnalytics);

export const insertForecastingModelSchema = createInsertSchema(forecastingModels);
export const selectForecastingModelSchema = createSelectSchema(forecastingModels);

export const insertForecastingPredictionSchema = createInsertSchema(forecastingPredictions);
export const selectForecastingPredictionSchema = createSelectSchema(forecastingPredictions);

export const insertReportSchema = createInsertSchema(reports);
export const selectReportSchema = createSelectSchema(reports);

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets);
export const selectDashboardWidgetSchema = createSelectSchema(dashboardWidgets);

// Custom validation schemas
export const createAnalyticsEventSchema = insertAnalyticsEventSchema.omit({
  id: true,
  createdAt: true,
});

export const createSalesAnalyticsSchema = insertSalesAnalyticsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createProductAnalyticsSchema = insertProductAnalyticsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createCustomerAnalyticsSchema = insertCustomerAnalyticsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createForecastingModelSchema = insertForecastingModelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createForecastingPredictionSchema = insertForecastingPredictionSchema.omit({
  id: true,
  createdAt: true,
});

export const createReportSchema = insertReportSchema.omit({
  id: true,
  generatedAt: true,
});

export const createDashboardWidgetSchema = insertDashboardWidgetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDashboardWidgetSchema = insertDashboardWidgetSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type SalesAnalytics = typeof salesAnalytics.$inferSelect;
export type NewSalesAnalytics = typeof salesAnalytics.$inferInsert;
export type ProductAnalytics = typeof productAnalytics.$inferSelect;
export type NewProductAnalytics = typeof productAnalytics.$inferInsert;
export type CustomerAnalytics = typeof customerAnalytics.$inferSelect;
export type NewCustomerAnalytics = typeof customerAnalytics.$inferInsert;
export type ForecastingModel = typeof forecastingModels.$inferSelect;
export type NewForecastingModel = typeof forecastingModels.$inferInsert;
export type ForecastingPrediction = typeof forecastingPredictions.$inferSelect;
export type NewForecastingPrediction = typeof forecastingPredictions.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type NewDashboardWidget = typeof dashboardWidgets.$inferInsert;

export type CreateAnalyticsEventRequest = z.infer<typeof createAnalyticsEventSchema>;
export type CreateSalesAnalyticsRequest = z.infer<typeof createSalesAnalyticsSchema>;
export type CreateProductAnalyticsRequest = z.infer<typeof createProductAnalyticsSchema>;
export type CreateCustomerAnalyticsRequest = z.infer<typeof createCustomerAnalyticsSchema>;
export type CreateForecastingModelRequest = z.infer<typeof createForecastingModelSchema>;
export type CreateForecastingPredictionRequest = z.infer<typeof createForecastingPredictionSchema>;
export type CreateReportRequest = z.infer<typeof createReportSchema>;
export type CreateDashboardWidgetRequest = z.infer<typeof createDashboardWidgetSchema>;
export type UpdateDashboardWidgetRequest = z.infer<typeof updateDashboardWidgetSchema>;
