const dashboardService = require('../services/dashboardService');
const logger = require('../config/logger');

const getSalesSummary = async (req, res) => {
  try {
    const data = await dashboardService.getSalesSummary();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in getSalesSummary controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales summary',
      error: error.message
    });
  }
};

const getInventoryStatus = async (req, res) => {
  try {
    const data = await dashboardService.getInventoryStatus();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in getInventoryStatus controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory status',
      error: error.message
    });
  }
};

const getCustomerMetrics = async (req, res) => {
  try {
    const data = await dashboardService.getCustomerMetrics();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in getCustomerMetrics controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer metrics',
      error: error.message
    });
  }
};

const getFinancialOverview = async (req, res) => {
  try {
    const data = await dashboardService.getFinancialOverview();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error in getFinancialOverview controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve financial overview',
      error: error.message
    });
  }
};

const getRealtimeEndpoint = async (req, res) => {
  res.json({
    success: true,
    message: 'WebSocket endpoint stub - implement WebSocket server for real-time updates',
    endpoint: 'ws://localhost:8000/realtime'
  });
};

module.exports = {
  getSalesSummary,
  getInventoryStatus,
  getCustomerMetrics,
  getFinancialOverview,
  getRealtimeEndpoint
};
