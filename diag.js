const { PrismaClient } = require("./app/generated/prisma");
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            take: 5,
            include: {
                variants: true,
            },
        });
        console.log("Recent products:", JSON.stringify(products, null, 2));

        const productCount = await prisma.product.count();
        console.log("Total products in DB:", productCount);

        const sellers = await prisma.user.findMany({
            where: {
                products: {
                    some: {}
                }
            },
            select: {
                id: true,
                email: true,
                roles: {
                    select: { role: true }
                }
            }
        });
        console.log("Sellers with products:", JSON.stringify(sellers, null, 2));

    } catch (err) {
        console.error("Diagnostic failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
