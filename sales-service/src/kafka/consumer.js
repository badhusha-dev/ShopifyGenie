const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

let consumer = null;

const initConsumer = async () => {
  try {
    if (!process.env.KAFKA_BROKER || process.env.KAFKA_BROKER === 'localhost:9092') {
      logger.info('📡 Kafka consumer not configured - skipping');
      return null;
    }

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'sales-service',
      brokers: [process.env.KAFKA_BROKER]
    });

    consumer = kafka.consumer({ groupId: 'sales-service-group' });
    await consumer.connect();
    
    await consumer.subscribe({ topic: 'product.updated', fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value.toString());
        logger.info(`📥 Received ${topic} event:`, payload);
        
        // Handle product updates (e.g., cache product info)
        if (topic === 'product.updated') {
          // Future: Update local product cache
        }
      }
    });

    logger.info('✅ Kafka consumer started successfully');
    return consumer;
  } catch (error) {
    logger.error('❌ Kafka consumer connection failed:', error.message);
    return null;
  }
};

const disconnectConsumer = async () => {
  if (consumer) {
    await consumer.disconnect();
    logger.info('🔌 Kafka consumer disconnected');
  }
};

module.exports = {
  initConsumer,
  disconnectConsumer
};
