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
    await createOrGetSeller("laptop@test.com", "John", "Doe"),
    await createOrGetSeller("laptop@test.com", "Jane", "Smith"),
    await createOrGetSeller("laptop@test.com", "Mike", "Johnson"),
  ];

  const productsData = [
    // 1. Apple MacBook Air M2
    {
      name: "Apple MacBook Air M2",
      description:
        "Lightweight laptop with M2 chip for exceptional performance",
      brand: "Apple",
      categoryName: "Laptops",
      sellerEmail: "laptop1@test.com",
      variants: {
        sku: "APLMBAIR-M2-001",
        price: 1199.99,
        mrp: 1299.99,
        stock: 50,
        attributes: { color: "Space Gray", storage: "256GB SSD" },
        specifications: [
          { key: "Processor", value: "Apple M2" },
          { key: "RAM", value: "8GB" },
          { key: "Display", value: "13.6-inch Retina" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Apple MacBook Air M2",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 2. Dell XPS 15
    {
      name: "Dell XPS 15",
      description: "Powerful laptop with 4K OLED display",
      brand: "Dell",
      categoryName: "Laptops",
      sellerEmail: "laptop2@test.com",
      variants: {
        sku: "DELLXPS15-001",
        price: 1799.99,
        mrp: 1999.99,
        stock: 30,
        attributes: { color: "Silver", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-13700H" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "15.6-inch 4K OLED" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Dell XPS 15",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 3. Lenovo ThinkPad X1 Carbon Gen 11
    {
      name: "Lenovo ThinkPad X1 Carbon Gen 11",
      description: "Business laptop with robust build and long battery life",
      brand: "Lenovo",
      categoryName: "Laptops",
      sellerEmail: "laptop3@test.com",
      variants: {
        sku: "LENX1C11-001",
        price: 1599.99,
        mrp: 1799.99,
        stock: 40,
        attributes: { color: "Black", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1365U" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch WUXGA" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Lenovo ThinkPad X1 Carbon",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 4. HP Spectre x360 14
    {
      name: "HP Spectre x360 14",
      description: "Convertible laptop with OLED touchscreen",
      brand: "HP",
      categoryName: "Laptops",
      sellerEmail: "laptop4@test.com",
      variants: {
        sku: "HPSPX360-001",
        price: 1499.99,
        mrp: 1699.99,
        stock: 35,
        attributes: { color: "Nightfall Black", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1355U" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "13.5-inch OLED" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "HP Spectre x360 14",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 5. Asus ZenBook 14 OLED
    {
      name: "Asus ZenBook 14 OLED",
      description: "Sleek ultrabook with vibrant OLED display",
      brand: "Asus",
      categoryName: "Laptops",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "ASUSZB14-001",
        price: 1299.99,
        mrp: 1499.99,
        stock: 45,
        attributes: { color: "Ponder Blue", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i5-1340P" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch OLED 2.8K" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Asus ZenBook 14 OLED",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 6. Acer Swift X
    {
      name: "Acer Swift X",
      description: "Compact laptop for creators with dedicated GPU",
      brand: "Acer",
      categoryName: "Laptops",
      sellerEmail: "laptop1@test.com",
      variants: {
        sku: "ACERSWX-001",
        price: 1099.99,
        mrp: 1299.99,
        stock: 50,
        attributes: { color: "Safari Gold", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "AMD Ryzen 7 7840U" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch FHD+" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Acer Swift X",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 7. MSI Stealth 16 Studio
    {
      name: "MSI Stealth 16 Studio",
      description: "Gaming laptop with sleek design and high performance",
      brand: "MSI",
      categoryName: "Laptops",
      sellerEmail: "laptop2@test.com",
      variants: {
        sku: "MSIST16-001",
        price: 1999.99,
        mrp: 2199.99,
        stock: 25,
        attributes: { color: "Star Blue", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i9-13900H" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "16-inch QHD+" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "MSI Stealth 16 Studio",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 24,
          unit: "months",
          description: "2-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 8. Razer Blade 14
    {
      name: "Razer Blade 14",
      description: "Compact gaming laptop with NVIDIA RTX graphics",
      brand: "Razer",
      categoryName: "Laptops",
      sellerEmail: "laptop3@test.com",
      variants: {
        sku: "RAZB14-001",
        price: 1899.99,
        mrp: 2099.99,
        stock: 30,
        attributes: { color: "Black", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "AMD Ryzen 9 7940HS" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch QHD+ 165Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Razer Blade 14",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 9. Samsung Galaxy Book 4 Pro
    {
      name: "Samsung Galaxy Book 4 Pro",
      description: "Slim laptop with AMOLED display and S Pen support",
      brand: "Samsung",
      categoryName: "Laptops",
      sellerEmail: "laptop4@test.com",
      variants: {
        sku: "SAMGB4P-001",
        price: 1399.99,
        mrp: 1599.99,
        stock: 40,
        attributes: { color: "Moonstone Gray", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core Ultra 7" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch AMOLED" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Samsung Galaxy Book 4 Pro",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 10. LG Gram 17
    {
      name: "LG Gram 17",
      description: "Ultra-light laptop with large display",
      brand: "LG",
      categoryName: "Laptops",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "LGGRAM17-001",
        price: 1699.99,
        mrp: 1899.99,
        stock: 35,
        attributes: { color: "White", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1360P" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "17-inch WQXGA" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "LG Gram 17",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 11. Microsoft Surface Laptop 5
    {
      name: "Microsoft Surface Laptop 5",
      description: "Elegant laptop with touchscreen and Windows 11",
      brand: "Microsoft",
      categoryName: "Laptops",
      sellerEmail: "laptop1@test.com",
      variants: {
        sku: "MSFTSL5-001",
        price: 1299.99,
        mrp: 1499.99,
        stock: 40,
        attributes: { color: "Platinum", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i5-1235U" },
          { key: "RAM", value: "8GB" },
          { key: "Display", value: "13.5-inch PixelSense" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Microsoft Surface Laptop 5",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 12. Alienware m16
    {
      name: "Alienware m16",
      description: "High-performance gaming laptop with RGB lighting",
      brand: "Alienware",
      categoryName: "Laptops",
      sellerEmail: "laptop2@test.com",
      variants: {
        sku: "ALIENM16-001",
        price: 2199.99,
        mrp: 2399.99,
        stock: 20,
        attributes: { color: "Dark Metallic Moon", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i9-13900HX" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "16-inch QHD+ 165Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Alienware m16",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 13. Framework Laptop 13
    {
      name: "Framework Laptop 13",
      description: "Modular laptop with customizable components",
      brand: "Framework",
      categoryName: "Laptops",
      sellerEmail: "laptop3@test.com",
      variants: {
        sku: "FRMWK13-001",
        price: 1049.99,
        mrp: 1199.99,
        stock: 50,
        attributes: { color: "Silver", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1360P" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "13.5-inch 2.2K" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Framework Laptop 13",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 14. Gigabyte Aero 16
    {
      name: "Gigabyte Aero 16",
      description: "Creator-focused laptop with 4K AMOLED display",
      brand: "Gigabyte",
      categoryName: "Laptops",
      sellerEmail: "laptop4@test.com",
      variants: {
        sku: "GIGAERO16-001",
        price: 1999.99,
        mrp: 2199.99,
        stock: 25,
        attributes: { color: "Silver", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i9-13900H" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "16-inch 4K AMOLED" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Gigabyte Aero 16",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 15. Toshiba Dynabook Portege X30W
    {
      name: "Toshiba Dynabook Portege X30W",
      description: "Lightweight convertible laptop for professionals",
      brand: "Toshiba",
      categoryName: "Laptops",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "TOSHX30W-001",
        price: 1399.99,
        mrp: 1599.99,
        stock: 35,
        attributes: { color: "Mystic Blue", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i5-1235U" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "13.3-inch FHD Touch" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Toshiba Dynabook Portege X30W",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 16. Huawei MateBook X Pro
    {
      name: "Huawei MateBook X Pro",
      description: "Premium ultrabook with touchscreen display",
      brand: "Huawei",
      categoryName: "Laptops",
      sellerEmail: "laptop1@test.com",
      variants: {
        sku: "HUAMATEX-001",
        price: 1499.99,
        mrp: 1699.99,
        stock: 40,
        attributes: { color: "Emerald Green", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1360P" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14.2-inch LTPS Touch" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Huawei MateBook X Pro",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 17. Xiaomi Book Pro 16
    {
      name: "Xiaomi Book Pro 16",
      description: "High-resolution laptop for productivity and entertainment",
      brand: "Xiaomi",
      categoryName: "Laptops",
      sellerEmail: "laptop2@test.com",
      variants: {
        sku: "XIAOBP16-001",
        price: 1299.99,
        mrp: 1499.99,
        stock: 35,
        attributes: { color: "Silver", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1260P" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "16-inch 2.5K" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Xiaomi Book Pro 16",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 18. Sony VAIO Z
    {
      name: "Sony VAIO Z",
      description: "Premium carbon-fiber laptop with 4K display",
      brand: "Sony",
      categoryName: "Laptops",
      sellerEmail: "laptop3@test.com",
      variants: {
        sku: "SONYVAIOZ-001",
        price: 2499.99,
        mrp: 2699.99,
        stock: 20,
        attributes: { color: "Black Carbon", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-13700H" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "14-inch 4K" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Sony VAIO Z",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 19. Lenovo Legion 7i
    {
      name: "Lenovo Legion 7i",
      description: "Gaming laptop with high refresh rate display",
      brand: "Lenovo",
      categoryName: "Laptops",
      sellerEmail: "laptop4@test.com",
      variants: {
        sku: "LENLEG7I-001",
        price: 1899.99,
        mrp: 2099.99,
        stock: 30,
        attributes: { color: "Slate Grey", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i9-13900HX" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "16-inch WQXGA 165Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Lenovo Legion 7i",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 20. HP Omen 16
    {
      name: "HP Omen 16",
      description: "Gaming laptop with advanced cooling system",
      brand: "HP",
      categoryName: "Laptops",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "HPOMEN16-001",
        price: 1799.99,
        mrp: 1999.99,
        stock: 25,
        attributes: { color: "Shadow Black", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "AMD Ryzen 9 7945HX" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "16.1-inch QHD 165Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "HP Omen 16",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 21. Asus ROG Zephyrus G14
    {
      name: "Asus ROG Zephyrus G14",
      description: "Compact gaming laptop with AniMe Matrix display",
      brand: "Asus",
      categoryName: "Laptops",
      sellerEmail: "laptop1@test.com",
      variants: {
        sku: "ASUSROGZG14-001",
        price: 1699.99,
        mrp: 1899.99,
        stock: 30,
        attributes: { color: "Moonlight White", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "AMD Ryzen 9 7940HS" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch QHD+ 165Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Asus ROG Zephyrus G14",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 22. Acer Predator Helios 300
    {
      name: "Acer Predator Helios 300",
      description: "Affordable gaming laptop with high performance",
      brand: "Acer",
      categoryName: "Laptops",
      sellerEmail: "laptop2@test.com",
      variants: {
        sku: "ACERPRED300-001",
        price: 1299.99,
        mrp: 1499.99,
        stock: 40,
        attributes: { color: "Abyssal Black", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-12700H" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "15.6-inch FHD 144Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Acer Predator Helios 300",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 23. Dell Inspiron 16 Plus
    {
      name: "Dell Inspiron 16 Plus",
      description: "Versatile laptop for work and entertainment",
      brand: "Dell",
      categoryName: "Laptops",
      sellerEmail: "laptop3@test.com",
      variants: {
        sku: "DELLINSP16P-001",
        price: 1099.99,
        mrp: 1299.99,
        stock: 50,
        attributes: { color: "Mist Blue", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-13620H" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "16-inch 2.5K" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Dell Inspiron 16 Plus",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 24. Lenovo Yoga 9i
    {
      name: "Lenovo Yoga 9i",
      description: "Premium convertible laptop with 4K touchscreen",
      brand: "Lenovo",
      categoryName: "Laptops",
      sellerEmail: "laptop4@test.com",
      variants: {
        sku: "LENYOGA9I-001",
        price: 1699.99,
        mrp: 1899.99,
        stock: 30,
        attributes: { color: "Storm Grey", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1360P" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch 4K OLED Touch" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Lenovo Yoga 9i",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 25. MSI Katana 15
    {
      name: "MSI Katana 15",
      description: "Budget-friendly gaming laptop with RTX graphics",
      brand: "MSI",
      categoryName: "Laptops",
      sellerEmail: "seller5@test.com",
      variants: {
        sku: "MSIKAT15-001",
        price: 1199.99,
        mrp: 1399.99,
        stock: 45,
        attributes: { color: "Black", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-12650H" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "15.6-inch FHD 144Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "MSI Katana 15",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 26. Razer Blade 16
    {
      name: "Razer Blade 16",
      description: "Premium gaming laptop with dual-mode display",
      brand: "Razer",
      categoryName: "Laptops",
      sellerEmail: "laptop1@test.com",
      variants: {
        sku: "RAZB16-001",
        price: 2699.99,
        mrp: 2899.99,
        stock: 20,
        attributes: { color: "Black", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i9-13950HX" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "16-inch UHD+/FHD+ Dual Mode" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Razer Blade 16",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 27. Samsung Galaxy Book 3 Ultra
    {
      name: "Samsung Galaxy Book 3 Ultra",
      description: "High-performance laptop with AMOLED display",
      brand: "Samsung",
      categoryName: "Laptops",
      sellerEmail: "laptop2@test.com",
      variants: {
        sku: "SAMGB3U-001",
        price: 2199.99,
        mrp: 2399.99,
        stock: 25,
        attributes: { color: "Graphite", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i9-13900H" },
          { key: "RAM", value: "32GB" },
          { key: "Display", value: "16-inch AMOLED 3K" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Samsung Galaxy Book 3 Ultra",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 28. LG Gram 16
    {
      name: "LG Gram 16",
      description: "Ultra-light laptop with long battery life",
      brand: "LG",
      categoryName: "Laptops",
      sellerEmail: "laptop3@test.com",
      variants: {
        sku: "LGGRAM16-001",
        price: 1499.99,
        mrp: 1699.99,
        stock: 40,
        attributes: { color: "Obsidian Black", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1360P" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "16-inch WQXGA" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "LG Gram 16",
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
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 29. Microsoft Surface Pro 9
    {
      name: "Microsoft Surface Pro 9",
      description: "Versatile 2-in-1 laptop with touchscreen",
      brand: "Microsoft",
      categoryName: "Laptops",
      sellerEmail: "laptop4@test.com",
      variants: {
        sku: "MSFTSP9-001",
        price: 1399.99,
        mrp: 1599.99,
        stock: 35,
        attributes: { color: "Sapphire", storage: "512GB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-1255U" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "13-inch PixelSense Flow" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Microsoft Surface Pro 9",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
        },
      ],
    },
    // 30. Alienware x14
    {
      name: "Alienware x14",
      description: "Slim gaming laptop with high performance",
      brand: "Alienware",
      categoryName: "Laptops",
      sellerEmail: "laptop5@test.com",
      variants: {
        sku: "ALIENX14-001",
        price: 1799.99,
        mrp: 1999.99,
        stock: 30,
        attributes: { color: "Lunar Light", storage: "1TB SSD" },
        specifications: [
          { key: "Processor", value: "Intel Core i7-13620H" },
          { key: "RAM", value: "16GB" },
          { key: "Display", value: "14-inch FHD+ 144Hz" },
        ],
      },
      images: [
        {
          url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          altText: "Alienware x14",
          fileType: "IMAGE",
        },
      ],
      deliveryOptions: [
        { title: "Express Delivery", description: "2-3 days", isDefault: true },
      ],
      warranty: [
        {
          type: "MANUFACTURER",
          duration: 12,
          unit: "months",
          description: "1-year warranty",
        },
      ],
      returnPolicy: [
        {
          type: "REPLACEMENT_OR_REFUND",
          duration: 14,
          unit: "days",
          conditions: "Original packaging",
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
