const Customer = require('./Customer');
const LoyaltyTier = require('./LoyaltyTier');
const CustomerEvent = require('./CustomerEvent');

// Define associations
Customer.hasMany(CustomerEvent, { foreignKey: 'customer_id', as: 'events' });
CustomerEvent.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

module.exports = {
  Customer,
  LoyaltyTier,
  CustomerEvent
};
