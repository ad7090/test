//-------------------------------start imports-----------------------------
import Redis from 'ioredis';
//-------------------------------end imports-------------------------------
//-------------------------------start code-------------------------------

export const redisClient = new Redis(process.env.REDIS_SERVER!, { db: 1 });
