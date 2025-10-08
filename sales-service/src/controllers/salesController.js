const salesService = require('../services/salesService');
const logger = require('../utils/logger');

const salesController = {
  async createSale(req, res) {
    try {
      const { product_id, product_name, quantity, price } = req.body;

      if (!product_id || !quantity || !price) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: product_id, quantity, price'
        });
      }

      const sale = await salesService.createSale({
        product_id,
        product_name: product_name || `Product ${product_id}`,
        quantity: parseInt(quantity),
        price: parseFloat(price)
      });

      res.status(201).json({
        success: true,
        message: 'Sale created successfully',
        data: sale
      });
    } catch (error) {
      logger.error('Error in createSale:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create sale',
        error: error.message
      });
    }
  },

  async getAllSales(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const sales = await salesService.getAllSales(limit);

      res.json({
        success: true,
        count: sales.length,
        data: sales
      });
    } catch (error) {
      logger.error('Error in getAllSales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales',
        error: error.message
      });
    }
  },

  async getSaleById(req, res) {
    try {
      const { id } = req.params;
      const sale = await salesService.getSaleById(id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      logger.error('Error in getSaleById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sale',
        error: error.message
      });
    }
  },

  async getSalesSummary(req, res) {
    try {
      const summary = await salesService.getSalesSummary();

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error('Error in getSalesSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales summary',
        error: error.message
      });
    }
  },

  async getTodaysSales(req, res) {
    try {
      const todaySales = await salesService.getTodaysSales();

      res.json({
        success: true,
        data: todaySales
      });
    } catch (error) {
      logger.error('Error in getTodaysSales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch today\'s sales',
        error: error.message
      });
    }
  },

  async getLast7DaysSales(req, res) {
    try {
      const chartData = await salesService.getLast7DaysSales();

      res.json({
        success: true,
        data: chartData
      });
    } catch (error) {
      logger.error('Error in getLast7DaysSales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chart data',
        error: error.message
      });
    }
  }
};

module.exports = salesController;
