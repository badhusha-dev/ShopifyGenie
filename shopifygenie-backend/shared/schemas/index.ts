// Zod validation schemas for ShopifyGenie microservices

import { z } from 'zod';

// Base schemas
export const idSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).max(128);
export const dateSchema = z.string().datetime().or(z.date());

// User schemas
export const userRoleSchema = z.enum(['superadmin', 'admin', 'staff', 'customer']);

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional().default('customer'),
  permissions: z.string().nullable().optional(),
  shopDomain: z.string().nullable().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional().default('customer'),
  shopDomain: z.string().nullable().optional(),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  shopifyId: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  stock: z.number().int().min(0),
  price: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const stockAdjustmentSchema = z.object({
  productId: idSchema,
  quantity: z.number().int(),
  reason: z.string().min(1).max(200),
  type: z.enum(['increase', 'decrease']),
});

// Customer schemas
export const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  shopifyId: z.string().nullable().optional(),
  email: emailSchema,
  loyaltyPoints: z.number().int().min(0).default(0),
  totalSpent: z.string().nullable().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Order schemas
export const createOrderSchema = z.object({
  customerId: idSchema,
  items: z.array(z.object({
    productId: idSchema,
    quantity: z.number().int().min(1),
    price: z.string(),
  })),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

// Subscription schemas
export const createSubscriptionSchema = z.object({
  customerId: idSchema,
  planName: z.string().min(1).max(100),
  status: z.enum(['active', 'cancelled', 'paused']).default('active'),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  price: z.number().positive(),
  billingCycle: z.enum(['monthly', 'yearly']),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();

// Loyalty schemas
export const loyaltyTransactionSchema = z.object({
  customerId: idSchema,
  points: z.number().int(),
  type: z.enum(['earned', 'redeemed', 'expired']),
  description: z.string().min(1).max(200),
});

// Accounting schemas
export const createAccountSchema = z.object({
  shopDomain: z.string().min(1),
  accountCode: z.string().min(1).max(20),
  accountName: z.string().min(1).max(100),
  accountType: z.string().min(1),
  accountSubtype: z.string().nullable().optional(),
  normalBalance: z.string(),
  parentAccountId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  createdBy: z.string().uuid().nullable().optional(),
});

export const updateAccountSchema = createAccountSchema.partial().omit({ shopDomain: true });

export const createJournalEntrySchema = z.object({
  shopDomain: z.string().min(1),
  description: z.string().min(1).max(200),
  journalNumber: z.string().min(1).max(50),
  transactionDate: dateSchema,
  totalDebit: z.string(),
  totalCredit: z.string(),
  status: z.string().default('draft'),
  createdBy: z.string().uuid().nullable().optional(),
  reference: z.string().nullable().optional(),
});

export const createJournalEntryLineSchema = z.object({
  description: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
  journalEntryId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
  debitAmount: z.string().nullable().optional(),
  creditAmount: z.string().nullable().optional(),
});

// Query schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  field: z.string().optional(),
});

export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
});

// API Gateway schemas
export const serviceRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  path: z.string().min(1),
  data: z.any().optional(),
  headers: z.record(z.string()).optional(),
  query: z.record(z.string()).optional(),
});

// WebSocket schemas
export const webSocketMessageSchema = z.object({
  type: z.enum(['notification', 'order_update', 'inventory_alert', 'system_message']),
  payload: z.any(),
  timestamp: dateSchema,
  userId: z.string().uuid().optional(),
});

// Analytics schemas
export const analyticsQuerySchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  groupBy: z.enum(['day', 'week', 'month', 'year']).default('day'),
  metrics: z.array(z.enum(['sales', 'orders', 'customers', 'revenue'])).default(['sales']),
});

// Error schemas
export const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  statusCode: z.number().int().min(100).max(599),
  details: z.any().optional(),
});

// Response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = apiResponseSchema.extend({
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

// Configuration schemas
export const serviceConfigSchema = z.object({
  port: z.number().int().min(1000).max(65535),
  host: z.string().min(1),
  database: z.object({
    url: z.string().min(1),
    type: z.enum(['sqlite', 'postgresql', 'mysql']),
  }),
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string().min(1),
    refreshExpiresIn: z.string().min(1),
  }),
  cors: z.object({
    origin: z.array(z.string()),
    credentials: z.boolean(),
  }),
  rateLimit: z.object({
    windowMs: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
});

// Export all schemas
export const schemas = {
  // User schemas
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  login: loginSchema,
  register: registerSchema,
  
  // Product schemas
  createProduct: createProductSchema,
  updateProduct: updateProductSchema,
  stockAdjustment: stockAdjustmentSchema,
  
  // Customer schemas
  createCustomer: createCustomerSchema,
  updateCustomer: updateCustomerSchema,
  
  // Order schemas
  createOrder: createOrderSchema,
  updateOrderStatus: updateOrderStatusSchema,
  
  // Subscription schemas
  createSubscription: createSubscriptionSchema,
  updateSubscription: updateSubscriptionSchema,
  
  // Loyalty schemas
  loyaltyTransaction: loyaltyTransactionSchema,
  
  // Accounting schemas
  createAccount: createAccountSchema,
  updateAccount: updateAccountSchema,
  createJournalEntry: createJournalEntrySchema,
  createJournalEntryLine: createJournalEntryLineSchema,
  
  // Query schemas
  pagination: paginationSchema,
  search: searchSchema,
  dateRange: dateRangeSchema,
  
  // API Gateway schemas
  serviceRequest: serviceRequestSchema,
  
  // WebSocket schemas
  webSocketMessage: webSocketMessageSchema,
  
  // Analytics schemas
  analyticsQuery: analyticsQuerySchema,
  
  // Response schemas
  apiResponse: apiResponseSchema,
  paginatedResponse: paginatedResponseSchema,
  
  // Configuration schemas
  serviceConfig: serviceConfigSchema,
};
