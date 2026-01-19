import { prisma } from "./lib/db/prisma";

async function test() {
    try {
        const count = await prisma.product.count();
        console.log("Product count:", count);

        const products = await prisma.product.findMany({
            take: 1,
            include: {
                variants: true,
            }
        });
        console.log("One product:", JSON.stringify(products, null, 2));
    } catch (e) {
        console.error("Prisma test failed:", e);
    } finally {
        process.exit();
    }
}

test();
