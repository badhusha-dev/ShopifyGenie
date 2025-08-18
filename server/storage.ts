import { 
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder,
  type Subscription, type InsertSubscription,
  type LoyaltyTransaction, type InsertLoyaltyTransaction
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByShopifyId(shopifyId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByShopifyId(shopifyId: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionsByCustomer(customerId: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;

  // Loyalty Transactions
  getLoyaltyTransactions(): Promise<LoyaltyTransaction[]>;
  getLoyaltyTransactionsByCustomer(customerId: string): Promise<LoyaltyTransaction[]>;
  createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;

  // Analytics
  getStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    totalLoyaltyPoints: number;
    activeSubscriptions: number;
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private loyaltyTransactions: Map<string, LoyaltyTransaction> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial data for demo
    const customer1: Customer = {
      id: randomUUID(),
      shopifyId: "cust_001",
      name: "John Doe",
      email: "john@example.com",
      loyaltyPoints: 1250,
      totalSpent: "1430.50",
      createdAt: new Date(),
    };

    const customer2: Customer = {
      id: randomUUID(),
      shopifyId: "cust_002",
      name: "Sarah Miller",
      email: "sarah.m@example.com",
      loyaltyPoints: 830,
      totalSpent: "890.25",
      createdAt: new Date(),
    };

    this.customers.set(customer1.id, customer1);
    this.customers.set(customer2.id, customer2);

    const product1: Product = {
      id: randomUUID(),
      shopifyId: "prod_001",
      name: "Organic Green Tea",
      sku: "GT-001",
      stock: 8,
      price: "24.99",
      category: "Health & Wellness",
      imageUrl: null,
      lastUpdated: new Date(),
    };

    const product2: Product = {
      id: randomUUID(),
      shopifyId: "prod_002",
      name: "Premium Coffee Beans",
      sku: "CB-002",
      stock: 45,
      price: "32.99",
      category: "Beverages",
      imageUrl: null,
      lastUpdated: new Date(),
    };

    const product3: Product = {
      id: randomUUID(),
      shopifyId: "prod_003",
      name: "Handmade Soap Set",
      sku: "HS-003",
      stock: 5,
      price: "19.99",
      category: "Beauty & Care",
      imageUrl: null,
      lastUpdated: new Date(),
    };

    this.products.set(product1.id, product1);
    this.products.set(product2.id, product2);
    this.products.set(product3.id, product3);

    const subscription1: Subscription = {
      id: randomUUID(),
      customerId: customer1.id,
      productId: product1.id,
      status: "active",
      frequency: "monthly",
      nextDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      createdAt: new Date(),
    };

    const subscription2: Subscription = {
      id: randomUUID(),
      customerId: customer2.id,
      productId: product2.id,
      status: "paused",
      frequency: "monthly",
      nextDelivery: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      createdAt: new Date(),
    };

    this.subscriptions.set(subscription1.id, subscription1);
    this.subscriptions.set(subscription2.id, subscription2);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByShopifyId(shopifyId: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.shopifyId === shopifyId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      lastUpdated: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { 
      ...product, 
      ...updates, 
      lastUpdated: new Date() 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getLowStockProducts(threshold = 10): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.stock < threshold);
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByShopifyId(shopifyId: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.shopifyId === shopifyId);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.email === email);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      createdAt: new Date() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.customerId === customerId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionsByCustomer(customerId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => s.customerId === customerId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
      createdAt: new Date() 
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Loyalty transaction methods
  async getLoyaltyTransactions(): Promise<LoyaltyTransaction[]> {
    return Array.from(this.loyaltyTransactions.values());
  }

  async getLoyaltyTransactionsByCustomer(customerId: string): Promise<LoyaltyTransaction[]> {
    return Array.from(this.loyaltyTransactions.values()).filter(t => t.customerId === customerId);
  }

  async createLoyaltyTransaction(insertTransaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const id = randomUUID();
    const transaction: LoyaltyTransaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date() 
    };
    this.loyaltyTransactions.set(id, transaction);
    return transaction;
  }

  // Analytics methods
  async getStats() {
    const products = await this.getProducts();
    const lowStockProducts = await this.getLowStockProducts();
    const subscriptions = await this.getSubscriptions();
    const orders = await this.getOrders();
    const customers = await this.getCustomers();

    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalLoyaltyPoints = customers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    return {
      totalProducts: products.length,
      lowStockItems: lowStockProducts.length,
      totalLoyaltyPoints,
      activeSubscriptions,
      totalSales,
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
    };
  }
}

export const storage = new MemStorage();
