const { Sale } = require('../models');
const logger = require('./logger');

const sampleSales = [
  { product_id: '1', product_name: 'Wireless Mouse', quantity: 2, price: 29.99, date: '2025-10-01' },
  { product_id: '4', product_name: 'Mechanical Keyboard', quantity: 1, price: 89.99, date: '2025-10-01' },
  { product_id: '2', product_name: 'USB-C Cable', quantity: 5, price: 15.99, date: '2025-10-02' },
  { product_id: '3', product_name: 'Laptop Stand', quantity: 1, price: 45.00, date: '2025-10-03' },
  { product_id: '1', product_name: 'Wireless Mouse', quantity: 3, price: 29.99, date: '2025-10-04' },
  { product_id: '5', product_name: 'Desk Organizer', quantity: 2, price: 19.99, date: '2025-10-05' },
  { product_id: '4', product_name: 'Mechanical Keyboard', quantity: 1, price: 89.99, date: '2025-10-06' },
  { product_id: '2', product_name: 'USB-C Cable', quantity: 10, price: 15.99, date: '2025-10-07' },
  { product_id: '1', product_name: 'Wireless Mouse', quantity: 1, price: 29.99, date: '2025-10-08' },
  { product_id: '3', product_name: 'Laptop Stand', quantity: 2, price: 45.00, date: '2025-10-08' }
];

async function seedSales() {
  try {
    const count = await Sale.count();
    
    if (count > 0) {
      logger.info('ℹ️  Sales already exist, skipping seed');
      return;
    }

    const salesToCreate = sampleSales.map(sale => ({
      ...sale,
      total: (sale.quantity * sale.price).toFixed(2)
    }));

    await Sale.bulkCreate(salesToCreate);
    logger.info(`✅ Sample sales seeded successfully (${salesToCreate.length} records)`);
  } catch (error) {
    logger.error('❌ Error seeding sales:', error.message);
  }
}

module.exports = seedSales;
