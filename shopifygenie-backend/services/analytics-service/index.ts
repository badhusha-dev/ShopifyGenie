// Analytics Service - analytics, AI, forecasting
// Port: 5006

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq, and, like, gte, lte, desc, asc, or, sql } from 'drizzle-orm';
import { 
  ApiResponse,
  PaginatedResponse,
  schemas,
  utils 
} from '../../shared';
import { db, testConnection, closeConnection } from './drizzle/db';
import { 
  analyticsEvents, 
  salesAnalytics, 
  productAnalytics, 
  customerAnalytics, 
  forecastingModels, 
  forecastingPredictions, 
  reports, 
  dashboardWidgets,
  createAnalyticsEventSchema,
  createSalesAnalyticsSchema,
  createProductAnalyticsSchema,
  createCustomerAnalyticsSchema,
  createForecastingModelSchema,
  createForecastingPredictionSchema,
  createReportSchema,
  createDashboardWidgetSchema,
  updateDashboardWidgetSchema
} from './drizzle/schema';

const app = express();
const PORT = process.env.ANALYTICS_SERVICE_PORT || 5006;

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

// Initialize sample analytics data
async function initializeSampleAnalytics() {
  try {
    // Check if analytics data already exists
    const existingSales = await db.select().from(salesAnalytics).limit(1);
    if (existingSales.length > 0) return;

    // Generate sample sales analytics for the last 30 days
    const sampleSalesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      sampleSalesData.push({
        id: utils.ID.generateId(),
        date: date,
        totalSales: Math.floor(Math.random() * 10000) + 1000,
        totalOrders: Math.floor(Math.random() * 100) + 10,
        averageOrderValue: Math.floor(Math.random() * 200) + 50,
        newCustomers: Math.floor(Math.random() * 20) + 5,
        returningCustomers: Math.floor(Math.random() * 30) + 10,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.insert(salesAnalytics).values(sampleSalesData);

    // Generate sample product analytics
    const sampleProductData = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 29; j >= 0; j--) {
        const date = new Date();
        date.setDate(date.getDate() - j);
        
        sampleProductData.push({
          id: utils.ID.generateId(),
          productId: `product-${i + 1}`,
          date: date,
          views: Math.floor(Math.random() * 1000) + 100,
          purchases: Math.floor(Math.random() * 50) + 5,
          revenue: Math.floor(Math.random() * 5000) + 500,
          conversionRate: Math.random() * 0.1 + 0.05,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await db.insert(productAnalytics).values(sampleProductData);

    utils.Logger.info('Sample analytics data initialized');
  } catch (error) {
    utils.Logger.error('Failed to initialize sample analytics data', error);
  }
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json(utils.HTTP.createSuccessResponse({ 
    service: 'Analytics Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  }));
});

// Analytics Events endpoints
app.post('/events', authenticateToken, async (req: Request, res: Response) => {
  try {
    const eventData = createAnalyticsEventSchema.parse(req.body);

    const newEvent = {
      id: utils.ID.generateId(),
      ...eventData,
      createdAt: new Date(),
    };

    await db.insert(analyticsEvents).values(newEvent);

    utils.Logger.info(`Analytics event created: ${newEvent.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newEvent, 'Event tracked successfully'));
  } catch (error) {
    utils.Logger.error('Track analytics event error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to track event', 500));
  }
});

// Sales Analytics endpoints
app.get('/analytics/sales', authenticateToken, async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const period = req.query.period as string || 'daily';

    let query = db.select().from(salesAnalytics);

    if (startDate) {
      query = query.where(gte(salesAnalytics.date, new Date(startDate)));
    }

    if (endDate) {
      query = query.where(lte(salesAnalytics.date, new Date(endDate)));
    }

    const salesData = await query.orderBy(asc(salesAnalytics.date));

    // Calculate summary statistics
    const totalSales = salesData.reduce((sum, item) => sum + item.totalSales, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.totalOrders, 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const summary = {
      totalSales,
      totalOrders,
      averageOrderValue,
      period: salesData.length > 0 ? `${salesData[0].date.toISOString().split('T')[0]} to ${salesData[salesData.length - 1].date.toISOString().split('T')[0]}` : null,
      data: salesData
    };

    res.json(utils.HTTP.createSuccessResponse(summary));
  } catch (error) {
    utils.Logger.error('Get sales analytics error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get sales analytics', 500));
  }
});

// Product Analytics endpoints
app.get('/analytics/products', authenticateToken, async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let query = db.select().from(productAnalytics);

    if (productId) {
      query = query.where(eq(productAnalytics.productId, productId));
    }

    if (startDate) {
      query = query.where(gte(productAnalytics.date, new Date(startDate)));
    }

    if (endDate) {
      query = query.where(lte(productAnalytics.date, new Date(endDate)));
    }

    const productData = await query.orderBy(asc(productAnalytics.date));

    res.json(utils.HTTP.createSuccessResponse(productData));
  } catch (error) {
    utils.Logger.error('Get product analytics error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get product analytics', 500));
  }
});

// Customer Analytics endpoints
app.get('/analytics/customers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const customerId = req.query.customerId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let query = db.select().from(customerAnalytics);

    if (customerId) {
      query = query.where(eq(customerAnalytics.customerId, customerId));
    }

    if (startDate) {
      query = query.where(gte(customerAnalytics.date, new Date(startDate)));
    }

    if (endDate) {
      query = query.where(lte(customerAnalytics.date, new Date(endDate)));
    }

    const customerData = await query.orderBy(asc(customerAnalytics.date));

    res.json(utils.HTTP.createSuccessResponse(customerData));
  } catch (error) {
    utils.Logger.error('Get customer analytics error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get customer analytics', 500));
  }
});

// Forecasting Models endpoints
app.get('/forecasting/models', authenticateToken, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const entityId = req.query.entityId as string;

    let query = db.select().from(forecastingModels).where(eq(forecastingModels.isActive, true));

    if (type) {
      query = query.where(eq(forecastingModels.type, type as any));
    }

    if (entityId) {
      query = query.where(eq(forecastingModels.entityId, entityId));
    }

    const models = await query.orderBy(desc(forecastingModels.createdAt));

    res.json(utils.HTTP.createSuccessResponse(models));
  } catch (error) {
    utils.Logger.error('Get forecasting models error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get forecasting models', 500));
  }
});

app.post('/forecasting/models', authenticateToken, async (req: Request, res: Response) => {
  try {
    const modelData = createForecastingModelSchema.parse(req.body);

    const newModel = {
      id: utils.ID.generateId(),
      ...modelData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(forecastingModels).values(newModel);

    utils.Logger.info(`Forecasting model created: ${newModel.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newModel, 'Forecasting model created successfully'));
  } catch (error) {
    utils.Logger.error('Create forecasting model error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create forecasting model', 500));
  }
});

// Forecasting Predictions endpoints
app.get('/forecasting/predictions/:modelId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let query = db.select().from(forecastingPredictions).where(eq(forecastingPredictions.modelId, modelId));

    if (startDate) {
      query = query.where(gte(forecastingPredictions.predictionDate, new Date(startDate)));
    }

    if (endDate) {
      query = query.where(lte(forecastingPredictions.predictionDate, new Date(endDate)));
    }

    const predictions = await query.orderBy(asc(forecastingPredictions.predictionDate));

    res.json(utils.HTTP.createSuccessResponse(predictions));
  } catch (error) {
    utils.Logger.error('Get forecasting predictions error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get forecasting predictions', 500));
  }
});

app.post('/forecasting/predictions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const predictionData = createForecastingPredictionSchema.parse(req.body);

    const newPrediction = {
      id: utils.ID.generateId(),
      ...predictionData,
      createdAt: new Date(),
    };

    await db.insert(forecastingPredictions).values(newPrediction);

    utils.Logger.info(`Forecasting prediction created: ${newPrediction.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newPrediction, 'Forecasting prediction created successfully'));
  } catch (error) {
    utils.Logger.error('Create forecasting prediction error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create forecasting prediction', 500));
  }
});

// Reports endpoints
app.get('/reports', authenticateToken, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const generatedBy = req.query.generatedBy as string;

    let query = db.select().from(reports);

    if (type) {
      query = query.where(eq(reports.type, type as any));
    }

    if (generatedBy) {
      query = query.where(eq(reports.generatedBy, generatedBy));
    }

    const reportsData = await query.orderBy(desc(reports.generatedAt));

    res.json(utils.HTTP.createSuccessResponse(reportsData));
  } catch (error) {
    utils.Logger.error('Get reports error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get reports', 500));
  }
});

app.post('/reports', authenticateToken, async (req: Request, res: Response) => {
  try {
    const reportData = createReportSchema.parse(req.body);

    const newReport = {
      id: utils.ID.generateId(),
      ...reportData,
      generatedBy: req.user?.userId || 'system',
      generatedAt: new Date(),
    };

    await db.insert(reports).values(newReport);

    utils.Logger.info(`Report created: ${newReport.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newReport, 'Report created successfully'));
  } catch (error) {
    utils.Logger.error('Create report error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create report', 500));
  }
});

// Dashboard Widgets endpoints
app.get('/dashboard/widgets', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(utils.HTTP.createErrorResponse('User ID required', 401));
    }

    const widgets = await db.select()
      .from(dashboardWidgets)
      .where(and(
        eq(dashboardWidgets.userId, userId),
        eq(dashboardWidgets.isActive, true)
      ))
      .orderBy(asc(dashboardWidgets.position));

    res.json(utils.HTTP.createSuccessResponse(widgets));
  } catch (error) {
    utils.Logger.error('Get dashboard widgets error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get dashboard widgets', 500));
  }
});

app.post('/dashboard/widgets', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(utils.HTTP.createErrorResponse('User ID required', 401));
    }

    const widgetData = createDashboardWidgetSchema.parse(req.body);

    const newWidget = {
      id: utils.ID.generateId(),
      userId,
      ...widgetData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(dashboardWidgets).values(newWidget);

    utils.Logger.info(`Dashboard widget created: ${newWidget.id}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(newWidget, 'Dashboard widget created successfully'));
  } catch (error) {
    utils.Logger.error('Create dashboard widget error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to create dashboard widget', 500));
  }
});

app.put('/dashboard/widgets/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const updateData = updateDashboardWidgetSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json(utils.HTTP.createErrorResponse('User ID required', 401));
    }

    // Check if widget exists and belongs to user
    const existingWidgets = await db.select()
      .from(dashboardWidgets)
      .where(and(
        eq(dashboardWidgets.id, id),
        eq(dashboardWidgets.userId, userId)
      ));

    if (existingWidgets.length === 0) {
      return res.status(404).json(utils.HTTP.createErrorResponse('Widget not found', 404));
    }

    await db.update(dashboardWidgets)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(dashboardWidgets.id, id));

    utils.Logger.info(`Dashboard widget updated: ${id}`);
    res.json(utils.HTTP.createSuccessResponse(null, 'Dashboard widget updated successfully'));
  } catch (error) {
    utils.Logger.error('Update dashboard widget error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to update dashboard widget', 500));
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
    await initializeSampleAnalytics();
    
    app.listen(PORT, () => {
      utils.Logger.info(`Analytics Service running on port ${PORT}`);
      utils.Logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    utils.Logger.error('Failed to start Analytics Service', error);
    process.exit(1);
  }
}

startServer();

export default app;