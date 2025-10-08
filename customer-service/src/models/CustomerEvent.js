const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerEvent = sequelize.define('CustomerEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'customer_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CustomerEvent;
