// Customer Service - customer profiles, loyalty, segmentation
// Port: 5003

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq, and, like, gte, lte, desc, asc, or } from 'drizzle-orm';
import { 
  Customer, 
  LoyaltyTransaction,
  ApiResponse,
  PaginatedResponse,
  schemas,
  utils 
} from '../../shared';
import { db, testConnection, closeConnection } from './drizzle/db';
import { 
  customers, 
  loyaltyPoints, 
  loyaltyTransactions, 
  customerPreferences, 
  customerSegments,
  customerSegmentAssignments,
  createCustomerSchema,
  updateCustomerSchema,
  loyaltyTransactionSchema,
  createCustomerPreferenceSchema,
  createCustomerSegmentSchema
} from './drizzle/schema';

const app = express();
const PORT = process.env.CUSTOMER_SERVICE_PORT || 5003;

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

// Initialize sample customers
async function initializeSampleCustomers() {
  try {
    // Check if customers already exist
    const existingCustomers = await db.select().from(customers).limit(1);
    if (existingCustomers.length > 0) return;

    const sampleCustomers = [
      {
        id: utils.ID.generateId(),
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0124',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        phone: '+1-555-0125',
        address: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Insert sample customers
    await db.insert(customers).values(sampleCustomers);

    // Initialize loyalty points for each customer
    const loyaltyPointsData = sampleCustomers.map(customer => ({
      id: utils.ID.generateId(),
      customerId: customer.id,
      points: Math.floor(Math.random() * 2000) + 100, // Random points between 100-2100
      tier: 'bronze' as const,
      totalEarned: Math.floor(Math.random() * 3000) + 500,
      totalRedeemed: Math.floor(Math.random() * 1000),
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(loyaltyPoints).values(loyaltyPointsData);

    utils.Logger.info('Sample customers initialized');
  } catch (error) {
    utils.Logger.error('Failed to initialize sample customers', error);
  }
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json(utils.HTTP.createSuccessResponse({ 
    service: 'Customer Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  }));
});

// Get all customers with pagination and filtering
app.get('/customers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;

    let query = db.select().from(customers);

    // Apply filters
    if (search) {
      query = query.where(
        or(
          like(customers.name, `%${search}%`),
          like(customers.email, `%${search}%`)
        )
      );
    }

    if (isActive !== undefined) {
      query = query.where(eq(customers.isActive, isActive === 'true'));
    }

    // Get total count
    const totalResult = await query;
    const total = totalResult.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const customersData = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(customers.createdAt));

    const response: PaginatedResponse<Customer> = {
      data: customersData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(utils.HTTP.createSuccessResponse(response));
  } catch (error) {
    utils.Logger.error('Get customers error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get customers', 500));
  }
});

// Get customer by ID
app.get('/customers/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customerData = await db.select().from(customers).where(eq(customers.id, id));
    
    if (customerData.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Customer not found', 404));
    }

    // Get loyalty points
    const loyaltyData = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.customerId, id));
    
    const customer = {
      ...customerData[0],
      loyaltyPoints: loyaltyData[0] || null
    };

    res.json(utils.HTTP.createSuccessResponse(customer));
  } catch (error) {
    utils.Logger.error('Get customer error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get customer', 500));
  }
});

// Create new customer
app.post('/customers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const customerData = createCustomerSchema.parse(req.body);

    // Check if email already exists
    const existingCustomer = await db.select().from(customers).where(eq(customers.email, customerData.email));
    if (existingCustomer.length > 0) {
      return res.status(400).json(utils.HTTP.createErrorResponse('Customer with this email already exists', 400));
    }

    const newCustomer = {
      id: utils.ID.generateId(),
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(customers).values(newCustomer);

    // Initialize loyalty points
    await db.insert(loyaltyPoints).values({
      id: utils.ID.generateId(),
      customerId: newCustomer.id,
      points: 0,
      tier: 'bronze',
      totalEarned: 0,
      totalRedeemed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    utils.Logger.info(`Customer created: ${newCustomer.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newCustomer, 'Customer created successfully'));
  } catch (error) {
    utils.Logger.error('Create customer error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create customer', 500));
  }
});

// Update customer
app.put('/customers/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateCustomerSchema.parse(req.body);

    // Check if customer exists
    const existingCustomers = await db.select().from(customers).where(eq(customers.id, id));
    if (existingCustomers.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Customer not found', 404));
    }

    await db.update(customers)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(customers.id, id));

    utils.Logger.info(`Customer updated: ${id}`);
    res.json(utils.HTTP.createSuccessResponse(null, 'Customer updated successfully'));
  } catch (error) {
    utils.Logger.error('Update customer error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to update customer', 500));
  }
});

// Delete customer (soft delete)
app.delete('/customers/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const existingCustomers = await db.select().from(customers).where(eq(customers.id, id));
    if (existingCustomers.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Customer not found', 404));
    }

    // Soft delete by setting isActive to false
    await db.update(customers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(customers.id, id));

    utils.Logger.info(`Customer deleted: ${id}`);
    res.json(utils.HTTP.createSuccessResponse(null, 'Customer deleted successfully'));
  } catch (error) {
    utils.Logger.error('Delete customer error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to delete customer', 500));
  }
});

// Get customer loyalty points
app.get('/customers/:id/loyalty', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const loyaltyData = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.customerId, id));
    
    if (loyaltyData.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Loyalty data not found', 404));
    }

    res.json(utils.HTTP.createSuccessResponse(loyaltyData[0]));
  } catch (error) {
    utils.Logger.error('Get loyalty points error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get loyalty points', 500));
  }
});

// Add loyalty points transaction
app.post('/customers/:id/loyalty/transactions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transactionData = loyaltyTransactionSchema.parse(req.body);

    // Check if customer exists
    const existingCustomers = await db.select().from(customers).where(eq(customers.id, id));
    if (existingCustomers.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Customer not found', 404));
    }

    // Create transaction
    const transaction = {
      id: utils.ID.generateId(),
      customerId: id,
      ...transactionData,
      createdAt: new Date(),
    };

    await db.insert(loyaltyTransactions).values(transaction);

    // Update loyalty points
    const currentLoyalty = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.customerId, id));
    if (currentLoyalty.length > 0) {
      const currentPoints = currentLoyalty[0].points;
      const newPoints = transactionData.type === 'earn' 
        ? currentPoints + transactionData.points 
        : Math.max(0, currentPoints - transactionData.points);

      await db.update(loyaltyPoints)
        .set({ 
          points: newPoints,
          totalEarned: transactionData.type === 'earn' 
            ? currentLoyalty[0].totalEarned + transactionData.points 
            : currentLoyalty[0].totalEarned,
          totalRedeemed: transactionData.type === 'redeem' 
            ? currentLoyalty[0].totalRedeemed + transactionData.points 
            : currentLoyalty[0].totalRedeemed,
          lastActivity: new Date(),
          updatedAt: new Date()
        })
        .where(eq(loyaltyPoints.customerId, id));
    }

    utils.Logger.info(`Loyalty transaction created: ${transaction.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(transaction, 'Loyalty transaction created successfully'));
  } catch (error) {
    utils.Logger.error('Create loyalty transaction error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create loyalty transaction', 500));
  }
});

// Get customer loyalty transactions
app.get('/customers/:id/loyalty/transactions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const transactions = await db.select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.customerId, id))
      .orderBy(desc(loyaltyTransactions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    res.json(utils.HTTP.createSuccessResponse(transactions));
  } catch (error) {
    utils.Logger.error('Get loyalty transactions error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get loyalty transactions', 500));
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
    await initializeSampleCustomers();
    
    app.listen(PORT, () => {
      utils.Logger.info(`Customer Service running on port ${PORT}`);
      utils.Logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    utils.Logger.error('Failed to start Customer Service', error);
    process.exit(1);
  }
}

startServer();

export default app;