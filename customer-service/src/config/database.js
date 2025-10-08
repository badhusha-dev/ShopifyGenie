const { Sequelize } = require('sequelize');
const logger = require('./logger');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/customerdb', {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully.');
    
    await sequelize.sync({ alter: false });
    logger.info('✅ Database models synchronized.');
    
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error);
    return false;
  }
};

module.exports = { sequelize, connectDB };
