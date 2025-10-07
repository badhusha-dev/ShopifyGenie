const { consumer } = require('../config/kafka');
const dashboardService = require('../services/dashboardService');
const logger = require('../config/logger');

const topics = [
  'sales.completed',
  'inventory.updated',
  'customer.registered',
  'transaction.recorded'
];

const startConsumer = async () => {
  try {
    await consumer.connect();
    logger.info('✅ Kafka consumer connected');

    await consumer.subscribe({ 
      topics,
      fromBeginning: false 
    });

    logger.info(`📡 Subscribed to topics: ${topics.join(', ')}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventData = JSON.parse(message.value.toString());
          
          logger.info(`📨 Received Kafka event:`, {
            topic,
            partition,
            offset: message.offset,
            data: eventData
          });

          let eventSource = '';
          switch (topic) {
            case 'sales.completed':
              eventSource = 'sales-service';
              break;
            case 'inventory.updated':
              eventSource = 'inventory-service';
              break;
            case 'customer.registered':
              eventSource = 'customer-service';
              break;
            case 'transaction.recorded':
              eventSource = 'accounting-service';
              break;
          }

          await dashboardService.processEvent(topic, eventSource, eventData);
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}:`, error);
        }
      }
    });
  } catch (error) {
    logger.error('Error starting Kafka consumer:', error);
    
    setTimeout(() => {
      logger.info('Retrying Kafka consumer connection...');
      startConsumer();
    }, 5000);
  }
};

const stopConsumer = async () => {
  try {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  } catch (error) {
    logger.error('Error disconnecting Kafka consumer:', error);
  }
};

module.exports = { startConsumer, stopConsumer };
