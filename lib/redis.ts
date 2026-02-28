const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisClient: any;

if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    const IORedis = require("ioredis");
    redisClient = new IORedis(REDIS_URL);
} else {
    // Edge runtime fallback
    redisClient = {
        get: async () => null,
        set: async () => { },
        setex: async () => { },
        del: async () => { },
    } as any;
}

export const redis = redisClient;
