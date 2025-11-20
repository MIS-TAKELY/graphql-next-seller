// app/api/notifications/read/route.ts
import { prisma } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { userId: clerkId } = auth();
  if (!clerkId) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return new Response("Not found", { status: 404 });

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  return Response.json({ success: true });
}
