import connectDB from "./db/index.js";
import { backendApp } from "./app.js";
import { webSocketServer } from "./lib/web-socket.js";
import { initConsumers } from "./lib/kafka/consumer.js";
import { initProducer } from "./lib/kafka/producer.js"

const BACKEND_PORT = process.env.BACKEND_PORT;
const WEB_SOCKET_PORT = process.env.WEB_SOCKET_PORT;
let consumer1;
let consumer2;
let producer;
const startServers = async () => {
    try {
        await connectDB();
        console.log('Connected to the database');

        backendApp.on('error', (err) => {
            console.error('Backend server error:\n', err);
        });
        backendApp.listen(BACKEND_PORT, () => {
            console.log(`⚙️ Backend server is running at port ${BACKEND_PORT}`);
            webSocketServer.on('error', (err) => {
                console.error('WebSocket server error:\n', err);
            });
            webSocketServer.listen(WEB_SOCKET_PORT, async () => {
                console.log(`WebSocket server running on port ${WEB_SOCKET_PORT}`);
                producer = await initProducer();
                const { backendConsumer, webSocketConsumer } = await initConsumers();
                consumer1 = backendConsumer;
                consumer2 = webSocketConsumer;
            });
        });
    } catch (err) {
        console.error('Error during server startup:\n', err);
    }
};

startServers();

process.on('SIGINT', async () => {
    console.log('Shutting down servers...');

    backendApp.close();
    webSocketServer.close();
    await producer.disconnect();
    await consumer1.disconnect();
    await consumer2.disconnect();

    console.log('All services have been shut down successfully');
    process.exit(0);
});
