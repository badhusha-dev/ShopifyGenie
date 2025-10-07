const cron = require('node-cron');
const dashboardService = require('../services/dashboardService');
const logger = require('../config/logger');

const startCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('🕐 Running daily summary job at midnight');
    await dashboardService.computeDailySummary();
  });

  logger.info('✅ Cron jobs scheduled successfully');
};

module.exports = { startCronJobs };
