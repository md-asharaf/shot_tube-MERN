import { kafka } from './client.js';

const producer = kafka.producer({
  allowAutoTopicCreation: true, // Automatically create topics if they don't exist
  retry: {
    retries: 5,
    initialRetryTime: 300,
    maxRetryTime: 30000,
  },
  acks: -1,
});

const initProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
    process.exit(1);
  }
};

const publishNotification = async (notification) => {
  try {
    await producer.send({
      topic: 'notifications',
      messages: [
        { value: JSON.stringify(notification) },
      ],
    });
    console.log('Notification sent to Kafka');
  } catch (error) {
    console.error('Error producing notification to Kafka:', error);
  }
};

export { initProducer, publishNotification };
