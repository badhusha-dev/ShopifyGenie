import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCustomerSchema, insertOrderSchema, insertSubscriptionSchema } from "@shared/schema";
import { shopify, saveShopSession, getShopSession } from "./shopify";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get("/api/stats", async (req, res) => {
    try {
      const shopDomain = req.query.shop as string;
      const stats = await storage.getStats(shopDomain);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Enhanced analytics endpoints
  app.get("/api/analytics/sales-trends", async (req, res) => {
    try {
      const trends = await storage.getSalesTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales trends" });
    }
  });

  app.get("/api/analytics/top-products", async (req, res) => {
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
  app.get("/api/products", async (req, res) => {
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

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
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
  app.get("/api/customers", async (req, res) => {
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

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
