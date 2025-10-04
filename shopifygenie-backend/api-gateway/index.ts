// API Gateway - Routes requests to microservices
// Port: 5000

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { 
  ApiResponse,
  utils 
} from '../shared';

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 5000;

// Service URLs
const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002',
  customers: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:5003',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:5004',
  accounting: process.env.ACCOUNTING_SERVICE_URL || 'http://localhost:5005',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5006',
};

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

// Swagger configuration
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ShopifyGenie API Gateway',
    version: '1.0.0',
    description: 'API Gateway for ShopifyGenie microservices',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'User login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'object' },
                        token: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/products': {
      get: {
        summary: 'Get products',
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Products retrieved successfully',
          },
        },
      },
    },
    '/customers': {
      get: {
        summary: 'Get customers',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Customers retrieved successfully',
          },
        },
      },
    },
    '/orders': {
      get: {
        summary: 'Get orders',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Orders retrieved successfully',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway',
    timestamp: utils.Date.now().toISOString(),
    services: Object.keys(SERVICE_URLS),
  });
});

// Service health check endpoint
app.get('/health/services', async (req: Request, res: Response) => {
  try {
    const healthChecks = await Promise.allSettled(
      Object.entries(SERVICE_URLS).map(async ([serviceName, url]) => {
        try {
          const response = await fetch(`${url}/health`);
          const data = await response.json();
          return { service: serviceName, status: 'healthy', data };
        } catch (error) {
          return { service: serviceName, status: 'unhealthy', error: error.message };
        }
      })
    );

    const results = healthChecks.map((result, index) => {
      const serviceName = Object.keys(SERVICE_URLS)[index];
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return { service: serviceName, status: 'error', error: result.reason };
      }
    });

    res.json(utils.HTTP.createSuccessResponse(results));
  } catch (error) {
    utils.Logger.error('Service health check error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to check service health', 500));
  }
});

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

// Proxy middleware for each service
const createServiceProxy = (serviceUrl: string, pathRewrite?: Record<string, string>) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: pathRewrite || {},
    onError: (err, req, res) => {
      utils.Logger.error(`Proxy error for ${req.url}`, err);
      res.status(500).json(utils.HTTP.createErrorResponse('Service unavailable', 500));
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user information to services
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.userId);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  });
};

// Auth service routes (no authentication required)
app.use('/auth', createServiceProxy(SERVICE_URLS.auth, { '^/auth': '' }));

// Protected routes (require authentication)
app.use('/products', authenticateToken, createServiceProxy(SERVICE_URLS.products, { '^/products': '' }));
app.use('/customers', authenticateToken, createServiceProxy(SERVICE_URLS.customers, { '^/customers': '' }));
app.use('/orders', authenticateToken, createServiceProxy(SERVICE_URLS.orders, { '^/orders': '' }));
app.use('/accounts', authenticateToken, createServiceProxy(SERVICE_URLS.accounting, { '^/accounts': '' }));
app.use('/journal-entries', authenticateToken, createServiceProxy(SERVICE_URLS.accounting, { '^/journal-entries': '' }));
app.use('/reports', authenticateToken, createServiceProxy(SERVICE_URLS.accounting, { '^/reports': '' }));
app.use('/analytics', authenticateToken, createServiceProxy(SERVICE_URLS.analytics, { '^/analytics': '' }));
app.use('/dashboard', authenticateToken, createServiceProxy(SERVICE_URLS.analytics, { '^/dashboard': '' }));

// WebSocket support for real-time updates
import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';

const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
});

// WebSocket connection handling
io.on('connection', (socket) => {
  utils.Logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on('join-room', (room) => {
    socket.join(room);
    utils.Logger.info(`Client ${socket.id} joined room: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    utils.Logger.info(`Client ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    utils.Logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

// Broadcast order updates
app.post('/broadcast/order-update', authenticateToken, (req: Request, res: Response) => {
  try {
    const { orderId, status, message } = req.body;
    
    io.to(`order-${orderId}`).emit('order-update', {
      orderId,
      status,
      message,
      timestamp: utils.Date.now().toISOString(),
    });

    res.json(utils.HTTP.createSuccessResponse(null, 'Order update broadcasted'));
  } catch (error) {
    utils.Logger.error('Broadcast order update error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to broadcast order update', 500));
  }
});

// Broadcast inventory alerts
app.post('/broadcast/inventory-alert', authenticateToken, (req: Request, res: Response) => {
  try {
    const { productId, alert } = req.body;
    
    io.to('inventory-alerts').emit('inventory-alert', {
      productId,
      alert,
      timestamp: utils.Date.now().toISOString(),
    });

    res.json(utils.HTTP.createSuccessResponse(null, 'Inventory alert broadcasted'));
  } catch (error) {
    utils.Logger.error('Broadcast inventory alert error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to broadcast inventory alert', 500));
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
    server.listen(PORT, () => {
      utils.Logger.info(`API Gateway running on port ${PORT}`);
      utils.Logger.info(`Health check: http://localhost:${PORT}/health`);
      utils.Logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      utils.Logger.info(`WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error) {
    utils.Logger.error('Failed to start API Gateway', error);
    process.exit(1);
  }
}

startServer();

export default app;
