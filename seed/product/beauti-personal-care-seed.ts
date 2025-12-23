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
//     // Beauty 1: Estée Lauder Advanced Night Repair
//     {
//       name: "Estée Lauder Advanced Night Repair Serum",
//       description: "Synchronized Multi-Recovery Complex for radiant skin",
//       brand: "Estée Lauder",
//       categoryName: "Skincare",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "ELANR-001",
//         price: 105.0,
//         mrp: 125.0,
//         stock: 45,
//         attributes: { size: "50ml", type: "Serum" },
//         specifications: [
//           { key: "Skin Type", value: "All skin types" },
//           { key: "Key Ingredient", value: "Hyaluronic Acid" },
//           { key: "Benefits", value: "Anti-aging, Hydration" },
//           { key: "Usage", value: "Night time" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
//           altText: "Estée Lauder Night Repair",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       warranty: [],
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unopened only",
//         },
//       ],
//     },

//     // Beauty 2: Olaplex No. 3 Hair Perfector
//     {
//       name: "Olaplex No. 3 Hair Perfector Treatment",
//       description: "Professional bond-building treatment for damaged hair",
//       brand: "Olaplex",
//       categoryName: "Haircare",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "OLAPLEX3-001",
//         price: 28.0,
//         mrp: 30.0,
//         stock: 85,
//         attributes: { size: "100ml", hairType: "All" },
//         specifications: [
//           { key: "Hair Type", value: "Damaged/Color-treated" },
//           { key: "Technology", value: "Bond Building" },
//           { key: "Usage", value: "Weekly treatment" },
//           { key: "Sulfate Free", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1526947425960-945c6e72858f",
//           altText: "Olaplex Hair Treatment",
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
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 3: Charlotte Tilbury Pillow Talk Lipstick
//     {
//       name: "Charlotte Tilbury Matte Revolution Lipstick - Pillow Talk",
//       description: "Iconic nude-pink matte lipstick for all skin tones",
//       brand: "Charlotte Tilbury",
//       categoryName: "Makeup",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "CTPILLOW-001",
//         price: 34.0,
//         mrp: 38.0,
//         stock: 120,
//         attributes: { shade: "Pillow Talk", finish: "Matte" },
//         specifications: [
//           { key: "Finish", value: "Matte" },
//           { key: "Coverage", value: "Full" },
//           { key: "Features", value: "Long-wearing" },
//           { key: "Cruelty Free", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
//           altText: "Charlotte Tilbury Lipstick",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 4: La Mer Moisturizing Cream
//     {
//       name: "La Mer Crème de la Mer Moisturizing Cream",
//       description: "Legendary miracle broth moisturizer for transformation",
//       brand: "La Mer",
//       categoryName: "Skincare",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "LAMERCREME-001",
//         price: 345.0,
//         mrp: 380.0,
//         stock: 20,
//         attributes: { size: "60ml", type: "Moisturizer" },
//         specifications: [
//           { key: "Skin Type", value: "Dry to Normal" },
//           { key: "Key Ingredient", value: "Miracle Broth" },
//           { key: "Texture", value: "Rich Cream" },
//           { key: "Benefits", value: "Healing, Hydrating" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1556228720-da4e85f25e15",
//           altText: "La Mer Moisturizing Cream",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Luxury Express", description: "1-2 days", isDefault: true },
//       ],
//       warranty: [],
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "Unused with seal",
//         },
//       ],
//     },

//     // Beauty 5: Dyson Airwrap Styler
//     {
//       name: "Dyson Airwrap Complete Long Multi-Styler",
//       description: "Revolutionary hair styler using Coanda airflow",
//       brand: "Dyson",
//       categoryName: "Hair Tools",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "DYSONAIR-001",
//         price: 599.99,
//         mrp: 649.99,
//         stock: 15,
//         attributes: { color: "Nickel/Copper", barrels: "6 attachments" },
//         specifications: [
//           { key: "Technology", value: "Coanda Effect" },
//           { key: "Heat Settings", value: "3 + Cold Shot" },
//           { key: "Attachments", value: "6 included" },
//           { key: "Hair Type", value: "Long hair" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da",
//           altText: "Dyson Airwrap",
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
//           description: "2-year Dyson warranty",
//         },
//       ],
//       returnPolicy: [
//         {
//           type: "REFUND",
//           duration: 30,
//           unit: "days",
//           conditions: "All attachments included",
//         },
//       ],
//     },

//     // Beauty 6: The Ordinary Niacinamide
//     {
//       name: "The Ordinary Niacinamide 10% + Zinc 1%",
//       description: "High-strength vitamin and mineral blemish formula",
//       brand: "The Ordinary",
//       categoryName: "Skincare",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "ORDNIAC-001",
//         price: 10.2,
//         mrp: 12.0,
//         stock: 250,
//         attributes: { size: "30ml", concentration: "10%" },
//         specifications: [
//           { key: "Active Ingredient", value: "10% Niacinamide" },
//           { key: "Supporting", value: "1% Zinc PCA" },
//           { key: "Benefits", value: "Pore Minimizing" },
//           { key: "Vegan", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7c6",
//           altText: "The Ordinary Niacinamide",
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
//         { type: "REFUND", duration: 14, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 7: MAC Ruby Woo Lipstick
//     {
//       name: "MAC Retro Matte Lipstick - Ruby Woo",
//       description: "Iconic vivid blue-red matte lipstick",
//       brand: "MAC",
//       categoryName: "Makeup",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "MACRUBYWOO-001",
//         price: 24.0,
//         mrp: 28.0,
//         stock: 95,
//         attributes: { shade: "Ruby Woo", finish: "Retro Matte" },
//         specifications: [
//           { key: "Finish", value: "Retro Matte" },
//           { key: "Undertone", value: "Blue-Red" },
//           { key: "Coverage", value: "Full" },
//           { key: "Duration", value: "8 hours" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1631214500218-f8c9b0f0f6e8",
//           altText: "MAC Ruby Woo",
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
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 8: Dove Body Wash
//     {
//       name: "Dove Deep Moisture Body Wash",
//       description: "Nourishing body wash with NutriumMoisture technology",
//       brand: "Dove",
//       categoryName: "Body Care",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "DOVEBODY-001",
//         price: 8.99,
//         mrp: 11.99,
//         stock: 180,
//         attributes: { size: "500ml", scent: "Original" },
//         specifications: [
//           { key: "Formula", value: "NutriumMoisture" },
//           { key: "Skin Type", value: "All" },
//           { key: "pH", value: "Balanced" },
//           { key: "Sulfate Free", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1607006344380-47cea5cd2f72",
//           altText: "Dove Body Wash",
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
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 9: Tom Ford Black Orchid
//     {
//       name: "Tom Ford Black Orchid Eau de Parfum",
//       description: "Luxurious and sensual fragrance with black truffle",
//       brand: "Tom Ford",
//       categoryName: "Fragrances",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "TFBLACKOR-001",
//         price: 168.0,
//         mrp: 195.0,
//         stock: 35,
//         attributes: { size: "100ml", type: "EDP" },
//         specifications: [
//           { key: "Concentration", value: "Eau de Parfum" },
//           { key: "Top Notes", value: "Truffle, Ylang-Ylang" },
//           { key: "Heart Notes", value: "Black Orchid, Lotus Wood" },
//           { key: "Base Notes", value: "Patchouli, Vanilla" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1541643600914-78b084683601",
//           altText: "Tom Ford Black Orchid",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Sealed product only",
//         },
//       ],
//     },

//     // Beauty 10: Gillette Fusion5 ProGlide
//     {
//       name: "Gillette Fusion5 ProGlide Razor with FlexBall",
//       description: "Advanced 5-blade razor with FlexBall technology",
//       brand: "Gillette",
//       categoryName: "Men's Grooming",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "GILLPROG-001",
//         price: 24.99,
//         mrp: 29.99,
//         stock: 110,
//         attributes: { type: "Manual", blades: "4 cartridges" },
//         specifications: [
//           { key: "Blades", value: "5 Anti-friction" },
//           { key: "Technology", value: "FlexBall" },
//           { key: "Lubrication", value: "Enhanced Strip" },
//           { key: "Precision Trimmer", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1621607505833-92b66088a825",
//           altText: "Gillette ProGlide",
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

//     // Beauty 11: Fenty Beauty Pro Filt'r Foundation
//     {
//       name: "Fenty Beauty Pro Filt'r Soft Matte Foundation",
//       description: "Longwear foundation in 50 shades for all skin tones",
//       brand: "Fenty Beauty",
//       categoryName: "Makeup",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "FENTYFOUND-001",
//         price: 38.0,
//         mrp: 42.0,
//         stock: 75,
//         attributes: { shade: "240", finish: "Soft Matte" },
//         specifications: [
//           { key: "Coverage", value: "Medium to Full" },
//           { key: "Finish", value: "Soft Matte" },
//           { key: "Wear Time", value: "12 hours" },
//           { key: "SPF", value: "None" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
//           altText: "Fenty Beauty Foundation",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 12: Neutrogena Hydro Boost
//     {
//       name: "Neutrogena Hydro Boost Water Gel",
//       description: "Hydrating water gel with hyaluronic acid",
//       brand: "Neutrogena",
//       categoryName: "Skincare",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "NEUHYDRO-001",
//         price: 19.99,
//         mrp: 24.99,
//         stock: 140,
//         attributes: { size: "50ml", type: "Gel Cream" },
//         specifications: [
//           { key: "Key Ingredient", value: "Hyaluronic Acid" },
//           { key: "Skin Type", value: "Normal to Oily" },
//           { key: "Oil-Free", value: "Yes" },
//           { key: "Non-Comedogenic", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28c",
//           altText: "Neutrogena Hydro Boost",
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
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 13: Oral-B iO Series 9
//     {
//       name: "Oral-B iO Series 9 Electric Toothbrush",
//       description: "AI-powered electric toothbrush with magnetic drive",
//       brand: "Oral-B",
//       categoryName: "Oral Care",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "ORALBIO9-001",
//         price: 279.99,
//         mrp: 329.99,
//         stock: 30,
//         attributes: { color: "Black Onyx", modes: "7" },
//         specifications: [
//           { key: "Technology", value: "Magnetic iO" },
//           { key: "Cleaning Modes", value: "7" },
//           { key: "Pressure Sensor", value: "Smart" },
//           { key: "Battery Life", value: "2+ weeks" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609207908652-6576c69b05ef",
//           altText: "Oral-B iO Series 9",
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
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unused" },
//       ],
//     },

//     // Beauty 14: NARS Orgasm Blush
//     {
//       name: "NARS Blush - Orgasm",
//       description: "Iconic peachy-pink blush with golden shimmer",
//       brand: "NARS",
//       categoryName: "Makeup",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "NARSORG-001",
//         price: 32.0,
//         mrp: 35.0,
//         stock: 88,
//         attributes: { shade: "Orgasm", finish: "Shimmer" },
//         specifications: [
//           { key: "Shade", value: "Peachy Pink" },
//           { key: "Finish", value: "Golden Shimmer" },
//           { key: "Buildable", value: "Yes" },
//           { key: "Skin Tone", value: "Universal" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1619451334763-32b5ec22e93f",
//           altText: "NARS Orgasm Blush",
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
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 15: Kerastase Elixir Ultime
//     {
//       name: "Kerastase Elixir Ultime Hair Oil",
//       description: "Luxurious beautifying oil for all hair types",
//       brand: "Kerastase",
//       categoryName: "Haircare",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "KERAELIXIR-001",
//         price: 58.0,
//         mrp: 65.0,
//         stock: 55,
//         attributes: { size: "100ml", type: "Hair Oil" },
//         specifications: [
//           { key: "Oils", value: "Argan, Camellia, Maize" },
//           { key: "Benefits", value: "Shine, Protection" },
//           { key: "Heat Protection", value: "Up to 230°C" },
//           { key: "Hair Type", value: "All" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1608248597279-f99c6df844eb",
//           altText: "Kerastase Elixir",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 16: Clinique Moisture Surge
//     {
//       name: "Clinique Moisture Surge 100H Auto-Replenishing Hydrator",
//       description: "Refreshing gel-cream for 100 hours of hydration",
//       brand: "Clinique",
//       categoryName: "Skincare",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "CLINMOIST-001",
//         price: 44.0,
//         mrp: 52.0,
//         stock: 70,
//         attributes: { size: "50ml", type: "Gel-Cream" },
//         specifications: [
//           { key: "Skin Type", value: "All" },
//           { key: "Hydration", value: "100 hours" },
//           { key: "Formula", value: "Oil-Free" },
//           { key: "Allergy Tested", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1570172568644-b6dd0c102dfc",
//           altText: "Clinique Moisture Surge",
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
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 17: Urban Decay Naked3 Palette
//     {
//       name: "Urban Decay Naked3 Eyeshadow Palette",
//       description: "12 rose-hued neutral eyeshadows in matte and shimmer",
//       brand: "Urban Decay",
//       categoryName: "Makeup",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "UDNAKED3-001",
//         price: 54.0,
//         mrp: 60.0,
//         stock: 48,
//         attributes: { shades: "12", tones: "Rose Gold" },
//         specifications: [
//           { key: "Shades", value: "12" },
//           { key: "Finishes", value: "Matte, Shimmer, Metallic" },
//           { key: "Pigmentation", value: "High" },
//           { key: "Mirror", value: "Included" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
//           altText: "Urban Decay Naked3",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 18: Laneige Lip Sleeping Mask
//     {
//       name: "Laneige Lip Sleeping Mask",
//       description: "Overnight lip treatment with vitamin C and antioxidants",
//       brand: "Laneige",
//       categoryName: "Skincare",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "LANEIGELIP-001",
//         price: 24.0,
//         mrp: 28.0,
//         stock: 165,
//         attributes: { size: "20g", flavor: "Berry" },
//         specifications: [
//           { key: "Type", value: "Leave-on Mask" },
//           { key: "Key Ingredients", value: "Vitamin C, Berry Mix" },
//           { key: "Usage", value: "Overnight" },
//           { key: "Benefits", value: "Hydration, Repair" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1610918875488-b2d5a1487c60",
//           altText: "Laneige Lip Mask",
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
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 19: Maybelline Great Lash Mascara
//     {
//       name: "Maybelline Great Lash Mascara",
//       description: "Classic pink and green mascara for defined lashes",
//       brand: "Maybelline",
//       categoryName: "Makeup",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "MAYBLASH-001",
//         price: 7.99,
//         mrp: 9.99,
//         stock: 220,
//         attributes: { color: "Very Black", type: "Regular" },
//         specifications: [
//           { key: "Formula", value: "Classic" },
//           { key: "Brush", value: "Building Brush" },
//           { key: "Waterproof", value: "No" },
//           { key: "Ophthalmologist Tested", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1631730486784-5456dc86af24",
//           altText: "Maybelline Great Lash",
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
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 20: Bath & Body Works Body Cream
//     {
//       name: "Bath & Body Works Japanese Cherry Blossom Body Cream",
//       description: "Ultra-rich body cream with shea butter",
//       brand: "Bath & Body Works",
//       categoryName: "Body Care",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "BBWCHERRY-001",
//         price: 15.5,
//         mrp: 18.5,
//         stock: 130,
//         attributes: { size: "226g", scent: "Japanese Cherry Blossom" },
//         specifications: [
//           { key: "Key Ingredients", value: "Shea Butter, Vitamin E" },
//           { key: "Scent Notes", value: "Cherry Blossom, Asian Pear" },
//           { key: "Hydration", value: "24 hours" },
//           { key: "Texture", value: "Ultra Rich" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1619451439025-2ab53104f367",
//           altText: "Bath & Body Works Cream",
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
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 21: Philips Lumea IPL
//     {
//       name: "Philips Lumea Prestige IPL Hair Removal Device",
//       description: "IPL technology for permanent hair reduction at home",
//       brand: "Philips",
//       categoryName: "Hair Removal",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "PHILUMEA-001",
//         price: 449.99,
//         mrp: 549.99,
//         stock: 22,
//         attributes: { model: "BRI956", attachments: "4" },
//         specifications: [
//           { key: "Technology", value: "IPL" },
//           { key: "Flashes", value: "450,000" },
//           { key: "Attachments", value: "Face, Body, Bikini, Underarms" },
//           { key: "Skin Sensor", value: "SmartSkin" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609207908645-d3a85c123451",
//           altText: "Philips Lumea IPL",
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
//           duration: 90,
//           unit: "days",
//           conditions: "100-day trial",
//         },
//       ],
//     },

//     // Beauty 22: Drunk Elephant C-Firma
//     {
//       name: "Drunk Elephant C-Firma Fresh Day Serum",
//       description: "Potent vitamin C serum with 15% L-ascorbic acid",
//       brand: "Drunk Elephant",
//       categoryName: "Skincare",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "DECFIRMA-001",
//         price: 78.0,
//         mrp: 85.0,
//         stock: 40,
//         attributes: { size: "28ml", type: "Vitamin C Serum" },
//         specifications: [
//           { key: "Vitamin C", value: "15% L-Ascorbic Acid" },
//           { key: "Additional", value: "Ferulic Acid, Vitamin E" },
//           { key: "pH Level", value: "3.3" },
//           { key: "Clean Beauty", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1617897903246-719242683b5f",
//           altText: "Drunk Elephant C-Firma",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 23: Anastasia Beverly Hills Brow Wiz
//     {
//       name: "Anastasia Beverly Hills Brow Wiz",
//       description: "Ultra-slim mechanical brow pencil for precise application",
//       brand: "Anastasia Beverly Hills",
//       categoryName: "Makeup",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "ABHBROWWIZ-001",
//         price: 25.0,
//         mrp: 28.0,
//         stock: 105,
//         attributes: { shade: "Medium Brown", tip: "Ultra-fine" },
//         specifications: [
//           { key: "Type", value: "Mechanical Pencil" },
//           { key: "Tip", value: "Ultra-fine 0.085g" },
//           { key: "Spoolie", value: "Included" },
//           { key: "Waterproof", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1616944317170-1a3e6c94725e",
//           altText: "ABH Brow Wiz",
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
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 24: Old Spice Deodorant
//     {
//       name: "Old Spice High Endurance Deodorant Stick",
//       description: "Long-lasting deodorant with classic fresh scent",
//       brand: "Old Spice",
//       categoryName: "Men's Grooming",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "OLDSPICE-001",
//         price: 5.99,
//         mrp: 7.99,
//         stock: 195,
//         attributes: { size: "85g", scent: "Fresh" },
//         specifications: [
//           { key: "Type", value: "Stick" },
//           { key: "Protection", value: "48 hours" },
//           { key: "Aluminum Free", value: "No" },
//           { key: "Scent", value: "Classic Fresh" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609167921186-14bb66d72e38",
//           altText: "Old Spice Deodorant",
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
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Personal hygiene item",
//         },
//       ],
//     },

//     // Beauty 25: Jo Malone London Cologne
//     {
//       name: "Jo Malone London English Pear & Freesia Cologne",
//       description: "Quintessentially English fragrance with mellow fruitiness",
//       brand: "Jo Malone",
//       categoryName: "Fragrances",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "JOMALONE-001",
//         price: 142.0,
//         mrp: 155.0,
//         stock: 28,
//         attributes: { size: "100ml", type: "Cologne" },
//         specifications: [
//           { key: "Top Notes", value: "King William Pear" },
//           { key: "Heart Notes", value: "Freesia" },
//           { key: "Base Notes", value: "Patchouli, Amber, Woods" },
//           { key: "Intensity", value: "Light" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc",
//           altText: "Jo Malone Cologne",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Luxury Express", description: "1-2 days", isDefault: true },
//       ],
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Sealed product only",
//         },
//       ],
//     },

//     // Beauty 26: Tatcha The Water Cream
//     {
//       name: "Tatcha The Water Cream",
//       description: "Japanese water gel moisturizer for pore refinement",
//       brand: "Tatcha",
//       categoryName: "Skincare",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "TATWATER-001",
//         price: 68.0,
//         mrp: 75.0,
//         stock: 52,
//         attributes: { size: "50ml", type: "Water Cream" },
//         specifications: [
//           { key: "Key Ingredients", value: "Japanese Wild Rose, Leopard Lily" },
//           { key: "Technology", value: "Hadasei-3" },
//           { key: "Benefits", value: "Oil-Free Hydration" },
//           { key: "Skin Type", value: "Normal to Oily" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609097164982-29d215ca6d04",
//           altText: "Tatcha Water Cream",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 27: Benefit They're Real! Mascara
//     {
//       name: "Benefit They're Real! Lengthening Mascara",
//       description: "Jet-black mascara for dramatic length and curl",
//       brand: "Benefit",
//       categoryName: "Makeup",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "BENREAL-001",
//         price: 27.0,
//         mrp: 30.0,
//         stock: 92,
//         attributes: { color: "Jet Black", size: "8.5g" },
//         specifications: [
//           { key: "Benefits", value: "Lengthening, Volumizing" },
//           { key: "Brush", value: "Custom Domed Tip" },
//           { key: "Formula", value: "Long-wearing" },
//           { key: "Removal", value: "Warm Water" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1599732625970-3af1fb24e158",
//           altText: "Benefit Mascara",
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
//       returnPolicy: [
//         {
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Hygiene product",
//         },
//       ],
//     },

//     // Beauty 28: Moroccanoil Treatment
//     {
//       name: "Moroccanoil Treatment Original",
//       description: "Argan oil treatment for all hair types",
//       brand: "Moroccanoil",
//       categoryName: "Haircare",
//       sellerEmail: "seller1@test.com",
//       variants: {
//         sku: "MOROIL-001",
//         price: 44.0,
//         mrp: 48.0,
//         stock: 78,
//         attributes: { size: "100ml", type: "Oil Treatment" },
//         specifications: [
//           { key: "Key Ingredient", value: "Argan Oil" },
//           { key: "Benefits", value: "Shine, Manageability" },
//           { key: "Hair Type", value: "All" },
//           { key: "Usage", value: "Wet or Dry Hair" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
//           altText: "Moroccanoil Treatment",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
//       ],
//     },

//     // Beauty 29: Crest 3D White Strips
//     {
//       name: "Crest 3D White Professional Effects Whitestrips",
//       description: "Professional-level teeth whitening at home",
//       brand: "Crest",
//       categoryName: "Oral Care",
//       sellerEmail: "seller2@test.com",
//       variants: {
//         sku: "CREST3D-001",
//         price: 44.99,
//         mrp: 54.99,
//         stock: 85,
//         attributes: { treatments: "20", duration: "30 minutes" },
//         specifications: [
//           { key: "Treatments", value: "20 (10 upper, 10 lower)" },
//           { key: "Duration", value: "30 minutes daily" },
//           { key: "Results", value: "Professional-level" },
//           { key: "Enamel Safe", value: "Yes" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1609207908652-6576c69b05ef",
//           altText: "Crest Whitestrips",
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
//           type: "NO_RETURN",
//           duration: null,
//           unit: null,
//           conditions: "Opened hygiene product",
//         },
//       ],
//     },

//     // Beauty 30: Sol de Janeiro Brazilian Bum Bum Cream
//     {
//       name: "Sol de Janeiro Brazilian Bum Bum Cream",
//       description: "Fast-absorbing body cream with guaraná caffeine",
//       brand: "Sol de Janeiro",
//       categoryName: "Body Care",
//       sellerEmail: "seller3@test.com",
//       variants: {
//         sku: "SOLBUMBUM-001",
//         price: 48.0,
//         mrp: 52.0,
//         stock: 95,
//         attributes: { size: "240ml", scent: "Cheirosa '62" },
//         specifications: [
//           { key: "Key Ingredient", value: "Guaraná Caffeine Complex" },
//           { key: "Scent", value: "Pistachio, Salted Caramel" },
//           { key: "Benefits", value: "Tightening, Smoothing" },
//           { key: "Texture", value: "Fast-absorbing" },
//         ],
//       },
//       images: [
//         {
//           url: "https://images.unsplash.com/photo-1619451683138-d1732c576493",
//           altText: "Sol de Janeiro Cream",
//           fileType: "IMAGE",
//         },
//       ],
//       deliveryOptions: [
//         { title: "Express Delivery", description: "2-3 days", isDefault: true },
//       ],
//       returnPolicy: [
//         { type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" },
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

//       if (!seller) {
//         console.warn(
//           `⚠️ Seller "${productData.sellerEmail}" not found/created — skipping "${productData.name}"`
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
