import { Redis as UpstashRedis } from "@upstash/redis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: any;

if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    const IORedis = require("ioredis");
    redisClient = new IORedis(REDIS_URL);
} else {
    redisClient = new UpstashRedis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
}

export const redis = redisClient;
