import { prisma } from "@/lib/db/prisma";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function createOrGetSeller(
  email: string,
  firstName: string,
  lastName: string
) {
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

async function createProduct(
  input: string,
  sellerId: string,
  categoryId: string
) {
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
    // 1. Olive Oil
    {
      name: "Pompeian Extra Virgin Olive Oil",
      description: "Cold-pressed extra virgin olive oil for cooking and salads",
      brand: "Pompeian",
      categoryName: "Pantry Staples",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "POMP-OIL001",
        price: 14.99,
        mrp: 19.99,
        stock: 150,
        attributes: { size: "32oz", type: "Extra Virgin" },
        specifications: [
          { key: "Type", value: "Olive Oil" },
          { key: "Origin", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Pompeian olive oil",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 2. Organic Quinoa
    {
      name: "Bob's Red Mill Organic Quinoa",
      description: "Gluten-free organic quinoa for healthy meals",
      brand: "Bob's Red Mill",
      categoryName: "Grains & Cereals",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "BOBS-QUINOA001",
        price: 8.99,
        mrp: 11.99,
        stock: 200,
        attributes: { size: "26oz", type: "White" },
        specifications: [
          { key: "Type", value: "Organic" },
          { key: "Gluten-Free", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Bob's Red Mill quinoa",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 3. Dark Chocolate Bar
    {
      name: "Lindt Excellence 70% Dark Chocolate",
      description: "Rich 70% cocoa dark chocolate bar",
      brand: "Lindt",
      categoryName: "Snacks",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "LINDT-CHOC001",
        price: 3.99,
        mrp: 5.99,
        stock: 300,
        attributes: { size: "3.5oz", flavor: "Dark Chocolate" },
        specifications: [
          { key: "Cocoa Content", value: "70%" },
          { key: "Allergen", value: "May contain milk, nuts" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Lindt dark chocolate",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 14,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 4. Coffee Beans
    {
      name: "Starbucks Pike Place Roast Coffee",
      description: "Medium roast whole bean coffee",
      brand: "Starbucks",
      categoryName: "Beverages",
      sellerEmail: "seller4@test.com",
      variants: {
        sku: "STARB-COFFEE001",
        price: 12.99,
        mrp: 15.99,
        stock: 120,
        attributes: { size: "12oz", roast: "Medium" },
        specifications: [
          { key: "Type", value: "Whole Bean" },
          { key: "Origin", value: "Latin America" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
          altText: "Starbucks coffee beans",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 5. Pasta
    {
      name: "Barilla Spaghetti Pasta",
      description: "Classic spaghetti pasta for Italian dishes",
      brand: "Barilla",
      categoryName: "Pantry Staples",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "BARIL-PASTA001",
        price: 2.49,
        mrp: 3.99,
        stock: 400,
        attributes: { size: "16oz", type: "Spaghetti" },
        specifications: [
          { key: "Material", value: "Durum Wheat" },
          { key: "Cooking Time", value: "9-10 minutes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Barilla spaghetti pasta",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 6. Almond Butter
    {
      name: "Justin's Classic Almond Butter",
      description: "Creamy almond butter with no added sugar",
      brand: "Justin's",
      categoryName: "Spreads",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "JUSTIN-AB001",
        price: 9.99,
        mrp: 12.99,
        stock: 150,
        attributes: { size: "16oz", type: "Creamy" },
        specifications: [
          { key: "Type", value: "Almond Butter" },
          { key: "Allergen", value: "Contains nuts" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Justin's almond butter",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 7. Organic Honey
    {
      name: "Nature Nate's Raw Honey",
      description: "100% pure raw and unfiltered honey",
      brand: "Nature Nate's",
      categoryName: "Sweeteners",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "NATE-HONEY001",
        price: 7.99,
        mrp: 10.99,
        stock: 180,
        attributes: { size: "32oz", type: "Raw" },
        specifications: [
          { key: "Type", value: "Honey" },
          { key: "Organic", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Nature Nate's honey",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 8. Granola
    {
      name: "Kind Healthy Grains Granola",
      description: "Nutty granola with oats and almonds",
      brand: "Kind",
      categoryName: "Snacks",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "KIND-GRANOLA001",
        price: 5.99,
        mrp: 7.99,
        stock: 200,
        attributes: { size: "11oz", flavor: "Oats & Honey" },
        specifications: [
          { key: "Type", value: "Granola" },
          { key: "Allergen", value: "Contains nuts" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Kind granola",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 9. Green Tea
    {
      name: "Tazo Organic Green Tea",
      description: "Organic green tea bags for a refreshing brew",
      brand: "Tazo",
      categoryName: "Beverages",
      sellerEmail: "seller4@test.com",
      variants: {
        sku: "TAZO-GTEA001",
        price: 4.99,
        mrp: 6.99,
        stock: 250,
        attributes: { size: "20 bags", type: "Green" },
        specifications: [
          { key: "Type", value: "Tea Bags" },
          { key: "Organic", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
          altText: "Tazo green tea",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 10. Canned Tomatoes
    {
      name: "San Marzano Whole Peeled Tomatoes",
      description: "Premium whole peeled tomatoes for sauces",
      brand: "San Marzano",
      categoryName: "Pantry Staples",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "SANMAR-TOM001",
        price: 3.99,
        mrp: 5.49,
        stock: 300,
        attributes: { size: "28oz", type: "Whole Peeled" },
        specifications: [
          { key: "Type", value: "Canned Tomatoes" },
          { key: "Origin", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "San Marzano tomatoes",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 11. Almonds
    {
      name: "Blue Diamond Whole Almonds",
      description: "Whole roasted almonds with sea salt",
      brand: "Blue Diamond",
      categoryName: "Snacks",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "BLUDIA-ALM001",
        price: 8.49,
        mrp: 10.99,
        stock: 180,
        attributes: { size: "16oz", flavor: "Sea Salt" },
        specifications: [
          { key: "Type", value: "Roasted Almonds" },
          { key: "Allergen", value: "Contains nuts" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Blue Diamond almonds",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 12. Maple Syrup
    {
      name: "Maple Grove Farms Pure Maple Syrup",
      description: "100% pure maple syrup for pancakes and baking",
      brand: "Maple Grove Farms",
      categoryName: "Sweeteners",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "MAPLE-SYRUP001",
        price: 9.99,
        mrp: 12.99,
        stock: 150,
        attributes: { size: "12.5oz", type: "Pure" },
        specifications: [
          { key: "Type", value: "Maple Syrup" },
          { key: "Grade", value: "A" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Maple Grove Farms syrup",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 13. Protein Bars
    {
      name: "Clif Energy Bar",
      description: "Chocolate chip energy bar for on-the-go nutrition",
      brand: "Clif",
      categoryName: "Snacks",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "CLIF-BAR001",
        price: 1.99,
        mrp: 2.99,
        stock: 400,
        attributes: { size: "2.4oz", flavor: "Chocolate Chip" },
        specifications: [
          { key: "Protein", value: "10g" },
          { key: "Allergen", value: "Contains soy, nuts" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Clif energy bar",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 14. Sparkling Water
    {
      name: "LaCroix Sparkling Water",
      description: "Refreshing lime-flavored sparkling water",
      brand: "LaCroix",
      categoryName: "Beverages",
      sellerEmail: "seller4@test.com",
      variants: {
        sku: "LACROIX-WATER001",
        price: 4.99,
        mrp: 6.99,
        stock: 250,
        attributes: { size: "12-pack, 12oz cans", flavor: "Lime" },
        specifications: [
          { key: "Type", value: "Sparkling Water" },
          { key: "Calories", value: "0" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
          altText: "LaCroix sparkling water",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 15. Brown Rice
    {
      name: "Lundberg Organic Brown Rice",
      description: "Organic long-grain brown rice",
      brand: "Lundberg",
      categoryName: "Grains & Cereals",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "LUNDB-RICE001",
        price: 5.99,
        mrp: 7.99,
        stock: 200,
        attributes: { size: "32oz", type: "Long Grain" },
        specifications: [
          { key: "Type", value: "Organic" },
          { key: "Gluten-Free", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Lundberg brown rice",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 16. Peanut Butter
    {
      name: "Jif Creamy Peanut Butter",
      description: "Smooth and creamy peanut butter",
      brand: "Jif",
      categoryName: "Spreads",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "JIF-PB001",
        price: 4.99,
        mrp: 6.99,
        stock: 180,
        attributes: { size: "16oz", type: "Creamy" },
        specifications: [
          { key: "Type", value: "Peanut Butter" },
          { key: "Allergen", value: "Contains peanuts" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Jif peanut butter",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 17. Balsamic Vinegar
    {
      name: "Colavita Balsamic Vinegar",
      description: "Aged balsamic vinegar for dressings and marinades",
      brand: "Colavita",
      categoryName: "Pantry Staples",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "COLAV-VIN001",
        price: 6.99,
        mrp: 9.99,
        stock: 150,
        attributes: { size: "17oz", type: "Balsamic" },
        specifications: [
          { key: "Type", value: "Vinegar" },
          { key: "Origin", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Colavita balsamic vinegar",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 18. Popcorn
    {
      name: "Orville Redenbacher's Popcorn Kernels",
      description: "Classic popcorn kernels for movie nights",
      brand: "Orville Redenbacher's",
      categoryName: "Snacks",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "ORVILLE-POP001",
        price: 3.99,
        mrp: 5.49,
        stock: 250,
        attributes: { size: "30oz", type: "Kernels" },
        specifications: [
          { key: "Type", value: "Popcorn" },
          { key: "Gluten-Free", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Orville Redenbacher's popcorn",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 19. Black Tea
    {
      name: "Twinings English Breakfast Tea",
      description: "Robust black tea for a classic brew",
      brand: "Twinings",
      categoryName: "Beverages",
      sellerEmail: "seller4@test.com",
      variants: {
        sku: "TWIN-TEA001",
        price: 5.99,
        mrp: 7.99,
        stock: 200,
        attributes: { size: "50 bags", type: "Black" },
        specifications: [
          { key: "Type", value: "Tea Bags" },
          { key: "Caffeine", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
          altText: "Twinings black tea",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 20. Canned Tuna
    {
      name: "Wild Planet Albacore Tuna",
      description: "Sustainably caught albacore tuna in water",
      brand: "Wild Planet",
      categoryName: "Pantry Staples",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "WILD-TUNA001",
        price: 3.49,
        mrp: 4.99,
        stock: 300,
        attributes: { size: "5oz", type: "In Water" },
        specifications: [
          { key: "Type", value: "Canned Tuna" },
          { key: "Allergen", value: "Contains fish" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Wild Planet tuna",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 21. Trail Mix
    {
      name: "Nature Valley Trail Mix",
      description: "Nut and fruit trail mix for snacking",
      brand: "Nature Valley",
      categoryName: "Snacks",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "NATVAL-TRAIL001",
        price: 6.99,
        mrp: 8.99,
        stock: 180,
        attributes: { size: "12oz", flavor: "Fruit & Nut" },
        specifications: [
          { key: "Type", value: "Trail Mix" },
          { key: "Allergen", value: "Contains nuts" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Nature Valley trail mix",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 22. Coconut Oil
    {
      name: "Nutiva Organic Coconut Oil",
      description: "Virgin coconut oil for cooking and baking",
      brand: "Nutiva",
      categoryName: "Pantry Staples",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "NUTIVA-COCO001",
        price: 9.99,
        mrp: 12.99,
        stock: 150,
        attributes: { size: "29oz", type: "Virgin" },
        specifications: [
          { key: "Type", value: "Coconut Oil" },
          { key: "Organic", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Nutiva coconut oil",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 23. Instant Coffee
    {
      name: "Nescafé Clasico Instant Coffee",
      description: "Rich instant coffee for quick brewing",
      brand: "Nescafé",
      categoryName: "Beverages",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "NESCAFE-COFFEE001",
        price: 7.99,
        mrp: 9.99,
        stock: 200,
        attributes: { size: "10.5oz", type: "Dark Roast" },
        specifications: [
          { key: "Type", value: "Instant Coffee" },
          { key: "Caffeine", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
          altText: "Nescafé instant coffee",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 24. Oatmeal
    {
      name: "Quaker Oats Old Fashioned",
      description: "Whole grain rolled oats for breakfast",
      brand: "Quaker",
      categoryName: "Grains & Cereals",
      sellerEmail: "seller4@test.com",
      variants: {
        sku: "QUAKER-OATS001",
        price: 4.49,
        mrp: 5.99,
        stock: 250,
        attributes: { size: "42oz", type: "Old Fashioned" },
        specifications: [
          { key: "Type", value: "Rolled Oats" },
          { key: "Gluten-Free", value: "No" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Quaker oats",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 25. Hot Sauce
    {
      name: "Tabasco Original Red Sauce",
      description: "Classic spicy hot sauce for bold flavors",
      brand: "Tabasco",
      categoryName: "Condiments",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "TABASCO-HOT001",
        price: 3.99,
        mrp: 5.49,
        stock: 300,
        attributes: { size: "5oz", type: "Original" },
        specifications: [
          { key: "Type", value: "Hot Sauce" },
          { key: "Heat Level", value: "Medium" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Tabasco hot sauce",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 26. Crackers
    {
      name: "Ritz Original Crackers",
      description: "Buttery crackers for snacking and appetizers",
      brand: "Ritz",
      categoryName: "Snacks",
      sellerEmail: "seller1@test.com",
      variants: {
        sku: "RITZ-CRACKER001",
        price: 3.49,
        mrp: 4.99,
        stock: 300,
        attributes: { size: "13.7oz", type: "Original" },
        specifications: [
          { key: "Type", value: "Crackers" },
          { key: "Allergen", value: "Contains wheat" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Ritz crackers",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 27. Jam
    {
      name: "Bonne Maman Strawberry Jam",
      description: "Sweet strawberry jam with natural ingredients",
      brand: "Bonne Maman",
      categoryName: "Spreads",
      sellerEmail: "seller2@test.com",
      variants: {
        sku: "BONNE-JAM001",
        price: 5.99,
        mrp: 7.99,
        stock: 180,
        attributes: { size: "13oz", flavor: "Strawberry" },
        specifications: [
          { key: "Type", value: "Jam" },
          { key: "Allergen", value: "None" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Bonne Maman strawberry jam",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 28. Ground Coffee
    {
      name: "Peet's Coffee Major Dickason's Blend",
      description: "Rich ground coffee with bold flavor",
      brand: "Peet's Coffee",
      categoryName: "Beverages",
      sellerEmail: "seller3@test.com",
      variants: {
        sku: "PEETS-COFFEE001",
        price: 10.99,
        mrp: 13.99,
        stock: 150,
        attributes: { size: "10.5oz", roast: "Dark" },
        specifications: [
          { key: "Type", value: "Ground Coffee" },
          { key: "Caffeine", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
          altText: "Peet's ground coffee",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 29. Lentils
    {
      name: "Goya Green Lentils",
      description: "High-protein green lentils for soups and salads",
      brand: "Goya",
      categoryName: "Grains & Cereals",
      sellerEmail: "seller4@test.com",
      variants: {
        sku: "GOYA-LENTIL001",
        price: 2.99,
        mrp: 4.49,
        stock: 250,
        attributes: { size: "16oz", type: "Green" },
        specifications: [
          { key: "Type", value: "Lentils" },
          { key: "Gluten-Free", value: "Yes" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Goya green lentils",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        {
          title: "Standard Delivery",
          description: "5-7 days",
          isDefault: true,
        },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 30,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
    },
    // 30. Truffle Oil
    {
      name: "Urbani White Truffle Oil",
      description: "Premium white truffle oil for gourmet dishes",
      brand: "Urbani",
      categoryName: "Specialty Foods",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "URBANI-TRUF001",
        price: 19.99,
        mrp: 24.99,
        stock: 100,
        attributes: { size: "3.4oz", type: "White Truffle" },
        specifications: [
          { key: "Type", value: "Truffle Oil" },
          { key: "Origin", value: "Italy" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          altText: "Urbani truffle oil",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      returnPolicy: [
        {
          type: "REFUND",
          duration: 14,
          unit: "days",
          conditions: "Unopened with original packaging",
        },
      ],
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
