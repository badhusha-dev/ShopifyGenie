import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('customer'), // superadmin, admin, staff, customer
  permissions: text("permissions"), // JSON string of permissions
  shopDomain: text("shop_domain"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // e.g., "inventory:view"
  category: text("category").notNull(), // e.g., "inventory", "orders"
  operation: text("operation").notNull(), // e.g., "view", "create", "edit", "delete"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // superadmin, admin, staff, customer
  permissionName: text("permission_name").notNull(),
  granted: boolean("granted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopifyId: text("shopify_id").unique(),
  name: text("name").notNull(),
  sku: text("sku").unique(),
  stock: integer("stock").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: text("category"),
  imageUrl: text("image_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopifyId: text("shopify_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopifyId: text("shopify_id").unique(),
  customerId: varchar("customer_id").references(() => customers.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  productId: varchar("product_id").references(() => products.id),
  status: text("status").notNull().default('active'), // active, paused, cancelled
  frequency: text("frequency").notNull(), // monthly, weekly, etc.
  nextDelivery: timestamp("next_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  orderId: varchar("order_id").references(() => orders.id),
  points: integer("points").notNull(),
  type: text("type").notNull(), // earned, redeemed
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Inventory & Multi-Vendor Tables
export const warehouses = pgTable("warehouses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopDomain: text("shop_domain").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  manager: text("manager"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopDomain: text("shop_domain").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  paymentTerms: integer("payment_terms").default(30), // days
  isActive: boolean("is_active").default(true),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default('0'),
  outstandingDues: decimal("outstanding_dues", { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventoryBatches = pgTable("inventory_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  batchNumber: text("batch_number").notNull(),
  quantity: integer("quantity").notNull(),
  remainingQuantity: integer("remaining_quantity").notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  expiryDate: timestamp("expiry_date"),
  manufacturedDate: timestamp("manufactured_date"),
  receivedDate: timestamp("received_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stockAdjustments = pgTable("stock_adjustments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  batchId: varchar("batch_id").references(() => inventoryBatches.id),
  adjustmentType: text("adjustment_type").notNull(), // damaged, expired, theft, correction
  quantityBefore: integer("quantity_before").notNull(),
  quantityAfter: integer("quantity_after").notNull(),
  reason: text("reason"),
  adjustedBy: text("adjusted_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopDomain: text("shop_domain").notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  poNumber: text("po_number").notNull().unique(),
  status: text("status").notNull().default('draft'), // draft, sent, partial, delivered, closed, cancelled
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  orderDate: timestamp("order_date").defaultNow(),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendorPayments = pgTable("vendor_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  paymentMethod: text("payment_method"), // cash, check, bank_transfer, card
  paymentDate: timestamp("payment_date").defaultNow(),
  reference: text("reference"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  batchId: varchar("batch_id").references(() => inventoryBatches.id),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  movementType: text("movement_type").notNull(), // in, out, transfer, adjustment
  quantity: integer("quantity").notNull(),
  reference: text("reference"), // order_id, po_id, adjustment_id
  referenceType: text("reference_type"), // order, purchase_order, adjustment
  performedBy: text("performed_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Enhancement Tables
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, view
  resource: text("resource").notNull(), // products, users, orders, etc
  resourceId: text("resource_id"), // ID of the affected resource
  oldValues: text("old_values"), // JSON string of previous values
  newValues: text("new_values"), // JSON string of new values
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // low_stock, new_order, loyalty_milestone, system_alert
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON string for additional data
  isRead: boolean("is_read").default(false),
  priority: text("priority").default('normal'), // low, normal, high, urgent
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").default('string'), // string, number, boolean, json
  description: text("description"),
  category: text("category").default('general'), // general, notifications, integrations, etc
  isEditable: boolean("is_editable").default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // stripe, sendgrid, twilio, quickbooks
  type: text("type").notNull(), // payment, email, sms, accounting
  isEnabled: boolean("is_enabled").default(false),
  config: text("config"), // JSON string of configuration data
  credentials: text("credentials"), // JSON string of API keys (encrypted)
  webhookUrl: text("webhook_url"),
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: text("sync_status").default('idle'), // idle, syncing, error, success
  errorLog: text("error_log"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const webPushSubscriptions = pgTable("web_push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const offlineCache = pgTable("offline_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  cacheKey: text("cache_key").notNull(),
  data: text("data").notNull(), // JSON string of cached data
  lastModified: timestamp("last_modified").defaultNow(),
  expiresAt: timestamp("expires_at"),
  syncStatus: text("sync_status").default('pending'), // pending, synced, conflict
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  lastUpdated: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryBatchSchema = createInsertSchema(inventoryBatches).omit({
  id: true,
  createdAt: true,
});

export const insertStockAdjustmentSchema = createInsertSchema(stockAdjustments).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertVendorPaymentSchema = createInsertSchema(vendorPayments).omit({
  id: true,
  createdAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebPushSubscriptionSchema = createInsertSchema(webPushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOfflineCacheSchema = createInsertSchema(offlineCache).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;

export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertInventoryBatch = z.infer<typeof insertInventoryBatchSchema>;
export type InventoryBatch = typeof inventoryBatches.$inferSelect;

export type InsertStockAdjustment = z.infer<typeof insertStockAdjustmentSchema>;
export type StockAdjustment = typeof stockAdjustments.$inferSelect;

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

export type InsertVendorPayment = z.infer<typeof insertVendorPaymentSchema>;
export type VendorPayment = typeof vendorPayments.$inferSelect;

export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export type InsertWebPushSubscription = z.infer<typeof insertWebPushSubscriptionSchema>;
export type WebPushSubscription = typeof webPushSubscriptions.$inferSelect;

export type InsertOfflineCache = z.infer<typeof insertOfflineCacheSchema>;
export type OfflineCache = typeof offlineCache.$inferSelect;

// ADVANCED ACCOUNTING MODULE TABLES

// Chart of Accounts
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountCode: text("account_code").notNull().unique(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // asset, liability, equity, revenue, expense
  accountSubtype: text("account_subtype"), // current_asset, fixed_asset, current_liability, long_term_liability, etc.
  parentAccountId: varchar("parent_account_id"), // Self-referential for account hierarchy
  description: text("description"),
  isActive: boolean("is_active").default(true),
  normalBalance: text("normal_balance").notNull(), // debit, credit
  shopDomain: text("shop_domain").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Entries
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalNumber: text("journal_number").notNull().unique(),
  transactionDate: timestamp("transaction_date").notNull(),
  reference: text("reference"), // Invoice#, PO#, etc.
  description: text("description").notNull(),
  totalDebit: decimal("total_debit", { precision: 12, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default('draft'), // draft, posted, reversed
  shopDomain: text("shop_domain").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  postedBy: varchar("posted_by").references(() => users.id),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Entry Lines (Double-entry bookkeeping)
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalEntryId: varchar("journal_entry_id").references(() => journalEntries.id),
  accountId: varchar("account_id").references(() => accounts.id),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }).default('0'),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }).default('0'),
  reference: text("reference"), // Additional reference for the line
  createdAt: timestamp("created_at").defaultNow(),
});

// General Ledger (Computed view of all transactions)
export const generalLedger = pgTable("general_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => accounts.id),
  journalEntryId: varchar("journal_entry_id").references(() => journalEntries.id),
  journalEntryLineId: varchar("journal_entry_line_id").references(() => journalEntryLines.id),
  transactionDate: timestamp("transaction_date").notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }).default('0'),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }).default('0'),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }),
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accounts Receivable
export const accountsReceivable = pgTable("accounts_receivable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  orderId: varchar("order_id").references(() => orders.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  outstandingAmount: decimal("outstanding_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // pending, partial, paid, overdue, written_off
  paymentTerms: integer("payment_terms").default(30), // Days
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accounts Payable
export const accountsPayable = pgTable("accounts_payable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  billNumber: text("bill_number").notNull(),
  billDate: timestamp("bill_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  outstandingAmount: decimal("outstanding_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // pending, partial, paid, overdue
  paymentTerms: integer("payment_terms").default(30), // Days
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer/Vendor Wallets for Credits & Refunds
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // customer, vendor
  entityId: varchar("entity_id").notNull(), // customer_id or vendor_id
  walletType: text("wallet_type").notNull(), // credit, refund, store_credit, vendor_credit
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default('0'),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).default('0'),
  totalUsed: decimal("total_used", { precision: 12, scale: 2 }).default('0'),
  currency: text("currency").default('USD'),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // For store credits that expire
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet Transactions
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id),
  transactionType: text("transaction_type").notNull(), // credit, debit, transfer, adjustment
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  reference: text("reference"), // order_id, refund_id, etc.
  referenceType: text("reference_type"), // order, refund, manual_adjustment
  previousBalance: decimal("previous_balance", { precision: 12, scale: 2 }),
  newBalance: decimal("new_balance", { precision: 12, scale: 2 }),
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Periods for Reporting
export const fiscalPeriods = pgTable("fiscal_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodName: text("period_name").notNull(), // "Q1 2024", "January 2024"
  periodType: text("period_type").notNull(), // monthly, quarterly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  isClosed: boolean("is_closed").default(false),
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Account Balances (Snapshot for performance)
export const accountBalances = pgTable("account_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => accounts.id),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id),
  beginningBalance: decimal("beginning_balance", { precision: 12, scale: 2 }).default('0'),
  totalDebits: decimal("total_debits", { precision: 12, scale: 2 }).default('0'),
  totalCredits: decimal("total_credits", { precision: 12, scale: 2 }).default('0'),
  endingBalance: decimal("ending_balance", { precision: 12, scale: 2 }).default('0'),
  lastCalculated: timestamp("last_calculated").defaultNow(),
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Bank Reconciliation
export const bankStatements = pgTable("bank_statements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bankAccountId: varchar("bank_account_id").references(() => accounts.id),
  statementDate: timestamp("statement_date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }),
  reference: text("reference"),
  transactionId: text("transaction_id"), // Bank's transaction ID
  isReconciled: boolean("is_reconciled").default(false),
  reconciledWith: varchar("reconciled_with"), // GL entry ID
  uploadBatch: varchar("upload_batch"), // Group imports together
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bankReconciliations = pgTable("bank_reconciliations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bankAccountId: varchar("bank_account_id").references(() => accounts.id),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  bankBalance: decimal("bank_balance", { precision: 12, scale: 2 }).notNull(),
  bookBalance: decimal("book_balance", { precision: 12, scale: 2 }).notNull(),
  adjustments: decimal("adjustments", { precision: 12, scale: 2 }).default('0'),
  reconciledBalance: decimal("reconciled_balance", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default('draft'), // draft, completed
  notes: text("notes"),
  reconciledBy: varchar("reconciled_by").references(() => users.id),
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Enhanced Tax Management
export const taxRates = pgTable("tax_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // VAT, GST, Sales Tax, etc.
  type: text("type").notNull(), // vat, gst, sales_tax, excise
  rate: decimal("rate", { precision: 5, scale: 4 }).notNull(), // 0.0825 for 8.25%
  region: text("region"), // Country/State code
  accountId: varchar("account_id").references(() => accounts.id), // Tax payable account
  isActive: boolean("is_active").default(true),
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taxTransactions = pgTable("tax_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taxRateId: varchar("tax_rate_id").references(() => taxRates.id),
  sourceId: varchar("source_id").notNull(), // Order ID, Invoice ID, etc.
  sourceType: text("source_type").notNull(), // order, invoice, refund
  taxableAmount: decimal("taxable_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  journalEntryId: varchar("journal_entry_id").references(() => journalEntries.id),
  shopDomain: text("shop_domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Invoice Management for AR
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => customers.id),
  orderId: varchar("order_id").references(() => orders.id),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  outstandingAmount: decimal("outstanding_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // pending, partial, paid, overdue, cancelled
  paymentTerms: integer("payment_terms").default(30), // Days
  notes: text("notes"),
  journalEntryId: varchar("journal_entry_id").references(() => journalEntries.id),
  shopDomain: text("shop_domain").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceLines = pgTable("invoice_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  productId: varchar("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
  taxRateId: varchar("tax_rate_id").references(() => taxRates.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Bill Management for AP
export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billNumber: text("bill_number").notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  billDate: timestamp("bill_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default('0'),
  outstandingAmount: decimal("outstanding_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // pending, partial, paid, overdue, cancelled
  paymentTerms: integer("payment_terms").default(30), // Days
  notes: text("notes"),
  journalEntryId: varchar("journal_entry_id").references(() => journalEntries.id),
  shopDomain: text("shop_domain").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billLines = pgTable("bill_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billId: varchar("bill_id").references(() => bills.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
  accountId: varchar("account_id").references(() => accounts.id), // Expense account
  taxRateId: varchar("tax_rate_id").references(() => taxRates.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recurring Journal Entries
export const recurringJournalEntries = pgTable("recurring_journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: text("template_name").notNull(),
  description: text("description").notNull(),
  frequency: text("frequency").notNull(), // monthly, quarterly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextRunDate: timestamp("next_run_date").notNull(),
  lastRunDate: timestamp("last_run_date"),
  isActive: boolean("is_active").default(true),
  totalDebit: decimal("total_debit", { precision: 12, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 12, scale: 2 }).notNull(),
  shopDomain: text("shop_domain").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recurringJournalLines = pgTable("recurring_journal_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recurringJournalId: varchar("recurring_journal_id").references(() => recurringJournalEntries.id),
  accountId: varchar("account_id").references(() => accounts.id),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }).default('0'),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

// ACCOUNTING INSERT SCHEMAS
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines).omit({
  id: true,
  createdAt: true,
});

export const insertGeneralLedgerSchema = createInsertSchema(generalLedger).omit({
  id: true,
  createdAt: true,
});

export const insertAccountsReceivableSchema = createInsertSchema(accountsReceivable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountsPayableSchema = createInsertSchema(accountsPayable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertFiscalPeriodSchema = createInsertSchema(fiscalPeriods).omit({
  id: true,
  createdAt: true,
});

export const insertAccountBalanceSchema = createInsertSchema(accountBalances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New schemas for advanced features
export const insertBankStatementSchema = createInsertSchema(bankStatements).omit({
  id: true,
  createdAt: true,
});

export const insertBankReconciliationSchema = createInsertSchema(bankReconciliations).omit({
  id: true,
  createdAt: true,
});

export const insertTaxRateSchema = createInsertSchema(taxRates).omit({
  id: true,
  createdAt: true,
});

export const insertTaxTransactionSchema = createInsertSchema(taxTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineSchema = createInsertSchema(invoiceLines).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillLineSchema = createInsertSchema(billLines).omit({
  id: true,
  createdAt: true,
});

export const insertRecurringJournalEntrySchema = createInsertSchema(recurringJournalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecurringJournalLineSchema = createInsertSchema(recurringJournalLines).omit({
  id: true,
  createdAt: true,
});

// ACCOUNTING TYPES
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertJournalEntryLine = z.infer<typeof insertJournalEntryLineSchema>;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;

export type InsertGeneralLedger = z.infer<typeof insertGeneralLedgerSchema>;
export type GeneralLedger = typeof generalLedger.$inferSelect;

export type InsertAccountsReceivable = z.infer<typeof insertAccountsReceivableSchema>;
export type AccountsReceivable = typeof accountsReceivable.$inferSelect;

export type InsertAccountsPayable = z.infer<typeof insertAccountsPayableSchema>;
export type AccountsPayable = typeof accountsPayable.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

export type InsertFiscalPeriod = z.infer<typeof insertFiscalPeriodSchema>;
export type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

export type InsertAccountBalance = z.infer<typeof insertAccountBalanceSchema>;
export type AccountBalance = typeof accountBalances.$inferSelect;

// Advanced feature types
export type InsertBankStatement = z.infer<typeof insertBankStatementSchema>;
export type BankStatement = typeof bankStatements.$inferSelect;

export type InsertBankReconciliation = z.infer<typeof insertBankReconciliationSchema>;
export type BankReconciliation = typeof bankReconciliations.$inferSelect;

export type InsertTaxRate = z.infer<typeof insertTaxRateSchema>;
export type TaxRate = typeof taxRates.$inferSelect;

export type InsertTaxTransaction = z.infer<typeof insertTaxTransactionSchema>;
export type TaxTransaction = typeof taxTransactions.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertInvoiceLine = z.infer<typeof insertInvoiceLineSchema>;
export type InvoiceLine = typeof invoiceLines.$inferSelect;

export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;

export type InsertBillLine = z.infer<typeof insertBillLineSchema>;
export type BillLine = typeof billLines.$inferSelect;

export type InsertRecurringJournalEntry = z.infer<typeof insertRecurringJournalEntrySchema>;
export type RecurringJournalEntry = typeof recurringJournalEntries.$inferSelect;

export type InsertRecurringJournalLine = z.infer<typeof insertRecurringJournalLineSchema>;
export type RecurringJournalLine = typeof recurringJournalLines.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertJournalEntryLine = z.infer<typeof insertJournalEntryLineSchema>;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;

export type InsertGeneralLedger = z.infer<typeof insertGeneralLedgerSchema>;
export type GeneralLedger = typeof generalLedger.$inferSelect;

export type InsertAccountsReceivable = z.infer<typeof insertAccountsReceivableSchema>;
export type AccountsReceivable = typeof accountsReceivable.$inferSelect;

export type InsertAccountsPayable = z.infer<typeof insertAccountsPayableSchema>;
export type AccountsPayable = typeof accountsPayable.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

export type InsertFiscalPeriod = z.infer<typeof insertFiscalPeriodSchema>;
export type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

export type InsertAccountBalance = z.infer<typeof insertAccountBalanceSchema>;
export type AccountBalance = typeof accountBalances.$inferSelect;
