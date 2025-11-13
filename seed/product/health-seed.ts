// import { prisma } from "@/lib/db/prisma";

// function slugify(name: string) {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)+/g, "");
// }

// async function createOrGetSeller(
//   email: string,
//   firstName: string,
//   lastName: string
// ) {
//   let seller = await prisma.user.findUnique({ where: { email } });
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
//     await createOrGetSeller("seller1@test.com", "John", "Doe"),
//     await createOrGetSeller("seller2@test.com", "Jane", "Smith"),
//     await createOrGetSeller("seller3@test.com", "Mike", "Johnson"),
//   ];

//   const productsData = [
//     // 1. Multivitamin
//     {
//       name: "Nature Made Multivitamin for Men",
//       description:
//         "Daily multivitamin for men's health with essential nutrients",
//       brand: "Nature Made",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "NM-MULTI001",
//         price: 12.99,
//         mrp: 17.99,
//         stock: 200,
//         attributes: { size: "90 tablets", type: "Men's" },
//         specifications: [
//           { key: "Type", value: "Multivitamin" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Nature Made multivitamin",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 2. Omega-3 Fish Oil
//     {
//       name: "Nordic Naturals Omega-3 Fish Oil",
//       description: "High-potency omega-3 for heart and brain health",
//       brand: "Nordic Naturals",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "NORDIC-OMEGA001",
//         price: 24.99,
//         mrp: 29.99,
//         stock: 150,
//         attributes: { size: "120 softgels", strength: "1000mg" },
//         specifications: [
//           { key: "Type", value: "Fish Oil" },
//           { key: "Allergen", value: "Contains fish" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Nordic Naturals fish oil",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 3. Protein Powder
//     {
//       name: "Optimum Nutrition Whey Protein",
//       description: "Whey protein isolate for muscle recovery",
//       brand: "Optimum Nutrition",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "OPTI-WHEY001",
//         price: 39.99,
//         mrp: 49.99,
//         stock: 100,
//         attributes: { size: "2lb", flavor: "Chocolate" },
//         specifications: [
//           { key: "Type", value: "Whey Protein" },
//           { key: "Protein per Serving", value: "24g" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Optimum Nutrition whey protein",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 4. Vitamin D3
//     {
//       name: "NOW Foods Vitamin D3",
//       description: "High-potency vitamin D3 for bone health",
//       brand: "NOW Foods",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "NOW-D3001",
//         price: 9.99,
//         mrp: 12.99,
//         stock: 200,
//         attributes: { size: "120 softgels", strength: "5000 IU" },
//         specifications: [
//           { key: "Type", value: "Vitamin D3" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "NOW Foods vitamin D3",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 5. Probiotic
//     {
//       name: "Culturelle Daily Probiotic",
//       description: "Probiotic capsules for digestive health",
//       brand: "Culturelle",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "CULT-PROB001",
//         price: 19.99,
//         mrp: 24.99,
//         stock: 150,
//         attributes: { size: "50 capsules", type: "Daily" },
//         specifications: [
//           { key: "Type", value: "Probiotic" },
//           { key: "CFU Count", value: "10 Billion" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Culturelle probiotic",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 6. Collagen Peptides
//     {
//       name: "Vital Proteins Collagen Peptides",
//       description: "Unflavored collagen for skin, hair, and joint health",
//       brand: "Vital Proteins",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "VITAL-COLL001",
//         price: 27.99,
//         mrp: 34.99,
//         stock: 120,
//         attributes: { size: "20oz", flavor: "Unflavored" },
//         specifications: [
//           { key: "Type", value: "Collagen" },
//           { key: "Allergen", value: "Contains bovine" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Vital Proteins collagen",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 7. Vitamin C
//     {
//       name: "Emergen-C Immune+ Vitamin C",
//       description: "Effervescent vitamin C drink mix for immune support",
//       brand: "Emergen-C",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "EMERGEN-C001",
//         price: 14.99,
//         mrp: 19.99,
//         stock: 180,
//         attributes: { size: "30 packets", flavor: "Orange" },
//         specifications: [
//           { key: "Type", value: "Vitamin C" },
//           { key: "Strength", value: "1000mg" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Emergen-C vitamin C",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 8. Magnesium
//     {
//       name: "Doctor’s Best High Absorption Magnesium",
//       description: "Magnesium tablets for muscle and nerve support",
//       brand: "Doctor’s Best",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "DRBEST-MAG001",
//         price: 15.99,
//         mrp: 19.99,
//         stock: 150,
//         attributes: { size: "120 tablets", strength: "200mg" },
//         specifications: [
//           { key: "Type", value: "Magnesium" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Doctor’s Best magnesium",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 9. Vegan Protein Powder
//     {
//       name: "Orgain Organic Vegan Protein",
//       description: "Plant-based protein powder for muscle recovery",
//       brand: "Orgain",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "ORGAIN-VEGAN001",
//         price: 29.99,
//         mrp: 39.99,
//         stock: 100,
//         attributes: { size: "2.03lb", flavor: "Vanilla" },
//         specifications: [
//           { key: "Type", value: "Plant-Based Protein" },
//           { key: "Protein per Serving", value: "21g" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Orgain vegan protein",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 10. Turmeric Supplement
//     {
//       name: "Nature’s Bounty Turmeric Curcumin",
//       description: "Turmeric capsules for joint and inflammation support",
//       brand: "Nature’s Bounty",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "NB-TURMERIC001",
//         price: 12.99,
//         mrp: 16.99,
//         stock: 150,
//         attributes: { size: "60 capsules", strength: "1000mg" },
//         specifications: [
//           { key: "Type", value: "Turmeric" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Nature’s Bounty turmeric",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 11. Vitamin B12
//     {
//       name: "Garden of Life Vitamin B12",
//       description: "Vegan vitamin B12 for energy and metabolism",
//       brand: "Garden of Life",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "GOL-B12001",
//         price: 14.99,
//         mrp: 19.99,
//         stock: 180,
//         attributes: { size: "60 capsules", strength: "1000mcg" },
//         specifications: [
//           { key: "Type", value: "Vitamin B12" },
//           { key: "Vegan", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Garden of Life B12",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 12. Ashwagandha
//     {
//       name: "Gaia Herbs Ashwagandha Root",
//       description: "Herbal supplement for stress and energy support",
//       brand: "Gaia Herbs",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "GAIA-ASH001",
//         price: 19.99,
//         mrp: 24.99,
//         stock: 120,
//         attributes: { size: "60 capsules", strength: "700mg" },
//         specifications: [
//           { key: "Type", value: "Ashwagandha" },
//           { key: "Organic", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Gaia Herbs ashwagandha",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 13. Calcium Supplement
//     {
//       name: "Citracal Calcium + D3",
//       description: "Calcium citrate with vitamin D3 for bone health",
//       brand: "Citracal",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "CITRA-CAL001",
//         price: 13.99,
//         mrp: 17.99,
//         stock: 150,
//         attributes: { size: "120 caplets", strength: "600mg" },
//         specifications: [
//           { key: "Type", value: "Calcium" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Citracal calcium",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 14. Pre-Workout Supplement
//     {
//       name: "C4 Original Pre-Workout",
//       description: "Pre-workout powder for energy and focus",
//       brand: "Cellucor",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "C4-PREWORK001",
//         price: 29.99,
//         mrp: 39.99,
//         stock: 100,
//         attributes: { size: "30 servings", flavor: "Fruit Punch" },
//         specifications: [
//           { key: "Type", value: "Pre-Workout" },
//           { key: "Caffeine per Serving", value: "150mg" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "C4 pre-workout",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 15. Glucosamine
//     {
//       name: "Nature Made Glucosamine Chondroitin",
//       description: "Supplement for joint health and mobility",
//       brand: "Nature Made",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "NM-GLUCO001",
//         price: 22.99,
//         mrp: 29.99,
//         stock: 120,
//         attributes: { size: "90 caplets", strength: "1500mg" },
//         specifications: [
//           { key: "Type", value: "Glucosamine" },
//           { key: "Allergen", value: "Contains shellfish" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Nature Made glucosamine",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 16. Multivitamin for Women
//     {
//       name: "One A Day Women’s Multivitamin",
//       description: "Daily multivitamin tailored for women’s health",
//       brand: "One A Day",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "OADA-WMULTI001",
//         price: 11.99,
//         mrp: 15.99,
//         stock: 200,
//         attributes: { size: "100 tablets", type: "Women’s" },
//         specifications: [
//           { key: "Type", value: "Multivitamin" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "One A Day women’s multivitamin",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 17. CoQ10
//     {
//       name: "Qunol Ultra CoQ10",
//       description: "CoQ10 supplement for heart health and energy",
//       brand: "Qunol",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "QUNOL-COQ001",
//         price: 29.99,
//         mrp: 39.99,
//         stock: 100,
//         attributes: { size: "120 softgels", strength: "100mg" },
//         specifications: [
//           { key: "Type", value: "CoQ10" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Qunol CoQ10",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 18. Elderberry Gummies
//     {
//       name: "Sambucol Black Elderberry Gummies",
//       description: "Immune-supporting elderberry gummies",
//       brand: "Sambucol",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "SAMBU-ELDER001",
//         price: 14.99,
//         mrp: 19.99,
//         stock: 150,
//         attributes: { size: "60 gummies", flavor: "Berry" },
//         specifications: [
//           { key: "Type", value: "Elderberry" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Sambucol elderberry gummies",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 19. Melatonin
//     {
//       name: "Natrol Melatonin Sleep Aid",
//       description: "Melatonin gummies for better sleep",
//       brand: "Natrol",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "NATROL-MEL001",
//         price: 12.99,
//         mrp: 16.99,
//         stock: 180,
//         attributes: { size: "60 gummies", strength: "5mg" },
//         specifications: [
//           { key: "Type", value: "Melatonin" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Natrol melatonin gummies",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 20. Biotin
//     {
//       name: "Sports Research Biotin",
//       description: "Biotin supplement for hair, skin, and nails",
//       brand: "Sports Research",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "SPORT-BIOTIN001",
//         price: 14.99,
//         mrp: 19.99,
//         stock: 150,
//         attributes: { size: "120 softgels", strength: "10000mcg" },
//         specifications: [
//           { key: "Type", value: "Biotin" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Sports Research biotin",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 21. Zinc Supplement
//     {
//       name: "Thorne Research Zinc Picolinate",
//       description: "Zinc supplement for immune support",
//       brand: "Thorne Research",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "THORNE-ZINC001",
//         price: 16.99,
//         mrp: 21.99,
//         stock: 150,
//         attributes: { size: "60 capsules", strength: "30mg" },
//         specifications: [
//           { key: "Type", value: "Zinc" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Thorne Research zinc",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 22. Creatine
//     {
//       name: "MuscleTech Platinum Creatine",
//       description: "Micronized creatine monohydrate for muscle growth",
//       brand: "MuscleTech",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "MTECH-CREAT001",
//         price: 19.99,
//         mrp: 24.99,
//         stock: 100,
//         attributes: { size: "400g", type: "Unflavored" },
//         specifications: [
//           { key: "Type", value: "Creatine" },
//           { key: "Serving Size", value: "5g" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "MuscleTech creatine",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 23. Vitamin E
//     {
//       name: "Solgar Vitamin E",
//       description: "Vitamin E softgels for antioxidant support",
//       brand: "Solgar",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "SOLGAR-VE001",
//         price: 13.99,
//         mrp: 17.99,
//         stock: 150,
//         attributes: { size: "100 softgels", strength: "400 IU" },
//         specifications: [
//           { key: "Type", value: "Vitamin E" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Solgar vitamin E",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 24. Greens Powder
//     {
//       name: "Amazing Grass Green Superfood",
//       description: "Organic greens powder for daily nutrition",
//       brand: "Amazing Grass",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "AMGRASS-GREENS001",
//         price: 24.99,
//         mrp: 29.99,
//         stock: 120,
//         attributes: { size: "30 servings", flavor: "Original" },
//         specifications: [
//           { key: "Type", value: "Greens Powder" },
//           { key: "Organic", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Amazing Grass greens powder",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 25. Iron Supplement
//     {
//       name: "Nature Made Iron",
//       description: "Iron supplement for red blood cell support",
//       brand: "Nature Made",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "NM-IRON001",
//         price: 8.99,
//         mrp: 11.99,
//         stock: 200,
//         attributes: { size: "180 tablets", strength: "65mg" },
//         specifications: [
//           { key: "Type", value: "Iron" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Nature Made iron",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 26. Pill Organizer
//     {
//       name: "Ezy Dose Weekly Pill Organizer",
//       description: "7-day pill organizer for supplement management",
//       brand: "Ezy Dose",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "EZY-PILL001",
//         price: 9.99,
//         mrp: 12.99,
//         stock: 150,
//         attributes: { size: "7-day", color: "Clear" },
//         specifications: [
//           { key: "Type", value: "Pill Organizer" },
//           { key: "Material", value: "Plastic" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Ezy Dose pill organizer",
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
//           description: "1-year warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 27. BCAA Supplement
//     {
//       name: "Scivation Xtend BCAA",
//       description: "Branched-chain amino acids for muscle recovery",
//       brand: "Scivation",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "SCIV-BCAA001",
//         price: 27.99,
//         mrp: 34.99,
//         stock: 100,
//         attributes: { size: "30 servings", flavor: "Blue Raspberry" },
//         specifications: [
//           { key: "Type", value: "BCAA" },
//           { key: "Serving Size", value: "7g" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Scivation BCAA",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 28. Milk Thistle
//     {
//       name: "Jarrow Formulas Milk Thistle",
//       description: "Milk thistle supplement for liver health",
//       brand: "Jarrow Formulas",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "JARROW-MILK001",
//         price: 14.99,
//         mrp: 19.99,
//         stock: 150,
//         attributes: { size: "150 capsules", strength: "150mg" },
//         specifications: [
//           { key: "Type", value: "Milk Thistle" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Jarrow Formulas milk thistle",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 29. Vitamin A
//     {
//       name: "NOW Foods Vitamin A",
//       description: "Vitamin A softgels for eye and immune health",
//       brand: "NOW Foods",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller4@test.com",
//       variants: {
//         sku: "NOW-VITA001",
//         price: 8.99,
//         mrp: 11.99,
//         stock: 200,
//         attributes: { size: "100 softgels", strength: "10000 IU" },
//         specifications: [
//           { key: "Type", value: "Vitamin A" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "NOW Foods vitamin A",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
//       ],
//     },
//     // 30. Electrolyte Powder
//     {
//       name: "Liquid I.V. Hydration Multiplier",
//       description: "Electrolyte drink mix for hydration",
//       brand: "Liquid I.V.",
//       categoryName: "Vitamins & Supplements",
//       sellerEmail: "seller5@test.com",
//       variants: {
//         sku: "LIQUID-IV001",
//         price: 24.99,
//         mrp: 29.99,
//         stock: 120,
//         attributes: { size: "16 packets", flavor: "Lemon Lime" },
//         specifications: [
//           { key: "Type", value: "Electrolyte" },
//           { key: "Allergen", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//           altText: "Liquid I.V. hydration",
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
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened with original packaging",
//         },
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
