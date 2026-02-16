import redisConfig from "@/config/redis";

/**
 * Simple Fixed Window Rate Limiter
 * @param key Unique key (e.g., user IP or ID + action)
 * @param limit Max requests allowed
 * @param windowSeconds Time window in seconds
 * @returns true if allowed, false if limit exceeded
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const redis = redisConfig.redis;
    if (!redis) {
        console.warn("Redis not available for rate limiting - allowing request");
        return true;
    }

    try {
        const usage = await redis.incr(key);
        if (usage === 1) {
            await redis.expire(key, windowSeconds);
        }
        return usage <= limit;
    } catch (error) {
        console.error("Rate limit error:", error);
        return true;
    }
}
