// const { PrismaClient } = require("../../app/generated/prisma");

// const prisma = new PrismaClient();

// function slugify(name) {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)+/g, "");
// }

// async function createOrGetSeller(email, firstName, lastName) {
//   let seller = await prisma.user.findUnique({
//     where: { email },
//   });
//   if (!seller) {
//     seller = await prisma.user.create({
//       data: {
//         clerkId: `clerk_${email.split("@")[0]}`,
//         email,
//         firstName,
//         lastName,
//         role: "SELLER",
//       },
//     });
//   }
//   return seller;
// }

// async function createProduct(input, sellerId, categoryId) {
//   const slug = slugify(input.name);

//   // Ensure uniqueness by checking and appending counter if needed
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

//       // Optional: Create delivery options if provided
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

//       // Optional: Create warranty if provided
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

//       // Optional: Create return policy if provided
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

//       // Note: Skipping productOffers for simplicity in seed; can add if needed

//       return newProduct;
//     },
//     { timeout: 30000 }
//   );
// }

// async function main() {
//   // Create or get sellers
//   const seller1 = await createOrGetSeller("seller1@test.com", "John", "Doe");
//   const seller2 = await createOrGetSeller("seller2@test.com", "Jane", "Smith");
//   const seller3 = await createOrGetSeller(
//     "seller3@test.com",
//     "Mike",
//     "Johnson"
//   );

//   const sellers = [seller1, seller2, seller3];

//   // Product seed data
//   const productsData = [
//     // Electronics > Mobile & Accessories > Smartphones
//     {
//       name: "iPhone 14 Pro",
//       description: "Latest iPhone with advanced camera system",
//       brand: "Apple",
//       categoryName: "Smartphones",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "IPH14PRO001",
//         price: 999.99,
//         mrp: 1099.99,
//         stock: 50,
//         attributes: { color: "Space Black", storage: "128GB" },
//         isDefault: true,
//         specifications: [
//           { key: "RAM", value: "6GB" },
//           { key: "Processor", value: "A16 Bionic" },
//           { key: "Camera", value: "48MP Main" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/iphone14pro-1.jpg",
//           altText: "Front view",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/iphone14pro-2.jpg",
//           altText: "Back view",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/iphone14pro-3.jpg",
//           altText: "Side view",
//           sortOrder: 2,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "5-7 days",
//           isDefault: true,
//         },
//         {
//           title: "Express Delivery",
//           description: "2-3 days",
//           isDefault: false,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "1 year warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 7,
//           unit: "days",
//           conditions: "In original packaging",
//         },
//       ],
//     },
//     {
//       name: "Samsung Galaxy S23",
//       description: "Flagship Android phone with S Pen support",
//       brand: "Samsung",
//       categoryName: "Smartphones",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "SGS23ULTRA001",
//         price: 1199.99,
//         mrp: 1299.99,
//         stock: 30,
//         attributes: { color: "Phantom Black", storage: "256GB" },
//         isDefault: true,
//         specifications: [
//           { key: "RAM", value: "12GB" },
//           { key: "Processor", value: "Snapdragon 8 Gen 2" },
//           { key: "Camera", value: "200MP Main" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/sgs23-1.jpg",
//           altText: "Front view",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/sgs23-2.jpg",
//           altText: "Back view",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "5-7 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "1 year warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT",
//           duration: 10,
//           unit: "days",
//           conditions: "Defective items only",
//         },
//       ],
//     },

//     // Electronics > Computers & Laptops > Laptops
//     {
//       name: "Dell XPS 13",
//       description: "Ultra-portable laptop with InfinityEdge display",
//       brand: "Dell",
//       categoryName: "Laptops",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "DELLXPS13001",
//         price: 1299.99,
//         mrp: 1499.99,
//         stock: 20,
//         attributes: { color: "Platinum Silver", ram: "16GB" },
//         isDefault: true,
//         specifications: [
//           { key: "Processor", value: "Intel Core i7" },
//           { key: "Storage", value: "512GB SSD" },
//           { key: "Display", value: "13.4 inch OLED" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/dellxps13-1.jpg",
//           altText: "Laptop open",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/dellxps13-2.jpg",
//           altText: "Side view",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/dellxps13-3.jpg",
//           altText: "Keyboard closeup",
//           sortOrder: 2,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [],
//       warranty: [
//         {
//           type: "SELLER",
//           duration: 24,
//           unit: "months",
//           description: "2 year extended warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Full refund if unused",
//         },
//       ],
//     },
//     {
//       name: "MacBook Pro 16",
//       description: "Professional laptop with M3 Pro chip",
//       brand: "Apple",
//       categoryName: "Laptops",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "MACBP16M3001",
//         price: 2499.99,
//         mrp: 2699.99,
//         stock: 15,
//         attributes: { color: "Space Gray", storage: "1TB" },
//         isDefault: true,
//         specifications: [
//           { key: "Processor", value: "Apple M3 Pro" },
//           { key: "RAM", value: "18GB" },
//           { key: "Display", value: "16.2 inch Liquid Retina XDR" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/macbookpro16-1.jpg",
//           altText: "Laptop open",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/macbookpro16-2.jpg",
//           altText: "Ports view",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
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
//           description: "1 year warranty",
//         },
//       ],
//       returnPolicy: [],
//     },

//     // Fashion & Apparel > Men’s Fashion > TShirts & Polos
//     {
//       name: "Cotton Polo Shirt",
//       description: "Comfortable breathable polo for casual wear",
//       brand: "Polo Ralph Lauren",
//       categoryName: "TShirts & Polos",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "POLOSHIRT001",
//         price: 29.99,
//         mrp: 39.99,
//         stock: 100,
//         attributes: { size: "M", color: "Navy Blue" },
//         isDefault: true,
//         specifications: [
//           { key: "Material", value: "100% Cotton" },
//           { key: "Fit", value: "Regular" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/polo-shirt-1.jpg",
//           altText: "Front view",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/polo-shirt-2.jpg",
//           altText: "Back view",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "5-7 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT_OR_REFUND",
//           duration: 14,
//           unit: "days",
//           conditions: "Size exchange allowed",
//         },
//       ],
//     },

//     // Home & Kitchen > Kitchen Appliances > Mixer Grinders
//     {
//       name: "Preethi Mixer Grinder",
//       description: "Powerful 750W mixer with multiple jars",
//       brand: "Preethi",
//       categoryName: "Mixer Grinders",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "PREETHIMIX001",
//         price: 49.99,
//         mrp: 59.99,
//         stock: 40,
//         attributes: { color: "White", wattage: "750W" },
//         isDefault: true,
//         specifications: [
//           { key: "Jars", value: "3 Jars" },
//           { key: "Capacity", value: "1.5L Wet Jar" },
//           { key: "Warranty", value: "2 Years" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/preethi-mixer-1.jpg",
//           altText: "Full view",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/preethi-mixer-2.jpg",
//           altText: "Jars detail",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/preethi-mixer-3.jpg",
//           altText: "Control panel",
//           sortOrder: 2,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 24,
//           unit: "months",
//           description: "2 year warranty",
//         },
//       ],
//       returnPolicy: [
//         { type: "NO_RETURN", duration: null, unit: null, conditions: null },
//       ],
//     },

//     // Beauty & Personal Care > Skincare
//     {
//       name: "CeraVe Moisturizing Cream",
//       description: "Hydrating cream for dry skin",
//       brand: "CeraVe",
//       categoryName: "Skincare (Face Wash, Creams)",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "CERAVECREAM001",
//         price: 19.99,
//         mrp: 24.99,
//         stock: 200,
//         attributes: { size: "16oz", type: "Face & Body" },
//         isDefault: true,
//         specifications: [
//           { key: "Ingredients", value: "Ceramides, Hyaluronic Acid" },
//           { key: "Skin Type", value: "Dry to Very Dry" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/cerave-cream-1.jpg",
//           altTexture: "Product jar",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "5-7 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Sports & Outdoors > Gym Equipment
//     {
//       name: "Adjustable Dumbbells Set",
//       description: "Versatile weights for home workouts",
//       brand: "Bowflex",
//       categoryName: "Gym Equipment",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "BOWFLEXDUM001",
//         price: 199.99,
//         mrp: 249.99,
//         stock: 25,
//         attributes: { weightRange: "5-52.5 lbs", set: "Pair" },
//         isDefault: true,
//         specifications: [
//           { key: "Material", value: "Cast Iron" },
//           { key: "Adjustment", value: "15 Weight Settings" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/dumbbells-1.jpg",
//           altText: "Set view",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/dumbbells-2.jpg",
//           altText: "Adjustment mechanism",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "7-10 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [
//         {
//           type: "MANUFACTURER",
//           duration: 12,
//           unit: "months",
//           description: "1 year warranty",
//         },
//       ],
//       returnPolicy: [],
//     },

//     // Books & Stationery > Fiction & NonFiction Books
//     {
//       name: "The Alchemist",
//       description: "Inspirational novel by Paulo Coelho",
//       brand: "HarperOne",
//       categoryName: "Fiction & NonFiction Books",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "ALCHEMIST001",
//         price: 12.99,
//         mrp: 15.99,
//         stock: 150,
//         attributes: { format: "Paperback", pages: "208" },
//         isDefault: true,
//         specifications: [
//           { key: "Genre", value: "Fiction" },
//           { key: "Language", value: "English" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/alchemist-book-1.jpg",
//           altText: "Book cover",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [],
//       warranty: [],
//       returnPolicy: [
//         {
//           type: "REPLACEMENT",
//           duration: 7,
//           unit: "days",
//           conditions: "Damaged copy",
//         },
//       ],
//     },

//     // Toys & Games > Action Figures
//     {
//       name: "Marvel Spider-Man Figure",
//       description: "12-inch articulated action figure",
//       brand: "Hasbro",
//       categoryName: "Action Figures",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "SPIDERMANFIG001",
//         price: 24.99,
//         mrp: 29.99,
//         stock: 80,
//         attributes: { scale: "1:6", age: "8+" },
//         isDefault: true,
//         specifications: [
//           { key: "Articulation", value: "30 Points" },
//           { key: "Accessories", value: "Web Shooters Included" },
//         ],
//       },
//       images: [
//         {
//           url: "https://example.com/images/spiderman-fig-1.jpg",
//           altText: "Full figure",
//           sortOrder: 0,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//         {
//           url: "https://example.com/images/spiderman-fig-2.jpg",
//           altText: "Pose example",
//           sortOrder: 1,
//           mediaType: "PRIMARY",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         {
//           title: "Standard Delivery",
//           description: "5-7 days",
//           isDefault: true,
//         },
//       ],
//       warranty: [],
//       returnPolicy: [],
//     },
//   ];

//   let createdCount = 0;
//   for (const productData of productsData) {
//     try {
//       const seller = await createOrGetSeller(productData.sellerEmail, "", ""); // Reuse existing
//       const category = await prisma.category.findUnique({
//         where: { name: productData.categoryName },
//       });

//       if (!category) {
//         console.warn(
//           `Category "${productData.categoryName}" not found, skipping product "${productData.name}"`
//         );
//         continue;
//       }

//       const input = {
//         ...productData,
//         categoryId: category.id,
//         sellerId: seller.id,
//       };
//       delete input.sellerEmail;
//       delete input.categoryName;

//       const product = await createProduct(input, seller.id, category.id);
//       console.log(`✅ Created product: ${product.name} (ID: ${product.id})`);
//       createdCount++;
//     } catch (error) {
//       console.error(
//         `❌ Error creating product "${productData.name}":`,
//         error.message
//       );
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
