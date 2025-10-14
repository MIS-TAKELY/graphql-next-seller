import { realtime } from "@/lib/realtime"; // Adjust path if needed
import { handle } from "@upstash/realtime";

// Optional: Custom max duration for serverless (e.g., Vercel)
export const maxDuration = 300;

export const GET = handle({ realtime });

// Optional: Add auth middleware if needed
// export const GET = handle({
//   realtime,
//   middleware: async ({ request, channel }) => {
//     // Example: Auth check
//     const user = await getCurrentUser(request); // Your auth logic
//     if (channel !== user?.id) {
//       return new Response("Unauthorized", { status: 401 });
//     }
//   },
// });
