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
//     include: { roles: true },
//   });

//   if (!seller) {
//     const baseUsername = email.split("@")[0];
//     let username = baseUsername;
//     let counter = 1;

//     // Ensure unique username
//     while (await prisma.user.findUnique({ where: { username } })) {
//       username = `${baseUsername}${counter}`;
//       counter++;
//     }

//     seller = await prisma.user.create({
//       data: {
//         email,
//         username,
//         firstName,
//         lastName,
//         name: `${firstName} ${lastName}`.trim(),
//         roles: {
//           create: [
//             {
//               role: "SELLER",
//             },
//           ],
//         },
//       },
//       include: { roles: true },
//     });
//     console.log(`Created seller: ${email} with username ${username} and SELLER role`);
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
//   input: any,
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

//   // Convert specifications to specificationTable (JSON)
//   const specTable = input.variants.specifications?.reduce((acc: any, spec: any) => {
//     acc[spec.key] = spec.value;
//     return acc;
//   }, {}) || {};

//   // Extract features from specifications or use empty array
//   const features = input.variants.specifications?.map((spec: any) => `${spec.key}: ${spec.value}`) || [];

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
//           features: features,
//           specificationTable: specTable,
//           variants: {
//             create: {
//               sku: input.variants.sku,
//               price: input.variants.price,
//               mrp: input.variants.mrp || input.variants.price,
//               stock: input.variants.stock,
//               attributes: input.variants.attributes || {},
//               isDefault: input.variants.isDefault !== false,
//               specificationTable: specTable,
//               specifications:
//                 input.variants.specifications?.length > 0
//                   ? {
//                     create: input.variants.specifications.map((spec: any) => ({
//                       key: spec.key,
//                       value: spec.value,
//                     })),
//                   }
//                   : undefined,
//             },
//           },
//           images: {
//             create: input.images.map((img: any, index: number) => ({
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
//           data: input.deliveryOptions.map((option: any) => ({
//             productId: newProduct.id,
//             title: option.title,
//             description: option.description || null,
//             isDefault: option.isDefault || false,
//           })),
//         });
//       }

//       if (input.warranty?.length > 0) {
//         await tx.warranty.createMany({
//           data: input.warranty.map((warranty: any) => ({
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
//           data: input.returnPolicy.map((policy: any) => ({
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
//     { timeout: 15000 }
//   );
// }

// async function main() {
//   const sellers = [
//     await createOrGetSeller("seller1@test.com", "John", "Doe"),
//     await createOrGetSeller("seller2@test.com", "Jane", "Smith"),
//     await createOrGetSeller("seller3@test.com", "Mike", "Johnson"),
//   ];

//   const productsData = [
//     // 1. Casual Shirt
//     {
//       name: "Levi's Slim Fit Cotton Shirt",
//       description: "Comfortable slim-fit shirt for casual wear",
//       brand: "Levi's",
//       categoryName: "Shirts",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "LEVIS-SHIRT001",
//         price: 39.99,
//         mrp: 49.99,
//         stock: 100,
//         attributes: { size: "M", color: "Navy Blue" },
//         specifications: [
//           { key: "Material", value: "100% Cotton" },
//           { key: "Fit", value: "Slim" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "Levi's slim fit shirt",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 2. Denim Jeans
//     {
//       name: "Wrangler Slim Fit Jeans",
//       description: "Classic slim-fit jeans for everyday wear",
//       brand: "Wrangler",
//       categoryName: "Jeans & Trousers",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "WRANG-JEANS001",
//         price: 49.99,
//         mrp: 69.99,
//         stock: 80,
//         attributes: { size: "32x32", color: "Dark Wash" },
//         specifications: [
//           { key: "Material", value: "98% Cotton, 2% Elastane" },
//           { key: "Fit", value: "Slim" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1542272604-787c3835535d",
//           altText: "Wrangler slim fit jeans",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 3. Leather Jacket
//     {
//       name: "Schott NYC Leather Jacket",
//       description: "Premium leather jacket for a timeless look",
//       brand: "Schott NYC",
//       categoryName: "Jackets & Coats",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "SCHOTT-JACKET001",
//         price: 249.99,
//         mrp: 299.99,
//         stock: 40,
//         attributes: { size: "L", color: "Black" },
//         specifications: [
//           { key: "Material", value: "Genuine Leather" },
//           { key: "Lining", value: "Polyester" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
//           altText: "Schott NYC leather jacket",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 4. Formal Suit
//     {
//       name: "Hugo Boss Slim Fit Suit",
//       description: "Elegant slim-fit suit for formal occasions",
//       brand: "Hugo Boss",
//       categoryName: "Suits",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "HBOSS-SUIT001",
//         price: 499.99,
//         mrp: 599.99,
//         stock: 30,
//         attributes: { size: "40R", color: "Charcoal" },
//         specifications: [
//           { key: "Material", value: "100% Wool" },
//           { key: "Fit", value: "Slim" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1593032465170-3e7b6b95b6cd",
//           altText: "Hugo Boss slim fit suit",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 5. Sneakers
//     {
//       name: "Nike Air Max 270",
//       description: "Stylish sneakers with Air cushioning",
//       brand: "Nike",
//       categoryName: "Sports Shoes",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "NIKEAM270-001",
//         price: 119.99,
//         mrp: 149.99,
//         stock: 60,
//         attributes: { size: "10", color: "Black/White" },
//         specifications: [
//           { key: "Material", value: "Mesh and Synthetic" },
//           { key: "Cushioning", value: "Air Max" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
//           altText: "Nike Air Max 270 sneakers",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 6. Polo Shirt
//     {
//       name: "Ralph Lauren Classic Polo",
//       description: "Iconic polo shirt for a preppy look",
//       brand: "Ralph Lauren",
//       categoryName: "Shirts",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "RL-POLO001",
//         price: 69.99,
//         mrp: 89.99,
//         stock: 90,
//         attributes: { size: "M", color: "White" },
//         specifications: [
//           { key: "Material", value: "100% Cotton" },
//           { key: "Fit", value: "Classic" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1521572163474-37898b6baf17",
//           altText: "Ralph Lauren polo shirt",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 7. Chinos
//     {
//       name: "J.Crew Slim Chinos",
//       description: "Versatile slim-fit chinos for casual and formal wear",
//       brand: "J.Crew",
//       categoryName: "Jeans & Trousers",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "JCREW-CHINO001",
//         price: 59.99,
//         mrp: 79.99,
//         stock: 70,
//         attributes: { size: "32x30", color: "Khaki" },
//         specifications: [
//           { key: "Material", value: "98% Cotton, 2% Spandex" },
//           { key: "Fit", value: "Slim" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "J.Crew slim chinos",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 8. Bomber Jacket
//     {
//       name: "Alpha Industries MA-1 Bomber",
//       description: "Classic bomber jacket with durable nylon",
//       brand: "Alpha Industries",
//       categoryName: "Jackets & Coats",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "ALPHA-BOMBER001",
//         price: 129.99,
//         mrp: 159.99,
//         stock: 50,
//         attributes: { size: "L", color: "Sage Green" },
//         specifications: [
//           { key: "Material", value: "Nylon" },
//           { key: "Lining", value: "Polyester" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
//           altText: "Alpha Industries bomber jacket",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 9. Dress Shoes
//     {
//       name: "Clarks Tilden Cap Oxford",
//       description: "Polished leather oxford shoes for formal wear",
//       brand: "Clarks",
//       categoryName: "Formal Shoes",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "CLARKS-OXFORD001",
//         price: 89.99,
//         mrp: 109.99,
//         stock: 60,
//         attributes: { size: "9", color: "Black" },
//         specifications: [
//           { key: "Material", value: "Leather" },
//           { key: "Sole", value: "Rubber" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
//           altText: "Clarks oxford shoes",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 10. Graphic Tee
//     {
//       name: "Urban Outfitters Graphic Tee",
//       description: "Bold graphic t-shirt for casual style",
//       brand: "Urban Outfitters",
//       categoryName: "T-Shirts & Polos",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "UO-GRAPHIC001",
//         price: 24.99,
//         mrp: 34.99,
//         stock: 120,
//         attributes: { size: "L", color: "Black" },
//         specifications: [
//           { key: "Material", value: "100% Cotton" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1521572163474-37898b6baf17",
//           altText: "Urban Outfitters graphic tee",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 11. Blazer
//     {
//       name: "Zara Slim Fit Blazer",
//       description: "Modern blazer for smart-casual looks",
//       brand: "Zara",
//       categoryName: "Blazers",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "ZARA-BLAZER001",
//         price: 99.99,
//         mrp: 129.99,
//         stock: 50,
//         attributes: { size: "M", color: "Navy" },
//         specifications: [
//           { key: "Material", value: "Polyester Blend" },
//           { key: "Fit", value: "Slim" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1593032465170-3e7b6b95b6cd",
//           altText: "Zara slim fit blazer",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 12. Hoodie
//     {
//       name: "Champion Reverse Weave Hoodie",
//       description: "Cozy hoodie with durable cotton blend",
//       brand: "Champion",
//       categoryName: "Sweatshirts & Hoodies",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "CHAMP-HOODIE001",
//         price: 49.99,
//         mrp: 69.99,
//         stock: 80,
//         attributes: { size: "L", color: "Grey" },
//         specifications: [
//           { key: "Material", value: "Cotton Blend" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
//           altText: "Champion hoodie",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 13. Dress Shirt
//     {
//       name: "Brooks Brothers Non-Iron Dress Shirt",
//       description: "Crisp dress shirt with non-iron fabric",
//       brand: "Brooks Brothers",
//       categoryName: "Shirts",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "BROOKS-DRESS001",
//         price: 79.99,
//         mrp: 99.99,
//         stock: 60,
//         attributes: { size: "15.5", color: "White" },
//         specifications: [
//           { key: "Material", value: "100% Cotton" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "Brooks Brothers dress shirt",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 14. Cargo Pants
//     {
//       name: "Columbia Cargo Pants",
//       description: "Durable cargo pants for outdoor adventures",
//       brand: "Columbia",
//       categoryName: "Jeans & Trousers",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "COLUM-CARGO001",
//         price: 54.99,
//         mrp: 69.99,
//         stock: 70,
//         attributes: { size: "34x32", color: "Olive Green" },
//         specifications: [
//           { key: "Material", value: "Cotton Blend" },
//           { key: "Fit", value: "Relaxed" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "Columbia cargo pants",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 15. Wool Coat
//     {
//       name: "Banana Republic Wool Overcoat",
//       description: "Elegant wool coat for cold weather",
//       brand: "Banana Republic",
//       categoryName: "Jackets & Coats",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "BANANA-COAT001",
//         price: 199.99,
//         mrp: 249.99,
//         stock: 40,
//         attributes: { size: "L", color: "Camel" },
//         specifications: [
//           { key: "Material", value: "80% Wool, 20% Nylon" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
//           altText: "Banana Republic wool coat",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 16. Running Shoes
//     {
//       name: "Adidas Ultraboost 23",
//       description: "High-performance running shoes with Boost cushioning",
//       brand: "Adidas",
//       categoryName: "Sports Shoes",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "ADIUB23-001",
//         price: 129.99,
//         mrp: 159.99,
//         stock: 50,
//         attributes: { size: "9.5", color: "Core Black" },
//         specifications: [
//           { key: "Material", value: "Primeknit" },
//           { key: "Cushioning", value: "Boost" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
//           altText: "Adidas Ultraboost 23 shoes",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 17. Sweater
//     {
//       name: "H&M Crewneck Sweater",
//       description: "Soft cotton-blend sweater for layering",
//       brand: "H&M",
//       categoryName: "Sweaters",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "HM-SWEATER001",
//         price: 34.99,
//         mrp: 44.99,
//         stock: 100,
//         attributes: { size: "M", color: "Navy" },
//         specifications: [
//           { key: "Material", value: "Cotton Blend" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
//           altText: "H&M crewneck sweater",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 18. Belt
//     {
//       name: "Tommy Hilfiger Leather Belt",
//       description: "Classic leather belt with metal buckle",
//       brand: "Tommy Hilfiger",
//       categoryName: "Accessories",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "TOMMY-BELT001",
//         price: 29.99,
//         mrp: 39.99,
//         stock: 80,
//         attributes: { size: "34", color: "Black" },
//         specifications: [
//           { key: "Material", value: "Genuine Leather" },
//           { key: "Buckle", value: "Metal" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "Tommy Hilfiger leather belt",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 19. Tuxedo
//     {
//       name: "Calvin Klein Slim Fit Tuxedo",
//       description: "Sleek tuxedo for black-tie events",
//       brand: "Calvin Klein",
//       categoryName: "Suits",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "CK-TUX001",
//         price: 399.99,
//         mrp: 499.99,
//         stock: 25,
//         attributes: { size: "38R", color: "Black" },
//         specifications: [
//           { key: "Material", value: "Wool Blend" },
//           { key: "Fit", value: "Slim" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1593032465170-3e7b6b95b6cd",
//           altText: "Calvin Klein tuxedo",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 20. Casual Shoes
//     {
//       name: "Vans Old Skool Sneakers",
//       description: "Iconic low-top sneakers for casual wear",
//       brand: "Vans",
//       categoryName: "Casual Shoes",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "VANS-OS001",
//         price: 59.99,
//         mrp: 79.99,
//         stock: 70,
//         attributes: { size: "10", color: "Black/White" },
//         specifications: [
//           { key: "Material", value: "Canvas and Suede" },
//           { key: "Sole", value: "Rubber" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
//           altText: "Vans Old Skool sneakers",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 21. Denim Jacket
//     {
//       name: "Gap Denim Jacket",
//       description: "Classic denim jacket for versatile styling",
//       brand: "Gap",
//       categoryName: "Jackets & Coats",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "GAP-DENIM001",
//         price: 69.99,
//         mrp: 89.99,
//         stock: 60,
//         attributes: { size: "M", color: "Medium Wash" },
//         specifications: [
//           { key: "Material", value: "100% Cotton" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
//           altText: "Gap denim jacket",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 22. Flannel Shirt
//     {
//       name: "Patagonia Fjord Flannel Shirt",
//       description: "Warm flannel shirt for cool weather",
//       brand: "Patagonia",
//       categoryName: "Shirts",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "PATAG-FLANNEL001",
//         price: 79.99,
//         mrp: 99.99,
//         stock: 70,
//         attributes: { size: "L", color: "Plaid Green" },
//         specifications: [
//           { key: "Material", value: "Organic Cotton" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "Patagonia flannel shirt",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 23. Watch
//     {
//       name: "Citizen Eco-Drive Chronograph",
//       description: "Solar-powered chronograph watch",
//       brand: "Citizen",
//       categoryName: "Accessories",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "CITIZEN-WATCH001",
//         price: 199.99,
//         mrp: 249.99,
//         stock: 40,
//         attributes: { size: "42mm", color: "Silver" },
//         specifications: [
//           { key: "Material", value: "Stainless Steel" },
//           { key: "Movement", value: "Eco-Drive" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
//           altText: "Citizen Eco-Drive watch",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 60, unit: "months", description: "5-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 24. Joggers
//     {
//       name: "Under Armour Tech Joggers",
//       description: "Lightweight joggers for active wear",
//       brand: "Under Armour",
//       categoryName: "Jeans & Trousers",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "UA-JOGGER001",
//         price: 44.99,
//         mrp: 59.99,
//         stock: 80,
//         attributes: { size: "M", color: "Black" },
//         specifications: [
//           { key: "Material", value: "Polyester Blend" },
//           { key: "Fit", value: "Tapered" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "Under Armour joggers",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 25. Parka
//     {
//       name: "The North Face McMurdo Parka",
//       description: "Insulated parka for extreme cold",
//       brand: "The North Face",
//       categoryName: "Jackets & Coats",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "TNF-PARKA001",
//         price: 299.99,
//         mrp: 349.99,
//         stock: 30,
//         attributes: { size: "L", color: "Black" },
//         specifications: [
//           { key: "Material", value: "Nylon with Down Insulation" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
//           altText: "The North Face parka",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 26. Loafers
//     {
//       name: "Cole Haan Pinch Loafers",
//       description: "Classic leather loafers for versatile wear",
//       brand: "Cole Haan",
//       categoryName: "Casual Shoes",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "COLE-LOAFER001",
//         price: 99.99,
//         mrp: 129.99,
//         stock: 50,
//         attributes: { size: "10", color: "Brown" },
//         specifications: [
//           { key: "Material", value: "Leather" },
//           { key: "Sole", value: "Rubber" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
//           altText: "Cole Haan loafers",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 27. Cardigan
//     {
//       name: "Uniqlo Cashmere Cardigan",
//       description: "Soft cashmere cardigan for layered looks",
//       brand: "Uniqlo",
//       categoryName: "Sweaters",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "UNIQ-CARDI001",
//         price: 79.99,
//         mrp: 99.99,
//         stock: 60,
//         attributes: { size: "M", color: "Grey" },
//         specifications: [
//           { key: "Material", value: "100% Cashmere" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
//           altText: "Uniqlo cashmere cardigan",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 28. Sunglasses
//     {
//       name: "Ray-Ban Wayfarer Sunglasses",
//       description: "Iconic sunglasses with UV protection",
//       brand: "Ray-Ban",
//       categoryName: "Accessories",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "RAYBAN-WAY001",
//         price: 129.99,
//         mrp: 159.99,
//         stock: 50,
//         attributes: { size: "55mm", color: "Black" },
//         specifications: [
//           { key: "Material", value: "Acetate" },
//           { key: "Lens", value: "Polarized" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
//           altText: "Ray-Ban Wayfarer sunglasses",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 24, unit: "months", description: "2-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 29. Kurta
//     {
//       name: "FabIndia Cotton Kurta",
//       description: "Traditional kurta for festive occasions",
//       brand: "FabIndia",
//       categoryName: "Ethnic Wear",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "FAB-KURTA001",
//         price: 39.99,
//         mrp: 59.99,
//         stock: 70,
//         attributes: { size: "M", color: "Beige" },
//         specifications: [
//           { key: "Material", value: "100% Cotton" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
//           altText: "FabIndia cotton kurta",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Standard Delivery", description: "5-7 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//     // 30. Windbreaker
//     {
//       name: "Arc'teryx Beta Windbreaker",
//       description: "Lightweight windbreaker for outdoor activities",
//       brand: "Arc'teryx",
//       categoryName: "Jackets & Coats",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "ARCT-BETA001",
//         price: 149.99,
//         mrp: 179.99,
//         stock: 40,
//         attributes: { size: "L", color: "Blue" },
//         specifications: [
//           { key: "Material", value: "Gore-Tex" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3",
//           altText: "Arc'teryx windbreaker",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [
//         { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unworn with tags" },
//       ],
//     },
//   ];


//   let createdCount = 0;
//   for (const productData of productsData) {
//     try {
//       const seller = await createOrGetSeller(productData.sellerEmail, "", "");
//       if (!seller) {
//         console.warn(`⚠️ Seller not found for product "${productData.name}" — skipping`);
//         continue;
//       }
//       const category = await prisma.category.findFirst({
//         where: {
//           OR: [
//             { name: productData.categoryName },
//             { name: { contains: productData.categoryName, mode: 'insensitive' } }
//           ]
//         },
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
//     } catch (error: any) {
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