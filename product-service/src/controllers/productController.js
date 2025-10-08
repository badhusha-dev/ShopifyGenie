const productService = require('../services/productService');
const logger = require('../config/logger');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      logger.error(`Error fetching products: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error(`Error fetching product: ${error.message}`);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error(`Error creating product: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error(`Error updating product: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const result = await productService.deleteProduct(req.params.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error(`Error deleting product: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getLowStockProducts(req, res) {
    try {
      const products = await productService.getLowStockProducts();
      res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      logger.error(`Error fetching low stock products: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProductStats(req, res) {
    try {
      const stats = await productService.getProductStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error(`Error fetching product stats: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();
