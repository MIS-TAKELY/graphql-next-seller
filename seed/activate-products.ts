// import { prisma } from "../lib/db/prisma";

// async function main() {
//     console.log("Starting product activation...");

//     try {
//         const result = await prisma.product.updateMany({
//             where: {
//                 status: "INACTIVE",
//             },
//             data: {
//                 status: "ACTIVE",
//             },
//         });

//         console.log(`Successfully activated ${result.count} products.`);

//         // Optional: Double check if any INACTIVE products remain
//         const inactiveCount = await prisma.product.count({
//             where: {
//                 status: "INACTIVE"
//             }
//         });

//         if (inactiveCount > 0) {
//             console.warn(`Warning: There are still ${inactiveCount} inactive products remaining.`);
//         } else {
//             console.log("All products are now ACTIVE or DRAFT/DISCONTINUED.");
//         }

//     } catch (error) {
//         console.error("Error activating products:", error);
//         process.exit(1);
//     } finally {
//         await prisma.$disconnect();
//     }
// }

// main();
