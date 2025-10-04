// Kafka utilities for event-driven messaging
import { Kafka, Producer, Consumer, KafkaMessage } from 'kafkajs';

export interface EventMessage {
  eventType: string;
  data: any;
  timestamp: string;
  source: string;
  version: string;
}

export interface OrderCreatedEvent {
  orderId: string;
  orderNumber: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  currency: string;
}

export interface StockAdjustedEvent {
  productId: string;
  quantityAdjusted: number;
  newQuantity: number;
  reason: string;
  orderId?: string;
}

export interface PaymentProcessedEvent {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
}

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();

  constructor() {
    const kafkaBrokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    
    this.kafka = new Kafka({
      clientId: process.env.SERVICE_NAME || 'shopifygenie-service',
      brokers: kafkaBrokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
  }

  async createProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }
    return this.producer;
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    if (!this.consumers.has(groupId)) {
      const consumer = this.kafka.consumer({ groupId });
      await consumer.connect();
      this.consumers.set(groupId, consumer);
    }
    return this.consumers.get(groupId)!;
  }

  async publishEvent(topic: string, event: EventMessage): Promise<void> {
    const producer = await this.createProducer();
    
    await producer.send({
      topic,
      messages: [{
        key: event.data.id || event.data.orderId || Date.now().toString(),
        value: JSON.stringify(event),
        headers: {
          eventType: event.eventType,
          source: event.source,
          version: event.version,
          timestamp: event.timestamp
        }
      }]
    });

    console.log(`Published event ${event.eventType} to topic ${topic}`);
  }

  async subscribeToTopic(
    topic: string, 
    groupId: string, 
    handler: (message: EventMessage) => Promise<void>
  ): Promise<void> {
    const consumer = await this.createConsumer(groupId);
    
    await consumer.subscribe({ topic, fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventMessage: EventMessage = JSON.parse(message.value?.toString() || '{}');
          await handler(eventMessage);
        } catch (error) {
          console.error(`Error processing message from topic ${topic}:`, error);
        }
      }
    });

    console.log(`Subscribed to topic ${topic} with group ${groupId}`);
  }

  async publishOrderCreated(orderData: OrderCreatedEvent): Promise<void> {
    const event: EventMessage = {
      eventType: 'OrderCreated',
      data: orderData,
      timestamp: new Date().toISOString(),
      source: 'order-service',
      version: '1.0'
    };

    await this.publishEvent('order-events', event);
  }

  async publishStockAdjusted(stockData: StockAdjustedEvent): Promise<void> {
    const event: EventMessage = {
      eventType: 'StockAdjusted',
      data: stockData,
      timestamp: new Date().toISOString(),
      source: 'product-service',
      version: '1.0'
    };

    await this.publishEvent('inventory-events', event);
  }

  async publishPaymentProcessed(paymentData: PaymentProcessedEvent): Promise<void> {
    const event: EventMessage = {
      eventType: 'PaymentProcessed',
      data: paymentData,
      timestamp: new Date().toISOString(),
      source: 'order-service',
      version: '1.0'
    };

    await this.publishEvent('payment-events', event);
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
    
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
    
    this.consumers.clear();
  }
}

// Singleton instance
export const kafkaService = new KafkaService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Kafka connections...');
  await kafkaService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Kafka connections...');
  await kafkaService.disconnect();
  process.exit(0);
});
