const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            categoryId: true,
            category: {
                select: { id: true, name: true }
            }
        }
    });

    console.log("Recent Products:");
    products.forEach(p => {
        console.log(`Product: ${p.name}`);
        console.log(`  ID: ${p.id}`);
        console.log(`  CategoryID: ${p.categoryId}`);
        console.log(`  Category Relation:`, p.category);
        console.log("---");
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
