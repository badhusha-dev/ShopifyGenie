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

  const httpServer = createServer(app);
  return httpServer;
}
