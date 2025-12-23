// app/api/notifications/read/route.ts
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return Response.json({ success: true });
}
