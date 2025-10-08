const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

let producer = null;

const initProducer = async () => {
  try {
    if (!process.env.KAFKA_BROKER || process.env.KAFKA_BROKER === 'localhost:9092') {
      logger.info('📡 Kafka not configured - running in standalone mode');
      return null;
    }

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'sales-service',
      brokers: [process.env.KAFKA_BROKER]
    });

    producer = kafka.producer();
    await producer.connect();
    logger.info('✅ Kafka producer connected successfully');
    return producer;
  } catch (error) {
    logger.error('❌ Kafka producer connection failed:', error.message);
    return null;
  }
};

const publishSaleCompleted = async (saleData) => {
  if (!producer) {
    logger.warn('⚠️  Kafka producer not available - skipping event publish');
    return;
  }

  try {
    await producer.send({
      topic: 'sales.completed',
      messages: [{
        key: saleData.id.toString(),
        value: JSON.stringify({
          sale_id: saleData.id,
          product_id: saleData.product_id,
          product_name: saleData.product_name,
          quantity: saleData.quantity,
          total: parseFloat(saleData.total),
          date: saleData.date,
          timestamp: new Date().toISOString()
        })
      }]
    });
    logger.info(`📤 Published sales.completed event for sale ${saleData.id}`);
  } catch (error) {
    logger.error('❌ Failed to publish sales.completed event:', error.message);
  }
};

const disconnectProducer = async () => {
  if (producer) {
    await producer.disconnect();
    logger.info('🔌 Kafka producer disconnected');
  }
};

module.exports = {
  initProducer,
  publishSaleCompleted,
  disconnectProducer
};
