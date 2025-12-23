// import { prisma } from "@/lib/db/prisma";

// async function main() {
//     const categories = await prisma.category.findMany();
//     console.log(`Total categories: ${categories.length}`);
//     console.log("Categories:", categories.map(c => c.name));

//     const staples = await prisma.category.findUnique({ where: { name: "Pantry Staples" } });
//     console.log("Pantry Staples exists:", !!staples);
// }

// main()
//     .catch(console.error)
//     .finally(() => prisma.$disconnect());
