import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  enableReadyCheck: true,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

export { redis };
export default redis;