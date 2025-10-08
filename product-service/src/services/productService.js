const { Product, ProductEvent } = require('../models');
const { publishEvent } = require('../kafka/producer');
const { Op } = require('sequelize');

class ProductService {
  async getAllProducts() {
    return await Product.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']]
    });
  }

  async getProductById(id) {
    const product = await Product.findByPk(id);
    if (!product || !product.is_active) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(productData) {
    const product = await Product.create(productData);

    // Log event
    await ProductEvent.create({
      event_type: 'product.created',
      product_id: product.id,
      payload: product.toJSON()
    });

    // Publish to Kafka
    await publishEvent('product.events', {
      type: 'product.created',
      productId: product.id,
      timestamp: new Date().toISOString(),
      data: product.toJSON()
    });

    return product;
  }

  async updateProduct(id, updateData) {
    const product = await this.getProductById(id);
    const oldData = product.toJSON();
    
    await product.update(updateData);

    // Log event
    await ProductEvent.create({
      event_type: 'product.updated',
      product_id: product.id,
      payload: { old: oldData, new: product.toJSON() }
    });

    // Publish to Kafka
    await publishEvent('product.events', {
      type: 'product.updated',
      productId: product.id,
      timestamp: new Date().toISOString(),
      changes: updateData,
      data: product.toJSON()
    });

    return product;
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    
    // Soft delete
    await product.update({ is_active: false });

    // Log event
    await ProductEvent.create({
      event_type: 'product.deleted',
      product_id: product.id,
      payload: product.toJSON()
    });

    // Publish to Kafka
    await publishEvent('product.events', {
      type: 'product.deleted',
      productId: product.id,
      timestamp: new Date().toISOString(),
      data: product.toJSON()
    });

    return { message: 'Product deleted successfully' };
  }

  async getLowStockProducts() {
    return await Product.findAll({
      where: {
        is_active: true,
        stock: {
          [Op.lte]: Product.sequelize.col('low_stock_threshold')
        }
      },
      order: [['stock', 'ASC']]
    });
  }

  async getProductStats() {
    const totalProducts = await Product.count({ where: { is_active: true } });
    const lowStock = await Product.count({
      where: {
        is_active: true,
        stock: {
          [Op.lte]: Product.sequelize.col('low_stock_threshold')
        }
      }
    });

    const totalValue = await Product.sum('price', {
      where: { is_active: true }
    });

    return {
      totalProducts,
      lowStockCount: lowStock,
      totalValue: totalValue || 0
    };
  }
}

module.exports = new ProductService();
