// prisma/seed-roles.ts

import { Role } from "@/app/generated/prisma";
import { prisma } from "@/lib/db/prisma";


async function main() {
  console.log("Adding default roles to existing users...");

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  console.log(`Found ${users.length} users`);

  // We'll collect all the UserRole records we want to create/upsert
  const roleOperations = [];

  for (const user of users) {
    // 1. Every user should be a BUYER by default
    roleOperations.push(
      prisma.userRole.upsert({
        where: {
          userId_role: {
            userId: user.id,
            role: Role.BUYER,
          },
        },
        update: {},
        create: {
          userId: user.id,
          role: Role.BUYER,
        },
      })
    );

    // 2. Optional: Make specific users SELLER or ADMIN
    // Example: if you have a known seller or admin by email/clerkId
    // Replace these with actual identifiers from your DB
    const isKnownSeller = false; // set true for specific users
    const isKnownAdmin = false;

    // You can check by email, clerkId, or even firstName for quick testing
    // Example using email (uncomment and adjust):
    /*
    const userDetails = await prisma.user.findUnique({ where: { id: user.id } });
    if (userDetails?.email === "seller@example.com") isKnownSeller = true;
    if (userDetails?.email === "admin@example.com") isKnownAdmin = true;
    */

    if (isKnownSeller) {
      roleOperations.push(
        prisma.userRole.upsert({
          where: {
            userId_role: { userId: user.id, role: Role.SELLER },
          },
          update: {},
          create: { userId: user.id, role: Role.SELLER },
        })
      );
    }

    if (isKnownAdmin) {
      roleOperations.push(
        prisma.userRole.upsert({
          where: {
            userId_role: { userId: user.id, role: Role.ADMIN },
          },
          update: {},
          create: { userId: user.id, role: Role.ADMIN },
        })
      );
    }
  }

  // Execute all upserts in parallel (safe because of unique constraint)
  await Promise.all(roleOperations);

  console.log(`Successfully added default BUYER role to ${users.length} users`);
  console.log("Roles seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
