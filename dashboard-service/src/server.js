const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { DashboardMetrics, RealtimeEvents } = require('./models');
const dashboardRoutes = require('./routes/dashboardRoutes');
const setupSwagger = require('./config/swagger');
const { startConsumer, stopConsumer } = require('./kafka/consumer');
const { startCronJobs } = require('./utils/cronJobs');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');
const { runMigrations } = require('./config/flyway');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'dashboard-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/dashboard', dashboardRoutes);

setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      await runMigrations();
      logger.info('✅ Database migrations completed');
    } else {
      logger.warn('⚠️  Database not connected - running without database');
    }

    startCronJobs();

    if (process.env.KAFKA_BROKER && process.env.KAFKA_BROKER !== 'localhost:9092') {
      startConsumer().catch(err => {
        logger.warn('⚠️  Kafka consumer failed to start:', err.message);
        logger.info('📝 Service will continue without Kafka');
      });
    } else {
      logger.info('📝 Kafka not configured - skipping consumer initialization');
    }

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Dashboard Service running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await stopConsumer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await stopConsumer();
  process.exit(0);
});

startServer();
