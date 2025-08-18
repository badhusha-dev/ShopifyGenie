import { 
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder,
  type Subscription, type InsertSubscription,
  type LoyaltyTransaction, type InsertLoyaltyTransaction
} from "@shared/schema";
import { randomUUID } from "crypto";
import { ShopifyService, type ShopifyProduct, type ShopifyCustomer, type ShopifyOrder } from "./shopify";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products - now with Shopify integration
  getProducts(shopDomain?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByShopifyId(shopifyId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  getLowStockProducts(threshold?: number, shopDomain?: string): Promise<Product[]>;
  syncProductsFromShopify(shopDomain: string): Promise<Product[]>;

  // Customers - now with Shopify integration
  getCustomers(shopDomain?: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByShopifyId(shopifyId: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined>;
  syncCustomersFromShopify(shopDomain: string): Promise<Customer[]>;

  // Orders - now with Shopify integration
  getOrders(shopDomain?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  syncOrdersFromShopify(shopDomain: string): Promise<Order[]>;

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
  getStats(shopDomain?: string): Promise<{
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

  // Product methods - now with Shopify integration
  async getProducts(shopDomain?: string): Promise<Product[]> {
    if (shopDomain) {
      try {
        const shopifyService = new ShopifyService(shopDomain);
        const shopifyProducts = await shopifyService.getProducts();
        
        // Convert and sync Shopify products with local storage
        const products: Product[] = [];
        for (const shopifyProduct of shopifyProducts) {
          for (const variant of shopifyProduct.variants) {
            const existingProduct = await this.getProductByShopifyId(variant.id.toString());
            if (existingProduct) {
              // Update existing product
              const updatedProduct = await this.updateProduct(existingProduct.id, {
                name: `${shopifyProduct.title} - ${variant.title}`,
                stock: variant.inventory_quantity,
                price: variant.price,
                lastUpdated: new Date()
              });
              if (updatedProduct) products.push(updatedProduct);
            } else {
              // Create new product
              const newProduct = await this.createProduct({
                shopifyId: variant.id.toString(),
                name: `${shopifyProduct.title} - ${variant.title}`,
                sku: variant.sku || `shopify-${variant.id}`,
                stock: variant.inventory_quantity,
                price: variant.price,
                category: shopifyProduct.product_type || 'General',
                imageUrl: null
              });
              products.push(newProduct);
            }
          }
        }
        return products;
      } catch (error) {
        console.error('Error syncing products from Shopify:', error);
        return Array.from(this.products.values());
      }
    }
    return Array.from(this.products.values());
  }

  async syncProductsFromShopify(shopDomain: string): Promise<Product[]> {
    return await this.getProducts(shopDomain);
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

  async getLowStockProducts(threshold = 10, shopDomain?: string): Promise<Product[]> {
    const products = shopDomain ? await this.getProducts(shopDomain) : Array.from(this.products.values());
    return products.filter(p => p.stock < threshold);
  }

  // Customer methods - now with Shopify integration
  async getCustomers(shopDomain?: string): Promise<Customer[]> {
    if (shopDomain) {
      try {
        const shopifyService = new ShopifyService(shopDomain);
        const shopifyCustomers = await shopifyService.getCustomers();
        
        // Convert and sync Shopify customers with local storage
        const customers: Customer[] = [];
        for (const shopifyCustomer of shopifyCustomers) {
          const existingCustomer = await this.getCustomerByShopifyId(shopifyCustomer.id.toString());
          if (existingCustomer) {
            // Update existing customer
            const updatedCustomer = await this.updateCustomer(existingCustomer.id, {
              name: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`.trim(),
              email: shopifyCustomer.email,
              totalSpent: shopifyCustomer.total_spent
            });
            if (updatedCustomer) customers.push(updatedCustomer);
          } else {
            // Create new customer
            const newCustomer = await this.createCustomer({
              shopifyId: shopifyCustomer.id.toString(),
              name: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`.trim(),
              email: shopifyCustomer.email,
              loyaltyPoints: 0,
              totalSpent: shopifyCustomer.total_spent
            });
            customers.push(newCustomer);
          }
        }
        return customers;
      } catch (error) {
        console.error('Error syncing customers from Shopify:', error);
        return Array.from(this.customers.values());
      }
    }
    return Array.from(this.customers.values());
  }

  async syncCustomersFromShopify(shopDomain: string): Promise<Customer[]> {
    return await this.getCustomers(shopDomain);
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

  // Order methods - now with Shopify integration
  async getOrders(shopDomain?: string): Promise<Order[]> {
    if (shopDomain) {
      try {
        const shopifyService = new ShopifyService(shopDomain);
        const shopifyOrders = await shopifyService.getOrders();
        
        // Convert and sync Shopify orders with local storage
        const orders: Order[] = [];
        for (const shopifyOrder of shopifyOrders) {
          const existingOrder = await this.getOrderByShopifyId(shopifyOrder.id.toString());
          if (!existingOrder) {
            // Find or create customer
            let customer = await this.getCustomerByShopifyId(shopifyOrder.customer?.id?.toString() || '');
            if (!customer && shopifyOrder.email) {
              customer = await this.getCustomerByEmail(shopifyOrder.email);
            }
            
            // Create new order
            const newOrder = await this.createOrder({
              shopifyId: shopifyOrder.id.toString(),
              customerId: customer?.id || null,
              total: shopifyOrder.total_price,
              pointsEarned: Math.floor(parseFloat(shopifyOrder.total_price)),
              status: shopifyOrder.financial_status
            });
            orders.push(newOrder);
          }
        }
        // Also include any existing local orders
        orders.push(...Array.from(this.orders.values()));
        return orders;
      } catch (error) {
        console.error('Error syncing orders from Shopify:', error);
        return Array.from(this.orders.values());
      }
    }
    return Array.from(this.orders.values());
  }

  async getOrderByShopifyId(shopifyId: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(o => o.shopifyId === shopifyId);
  }

  async syncOrdersFromShopify(shopDomain: string): Promise<Order[]> {
    return await this.getOrders(shopDomain);
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
  async getStats(shopDomain?: string) {
    const products = await this.getProducts(shopDomain);
    const lowStockProducts = await this.getLowStockProducts(10, shopDomain);
    const subscriptions = await this.getSubscriptions();
    const orders = await this.getOrders(shopDomain);
    const customers = await this.getCustomers(shopDomain);

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

  // Enhanced analytics for charts and reports
  async getSalesTrends() {
    const orders = await this.getOrders();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = orders.filter(order => 
        order.createdAt.toISOString().split('T')[0] === date
      );
      const sales = dayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      
      return {
        date,
        sales: Math.round(sales * 100) / 100,
        orders: dayOrders.length
      };
    });
  }

  async getTopProducts() {
    const products = await this.getProducts();
    return products
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        sold: p.sold || 0,
        revenue: (p.sold || 0) * parseFloat(p.price)
      }));
  }

  async getLoyaltyPointsAnalytics() {
    const transactions = await this.getLoyaltyTransactions();
    const earned = transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0);
    const redeemed = transactions.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + Math.abs(t.points), 0);
    
    return {
      earned,
      redeemed,
      available: earned - redeemed
    };
  }

  // Stock forecasting
  async getStockForecast() {
    const products = await this.getProducts();
    const orders = await this.getOrders();
    
    return products.map(product => {
      // Calculate average daily sales over last 30 days
      const productSales = orders
        .filter(order => order.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, order) => sum + (product.sold || 0) / 30, 0);
      
      const dailySales = Math.max(productSales, 0.1); // Prevent division by zero
      const daysLeft = product.stock / dailySales;
      
      return {
        id: product.id,
        name: product.name,
        stock: product.stock,
        dailySales: Math.round(dailySales * 100) / 100,
        daysLeft: Math.round(daysLeft),
        status: daysLeft < 7 ? 'critical' : daysLeft < 14 ? 'warning' : 'good'
      };
    });
  }

  // Role-based access helpers
  async getUserRole(userId: string): Promise<'admin' | 'staff' | 'customer'> {
    // Mock role assignment based on user ID patterns for demo
    if (userId === 'admin' || userId.includes('admin')) return 'admin';
    if (userId === 'staff' || userId.includes('staff')) return 'staff';
    return 'customer';
  }

  async getAlertsForUser(role: 'admin' | 'staff' | 'customer') {
    const alerts = [];
    
    if (role === 'admin' || role === 'staff') {
      const lowStock = await this.getLowStockProducts();
      if (lowStock.length > 0) {
        alerts.push({
          type: 'warning',
          message: `${lowStock.length} products are low in stock`,
          action: 'View Inventory'
        });
      }
      
      const subscriptions = await this.getSubscriptions();
      const expiring = subscriptions.filter(s => {
        const endDate = new Date(s.endDate);
        const now = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7 && s.status === 'active';
      });
      
      if (expiring.length > 0) {
        alerts.push({
          type: 'info',
          message: `${expiring.length} subscriptions expire within 7 days`,
          action: 'View Subscriptions'
        });
      }
    }
    
    return alerts;
  }
}

export const storage = new MemStorage();
