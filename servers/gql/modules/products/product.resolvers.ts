import { ProductStatus } from "@/app/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/embemdind";
import { generateUniqueSlug } from "@/servers/utils/slugfy";
import { delCache, getCache, setCache } from "@/services/redis.services";
import { requireAuth, requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const productResolvers = {
  Query: {
    getProducts: async (_: any, __: any, ctx: GraphQLContext) => {
      requireAuth(ctx);

      try {
        const cacheKey = "products:all";

        const cached = await getCache(cacheKey);
        if (cached) {
          console.log("⚡ returning products from cache");
          return cached; // Already parsed inside getCache
        }

        console.log("💾 caching products (miss)");
        const products = await prisma.product.findMany({
          include: {
            seller: true,
            variants: {
              include: {
                specifications: true,
              },
            },
            images: true,
            reviews: true,
            category: {
              include: {
                children: true,
                parent: true,
                categorySpecification: true,
              },
            },
            wishlistItems: true,
            productOffers: {
              include: {
                offer: true,
              },
            },
            deliveryOptions: true,
            warranty: true,
            returnPolicy: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        await setCache(cacheKey, products);
        return products;
      } catch (error: any) {
        console.log("error occured while fetching products", error);
        return [];
      }
    },

    getProduct: async (
      _: any,
      { productId }: { productId: string },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);

      if (!productId) throw new Error("Product id is required");
      // const cacheKey = `products:${productId}`;

      // const cached = await getCache(cacheKey);
      // if (cached) {
      //   console.log("⚡ returning product from cache");
      //   return cached;
      // }

      console.log("💾 caching product (miss)");
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          seller: true,
          variants: {
            include: {
              specifications: true,
            },
          },
          images: true,
          reviews: true,
          category: {
            include: {
              children: true,
              parent: {
                include: {
                  parent: true,
                },
              },
            },
          },
          wishlistItems: true,
          productOffers: {
            include: {
              offer: true,
            },
          },
          deliveryOptions: true,
          warranty: true,
          returnPolicy: true,
        },
      });

      // if (product) {
      //   // Only cache if fou  nd
      //   await setCache(cacheKey, product);
      // }

      return product;
    },

    getProductBySlug: async (
      _: any,
      { slug }: { slug: string },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);

      if (!slug) throw new Error("Product slug is required");

      try {
        const cacheKey = `product:details:${slug}`;

        // Try cache first
        const cached = await getCache(cacheKey);
        if (cached) {
          console.log("⚡ returning product from cache (by slug)");
          return cached;
        }

        console.log("💾 fetching product by slug from database");
        const product = await prisma.product.findUnique({
          where: { slug },
          include: {
            seller: true,
            variants: {
              include: {
                specifications: true,
              },
            },
            images: true,
            reviews: {
              include: {
                user: true,
              },
            },
            category: {
              include: {
                children: true,
                parent: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
            wishlistItems: true,
            productOffers: {
              include: {
                offer: true,
              },
            },
            deliveryOptions: true,
            warranty: true,
            returnPolicy: true,
          },
        });

        // Only cache if product is found
        if (product) {
          await setCache(cacheKey, product, 3600); // Cache for 1 hour
        }

        return product; // Returns null if not found
      } catch (error: any) {
        console.error("Error fetching product by slug:", error);
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
    },

    getMyProducts: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireSeller(ctx);
        const userId = user.id;

        if (!userId) throw new Error("Invalid user");

        console.log("💾 caching product (miss)");

        const prisma = ctx.prisma;

        // Fetch all products for this seller
        const products = await prisma.product.findMany({
          where: { sellerId: userId },
          include: {
            variants: { include: { specifications: true } },
            images: true,
            category: {
              include: {
                children: true,
                parent: { include: { parent: true } },
              },
            },
            productOffers: { include: { offer: true } },
            deliveryOptions: true,
            warranty: true,
            returnPolicy: true,
          },
        });

        // Get percentage change in products added compared to last month
        const now = new Date();
        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        const prevMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthCount = await prisma.product.count({
          where: {
            sellerId: userId,
            createdAt: { gte: currentMonthStart, lt: now },
          },
        });

        const prevMonthCount = await prisma.product.count({
          where: {
            sellerId: userId,
            createdAt: { gte: prevMonthStart, lt: prevMonthEnd },
          },
        });

        let percentChange = 0;
        if (prevMonthCount > 0) {
          percentChange =
            ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100;
        } else if (currentMonthCount > 0) {
          percentChange = 100;
        }

        // Cache the products
        // await setCache(cacheKey, products);

        // Return products + percentage change
        return {
          products,
          currentMonthCount,
          previousMonthCount: prevMonthCount,
          percentChange: Number(percentChange.toFixed(2)),
        };
      } catch (error: any) {
        console.error("Error while getting my products:", error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
    },
  },

  Mutation: {
    addProduct: async (
      _: any,
      { input }: { input: any },
      context: GraphQLContext
    ) => {
      try {
        const user = requireSeller(context);

        // 1. Basic Validation
        if (!input.name) throw new Error("Product name is required");
        if (!input.variants || input.variants.length === 0) {
          throw new Error("At least one product variant is required");
        }
        if (!input.images || input.images.length === 0) {
          throw new Error("At least one product image is required");
        }

        input.status === ProductStatus.INACTIVE
          ? (input.status = ProductStatus.INACTIVE)
          : (input.status = ProductStatus.DRAFT);

        // 2. Validate Variants Data
        input.variants.forEach((v: any, index: number) => {
          if (!v.sku)
            throw new Error(`SKU is required for variant #${index + 1}`);
          if (v.price == null)
            throw new Error(`Price is required for variant #${index + 1}`);
          if (v.stock == null)
            throw new Error(`Stock is required for variant #${index + 1}`);
        });

        const sellerId = user.id;
        const slug = await generateUniqueSlug(input.name);

        // 3. Generate Embedding (Optional)
        const textToEmbed = `${input.name} ${input.description || ""} ${input.brand || ""
          }`.trim();
        let embedding: number[] | undefined;
        try {
          if (textToEmbed) embedding = await generateEmbedding(textToEmbed);
        } catch (e) {
          console.warn("Embedding generation failed", e);
        }

        // 4. Transaction
        const product = await prisma.$transaction(
          async (tx) => {
            const newProduct = await tx.product.create({
              data: {
                name: input.name,
                slug,
                description: input.description || "",
                status: input.status || "INACTIVE",
                categoryId: input.categoryId || null,
                brand: input.brand || "Generic",
                sellerId,

                // A. Create Variants (One-to-Many)
                variants: {
                  create: input.variants.map((variant: any, idx: number) => ({
                    sku: variant.sku,
                    price: variant.price,
                    mrp: variant.mrp || variant.price,
                    stock: variant.stock,
                    attributes: variant.attributes || {}, // Store JSON attributes
                    isDefault: variant.isDefault ?? idx === 0, // Default to first if not set

                    // Nested Specifications per Variant
                    specifications:
                      variant.specifications?.length > 0
                        ? {
                          create: variant.specifications.map((spec: any) => ({
                            key: spec.key,
                            value: spec.value,
                          })),
                        }
                        : undefined,
                  })),
                },

                // B. Create Images
                images: {
                  create: input.images.map((img: any, index: number) => ({
                    url: img.url,
                    altText: img.altText || "",
                    sortOrder: img.sortOrder ?? index,
                    mediaType: img.mediaType || "PRIMARY",
                    fileType: img.fileType,
                  })),
                },

                // C. Delivery Options
                deliveryOptions:
                  input.deliveryOptions?.length > 0
                    ? {
                      create: input.deliveryOptions.map((opt: any) => ({
                        title: opt.title,
                        description: opt.description,
                        isDefault: opt.isDefault || false,
                      })),
                    }
                    : undefined,

                // D. Warranty
                warranty:
                  input.warranty?.length > 0
                    ? {
                      create: input.warranty.map((w: any) => ({
                        type: w.type,
                        duration: w.duration,
                        unit: w.unit,
                        description: w.description,
                      })),
                    }
                    : undefined,

                // E. Return Policy
                returnPolicy:
                  input.returnPolicy?.length > 0
                    ? {
                      create: input.returnPolicy.map((p: any) => ({
                        type: p.type,
                        duration: p.duration,
                        unit: p.unit,
                        conditions: p.conditions,
                      })),
                    }
                    : undefined,
              },
            });

            // console.log("new products-->",newProduct)

            // Save Embedding via raw SQL (Prisma doesn't fully type pgvector yet)
            if (embedding) {
              await tx.$executeRaw`UPDATE "products" SET embedding = ${embedding}::vector WHERE id = ${newProduct.id}`;
            }

            return newProduct;
          },
          { timeout: 30000 }
        );

        if (product) console.log("product created");

        // 5. Cleanup Cache
        await Promise.all([
          delCache(`product:details:${slug}`), // Invalidate detail cache for buyer
          delCache("products:all"),
          delCache(`products:seller:${sellerId}`),
        ]);

        return true;
      } catch (error: any) {
        console.error("Error creating product:", error);
        throw new Error(error.message || "Failed to create product");
      }
    },

    updateProduct: async (
      _: any,
      { input }: { input: any },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;

        if (!input.id) throw new Error("Product ID is required");

        // 1. Authorization Check
        const existingProduct = await prisma.product.findFirst({
          where: { id: input.id, sellerId },
          include: { variants: true },
        });

        if (!existingProduct) {
          throw new Error("Product not found or unauthorized");
        }

        // 2. Prepare Basic Updates
        const productData: any = {};
        if (input.name) {
          productData.name = input.name;
          if (input.name !== existingProduct.name) {
            productData.slug = await generateUniqueSlug(input.name);
          }
        }
        if (input.description !== undefined)
          productData.description = input.description;
        if (input.status !== undefined) productData.status = input.status;
        if (input.categoryId !== undefined)
          productData.categoryId = input.categoryId;
        if (input.brand !== undefined) productData.brand = input.brand;

        await prisma.$transaction(
          async (tx) => {
            // A. Update Product Root
            if (Object.keys(productData).length > 0) {
              await tx.product.update({
                where: { id: input.id },
                data: productData,
              });
            }

            // B. SYNC VARIANTS (Critical for Orders)
            // We cannot just delete all variants because OrderItems link to Variant IDs.
            if (input.variants) {
              const incomingIds = input.variants
                .filter((v: any) => v.id)
                .map((v: any) => v.id);

              // 1. Delete variants not in the input (unless they have orders - optional check)
              // Note: Prisma will fail if foreign key constraint exists (Order) and on delete cascade is not set.
              // Ideally, you soft delete or check orders. For now, assuming standard delete.
              await tx.productVariant.deleteMany({
                where: {
                  productId: input.id,
                  id: { notIn: incomingIds },
                },
              });

              // 2. Upsert (Update or Create)
              for (const v of input.variants) {
                const variantData = {
                  sku: v.sku,
                  price: v.price,
                  mrp: v.mrp || v.price,
                  stock: v.stock,
                  attributes: v.attributes || {},
                  isDefault: v.isDefault || false,
                };

                if (v.id) {
                  // Update Existing
                  await tx.productVariant.update({
                    where: { id: v.id },
                    data: {
                      ...variantData,
                      // Re-create specifications for this variant
                      specifications: {
                        deleteMany: {},
                        create: v.specifications?.map((s: any) => ({
                          key: s.key,
                          value: s.value,
                        })),
                      },
                    },
                  });
                } else {
                  // Create New
                  await tx.productVariant.create({
                    data: {
                      productId: input.id,
                      ...variantData,
                      specifications: {
                        create: v.specifications?.map((s: any) => ({
                          key: s.key,
                          value: s.value,
                        })),
                      },
                    },
                  });
                }
              }
            }

            // C. Re-create Dependent Lists (Images, Warranty, etc.)
            // These are usually safe to delete and recreate as they aren't linked to Orders directly in your schema

            // Images
            if (input.images) {
              await tx.productImage.deleteMany({
                where: { productId: input.id },
              });
              await tx.productImage.createMany({
                data: input.images.map((img: any, i: number) => ({
                  productId: input.id,
                  url: img.url,
                  altText: img.altText,
                  sortOrder: img.sortOrder ?? i,
                  mediaType: img.mediaType || "PRIMARY",
                  fileType: img.fileType,
                })),
              });
            }

            // Delivery Options
            if (input.deliveryOptions) {
              await tx.deliveryOption.deleteMany({
                where: { productId: input.id },
              });
              await tx.deliveryOption.createMany({
                data: input.deliveryOptions.map((opt: any) => ({
                  productId: input.id,
                  title: opt.title,
                  description: opt.description,
                  isDefault: opt.isDefault,
                })),
              });
            }

            // Warranty
            if (input.warranty) {
              await tx.warranty.deleteMany({ where: { productId: input.id } });
              await tx.warranty.createMany({
                data: input.warranty.map((w: any) => ({
                  productId: input.id,
                  type: w.type,
                  duration: w.duration,
                  unit: w.unit,
                  description: w.description,
                })),
              });
            }

            // Return Policy
            if (input.returnPolicy) {
              await tx.returnPolicy.deleteMany({
                where: { productId: input.id },
              });
              await tx.returnPolicy.createMany({
                data: input.returnPolicy.map((p: any) => ({
                  productId: input.id,
                  type: p.type,
                  duration: p.duration,
                  unit: p.unit,
                  conditions: p.conditions,
                })),
              });
            }
          },
          { timeout: 30000 }
        );

        // Cache Invalidation
        await Promise.all([
          delCache(`product:${input.id}`), // Used by list query individual cache
          delCache(`product:details:${existingProduct.slug}`), // New details cache
          delCache("products:all"),
          delCache(`products:seller:${sellerId}`),
        ]);

        return true;
      } catch (error: any) {
        console.error("Error updating product:", error);
        throw new Error(error.message || "Failed to update product");
      }
    },

    deleteProduct: async (
      _: any,
      { productId }: { productId: string },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);
      const sellerId = user.id;
      if (!productId) {
        throw new Error("Product ID is required");
      }
      // console.log("prodyvt ir-->", productId);/
      // Ensure the product exists and belongs to the seller
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.sellerId !== ctx.user!.id) {
        throw new Error("Unauthorized: You can only delete your own products");
      }

      try {
        // Delete will cascade to related entities based on your schema
        const productDeleteResponse = await prisma.product.delete({
          where: { id: productId },
          include: {
            variants: true,
            images: true,
          },
        });
        if (!productDeleteResponse)
          throw new Error("Unable to to delete the product");

        await Promise.all([
          delCache(`product:${productId}`),
          delCache(`product:details:${product.slug}`),
          delCache("products:all"),
          delCache(`products:seller:${sellerId}`),
        ]);
        return true;
      } catch (error: any) {
        console.error("Error deleting product:", error);
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    },
  },
};
