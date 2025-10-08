const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SalesMetric = sequelize.define('SalesMetric', {
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
  total_sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  profit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'sales_metrics',
  timestamps: true,
  underscored: true
});

module.exports = SalesMetric;
