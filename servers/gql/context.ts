// lib/context.ts (or wherever you create context)
import redisConfig from "@/config/redis";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { headers } from "next/headers";

// Simple in-memory cache for user data (TTL: 5 minutes)
const userCache = new Map<string, { user: GraphQLContext['user']; expiresAt: number }>();
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

// Periodic cleanup of expired entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;
    for (const [key, value] of userCache.entries()) {
      if (value.expiresAt < now) {
        userCache.delete(key);
        deletedCount++;
      }
    }
    // Also limit cache size if too large
    if (userCache.size > MAX_CACHE_SIZE) {
      const entriesToDelete = userCache.size - MAX_CACHE_SIZE;
      const keys = Array.from(userCache.keys()).slice(0, entriesToDelete);
      keys.forEach(key => userCache.delete(key));
    }
  }, 60000); // Run every minute
}

function getCachedUser(userId: string): GraphQLContext['user'] | null {
  const cached = userCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }
  userCache.delete(userId);
  return null;
}

function setCachedUser(userId: string, user: GraphQLContext['user']): void {
  // Don't cache if cache is already full
  if (userCache.size >= MAX_CACHE_SIZE) {
    return;
  }
  userCache.set(userId, { user, expiresAt: Date.now() + USER_CACHE_TTL });
}

export interface GraphQLContext {
  prisma: typeof prisma;
  user: {
    id: string;
    email: string;
    roles: string[];
  } | null;
  publish: (evt: {
    type: string;
    payload: unknown;
    room?: string;
  }) => Promise<void>;
}

export async function createContext(): Promise<GraphQLContext> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let user = null;

    if (session?.user) {
      // Check cache first
      const cachedUser = getCachedUser(session.user.id);
      if (cachedUser) {
        user = cachedUser;
      } else {
        // Fetch from database only if not cached
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            email: true,
            roles: {
              select: { role: true },
            },
          },
        });

        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            roles: dbUser.roles.map((r: { role: string }) => r.role),
          };
          // Cache the user
          setCachedUser(session.user.id, user);
        }
      }
    }

    return {
      prisma,
      user,
      publish: async (evt) => {
        if (!redisConfig.publisher) {
          console.warn(
            "Redis publisher not available — event dropped:",
            evt.type
          );
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
