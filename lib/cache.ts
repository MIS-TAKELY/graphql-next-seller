import { redis } from "./redis";

export async function getCachedData<T>(key: string): Promise<T | null> {
    try {
        return await redis.get<T>(key);
    } catch (error) {
        console.error(`Redis get error for key ${key}:`, error);
        return null;
    }
}

export async function setCachedData<T>(
    key: string,
    data: T,
    expirationInSeconds: number = 300 // Default 5 minutes
): Promise<void> {
    try {
        await redis.set(key, JSON.stringify(data), { ex: expirationInSeconds });
    } catch (error) {
        console.error(`Redis set error for key ${key}:`, error);
    }
}

export async function invalidateCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`Redis del error for key ${key}:`, error);
    }
}
