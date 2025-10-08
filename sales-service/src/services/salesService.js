const { Sale, SalesMetric } = require('../models');
const { publishSaleCompleted } = require('../kafka/producer');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class SalesService {
  async createSale(saleData) {
    try {
      const { product_id, product_name, quantity, price } = saleData;
      const total = (quantity * price).toFixed(2);
      const date = new Date().toISOString().split('T')[0];

      const sale = await Sale.create({
        product_id,
        product_name,
        quantity,
        price,
        total,
        date
      });

      // Publish Kafka event
      await publishSaleCompleted(sale.toJSON());

      // Update daily metrics
      await this.updateDailyMetrics(date, parseFloat(total));

      logger.info(`✅ Sale created: ${sale.id}`);
      return sale;
    } catch (error) {
      logger.error('❌ Error creating sale:', error.message);
      throw error;
    }
  }

  async getAllSales(limit = 50) {
    return await Sale.findAll({
      order: [['created_at', 'DESC']],
      limit
    });
  }

  async getSaleById(id) {
    return await Sale.findByPk(id);
  }

  async getSalesSummary() {
    const result = await Sale.findOne({
      attributes: [
        [Sale.sequelize.fn('COUNT', Sale.sequelize.col('id')), 'total_sales'],
        [Sale.sequelize.fn('SUM', Sale.sequelize.col('total')), 'total_revenue'],
        [Sale.sequelize.fn('SUM', Sale.sequelize.col('quantity')), 'total_items_sold']
      ],
      raw: true
    });

    return {
      total_sales: parseInt(result.total_sales) || 0,
      total_revenue: parseFloat(result.total_revenue) || 0,
      total_items_sold: parseInt(result.total_items_sold) || 0,
      profit: parseFloat(result.total_revenue) * 0.3 || 0 // 30% profit margin
    };
  }

  async getTodaysSales() {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await Sale.findOne({
      where: { date: today },
      attributes: [
        [Sale.sequelize.fn('COUNT', Sale.sequelize.col('id')), 'sales_count'],
        [Sale.sequelize.fn('SUM', Sale.sequelize.col('total')), 'revenue'],
        [Sale.sequelize.fn('SUM', Sale.sequelize.col('quantity')), 'items_sold']
      ],
      raw: true
    });

    return {
      date: today,
      sales_count: parseInt(result.sales_count) || 0,
      revenue: parseFloat(result.revenue) || 0,
      items_sold: parseInt(result.items_sold) || 0
    };
  }

  async getLast7DaysSales() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const sales = await Sale.findAll({
      where: {
        date: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'date',
        [Sale.sequelize.fn('COUNT', Sale.sequelize.col('id')), 'count'],
        [Sale.sequelize.fn('SUM', Sale.sequelize.col('total')), 'revenue']
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true
    });

    return sales.map(s => ({
      date: s.date,
      count: parseInt(s.count),
      revenue: parseFloat(s.revenue)
    }));
  }

  async updateDailyMetrics(date, revenue) {
    try {
      const [metric, created] = await SalesMetric.findOrCreate({
        where: { date },
        defaults: {
          date,
          total_sales: 1,
          total_revenue: revenue,
          profit: revenue * 0.3
        }
      });

      if (!created) {
        await metric.increment({
          total_sales: 1,
          total_revenue: revenue,
          profit: revenue * 0.3
        });
      }
    } catch (error) {
      logger.error('❌ Error updating daily metrics:', error.message);
    }
  }
}

module.exports = new SalesService();
