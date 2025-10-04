// Product Service - inventory, product catalog, stock adjustments
// Port: 5002

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq, and, like, gte, lte, desc } from 'drizzle-orm';
import { config } from 'dotenv';
import { 
  Product, 
  ApiResponse,
  PaginatedResponse,
  schemas,
  utils,
  kafkaService,
  EventMessage,
  OrderCreatedEvent,
  StockAdjustedEvent
} from '../../shared';
import { db, testConnection, closeConnection } from './drizzle/db';
import { 
  products, 
  stockAdjustments, 
  inventoryAlerts, 
  vendors,
  createProductSchema, 
  updateProductSchema,
  stockAdjustmentSchema 
} from './drizzle/schema';

// Load environment variables
config();

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 5002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Kafka Event Handlers
async function handleOrderCreatedEvent(event: EventMessage): Promise<void> {
  try {
    const orderData = event.data as OrderCreatedEvent;
    utils.Logger.info(`Processing OrderCreated event for order: ${orderData.orderId}`);

    // Adjust inventory for each item in the order
    for (const item of orderData.items) {
      // Find the product inventory record
      const inventoryRecords = await db.select()
        .from(stockAdjustments)
        .where(eq(stockAdjustments.productId, item.productId));

      if (inventoryRecords.length > 0) {
        const currentRecord = inventoryRecords[0];
        const newQuantity = currentRecord.quantityOnHand - item.quantity;

        // Update inventory
        await db.update(stockAdjustments)
          .set({ 
            quantityOnHand: newQuantity,
            updatedAt: new Date()
          })
          .where(eq(stockAdjustments.productId, item.productId));

        // Publish StockAdjusted event
        const stockAdjustedEvent: StockAdjustedEvent = {
          productId: item.productId,
          quantityAdjusted: -item.quantity,
          newQuantity: newQuantity,
          reason: `Order ${orderData.orderNumber} - Inventory reserved`,
          orderId: orderData.orderId
        };

        await kafkaService.publishStockAdjusted(stockAdjustedEvent);
        utils.Logger.info(`Stock adjusted for product ${item.productId}: -${item.quantity} (new quantity: ${newQuantity})`);

        // Check for low stock alerts
        if (newQuantity <= currentRecord.reorderPoint) {
          await db.insert(inventoryAlerts).values({
            id: utils.ID.generateId(),
            productId: item.productId,
            alertType: 'low_stock',
            message: `Low stock alert: Product ${item.productId} has ${newQuantity} units remaining (reorder point: ${currentRecord.reorderPoint})`,
            severity: 'warning',
            isResolved: false,
            createdAt: new Date(),
          });

          utils.Logger.warn(`Low stock alert created for product: ${item.productId}`);
        }
      } else {
        utils.Logger.warn(`No inventory record found for product: ${item.productId}`);
      }
    }

    utils.Logger.info(`OrderCreated event processed successfully for order: ${orderData.orderId}`);
  } catch (error) {
    utils.Logger.error('Error processing OrderCreated event', error);
    throw error; // Re-throw to trigger retry mechanism
  }
}

// Initialize Kafka event subscriptions
async function initializeKafkaSubscriptions(): Promise<void> {
  try {
    // Subscribe to order events
    await kafkaService.subscribeToTopic(
      'order-events',
      'product-service-group',
      async (event: EventMessage) => {
        if (event.eventType === 'OrderCreated') {
          await handleOrderCreatedEvent(event);
        }
      }
    );

    utils.Logger.info('Kafka event subscriptions initialized');
  } catch (error) {
    utils.Logger.error('Failed to initialize Kafka subscriptions', error);
    throw error;
  }
}

// Authentication middleware
async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(utils.HTTP.createErrorResponse('Access token required', 401));
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    const decoded = utils.JWT.verifyToken(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json(utils.HTTP.createErrorResponse('Invalid token', 401));
  }
}

// Initialize sample products
async function initializeSampleProducts() {
  try {
    // Check if products already exist
    const existingProducts = await db.select().from(products).limit(1);
    if (existingProducts.length > 0) return;

    const sampleProducts = [
      {
        id: utils.ID.generateId(),
        name: 'Wireless Bluetooth Headphones',
        shopifyId: 'shopify_001',
        sku: 'WBH-001',
        stock: 150,
        price: '99.99',
        category: 'Electronics',
        imageUrl: 'https://example.com/headphones.jpg',
        description: 'High-quality wireless headphones with noise cancellation',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Smart Fitness Watch',
        shopifyId: 'shopify_002',
        sku: 'SFW-002',
        stock: 75,
        price: '199.99',
        category: 'Electronics',
        imageUrl: 'https://example.com/watch.jpg',
        description: 'Advanced fitness tracking smartwatch with heart rate monitor',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Organic Cotton T-Shirt',
        shopifyId: 'shopify_003',
        sku: 'OCT-003',
        stock: 5, // Low stock for testing alerts
        price: '29.99',
        category: 'Clothing',
        imageUrl: 'https://example.com/tshirt.jpg',
        description: 'Comfortable organic cotton t-shirt in various sizes',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Premium Coffee Beans',
        shopifyId: 'shopify_004',
        sku: 'PCB-004',
        stock: 200,
        price: '24.99',
        category: 'Food & Beverage',
        imageUrl: 'https://example.com/coffee.jpg',
        description: 'Single-origin premium coffee beans, medium roast',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Yoga Mat Pro',
        shopifyId: 'shopify_005',
        sku: 'YMP-005',
        stock: 0, // Out of stock for testing alerts
        price: '49.99',
        category: 'Sports & Fitness',
        imageUrl: 'https://example.com/yogamat.jpg',
        description: 'Professional-grade yoga mat with superior grip',
        isActive: true,
      },
    ];

    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }

    // Initialize sample vendors
    const sampleVendors = [
      {
        id: utils.ID.generateId(),
        name: 'TechSupply Co.',
        email: 'orders@techsupply.com',
        phone: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA',
        contactPerson: 'John Smith',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Fashion Forward',
        email: 'orders@fashionforward.com',
        phone: '+1-555-0456',
        address: '456 Fashion Ave, New York, NY',
        contactPerson: 'Sarah Johnson',
        isActive: true,
      },
    ];

    for (const vendor of sampleVendors) {
      await db.insert(vendors).values(vendor);
    }

    utils.Logger.info('Sample products and vendors initialized');
  } catch (error) {
    utils.Logger.error('Failed to initialize sample products', error);
  }
}

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'product-service',
    timestamp: utils.Date.now().toISOString(),
  });
});

// Get all products with pagination and filtering
app.get('/products', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const lowStock = req.query.lowStock === 'true';

    let query = db.select().from(products).where(eq(products.isActive, true));

    // Apply filters
    const conditions = [eq(products.isActive, true)];
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(products.category, category));
    }
    if (lowStock) {
      conditions.push(lte(products.stock, 10));
    }

    query = query.where(and(...conditions));

    // Get total count
    const allProducts = await query;
    const total = allProducts.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedProducts = await query.limit(limit).offset(offset);

    const response: PaginatedResponse<Product> = {
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error) {
    utils.Logger.error('Get products error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get products', 500));
  }
});

// Get product by ID
app.get('/products/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productResults = await db.select().from(products).where(eq(products.id, id));
    const product = productResults[0];

    if (!product || !product.isActive) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Product not found', 404));
    }

    res.json(utils.HTTP.createSuccessResponse(product));
  } catch (error) {
    utils.Logger.error('Get product error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get product', 500));
  }
});

// Create new product
app.post('/products', authenticateToken, async (req: Request, res: Response) => {
  try {
    const productData = createProductSchema.parse(req.body);

    const newProduct = {
      id: utils.ID.generateId(),
      ...productData,
      isActive: true,
    };

    await db.insert(products).values(newProduct);

    utils.Logger.info(`New product created: ${newProduct.name}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newProduct, 'Product created successfully'));
  } catch (error) {
    utils.Logger.error('Create product error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create product', 500));
  }
});

// Update product
app.put('/products/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateProductSchema.parse(req.body);

    // Check if product exists
    const existingProducts = await db.select().from(products).where(eq(products.id, id));
    if (existingProducts.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Product not found', 404));
    }

    await db.update(products)
      .set(updateData)
      .where(eq(products.id, id));

    const productResults = await db.select().from(products).where(eq(products.id, id));
    const product = productResults[0];

    utils.Logger.info(`Product updated: ${product.name}`);
    res.json(utils.HTTP.createSuccessResponse(product, 'Product updated successfully'));
  } catch (error) {
    utils.Logger.error('Update product error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to update product', 500));
  }
});

// Delete product (soft delete)
app.delete('/products/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProducts = await db.select().from(products).where(eq(products.id, id));
    if (existingProducts.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Product not found', 404));
    }

    // Soft delete by setting isActive to false
    await db.update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));

    utils.Logger.info(`Product deleted: ${id}`);
    res.json(utils.HTTP.createSuccessResponse(null, 'Product deleted successfully'));
  } catch (error) {
    utils.Logger.error('Delete product error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to delete product', 500));
  }
});

// Stock adjustment
app.post('/products/:id/adjust-stock', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adjustmentData = schemas.stockAdjustment.parse(req.body);

    // Check if product exists
    const existingProducts = await db.select().from(products).where(eq(products.id, id));
    if (existingProducts.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Product not found', 404));
    }

    const product = existingProducts[0];

    // Calculate new stock
    const currentStock = product.stock;
    const adjustmentAmount = adjustmentData.type === 'increase' 
      ? adjustmentData.quantity 
      : -adjustmentData.quantity;
    const newStock = Math.max(0, currentStock + adjustmentAmount);

    // Update product stock
    await db.update(products)
      .set({ 
        stock: newStock,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    // Record stock adjustment
    await db.insert(stockAdjustments).values({
      id: utils.ID.generateId(),
      productId: id,
      quantity: adjustmentData.quantity,
      reason: adjustmentData.reason,
      type: adjustmentData.type,
      createdAt: new Date(),
      createdBy: req.user?.userId || 'system'
    });

    // Check for low stock alerts
    if (newStock <= 10) {
      const severity = newStock === 0 ? 'critical' : newStock <= 5 ? 'high' : 'medium';
      
      await db.insert(inventoryAlerts).values({
        id: utils.ID.generateId(),
        productId: id,
        productName: product.name,
        currentStock: newStock,
        threshold: 10,
        severity,
        resolved: false,
        createdAt: new Date()
      });
    }

    utils.Logger.info(`Stock adjusted for product ${product.name}: ${adjustmentAmount}`);
    res.json(utils.HTTP.createSuccessResponse({ 
      productId: id,
      newStock,
      adjustment: adjustmentAmount 
    }, 'Stock adjusted successfully'));
  } catch (error) {
    utils.Logger.error('Stock adjustment error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to adjust stock', 500));
  }
});

// Get stock adjustments for a product
app.get('/products/:id/stock-adjustments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const adjustments = await db.select()
      .from(stockAdjustments)
      .where(eq(stockAdjustments.productId, id))
      .orderBy(stockAdjustments.createdAt);

    res.json(utils.HTTP.createSuccessResponse(adjustments));
  } catch (error) {
    utils.Logger.error('Get stock adjustments error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get stock adjustments', 500));
  }
});

// Get inventory alerts
app.get('/inventory/alerts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const resolved = req.query.resolved === 'true';
    
    let query = db.select().from(inventoryAlerts);
    if (resolved !== undefined) {
      query = query.where(eq(inventoryAlerts.resolved, resolved));
    }

    const alerts = await query.orderBy(inventoryAlerts.createdAt);

    res.json(utils.HTTP.createSuccessResponse(alerts));
  } catch (error) {
    utils.Logger.error('Get inventory alerts error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get inventory alerts', 500));
  }
});

// Resolve inventory alert
app.patch('/inventory/alerts/:id/resolve', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.update(inventoryAlerts)
      .set({ resolved: true })
      .where(eq(inventoryAlerts.id, id));

    utils.Logger.info(`Inventory alert resolved: ${id}`);
    res.json(utils.HTTP.createSuccessResponse(null, 'Alert resolved successfully'));
  } catch (error) {
    utils.Logger.error('Resolve alert error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to resolve alert', 500));
  }
});

// Get low stock products
app.get('/inventory/low-stock', authenticateToken, async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;

    const products = await db.select()
      .from(products)
      .where(lte(products.stock, threshold));

    res.json(utils.HTTP.createSuccessResponse(products));
  } catch (error) {
    utils.Logger.error('Get low stock products error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get low stock products', 500));
  }
});

// Get product categories
app.get('/products/categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    const products = await db.select({ category: products.category }).from(products);
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    res.json(utils.HTTP.createSuccessResponse(categories));
  } catch (error) {
    utils.Logger.error('Get categories error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get categories', 500));
  }
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  utils.Logger.error('Unhandled error', error);
  res.status(500).json(utils.HTTP.createErrorResponse('Internal server error', 500));
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json(utils.HTTP.createErrorResponse('Endpoint not found', 404));
});

// Start server
async function startServer() {
  try {
    // Test PostgreSQL connection
    await testConnection();
    utils.Logger.info('PostgreSQL connection established');

    // Initialize sample data
    await initializeSampleProducts();
    
    // Initialize Kafka event subscriptions
    await initializeKafkaSubscriptions();
    
    app.listen(PORT, () => {
      utils.Logger.info(`Product Service running on port ${PORT}`);
      utils.Logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    utils.Logger.error('Failed to start Product Service', error);
    process.exit(1);
  }
}

startServer();

export default app;
