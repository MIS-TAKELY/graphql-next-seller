// app/api/notifications/route.ts
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return Response.json({ notifications, unreadCount });
}