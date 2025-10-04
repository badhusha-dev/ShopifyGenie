// Accounting Service - financial management, journal entries, invoices
// Port: 5005

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq, and, like, gte, lte, desc, asc, or } from 'drizzle-orm';
import { 
  ApiResponse,
  PaginatedResponse,
  schemas,
  utils 
} from '../../shared';
import { db, testConnection, closeConnection } from './drizzle/db';
import { 
  chartOfAccounts, 
  journalEntries, 
  journalEntryLines, 
  invoices, 
  invoiceItems, 
  payments,
  createChartOfAccountsSchema,
  updateChartOfAccountsSchema,
  createJournalEntrySchema,
  createJournalEntryLineSchema,
  createInvoiceSchema,
  createInvoiceItemSchema,
  createPaymentSchema,
  updateInvoiceStatusSchema,
  updatePaymentStatusSchema
} from './drizzle/schema';

const app = express();
const PORT = process.env.ACCOUNTING_SERVICE_PORT || 5005;

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

// Initialize sample chart of accounts
async function initializeSampleChartOfAccounts() {
  try {
    // Check if chart of accounts already exist
    const existingAccounts = await db.select().from(chartOfAccounts).limit(1);
    if (existingAccounts.length > 0) return;

    const sampleAccounts = [
      // Assets
      {
        id: utils.ID.generateId(),
        code: '1000',
        name: 'Cash and Cash Equivalents',
        type: 'asset' as const,
        parentId: null,
        isActive: true,
        description: 'Cash and bank accounts',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        code: '1100',
        name: 'Accounts Receivable',
        type: 'asset' as const,
        parentId: null,
        isActive: true,
        description: 'Amounts owed by customers',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        code: '1200',
        name: 'Inventory',
        type: 'asset' as const,
        parentId: null,
        isActive: true,
        description: 'Product inventory',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Liabilities
      {
        id: utils.ID.generateId(),
        code: '2000',
        name: 'Accounts Payable',
        type: 'liability' as const,
        parentId: null,
        isActive: true,
        description: 'Amounts owed to suppliers',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Revenue
      {
        id: utils.ID.generateId(),
        code: '4000',
        name: 'Sales Revenue',
        type: 'revenue' as const,
        parentId: null,
        isActive: true,
        description: 'Revenue from product sales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Expenses
      {
        id: utils.ID.generateId(),
        code: '5000',
        name: 'Cost of Goods Sold',
        type: 'expense' as const,
        parentId: null,
        isActive: true,
        description: 'Direct costs of products sold',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: utils.ID.generateId(),
        code: '6000',
        name: 'Operating Expenses',
        type: 'expense' as const,
        parentId: null,
        isActive: true,
        description: 'General operating expenses',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Insert sample chart of accounts
    await db.insert(chartOfAccounts).values(sampleAccounts);

    utils.Logger.info('Sample chart of accounts initialized');
  } catch (error) {
    utils.Logger.error('Failed to initialize sample chart of accounts', error);
  }
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json(utils.HTTP.createSuccessResponse({ 
    service: 'Accounting Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  }));
});

// Chart of Accounts endpoints
app.get('/chart-of-accounts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const accounts = await db.select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.isActive, true))
      .orderBy(asc(chartOfAccounts.code));

    res.json(utils.HTTP.createSuccessResponse(accounts));
  } catch (error) {
    utils.Logger.error('Get chart of accounts error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get chart of accounts', 500));
  }
});

app.post('/chart-of-accounts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const accountData = createChartOfAccountsSchema.parse(req.body);

    const newAccount = {
      id: utils.ID.generateId(),
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(chartOfAccounts).values(newAccount);

    utils.Logger.info(`Chart of account created: ${newAccount.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newAccount, 'Account created successfully'));
  } catch (error) {
    utils.Logger.error('Create chart of account error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create account', 500));
  }
});

// Journal Entries endpoints
app.get('/journal-entries', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    let query = db.select().from(journalEntries);

    if (status) {
      query = query.where(eq(journalEntries.status, status as any));
    }

    // Get total count
    const totalResult = await query;
    const total = totalResult.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const entries = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(journalEntries.createdAt));

    const response: PaginatedResponse<any> = {
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(utils.HTTP.createSuccessResponse(response));
  } catch (error) {
    utils.Logger.error('Get journal entries error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get journal entries', 500));
  }
});

app.get('/journal-entries/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entryData = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    
    if (entryData.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Journal entry not found', 404));
    }

    // Get journal entry lines
    const lines = await db.select()
      .from(journalEntryLines)
      .where(eq(journalEntryLines.journalEntryId, id));

    const entry = {
      ...entryData[0],
      lines
    };

    res.json(utils.HTTP.createSuccessResponse(entry));
  } catch (error) {
    utils.Logger.error('Get journal entry error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get journal entry', 500));
  }
});

app.post('/journal-entries', authenticateToken, async (req: Request, res: Response) => {
  try {
    const entryData = createJournalEntrySchema.parse(req.body);

    const newEntry = {
      id: utils.ID.generateId(),
      entryNumber: `JE-${Date.now()}`,
      ...entryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(journalEntries).values(newEntry);

    utils.Logger.info(`Journal entry created: ${newEntry.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newEntry, 'Journal entry created successfully'));
  } catch (error) {
    utils.Logger.error('Create journal entry error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create journal entry', 500));
  }
});

// Invoices endpoints
app.get('/invoices', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;

    let query = db.select().from(invoices);

    if (status) {
      query = query.where(eq(invoices.status, status as any));
    }

    if (customerId) {
      query = query.where(eq(invoices.customerId, customerId));
    }

    // Get total count
    const totalResult = await query;
    const total = totalResult.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const invoicesData = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(invoices.createdAt));

    const response: PaginatedResponse<any> = {
      data: invoicesData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(utils.HTTP.createSuccessResponse(response));
  } catch (error) {
    utils.Logger.error('Get invoices error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get invoices', 500));
  }
});

app.get('/invoices/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoiceData = await db.select().from(invoices).where(eq(invoices.id, id));
    
    if (invoiceData.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Invoice not found', 404));
    }

    // Get invoice items
    const items = await db.select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const invoice = {
      ...invoiceData[0],
      items
    };

    res.json(utils.HTTP.createSuccessResponse(invoice));
  } catch (error) {
    utils.Logger.error('Get invoice error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get invoice', 500));
  }
});

app.post('/invoices', authenticateToken, async (req: Request, res: Response) => {
  try {
    const invoiceData = createInvoiceSchema.parse(req.body);

    const newInvoice = {
      id: utils.ID.generateId(),
      invoiceNumber: `INV-${Date.now()}`,
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(invoices).values(newInvoice);

    utils.Logger.info(`Invoice created: ${newInvoice.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newInvoice, 'Invoice created successfully'));
  } catch (error) {
    utils.Logger.error('Create invoice error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create invoice', 500));
  }
});

// Payments endpoints
app.get('/payments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;

    let query = db.select().from(payments);

    if (status) {
      query = query.where(eq(payments.status, status as any));
    }

    if (customerId) {
      query = query.where(eq(payments.customerId, customerId));
    }

    // Get total count
    const totalResult = await query;
    const total = totalResult.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const paymentsData = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(payments.createdAt));

    const response: PaginatedResponse<any> = {
      data: paymentsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json(utils.HTTP.createSuccessResponse(response));
  } catch (error) {
    utils.Logger.error('Get payments error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get payments', 500));
  }
});

app.post('/payments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const paymentData = createPaymentSchema.parse(req.body);

    const newPayment = {
      id: utils.ID.generateId(),
      paymentNumber: `PAY-${Date.now()}`,
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(payments).values(newPayment);

    utils.Logger.info(`Payment created: ${newPayment.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newPayment, 'Payment created successfully'));
  } catch (error) {
    utils.Logger.error('Create payment error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create payment', 500));
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
    await initializeSampleChartOfAccounts();
    
    app.listen(PORT, () => {
      utils.Logger.info(`Accounting Service running on port ${PORT}`);
      utils.Logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    utils.Logger.error('Failed to start Accounting Service', error);
    process.exit(1);
  }
}

startServer();

export default app;