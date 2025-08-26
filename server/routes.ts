/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Dashboard
 *     description: Business metrics and analytics
 *   - name: Products
 *     description: Product and inventory management
 *   - name: Customers
 *     description: Customer management and data
 *   - name: Orders
 *     description: Order processing and management
 *   - name: Loyalty
 *     description: Loyalty program and points management
 *   - name: Subscriptions
 *     description: Subscription management
 *   - name: Analytics
 *     description: Advanced analytics and insights
 *   - name: AI
 *     description: AI-powered features and recommendations
 *   - name: Webhooks
 *     description: Shopify webhook endpoints
 *   - name: User Management
 *     description: User administration (Admin only)
 *   - name: Permissions
 *     description: Role and permission management
 *   - name: Accounting
 *     description: Financial and accounting features
 *   - name: Inventory
 *     description: Advanced inventory management
 *   - name: Vendors
 *     description: Vendor and supplier management
 *   - name: System
 *     description: System configuration and settings
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, insertCustomerSchema, insertOrderSchema, insertSubscriptionSchema,
  insertAccountSchema, insertJournalEntrySchema, insertJournalEntryLineSchema,
  insertAccountsReceivableSchema, insertAccountsPayableSchema, insertWalletSchema,
  insertWalletTransactionSchema, insertFiscalPeriodSchema
} from "@shared/schema";
import { shopify, saveShopSession, getShopSession } from "./shopify";
import { AuthService, authenticateToken, requireAdmin, requireStaffOrAdmin, requireCustomer, requireSuperAdmin, requirePermission, requireRole, type AuthRequest } from "./auth";
import { auditMiddleware } from "./middleware";
import systemRoutes from "./system-routes";
import integrationsRoutes from "./integrations-routes";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: User login
   *     description: Authenticate user with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *           example:
   *             email: "admin@example.com"
   *             password: "password123"
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Email and password required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Login failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await AuthService.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      const token = AuthService.generateToken(userWithoutPassword);

      res.json({ 
        user: userWithoutPassword, 
        token,
        message: "Login successful" 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: User registration
   *     description: Register a new user account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, password]
   *             properties:
   *               name:
   *                 type: string
   *                 example: "John Doe"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john@example.com"
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: "password123"
   *               role:
   *                 type: string
   *                 enum: [admin, staff, customer]
   *                 default: customer
   *                 example: "customer"
   *     responses:
   *       201:
   *         description: Registration successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Missing required fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: User already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Registration failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role = 'customer' } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists with this email" });
      }

      const hashedPassword = await AuthService.hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: role as 'admin' | 'staff' | 'customer'
      });

      const { password: _, ...userWithoutPassword } = user;
      const token = AuthService.generateToken(userWithoutPassword);

      res.status(201).json({ 
        user: userWithoutPassword, 
        token,
        message: "Registration successful" 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags: [Authentication]
   *     summary: Get current user
   *     description: Get current authenticated user information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Failed to get user info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { password, ...userWithoutPassword } = req.user!;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // User Management Routes
  // View users - Admin and Super Admin can view
  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const users = await storage.getUsers(shopDomain);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create users - Super Admin only
  app.post("/api/users", authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists with this email" });
      }

      const hashedPassword = await AuthService.hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: role as 'superadmin' | 'admin' | 'staff' | 'customer',
        shopDomain: (req as AuthRequest).user?.shopDomain
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update users - Admin and Super Admin can update
  app.put("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;
      const currentUser = (req as AuthRequest).user!;

      // Only Super Admin can change roles or update other Super Admins
      const targetUser = await storage.getUserById(id);
      if (targetUser?.role === 'superadmin' && currentUser.role !== 'superadmin') {
        return res.status(403).json({ error: "Only Super Admin can modify Super Admin accounts" });
      }

      if (role && role !== targetUser?.role && currentUser.role !== 'superadmin') {
        return res.status(403).json({ error: "Only Super Admin can change user roles" });
      }

      const updates: any = { name, email };
      if (currentUser.role === 'superadmin' && role) {
        updates.role = role;
      }
      if (password) {
        updates.password = await AuthService.hashPassword(password);
      }

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete users - Super Admin only
  app.delete("/api/users/:id", authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent deletion of own account
      if (id === (req as AuthRequest).user?.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message || "Failed to delete user" });
    }
  });

  // Shopify OAuth Routes
  app.get("/auth", async (req, res) => {
    if (!shopify) {
      return res.status(500).json({ error: "Shopify integration not configured" });
    }

    try {
      const shop = req.query.shop as string;
      if (!shop) {
        return res.status(400).json({ error: "Shop parameter required" });
      }

      const authRoute = shopify.auth.begin({
        shop,
        callbackPath: '/auth/callback',
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
      });

      res.redirect(authRoute);
    } catch (error) {
      console.error('OAuth initiation error:', error);
      res.status(500).json({ error: "OAuth initiation failed" });
    }
  });

  app.get("/auth/callback", async (req, res) => {
    if (!shopify) {
      return res.status(500).json({ error: "Shopify integration not configured" });
    }

    try {
      const callbackResult = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      const { session } = callbackResult;
      if (session && session.accessToken) {
        saveShopSession(session.shop, session.accessToken);
        console.log(`Shop ${session.shop} authenticated successfully`);

        // Redirect to main app
        res.redirect('/');
      } else {
        res.status(400).json({ error: "Authentication failed" });
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ error: "Authentication callback failed" });
    }
  });

  // Dashboard stats
  /**
   * @swagger
   * /api/stats:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get dashboard statistics
   *     description: Retrieve key business metrics and statistics
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: shop
   *         schema:
   *           type: string
   *         description: Shop domain to filter stats
   *     responses:
   *       200:
   *         description: Statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalRevenue:
   *                   type: number
   *                   example: 15750.50
   *                 totalOrders:
   *                   type: integer
   *                   example: 125
   *                 totalCustomers:
   *                   type: integer
   *                   example: 89
   *                 totalProducts:
   *                   type: integer
   *                   example: 45
   *                 lowStockProducts:
   *                   type: integer
   *                   example: 3
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Insufficient permissions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Failed to fetch stats
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/stats", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const stats = await storage.getStats(shopDomain);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Enhanced analytics endpoints
  app.get("/api/analytics/sales-trends", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const trends = await storage.getSalesTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales trends" });
    }
  });

  app.get("/api/analytics/top-products", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const topProducts = await storage.getTopProducts();
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top products" });
    }
  });

  app.get("/api/analytics/loyalty-points", async (req, res) => {
    try {
      const loyaltyData = await storage.getLoyaltyPointsAnalytics();
      res.json(loyaltyData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loyalty analytics" });
    }
  });

  app.get("/api/inventory/forecast", async (req, res) => {
    try {
      const forecast = await storage.getStockForecast();
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock forecast" });
    }
  });

  // Role-based endpoints
  app.get("/api/user/role/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const role = await storage.getUserRole(userId);
      res.json({ role });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user role" });
    }
  });

  app.get("/api/alerts/:role", async (req, res) => {
    try {
      const { role } = req.params;
      const alerts = await storage.getAlertsForUser(role as 'admin' | 'staff' | 'customer');
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Products/Inventory routes
  /**
   * @swagger
   * /api/products:
   *   get:
   *     tags: [Products]
   *     summary: Get all products
   *     description: Retrieve all products for the authenticated shop
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: shop
   *         schema:
   *           type: string
   *         description: Shop domain to filter products
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Insufficient permissions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Failed to fetch products
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/products", authenticateToken, requirePermission('inventory:view'), async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const products = await storage.getProducts(shopDomain);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
      const shopDomain = req.query.shop as string;
      const products = await storage.getLowStockProducts(threshold, shopDomain);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock products" });
    }
  });

  /**
   * @swagger
   * /api/products:
   *   post:
   *     tags: [Products]
   *     summary: Create a new product
   *     description: Create a new product in inventory
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, price, stock]
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Premium Widget"
   *               description:
   *                 type: string
   *                 example: "High-quality widget for professionals"
   *               price:
   *                 type: string
   *                 example: "29.99"
   *               stock:
   *                 type: integer
   *                 example: 100
   *               category:
   *                 type: string
   *                 example: "Electronics"
   *               shopDomain:
   *                 type: string
   *                 example: "demo-store.myshopify.com"
   *     responses:
   *       201:
   *         description: Product created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       400:
   *         description: Invalid product data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Insufficient permissions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.post("/api/products", authenticateToken, requirePermission('inventory:create'), async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", authenticateToken, requirePermission('inventory:edit'), async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.updateProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Shopify sync endpoint
  app.post("/api/shopify/sync", async (req, res) => {
    try {
      const shopDomain = req.body.shop as string;
      if (!shopDomain) {
        return res.status(400).json({ error: "Shop domain required" });
      }

      // Sync products, customers, and orders from Shopify
      const products = await storage.syncProductsFromShopify(shopDomain);
      const customers = await storage.syncCustomersFromShopify(shopDomain);
      const orders = await storage.syncOrdersFromShopify(shopDomain);

      res.json({ 
        message: "Shopify sync completed successfully", 
        synced: {
          products: products.length,
          customers: customers.length,
          orders: orders.length
        }
      });
    } catch (error) {
      console.error('Shopify sync error:', error);
      res.status(500).json({ error: "Shopify sync failed: " + (error as Error).message });
    }
  });

  // Customer routes
  /**
   * @swagger
   * /api/customers:
   *   get:
   *     tags: [Customers]
   *     summary: Get all customers
   *     description: Retrieve all customers for the authenticated shop
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: shop
   *         schema:
   *           type: string
   *         description: Shop domain to filter customers
   *     responses:
   *       200:
   *         description: Customers retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Customer'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Insufficient permissions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Failed to fetch customers
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  app.get("/api/customers", authenticateToken, requirePermission('customers:view'), async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const customers = await storage.getCustomers(shopDomain);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", authenticateToken, requirePermission('customers:create'), async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", authenticateToken, requirePermission('customers:edit'), async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.updateCustomer(id, req.body);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const orders = await storage.getOrders(shopDomain);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const { id } = req.params;
      const orders = await storage.getOrdersByCustomer(id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);

      // Process loyalty points ($1 spent = 1 point)
      if (order.customerId) {
        const pointsEarned = Math.floor(parseFloat(order.total));
        const customer = await storage.getCustomer(order.customerId);
        if (customer) {
          await storage.updateCustomer(order.customerId, {
            loyaltyPoints: customer.loyaltyPoints + pointsEarned,
            totalSpent: (parseFloat(customer.totalSpent || '0') + parseFloat(order.total)).toString()
          });

          // Create loyalty transaction
          await storage.createLoyaltyTransaction({
            customerId: order.customerId,
            orderId: order.id,
            points: pointsEarned,
            type: 'earned'
          });
        }
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/customers/:id/subscriptions", async (req, res) => {
    try {
      const { id } = req.params;
      const subscriptions = await storage.getSubscriptionsByCustomer(id);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer subscriptions" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ error: "Invalid subscription data" });
    }
  });

  app.put("/api/subscriptions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.updateSubscription(id, req.body);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  // Loyalty routes
  app.get("/api/loyalty/transactions", async (req, res) => {
    try {
      const transactions = await storage.getLoyaltyTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loyalty transactions" });
    }
  });

  app.get("/api/customers/:id/loyalty", async (req, res) => {
    try {
      const { id } = req.params;
      const transactions = await storage.getLoyaltyTransactionsByCustomer(id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer loyalty transactions" });
    }
  });

  // Webhook endpoint for Shopify orders
  app.post("/api/webhooks/shopify/orders/create", async (req, res) => {
    try {
      // TODO: Verify webhook signature in production
      const shopifyOrder = req.body;

      // Find or create customer
      let customer = await storage.getCustomerByEmail(shopifyOrder.email);
      if (!customer) {
        customer = await storage.createCustomer({
          shopifyId: shopifyOrder.customer?.id?.toString(),
          name: `${shopifyOrder.billing_address?.first_name} ${shopifyOrder.billing_address?.last_name}`,
          email: shopifyOrder.email,
          loyaltyPoints: 0,
          totalSpent: '0'
        });
      }

      // Create order
      const order = await storage.createOrder({
        shopifyId: shopifyOrder.id.toString(),
        customerId: customer.id,
        total: shopifyOrder.total_price,
        pointsEarned: Math.floor(parseFloat(shopifyOrder.total_price)),
        status: shopifyOrder.financial_status
      });

      // Update customer loyalty points
      const pointsEarned = Math.floor(parseFloat(shopifyOrder.total_price));
      await storage.updateCustomer(customer.id, {
        loyaltyPoints: customer.loyaltyPoints + pointsEarned,
        totalSpent: (parseFloat(customer.totalSpent || '0') + parseFloat(shopifyOrder.total_price)).toString()
      });

      // Update product inventory
      for (const lineItem of shopifyOrder.line_items) {
        const product = await storage.getProductByShopifyId(lineItem.product_id.toString());
        if (product) {
          await storage.updateProduct(product.id, {
            stock: product.stock - lineItem.quantity
          });
        }
      }

      res.json({ message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Shopify Webhook Routes
  app.post("/webhooks/orders/create", async (req, res) => {
    try {
      const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
      const body = req.body;
      const shopDomain = req.get("X-Shopify-Shop-Domain");

      // Verify webhook authenticity (in production, use proper webhook verification)
      if (!hmacHeader || !shopDomain) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Process new order
      const order = body;
      console.log(`New order received from ${shopDomain}:`, order.id);

      // Find or create customer
      let customer;
      if (order.customer && order.customer.id) {
        customer = await storage.getCustomerByShopifyId(order.customer.id.toString());
        if (!customer && order.email) {
          customer = await storage.getCustomerByEmail(order.email);
        }

        if (!customer) {
          customer = await storage.createCustomer({
            shopifyId: order.customer.id.toString(),
            name: `${order.customer.first_name} ${order.customer.last_name}`.trim(),
            email: order.email,
            loyaltyPoints: 0,
            totalSpent: order.customer.total_spent || order.total_price
          });
        }
      }

      // Create order and award loyalty points
      const pointsEarned = Math.floor(parseFloat(order.total_price));
      const newOrder = await storage.createOrder({
        shopifyId: order.id.toString(),
        customerId: customer?.id || null,
        total: order.total_price,
        pointsEarned,
        status: order.financial_status
      });

      // Award loyalty points to customer
      if (customer) {
        await storage.updateCustomer(customer.id, {
          loyaltyPoints: customer.loyaltyPoints + pointsEarned,
          totalSpent: parseFloat(customer.totalSpent) + parseFloat(order.total_price)
        });

        // Create loyalty transaction
        await storage.createLoyaltyTransaction({
          customerId: customer.id,
          points: pointsEarned,
          type: "earned",
          description: `Points earned from order #${order.order_number}`
        });
      }

      res.json({ received: true, orderId: newOrder.id });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Customer portal endpoints
  app.post("/api/customer/redeem-points", async (req, res) => {
    try {
      const { customerId, points, description } = req.body;

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      if (customer.loyaltyPoints < points) {
        return res.status(400).json({ error: "Insufficient points" });
      }

      // Deduct points from customer
      await storage.updateCustomer(customerId, {
        loyaltyPoints: customer.loyaltyPoints - points
      });

      // Create redemption transaction
      await storage.createLoyaltyTransaction({
        customerId,
        points: -points,
        type: "redeemed",
        description: description || `Redeemed ${points} points for discount`
      });

      res.json({ success: true, newBalance: customer.loyaltyPoints - points });
    } catch (error) {
      res.status(500).json({ error: "Failed to redeem points" });
    }
  });

  app.get("/api/customer/portal/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await storage.getCustomer(customerId);

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const orders = await storage.getOrdersByCustomer(customerId);
      const subscriptions = await storage.getSubscriptionsByCustomer(customerId);
      const loyaltyTransactions = await storage.getLoyaltyTransactionsByCustomer(customerId);

      res.json({
        customer,
        orders,
        subscriptions,
        loyaltyTransactions,
        totalEarned: loyaltyTransactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0),
        totalRedeemed: loyaltyTransactions.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + Math.abs(t.points), 0)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer portal data" });
    }
  });

  // AI Recommendations
  app.get("/api/ai/recommendations/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;

      const { aiRecommendations } = await import("./ai-recommendations");
      const recommendations = await aiRecommendations.generateRecommendations(customerId, limit);

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Abandoned Cart Management
  app.post("/api/abandoned-cart/track", async (req, res) => {
    try {
      const { customerId, items } = req.body;

      const { abandonedCartService } = await import("./abandoned-cart");
      const cart = await abandonedCartService.trackAbandonedCart(customerId, items);

      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Failed to track abandoned cart" });
    }
  });

  app.get("/api/abandoned-cart/stats", async (req, res) => {
    try {
      const { abandonedCartService } = await import("./abandoned-cart");
      const stats = await abandonedCartService.getRecoveryStats();

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get cart stats" });
    }
  });

  app.post("/api/abandoned-cart/send-recovery/:cartId", async (req, res) => {
    try {
      const { cartId } = req.params;
      const { attempt } = req.body;

      const { abandonedCartService } = await import("./abandoned-cart");
      const result = await abandonedCartService.sendRecoveryEmail(cartId, attempt);

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to send recovery email" });
    }
  });

  // Loyalty Tiers
  app.get("/api/loyalty/tiers", async (req, res) => {
    try {
      const { loyaltyTiers } = await import("./loyalty-tiers");
      const tiers = loyaltyTiers.getAllTiers();

      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loyalty tiers" });
    }
  });

  app.get("/api/loyalty/customer-tier/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;

      const { loyaltyTiers } = await import("./loyalty-tiers");
      const tierInfo = await loyaltyTiers.getCustomerTierInfo(customerId);

      res.json(tierInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer tier info" });
    }
  });

  app.get("/api/loyalty/tier-distribution", async (req, res) => {
    try {
      const { loyaltyTiers } = await import("./loyalty-tiers");
      const distribution = await loyaltyTiers.getTierDistribution();

      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tier distribution" });
    }
  });

  // Advanced Inventory Management
  app.get("/api/inventory/advanced-forecast", async (req, res) => {
    try {
      const { inventoryService } = await import("./inventory-service");
      const forecast = await inventoryService.getStockForecast();
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stock forecast" });
    }
  });

  app.get("/api/inventory/batches", async (req, res) => {
    try {
      const batches = await storage.getInventoryBatches();
      res.json(batches);
    } catch (error) {
      res.status(500).json({ error: "Failed to get inventory batches" });
    }
  });

  app.post("/api/inventory/batches", async (req, res) => {
    try {
      const batch = await storage.createInventoryBatch(req.body);
      res.status(201).json(batch);
    } catch (error) {
      res.status(500).json({ error: "Failed to create inventory batch" });
    }
  });

  app.get("/api/inventory/expiring-stock", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const { inventoryService } = await import("./inventory-service");
      const expiringStock = await inventoryService.getExpiringStock(days);
      res.json(expiringStock);
    } catch (error) {
      res.status(500).json({ error: "Failed to get expiring stock" });
    }
  });

  app.post("/api/inventory/adjust-stock", async (req, res) => {
    try {
      const { batchId, adjustmentType, newQuantity, reason } = req.body;
      const { inventoryService } = await import("./inventory-service");

      const batch = await storage.getInventoryBatch(batchId);
      if (!batch) return res.status(404).json({ error: "Batch not found" });

      const adjustment = await inventoryService.adjustStock({
        productId: batch.productId!,
        warehouseId: batch.warehouseId!,
        batchId,
        adjustmentType,
        quantityBefore: batch.remainingQuantity,
        quantityAfter: newQuantity,
        reason,
        adjustedBy: 'admin' // TODO: Get from auth
      });

      res.json(adjustment);
    } catch (error) {
      res.status(500).json({ error: "Failed to adjust stock" });
    }
  });

  app.get("/api/inventory/audit-trail", async (req, res) => {
    try {
      const { productId, warehouseId, days } = req.query;
      const { inventoryService } = await import("./inventory-service");

      const auditTrail = await inventoryService.getStockAuditTrail(
        productId as string,
        warehouseId as string,
        parseInt(days as string) || 30
      );

      res.json(auditTrail);
    } catch (error) {
      res.status(500).json({ error: "Failed to get audit trail" });
    }
  });

  app.post("/api/inventory/consume-stock", async (req, res) => {
    try {
      const { productId, warehouseId, quantity, reference, referenceType } = req.body;
      const { inventoryService } = await import("./inventory-service");

      const consumed = await inventoryService.consumeStock(
        productId,
        warehouseId,
        quantity,
        reference,
        referenceType,
        'system' // TODO: Get from auth
      );

      res.json(consumed);
    } catch (error) {
      res.status(500).json({ error: "Failed to consume stock: " + (error as Error).message });
    }
  });

  // Warehouse Management
  app.get("/api/warehouses", async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const warehouses = await storage.getWarehouses(shopDomain);
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warehouses" });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const warehouseData = req.body;
      const warehouse = await storage.createWarehouse(warehouseData);
      res.status(201).json(warehouse);
    } catch (error) {
      res.status(500).json({ error: "Failed to create warehouse" });
    }
  });

  // Vendor Management
  app.get("/api/vendors", async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const vendors = await storage.getVendors(shopDomain);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = req.body;
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const vendor = await storage.updateVendor(id, req.body);
      if (!vendor) return res.status(404).json({ error: "Vendor not found" });
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  // Purchase Order Management
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const pos = await storage.getPurchaseOrders(shopDomain);
      res.json(pos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const { poData, items } = req.body;
      const { vendorService } = await import("./vendor-service");

      const result = await vendorService.createPurchaseOrder(poData, items);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  app.post("/api/purchase-orders/:id/receive", async (req, res) => {
    try {
      const { id } = req.params;
      const { receivedItems, warehouseId } = req.body;
      const { vendorService } = await import("./vendor-service");

      const result = await vendorService.receivePurchaseOrder(
        id,
        receivedItems,
        warehouseId,
        'admin' // TODO: Get from auth
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to receive purchase order" });
    }
  });

  // Vendor Analytics
  app.get("/api/vendor-analytics", async (req, res) => {
    try {
      const { vendorId, days } = req.query;
      const { vendorService } = await import("./vendor-service");

      const analytics = await vendorService.getVendorAnalytics(
        vendorId as string,
        parseInt(days as string) || 90
      );

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to get vendor analytics" });
    }
  });

  app.get("/api/purchase-order-recommendations", async (req, res) => {
    try {
      const { warehouseId } = req.query;
      const { vendorService } = await import("./vendor-service");

      const recommendations = await vendorService.getPurchaseOrderRecommendations(warehouseId as string);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get PO recommendations" });
    }
  });

  // Vendor Payments
  app.post("/api/vendor-payments", async (req, res) => {
    try {
      const paymentData = req.body;
      const { vendorService } = await import("./vendor-service");

      const payment = await vendorService.recordPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  // AI Sales Forecasting
  app.get("/api/ai/sales-forecast", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;

      // Simple AI forecasting based on historical data
      const orders = await storage.getOrders();
      const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const daysAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      });

      const totalRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const avgDailyRevenue = totalRevenue / 30;

      // Apply growth trend and seasonal factors
      const growthRate = 1.05; // 5% growth
      const seasonalMultiplier = 1.1; // 10% seasonal boost

      const forecastRevenue = avgDailyRevenue * days * growthRate * seasonalMultiplier;
      const confidence = Math.min(85 + (recentOrders.length / 10), 95);

      res.json({
        forecast: Math.round(forecastRevenue),
        confidence: Math.round(confidence),
        dailyAverage: Math.round(avgDailyRevenue),
        historicalOrders: recentOrders.length,
        trends: {
          growth: '+5%',
          seasonal: '+10%',
          overall: 'positive'
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate sales forecast" });
    }
  });

  // AI Business Insights
  app.get("/api/ai/business-insights", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const orders = await storage.getOrders();
      const customers = await storage.getCustomers();
      const products = await storage.getProducts();

      // Calculate business health score
      const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const daysAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= days;
      });

      const totalRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const avgOrderValue = recentOrders.length ? totalRevenue / recentOrders.length : 0;

      // Customer metrics
      const customerOrderCounts = recentOrders.reduce((acc, order) => {
        if (order.customerId) {
          acc[order.customerId] = (acc[order.customerId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
      const repeatRate = customers.length ? (repeatCustomers / customers.length) * 100 : 0;

      // Product metrics
      const lowStockProducts = products.filter(p => p.stock < 10).length;
      const stockHealthScore = products.length ? ((products.length - lowStockProducts) / products.length) * 100 : 100;

      // Calculate overall health score (weighted average)
      const healthScore = Math.round(
        (stockHealthScore * 0.3) + 
        (Math.min(repeatRate * 2, 100) * 0.3) + 
        (Math.min(avgOrderValue / 50 * 100, 100) * 0.4)
      );

      res.json({
        healthScore,
        metrics: {
          totalRevenue,
          avgOrderValue,
          repeatRate,
          stockHealthScore,
          lowStockCount: lowStockProducts
        },
        insights: [
          {
            type: 'success',
            message: `Strong ${repeatRate.toFixed(1)}% repeat customer rate indicates good customer satisfaction`,
            action: 'Continue current customer retention strategies'
          },
          {
            type: stockHealthScore < 80 ? 'warning' : 'info',
            message: `${lowStockProducts} products running low on inventory`,
            action: 'Review inventory levels and reorder critical items'
          },
          {
            type: avgOrderValue > 50 ? 'success' : 'warning',
            message: `Average order value of $${avgOrderValue.toFixed(2)} ${avgOrderValue > 50 ? 'exceeds' : 'below'} industry average`,
            action: avgOrderValue > 50 ? 'Maintain upselling strategies' : 'Implement cross-selling and bundling'
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate business insights" });
    }
  });

  // Permission Management Routes (Super Admin only)
  app.get("/api/permissions", authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });

  app.get("/api/role-permissions/:role", authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const { role } = req.params;
      const rolePermissions = await storage.getRolePermissions(role);
      const userPermissions = await storage.getUserPermissions(role);
      res.json({
        role,
        permissions: userPermissions,
        details: rolePermissions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role permissions" });
    }
  });

  app.put("/api/role-permissions/:role", authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const { role } = req.params;
      const { permissions } = req.body;

      // Prevent modifying superadmin permissions
      if (role === 'superadmin') {
        return res.status(403).json({ error: "Cannot modify Super Admin permissions" });
      }

      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({ error: "Invalid permissions data" });
      }

      await storage.updateRolePermissions(role, permissions);
      res.json({ message: "Role permissions updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update role permissions" });
    }
  });

  app.get("/api/user-permissions", authenticateToken, async (req, res) => {
    try {
      const user = (req as AuthRequest).user!;
      const permissions = await storage.getRolePermissions(user.role);
      res.json({
        role: user.role,
        permissions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user permissions" });
    }
  });

  // Permission Management Routes (Super Admin only)
  app.get("/api/permissions", requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });

  app.get("/api/role-permissions/:role", requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const { role } = req.params;
      if (!['admin', 'staff', 'customer'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const permissions = await storage.getRolePermissions(role);
      res.json({ role, permissions });
    } catch (error) {
      console.error('Get role permissions error:', error);
      res.status(500).json({ error: "Failed to fetch role permissions" });
    }
  });

  app.put("/api/role-permissions/:role", requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const { role } = req.params;
      const { permissions } = req.body;

      if (!['admin', 'staff', 'customer'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({ error: "Invalid permissions data" });
      }

      await storage.updateRolePermissions(role, permissions);
      res.json({ message: "Role permissions updated successfully" });
    } catch (error) {
      console.error('Update role permissions error:', error);
      res.status(500).json({ error: "Failed to update role permissions" });
    }
  });

  // Role-based access endpoints
  app.get("/api/user/role/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      // Mock role mapping - in real app would come from auth/database
      const roleMap: Record<string, string> = {
        'admin': 'admin',
        'staff': 'staff',
        'customer-demo': 'customer',
        'customer': 'customer'
      };

      const role = roleMap[userId] || 'customer';
      res.json({ role, userId });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user role" });
    }
  });

  // Alert system endpoint
  app.get("/api/alerts/:role", async (req, res) => {
    try {
      const { role } = req.params;
      const alerts = [];

      const lowStockProducts = await storage.getLowStockProducts();
      const subscriptions = await storage.getSubscriptions();
      const orders = await storage.getOrders();

      // Stock alerts for admin and staff
      if (role === 'admin' || role === 'staff') {
        if (lowStockProducts.length > 0) {
          alerts.push({
            type: 'warning',
            message: `${lowStockProducts.length} products are running low on stock`,
            action: 'View Inventory'
          });
        }

        // Subscription expiration alerts
        const expiringSoon = subscriptions.filter(s => {
          const nextBilling = new Date(s.nextBillingDate);
          const daysLeft = Math.ceil((nextBilling.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 7 && s.status === 'active';
        });

        if (expiringSoon.length > 0) {
          alerts.push({
            type: 'info',
            message: `${expiringSoon.length} subscriptions expiring this week`,
            action: 'Review Subscriptions'
          });
        }

        // New orders for admin
        if (role === 'admin' && orders.length > 0) {
          const recentOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            const hoursAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
            return hoursAgo <= 24;
          });

          if (recentOrders.length > 0) {
            alerts.push({
              type: 'success',
              message: `${recentOrders.length} new orders in the last 24 hours`,
              action: 'View Orders'
            });
          }
        }
      }

      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Inventory forecast endpoint
  app.get("/api/inventory/forecast", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const orders = await storage.getOrders();

      const forecast = products.map(product => {
        // Calculate average daily sales from order history
        const productOrders = orders.filter(order => {
          // This is simplified - in real app would track order line items
          return order.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        });

        const totalSold = product.sold || 0;
        const dailySales = totalSold / 30; // Simplified average
        const daysLeft = dailySales > 0 ? Math.ceil(product.stock / dailySales) : 999;

        let status = 'good';
        if (daysLeft < 7) status = 'critical';
        else if (daysLeft < 14) status = 'warning';

        return {
          id: product.id,
          name: product.name,
          stock: product.stock,
          dailySales: Math.round(dailySales * 10) / 10,
          daysLeft,
          status
        };
      });

      res.json(forecast);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate forecast" });
    }
  });

  // Mount system and integration routes
  app.use('/api/system', authenticateToken, systemRoutes);
  app.use('/api/integrations', authenticateToken, integrationsRoutes);

  // System Settings endpoint
  app.get("/api/system/settings", authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      res.status(500).json({ error: 'Failed to fetch system settings' });
    }
  });

  // Theme Settings endpoint
  app.put("/api/system/theme", authenticateToken, requireRole(['superadmin']), async (req, res) => {
    try {
      const { theme } = req.body;
      if (!['emerald', 'blue', 'purple', 'coral'].includes(theme)) {
        return res.status(400).json({ error: 'Invalid theme' });
      }

      // In a real app, you'd save this to the database
      // For now, we'll just return success
      res.json({ success: true, theme });
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(500).json({ error: 'Failed to update theme' });
    }
  });

  // ACCOUNTING MODULE ROUTES

  // Chart of Accounts Routes
  app.get("/api/accounts", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const accounts = await storage.getAccounts(req.user?.shopDomain);
      res.json(accounts);
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.get("/api/accounts/hierarchy", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const hierarchy = await storage.getAccountsHierarchy(req.user?.shopDomain);
      res.json(hierarchy);
    } catch (error) {
      console.error('Get accounts hierarchy error:', error);
      res.status(500).json({ error: "Failed to fetch accounts hierarchy" });
    }
  });

  app.get("/api/accounts/:id", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const account = await storage.getAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error('Get account error:', error);
      res.status(500).json({ error: "Failed to fetch account" });
    }
  });

  app.post("/api/accounts", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertAccountSchema.parse({
        ...req.body,
        shopDomain: req.user?.shopDomain,
        createdBy: req.user?.id
      });
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      console.error('Create account error:', error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.put("/api/accounts/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const account = await storage.updateAccount(req.params.id, req.body);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error('Update account error:', error);
      res.status(500).json({ error: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteAccount(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Journal Entries Routes
  app.get("/api/journal-entries", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const entries = await storage.getJournalEntries(req.user?.shopDomain, req.query);
      res.json(entries);
    } catch (error) {
      console.error('Get journal entries error:', error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal-entries/:id", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const entry = await storage.getJournalEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      const lines = await storage.getJournalEntryLines(req.params.id);
      res.json({ ...entry, lines });
    } catch (error) {
      console.error('Get journal entry error:', error);
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/journal-entries", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { lines, ...entryData } = req.body;
      
      // Validate debit = credit
      const totalDebit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debitAmount) || 0), 0);
      const totalCredit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.creditAmount) || 0), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({ error: "Debits must equal credits" });
      }

      const validatedEntry = insertJournalEntrySchema.parse({
        ...entryData,
        totalDebit,
        totalCredit,
        shopDomain: req.user?.shopDomain,
        createdBy: req.user?.id
      });

      const validatedLines = lines.map((line: any) => 
        insertJournalEntryLineSchema.parse(line)
      );

      const entry = await storage.createJournalEntry(validatedEntry, validatedLines);
      res.status(201).json(entry);
    } catch (error) {
      console.error('Create journal entry error:', error);
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  app.post("/api/journal-entries/:id/post", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const entry = await storage.postJournalEntry(req.params.id, req.user?.id || '');
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error('Post journal entry error:', error);
      res.status(500).json({ error: "Failed to post journal entry" });
    }
  });

  // General Ledger Routes
  app.get("/api/general-ledger", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const ledger = await storage.getGeneralLedger(req.user?.shopDomain, req.query);
      res.json(ledger);
    } catch (error) {
      console.error('Get general ledger error:', error);
      res.status(500).json({ error: "Failed to fetch general ledger" });
    }
  });

  app.get("/api/general-ledger/account/:accountId", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      const ledger = await storage.getAccountLedger(
        req.params.accountId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(ledger);
    } catch (error) {
      console.error('Get account ledger error:', error);
      res.status(500).json({ error: "Failed to fetch account ledger" });
    }
  });

  // Accounts Receivable Routes
  app.get("/api/accounts-receivable", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const receivables = await storage.getAccountsReceivable(req.user?.shopDomain, req.query);
      res.json(receivables);
    } catch (error) {
      console.error('Get accounts receivable error:', error);
      res.status(500).json({ error: "Failed to fetch accounts receivable" });
    }
  });

  app.get("/api/accounts-receivable/aging-report", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const report = await storage.getAgingReport(req.user?.shopDomain);
      res.json(report);
    } catch (error) {
      console.error('Get aging report error:', error);
      res.status(500).json({ error: "Failed to fetch aging report" });
    }
  });

  app.post("/api/accounts-receivable", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertAccountsReceivableSchema.parse({
        ...req.body,
        shopDomain: req.user?.shopDomain
      });
      const receivable = await storage.createReceivable(validatedData);
      res.status(201).json(receivable);
    } catch (error) {
      console.error('Create receivable error:', error);
      res.status(500).json({ error: "Failed to create receivable" });
    }
  });

  // Accounts Payable Routes
  app.get("/api/accounts-payable", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const payables = await storage.getAccountsPayable(req.user?.shopDomain, req.query);
      res.json(payables);
    } catch (error) {
      console.error('Get accounts payable error:', error);
      res.status(500).json({ error: "Failed to fetch accounts payable" });
    }
  });

  app.get("/api/accounts-payable/aging-report", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const report = await storage.getVendorAgingReport(req.user?.shopDomain);
      res.json(report);
    } catch (error) {
      console.error('Get vendor aging report error:', error);
      res.status(500).json({ error: "Failed to fetch vendor aging report" });
    }
  });

  app.post("/api/accounts-payable", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertAccountsPayableSchema.parse({
        ...req.body,
        shopDomain: req.user?.shopDomain
      });
      const payable = await storage.createPayable(validatedData);
      res.status(201).json(payable);
    } catch (error) {
      console.error('Create payable error:', error);
      res.status(500).json({ error: "Failed to create payable" });
    }
  });

  // Wallets & Credits Routes
  app.get("/api/wallets", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { entityType } = req.query;
      const wallets = await storage.getWallets(entityType as string, req.user?.shopDomain);
      res.json(wallets);
    } catch (error) {
      console.error('Get wallets error:', error);
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  app.get("/api/wallets/:id/transactions", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const transactions = await storage.getWalletTransactions(req.params.id);
      res.json(transactions);
    } catch (error) {
      console.error('Get wallet transactions error:', error);
      res.status(500).json({ error: "Failed to fetch wallet transactions" });
    }
  });

  app.post("/api/wallets", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertWalletSchema.parse({
        ...req.body,
        shopDomain: req.user?.shopDomain
      });
      const wallet = await storage.createWallet(validatedData);
      res.status(201).json(wallet);
    } catch (error) {
      console.error('Create wallet error:', error);
      res.status(500).json({ error: "Failed to create wallet" });
    }
  });

  app.post("/api/wallets/:id/adjust", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { amount, description } = req.body;
      const transaction = await storage.adjustWalletBalance(
        req.params.id, 
        amount, 
        description, 
        req.user?.id || ''
      );
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Adjust wallet balance error:', error);
      res.status(500).json({ error: "Failed to adjust wallet balance" });
    }
  });

  // Financial Reports Routes
  app.get("/api/financial-reports", async (req, res) => {
    try {
      const { type, startDate, endDate } = req.query;
      
      const balanceSheet = await storage.getBalanceSheet();
      const profitAndLoss = await storage.getProfitAndLoss();
      const cashFlow = await storage.getCashFlowStatement();

      const consolidatedReport = {
        profitAndLoss,
        balanceSheet,
        cashFlow
      };

      res.json(consolidatedReport);
    } catch (error) {
      console.error('Get financial reports error:', error);
      res.status(500).json({ error: "Failed to fetch financial reports" });
    }
  });

  app.get("/api/financial-reports/export", async (req, res) => {
    try {
      const { type, format, startDate, endDate } = req.query;
      
      // Mock export functionality - in real app would generate PDF/Excel
      res.json({ 
        message: `${format?.toString().toUpperCase()} export for ${type} report would be generated here`,
        downloadUrl: `/downloads/${type}-report-${Date.now()}.${format}`
      });
    } catch (error) {
      console.error('Export financial reports error:', error);
      res.status(500).json({ error: "Failed to export financial reports" });
    }
  });

  app.get("/api/reports/balance-sheet", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { asOfDate } = req.query;
      const report = await storage.getBalanceSheet(
        req.user?.shopDomain,
        asOfDate ? new Date(asOfDate as string) : undefined
      );
      res.json(report);
    } catch (error) {
      console.error('Get balance sheet error:', error);
      res.status(500).json({ error: "Failed to fetch balance sheet" });
    }
  });

  app.get("/api/reports/profit-loss", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getProfitAndLoss(
        req.user?.shopDomain,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(report);
    } catch (error) {
      console.error('Get profit and loss error:', error);
      res.status(500).json({ error: "Failed to fetch profit and loss statement" });
    }
  });

  app.get("/api/reports/cash-flow", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getCashFlowStatement(
        req.user?.shopDomain,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(report);
    } catch (error) {
      console.error('Get cash flow error:', error);
      res.status(500).json({ error: "Failed to fetch cash flow statement" });
    }
  });

  app.get("/api/reports/trial-balance", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { asOfDate } = req.query;
      const report = await storage.getTrialBalance(
        req.user?.shopDomain,
        asOfDate ? new Date(asOfDate as string) : undefined
      );
      res.json(report);
    } catch (error) {
      console.error('Get trial balance error:', error);
      res.status(500).json({ error: "Failed to fetch trial balance" });
    }
  });

  app.get("/api/reports/accounting-summary", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const summary = await storage.getAccountingSummary(req.user?.shopDomain);
      res.json(summary);
    } catch (error) {
      console.error('Get accounting summary error:', error);
      res.status(500).json({ error: "Failed to fetch accounting summary" });
    }
  });

  app.get("/api/reports/financial-metrics", authenticateToken, requireStaffOrAdmin, async (req: AuthRequest, res) => {
    try {
      const { period } = req.query;
      const metrics = await storage.getFinancialMetrics(
        req.user?.shopDomain,
        period as 'month' | 'quarter' | 'year'
      );
      res.json(metrics);
    } catch (error) {
      console.error('Get financial metrics error:', error);
      res.status(500).json({ error: "Failed to fetch financial metrics" });
    }
  });

  // ==========================================
  // ADVANCED ACCOUNTS MODULE API ROUTES
  // ==========================================

  // Bank Reconciliation Routes
  app.get("/api/bank-statements", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const { bankAccountId, page = 1, limit = 50 } = req.query;
      // TODO: Implement bank statements fetching with pagination
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bank statements" });
    }
  });

  app.post("/api/bank-statements/upload", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const { bankAccountId, statements } = req.body;
      // TODO: Process CSV/OFX bank statement upload
      res.json({ imported: statements?.length || 0, errors: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload bank statements" });
    }
  });

  app.get("/api/bank-reconciliations", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const { bankAccountId } = req.query;
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reconciliations" });
    }
  });

  app.post("/api/bank-reconciliations", authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.status(201).json({ id: "recon-1", status: "draft" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create reconciliation" });
    }
  });

  // Tax Management Routes
  app.get("/api/tax-rates", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      res.json([
        {
          id: "tax-1",
          name: "VAT",
          type: "vat",
          rate: "0.20",
          region: "UK",
          isActive: true,
          effectiveFrom: "2024-01-01",
          accountId: "2200"
        },
        {
          id: "tax-2", 
          name: "Sales Tax",
          type: "sales_tax",
          rate: "0.0825",
          region: "CA",
          isActive: true,
          effectiveFrom: "2024-01-01",
          accountId: "2210"
        }
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tax rates" });
    }
  });

  app.post("/api/tax-rates", authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.status(201).json({ id: "tax-new", ...req.body });
    } catch (error) {
      res.status(500).json({ error: "Failed to create tax rate" });
    }
  });

  app.get("/api/tax-report", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      res.json({
        period: period || "Q1 2024",
        totalSales: "50000.00",
        taxableAmount: "45000.00",
        taxCollected: "3825.00",
        taxPaid: "1200.00",
        taxOwed: "2625.00",
        breakdown: [
          { taxType: "VAT", taxableAmount: "25000.00", taxAmount: "2000.00" },
          { taxType: "Sales Tax", taxableAmount: "20000.00", taxAmount: "1825.00" }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate tax report" });
    }
  });

  // Enhanced Invoice Management for AR
  app.get("/api/invoices", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const { status, customerId, overdue, limit = 50 } = req.query;
      res.json([
        {
          id: "inv-1",
          invoiceNumber: "INV-2024-001",
          customerId: "cust-1",
          customerName: "Acme Corp",
          invoiceDate: "2024-01-15",
          dueDate: "2024-02-14", 
          totalAmount: "1500.00",
          paidAmount: "1000.00",
          outstandingAmount: "500.00",
          status: "partial",
          paymentTerms: 30,
          daysPastDue: 5
        }
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.status(201).json({ id: "inv-new", ...req.body });
    } catch (error) {
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.get("/api/aging-report", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const { asOfDate } = req.query;
      res.json({
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
        totalOutstanding: "125000.00",
        aging: [
          { range: "Current", amount: "75000.00", count: 15 },
          { range: "1-30 days", amount: "30000.00", count: 8 },
          { range: "31-60 days", amount: "15000.00", count: 4 },
          { range: "61-90 days", amount: "3000.00", count: 2 },
          { range: "90+ days", amount: "2000.00", count: 1 }
        ],
        customers: [
          {
            customerId: "cust-1",
            customerName: "Acme Corp",
            current: "25000.00",
            days30: "5000.00", 
            days60: "0.00",
            days90: "0.00",
            over90: "0.00",
            total: "30000.00"
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate aging report" });
    }
  });

  // Enhanced Bill Management for AP  
  app.get("/api/bills", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const { status, vendorId, overdue } = req.query;
      res.json([
        {
          id: "bill-1",
          billNumber: "BILL-2024-001",
          vendorId: "vendor-1",
          vendorName: "Office Supplies Co",
          billDate: "2024-01-20",
          dueDate: "2024-02-19",
          totalAmount: "850.00",
          paidAmount: "0.00",
          outstandingAmount: "850.00",
          status: "pending",
          paymentTerms: 30,
          daysPastDue: 0
        }
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.status(201).json({ id: "bill-new", ...req.body });
    } catch (error) {
      res.status(500).json({ error: "Failed to create bill" });
    }
  });

  // Recurring Journal Entries
  app.get("/api/recurring-journal-entries", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      res.json([
        {
          id: "recurring-1",
          templateName: "Monthly Rent",
          description: "Office rent payment",
          frequency: "monthly",
          nextRunDate: "2024-02-01",
          totalDebit: "2500.00",
          totalCredit: "2500.00",
          isActive: true
        }
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recurring entries" });
    }
  });

  app.post("/api/recurring-journal-entries", authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.status(201).json({ id: "recurring-new", ...req.body });
    } catch (error) {
      res.status(500).json({ error: "Failed to create recurring entry" });
    }
  });

  // Manual Journal Entry with Enhanced Features
  app.post("/api/journal-entries/manual", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { transactionDate, reference, description, lines } = req.body;
      
      // Validate debits = credits
      const totalDebits = lines?.reduce((sum: number, line: any) => sum + parseFloat(line.debitAmount || 0), 0) || 0;
      const totalCredits = lines?.reduce((sum: number, line: any) => sum + parseFloat(line.creditAmount || 0), 0) || 0;
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return res.status(400).json({ error: "Debits must equal credits" });
      }
      
      res.status(201).json({
        id: "je-manual-new",
        journalNumber: "JE-2024-001", 
        status: "posted",
        totalDebit: totalDebits.toFixed(2),
        totalCredit: totalCredits.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create manual journal entry" });
    }
  });

  // Vendor Management Routes
  /**
   * @swagger
   * /api/vendors:
   *   get:
   *     tags: [Vendors]
   *     summary: Get all vendors
   *     responses:
   *       200:
   *         description: List of vendors
   */
  app.get("/api/vendors", authenticateToken, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  /**
   * @swagger
   * /api/vendors/{id}:
   *   get:
   *     tags: [Vendors]
   *     summary: Get vendor by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Vendor details
   */
  app.get("/api/vendors/:id", authenticateToken, async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });

  /**
   * @swagger
   * /api/vendors:
   *   post:
   *     tags: [Vendors]
   *     summary: Create new vendor
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               contactPerson:
   *                 type: string
   *               address:
   *                 type: string
   *     responses:
   *       201:
   *         description: Vendor created successfully
   */
  app.post("/api/vendors", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const vendor = await storage.createVendor(req.body);
      res.status(201).json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  /**
   * @swagger
   * /api/vendors/{id}:
   *   put:
   *     tags: [Vendors]
   *     summary: Update vendor
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Vendor updated successfully
   */
  app.put("/api/vendors/:id", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  /**
   * @swagger
   * /api/purchase-orders:
   *   get:
   *     tags: [Vendors]
   *     summary: Get all purchase orders
   *     responses:
   *       200:
   *         description: List of purchase orders
   */
  app.get("/api/purchase-orders", authenticateToken, async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  /**
   * @swagger
   * /api/purchase-orders:
   *   post:
   *     tags: [Vendors]
   *     summary: Create new purchase order
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - vendorId
   *               - totalAmount
   *             properties:
   *               vendorId:
   *                 type: string
   *               totalAmount:
   *                 type: number
   *               orderDate:
   *                 type: string
   *               expectedDelivery:
   *                 type: string
   *     responses:
   *       201:
   *         description: Purchase order created successfully
   */
  app.post("/api/purchase-orders", authenticateToken, requireStaffOrAdmin, async (req, res) => {
    try {
      const order = await storage.createPurchaseOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  /**
   * @swagger
   * /api/vendor-analytics:
   *   get:
   *     tags: [Vendors]
   *     summary: Get vendor analytics
   *     responses:
   *       200:
   *         description: Vendor analytics data
   */
  app.get("/api/vendor-analytics", authenticateToken, async (req, res) => {
    try {
      const analytics = await storage.getVendorAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendor analytics" });
    }
  });

  /**
   * @swagger
   * /api/purchase-order-recommendations:
   *   get:
   *     tags: [Vendors]
   *     summary: Get AI-powered purchase order recommendations
   *     responses:
   *       200:
   *         description: Purchase order recommendations
   */
  app.get("/api/purchase-order-recommendations", authenticateToken, async (req, res) => {
    try {
      // Mock AI recommendations for now
      res.json({
        recommendations: [
          {
            vendorId: "vendor-1",
            vendorName: "Tech Solutions Inc",
            suggestedProducts: ["Product A", "Product B"],
            estimatedCost: 2500,
            priority: "high",
            reason: "Low stock levels detected"
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}