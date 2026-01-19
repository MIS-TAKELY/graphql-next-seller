
import { prisma } from "./lib/db/prisma";

async function debugStats() {
    try {
        // Find a seller to test with (since we can't easily get the current session)
        const seller = await prisma.user.findFirst({
            where: {
                roles: {
                    some: { role: "SELLER" }
                }
            }
        });

        if (!seller) {
            console.log("No seller found in database.");
            return;
        }

        console.log(`Debugging stats for seller: ${seller.email} (ID: ${seller.id})`);

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const orderCount = await prisma.sellerOrder.count({
            where: { sellerId: seller.id }
        });
        console.log(`Total SellerOrders: ${orderCount}`);

        const currentMonthOrderCount = await prisma.sellerOrder.count({
            where: {
                sellerId: seller.id,
                createdAt: { gte: currentMonthStart }
            }
        });
        console.log(`Current month SellerOrders: ${currentMonthOrderCount}`);

        const productCount = await prisma.product.count({
            where: { sellerId: seller.id }
        });
        console.log(`Total Products: ${productCount}`);

        const deliveredRevenue = await prisma.sellerOrder.aggregate({
            where: {
                sellerId: seller.id,
                status: "DELIVERED"
            },
            _sum: { total: true }
        });
        console.log(`Delivered Revenue: ${deliveredRevenue._sum.total || 0}`);

        const allRevenue = await prisma.sellerOrder.aggregate({
            where: {
                sellerId: seller.id,
                status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] }
            },
            _sum: { total: true }
        });
        console.log(`All Non-Pending Revenue: ${allRevenue._sum.total || 0}`);

        const recentOrders = await prisma.sellerOrder.findMany({
            where: { sellerId: seller.id },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { order: true }
        });
        console.log("Recent Orders:");
        recentOrders.forEach(so => {
            console.log(`- Order ${so.id}: Status ${so.status}, Total ${so.total}, CreatedAt ${so.createdAt}`);
        });

    } catch (error) {
        console.error("Debug stats error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugStats();
