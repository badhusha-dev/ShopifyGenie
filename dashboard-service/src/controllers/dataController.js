const { historicalMetrics, realtimeEvents } = require('../utils/seedData');
const logger = require('../config/logger');

const getHistoricalMetrics = async (req, res) => {
  try {
    const { limit = 30, days = 30 } = req.query;
    
    const limitNum = parseInt(limit);
    const data = historicalMetrics.slice(-limitNum);
    
    res.json({
      success: true,
      data: {
        metrics: data,
        count: data.length,
        source: 'backend'
      }
    });
  } catch (error) {
    logger.error('Error in getHistoricalMetrics controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve historical metrics',
      error: error.message
    });
  }
};

const getRealtimeEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const limitNum = parseInt(limit);
    const data = realtimeEvents.slice(-limitNum);
    
    res.json({
      success: true,
      data: {
        events: data,
        count: data.length,
        source: 'backend'
      }
    });
  } catch (error) {
    logger.error('Error in getRealtimeEvents controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve realtime events',
      error: error.message
    });
  }
};

module.exports = {
  getHistoricalMetrics,
  getRealtimeEvents
};
