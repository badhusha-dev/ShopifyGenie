const Product = require('./Product');
const ProductEvent = require('./ProductEvent');

const syncDatabase = async () => {
  try {
    await Product.sync({ alter: true });
    await ProductEvent.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error.message);
    throw error;
  }
};

module.exports = {
  Product,
  ProductEvent,
  syncDatabase
};
