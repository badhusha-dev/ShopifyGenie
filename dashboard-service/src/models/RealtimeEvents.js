const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RealtimeEvents = sequelize.define('RealtimeEvents', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  eventSource: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  eventData: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  processedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'realtime_events',
  timestamps: true
});

module.exports = RealtimeEvents;
