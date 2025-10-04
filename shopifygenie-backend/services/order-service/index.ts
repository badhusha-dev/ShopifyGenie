// Order Service - order management, payments, shipping
// Port: 5004

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq, and, like, gte, lte, desc, asc, or } from 'drizzle-orm';
import { 
  Order, 
  OrderItem,
  ApiResponse,
  PaginatedResponse,
  schemas,
  utils,
  kafkaService,
  OrderCreatedEvent,
  PaymentProcessedEvent
} from '../../shared';
import { db, testConnection, closeConnection } from './drizzle/db';
import { 
  orders, 
  orderItems, 
  orderStatusHistory, 
  payments, 
  shipping,
  createOrderSchema,
  updateOrderSchema,
  createOrderItemSchema,
  updateOrderStatusSchema,
  createPaymentSchema,
  createShippingSchema
} from './drizzle/schema';

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 5004;

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

// Initialize sample orders
async function initializeSampleOrders() {
  try {
    // Check if orders already exist
    const existingOrders = await db.select().from(orders).limit(1);
    if (existingOrders.length > 0) return;

    const sampleOrders = [
      {
        id: utils.ID.generateId(),
        orderNumber: 'ORD-001',
        customerId: 'customer-001',
        status: 'delivered' as const,
        totalAmount: 299.99,
        currency: 'USD',
        shippingAddress: JSON.stringify({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }),
        billingAddress: JSON.stringify({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }),
        paymentMethod: 'credit_card',
        paymentStatus: 'paid' as const,
        shippingMethod: 'standard',
        trackingNumber: 'TRK123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        orderNumber: 'ORD-002',
        customerId: 'customer-002',
        status: 'processing' as const,
        totalAmount: 149.99,
        currency: 'USD',
        shippingAddress: JSON.stringify({
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }),
        billingAddress: JSON.stringify({
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }),
        paymentMethod: 'paypal',
        paymentStatus: 'paid' as const,
        shippingMethod: 'express',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Insert sample orders
    await db.insert(orders).values(sampleOrders);

    // Initialize sample order items
    const sampleOrderItems = [
      {
        id: utils.ID.generateId(),
        orderId: sampleOrders[0].id,
        productId: 'product-001',
        productName: 'Wireless Headphones',
        productSku: 'WH-001',
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99,
        createdAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        orderId: sampleOrders[0].id,
        productId: 'product-002',
        productName: 'Phone Case',
        productSku: 'PC-001',
        quantity: 2,
        unitPrice: 50.00,
        totalPrice: 100.00,
        createdAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        orderId: sampleOrders[1].id,
        productId: 'product-003',
        productName: 'Smart Watch',
        productSku: 'SW-001',
        quantity: 1,
        unitPrice: 149.99,
        totalPrice: 149.99,
        createdAt: new Date(),
      }
    ];

    await db.insert(orderItems).values(sampleOrderItems);

    utils.Logger.info('Sample orders initialized');
  } catch (error) {
    utils.Logger.error('Failed to initialize sample orders', error);
  }
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json(utils.HTTP.createSuccessResponse({ 
    service: 'Order Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  }));
});

// Get all orders with pagination and filtering
app.get('/orders', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;

    let query = db.select().from(orders);

    // Apply filters
    if (status) {
      query = query.where(eq(orders.status, status as any));
    }

    if (customerId) {
      query = query.where(eq(orders.customerId, customerId));
    }

    // Get total count
    const totalResult = await query;
    const total = totalResult.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const ordersData = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.createdAt));

    const response: PaginatedResponse<Order> = {
      data: ordersData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(utils.HTTP.createSuccessResponse(response));
  } catch (error) {
    utils.Logger.error('Get orders error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get orders', 500));
  }
});

// Get order by ID
app.get('/orders/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const orderData = await db.select().from(orders).where(eq(orders.id, id));
    
    if (orderData.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Order not found', 404));
    }

    // Get order items
    const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    
    // Get order status history
    const statusHistory = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, id));
    
    // Get payments
    const paymentsData = await db.select().from(payments).where(eq(payments.orderId, id));
    
    // Get shipping info
    const shippingData = await db.select().from(shipping).where(eq(shipping.orderId, id));

    const order = {
      ...orderData[0],
      items: orderItemsData,
      statusHistory,
      payments: paymentsData,
      shipping: shippingData[0] || null
    };

    res.json(utils.HTTP.createSuccessResponse(order));
  } catch (error) {
    utils.Logger.error('Get order error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get order', 500));
  }
});

// Create new order
app.post('/orders', authenticateToken, async (req: Request, res: Response) => {
  try {
    const orderData = createOrderSchema.parse(req.body);

    const newOrder = {
      id: utils.ID.generateId(),
      orderNumber: `ORD-${Date.now()}`,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(orders).values(newOrder);

    // Create initial status history entry
    await db.insert(orderStatusHistory).values({
      id: utils.ID.generateId(),
      orderId: newOrder.id,
      status: newOrder.status,
      notes: 'Order created',
      updatedBy: req.user?.userId || 'system',
      createdAt: new Date(),
    });

    // Publish OrderCreated event to Kafka
    try {
      const orderCreatedEvent: OrderCreatedEvent = {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerId: newOrder.customerId,
        items: orderData.items || [], // Assuming items are included in orderData
        totalAmount: newOrder.totalAmount,
        currency: newOrder.currency
      };

      await kafkaService.publishOrderCreated(orderCreatedEvent);
      utils.Logger.info(`OrderCreated event published for order: ${newOrder.id}`);
    } catch (kafkaError) {
      utils.Logger.error('Failed to publish OrderCreated event', kafkaError);
      // Don't fail the order creation if event publishing fails
    }

    utils.Logger.info(`Order created: ${newOrder.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newOrder, 'Order created successfully'));
  } catch (error) {
    utils.Logger.error('Create order error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create order', 500));
  }
});

// Update order
app.put('/orders/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateOrderSchema.parse(req.body);

    // Check if order exists
    const existingOrders = await db.select().from(orders).where(eq(orders.id, id));
    if (existingOrders.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Order not found', 404));
    }

    await db.update(orders)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(orders.id, id));

    utils.Logger.info(`Order updated: ${id}`);
    res.json(utils.HTTP.createSuccessResponse(null, 'Order updated successfully'));
  } catch (error) {
    utils.Logger.error('Update order error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to update order', 500));
  }
});

// Update order status
app.patch('/orders/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const statusData = updateOrderStatusSchema.parse(req.body);

    // Check if order exists
    const existingOrders = await db.select().from(orders).where(eq(orders.id, id));
    if (existingOrders.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Order not found', 404));
    }

    // Update order status
    await db.update(orders)
      .set({ status: statusData.status, updatedAt: new Date() })
      .where(eq(orders.id, id));

    // Add status history entry
    await db.insert(orderStatusHistory).values({
      id: utils.ID.generateId(),
      orderId: id,
      status: statusData.status,
      notes: statusData.notes || `Status changed to ${statusData.status}`,
      updatedBy: req.user?.userId || 'system',
      createdAt: new Date(),
    });

    utils.Logger.info(`Order status updated: ${id} to ${statusData.status}`);
    res.json(utils.HTTP.createSuccessResponse(null, 'Order status updated successfully'));
  } catch (error) {
    utils.Logger.error('Update order status error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to update order status', 500));
  }
});

// Add order item
app.post('/orders/:id/items', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemData = createOrderItemSchema.parse(req.body);

    // Check if order exists
    const existingOrders = await db.select().from(orders).where(eq(orders.id, id));
    if (existingOrders.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Order not found', 404));
    }

    const newItem = {
      id: utils.ID.generateId(),
      orderId: id,
      ...itemData,
      createdAt: new Date(),
    };

    await db.insert(orderItems).values(newItem);

    utils.Logger.info(`Order item added: ${newItem.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newItem, 'Order item added successfully'));
  } catch (error) {
    utils.Logger.error('Add order item error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to add order item', 500));
  }
});

// Get order items
app.get('/orders/:id/items', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const items = await db.select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id))
      .orderBy(asc(orderItems.createdAt));

    res.json(utils.HTTP.createSuccessResponse(items));
  } catch (error) {
    utils.Logger.error('Get order items error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get order items', 500));
  }
});

// Get order status history
app.get('/orders/:id/status-history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const statusHistory = await db.select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, id))
      .orderBy(desc(orderStatusHistory.createdAt));

    res.json(utils.HTTP.createSuccessResponse(statusHistory));
  } catch (error) {
    utils.Logger.error('Get order status history error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get order status history', 500));
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
    await initializeSampleOrders();
    
    app.listen(PORT, () => {
      utils.Logger.info(`Order Service running on port ${PORT}`);
      utils.Logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    utils.Logger.error('Failed to start Order Service', error);
    process.exit(1);
  }
}

startServer();

export default app;