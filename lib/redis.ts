import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return 'redis://localhost:6379';
};

// Singleton pattern untuk menghindari multiple connection di Next.js (terutama saat dev mode)
// @ts-ignore
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
