import { kafka } from './client.js';
import { insertNotifications } from '../../db/index.js';
import { sendNotificationToUser } from '../../lib/web-socket.js';

const backendConsumer = kafka.consumer({ groupId: 'backend-group' });
const webSocketConsumer = kafka.consumer({ groupId: 'websocket-group' });

export const initConsumers = async () => {
  try {
    await backendConsumer.connect();
    await webSocketConsumer.connect();
    console.log('Consumers connected to Kafka');

    await backendConsumer.subscribe({ topic: 'notifications' });
    await webSocketConsumer.subscribe({ topic: 'notifications' });
    console.log('Consumers subscribed to notifications topic');

    await backendConsumer.run({
      eachBatch: async ({ batch, heartbeat, commitOffsetsIfNecessary }) => {
        try {
          const notifications = batch.messages.map((message) => JSON.parse(message.value.toString()));
          console.log('Received batch of notifications:', notifications);

          await insertNotifications(notifications);
          console.log('Notifications stored in database');

          await commitOffsetsIfNecessary();
        } catch (error) {
          console.error('Error processing notifications for backend:', error);
        }
      },
    });

    await webSocketConsumer.run({
      eachMessage: async ({ message, heartbeat, commitOffsetsIfNecessary }) => {
        try {
          const notification = JSON.parse(message.value.toString());
          const { userId, ...rest } = notification;
          console.log(`Sending notification to user ${userId}:`, rest);

          sendNotificationToUser(userId, rest);

          await commitOffsetsIfNecessary();
        } catch (error) {
          console.error('Error sending notification to user via WebSocket:', error);
        }
      },
    });

    return { backendConsumer, webSocketConsumer };
  } catch (error) {
    console.error('Error during consumer initialization:', error);
    process.exit(1);
  }
};
