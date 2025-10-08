const { Kafka } = require('kafkajs');
const logger = require('../config/logger');
const { Product, ProductEvent } = require('../models');

let consumer = null;

const initConsumer = async () => {
  if (!process.env.KAFKA_BROKER || process.env.KAFKA_BROKER === 'localhost:9092') {
    logger.info('📡 Kafka consumer not configured - skipping');
    return null;
  }

  try {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'product-service',
      brokers: [process.env.KAFKA_BROKER]
    });

    consumer = kafka.consumer({ groupId: 'product-service-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'inventory.adjusted', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        logger.info(`📥 Received event from ${topic}:`, event);

        // Handle inventory adjustment
        if (event.type === 'inventory.adjusted' && event.productId) {
          try {
            const product = await Product.findByPk(event.productId);
            if (product) {
              await product.update({ stock: event.newStock });
              logger.info(`✅ Updated product ${event.productId} stock to ${event.newStock}`);

              // Log event
              await ProductEvent.create({
                event_type: 'inventory.adjusted',
                product_id: event.productId,
                payload: event
              });
            }
          } catch (error) {
            logger.error(`❌ Error processing inventory adjustment: ${error.message}`);
          }
        }
      }
    });

    logger.info('✅ Kafka consumer started successfully');
    return consumer;
  } catch (error) {
    logger.error(`❌ Kafka consumer initialization failed: ${error.message}`);
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
