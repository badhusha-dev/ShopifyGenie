const { Kafka } = require('kafkajs');
const logger = require('../config/logger');

let producer = null;
let isConnected = false;

const initProducer = async () => {
  try {
    if (!process.env.KAFKA_BROKER) {
      logger.warn('⚠️  KAFKA_BROKER not configured - producer disabled');
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

    producer = kafka.producer();
    await producer.connect();
    isConnected = true;
    logger.info('✅ Kafka producer connected');
    
    return producer;
  } catch (error) {
    logger.error('❌ Kafka producer error:', error.message);
    producer = null;
    isConnected = false;
    return null;
  }
};

const publishEvent = async (topic, message) => {
  try {
    if (!producer || !isConnected) {
      logger.warn(`⚠️  Kafka producer not available - skipping event publish to ${topic}`);
      return false;
    }

    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
          timestamp: Date.now().toString()
        }
      ]
    });

    logger.info(`📤 Published event to ${topic}:`, message);
    return true;
  } catch (error) {
    logger.error(`❌ Error publishing to ${topic}:`, error.message);
    return false;
  }
};

const disconnectProducer = async () => {
  if (producer && isConnected) {
    await producer.disconnect();
    logger.info('Kafka producer disconnected');
  }
};

module.exports = {
  initProducer,
  publishEvent,
  disconnectProducer
};
