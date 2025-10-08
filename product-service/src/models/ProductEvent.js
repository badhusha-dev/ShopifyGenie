const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductEvent = sequelize.define('ProductEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'product_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ProductEvent;
