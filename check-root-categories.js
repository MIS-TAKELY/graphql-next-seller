const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRootCategories() {
    console.log("🔍 Checking ROOT categories only...\n");

    const rootCategories = await prisma.category.findMany({
        where: {
            parentId: null
        },
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

    console.log(`Total ROOT categories (parentId = null): ${rootCategories.length}\n`);

    rootCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   ID: ${cat.id}`);
        console.log(`   Active: ${cat.isActive}`);
        console.log(`   ParentId: ${cat.parentId}\n`);
    });

    await prisma.$disconnect();
}

checkRootCategories().catch(console.error);
