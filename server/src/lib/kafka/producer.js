import { kafka } from './client.js';

const producer = kafka.producer();

const initProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
    process.exit(1);
  }
  return producer;
};

const publishNotification = async (notification) => {
  try {
    await producer.send({
      topic: 'notifications',
      messages: [
        { value: JSON.stringify(notification) },
      ],
      acks: 1, 
      retries: 5, 
      timeout: 3000,
    });
    console.log('Notification sent to Kafka');
  } catch (error) {
    console.error('Error producing notification to Kafka', error);
  }
};

export { initProducer, publishNotification };
