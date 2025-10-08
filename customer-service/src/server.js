const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { connectDB } = require('./config/database');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const customerRoutes = require('./routes/customerRoutes');
const { initProducer } = require('./kafka/producer');
const { initConsumer } = require('./kafka/consumer');
const { Customer, LoyaltyTier } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'customer-service',
    timestamp: new Date().toISOString()
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes - Specific routes before parameterized routes
const customerController = require('./controllers/customerController');
app.get('/api/customers/loyalty', customerController.getLoyaltyTiers);
app.get('/api/customers/analytics', customerController.getCustomerAnalytics);
app.use('/api/customers', customerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Seed initial data
const seedData = async () => {
  try {
    // Check if customers already exist
    const customerCount = await Customer.count();
    
    if (customerCount === 0) {
      // Seed loyalty tiers
      const tiers = [
        { name: 'Bronze', min_points: 0, max_points: 99, discount_rate: 0 },
        { name: 'Silver', min_points: 100, max_points: 499, discount_rate: 5 },
        { name: 'Gold', min_points: 500, max_points: 999, discount_rate: 10 },
        { name: 'Platinum', min_points: 1000, max_points: null, discount_rate: 15 }
      ];
      
      for (const tier of tiers) {
        await LoyaltyTier.findOrCreate({
          where: { name: tier.name },
          defaults: tier
        });
      }
      
      // Seed sample customers
      const customers = [
        { name: 'John Doe', email: 'john@example.com', phone: '555-0101', tier: 'Bronze', points: 50 },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', tier: 'Silver', points: 250 },
        { name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0103', tier: 'Gold', points: 650 },
        { name: 'Alice Williams', email: 'alice@example.com', phone: '555-0104', tier: 'Platinum', points: 1200 },
        { name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0105', tier: 'Bronze', points: 75 },
        { name: 'Diana Prince', email: 'diana@example.com', phone: '555-0106', tier: 'Silver', points: 350 },
        { name: 'Edward Norton', email: 'edward@example.com', phone: '555-0107', tier: 'Gold', points: 800 },
        { name: 'Fiona Green', email: 'fiona@example.com', phone: '555-0108', tier: 'Bronze', points: 25 }
      ];
      
      for (const customer of customers) {
        await Customer.create(customer);
      }
      
      logger.info(`✅ Seeded ${customers.length} sample customers and 4 loyalty tiers`);
    } else {
      logger.info(`📊 Database already has ${customerCount} customers - skipping seed`);
    }
  } catch (error) {
    logger.error('Error seeding data:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Seed initial data
    await seedData();
    
    // Initialize Kafka producer
    await initProducer();
    
    // Initialize Kafka consumer
    await initConsumer();
    
    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Customer Service running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();
