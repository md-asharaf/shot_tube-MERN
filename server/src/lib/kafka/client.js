import { Kafka } from 'kafkajs';

const BROKER = process.env.KAFKA_BROKER;
export const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [BROKER],
});
