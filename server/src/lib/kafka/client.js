import { Kafka } from 'kafkajs';

const BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
export const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [BROKER],
});
