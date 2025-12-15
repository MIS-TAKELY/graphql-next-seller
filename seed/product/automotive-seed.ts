import { prisma } from "@/lib/db/prisma";


function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function createOrGetSeller(email: string, firstName: string, lastName: string) {
  let seller = await prisma.user.findUnique({ where: { email } });
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        clerkId: `clerk_${email.split("@")[0]}`,
        email,
        firstName,
        lastName,
        roles: {
          create: {
            role: "SELLER",
          },
        },
      },
    });
  }
  return seller;
}

async function createProduct(input: any, sellerId: string, categoryId: string) {
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
                    create: input.variants.specifications.map((spec: any) => ({
                      key: spec.key,
                      value: spec.value,
                    })),
                  }
                  : undefined,
            },
          },
          images: {
            create: input.images.map((img: any, index: number) => ({
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
          data: input.deliveryOptions.map((option: any) => ({
            productId: newProduct.id,
            title: option.title,
            description: option.description || null,
            isDefault: option.isDefault || false,
          })),
        });
      }

      if (input.warranty?.length > 0) {
        await tx.warranty.createMany({
          data: input.warranty.map((warranty: any) => ({
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
          data: input.returnPolicy.map((policy: any) => ({
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

  const productsData: any[] = [

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
    } catch (error: any) {
      console.error(`❌ Error creating "${productData.name}":`, error.message);
    }
  }

  console.log(`\n🎉 Seeding complete! Created ${createdCount} products.`);
}

main()
  .catch((e: any) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });