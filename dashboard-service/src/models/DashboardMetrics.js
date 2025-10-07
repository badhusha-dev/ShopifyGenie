const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DashboardMetrics = sequelize.define('DashboardMetrics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  totalSales: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalProfit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  lowStockCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  newCustomers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activeCustomers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  churnRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  cashFlow: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  accountsReceivable: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  accountsPayable: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'dashboard_metrics',
  timestamps: true
});

module.exports = DashboardMetrics;
