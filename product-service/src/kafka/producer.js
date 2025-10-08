const { Kafka } = require('kafkajs');
const logger = require('../config/logger');

let producer = null;
let isConnected = false;

const initProducer = async () => {
  if (!process.env.KAFKA_BROKER || process.env.KAFKA_BROKER === 'localhost:9092') {
    logger.info('📡 Kafka not configured - running in standalone mode');
    return null;
  }

  try {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'product-service',
      brokers: [process.env.KAFKA_BROKER]
    });

    producer = kafka.producer();
    await producer.connect();
    isConnected = true;
    logger.info('✅ Kafka producer connected successfully');
    return producer;
  } catch (error) {
    logger.error(`❌ Kafka producer connection failed: ${error.message}`);
    return null;
  }
};

const publishEvent = async (topic, event) => {
  if (!producer || !isConnected) {
    logger.warn(`⚠️  Kafka not connected - event logged only: ${event.type}`);
    return;
  }

  try {
    await producer.send({
      topic,
      messages: [
        {
          key: event.productId?.toString() || 'system',
          value: JSON.stringify(event)
        }
      ]
    });
    logger.info(`📤 Published event to ${topic}: ${event.type}`);
  } catch (error) {
    logger.error(`❌ Failed to publish event: ${error.message}`);
  }
};

const disconnectProducer = async () => {
  if (producer && isConnected) {
    await producer.disconnect();
    isConnected = false;
    logger.info('🔌 Kafka producer disconnected');
  }
};

module.exports = {
  initProducer,
  publishEvent,
  disconnectProducer
};
