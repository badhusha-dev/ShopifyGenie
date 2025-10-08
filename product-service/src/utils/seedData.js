const { Product } = require('../models');
const logger = require('../config/logger');

const sampleProducts = [
  {
    name: 'Wireless Mouse',
    category: 'Electronics',
    sku: 'MOUSE-001',
    price: 29.99,
    stock: 150,
    low_stock_threshold: 20
  },
  {
    name: 'USB-C Cable',
    category: 'Accessories',
    sku: 'CABLE-USB-C',
    price: 15.99,
    stock: 8,
    low_stock_threshold: 10
  },
  {
    name: 'Laptop Stand',
    category: 'Office',
    sku: 'STAND-LAP-01',
    price: 45.00,
    stock: 35,
    low_stock_threshold: 15
  },
  {
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    sku: 'KB-MECH-RGB',
    price: 89.99,
    stock: 5,
    low_stock_threshold: 10
  },
  {
    name: 'Desk Organizer',
    category: 'Office',
    sku: 'ORG-DESK-01',
    price: 19.99,
    stock: 50,
    low_stock_threshold: 10
  }
];

const seedProducts = async () => {
  try {
    const count = await Product.count();
    if (count === 0) {
      await Product.bulkCreate(sampleProducts);
      logger.info('✅ Sample products seeded successfully');
    } else {
      logger.info('ℹ️  Products already exist, skipping seed');
    }
  } catch (error) {
    logger.error(`❌ Error seeding products: ${error.message}`);
  }
};

module.exports = { seedProducts };
