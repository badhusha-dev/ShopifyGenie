const customerService = require('../services/customerService');
const loyaltyService = require('../services/loyaltyService');
const logger = require('../config/logger');

// Register new customer
const registerCustomer = async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: customer
    });
  } catch (error) {
    logger.error('Error in registerCustomer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering customer'
    });
  }
};

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const { is_active, tier } = req.query;
    const filters = {};
    
    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }
    
    if (tier) {
      filters.tier = tier;
    }
    
    const customers = await customerService.getAllCustomers(filters);
    
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    logger.error('Error in getAllCustomers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customers'
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Error in getCustomerById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customer'
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    logger.error('Error in updateCustomer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating customer'
    });
  }
};

// Deactivate customer
const deactivateCustomer = async (req, res) => {
  try {
    const customer = await customerService.deactivateCustomer(req.params.id);
    
    res.json({
      success: true,
      message: 'Customer deactivated successfully',
      data: customer
    });
  } catch (error) {
    logger.error('Error in deactivateCustomer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deactivating customer'
    });
  }
};

// Get loyalty tiers
const getLoyaltyTiers = async (req, res) => {
  try {
    const tiers = loyaltyService.getAllTiers();
    
    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    logger.error('Error in getLoyaltyTiers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching loyalty tiers'
    });
  }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    const analytics = await customerService.getCustomerAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error in getCustomerAnalytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching analytics'
    });
  }
};

module.exports = {
  registerCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
  getLoyaltyTiers,
  getCustomerAnalytics
};
