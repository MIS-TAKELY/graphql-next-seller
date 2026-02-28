import redisConfig from "@/config/redis";

export async function setCache(key: string, value: any, ttlSeconds = 3600) {
  if (!redisConfig.redis) throw new Error("Redis not initialized");
  await redisConfig.redis.setex(key, ttlSeconds, typeof value === 'string' ? value : JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisConfig.redis) return null;
  const data = await redisConfig.redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function delCache(key: string) {
  if (!redisConfig.redis) return;
  await redisConfig.redis.del(key);
}
