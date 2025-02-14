import Redis from "ioredis"
const serviceUri = process.env.REDIS_URI;
const client = new Redis(serviceUri)

export const setCache = async (key, value, ttl = 1800) => {
    try {
        await client.setex(key, ttl, JSON.stringify(value));
    } catch (err) {
        console.error('Error setting cache in Redis:', err.message);
    }
};

export const getCache = async (key) => {
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Error getting cache from Redis:', err.message);
        return null;
    }
};
export const deleteAllCache = async () => {
    try {
        await client.flushall();
        console.log("All cache deleted successfully.");
    } catch (err) {
        console.error("Error deleting cache:", err);
    }
};
