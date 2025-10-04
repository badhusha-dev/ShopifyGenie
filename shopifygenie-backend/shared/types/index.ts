// Shared TypeScript interfaces and types for ShopifyGenie microservices

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'admin' | 'staff' | 'customer';
  permissions?: string | null;
  shopDomain?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  shopifyId?: string | null;
  sku?: string | null;
  stock: number;
  price?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  lastUpdated?: Date | null;
}

export interface Customer {
  id: string;
  name: string;
  shopifyId?: string | null;
  email: string;
  loyaltyPoints: number;
  totalSpent?: string | null;
  createdAt?: Date | null;
}

export interface Order {
  id: string;
  shopifyId?: string | null;
  createdAt?: Date | null;
  customerId?: string | null;
  total: string;
  pointsEarned: number;
  status: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'paused';
  startDate: Date;
  endDate?: Date;
  price: number;
  billingCycle: 'monthly' | 'yearly';
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  description: string;
  createdAt: Date;
}

// Accounting Types
export interface Account {
  id: string;
  createdAt?: Date | null;
  shopDomain: string;
  updatedAt?: Date | null;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountSubtype?: string | null;
  normalBalance: string;
  parentAccountId?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdBy?: string | null;
}

export interface JournalEntry {
  id: string;
  createdAt?: Date | null;
  status: string;
  shopDomain: string;
  updatedAt?: Date | null;
  description: string;
  createdBy?: string | null;
  journalNumber: string;
  transactionDate: Date;
  totalDebit: string;
  totalCredit: string;
  reference?: string | null;
  postedBy?: string | null;
  postedAt?: Date | null;
}

export interface JournalEntryLine {
  id: string;
  createdAt?: Date | null;
  description?: string | null;
  reference?: string | null;
  journalEntryId?: string | null;
  accountId?: string | null;
  debitAmount?: string | null;
  creditAmount?: string | null;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'staff' | 'customer';
  shopDomain?: string;
}

// Service Communication Types
export interface ServiceRequest<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  data?: T;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export interface ServiceResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'notification' | 'order_update' | 'inventory_alert' | 'system_message';
  payload: any;
  timestamp: Date;
  userId?: string;
}

// Analytics Types
export interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  activeSubscriptions: number;
  loyaltyPointsIssued: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Configuration Types
export interface ServiceConfig {
  port: number;
  host: string;
  database: {
    url: string;
    type: 'sqlite' | 'postgresql' | 'mysql';
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface MicroserviceConfig extends ServiceConfig {
  serviceName: string;
  version: string;
  dependencies: string[];
  healthCheck: {
    path: string;
    interval: number;
  };
}
