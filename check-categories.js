const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
    console.log("🔍 Checking all categories in database...\n");

    const allCategories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            parentId: true,
            isActive: true,
        },
        orderBy: {
            name: 'asc'
        }
    });

    console.log(`Total categories in database: ${allCategories.length}\n`);

    const rootCategories = allCategories.filter(c => c.parentId === null);
    const subCategories = allCategories.filter(c => c.parentId !== null);

    console.log(`Root categories (parentId = null): ${rootCategories.length}`);
    console.log(`Subcategories (parentId != null): ${subCategories.length}\n`);

    console.log("Root Categories:");
    rootCategories.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id}, Active: ${cat.isActive})`);
    });

    console.log("\nSubcategories:");
    subCategories.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id}, Parent: ${cat.parentId}, Active: ${cat.isActive})`);
    });

    await prisma.$disconnect();
}

checkCategories().catch(console.error);
