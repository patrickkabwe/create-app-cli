import IORedis from 'ioredis';

export const REDIS_CONNECTION = new IORedis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
})
