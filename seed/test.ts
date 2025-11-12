// import { Redis as UpstashRedis } from "@upstash/redis";
// import Redis from "ioredis";

// let redis: Redis | undefined;
// let publisher: UpstashRedis | undefined;

// try {
//   const REDIS_URL = process.env.REDIS_URL;
//   const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
//   const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

//   if (!REDIS_URL) {
//     console.warn("ioredis URL not available; falling back to local.");
//   }
//   if (!UPSTASH_URL || !UPSTASH_TOKEN) {
//     console.warn("Upstash Redis config missing; publisher won't be available.");
//   }

//   // Use ioredis for subscriber (supports rediss:// for Upstash TLS)
//   redis = new Redis(REDIS_URL || "redis://localhost:6379");

//   redis.on("connect", () => console.log("ioredis connected"));
//   redis.on("error", (err) => console.error("ioredis error:", err));

//   // Use Upstash client for publisher (REST-based, good for serverless)
//   if (UPSTASH_URL && UPSTASH_TOKEN) {
//     publisher = new UpstashRedis({
//       url: UPSTASH_URL,
//       token: UPSTASH_TOKEN,
//     });
//     console.log("Upstash publisher initialized.");
//   }
// } catch (error) {
//   console.error("Error while connecting to Redis:", error);
// }

// export default { redis, publisher };
