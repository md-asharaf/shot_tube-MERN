import Redis from "ioredis"
const serviceUri = "redis://default:fPGg5EFmFVTuLWxemeOO8jKwiwQVsRyj@redis-19058.c305.ap-south-1-1.ec2.redns.redis-cloud.com:19058"
const client = new Redis(process.env.REDIS_URI)

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
