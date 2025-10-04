// Product Service Database Schema
import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shopifyId: text('shopify_id'),
  sku: text('sku'),
  stock: integer('stock').notNull().default(0),
  price: text('price'),
  category: text('category'),
  imageUrl: text('image_url'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Stock adjustments table
export const stockAdjustments = pgTable('stock_adjustments', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  reason: text('reason').notNull(),
  type: text('type', { enum: ['increase', 'decrease'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by'),
});

// Inventory alerts table
export const inventoryAlerts = pgTable('inventory_alerts', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  productName: text('product_name').notNull(),
  currentStock: integer('current_stock').notNull(),
  threshold: integer('threshold').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  resolved: boolean('resolved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vendors table
export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  contactPerson: text('contact_person'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product vendors relationship
export const productVendors = pgTable('product_vendors', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  vendorId: text('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),
  vendorSku: text('vendor_sku'),
  costPrice: text('cost_price'),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertStockAdjustmentSchema = createInsertSchema(stockAdjustments);
export const selectStockAdjustmentSchema = createSelectSchema(stockAdjustments);

export const insertInventoryAlertSchema = createInsertSchema(inventoryAlerts);
export const selectInventoryAlertSchema = createSelectSchema(inventoryAlerts);

export const insertVendorSchema = createInsertSchema(vendors);
export const selectVendorSchema = createSelectSchema(vendors);

// Custom validation schemas
export const createProductSchema = insertProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = insertProductSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().min(1).max(200),
  type: z.enum(['increase', 'decrease']),
});

export const createVendorSchema = insertVendorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVendorSchema = insertVendorSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type StockAdjustment = typeof stockAdjustments.$inferSelect;
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert;
export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type NewInventoryAlert = typeof inventoryAlerts.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type StockAdjustmentRequest = z.infer<typeof stockAdjustmentSchema>;
export type CreateVendorRequest = z.infer<typeof createVendorSchema>;
export type UpdateVendorRequest = z.infer<typeof updateVendorSchema>;
