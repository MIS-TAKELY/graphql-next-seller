// import { prisma } from "@/lib/db/prisma";

// function slugify(name: string) {
//     return name
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, "-")
//         .replace(/(^-|-$)+/g, "");
// }

// async function createOrGetSeller(
//     email: string,
//     firstName: string = "Seller",
//     lastName: string = "Account"
// ) {
//     let seller = await prisma.user.findUnique({
//         where: { email },
//         include: { roles: true },
//     });

//     if (!seller) {
//         const baseUsername = email.split("@")[0];
//         let username = baseUsername;
//         let counter = 1;

//         // Ensure unique username
//         while (await prisma.user.findUnique({ where: { username } })) {
//             username = `${baseUsername}${counter}`;
//             counter++;
//         }

//         seller = await prisma.user.create({
//             data: {
//                 email,
//                 username,
//                 firstName,
//                 lastName,
//                 name: `${firstName} ${lastName}`.trim(),
//                 roles: {
//                     create: [
//                         {
//                             role: "SELLER",
//                         },
//                     ],
//                 },
//             },
//             include: { roles: true },
//         });
//         console.log(`Created seller: ${email} with username ${username} and SELLER role`);
//     } else {
//         // Check if user already has SELLER role
//         const hasSellerRole = seller.roles.some((r) => r.role === "SELLER");

//         if (!hasSellerRole && seller) {
//             await prisma.userRole.create({
//                 data: {
//                     userId: seller.id,
//                     role: "SELLER",
//                 },
//             });
//             console.log(`Added SELLER role to existing user: ${email}`);
//         }
//     }

//     // Return fresh user with roles
//     return await prisma.user.findUnique({
//         where: { email },
//         include: { roles: true },
//     });
// }

// async function createProduct(
//     input: any,
//     sellerId: string,
//     categoryId: string
// ) {
//     const slug = slugify(input.name);
//     let uniqueSlug = slug;
//     let counter = 1;
//     while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
//         uniqueSlug = `${slug}-${counter}`;
//         counter++;
//     }

//     // Convert specifications to specificationTable (JSON)
//     const specTable = input.variants.specifications?.reduce((acc: any, spec: any) => {
//         acc[spec.key] = spec.value;
//         return acc;
//     }, {}) || {};

//     // Extract features from specifications or use empty array
//     const features = input.variants.specifications?.map((spec: any) => `${spec.key}: ${spec.value}`) || [];

//     return await prisma.$transaction(
//         async (tx) => {
//             const newProduct = await tx.product.create({
//                 data: {
//                     name: input.name,
//                     slug: uniqueSlug,
//                     description: input.description || "",
//                     status: "INACTIVE",
//                     categoryId,
//                     brand: input.brand || "Generic",
//                     sellerId,
//                     features: features,
//                     specificationTable: specTable,
//                     variants: {
//                         create: {
//                             sku: input.variants.sku,
//                             price: input.variants.price,
//                             mrp: input.variants.mrp || input.variants.price,
//                             stock: input.variants.stock,
//                             attributes: input.variants.attributes || {},
//                             isDefault: input.variants.isDefault !== false,
//                             specificationTable: specTable,
//                             specifications:
//                                 input.variants.specifications?.length > 0
//                                     ? {
//                                         create: input.variants.specifications.map((spec: any) => ({
//                                             key: spec.key,
//                                             value: spec.value,
//                                         })),
//                                     }
//                                     : undefined,
//                         },
//                     },
//                     images: {
//                         create: input.images.map((img: any, index: number) => ({
//                             url: img.url,
//                             altText: img.altText || null,
//                             sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
//                             mediaType: img.mediaType || "PRIMARY",
//                             fileType: img.fileType,
//                         })),
//                     },
//                 },
//             });

//             if (input.deliveryOptions?.length > 0) {
//                 await tx.deliveryOption.createMany({
//                     data: input.deliveryOptions.map((option: any) => ({
//                         productId: newProduct.id,
//                         title: option.title,
//                         description: option.description || null,
//                         isDefault: option.isDefault || false,
//                     })),
//                 });
//             }

//             if (input.warranty?.length > 0) {
//                 await tx.warranty.createMany({
//                     data: input.warranty.map((warranty: any) => ({
//                         productId: newProduct.id,
//                         type: warranty.type,
//                         duration: warranty.duration || null,
//                         unit: warranty.unit || null,
//                         description: warranty.description || null,
//                     })),
//                 });
//             }

//             if (input.returnPolicy?.length > 0) {
//                 await tx.returnPolicy.createMany({
//                     data: input.returnPolicy.map((policy: any) => ({
//                         productId: newProduct.id,
//                         type: policy.type,
//                         duration: policy.duration || null,
//                         unit: policy.unit || null,
//                         conditions: policy.conditions || null,
//                     })),
//                 });
//             }

//             return newProduct;
//         },
//         { timeout: 15000 }
//     );
// }

// async function main() {
//     const sellers = [
//         await createOrGetSeller("seller1@test.com", "John", "Doe"),
//         await createOrGetSeller("seller2@test.com", "Jane", "Smith"),
//         await createOrGetSeller("seller3@test.com", "Mike", "Johnson"),
//     ];

//     const productsData = [
//         // 1. Non-Stick Frying Pan
//         {
//             name: "T-fal E765SC Non-Stick Fry Pan",
//             description: "12-inch non-stick frying pan with Thermo-Spot technology",
//             brand: "T-fal",
//             categoryName: "Cookware",
//             sellerEmail: "seller1@test.com",
//             variants: {
//                 sku: "TFAL-FRY001",
//                 price: 29.99,
//                 mrp: 39.99,
//                 stock: 100,
//                 attributes: { size: "12-inch", color: "Black" },
//                 specifications: [
//                     { key: "Material", value: "Aluminum with Non-Stick Coating" },
//                     { key: "Dishwasher Safe", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "T-fal non-stick frying pan",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 2. Air Fryer
//         {
//             name: "Ninja AF101 Air Fryer",
//             description: "4-quart air fryer for crispy, healthy meals",
//             brand: "Ninja",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller2@test.com",
//             variants: {
//                 sku: "NINJA-AF101",
//                 price: 99.99,
//                 mrp: 129.99,
//                 stock: 50,
//                 attributes: { capacity: "4-quart", color: "Black" },
//                 specifications: [
//                     { key: "Power", value: "1550W" },
//                     { key: "Temperature Range", value: "105-400°F" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Ninja air fryer",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 3. Bed Sheet Set
//         {
//             name: "Brooklinen Luxe Sateen Sheet Set",
//             description: "Luxurious 480-thread-count cotton sheet set",
//             brand: "Brooklinen",
//             categoryName: "Bedding",
//             sellerEmail: "seller3@test.com",
//             variants: {
//                 sku: "BROOK-SHEET001",
//                 price: 139.99,
//                 mrp: 169.99,
//                 stock: 60,
//                 attributes: { size: "Queen", color: "White" },
//                 specifications: [
//                     { key: "Material", value: "100% Cotton" },
//                     { key: "Thread Count", value: "480" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1584100936595-443e2b2a8e0e",
//                     altText: "Brooklinen sheet set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 4. Dinnerware Set
//         {
//             name: "Corelle Classic 16-Piece Dinnerware Set",
//             description: "Durable 16-piece dinnerware set for everyday use",
//             brand: "Corelle",
//             categoryName: "Dinnerware",
//             sellerEmail: "seller4@test.com",
//             variants: {
//                 sku: "CORELLE-DW001",
//                 price: 69.99,
//                 mrp: 89.99,
//                 stock: 80,
//                 attributes: { size: "Service for 4", color: "White" },
//                 specifications: [
//                     { key: "Material", value: "Vitrelle Glass" },
//                     { key: "Dishwasher Safe", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Corelle dinnerware set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 36,
//                     unit: "months",
//                     description: "3-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 5. Coffee Maker
//         {
//             name: "Keurig K-Elite Coffee Maker",
//             description: "Single-serve coffee maker with strong brew option",
//             brand: "Keurig",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller5@test.com",
//             variants: {
//                 sku: "KEURIG-KELITE001",
//                 price: 129.99,
//                 mrp: 159.99,
//                 stock: 40,
//                 attributes: { capacity: "75oz reservoir", color: "Brushed Slate" },
//                 specifications: [
//                     { key: "Power", value: "1500W" },
//                     { key: "Brew Sizes", value: "4, 6, 8, 10, 12oz" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
//                     altText: "Keurig coffee maker",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 6. Blender
//         {
//             name: "Vitamix 5200 Blender",
//             description: "High-performance blender for smoothies and soups",
//             brand: "Vitamix",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller1@test.com",
//             variants: {
//                 sku: "VITAMIX-5200",
//                 price: 399.99,
//                 mrp: 449.99,
//                 stock: 30,
//                 attributes: { capacity: "64oz", color: "Black" },
//                 specifications: [
//                     { key: "Power", value: "1380W" },
//                     { key: "Speeds", value: "Variable" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Vitamix blender",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 84,
//                     unit: "months",
//                     description: "7-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 7. Comforter
//         {
//             name: "Casper Down Comforter",
//             description: "Cozy down comforter for all-season comfort",
//             brand: "Casper",
//             categoryName: "Bedding",
//             sellerEmail: "seller2@test.com",
//             variants: {
//                 sku: "CASPER-CF001",
//                 price: 199.99,
//                 mrp: 249.99,
//                 stock: 50,
//                 attributes: { size: "Queen", color: "White" },
//                 specifications: [
//                     { key: "Material", value: "Down and Cotton" },
//                     { key: "Fill Power", value: "600" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1584100936595-443e2b2a8e0e",
//                     altText: "Casper down comforter",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 8. Toaster Oven
//         {
//             name: "Breville Smart Oven Air Fryer",
//             description:
//                 "Versatile toaster oven with air frying and baking functions",
//             brand: "Breville",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller3@test.com",
//             variants: {
//                 sku: "BREV-TOV001",
//                 price: 349.99,
//                 mrp: 399.99,
//                 stock: 30,
//                 attributes: { capacity: "1 cu ft", color: "Stainless Steel" },
//                 specifications: [
//                     { key: "Power", value: "1800W" },
//                     { key: "Functions", value: "Toast, Bake, Air Fry, Broil" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Breville toaster oven",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 9. Cutlery Set
//         {
//             name: "Zwilling J.A. Henckels 15-Piece Knife Set",
//             description: "High-quality stainless steel knife set with block",
//             brand: "Zwilling",
//             categoryName: "Cutlery",
//             sellerEmail: "seller4@test.com",
//             variants: {
//                 sku: "ZWILL-KNIFE001",
//                 price: 149.99,
//                 mrp: 179.99,
//                 stock: 40,
//                 attributes: { pieces: "15", color: "Silver/Black" },
//                 specifications: [
//                     { key: "Material", value: "Stainless Steel" },
//                     { key: "Handle", value: "Ergonomic" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Zwilling knife set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 60,
//                     unit: "months",
//                     description: "5-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 10. Mixing Bowl Set
//         {
//             name: "Pyrex Glass Mixing Bowl Set",
//             description: "Set of 3 durable glass mixing bowls",
//             brand: "Pyrex",
//             categoryName: "Bakeware",
//             sellerEmail: "seller5@test.com",
//             variants: {
//                 sku: "PYREX-BOWL001",
//                 price: 24.99,
//                 mrp: 34.99,
//                 stock: 80,
//                 attributes: { sizes: "1qt, 2.5qt, 4qt", color: "Clear" },
//                 specifications: [
//                     { key: "Material", value: "Tempered Glass" },
//                     { key: "Microwave Safe", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Pyrex mixing bowl set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 24,
//                     unit: "months",
//                     description: "2-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 11. Electric Kettle
//         {
//             name: "Cuisinart CPK-17 Electric Kettle",
//             description: "1.7-liter stainless steel kettle with temperature control",
//             brand: "Cuisinart",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller1@test.com",
//             variants: {
//                 sku: "CUIS-KETTLE001",
//                 price: 79.99,
//                 mrp: 99.99,
//                 stock: 50,
//                 attributes: { capacity: "1.7L", color: "Stainless Steel" },
//                 specifications: [
//                     { key: "Power", value: "1500W" },
//                     { key: "Temperature Settings", value: "6 Preset" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Cuisinart electric kettle",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 36,
//                     unit: "months",
//                     description: "3-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 12. Duvet Cover
//         {
//             name: "Parachute Home Linen Duvet Cover",
//             description: "Soft linen duvet cover for a rustic look",
//             brand: "Parachute",
//             categoryName: "Bedding",
//             sellerEmail: "seller2@test.com",
//             variants: {
//                 sku: "PARA-DUVET001",
//                 price: 129.99,
//                 mrp: 159.99,
//                 stock: 60,
//                 attributes: { size: "King", color: "Fog" },
//                 specifications: [
//                     { key: "Material", value: "100% Linen" },
//                     { key: "Closure", value: "Button" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1584100936595-443e2b2a8e0e",
//                     altText: "Parachute duvet cover",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 13. Stand Mixer
//         {
//             name: "KitchenAid Artisan 5-Quart Stand Mixer",
//             description: "Versatile stand mixer for baking and cooking",
//             brand: "KitchenAid",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller3@test.com",
//             variants: {
//                 sku: "KAID-MIXER001",
//                 price: 379.99,
//                 mrp: 429.99,
//                 stock: 30,
//                 attributes: { capacity: "5-quart", color: "Empire Red" },
//                 specifications: [
//                     { key: "Power", value: "325W" },
//                     { key: "Speeds", value: "10" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "KitchenAid stand mixer",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 14. Cookware Set
//         {
//             name: "Calphalon Premier 10-Piece Cookware Set",
//             description: "Hard-anodized non-stick cookware set",
//             brand: "Calphalon",
//             categoryName: "Cookware",
//             sellerEmail: "seller4@test.com",
//             variants: {
//                 sku: "CALPH-CW001",
//                 price: 399.99,
//                 mrp: 449.99,
//                 stock: 25,
//                 attributes: { pieces: "10", color: "Black" },
//                 specifications: [
//                     { key: "Material", value: "Hard-Anodized Aluminum" },
//                     { key: "Oven Safe", value: "Up to 450°F" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Calphalon cookware set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 120,
//                     unit: "months",
//                     description: "10-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 15. Table Runner
//         {
//             name: "West Elm Cotton Table Runner",
//             description: "Elegant cotton table runner for dining decor",
//             brand: "West Elm",
//             categoryName: "Table Linens",
//             sellerEmail: "seller5@test.com",
//             variants: {
//                 sku: "WELM-RUNNER001",
//                 price: 29.99,
//                 mrp: 39.99,
//                 stock: 70,
//                 attributes: { size: "16x90-inch", color: "Natural" },
//                 specifications: [
//                     { key: "Material", value: "100% Cotton" },
//                     { key: "Machine Washable", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "West Elm table runner",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 16. Slow Cooker
//         {
//             name: "Crock-Pot 6-Quart Slow Cooker",
//             description: "Programmable slow cooker for easy meals",
//             brand: "Crock-Pot",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller1@test.com",
//             variants: {
//                 sku: "CROCK-SC001",
//                 price: 49.99,
//                 mrp: 69.99,
//                 stock: 60,
//                 attributes: { capacity: "6-quart", color: "Stainless Steel" },
//                 specifications: [
//                     { key: "Power", value: "240W" },
//                     { key: "Settings", value: "Low, High, Warm" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Crock-Pot slow cooker",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 17. Pillow Set
//         {
//             name: "Tempur-Pedic Cloud Pillow Set",
//             description: "Set of 2 memory foam pillows for optimal support",
//             brand: "Tempur-Pedic",
//             categoryName: "Bedding",
//             sellerEmail: "seller2@test.com",
//             variants: {
//                 sku: "TEMPUR-PILLOW001",
//                 price: 99.99,
//                 mrp: 129.99,
//                 stock: 50,
//                 attributes: { size: "Standard", color: "White" },
//                 specifications: [
//                     { key: "Material", value: "Memory Foam" },
//                     { key: "Cover", value: "Polyester" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1584100936595-443e2b2a8e0e",
//                     altText: "Tempur-Pedic pillow set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 36,
//                     unit: "months",
//                     description: "3-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 18. Food Processor
//         {
//             name: "Cuisinart DFP-14BCNY Food Processor",
//             description: "14-cup food processor for versatile prep",
//             brand: "Cuisinart",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller3@test.com",
//             variants: {
//                 sku: "CUIS-FP001",
//                 price: 199.99,
//                 mrp: 249.99,
//                 stock: 40,
//                 attributes: { capacity: "14-cup", color: "Stainless Steel" },
//                 specifications: [
//                     { key: "Power", value: "720W" },
//                     { key: "Functions", value: "Chop, Slice, Shred" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Cuisinart food processor",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 36,
//                     unit: "months",
//                     description: "3-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 19. Bakeware Set
//         {
//             name: "Nordic Ware Naturals 3-Piece Bakeware Set",
//             description: "Aluminum bakeware set for even baking",
//             brand: "Nordic Ware",
//             categoryName: "Bakeware",
//             sellerEmail: "seller4@test.com",
//             variants: {
//                 sku: "NORDIC-BW001",
//                 price: 39.99,
//                 mrp: 49.99,
//                 stock: 70,
//                 attributes: { pieces: "3", color: "Silver" },
//                 specifications: [
//                     { key: "Material", value: "Aluminum" },
//                     { key: "Non-Stick", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Nordic Ware bakeware set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 60,
//                     unit: "months",
//                     description: "5-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 20. Table Lamp
//         {
//             name: "Ikea Fado Table Lamp",
//             description: "Soft-glow table lamp for cozy ambiance",
//             brand: "Ikea",
//             categoryName: "Home Decor",
//             sellerEmail: "seller5@test.com",
//             variants: {
//                 sku: "IKEA-FADO001",
//                 price: 24.99,
//                 mrp: 34.99,
//                 stock: 80,
//                 attributes: { size: "10-inch", color: "White" },
//                 specifications: [
//                     { key: "Material", value: "Glass" },
//                     { key: "Bulb Type", value: "LED" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1512428559087-560fa0801030",
//                     altText: "Ikea Fado table lamp",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 21. Cast Iron Skillet
//         {
//             name: "Lodge 10.25-Inch Cast Iron Skillet",
//             description: "Pre-seasoned cast iron skillet for versatile cooking",
//             brand: "Lodge",
//             categoryName: "Cookware",
//             sellerEmail: "seller1@test.com",
//             variants: {
//                 sku: "LODGE-SKILLET001",
//                 price: 24.99,
//                 mrp: 34.99,
//                 stock: 90,
//                 attributes: { size: "10.25-inch", color: "Black" },
//                 specifications: [
//                     { key: "Material", value: "Cast Iron" },
//                     { key: "Oven Safe", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Lodge cast iron skillet",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 22. Mattress Topper
//         {
//             name: "Tuft & Needle Mattress Topper",
//             description: "Cooling foam mattress topper for enhanced comfort",
//             brand: "Tuft & Needle",
//             categoryName: "Bedding",
//             sellerEmail: "seller2@test.com",
//             variants: {
//                 sku: "TUFT-TOPPER001",
//                 price: 149.99,
//                 mrp: 179.99,
//                 stock: 50,
//                 attributes: { size: "Queen", color: "White" },
//                 specifications: [
//                     { key: "Material", value: "Memory Foam" },
//                     { key: "Thickness", value: "2-inch" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1584100936595-443e2b2a8e0e",
//                     altText: "Tuft & Needle mattress topper",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 36,
//                     unit: "months",
//                     description: "3-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 23. Immersion Blender
//         {
//             name: "Breville Control Grip Immersion Blender",
//             description: "Handheld blender for soups and sauces",
//             brand: "Breville",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller3@test.com",
//             variants: {
//                 sku: "BREV-IMM001",
//                 price: 99.99,
//                 mrp: 129.99,
//                 stock: 50,
//                 attributes: { color: "Stainless Steel" },
//                 specifications: [
//                     { key: "Power", value: "280W" },
//                     { key: "Speeds", value: "15" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Breville immersion blender",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 24. Glassware Set
//         {
//             name: "Libbey Signature 16-Piece Glassware Set",
//             description: "Elegant glassware set for everyday dining",
//             brand: "Libbey",
//             categoryName: "Glassware",
//             sellerEmail: "seller4@test.com",
//             variants: {
//                 sku: "LIBBEY-GLASS001",
//                 price: 34.99,
//                 mrp: 44.99,
//                 stock: 80,
//                 attributes: { pieces: "16", color: "Clear" },
//                 specifications: [
//                     { key: "Material", value: "Glass" },
//                     { key: "Dishwasher Safe", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Libbey glassware set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 25. Wall Art
//         {
//             name: "CB2 Abstract Canvas Wall Art",
//             description: "Modern abstract canvas for home decor",
//             brand: "CB2",
//             categoryName: "Home Decor",
//             sellerEmail: "seller5@test.com",
//             variants: {
//                 sku: "CB2-ART001",
//                 price: 99.99,
//                 mrp: 129.99,
//                 stock: 40,
//                 attributes: { size: "24x36-inch", color: "Multicolor" },
//                 specifications: [
//                     { key: "Material", value: "Canvas" },
//                     { key: "Frame", value: "Wood" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1512428559087-560fa0801030",
//                     altText: "CB2 abstract wall art",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 26. Dutch Oven
//         {
//             name: "Le Creuset 5.5-Quart Dutch Oven",
//             description: "Enameled cast iron Dutch oven for slow cooking",
//             brand: "Le Creuset",
//             categoryName: "Cookware",
//             sellerEmail: "seller1@test.com",
//             variants: {
//                 sku: "LECREU-DUTCH001",
//                 price: 349.99,
//                 mrp: 399.99,
//                 stock: 25,
//                 attributes: { capacity: "5.5-quart", color: "Cerise" },
//                 specifications: [
//                     { key: "Material", value: "Enameled Cast Iron" },
//                     { key: "Oven Safe", value: "Up to 500°F" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Le Creuset Dutch oven",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 120,
//                     unit: "months",
//                     description: "10-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 27. Towel Set
//         {
//             name: "Parachute Classic Towel Set",
//             description: "Soft and absorbent Turkish cotton towel set",
//             brand: "Parachute",
//             categoryName: "Bath",
//             sellerEmail: "seller2@test.com",
//             variants: {
//                 sku: "PARA-TOWEL001",
//                 price: 89.99,
//                 mrp: 109.99,
//                 stock: 60,
//                 attributes: { pieces: "6", color: "White" },
//                 specifications: [
//                     { key: "Material", value: "100% Turkish Cotton" },
//                     { key: "Machine Washable", value: "Yes" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1584100936595-443e2b2a8e0e",
//                     altText: "Parachute towel set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 28. Espresso Machine
//         {
//             name: "De'Longhi Magnifica Espresso Machine",
//             description: "Automatic espresso machine with milk frother",
//             brand: "De'Longhi",
//             categoryName: "Kitchen Appliances",
//             sellerEmail: "seller3@test.com",
//             variants: {
//                 sku: "DELONG-ESPRESSO001",
//                 price: 499.99,
//                 mrp: 599.99,
//                 stock: 20,
//                 attributes: { capacity: "1.8L", color: "Silver" },
//                 specifications: [
//                     { key: "Power", value: "1350W" },
//                     { key: "Pressure", value: "15 bar" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
//                     altText: "De'Longhi espresso machine",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 24,
//                     unit: "months",
//                     description: "2-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 29. Placemat Set
//         {
//             name: "Chilewich Bamboo Placemat Set",
//             description: "Set of 4 woven vinyl placemats",
//             brand: "Chilewich",
//             categoryName: "Table Linens",
//             sellerEmail: "seller4@test.com",
//             variants: {
//                 sku: "CHILE-PLACEMAT001",
//                 price: 59.99,
//                 mrp: 79.99,
//                 stock: 70,
//                 attributes: { pieces: "4", color: "Charcoal" },
//                 specifications: [
//                     { key: "Material", value: "Vinyl" },
//                     { key: "Cleaning", value: "Wipe Clean" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
//                     altText: "Chilewich placemat set",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 {
//                     title: "Standard Delivery",
//                     description: "5-7 days",
//                     isDefault: true,
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//         // 30. Floor Lamp
//         {
//             name: "West Elm Overarching Floor Lamp",
//             description: "Modern arched floor lamp for living spaces",
//             brand: "West Elm",
//             categoryName: "Home Decor",
//             sellerEmail: "seller5@test.com",
//             variants: {
//                 sku: "WELM-FLOORLAMP001",
//                 price: 199.99,
//                 mrp: 249.99,
//                 stock: 40,
//                 attributes: { size: "70-inch", color: "Brass" },
//                 specifications: [
//                     { key: "Material", value: "Metal and Fabric" },
//                     { key: "Bulb Type", value: "LED" },
//                 ],
//             },
//             images: [
//                 {
//                     url: "https://images.unsplash.com/photo-1512428559087-560fa0801030",
//                     altText: "West Elm floor lamp",
//                     fileType: "IMAGE",
//                 },
//             ],
//             deliveryOptions: [
//                 { title: "Express Delivery", description: "2-3 days", isDefault: true },
//             ],
//             warranty: [
//                 {
//                     type: "MANUFACTURER",
//                     duration: 12,
//                     unit: "months",
//                     description: "1-year warranty",
//                 },
//             ],
//             returnPolicy: [
//                 {
//                     type: "REFUND",
//                     duration: 30,
//                     unit: "days",
//                     conditions: "Unused with original packaging",
//                 },
//             ],
//         },
//     ];

//     let createdCount = 0;
//     for (const productData of productsData) {
//         try {
//             const seller = await createOrGetSeller(productData.sellerEmail, "", "");
//             if (!seller) {
//                 console.warn(`⚠️ Seller not found for product "${productData.name}" — skipping`);
//                 continue;
//             }
//             const category = await prisma.category.findFirst({
//         where: {
//           OR: [
//             { name: productData.categoryName },
//             { name: { contains: productData.categoryName, mode: 'insensitive' } }
//           ]
//         },
//       });

//             if (!category) {
//                 console.warn(
//                     `⚠️ Category "${productData.categoryName}" not found — skipping "${productData.name}"`
//                 );
//                 continue;
//             }

//             const product = await createProduct(productData, seller.id, category.id);
//             console.log(`✅ Created product: ${product.name}`);
//             createdCount++;
//         } catch (error: any) {
//             console.error(`❌ Error creating "${productData.name}":`, error.message);
//         }
//     }

//     console.log(`\n🎉 Seeding complete! Created ${createdCount} products.`);
// }

// main()
//     .catch((e) => {
//         console.error("Error during seeding:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
