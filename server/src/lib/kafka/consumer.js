import { kafka } from './client.js';
import { insertNotifications } from '../../db/index.js';
import { sendNotificationToUser } from '../../lib/web-socket.js';

const backendConsumer = kafka.consumer({
  groupId: 'backend-group', sessionTimeout: 30000,
  heartbeatInterval: 2000
});
const webSocketConsumer = kafka.consumer({
  groupId: 'websocket-group', sessionTimeout: 30000,
  heartbeatInterval: 2000
});

export const initConsumers = async () => {
  try {
    await backendConsumer.connect();
    await webSocketConsumer.connect();
    console.log('Consumers connected to Kafka');

    await backendConsumer.subscribe({ topic: 'notifications', fromBeginning: false });
    await webSocketConsumer.subscribe({ topic: 'notifications', fromBeginning: false });
    console.log('Consumers subscribed to notifications topic');

    await backendConsumer.run({
      eachBatch: async ({ batch }) => {
        try {
          const notifications = batch.messages.map((message) => JSON.parse(message.value.toString()));
          await insertNotifications(notifications);
          console.log('Notifications stored in database');
        } catch (error) {
          console.error('Error processing notifications for backend:', error);
        }
      },
    });

    await webSocketConsumer.run({
      eachMessage: async ({ message }) => {
        try {
          const notification = JSON.parse(message.value.toString());
          const { userId, ...rest } = notification;
          sendNotificationToUser(userId, rest);
        } catch (error) {
          console.error('Error sending notification to user via WebSocket:', error);
        }
      },
    });

  } catch (error) {
    console.error('Error during consumer initialization:', error);
    process.exit(1);
  }
};
