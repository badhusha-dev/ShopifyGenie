const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { Sale, SalesMetric } = require('./models');
const salesRoutes = require('./routes/salesRoutes');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const seedSales = require('./utils/seedData');
const { initProducer, disconnectProducer } = require('./kafka/producer');
const { initConsumer, disconnectConsumer } = require('./kafka/consumer');

const app = express();
const PORT = process.env.PORT || 5003;

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

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'Sales Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      sales: '/api/sales',
      summary: '/api/sales/summary',
      today: '/api/sales/today',
      chart: '/api/sales/chart',
      docs: '/api-docs'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/sales', salesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize server
async function startServer() {
  try {
    // Connect to database
    await testConnection();
    
    // Sync models
    await sequelize.sync({ alter: true });
    logger.info('✅ Database models synchronized successfully.');

    // Seed sample data
    await seedSales();

    // Initialize Kafka
    await initProducer();
    await initConsumer();

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Sales Service running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('⏹️  Shutting down gracefully...');
  await disconnectProducer();
  await disconnectConsumer();
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('⏹️  Shutting down gracefully...');
  await disconnectProducer();
  await disconnectConsumer();
  await sequelize.close();
  process.exit(0);
});

startServer();
