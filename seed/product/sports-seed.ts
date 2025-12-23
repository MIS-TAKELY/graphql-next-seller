import { prisma } from "@/lib/db/prisma";

function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

async function createOrGetSeller(
    email: string,
    firstName: string = "Seller",
    lastName: string = "Account"
) {
    let seller = await prisma.user.findUnique({
        where: { email },
        include: { roles: true },
    });

    if (!seller) {
        const baseUsername = email.split("@")[0];
        let username = baseUsername;
        let counter = 1;

        // Ensure unique username
        while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        seller = await prisma.user.create({
            data: {
                email,
                username,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim(),
                roles: {
                    create: [
                        {
                            role: "SELLER",
                        },
                    ],
                },
            },
            include: { roles: true },
        });
        console.log(`Created seller: ${email} with username ${username} and SELLER role`);
    } else {
        // Check if user already has SELLER role
        const hasSellerRole = seller.roles.some((r) => r.role === "SELLER");

        if (!hasSellerRole && seller) {
            await prisma.userRole.create({
                data: {
                    userId: seller.id,
                    role: "SELLER",
                },
            });
            console.log(`Added SELLER role to existing user: ${email}`);
        }
    }

    // Return fresh user with roles
    return await prisma.user.findUnique({
        where: { email },
        include: { roles: true },
    });
}

async function createProduct(
    input: any,
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

    // Convert specifications to specificationTable (JSON)
    const specTable = input.variants.specifications?.reduce((acc: any, spec: any) => {
        acc[spec.key] = spec.value;
        return acc;
    }, {}) || {};

    // Extract features from specifications or use empty array
    const features = input.variants.specifications?.map((spec: any) => `${spec.key}: ${spec.value}`) || [];

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
                    features: features,
                    specificationTable: specTable,
                    variants: {
                        create: {
                            sku: input.variants.sku,
                            price: input.variants.price,
                            mrp: input.variants.mrp || input.variants.price,
                            stock: input.variants.stock,
                            attributes: input.variants.attributes || {},
                            isDefault: input.variants.isDefault !== false,
                            specificationTable: specTable,
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
    const productsData: any[] = [
        // Add sports products here
    ];

    let createdCount = 0;
    for (const productData of productsData) {
        try {
            const seller = await createOrGetSeller(productData.sellerEmail, "", "");
            if (!seller) {
                console.warn(`⚠️ Seller not found for product "${productData.name}" — skipping`);
                continue;
            }
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
    .catch((e) => {
        console.error("Error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });