import { PrismaClient } from "@prisma/client";

const prismaSource = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://b9810fabc2bf4098a6299d7173e135074b80787edf03f802b819b8c840645dc6:sk_-5pGHxWXb6EUaCC_9oCvB@db.prisma.io:5432/postgres?sslmode=require&pool=true",
    },
  },
});

const prismaTarget = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_Qdie4mSFf6xl@ep-floral-wave-a1o010gf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
  },
});

async function migrate() {
  // Example for one table
  const users = await prismaSource.user.findMany();
  for (const user of users) {
    await prismaTarget.user.create({ data: user });
  }
  console.log("Migration complete!");
}

migrate().finally(() => {
  prismaSource.$disconnect();
  prismaTarget.$disconnect();
});
