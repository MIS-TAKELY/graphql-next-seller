// import { prisma } from "@/lib/db/prisma";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextRequest } from "next/server";

// export interface GraphQLContext {
//   prisma: typeof prisma;
//   user?: {
//     id: string;
//     clerkId: string;
//     email: string;
//     role: string;
//   } | null;
// }

// export async function createContext(request: NextRequest): Promise<GraphQLContext> {
//   try {
//     const { userId } = await getAuth(request);

//     let user = null;
//     if (userId) {
//       user = await prisma.user.findUnique({
//         where: { clerkId: userId },
//         select: {
//           id: true,
//           clerkId: true,
//           email: true,
//           role: true,
//         },
//       });
//     }

//     return {
//       prisma,
//       user,
//     };
//   } catch (error) {
//     console.error("Error creating GraphQL context:", error);
//     return {
//       prisma,
//       user: null,
//     };
//   }
// }


import redisConfig from "@/config/redis";
import { prisma } from "@/lib/db/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export interface GraphQLContext {
  prisma: typeof prisma;
  user?: { id: string; clerkId: string; email: string; role: string } | null;
  publish: (evt: {
    type: string;
    payload: unknown;
    room?: string;
  }) => Promise<void>;
}

// ... (your existing imports)

export async function createContext(
  request: NextRequest
): Promise<GraphQLContext> {
  try {
    const { userId } = await getAuth(request);
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, clerkId: true, email: true, role: true },
      });
    }

    return {
      prisma,
      user,
      publish: async (evt) => {
        if (!redisConfig.publisher) {
          console.warn("Publisher not available; event not sent:", evt);
          return;
        }
        await redisConfig.publisher.publish("events", JSON.stringify(evt));
      },
    };
  } catch (error) {
    console.error("Error creating GraphQL context:", error);
    return {
      prisma,
      user: null,
      publish: async () => {},
    };
  }
}
