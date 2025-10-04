// Auth Service - JWT authentication, bcrypt, role-based access
// Port: 5001

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { eq, and } from 'drizzle-orm';
import { config } from 'dotenv';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ApiResponse,
  schemas,
  utils 
} from '../../shared';
import { db, testConnection, closeConnection } from './drizzle/db';
import { users, refreshTokens, createUserSchema, loginSchema, registerSchema } from './drizzle/schema';

// Load environment variables
config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 5001;

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
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
});

// Initialize default users
async function initializeDefaultUsers() {
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) return;

    const defaultUsers = [
      {
        id: utils.ID.generateId(),
        name: 'Super Administrator',
        email: 'admin@shopifygenie.com',
        password: await utils.Password.hashPassword('admin123'),
        role: 'superadmin' as const,
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Admin User',
        email: 'admin@shopifyapp.com',
        password: await utils.Password.hashPassword('admin123'),
        role: 'admin' as const,
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Staff Member',
        email: 'staff@shopifyapp.com',
        password: await utils.Password.hashPassword('staff123'),
        role: 'staff' as const,
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
        isActive: true,
      },
      {
        id: utils.ID.generateId(),
        name: 'Demo Customer',
        email: 'customer@example.com',
        password: await utils.Password.hashPassword('customer123'),
        role: 'customer' as const,
        permissions: null,
        shopDomain: null,
        isActive: true,
      },
    ];

    for (const user of defaultUsers) {
      await db.insert(users).values(user);
    }

    utils.Logger.info('Default users initialized');
  } catch (error) {
    utils.Logger.error('Failed to initialize default users', error);
  }
}

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'auth-service',
    timestamp: utils.Date.now().toISOString(),
  });
});

// Login endpoint
app.post('/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const userResults = await db.select().from(users).where(eq(users.email, email));
    const user = userResults[0];

    if (!user || !user.isActive) {
      return res.status(401).json(utils.HTTP.createErrorResponse('Invalid credentials', 401));
    }

    // Verify password
    const isValidPassword = await utils.Password.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(utils.HTTP.createErrorResponse('Invalid credentials', 401));
    }

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const accessToken = utils.JWT.generateAccessToken(user.id, user.email, user.role, jwtSecret);
    const refreshToken = utils.JWT.generateRefreshToken(user.id, jwtSecret);

    // Store refresh token in database
    await db.insert(refreshTokens).values({
      id: utils.ID.generateId(),
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
      message: 'Login successful',
    };

    utils.Logger.info(`User ${email} logged in successfully`);
    res.json(utils.HTTP.createSuccessResponse(response, 'Login successful'));
  } catch (error) {
    utils.Logger.error('Login error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Login failed', 500));
  }
});

// Register endpoint
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const userData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, userData.email));
    if (existingUsers.length > 0) {
      return res.status(409).json(utils.HTTP.createErrorResponse('User already exists', 409));
    }

    // Hash password
    const hashedPassword = await utils.Password.hashPassword(userData.password);

    // Create user
    const newUser = {
      id: utils.ID.generateId(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'customer',
      permissions: null,
      shopDomain: userData.shopDomain || null,
      isActive: true,
    };

    await db.insert(users).values(newUser);

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const accessToken = utils.JWT.generateAccessToken(newUser.id, newUser.email, newUser.role, jwtSecret);
    const refreshToken = utils.JWT.generateRefreshToken(newUser.id, jwtSecret);

    // Store refresh token
    await db.insert(refreshTokens).values({
      id: utils.ID.generateId(),
      userId: newUser.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    const response: LoginResponse = {
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
      message: 'Registration successful',
    };

    utils.Logger.info(`New user registered: ${userData.email}`);
    res.status(201).json(utils.HTTP.createSuccessResponse(response, 'Registration successful'));
  } catch (error) {
    utils.Logger.error('Registration error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Registration failed', 500));
  }
});

// Get current user endpoint
app.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(utils.HTTP.createErrorResponse('Access token required', 401));
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    const decoded = utils.JWT.verifyToken(token, jwtSecret);
    
    // Find user
    const userResults = await db.select().from(users).where(eq(users.id, decoded.userId));
    const user = userResults[0];

    if (!user || !user.isActive) {
      return res.status(404).json(utils.HTTP.createErrorResponse('User not found', 404));
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json(utils.HTTP.createSuccessResponse(userWithoutPassword));
  } catch (error) {
    utils.Logger.error('Get user error', error);
    res.status(401).json(utils.HTTP.createErrorResponse('Invalid token', 401));
  }
});

// Refresh token endpoint
app.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json(utils.HTTP.createErrorResponse('Refresh token required', 401));
    }

    // Find refresh token in database
    const tokenResults = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    const tokenRecord = tokenResults[0];

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json(utils.HTTP.createErrorResponse('Invalid or expired refresh token', 401));
    }

    // Find user
    const userResults = await db.select().from(users).where(eq(users.id, tokenRecord.userId));
    const user = userResults[0];

    if (!user || !user.isActive) {
      return res.status(404).json(utils.HTTP.createErrorResponse('User not found', 404));
    }

    // Generate new tokens
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const accessToken = utils.JWT.generateAccessToken(user.id, user.email, user.role, jwtSecret);
    const newRefreshToken = utils.JWT.generateRefreshToken(user.id, jwtSecret);

    // Update refresh token in database
    await db.update(refreshTokens)
      .set({ 
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .where(eq(refreshTokens.id, tokenRecord.id));

    res.json(utils.HTTP.createSuccessResponse({
      token: accessToken,
      refreshToken: newRefreshToken,
    }));
  } catch (error) {
    utils.Logger.error('Refresh token error', error);
    res.status(401).json(utils.HTTP.createErrorResponse('Invalid refresh token', 401));
  }
});

// Logout endpoint
app.post('/auth/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Remove refresh token from database
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    }
    
    res.json(utils.HTTP.createSuccessResponse(null, 'Logout successful'));
  } catch (error) {
    utils.Logger.error('Logout error', error);
    res.json(utils.HTTP.createSuccessResponse(null, 'Logout successful'));
  }
});

// Get all users (admin only)
app.get('/auth/users', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(utils.HTTP.createErrorResponse('Access token required', 401));
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    const decoded = utils.JWT.verifyToken(token, jwtSecret);
    
    // Check if user is admin or superadmin
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json(utils.HTTP.createErrorResponse('Insufficient permissions', 403));
    }

    const allUsers = await db.select().from(users);
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);

    res.json(utils.HTTP.createSuccessResponse(usersWithoutPasswords));
  } catch (error) {
    utils.Logger.error('Get users error', error);
    res.status(500).json(utils.HTTP.createErrorResponse('Failed to get users', 500));
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
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    await initializeDefaultUsers();
    
    app.listen(PORT, () => {
      utils.Logger.info(`Auth Service running on port ${PORT}`);
      utils.Logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    utils.Logger.error('Failed to start Auth Service', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  utils.Logger.info('Shutting down Auth Service...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  utils.Logger.info('Shutting down Auth Service...');
  await closeConnection();
  process.exit(0);
});

startServer();

export default app;
