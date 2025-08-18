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

  // Inventory Management
  getWarehouses(): Promise<any[]>;
  getWarehouse(id: string): Promise<any | undefined>;
  createWarehouse(warehouse: any): Promise<any>;
  updateWarehouse(id: string, updates: Partial<any>): Promise<any | undefined>;
  getInventoryBatches(): Promise<any[]>;
  getInventoryBatch(batchId: string): Promise<any>;
  createInventoryBatch(batchData: any): Promise<any>;
  updateInventoryBatch(batchId: string, updates: any): Promise<any>;
  getBatchByProductAndExpiry(productId: string, expiryDate: Date): Promise<any | undefined>;
  getExpiringStock(daysUntilExpiry: number): Promise<any[]>;
  getStockAdjustments(): Promise<any[]>;
  createStockAdjustment(adjustmentData: any): Promise<any>;
  getStockMovements(): Promise<any[]>;
  createStockMovement(movementData: any): Promise<any>;
  getStockAuditHistory(itemId: string): Promise<any[]>;

  // Multi-Vendor Management
  getVendors(): Promise<any[]>;
  getVendor(vendorId: string): Promise<any>;
  createVendor(vendor: any): Promise<any>;
  updateVendor(id: string, updates: Partial<any>): Promise<any | undefined>;

  getPurchaseOrders(): Promise<any[]>;
  getPurchaseOrder(poId: string): Promise<any>;
  getPurchaseOrderItems(poId: string): Promise<any[]>;
  createPurchaseOrder(po: any): Promise<any>;
  updatePurchaseOrder(id: string, updates: Partial<any>): Promise<any | undefined>;
  updatePurchaseOrderItem(itemId: string, updates: any): Promise<any>;
  createPurchaseOrderItem(itemData: any): Promise<any>;
  getPurchaseOrdersByVendor(vendorId: string): Promise<any[]>;

  getVendorPayments(): Promise<any[]>;
  getVendorPayment(id: string): Promise<any | undefined>;
  createVendorPayment(paymentData: any): Promise<any>;

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
  getSalesTrends(): Promise<any[]>;
  getTopProducts(): Promise<any[]>;
  getLoyaltyPointsAnalytics(): Promise<any>;
  getStockForecast(): Promise<any[]>;
  getVendorAnalytics(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private loyaltyTransactions: Map<string, LoyaltyTransaction> = new Map();

  // Enhanced Inventory & Vendor Storage
  private warehouses: any[] = [
    {
      id: "warehouse-1",
      shopDomain: "demo-store.myshopify.com",
      name: "Main Warehouse",
      address: "123 Industrial Blvd, City, State 12345",
      manager: "John Smith",
      isActive: true,
      createdAt: new Date()
    }
  ];

  private vendors: any[] = [
    {
      id: "vendor-1",
      shopDomain: "demo-store.myshopify.com", 
      name: "TechSupply Inc.",
      email: "orders@techsupply.com",
      phone: "+1-555-0101",
      address: "456 Supplier Ave, Tech City, TC 67890",
      contactPerson: "Sarah Johnson",
      paymentTerms: 30,
      isActive: true,
      totalSpent: "15000.00",
      outstandingDues: "2500.00",
      createdAt: new Date()
    }
  ];

  private inventoryBatches: any[] = [];
  private stockAdjustments: any[] = [];
  private purchaseOrders: any[] = [];
  private purchaseOrderItems: any[] = [];
  private vendorPayments: any[] = [];
  private stockMovements: any[] = [];

  constructor() {
    this.seedData();
    this.seedPermissions();
  }

  private async seedData() {
    // Initialize sample users if empty
    if (this.users.size === 0) {
      const { AuthService } = await import('./auth');

      // Create Super Admin (highest privilege)
      const superAdminUser: InsertUser = {
        name: 'Super Administrator',
        email: 'superadmin@shopifyapp.com',
        password: await AuthService.hashPassword('superadmin123'),
        role: 'superadmin',
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(superAdminUser);

      const adminUser: InsertUser = {
        name: 'Admin User',
        email: 'admin@shopifyapp.com',
        password: await AuthService.hashPassword('admin123'),
        role: 'admin',
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(adminUser);

      const staffUser: InsertUser = {
        name: 'Staff Member',
        email: 'staff@shopifyapp.com',
        password: await AuthService.hashPassword('staff123'),
        role: 'staff',
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(staffUser);

      const customerUser: InsertUser = {
        name: 'Demo Customer',
        email: 'customer@example.com',
        password: await AuthService.hashPassword('customer123'),
        role: 'customer',
      };
      await this.createUser(customerUser);
    }

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

  private async seedPermissions() {
    // Define all available permissions
    const permissionsList = [
      // Dashboard
      { name: 'dashboard:view', category: 'dashboard', operation: 'view', description: 'View dashboard' },
      
      // Inventory
      { name: 'inventory:view', category: 'inventory', operation: 'view', description: 'View inventory' },
      { name: 'inventory:create', category: 'inventory', operation: 'create', description: 'Create inventory items' },
      { name: 'inventory:edit', category: 'inventory', operation: 'edit', description: 'Edit inventory items' },
      { name: 'inventory:delete', category: 'inventory', operation: 'delete', description: 'Delete inventory items' },
      
      // Orders
      { name: 'orders:view', category: 'orders', operation: 'view', description: 'View orders' },
      { name: 'orders:create', category: 'orders', operation: 'create', description: 'Create orders' },
      { name: 'orders:edit', category: 'orders', operation: 'edit', description: 'Edit orders' },
      { name: 'orders:delete', category: 'orders', operation: 'delete', description: 'Delete orders' },
      
      // Customers
      { name: 'customers:view', category: 'customers', operation: 'view', description: 'View customers' },
      { name: 'customers:create', category: 'customers', operation: 'create', description: 'Create customers' },
      { name: 'customers:edit', category: 'customers', operation: 'edit', description: 'Edit customers' },
      { name: 'customers:delete', category: 'customers', operation: 'delete', description: 'Delete customers' },
      
      // Reports
      { name: 'reports:view', category: 'reports', operation: 'view', description: 'View reports' },
      { name: 'reports:export', category: 'reports', operation: 'export', description: 'Export reports' },
      
      // Users
      { name: 'users:view', category: 'users', operation: 'view', description: 'View users' },
      { name: 'users:create', category: 'users', operation: 'create', description: 'Create users' },
      { name: 'users:edit', category: 'users', operation: 'edit', description: 'Edit users' },
      { name: 'users:delete', category: 'users', operation: 'delete', description: 'Delete users' },
      
      // Vendors
      { name: 'vendors:view', category: 'vendors', operation: 'view', description: 'View vendors' },
      { name: 'vendors:create', category: 'vendors', operation: 'create', description: 'Create vendors' },
      { name: 'vendors:edit', category: 'vendors', operation: 'edit', description: 'Edit vendors' },
      { name: 'vendors:delete', category: 'vendors', operation: 'delete', description: 'Delete vendors' },
      
      // Subscriptions
      { name: 'subscriptions:view', category: 'subscriptions', operation: 'view', description: 'View subscriptions' },
      { name: 'subscriptions:create', category: 'subscriptions', operation: 'create', description: 'Create subscriptions' },
      { name: 'subscriptions:edit', category: 'subscriptions', operation: 'edit', description: 'Edit subscriptions' },
      { name: 'subscriptions:delete', category: 'subscriptions', operation: 'delete', description: 'Delete subscriptions' },
    ];

    this.permissions = permissionsList.map(p => ({
      id: randomUUID(),
      ...p,
      createdAt: new Date()
    }));

    // Set default permissions for each role
    const defaultPermissions = {
      superadmin: {}, // Super admin gets all permissions automatically
      admin: {
        'dashboard:view': true,
        'inventory:view': true,
        'inventory:create': true,
        'inventory:edit': true,
        'inventory:delete': true,
        'orders:view': true,
        'orders:create': true,
        'orders:edit': true,
        'orders:delete': true,
        'customers:view': true,
        'customers:create': true,
        'customers:edit': true,
        'customers:delete': true,
        'reports:view': true,
        'reports:export': true,
        'users:view': true,
        'vendors:view': true,
        'vendors:create': true,
        'vendors:edit': true,
        'vendors:delete': true,
        'subscriptions:view': true,
        'subscriptions:create': true,
        'subscriptions:edit': true,
        'subscriptions:delete': true,
      },
      staff: {
        'dashboard:view': true,
        'inventory:view': true,
        'inventory:edit': true,
        'orders:view': true,
        'orders:edit': true,
        'customers:view': true,
        'customers:edit': true,
        'reports:view': true,
        'vendors:view': true,
        'subscriptions:view': true,
        'subscriptions:edit': true,
      },
      customer: {
        'dashboard:view': true,
      }
    };

    // Initialize role permissions
    Object.entries(defaultPermissions).forEach(([role, permissions]) => {
      Object.entries(permissions).forEach(([permissionName, granted]) => {
        this.rolePermissions.push({
          id: randomUUID(),
          role,
          permissionName,
          granted,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });
  }

  // User Management Methods
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
      role: userData.role || 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async getUsers(shopDomain?: string): Promise<Omit<User, 'password'>[]> {
    let filteredUsers = Array.from(this.users.values());
    if (shopDomain) {
      filteredUsers = filteredUsers.filter(user => user.shopDomain === shopDomain);
    }
    return filteredUsers.map(({ password, ...user }) => user);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id);
    
    // Protect Super Admin from deletion
    if (user && user.role === 'superadmin' && user.email === 'superadmin@shopifyapp.com') {
      throw new Error('Cannot delete the default Super Admin user');
    }
    
    return this.users.delete(id);
  }

  async getUsersByRole(role: string): Promise<Omit<User, 'password'>[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === role)
      .map(({ password, ...user }) => user);
  }


  // User methods (original implementation, now using Map)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
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

  // Inventory Management methods
  async getWarehouses(): Promise<any[]> {
    return this.warehouses;
  }

  async getWarehouse(id: string): Promise<any | undefined> {
    return this.warehouses.find(w => w.id === id);
  }

  async createWarehouse(warehouseData: any): Promise<any> {
    const warehouse = {
      id: Date.now().toString(),
      ...warehouseData,
      createdAt: new Date().toISOString()
    };
    this.warehouses.push(warehouse);
    return warehouse;
  }

  async updateWarehouse(id: string, updates: Partial<any>): Promise<any | undefined> {
    const warehouse = this.warehouses.find(w => w.id === id);
    if (!warehouse) return undefined;
    const updatedWarehouse = { ...warehouse, ...updates };
    this.warehouses = this.warehouses.map(w => w.id === id ? updatedWarehouse : w);
    return updatedWarehouse;
  }

  async getInventoryBatches(): Promise<any[]> {
    return this.inventoryBatches;
  }

  async getInventoryBatch(batchId: string): Promise<any> {
    return this.inventoryBatches.find(batch => batch.id === batchId);
  }

  async createInventoryBatch(batchData: any): Promise<any> {
    const batch = {
      id: Date.now().toString(),
      ...batchData,
      createdAt: new Date().toISOString()
    };
    this.inventoryBatches.push(batch);
    return batch;
  }

  async updateInventoryBatch(batchId: string, updates: any): Promise<any> {
    const index = this.inventoryBatches.findIndex(batch => batch.id === batchId);
    if (index !== -1) {
      this.inventoryBatches[index] = { ...this.inventoryBatches[index], ...updates };
      return this.inventoryBatches[index];
    }
    return null;
  }

  async getBatchByProductAndExpiry(productId: string, expiryDate: Date): Promise<any | undefined> {
    return this.inventoryBatches.find(b => b.productId === productId && new Date(b.expiryDate).toDateString() === expiryDate.toDateString());
  }

  async getExpiringStock(daysUntilExpiry: number): Promise<any[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);
    return this.inventoryBatches.filter(b => new Date(b.expiryDate) <= expiryDate);
  }

  async getStockAdjustments(): Promise<any[]> {
    return this.stockAdjustments;
  }

  async createStockAdjustment(adjustmentData: any): Promise<any> {
    const adjustment = {
      id: Date.now().toString(),
      ...adjustmentData,
      createdAt: new Date().toISOString()
    };
    this.stockAdjustments.push(adjustment);
    // Add to stock movements for audit history
    this.stockMovements.push({
      id: randomUUID(),
      itemId: adjustment.productId, // Assuming adjustment is for a product
      type: adjustment.type, // e.g., 'adjustment'
      quantityChange: adjustment.quantity,
      reason: adjustment.reason,
      adjustedBy: adjustment.adjustedBy,
      timestamp: new Date(),
      batchId: adjustment.batchId,
      warehouseId: adjustment.warehouseId
    });
    return adjustment;
  }

  async getStockMovements(): Promise<any[]> {
    return this.stockMovements;
  }

  async createStockMovement(movementData: any): Promise<any> {
    const movement = {
      id: randomUUID(),
      ...movementData,
      createdAt: new Date().toISOString()
    };
    this.stockMovements.push(movement);
    return movement;
  }

  async getStockAuditHistory(itemId: string): Promise<any[]> {
    return this.stockMovements.filter(m => m.itemId === itemId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Multi-Vendor Management methods
  async getVendors(): Promise<any[]> {
    return this.vendors;
  }

  async getVendor(vendorId: string): Promise<any> {
    return this.vendors.find(vendor => vendor.id === vendorId);
  }

  async createVendor(vendor: any): Promise<any> {
    const newVendor = { ...vendor, id: randomUUID(), createdAt: new Date(), totalSpent: "0.00", outstandingDues: "0.00" };
    this.vendors.push(newVendor);
    return newVendor;
  }

  async updateVendor(id: string, updates: Partial<any>): Promise<any | undefined> {
    const vendor = this.vendors.find(v => v.id === id);
    if (!vendor) return undefined;
    const updatedVendor = { ...vendor, ...updates };
    this.vendors = this.vendors.map(v => v.id === id ? updatedVendor : v);
    return updatedVendor;
  }

  async getPurchaseOrders(): Promise<any[]> {
    return this.purchaseOrders;
  }

  async getPurchaseOrder(poId: string): Promise<any> {
    return this.purchaseOrders.find(po => po.id === poId);
  }

  async getPurchaseOrderItems(poId: string): Promise<any[]> {
    return this.purchaseOrderItems.filter(item => item.purchaseOrderId === poId);
  }

  async createPurchaseOrder(po: any): Promise<any> {
    const newPO = { ...po, id: randomUUID(), status: 'Draft', createdAt: new Date() };
    this.purchaseOrders.push(newPO);
    // Add items to purchaseOrderItems
    if (po.items && po.items.length > 0) {
      po.items.forEach((item: any) => {
        this.purchaseOrderItems.push({
          id: randomUUID(),
          purchaseOrderId: newPO.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.totalCost
        });
      });
    }
    return newPO;
  }

  async updatePurchaseOrder(id: string, updates: Partial<any>): Promise<any | undefined> {
    const po = this.purchaseOrders.find(p => p.id === id);
    if (!po) return undefined;
    const updatedPO = { ...po, ...updates };
    this.purchaseOrders = this.purchaseOrders.map(p => p.id === id ? updatedPO : p);
    // If status changes to 'Delivered', update vendor's totalSpent and outstandingDues
    if (updatedPO.status === 'Delivered' && po.status !== 'Delivered') {
      const vendor = await this.getVendor(updatedPO.vendorId);
      if (vendor) {
        const totalCostOfPO = this.purchaseOrderItems
          .filter(item => item.purchaseOrderId === id)
          .reduce((sum, item) => sum + parseFloat(item.totalCost), 0);

        const newTotalSpent = (parseFloat(vendor.totalSpent) + totalCostOfPO).toFixed(2);
        const newOutstandingDues = (parseFloat(vendor.outstandingDues) + totalCostOfPO).toFixed(2); // Assuming PO cost adds to dues initially

        await this.updateVendor(vendor.id, {
          totalSpent: newTotalSpent,
          outstandingDues: newOutstandingDues
        });
      }
    }
    return updatedPO;
  }

  async updatePurchaseOrderItem(itemId: string, updates: any): Promise<any> {
    const index = this.purchaseOrderItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.purchaseOrderItems[index] = { ...this.purchaseOrderItems[index], ...updates };
      return this.purchaseOrderItems[index];
    }
    return null;
  }

  async createPurchaseOrderItem(itemData: any): Promise<any> {
    const item = {
      id: Date.now().toString(),
      ...itemData,
      createdAt: new Date().toISOString()
    };
    this.purchaseOrderItems.push(item);
    return item;
  }

  async getPurchaseOrdersByVendor(vendorId: string): Promise<any[]> {
    return this.purchaseOrders.filter(po => po.vendorId === vendorId);
  }

  async getVendorPayments(): Promise<any[]> {
    return this.vendorPayments;
  }

  async getVendorPayment(id: string): Promise<any | undefined> {
    return this.vendorPayments.find(vp => vp.id === id);
  }

  async createVendorPayment(paymentData: any): Promise<any> {
    const payment = {
      id: Date.now().toString(),
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    this.vendorPayments.push(payment);

    // Update vendor's outstanding dues
    const vendor = await this.getVendor(payment.vendorId);
    if (vendor) {
      const newOutstandingDues = (parseFloat(vendor.outstandingDues) - parseFloat(payment.amount)).toFixed(2);
      await this.updateVendor(vendor.id, { outstandingDues: newOutstandingDues });
    }

    // Potentially update PO status if fully paid
    if (payment.purchaseOrderId) {
      const po = await this.getPurchaseOrder(payment.purchaseOrderId);
      if (po && parseFloat(po.totalCost) <= parseFloat(payment.amount)) {
        await this.updatePurchaseOrder(payment.purchaseOrderId, { status: 'Closed' });
      }
    }

    return payment;
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
    // This needs actual sales data per product. Currently, 'sold' is not tracked per product.
    // For demonstration, we'll return dummy data or data based on current stock.
    const products = await this.getProducts();
    return products
      .sort((a, b) => (b.sold || 0) - (a.sold || 0)) // Assuming 'sold' might be added later
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        sold: p.sold || 0, // Placeholder for actual sold quantity
        revenue: ((p.sold || 0) * parseFloat(p.price)) // Placeholder for revenue
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
    const orders = await this.getOrders(); // This might not be the best source for sales if not all orders are processed through this system

    return products.map(product => {
      // Calculate average daily sales over last 30 days from orders
      const relevantOrders = orders.filter(order => 
        order.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      // This logic needs to be more robust - mapping orders to products and their quantities sold.
      // For now, it's a placeholder using a simplified approach.
      const totalQuantitySold = relevantOrders.reduce((sum, order) => {
        // This is a simplification, assuming product.sold could be populated from order items.
        // A real implementation would need to parse order items.
        return sum + (product.sold || 0); // Placeholder for actual quantity sold
      }, 0);

      const averageDailySales = totalQuantitySold > 0 ? totalQuantitySold / 30 : 0;
      const dailySales = Math.max(averageDailySales, 0.1); // Prevent division by zero
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

  async getVendorAnalytics() {
    const vendors = await this.getVendors();
    const purchaseOrders = await this.getPurchaseOrders();

    const vendorAnalytics = vendors.map(vendor => {
      const vendorPOs = purchaseOrders.filter(po => po.vendorId === vendor.id);
      const totalPOs = vendorPOs.length;
      const deliveredPOs = vendorPOs.filter(po => po.status === 'Delivered').length;
      const avgCostPerPO = totalPOs > 0 ? parseFloat(vendor.totalSpent) / totalPOs : 0;
      const deliveryPerformance = totalPOs > 0 ? (deliveredPOs / totalPOs) * 100 : 0;

      return {
        id: vendor.id,
        name: vendor.name,
        totalPOs,
        deliveredPOs,
        avgCostPerPO: parseFloat(avgCostPerPO.toFixed(2)),
        deliveryPerformance: parseFloat(deliveryPerformance.toFixed(2)),
        outstandingDues: parseFloat(vendor.outstandingDues)
      };
    });

    // Add overall trends if needed, e.g., cost trend over time (requires PO dates)
    return vendorAnalytics;
  }


  // Permission Management
  private permissions: any[] = [];
  private rolePermissions: any[] = [];

  // Permission Management Methods
  async getPermissions(): Promise<any[]> {
    return this.permissions;
  }

  async getRolePermissions(role: string): Promise<any[]> {
    return this.rolePermissions.filter(rp => rp.role === role);
  }

  async updateRolePermissions(role: string, permissions: Record<string, boolean>): Promise<void> {
    // Remove existing permissions for this role
    this.rolePermissions = this.rolePermissions.filter(rp => rp.role !== role);
    
    // Add new permissions
    Object.entries(permissions).forEach(([permissionName, granted]) => {
      this.rolePermissions.push({
        id: randomUUID(),
        role,
        permissionName,
        granted,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  async checkUserPermission(role: string, permissionName: string): Promise<boolean> {
    if (role === 'superadmin') return true; // Super admin has all permissions
    
    const rolePermission = this.rolePermissions.find(
      rp => rp.role === role && rp.permissionName === permissionName
    );
    
    return rolePermission ? rolePermission.granted : false;
  }

  async getUserPermissions(role: string): Promise<Record<string, boolean>> {
    const userRolePermissions = this.rolePermissions.filter(rp => rp.role === role);
    const permissionsObj: Record<string, boolean> = {};
    
    userRolePermissions.forEach(rp => {
      permissionsObj[rp.permissionName] = rp.granted;
    });
    
    return permissionsObj;
  }

  // Role-based access helpers
  async getUserRole(userId: string): Promise<'superadmin' | 'admin' | 'staff' | 'customer'> {
    const user = await this.getUserById(userId);
    if (!user) return 'customer'; // Default to customer if user not found

    if (user.role) return user.role as 'superadmin' | 'admin' | 'staff' | 'customer';

    // Fallback for mock roles if not explicitly set
    if (userId === 'superadmin' || userId.includes('superadmin')) return 'superadmin';
    if (userId === 'admin' || userId.includes('admin')) return 'admin';
    if (userId === 'staff' || userId.includes('staff')) return 'staff';
    return 'customer';
  }

  async getAlertsForUser(userId: string) {
    const role = await this.getUserRole(userId);
    const alerts = [];

    // Low Stock Alert (for Admin/Staff)
    if (role === 'admin' || role === 'staff') {
      const lowStockProducts = await this.getLowStockProducts();
      if (lowStockProducts.length > 0) {
        alerts.push({
          type: 'warning',
          message: `${lowStockProducts.length} products are low in stock`,
          action: 'View Inventory',
          route: '/inventory' // Example route
        });
      }

      // Expiring Stock Alert (for Admin/Staff)
      const expiringBatches = await this.getExpiringStock(7); // Within 7 days
      if (expiringBatches.length > 0) {
        alerts.push({
          type: 'info',
          message: `${expiringBatches.length} inventory batches expire within 7 days`,
          action: 'View Batches',
          route: '/inventory/batches' // Example route
        });
      }
    }

    // Pending Purchase Orders Alert (for Admin/Staff)
    if (role === 'admin' || role === 'staff') {
      const pendingPOs = this.purchaseOrders.filter(po => po.status === 'Sent');
      if (pendingPOs.length > 0) {
        alerts.push({
          type: 'info',
          message: `${pendingPOs.length} purchase orders are awaiting delivery`,
          action: 'View Purchase Orders',
          route: '/vendors/purchase-orders' // Example route
        });
      }
    }

    // Pending Vendor Payments Alert (for Admin/Staff)
    if (role === 'admin' || role === 'staff') {
      const vendorsWithDue = this.vendors.filter(v => parseFloat(v.outstandingDues) > 0);
      if (vendorsWithDue.length > 0) {
        alerts.push({
          type: 'warning',
          message: `Outstanding dues for ${vendorsWithDue.length} vendors`,
          action: 'View Vendor Payments',
          route: '/vendors/payments' // Example route
        });
      }
    }

    return alerts;
  }
}

export const storage = new MemStorage();