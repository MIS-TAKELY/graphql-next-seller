// /api/realtime/route.tsx
import { realtime } from "@/lib/realtime"; // Adjust path if needed
import { handle } from "@upstash/realtime";

export const maxDuration = 300;

export const GET = handle({ realtime });

