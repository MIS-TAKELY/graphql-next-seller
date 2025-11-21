// lib/context.ts (or wherever you create context)
import redisConfig from "@/config/redis";
import { prisma } from "@/lib/db/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Updated context type — no more `role: string`
export interface GraphQLContext {
  prisma: typeof prisma;
  user: {
    id: string;
    clerkId: string;
    email: string;
    roles: string[]; // ← Now an array of roles
  } | null;
  publish: (evt: {
    type: string;
    payload: unknown;
    room?: string;
  }) => Promise<void>;
}

export async function createContext(request: NextRequest): Promise<GraphQLContext> {
  try {
    const { userId: clerkId } = await getAuth(request);

    console.log("clerk id--->",clerkId)

    let user = null;

    if (clerkId) {
      // Fetch user + their roles in a single query using Prisma's nested read
      const dbUser = await prisma.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          clerkId: true,
          email: true,
          roles: {
            select: { role: true }, // This pulls from UserRole table
          },
        },
      });

      if (dbUser) {
        user = {
          id: dbUser.id,
          clerkId: dbUser.clerkId,
          email: dbUser.email,
          roles: dbUser.roles.map((r) => r.role), // ← array of roles
        };
      }
    }

    return {
      prisma,
      user,
      publish: async (evt) => {
        if (!redisConfig.publisher) {
          console.warn("Redis publisher not available — event dropped:", evt.type);
          return;
        }
        try {
          await redisConfig.publisher.publish("events", JSON.stringify(evt));
        } catch (err) {
          console.error("Failed to publish event:", err);
        }
      },
    };
  } catch (error) {
    console.error("Error creating GraphQL context:", error);
    return {
      prisma,
      user: null,
      publish: async () => {
        console.warn("Publish called but context failed to initialize");
      },
    };
  }
}