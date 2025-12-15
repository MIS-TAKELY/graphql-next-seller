// import { prisma } from "@/lib/db/prisma";

// function slugify(name: string) {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)+/g, "");
// }

// async function createOrGetSeller(
//   email: string,
//   firstName: string = "Seller",
//   lastName: string = "Account"
// ) {
//   let seller = await prisma.user.findUnique({
//     where: { email },
//     include: { roles: true }, // Important: fetch current roles
//   });

//   if (!seller) {
//     seller = await prisma.user.create({
//       data: {
//         clerkId: `clerk_${email.split("@")[0]}_${Date.now()}`,
//         email,
//         firstName,
//         lastName,
//         roles: {
//           create: [
//             {
//               role: "SELLER", // This creates a UserRole entry
//             },
//           ],
//         },
//       },
//       include: { roles: true },
//     });
//     console.log(`Created seller: ${email} with SELLER role`);
//   } else {
//     // Check if user already has SELLER role
//     const hasSellerRole = seller.roles.some((r) => r.role === "SELLER");

//     if (!hasSellerRole && seller) {
//       await prisma.userRole.create({
//         data: {
//           userId: seller.id,
//           role: "SELLER",
//         },
//       });
//       console.log(`Added SELLER role to existing user: ${email}`);
//     }
//   }

//   // Return fresh user with roles
//   return await prisma.user.findUnique({
//     where: { email },
//     include: { roles: true },
//   });
// }


// async function createProduct(
//   input: string,
//   sellerId: string,
//   categoryId: string
// ) {
//   const slug = slugify(input.name);
//   let uniqueSlug = slug;
//   let counter = 1;
//   while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
//     uniqueSlug = `${slug}-${counter}`;
//     counter++;
//   }

//   return await prisma.$transaction(
//     async (tx) => {
//       const newProduct = await tx.product.create({
//         data: {
//           name: input.name,
//           slug: uniqueSlug,
//           description: input.description || "",
//           status: "INACTIVE",
//           categoryId,
//           brand: input.brand || "Generic",
//           sellerId,
//           variants: {
//             create: {
//               sku: input.variants.sku,
//               price: input.variants.price,
//               mrp: input.variants.mrp || input.variants.price,
//               stock: input.variants.stock,
//               attributes: input.variants.attributes || {},
//               isDefault: input.variants.isDefault !== false,
//               specifications:
//                 input.variants.specifications?.length > 0
//                   ? {
//                       create: input.variants.specifications.map((spec) => ({
//                         key: spec.key,
//                         value: spec.value,
//                       })),
//                     }
//                   : undefined,
//             },
//           },
//           images: {
//             create: input.images.map((img, index) => ({
//               url: img.url,
//               altText: img.altText || null,
//               sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
//               mediaType: img.mediaType || "PRIMARY",
//               fileType: img.fileType,
//             })),
//           },
//         },
//       });

//       if (input.deliveryOptions?.length > 0) {
//         await tx.deliveryOption.createMany({
//           data: input.deliveryOptions.map((option) => ({
//             productId: newProduct.id,
//             title: option.title,
//             description: option.description || null,
//             isDefault: option.isDefault || false,
//           })),
//         });
//       }

//       if (input.warranty?.length > 0) {
//         await tx.warranty.createMany({
//           data: input.warranty.map((warranty) => ({
//             productId: newProduct.id,
//             type: warranty.type,
//             duration: warranty.duration || null,
//             unit: warranty.unit || null,
//             description: warranty.description || null,
//           })),
//         });
//       }

//       if (input.returnPolicy?.length > 0) {
//         await tx.returnPolicy.createMany({
//           data: input.returnPolicy.map((policy) => ({
//             productId: newProduct.id,
//             type: policy.type,
//             duration: policy.duration || null,
//             unit: policy.unit || null,
//             conditions: policy.conditions || null,
//           })),
//         });
//       }

//       return newProduct;
//     },
//     { timeout: 30000 }
//   );
// }

// async function main() {
//   const sellers = [
//     await createOrGetSeller("mobile1@test.com", "John", "Doe"),
//     await createOrGetSeller("mobile2@test.com", "Jane", "Smith"),
//     await createOrGetSeller("mobile3@test.com", "Mike", "Johnson"),
//   ];

//   const productsData = [
//     // Add these 10 mobile phones to your productsData array:

//     // Mobile 1: Apple iPhone 15 Pro
//     {
//       name: "Apple iPhone 15 Pro",
//       description: "Pro performance with titanium design and A17 Pro chip",
//       brand: "Apple",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "IPHONE15P-001",
//         price: 1199.99,
//         mrp: 1299.99,
//         stock: 35,
//         attributes: { color: "Natural Titanium", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.1-inch Super Retina XDR" },
//           { key: "Processor", value: "A17 Pro" },
//           {
//             key: "Camera",
//             value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
//           },
//           { key: "Battery", value: "3274 mAh" },
//           { key: "5G", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
//           altText: "iPhone 15 Pro front view",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://images.unsplash.com/photo-1695048064887-b5c86c9e6f3d",
//           altText: "iPhone 15 Pro back view",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "1-2 days", isDefault: true },
//         {
//           title: "Standard Delivery",
//           description: "3-5 days",
//           isDefault: false,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "Apple warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 14,
//           unit: "days",
//           conditions: "Unopened box",
//         },
//       ],
//     },

//     // Mobile 2: OnePlus 11
//     {
//       name: "OnePlus 11 5G",
//       description: "Flagship killer with Hasselblad camera system",
//       brand: "OnePlus",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "ONEPLUS11-001",
//         price: 699.99,
//         mrp: 799.99,
//         stock: 45,
//         attributes: { color: "Titan Black", storage: "128GB" },
//         specifications: [
//           { key: "Display", value: "6.7-inch AMOLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 2" },
//           { key: "RAM", value: "8GB" },
//           { key: "Camera", value: "50MP + 48MP + 32MP" },
//           { key: "Fast Charging", value: "100W SuperVOOC" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1615621126365-1b6c1889e5b5",
//           altText: "OnePlus 11 5G",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "3-5 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "OnePlus warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 10,
//           unit: "days",
//           conditions: "Original packaging",
//         },
//       ],
//     },

//     // Mobile 3: Google Pixel 8 Pro
//     {
//       name: "Google Pixel 8 Pro",
//       description: "AI-powered photography with Tensor G3 chip",
//       brand: "Google",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "PIXEL8PRO-001",
//         price: 999.99,
//         mrp: 1099.99,
//         stock: 30,
//         attributes: { color: "Porcelain", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.7-inch LTPO OLED 120Hz" },
//           { key: "Processor", value: "Google Tensor G3" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP + 48MP + 48MP" },
//           { key: "Battery", value: "5050 mAh" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1598327106026-d9521da90e8f",
//           altText: "Google Pixel 8 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 24,
//           unit: "months",
//           description: "2-year warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 15,
//           unit: "days",
//           conditions: "Unused condition",
//         },
//       ],
//     },

//     // Mobile 4: Xiaomi Mi 13 Pro
//     {
//       name: "Xiaomi Mi 13 Pro",
//       description: "Leica optics with ceramic design",
//       brand: "Xiaomi",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "MI13PRO-001",
//         price: 899.99,
//         mrp: 999.99,
//         stock: 40,
//         attributes: { color: "Ceramic White", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.73-inch AMOLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 2" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP Leica Main" },
//           { key: "Charging", value: "120W HyperCharge" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1611472173362-3f53dbd65d80",
//           altText: "Xiaomi Mi 13 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "4-6 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "Xiaomi warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 7,
//           unit: "days",
//           conditions: "Box seal intact",
//         },
//       ],
//     },

//     // Mobile 5: OPPO Find X6 Pro
//     {
//       name: "OPPO Find X6 Pro",
//       description: "Premium flagship with MariSilicon X imaging NPU",
//       brand: "OPPO",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "OPPOX6PRO-001",
//         price: 849.99,
//         mrp: 949.99,
//         stock: 25,
//         attributes: { color: "Desert Silver", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.82-inch AMOLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 2" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP + 50MP + 50MP Triple" },
//           { key: "Battery", value: "5000 mAh" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1610945415731-6d3e61ff7ddb",
//           altText: "OPPO Find X6 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "OPPO warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT",
//           duration: 10,
//           unit: "days",
//           conditions: "No physical damage",
//         },
//       ],
//     },

//     // Mobile 6: Vivo X90 Pro
//     {
//       name: "Vivo X90 Pro",
//       description: "ZEISS co-engineered imaging system",
//       brand: "Vivo",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "VIVOX90PRO-001",
//         price: 799.99,
//         mrp: 899.99,
//         stock: 30,
//         attributes: { color: "Legendary Black", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.78-inch AMOLED 120Hz" },
//           { key: "Processor", value: "MediaTek Dimensity 9200" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP ZEISS Main" },
//           { key: "Charging", value: "120W FlashCharge" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
//           altText: "Vivo X90 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "3-5 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "Vivo warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 7,
//           unit: "days",
//           conditions: "Unopened",
//         },
//       ],
//     },

//     // Mobile 7: Motorola Edge 40 Pro
//     {
//       name: "Motorola Edge 40 Pro",
//       description: "Curved edge display with 165Hz refresh rate",
//       brand: "Motorola",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "MOTOEDGE40P-001",
//         price: 699.99,
//         mrp: 799.99,
//         stock: 35,
//         attributes: { color: "Interstellar Black", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.67-inch pOLED 165Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 2" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP + 50MP + 12MP" },
//           { key: "Battery", value: "4600 mAh" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609692814858-f84b5ba7f493",
//           altText: "Motorola Edge 40 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "4-6 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "Motorola warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 10,
//           unit: "days",
//           conditions: "Original condition",
//         },
//       ],
//     },

//     // Mobile 8: Nothing Phone (2)
//     {
//       name: "Nothing Phone (2)",
//       description: "Transparent design with Glyph Interface",
//       brand: "Nothing",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "NOTHING2-001",
//         price: 599.99,
//         mrp: 699.99,
//         stock: 50,
//         attributes: { color: "White", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.7-inch OLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8+ Gen 1" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP + 50MP Dual" },
//           { key: "Glyph Lights", value: "33 LED strips" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1659080446312-1e646b3ea3a4",
//           altText: "Nothing Phone 2",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "Nothing warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 15,
//           unit: "days",
//           conditions: "Sealed box",
//         },
//       ],
//     },

//     // Mobile 9: ASUS ROG Phone 7
//     {
//       name: "ASUS ROG Phone 7 Ultimate",
//       description: "Ultimate gaming phone with AeroActive Cooler",
//       brand: "ASUS",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "ROGPHONE7U-001",
//         price: 1299.99,
//         mrp: 1399.99,
//         stock: 20,
//         attributes: { color: "Phantom Black", storage: "512GB" },
//         specifications: [
//           { key: "Display", value: "6.78-inch AMOLED 165Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 2" },
//           { key: "RAM", value: "16GB" },
//           { key: "Camera", value: "50MP Triple Camera" },
//           { key: "Battery", value: "6000 mAh" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1635404226305-d3a985e18535",
//           altText: "ASUS ROG Phone 7",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "1-2 days", isDefault: true },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 24,
//           unit: "months",
//           description: "2-year gaming warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT",
//           duration: 7,
//           unit: "days",
//           conditions: "Gaming accessories included",
//         },
//       ],
//     },

//     // Mobile 10: Realme GT 5 Pro
//     {
//       name: "Realme GT 5 Pro",
//       description: "Flagship performance at competitive price",
//       brand: "Realme",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "REALMEGT5P-001",
//         price: 549.99,
//         mrp: 649.99,
//         stock: 60,
//         attributes: { color: "Sunrise Orange", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.74-inch AMOLED 144Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP OIS Main" },
//           { key: "Charging", value: "100W SuperDart" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1611791484624-ad0a52c78c48",
//           altText: "Realme GT 5 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "3-5 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "Realme warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 10,
//           unit: "days",
//           conditions: "Complete accessories",
//         },
//       ],
//     },
//         // Mobile 11: Honor Magic 6 Pro
//     {
//       name: "Honor Magic 6 Pro",
//       description: "Flagship with silicon-carbon battery and AI features",
//       brand: "Honor",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "HONORMAGIC6P-001",
//         price: 899.99,
//         mrp: 999.99,
//         stock: 33,
//         attributes: { color: "Epi Green", storage: "512GB" },
//         specifications: [
//           { key: "Display", value: "6.8-inch LTPO OLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP + 180MP + 50MP" },
//           { key: "Battery", value: "5600 mAh Silicon-Carbon" },
//           { key: "Charging", value: "80W Wired + 66W Wireless" },
//           { key: "Special", value: "Falcon Camera System" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
//           altText: "Honor Magic 6 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Honor warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT_OR_REFUND", duration: 10, unit: "days", conditions: "Sealed package" },
//       ],
//     },

//     // Mobile 12: Poco F6 Pro
//     {
//       name: "Poco F6 Pro",
//       description: "Performance beast with liquid cooling technology",
//       brand: "Poco",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "POCOF6P-001",
//         price: 499.99,
//         mrp: 599.99,
//         stock: 65,
//         attributes: { color: "Black", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.67-inch AMOLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 2" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP OIS Main" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "Charging", value: "120W HyperCharge" },
//           { key: "Cooling", value: "LiquidCool 2.0" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb",
//           altText: "Poco F6 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "3-5 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Poco warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 7, unit: "days", conditions: "Original packaging" },
//       ],
//     },

//     // Mobile 13: Sony Xperia 1 VI
//     {
//       name: "Sony Xperia 1 VI",
//       description: "Creator's phone with 4K display and pro camera features",
//       brand: "Sony",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "SONYXP1VI-001",
//         price: 1199.99,
//         mrp: 1299.99,
//         stock: 18,
//         attributes: { color: "Khaki Green", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.5-inch 4K HDR OLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "48MP Triple with ZEISS" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "Audio", value: "Front Stereo Speakers" },
//           { key: "Special", value: "Pro Video Recording" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1607462109225-6b64a2c2c6e5",
//           altText: "Sony Xperia 1 VI",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 24, unit: "months", description: "2-year Sony warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 14, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Mobile 14: iQOO 12 Pro
//     {
//       name: "iQOO 12 Pro",
//       description: "Gaming flagship with BMW M Motorsport design",
//       brand: "iQOO",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "IQOO12P-001",
//         price: 749.99,
//         mrp: 849.99,
//         stock: 42,
//         attributes: { color: "BMW M Motorsport", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.78-inch E7 AMOLED 144Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "16GB" },
//           { key: "Camera", value: "50MP VCS Main" },
//           { key: "Battery", value: "5100 mAh" },
//           { key: "Charging", value: "120W FlashCharge" },
//           { key: "Gaming", value: "Dedicated Gaming Chip" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1605236477837-a5f6a7ba6ba0",
//           altText: "iQOO 12 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "4-5 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "iQOO warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT_OR_REFUND", duration: 10, unit: "days", conditions: "Gaming accessories included" },
//       ],
//     },

//     // Mobile 15: Redmi Note 13 Pro+
//     {
//       name: "Redmi Note 13 Pro+ 5G",
//       description: "Budget flagship with 200MP camera and 120W charging",
//       brand: "Redmi",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "REDMINOTE13PP-001",
//         price: 399.99,
//         mrp: 449.99,
//         stock: 85,
//         attributes: { color: "Midnight Black", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.67-inch AMOLED 120Hz" },
//           { key: "Processor", value: "MediaTek Dimensity 7200 Ultra" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "200MP OIS Main" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "Charging", value: "120W HyperCharge" },
//           { key: "Protection", value: "IP68" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1610945415511-d90f3c7c29a3",
//           altText: "Redmi Note 13 Pro+",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "3-5 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Xiaomi warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 7, unit: "days", conditions: "Box seal intact" },
//       ],
//     },

//     // Mobile 16: Nubia Red Magic 9 Pro
//     {
//       name: "Nubia Red Magic 9 Pro",
//       description: "Ultimate gaming phone with active cooling fan",
//       brand: "Nubia",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "NUBIARM9P-001",
//         price: 849.99,
//         mrp: 949.99,
//         stock: 25,
//         attributes: { color: "Sleet", storage: "512GB" },
//         specifications: [
//           { key: "Display", value: "6.8-inch AMOLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "16GB" },
//           { key: "Camera", value: "50MP Triple" },
//           { key: "Battery", value: "6500 mAh" },
//           { key: "Charging", value: "80W Fast Charging" },
//           { key: "Cooling", value: "ICE 13.0 with Fan" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609692925454-a06dbf1556df",
//           altText: "Red Magic 9 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Nubia gaming warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 7, unit: "days", conditions: "Gaming triggers included" },
//       ],
//     },

//     // Mobile 17: Nokia G60 5G
//     {
//       name: "Nokia G60 5G",
//       description: "Eco-friendly phone with 3-year warranty and pure Android",
//       brand: "Nokia",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "NOKIAG60-001",
//         price: 299.99,
//         mrp: 349.99,
//         stock: 60,
//         attributes: { color: "Pure Black", storage: "128GB" },
//         specifications: [
//           { key: "Display", value: "6.58-inch IPS LCD 120Hz" },
//           { key: "Processor", value: "Snapdragon 695" },
//           { key: "RAM", value: "6GB" },
//           { key: "Camera", value: "50MP Triple" },
//           { key: "Battery", value: "4500 mAh" },
//           { key: "OS", value: "Pure Android 13" },
//           { key: "Build", value: "60% Recycled Plastic" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1591337676424-d6e68cd96287",
//           altText: "Nokia G60 5G",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 36, unit: "months", description: "3-year Nokia warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Eco-friendly packaging" },
//       ],
//     },

//     // Mobile 18: Tecno Phantom X2 Pro
//     {
//       name: "Tecno Phantom X2 Pro",
//       description: "World's first retractable portrait lens smartphone",
//       brand: "Tecno",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "TECNOPHANTOMX2P-001",
//         price: 599.99,
//         mrp: 699.99,
//         stock: 30,
//         attributes: { color: "Mars Orange", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.8-inch AMOLED 120Hz" },
//           { key: "Processor", value: "MediaTek Dimensity 9000" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP + Retractable Portrait" },
//           { key: "Battery", value: "5160 mAh" },
//           { key: "Charging", value: "45W Fast Charging" },
//           { key: "Special", value: "2.5x Retractable Lens" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1598327106420-c2d5e1a22b96",
//           altText: "Tecno Phantom X2 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "4-6 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Tecno warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT_OR_REFUND", duration: 10, unit: "days", conditions: "Lens mechanism intact" },
//       ],
//     },

//     // Mobile 19: Infinix Zero 30 5G
//     {
//       name: "Infinix Zero 30 5G",
//       description: "4K 60fps front camera phone for content creators",
//       brand: "Infinix",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "INFINIXZERO30-001",
//         price: 349.99,
//         mrp: 399.99,
//         stock: 70,
//         attributes: { color: "Golden Hour", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.78-inch AMOLED 144Hz" },
//           { key: "Processor", value: "MediaTek Dimensity 8020" },
//           { key: "RAM", value: "8GB" },
//           { key: "Camera", value: "108MP OIS + 50MP Front 4K" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "Charging", value: "68W Thunder Charge" },
//           { key: "Special", value: "4K 60fps Front Camera" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1610792272337-18dd91612b4c",
//           altText: "Infinix Zero 30 5G",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Infinix warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 7, unit: "days", conditions: "Complete box" },
//       ],
//     },

//     // Mobile 20: ZTE Axon 50 Ultra
//     {
//       name: "ZTE Axon 50 Ultra",
//       description: "Under-display camera technology with seamless screen",
//       brand: "ZTE",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "ZTEAXON50U-001",
//         price: 749.99,
//         mrp: 849.99,
//         stock: 20,
//         attributes: { color: "Starry Black", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.67-inch AMOLED 144Hz" },
//           { key: "Processor", value: "Snapdragon 8+ Gen 1" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "64MP Triple + UDC" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "Charging", value: "80W Fast Charging" },
//           { key: "Special", value: "Under Display Camera" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1601972599720-36938d4dcd79",
//           altText: "ZTE Axon 50 Ultra",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "ZTE warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 10, unit: "days", conditions: "Screen intact" },
//       ],
//     },

//     // Mobile 21: Meizu 21 Pro
//     {
//       name: "Meizu 21 Pro",
//       description: "Flagship with Flyme AI and ultra-narrow bezels",
//       brand: "Meizu",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "MEIZU21P-001",
//         price: 699.99,
//         mrp: 799.99,
//         stock: 28,
//         attributes: { color: "Meizu White", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.79-inch AMOLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP OIS Triple" },
//           { key: "Battery", value: "5050 mAh" },
//           { key: "Charging", value: "80W + 50W Wireless" },
//           { key: "OS", value: "Flyme OS with AI" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1602080889390-76000e1b4a25",
//           altText: "Meizu 21 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "4-6 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Meizu warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 7, unit: "days", conditions: "Original seal" },
//       ],
//     },

//     // Mobile 22: TCL 50 5G
//     {
//       name: "TCL 50 5G",
//       description: "NXTPAPER display technology for eye comfort",
//       brand: "TCL",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "TCL50-001",
//         price: 249.99,
//         mrp: 299.99,
//         stock: 75,
//         attributes: { color: "Gray", storage: "128GB" },
//         specifications: [
//           { key: "Display", value: "6.6-inch NXTPAPER" },
//           { key: "Processor", value: "MediaTek Dimensity 6100+" },
//           { key: "RAM", value: "6GB" },
//           { key: "Camera", value: "50MP Dual" },
//           { key: "Battery", value: "5010 mAh" },
//           { key: "Charging", value: "18W Fast Charging" },
//           { key: "Special", value: "Eye Care Display" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609692925409-e61e566bc2fe",
//           altText: "TCL 50 5G",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "TCL warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT_OR_REFUND", duration: 14, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Mobile 23: HTC U24 Pro
//     {
//       name: "HTC U24 Pro",
//       description: "Premium build with Edge Sense squeeze controls",
//       brand: "HTC",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "HTCU24P-001",
//         price: 599.99,
//         mrp: 699.99,
//         stock: 22,
//         attributes: { color: "Twilight Blue", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.7-inch OLED 120Hz" },
//           { key: "Processor", value: "Snapdragon 7 Gen 3" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50MP OIS Triple" },
//           { key: "Battery", value: "4600 mAh" },
//           { key: "Charging", value: "60W + Wireless" },
//           { key: "Special", value: "Edge Sense 3.0" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
//           altText: "HTC U24 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "HTC warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 10, unit: "days", conditions: "No damage" },
//       ],
//     },

//     // Mobile 24: Sharp Aquos R9 Pro
//     {
//       name: "Sharp Aquos R9 Pro",
//       description: "Pro IGZO OLED display with 240Hz refresh rate",
//       brand: "Sharp",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "SHARPAQUOSR9P-001",
//         price: 899.99,
//         mrp: 999.99,
//         stock: 15,
//         attributes: { color: "Black", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.6-inch Pro IGZO OLED 240Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "12GB" },
//           { key: "Camera", value: "50.3MP Leica" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "Audio", value: "Dolby Atmos" },
//           { key: "Special", value: "240Hz Gaming Display" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1574920344019-f5d687f5f6ba",
//           altText: "Sharp Aquos R9 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Sharp warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Complete package" },
//       ],
//     },

//     // Mobile 25: Fairphone 5
//     {
//       name: "Fairphone 5",
//       description: "Sustainable modular smartphone with 8-year support",
//       brand: "Fairphone",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "FAIRPHONE5-001",
//         price: 699.99,
//         mrp: 749.99,
//         stock: 35,
//         attributes: { color: "Sky Blue", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.46-inch OLED 90Hz" },
//           { key: "Processor", value: "Qualcomm QCM6490" },
//           { key: "RAM", value: "8GB" },
//           { key: "Camera", value: "50MP Dual" },
//           { key: "Battery", value: "4200 mAh Removable" },
//           { key: "Support", value: "8 Years Software" },
//           { key: "Special", value: "Modular Design" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1564434514418-9041504c6e79",
//           altText: "Fairphone 5",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Eco Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 60, unit: "months", description: "5-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 30, unit: "days", conditions: "Modular parts included" },
//       ],
//     },

//     // Mobile 26: LG Wing 5G Refurbished
//     {
//       name: "LG Wing 5G",
//       description: "Unique swivel dual-screen design for multitasking",
//       brand: "LG",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "LGWING5G-001",
//         price: 449.99,
//         mrp: 599.99,
//         stock: 12,
//         attributes: { color: "Aurora Gray", storage: "256GB" },
//         specifications: [
//           { key: "Display", value: "6.8-inch + 3.9-inch Dual" },
//           { key: "Processor", value: "Snapdragon 765G" },
//           { key: "RAM", value: "8GB" },
//           { key: "Camera", value: "64MP Triple + Gimbal" },
//           { key: "Battery", value: "4000 mAh" },
//           { key: "Design", value: "Swivel Screen" },
//           { key: "Special", value: "Gimbal Camera Mode" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1602526430513-57dc21994fdb",
//           altText: "LG Wing 5G",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "4-6 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "SELLER", duration: 6, unit: "months", description: "Refurbished warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 15, unit: "days", conditions: "Swivel mechanism working" },
//       ],
//     },

//     // Mobile 27: CAT S75
//     {
//       name: "CAT S75",
//       description: "Rugged satellite-connected smartphone for extreme conditions",
//       brand: "CAT",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "CATS75-001",
//         price: 599.99,
//         mrp: 699.99,
//         stock: 25,
//         attributes: { color: "Black", storage: "128GB" },
//         specifications: [
//           { key: "Display", value: "6.58-inch IPS 120Hz" },
//           { key: "Processor", value: "MediaTek Dimensity 930" },
//           { key: "RAM", value: "6GB" },
//           { key: "Camera", value: "50MP Dual" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "Protection", value: "IP68/IP69K/MIL-STD-810H" },
//           { key: "Special", value: "Satellite Messaging" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609692925454-b75a756f5bd3",
//           altText: "CAT S75",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 24, unit: "months", description: "Rugged warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 30, unit: "days", conditions: "Durability tested" },
//       ],
//     },

//     // Mobile 28: Alcatel 3L (2024)
//     {
//       name: "Alcatel 3L (2024)",
//       description: "Budget-friendly phone with large display and battery",
//       brand: "Alcatel",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile2@test.com",
//       variants: {
//         sku: "ALCATEL3L24-001",
//         price: 149.99,
//         mrp: 179.99,
//         stock: 95,
//         attributes: { color: "Jewelry Blue", storage: "64GB" },
//         specifications: [
//           { key: "Display", value: "6.52-inch HD+" },
//           { key: "Processor", value: "MediaTek Helio G37" },
//           { key: "RAM", value: "4GB" },
//           { key: "Camera", value: "50MP Triple" },
//           { key: "Battery", value: "5000 mAh" },
//           { key: "OS", value: "Android 14" },
//           { key: "Price", value: "Budget Friendly" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1533228100845-08145b01de14",
//           altText: "Alcatel 3L",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "Alcatel warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 7, unit: "days", conditions: "Unopened box" },
//       ],
//     },

//     // Mobile 29: BlackBerry Key3 LE
//     {
//       name: "BlackBerry Key3 LE",
//       description: "Business phone with physical QWERTY keyboard",
//       brand: "BlackBerry",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile3@test.com",
//       variants: {
//         sku: "BBKEY3LE-001",
//         price: 399.99,
//         mrp: 499.99,
//         stock: 18,
//         attributes: { color: "Space Blue", storage: "128GB" },
//         specifications: [
//           { key: "Display", value: "4.5-inch IPS + Keyboard" },
//           { key: "Processor", value: "Snapdragon 662" },
//           { key: "RAM", value: "6GB" },
//           { key: "Camera", value: "48MP Dual" },
//           { key: "Battery", value: "4000 mAh" },
//           { key: "Keyboard", value: "Physical QWERTY" },
//           { key: "Security", value: "DTEK Security Suite" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1510166089176-b57564a542b1",
//           altText: "BlackBerry Key3 LE",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "BlackBerry warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 14, unit: "days", conditions: "Keyboard functional" },
//       ],
//     },

//     // Mobile 30: ROG Phone 8 Pro
//     {
//       name: "ASUS ROG Phone 8 Pro",
//       description: "Ultimate gaming phone with AniMe Matrix LED display",
//       brand: "ASUS ROG",
//       categoryName: "Smartphones",
//       sellerEmail: "mobile1@test.com",
//       variants: {
//         sku: "ROGPHONE8P-001",
//         price: 1299.99,
//         mrp: 1399.99,
//         stock: 20,
//         attributes: { color: "Phantom Black", storage: "1TB" },
//         specifications: [
//           { key: "Display", value: "6.78-inch AMOLED 165Hz" },
//           { key: "Processor", value: "Snapdragon 8 Gen 3" },
//           { key: "RAM", value: "24GB" },
//           { key: "Camera", value: "50MP Gimbal Triple" },
//           { key: "Battery", value: "5500 mAh" },
//           { key: "Cooling", value: "GameCool 8 System" },
//           { key: "Special", value: "AniMe Matrix Display" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1635404226305-d3a985e18535",
//           altText: "ROG Phone 8 Pro",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Gaming Express", description: "1-2 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 24, unit: "months", description: "ROG gaming warranty" },
//       ],
//       returnPolicy: [
//         { type: "REPLACEMENT", duration: 15, unit: "days", conditions: "Gaming accessories complete" },
//       ],
//     },
//   ];

//   let createdCount = 0;
//   for (const productData of productsData) {
//     try {
//       const seller = await createOrGetSeller(productData.sellerEmail, "", "");
//       const category = await prisma.category.findUnique({
//         where: { name: productData.categoryName },
//       });

//       if (!category) {
//         console.warn(
//           `⚠️ Category "${productData.categoryName}" not found — skipping "${productData.name}"`
//         );
//         continue;
//       }

//       const product = await createProduct(productData, seller.id, category.id);
//       console.log(`✅ Created product: ${product.name}`);
//       createdCount++;
//     } catch (error) {
//       console.error(`❌ Error creating "${productData.name}":`, error.message);
//     }
//   }

//   console.log(`\n🎉 Seeding complete! Created ${createdCount} products.`);
// }

// main()
//   .catch((e) => {
//     console.error("Error during seeding:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
