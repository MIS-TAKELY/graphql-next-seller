import { prisma } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type ProfileSetupLayoutProps = {
  children: ReactNode;
};

export default async function ProfileSetupLayout({
  children,
}: ProfileSetupLayoutProps) {
  noStore();

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  console.log("userId-->",userId)
  
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
    },
  });
  
  console.log("dbUser-->",dbUser)
  const sellerProfile = dbUser
    ? await prisma.sellerProfile.findUnique({
        where: { userId: dbUser.id },
        select: { id: true },
      })
    : null;

  if (sellerProfile) {
    redirect("/");
  }

  return <>{children}</>;
}

