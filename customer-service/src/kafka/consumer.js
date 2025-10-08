const { Kafka } = require('kafkajs');
const customerService = require('../services/customerService');
const { publishEvent } = require('./producer');
const logger = require('../config/logger');

let consumer = null;
let isConnected = false;

const initConsumer = async () => {
  try {
    if (!process.env.KAFKA_BROKER) {
      logger.warn('⚠️  KAFKA_BROKER not configured - consumer disabled');
      return null;
    }

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'customer-service',
      brokers: [process.env.KAFKA_BROKER],
      retry: {
        initialRetryTime: 100,
        retries: 3
      }
    });

    consumer = kafka.consumer({ groupId: 'customer-service-group' });
    await consumer.connect();
    isConnected = true;
    
    // Subscribe to sales.completed topic
    await consumer.subscribe({ topic: 'sales.completed', fromBeginning: false });
    
    logger.info('✅ Kafka consumer connected and subscribed to sales.completed');

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          logger.info(`📥 Received event from ${topic}:`, data);

          if (topic === 'sales.completed') {
            await handleSalesCompleted(data);
          }
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      }
    });

    return consumer;
  } catch (error) {
    logger.error('❌ Kafka consumer error:', error.message);
    consumer = null;
    isConnected = false;
    return null;
  }
};

const handleSalesCompleted = async (saleData) => {
  try {
    const { customer_id, total } = saleData;
    
    if (!customer_id) {
      logger.warn('Sale event missing customer_id - skipping loyalty points');
      return;
    }

    // Add points to customer
    const result = await customerService.addPointsToCustomer(customer_id, parseFloat(total));
    
    if (result && result.tierUpgraded) {
      // Publish tier upgrade event
      await publishEvent('customer.tier-upgraded', {
        customer_id: result.customer.id,
        customer_name: result.customer.name,
        old_tier: result.tierUpgradeInfo.oldTier,
        new_tier: result.tierUpgradeInfo.newTier,
        points: result.customer.points,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`🎉 Customer ${customer_id} upgraded to ${result.tierUpgradeInfo.newTier}`);
    }
  } catch (error) {
    logger.error('Error handling sales.completed event:', error);
  }
};

const disconnectConsumer = async () => {
  if (consumer && isConnected) {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  }
};

module.exports = {
  initConsumer,
  disconnectConsumer
};
