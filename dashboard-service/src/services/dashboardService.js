const { DashboardMetrics, RealtimeEvents } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const { historicalMetrics, realtimeEvents } = require('../utils/seedData');

class DashboardService {
  async getSalesSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let metrics = await DashboardMetrics.findOne({ where: { date: today } });

      if (!metrics) {
        metrics = await this.getTodayMetrics();
      }

      return {
        totalSales: parseFloat(metrics.totalSales),
        totalRevenue: parseFloat(metrics.totalRevenue),
        totalProfit: parseFloat(metrics.totalProfit),
        date: metrics.date,
        source: 'database'
      };
    } catch (error) {
      logger.warn('Database unavailable, using backend seed data for sales summary');
      const today = new Date().toISOString().split('T')[0];
      const todayData = historicalMetrics.find(m => m.date === today) || historicalMetrics[historicalMetrics.length - 1];
      return {
        totalSales: todayData.totalSales,
        totalRevenue: todayData.totalRevenue,
        totalProfit: todayData.totalProfit,
        date: todayData.date,
        source: 'backend'
      };
    }
  }

  async getInventoryStatus() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let metrics = await DashboardMetrics.findOne({ where: { date: today } });

      if (!metrics) {
        metrics = await this.getTodayMetrics();
      }

      return {
        lowStockCount: metrics.lowStockCount,
        totalItems: metrics.totalItems,
        date: metrics.date,
        source: 'database'
      };
    } catch (error) {
      logger.warn('Database unavailable, using backend seed data for inventory status');
      const today = new Date().toISOString().split('T')[0];
      const todayData = historicalMetrics.find(m => m.date === today) || historicalMetrics[historicalMetrics.length - 1];
      return {
        lowStockCount: todayData.lowStockCount,
        totalItems: todayData.totalItems,
        date: todayData.date,
        source: 'backend'
      };
    }
  }

  async getCustomerMetrics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let metrics = await DashboardMetrics.findOne({ where: { date: today } });

      if (!metrics) {
        metrics = await this.getTodayMetrics();
      }

      return {
        newCustomers: metrics.newCustomers,
        activeCustomers: metrics.activeCustomers,
        churnRate: parseFloat(metrics.churnRate),
        date: metrics.date,
        source: 'database'
      };
    } catch (error) {
      logger.warn('Database unavailable, using backend seed data for customer metrics');
      const today = new Date().toISOString().split('T')[0];
      const todayData = historicalMetrics.find(m => m.date === today) || historicalMetrics[historicalMetrics.length - 1];
      return {
        newCustomers: todayData.newCustomers,
        activeCustomers: todayData.activeCustomers,
        churnRate: todayData.churnRate,
        date: todayData.date,
        source: 'backend'
      };
    }
  }

  async getFinancialOverview() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let metrics = await DashboardMetrics.findOne({ where: { date: today } });

      if (!metrics) {
        metrics = await this.getTodayMetrics();
      }

      return {
        cashFlow: parseFloat(metrics.cashFlow),
        accountsReceivable: parseFloat(metrics.accountsReceivable),
        accountsPayable: parseFloat(metrics.accountsPayable),
        date: metrics.date,
        source: 'database'
      };
    } catch (error) {
      logger.warn('Database unavailable, using backend seed data for financial overview');
      const today = new Date().toISOString().split('T')[0];
      const todayData = historicalMetrics.find(m => m.date === today) || historicalMetrics[historicalMetrics.length - 1];
      return {
        cashFlow: todayData.cashFlow,
        accountsReceivable: todayData.accountsReceivable,
        accountsPayable: todayData.accountsPayable,
        date: todayData.date,
        source: 'backend'
      };
    }
  }

  async getTodayMetrics() {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const [metrics] = await DashboardMetrics.findOrCreate({
        where: { date: today },
        defaults: {
          date: today,
          totalSales: 125000.00,
          totalRevenue: 145000.00,
          totalProfit: 45000.00,
          lowStockCount: 15,
          totalItems: 342,
          newCustomers: 28,
          activeCustomers: 1547,
          churnRate: 2.3,
          cashFlow: 89000.00,
          accountsReceivable: 67000.00,
          accountsPayable: 34000.00
        }
      });
      return metrics;
    } catch (error) {
      logger.warn('Database not available, using backend seed data');
      const todayData = historicalMetrics.find(m => m.date === today) || historicalMetrics[historicalMetrics.length - 1];
      return todayData;
    }
  }

  async processEvent(eventType, eventSource, eventData) {
    try {
      await RealtimeEvents.create({
        eventType,
        eventSource,
        eventData
      });

      const today = new Date().toISOString().split('T')[0];
      let metrics = await DashboardMetrics.findOne({ where: { date: today } });

      if (!metrics) {
        metrics = await this.getTodayMetrics();
      }

      switch (eventSource) {
        case 'sales-service':
          if (eventData.amount) {
            metrics.totalSales = parseFloat(metrics.totalSales) + parseFloat(eventData.amount);
            metrics.totalRevenue = parseFloat(metrics.totalRevenue) + parseFloat(eventData.revenue || eventData.amount);
          }
          break;
        case 'inventory-service':
          if (eventData.lowStock !== undefined) {
            metrics.lowStockCount = eventData.lowStock;
          }
          if (eventData.totalItems !== undefined) {
            metrics.totalItems = eventData.totalItems;
          }
          break;
        case 'customer-service':
          if (eventType === 'customer.registered') {
            metrics.newCustomers += 1;
          }
          break;
        case 'accounting-service':
          if (eventData.cashFlow !== undefined) {
            metrics.cashFlow = eventData.cashFlow;
          }
          break;
      }

      await metrics.save();
      logger.info(`Processed ${eventType} event from ${eventSource}`);
    } catch (error) {
      logger.error('Error processing event:', error);
      throw error;
    }
  }

  async computeDailySummary() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const metrics = await DashboardMetrics.findOne({ where: { date: yesterdayStr } });
      
      if (metrics) {
        logger.info(`Daily summary for ${yesterdayStr}:`, {
          sales: metrics.totalSales,
          revenue: metrics.totalRevenue,
          profit: metrics.totalProfit
        });
      }

      logger.info('Daily summary computation completed');
    } catch (error) {
      logger.error('Error computing daily summary:', error);
    }
  }
}

module.exports = new DashboardService();
