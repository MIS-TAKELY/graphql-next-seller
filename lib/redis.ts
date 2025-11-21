import { Redis } from "@upstash/redis";

export const redis = new Redis({
  // Grab these from your Upstash Redis dashboard
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// if(redis){
//   console.log("redis connected for chat-->",redis)
// }
