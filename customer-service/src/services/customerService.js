const { Customer, CustomerEvent, LoyaltyTier } = require('../models');
const { getTierFromPoints, checkTierUpgrade, calculatePoints } = require('./loyaltyService');
const logger = require('../config/logger');

// Create customer
const createCustomer = async (customerData) => {
  try {
    const customer = await Customer.create(customerData);
    
    // Log event
    await CustomerEvent.create({
      event_type: 'customer.registered',
      customer_id: customer.id,
      payload: { customer: customer.toJSON() }
    });
    
    logger.info(`✅ Customer created: ${customer.id} - ${customer.name}`);
    return customer;
  } catch (error) {
    logger.error('Error creating customer:', error);
    throw error;
  }
};

// Get all customers
const getAllCustomers = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }
    
    if (filters.tier) {
      where.tier = filters.tier;
    }
    
    const customers = await Customer.findAll({ where, order: [['created_at', 'DESC']] });
    return customers;
  } catch (error) {
    logger.error('Error fetching customers:', error);
    throw error;
  }
};

// Get customer by ID
const getCustomerById = async (id) => {
  try {
    const customer = await Customer.findByPk(id, {
      include: [{ model: CustomerEvent, as: 'events' }]
    });
    return customer;
  } catch (error) {
    logger.error(`Error fetching customer ${id}:`, error);
    throw error;
  }
};

// Update customer
const updateCustomer = async (id, updateData) => {
  try {
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    await customer.update(updateData);
    
    // Log event
    await CustomerEvent.create({
      event_type: 'customer.updated',
      customer_id: customer.id,
      payload: { updates: updateData }
    });
    
    logger.info(`✅ Customer updated: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error(`Error updating customer ${id}:`, error);
    throw error;
  }
};

// Deactivate customer
const deactivateCustomer = async (id) => {
  try {
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    await customer.update({ is_active: false });
    
    // Log event
    await CustomerEvent.create({
      event_type: 'customer.deactivated',
      customer_id: customer.id,
      payload: { deactivated_at: new Date() }
    });
    
    logger.info(`✅ Customer deactivated: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error(`Error deactivating customer ${id}:`, error);
    throw error;
  }
};

// Add points to customer (from sales)
const addPointsToCustomer = async (customerId, saleAmount) => {
  try {
    const customer = await Customer.findByPk(customerId);
    
    if (!customer) {
      logger.warn(`Customer ${customerId} not found for points addition`);
      return null;
    }
    
    const pointsToAdd = calculatePoints(saleAmount);
    const oldPoints = customer.points;
    const newPoints = oldPoints + pointsToAdd;
    
    // Check for tier upgrade
    const tierCheck = checkTierUpgrade(oldPoints, newPoints);
    const newTier = getTierFromPoints(newPoints);
    
    await customer.update({
      points: newPoints,
      tier: newTier
    });
    
    // Log event
    await CustomerEvent.create({
      event_type: 'points.added',
      customer_id: customer.id,
      payload: {
        points_added: pointsToAdd,
        old_points: oldPoints,
        new_points: newPoints,
        sale_amount: saleAmount
      }
    });
    
    logger.info(`✅ Added ${pointsToAdd} points to customer ${customerId} (${oldPoints} → ${newPoints})`);
    
    return {
      customer,
      pointsAdded: pointsToAdd,
      tierUpgraded: tierCheck.upgraded,
      tierUpgradeInfo: tierCheck
    };
  } catch (error) {
    logger.error(`Error adding points to customer ${customerId}:`, error);
    throw error;
  }
};

// Get customer analytics
const getCustomerAnalytics = async () => {
  try {
    const totalCustomers = await Customer.count();
    const activeCustomers = await Customer.count({ where: { is_active: true } });
    
    // Loyalty distribution
    const tierDistribution = await Customer.findAll({
      attributes: [
        'tier',
        [Customer.sequelize.fn('COUNT', Customer.sequelize.col('id')), 'count']
      ],
      group: ['tier']
    });
    
    const distribution = tierDistribution.reduce((acc, item) => {
      acc[item.tier] = parseInt(item.dataValues.count);
      return acc;
    }, {});
    
    return {
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      inactive_customers: totalCustomers - activeCustomers,
      loyalty_distribution: distribution
    };
  } catch (error) {
    logger.error('Error fetching customer analytics:', error);
    throw error;
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
  addPointsToCustomer,
  getCustomerAnalytics
};
