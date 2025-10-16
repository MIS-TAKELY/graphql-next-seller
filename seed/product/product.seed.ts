const { PrismaClient } = require("../../app/generated/prisma");
const prisma = new PrismaClient();

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function createOrGetSeller(email, firstName, lastName) {
  let seller = await prisma.user.findUnique({ where: { email } });
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        clerkId: `clerk_${email.split("@")[0]}`,
        email,
        firstName,
        lastName,
        role: "SELLER",
      },
    });
  }
  return seller;
}

async function createProduct(input, sellerId, categoryId) {
  const slug = slugify(input.name);
  let uniqueSlug = slug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return await prisma.$transaction(
    async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: input.name,
          slug: uniqueSlug,
          description: input.description || "",
          status: "INACTIVE",
          categoryId,
          brand: input.brand || "Generic",
          sellerId,
          variants: {
            create: {
              sku: input.variants.sku,
              price: input.variants.price,
              mrp: input.variants.mrp || input.variants.price,
              stock: input.variants.stock,
              attributes: input.variants.attributes || {},
              isDefault: input.variants.isDefault !== false,
              specifications:
                input.variants.specifications?.length > 0
                  ? {
                      create: input.variants.specifications.map((spec) => ({
                        key: spec.key,
                        value: spec.value,
                      })),
                    }
                  : undefined,
            },
          },
          images: {
            create: input.images.map((img, index) => ({
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
              mediaType: img.mediaType || "PRIMARY",
              fileType: img.fileType,
            })),
          },
        },
      });

      if (input.deliveryOptions?.length > 0) {
        await tx.deliveryOption.createMany({
          data: input.deliveryOptions.map((option) => ({
            productId: newProduct.id,
            title: option.title,
            description: option.description || null,
            isDefault: option.isDefault || false,
          })),
        });
      }

      if (input.warranty?.length > 0) {
        await tx.warranty.createMany({
          data: input.warranty.map((warranty) => ({
            productId: newProduct.id,
            type: warranty.type,
            duration: warranty.duration || null,
            unit: warranty.unit || null,
            description: warranty.description || null,
          })),
        });
      }

      if (input.returnPolicy?.length > 0) {
        await tx.returnPolicy.createMany({
          data: input.returnPolicy.map((policy) => ({
            productId: newProduct.id,
            type: policy.type,
            duration: policy.duration || null,
            unit: policy.unit || null,
            conditions: policy.conditions || null,
          })),
        });
      }

      return newProduct;
    },
    { timeout: 30000 }
  );
}

async function main() {
  const sellers = [
    await createOrGetSeller("seller1@test.com", "John", "Doe"),
    await createOrGetSeller("seller2@test.com", "Jane", "Smith"),
    await createOrGetSeller("seller3@test.com", "Mike", "Johnson"),
  ];

  const productsData = [
    // 1. Smartphones
    {
      name: "Samsung Galaxy S23",
      description: "Flagship smartphone with advanced AI features",
      brand: "Samsung",
      categoryName: "Smartphones",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "SGS23-001",
        price: 799.99,
        mrp: 899.99,
        stock: 40,
        attributes: { color: "Phantom Black", storage: "256GB" },
        specifications: [
          { key: "RAM", value: "8GB" },
          { key: "Processor", value: "Snapdragon 8 Gen 2" },
          { key: "Camera", value: "50MP" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1592899677979-1b96d2a5e69f",
          altText: "Samsung Galaxy S23 front",
          fileType: "IMAGE",
        },
        {
          url: "https://images.unsplash.com/photo-1639885127503-4e7751d7e6a8",
          altText: "Samsung Galaxy S23 side",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Standard Delivery", description: "5-7 days", isDefault: true },
      ],
      warranty: [
        { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
      ],
      returnPolicy: [
        { type: "REPLACEMENT_OR_REFUND", duration: 7, unit: "days", conditions: "Original packaging" },
      ],
    },

    // 2. Laptops
    {
      name: "Dell XPS 13",
      description: "Ultra-portable laptop with InfinityEdge display",
      brand: "Dell",
      categoryName: "Laptops",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "DELLXPS13001",
        price: 1299.99,
        mrp: 1499.99,
        stock: 20,
        attributes: { color: "Platinum Silver", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7" },
          { key: "RAM", value: "16GB" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Dell XPS 13 laptop",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        { type: "MANUFACTURER", duration: 12, unit: "months", description: "1 year warranty" },
      ],
      returnPolicy: [],
    },

    // 3. TShirts & Polos
    {
      name: "Graphic T-Shirt",
      description: "Comfortable cotton t-shirt with bold graphics",
      brand: "Urban Outfitters",
      categoryName: "TShirts & Polos",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "GRAPHIC-T001",
        price: 19.99,
        mrp: 29.99,
        stock: 150,
        attributes: { size: "L", color: "Black" },
        specifications: [
          { key: "Material", value: "100% Cotton" },
          { key: "Fit", value: "Relaxed" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
          altText: "Graphic T-Shirt",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REFUND", duration: 14, unit: "days", conditions: "Size exchange allowed" }],
    },

    // 4. Mixer Grinders
    {
      name: "Philips Mixer Grinder",
      description: "750W mixer grinder with stainless steel jars",
      brand: "Philips",
      categoryName: "Mixer Grinders",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "PHILIPS-MIX001",
        price: 59.99,
        mrp: 69.99,
        stock: 30,
        attributes: { color: "White", wattage: "750W" },
        specifications: [
          { key: "Jars", value: "3" },
          { key: "Warranty", value: "2 Years" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1618419781193-88f3d5c5a62c",
          altText: "Philips mixer grinder",
          fileType: "IMAGE",
        },
      ],
      warranty: [
        { type: "MANUFACTURER", duration: 24, unit: "months", description: "2-year warranty" },
      ],
      returnPolicy: [
        { type: "NO_RETURN", duration: null, unit: null, conditions: null },
      ],
    },

    // 5. Smartwatches & Wearables
    {
      name: "Apple Watch Series 9",
      description: "Advanced health monitoring smartwatch",
      brand: "Apple",
      categoryName: "Smartwatches & Wearables",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "AW9-001",
        price: 399.99,
        mrp: 429.99,
        stock: 70,
        attributes: { color: "Midnight", size: "45mm" },
        specifications: [
          { key: "Display", value: "Always-On Retina" },
          { key: "Battery Life", value: "18 hours" },
          { key: "Water Resistance", value: "50m" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
          altText: "Apple Watch Series 9",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "3-5 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 10, unit: "days", conditions: "Unused item only" }],
    },

    // 6. Skincare (Face Wash, Creams)
    {
      name: "CeraVe Hydrating Cleanser",
      description: "Gentle foaming cleanser for normal to dry skin",
      brand: "CeraVe",
      categoryName: "Skincare (Face Wash, Creams)",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "CERAVE-CLEAN001",
        price: 14.99,
        mrp: 18.99,
        stock: 200,
        attributes: { size: "12oz", skinType: "Dry" },
        specifications: [
          { key: "Key Ingredient", value: "Ceramides" },
          { key: "Texture", value: "Foaming" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1625772299841-5e70a37cc9c2",
          altText: "CeraVe cleanser bottle",
          fileType: "IMAGE",
        },
      ],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" }],
    },

    // 7. Gaming Accessories
    {
      name: "Logitech G Pro Controller",
      description: "Wireless gaming controller for PC and console",
      brand: "Logitech",
      categoryName: "Gaming Accessories",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "LOGIGPRO001",
        price: 79.99,
        mrp: 99.99,
        stock: 90,
        attributes: { color: "Black", connectivity: "Wireless" },
        specifications: [
          { key: "Battery Life", value: "20 hours" },
          { key: "Compatibility", value: "PC, PS5, Xbox" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1606144042614-b75a750f5bd3",
          altText: "Logitech G Pro controller",
          fileType: "IMAGE",
        },
      ],
      warranty: [{ type: "MANUFACTURER", duration: 24, unit: "months" }],
    },

    // 8. Wireless Earbuds
    {
      name: "Sony WF-1000XM5",
      description: "Noise-cancelling true wireless earbuds",
      brand: "Sony",
      categoryName: "Wireless Earbuds",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "SONYWF1000-001",
        price: 249.99,
        mrp: 299.99,
        stock: 50,
        attributes: { color: "Black", noiseCancel: "Yes" },
        specifications: [
          { key: "Battery Life", value: "8 hours" },
          { key: "IP Rating", value: "IPX4" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1611593736518-f7d8e3c8d5b6",
          altText: "Sony WF-1000XM5 earbuds",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 14, unit: "days" }],
    },

    // 9. Air Fryers
    {
      name: "Ninja Air Fryer Max",
      description: "6.5-quart air fryer with multiple functions",
      brand: "Ninja",
      categoryName: "Air Fryers",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "NINJAAFM001",
        price: 129.99,
        mrp: 149.99,
        stock: 25,
        attributes: { color: "Black", capacity: "6.5qt" },
        specifications: [
          { key: "Power", value: "1750W" },
          { key: "Functions", value: "Air Fry, Roast, Dehydrate" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1622293663671-7a6e1b0a9b0e",
          altText: "Ninja air fryer",
          fileType: "IMAGE",
        },
      ],
      warranty: [
        { type: "MANUFACTURER", duration: 12, unit: "months", description: "1-year warranty" },
      ],
      returnPolicy: [
        { type: "REPLACEMENT_OR_REFUND", duration: 30, unit: "days", conditions: "Original packaging" },
      ],
    },

    // 10. Jeans & Trousers
    {
      name: "Levi's 501 Original Fit Jeans",
      description: "Classic straight-leg jeans for everyday wear",
      brand: "Levi's",
      categoryName: "Jeans & Trousers",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "LEVIS501001",
        price: 59.99,
        mrp: 79.99,
        stock: 80,
        attributes: { size: "32x32", color: "Medium Wash" },
        specifications: [
          { key: "Material", value: "100% Cotton" },
          { key: "Fit", value: "Original" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1542272604-787c3835535d",
          altText: "Levi's 501 jeans",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days", conditions: "Unworn with tags" }],
    },

    // 11. Dresses & Gowns
    {
      name: "Summer Maxi Dress",
      description: "Flowy maxi dress perfect for beach days",
      brand: "Free People",
      categoryName: "Dresses & Gowns",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "FREEMAXI001",
        price: 89.99,
        mrp: 109.99,
        stock: 60,
        attributes: { size: "S", color: "Floral Print" },
        specifications: [
          { key: "Material", value: "100% Rayon" },
          { key: "Length", value: "Maxi" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
          altText: "Summer maxi dress",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [],
      returnPolicy: [{ type: "REFUND", duration: 14, unit: "days", conditions: "Size exchange allowed" }],
    },

    // 12. Sofas & Couches
    {
      name: "Modular Sectional Sofa",
      description: "Versatile modular sofa for modern living rooms",
      brand: "IKEA",
      categoryName: "Sofas & Couches",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "IKEAMOD001",
        price: 799.99,
        mrp: 999.99,
        stock: 10,
        attributes: { color: "Gray", configuration: "L-Shape" },
        specifications: [
          { key: "Material", value: "Fabric" },
          { key: "Seating Capacity", value: "5" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600210492493-0946911123ea",
          altText: "Modular sectional sofa",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Express Delivery", description: "2-3 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 24, unit: "months" }],
      returnPolicy: [{ type: "REPLACEMENT", duration: 30, unit: "days" }],
    },

    // 13. Refrigerators
    {
      name: "LG French Door Refrigerator",
      description: "Smart fridge with InstaView door-in-door",
      brand: "LG",
      categoryName: "Refrigerators",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "LGFRENCH001",
        price: 1999.99,
        mrp: 2199.99,
        stock: 5,
        attributes: { color: "Stainless Steel", capacity: "23 cu ft" },
        specifications: [
          { key: "Cooling Tech", value: "Linear Cooling" },
          { key: "Smart Features", value: "Wi-Fi Enabled" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
          altText: "LG French door refrigerator",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Express Delivery", description: "2-3 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 60, unit: "months", description: "5-year compressor" }],
      returnPolicy: [{ type: "NO_RETURN", duration: null, unit: null, conditions: null }],
    },

    // 14. Snacks & Beverages
    {
      name: "Organic Trail Mix",
      description: "Mixed nuts and dried fruits snack pack",
      brand: "Nature's Path",
      categoryName: "Snacks & Beverages",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "NATRAIL001",
        price: 4.99,
        mrp: 6.99,
        stock: 300,
        attributes: { size: "8oz", type: "Mixed" },
        specifications: [
          { key: "Ingredients", value: "Organic Nuts & Fruits" },
          { key: "Calories", value: "150 per serving" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc6",
          altText: "Organic trail mix",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REFUND", duration: 7, unit: "days" }],
    },

    // 15. Haircare (Shampoo, Conditioners)
    {
      name: "Pantene Pro-V Shampoo",
      description: "Volume and body shampoo for fine hair",
      brand: "Pantene",
      categoryName: "Haircare (Shampoo, Conditioners)",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "PANTENE001",
        price: 5.99,
        mrp: 7.99,
        stock: 250,
        attributes: { size: "12oz", hairType: "Fine" },
        specifications: [
          { key: "Key Ingredient", value: "Pro-Vitamin B5" },
          { key: "Sulfate Free", value: "No" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1611100481087-2eb83c8d9a6a",
          altText: "Pantene shampoo bottle",
          fileType: "IMAGE",
        },
      ],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" }],
    },

    // 16. Vitamins & Supplements
    {
      name: "Nature Made Vitamin D3",
      description: "Softgels for bone and immune health",
      brand: "Nature Made",
      categoryName: "Vitamins & Supplements",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "NATVITD001",
        price: 9.99,
        mrp: 12.99,
        stock: 400,
        attributes: { count: "100", strength: "2000 IU" },
        specifications: [
          { key: "Form", value: "Softgel" },
          { key: "Benefits", value: "Bone Health" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
          altText: "Vitamin D3 softgels",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days" }],
    },

    // 17. Fiction & NonFiction Books
    {
      name: "The Midnight Library",
      description: "A novel about the infinite possibilities of life",
      brand: "Penguin Random House",
      categoryName: "Fiction & NonFiction Books",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "MIDLIB001",
        price: 14.99,
        mrp: 18.99,
        stock: 100,
        attributes: { format: "Paperback", genre: "Fiction" },
        specifications: [
          { key: "Pages", value: "304" },
          { key: "Author", value: "Matt Haig" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
          altText: "The Midnight Library book cover",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" }],
    },

    // 18. Action Figures
    {
      name: "Marvel Spider-Man Action Figure",
      description: "6-inch articulated Spider-Man figure",
      brand: "Hasbro",
      categoryName: "Action Figures",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "MARVELSPIDEY001",
        price: 19.99,
        mrp: 24.99,
        stock: 120,
        attributes: { size: "6-inch", poseable: "Yes" },
        specifications: [
          { key: "Articulation", value: "10 points" },
          { key: "Material", value: "PVC" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1570549717069-33bed2ebafec",
          altText: "Spider-Man action figure",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 14, unit: "days" }],
    },

    // 19. Car Accessories
    {
      name: "Car Seat Cover Set",
      description: "Universal fit waterproof seat covers",
      brand: "AutoZone",
      categoryName: "Car Accessories",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "AUTOCOVER001",
        price: 49.99,
        mrp: 69.99,
        stock: 40,
        attributes: { color: "Black", fit: "Universal" },
        specifications: [
          { key: "Material", value: "Neoprene" },
          { key: "Coverage", value: "Full Set" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1558618045-9ffb1b4f8b8b",
          altText: "Car seat covers",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REPLACEMENT", duration: 30, unit: "days" }],
    },

    // 20. Gym Equipment
    {
      name: "Adjustable Dumbbell Set",
      description: "Compact dumbbells adjustable from 5-50 lbs",
      brand: "Bowflex",
      categoryName: "Gym Equipment",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "BOWDUM001",
        price: 299.99,
        mrp: 349.99,
        stock: 15,
        attributes: { weight: "5-50 lbs", pair: "Yes" },
        specifications: [
          { key: "Adjustment", value: "15 levels" },
          { key: "Material", value: "Cast Iron" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1571019614195-1f968e7e67bb",
          altText: "Adjustable dumbbells",
          fileType: "IMAGE",
        },
      ],
      warranty: [{ type: "MANUFACTURER", duration: 24, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days" }],
    },

    // 21. Camera Lenses
    {
      name: "Canon EF 50mm f/1.8 STM",
      description: "Prime lens for stunning portraits",
      brand: "Canon",
      categoryName: "Camera Lenses",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "CANEF50-001",
        price: 129.99,
        mrp: 159.99,
        stock: 35,
        attributes: { focalLength: "50mm", aperture: "f/1.8" },
        specifications: [
          { key: "Mount", value: "EF" },
          { key: "Filter Size", value: "49mm" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176",
          altText: "Canon 50mm lens",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 14, unit: "days", conditions: "Unused" }],
    },

    // 22. Power Banks
    {
      name: "Anker PowerCore 20000",
      description: "High-capacity portable charger",
      brand: "Anker",
      categoryName: "Power Banks",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "ANKERPC20000",
        price: 39.99,
        mrp: 49.99,
        stock: 100,
        attributes: { capacity: "20000mAh", ports: "2 USB" },
        specifications: [
          { key: "Output", value: "18W" },
          { key: "Weight", value: "343g" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1606291295492-7b6189632643",
          altText: "Anker power bank",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 18, unit: "months" }],
    },

    // 23. Monitors
    {
      name: "Samsung 27-inch Curved Monitor",
      description: "VA panel monitor for immersive viewing",
      brand: "Samsung",
      categoryName: "Monitors",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "SAMS27CURV001",
        price: 249.99,
        mrp: 299.99,
        stock: 25,
        attributes: { size: "27-inch", resolution: "1440p" },
        specifications: [
          { key: "Refresh Rate", value: "144Hz" },
          { key: "Panel Type", value: "VA" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1495301908102-61e5b0dd32e7",
          altText: "Samsung curved monitor",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Express Delivery", description: "2-3 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 36, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days" }],
    },

    // 24. Smart TVs
    {
      name: "Sony Bravia 55-inch OLED",
      description: "4K HDR smart TV with Google TV",
      brand: "Sony",
      categoryName: "Smart TVs",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "SONYBRAVIA55",
        price: 1299.99,
        mrp: 1499.99,
        stock: 8,
        attributes: { size: "55-inch", resolution: "4K" },
        specifications: [
          { key: "Display Tech", value: "OLED" },
          { key: "OS", value: "Google TV" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1610945264077-6b6e0d6a5b8e",
          altText: "Sony Bravia OLED TV",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Express Delivery", description: "2-3 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 24, unit: "months" }],
      returnPolicy: [{ type: "REPLACEMENT", duration: 30, unit: "days" }],
    },

    // 25. Speakers (Bluetooth, Smart)
    {
      name: "Bose SoundLink Revolve+",
      description: "Portable Bluetooth speaker with 360-degree sound",
      brand: "Bose",
      categoryName: "Speakers (Bluetooth, Smart)",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "BOSESOUNDLINK001",
        price: 199.99,
        mrp: 229.99,
        stock: 45,
        attributes: { color: "Triple Black", waterproof: "IP55" },
        specifications: [
          { key: "Battery Life", value: "17 hours" },
          { key: "Connectivity", value: "Bluetooth 4.2" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1628648944348-7ec7b33691a1",
          altText: "Bose SoundLink speaker",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 14, unit: "days" }],
    },

    // 26. Gaming Consoles (PS5, Xbox, Nintendo)
    {
      name: "PlayStation 5 Digital Edition",
      description: "Next-gen gaming console with SSD storage",
      brand: "Sony",
      categoryName: "Gaming Consoles (PS5, Xbox, Nintendo)",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "PS5DIG001",
        price: 399.99,
        mrp: 449.99,
        stock: 12,
        attributes: { storage: "825GB", drive: "Digital" },
        specifications: [
          { key: "CPU", value: "AMD Zen 2" },
          { key: "GPU", value: "AMD RDNA 2" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1606147164107-449788b5d42a",
          altText: "PlayStation 5 console",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Express Delivery", description: "2-3 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days", conditions: "Unopened" }],
    },

    // 27. Ethnic Wear (Kurta, Sherwani)
    {
      name: "Men's Cotton Kurta",
      description: "Traditional straight kurta for festive wear",
      brand: "FabIndia",
      categoryName: "Ethnic Wear (Kurta, Sherwani)",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "FABKURTA001",
        price: 39.99,
        mrp: 59.99,
        stock: 70,
        attributes: { size: "M", color: "Ivory" },
        specifications: [
          { key: "Material", value: "Cotton" },
          { key: "Style", value: "Straight" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
          altText: "Men's cotton kurta",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REFUND", duration: 14, unit: "days", conditions: "Unworn" }],
    },

    // 28. Boys Clothing
    {
      name: "Boys Cargo Shorts",
      description: "Durable cotton cargo shorts for active boys",
      brand: "Gap Kids",
      categoryName: "Boys Clothing",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "GAPCARGO001",
        price: 24.99,
        mrp: 34.99,
        stock: 90,
        attributes: { size: "10", color: "Khaki" },
        specifications: [
          { key: "Material", value: "Cotton Twill" },
          { key: "Pockets", value: "6" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1524592091106-06c1b6c5b5c4",
          altText: "Boys cargo shorts",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days" }],
    },

    // 29. Sports Shoes
    {
      name: "Nike Air Zoom Pegasus",
      description: "Running shoes with responsive cushioning",
      brand: "Nike",
      categoryName: "Sports Shoes",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "NIKEPEGASUS001",
        price: 119.99,
        mrp: 139.99,
        stock: 55,
        attributes: { size: "9", color: "Black/White" },
        specifications: [
          { key: "Cushioning", value: "Air Zoom" },
          { key: "Weight", value: "9.2 oz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          altText: "Nike Air Zoom Pegasus shoes",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      warranty: [{ type: "MANUFACTURER", duration: 12, unit: "months" }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days", conditions: "Unworn" }],
    },

    // 30. Wall Art & Paintings
    {
      name: "Abstract Canvas Print",
      description: "Modern abstract art print on canvas",
      brand: "Society6",
      categoryName: "Wall Art & Paintings",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "SOCABSTR001",
        price: 49.99,
        mrp: 69.99,
        stock: 40,
        attributes: { size: "24x36", style: "Abstract" },
        specifications: [
          { key: "Material", value: "Canvas" },
          { key: "Finish", value: "Matte" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1579783902614-a3bd6665a5d4",
          altText: "Abstract canvas print",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [{ title: "Standard Delivery", description: "5-7 days", isDefault: true }],
      returnPolicy: [{ type: "REFUND", duration: 30, unit: "days" }],
    },
  ];

  let createdCount = 0;
  for (const productData of productsData) {
    try {
      const seller = await createOrGetSeller(productData.sellerEmail, "", "");
      const category = await prisma.category.findUnique({
        where: { name: productData.categoryName },
      });

      if (!category) {
        console.warn(
          `⚠️ Category "${productData.categoryName}" not found — skipping "${productData.name}"`
        );
        continue;
      }

      const product = await createProduct(productData, seller.id, category.id);
      console.log(`✅ Created product: ${product.name}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Error creating "${productData.name}":`, error.message);
    }
  }

  console.log(`\n🎉 Seeding complete! Created ${createdCount} products.`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });