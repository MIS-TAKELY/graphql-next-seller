import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redis: any;
let publisher: any;

try {
  if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    const IORedis = require("ioredis");
    redis = new IORedis(REDIS_URL);
    publisher = new IORedis(REDIS_URL);
    redis.on("connect", () => console.log("ioredis connected"));
    redis.on("error", (err: any) => console.error("ioredis error:", err));
  } else {
    // Edge runtime fallback
    redis = {
      get: async () => null,
      set: async () => { },
      setex: async () => { },
      del: async () => { },
      on: () => { },
    } as any;
    publisher = redis;
  }
} catch (error) {
  console.error("Error while connecting to Redis:", error);
}

export default { redis, publisher };
