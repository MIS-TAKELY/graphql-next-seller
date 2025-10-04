// src/services/cache.service.ts

import redis from "@/config/redis";

export async function setCache(key: string, value: any, ttlSeconds = 3600) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function delCache(key: string) {
  await redis.del(key);
}
