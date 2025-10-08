const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoyaltyTier = sequelize.define('LoyaltyTier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  min_points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_points: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  discount_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'loyalty_tiers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LoyaltyTier;
