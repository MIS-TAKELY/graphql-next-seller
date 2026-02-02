import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/embedding";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { generateUniqueSlug } from "@/servers/utils/slugfy";
import { delCache, getCache, setCache } from "@/services/redis.services";
import { ProductStatus } from "@/app/generated/prisma";
import { requireAuth, requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

// Product cache version - increment when product data structure changes
const PRODUCT_CACHE_VERSION = "v2";
const getProductCacheKey = (slug: string) =>
  `product:details:${PRODUCT_CACHE_VERSION}:${slug}`;

/**
 * Triggers notifications for users who requested to be notified when a product is restocked.
 * Marked as async and handles its own errors to avoid blocking the main stock update transaction.
 */
async function triggerNotifications(productId: string, variantId: string, productName: string, productSlug: string) {
  console.log(`🔔 Product restocked! Triggering notifications for product ${productId}, variant ${variantId}`);

  try {
    // Import notification functions from seller's service
    const { sendEmailNotification } = await import("@/services/notificationService");

    // Get all pending notifications for this product/variant
    // Note: We need to use raw SQL since ProductNotification model might not be in seller's Prisma schema
    const notifications: any[] = await prisma.$queryRaw`
      SELECT pn.*, u.email as user_email, u.phone as user_phone
      FROM product_notifications pn
      LEFT JOIN "user" u ON pn."userId" = u.id
      WHERE pn."productId" = ${productId}
      AND pn."variantId" = ${variantId}
      AND pn."isNotified" = false
    `;

    if (notifications.length > 0) {
      console.log(`📧 Sending ${notifications.length} restock notifications...`);

      let notifiedCount = 0;
      const notificationIds: string[] = [];

      for (const notification of notifications) {
        try {
          // Send email notification
          const emailToUse = notification.email || notification.user_email;
          if (emailToUse) {
            await sendEmailNotification(emailToUse, productName, productSlug)
              .catch(err => console.error(`Email fail for ${emailToUse}: ${err.message}`));
          }

          // Send WhatsApp notification
          const phoneToUse = notification.phone || notification.user_phone;
          if (phoneToUse) {
            const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/product/${productSlug}`;
            const message = `${productName} is back in stock! ${productUrl}`;
            // Dynamic import to avoid missing dependencies in some environments
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            await sendWhatsAppMessage(phoneToUse, message)
              .catch(err => console.error(`WhatsApp fail for ${phoneToUse}: ${err.message}`));
          }

          notificationIds.push(notification.id);
          notifiedCount++;
        } catch (notifError) {
          console.error("Error sending individual notification:", notifError);
          // Still push ID so we don't spam them if it failing for a specific user or channel
          notificationIds.push(notification.id);
        }
      }

      // Mark notifications as sent using raw SQL
      if (notificationIds.length > 0) {
        await prisma.$executeRaw`
          UPDATE product_notifications
          SET "isNotified" = true, "updatedAt" = NOW()
          WHERE id = ANY(${notificationIds}::text[])
        `;

        console.log(`✅ Successfully notified ${notifiedCount} users about restock`);
      }
    } else {
      console.log("No pending notifications found for this product/variant");
    }
  } catch (notificationError) {
    // Don't fail the stock update if notifications fail
    console.error("Error triggering notifications (non-critical):", notificationError);
  }
}

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
            images: { orderBy: { sortOrder: 'asc' } },
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
          images: { orderBy: { sortOrder: 'asc' } },
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
        const cacheKey = getProductCacheKey(slug);

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
            images: { orderBy: { sortOrder: 'asc' } },
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

    getMyProducts: async (
      _: any,
      { skip, take, searchTerm, status, categoryId }: any,
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireSeller(ctx);
        const userId = user.id;

        const prisma = ctx.prisma;
        const where: any = { sellerId: userId };

        if (searchTerm) {
          where.OR = [
            { name: { contains: searchTerm, mode: "insensitive" } },
            {
              variants: {
                some: { sku: { contains: searchTerm, mode: "insensitive" } },
              },
            },
          ];
        }

        if (status && status !== "all") {
          if (status === "active") where.status = "ACTIVE";
          else if (status === "draft") where.status = "DRAFT";
          else if (status === "out_of_stock")
            where.variants = { some: { stock: 0 } };
          else if (status === "low_stock")
            where.variants = { some: { stock: { gt: 0, lte: 10 } } };
        }

        if (categoryId && categoryId !== "all") {
          where.categoryId = categoryId;
        }

        const [products, totalCount] = await Promise.all([
          prisma.product.findMany({
            where,
            include: {
              variants: true, // Need variants for stock info in table
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
              category: {
                include: {
                  parent: true,
                },
              },
            },
            skip: skip ?? undefined,
            take: take ?? undefined,
            orderBy: { createdAt: "desc" },
          }),
          prisma.product.count({ where }),
        ]);

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

        const [currentMonthCount, prevMonthCount] = await Promise.all([
          prisma.product.count({
            where: {
              sellerId: userId,
              createdAt: { gte: currentMonthStart, lt: now },
            },
          }),
          prisma.product.count({
            where: {
              sellerId: userId,
              createdAt: { gte: prevMonthStart, lt: prevMonthEnd },
            },
          }),
        ]);

        let percentChange = 0;
        if (prevMonthCount > 0) {
          percentChange =
            ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100;
        } else if (currentMonthCount > 0) {
          percentChange = 100;
        }

        return {
          products,
          totalCount,
          currentMonthCount,
          previousMonthCount: prevMonthCount,
          percentChange: Number(percentChange.toFixed(2)),
        };
      } catch (error: any) {
        console.error("Error while getting my products:", error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
    },

    getMyProductStats: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireSeller(ctx);
        const userId = user.id;
        const prisma = ctx.prisma;

        const [total, active, outOfStock, lowStock] = await Promise.all([
          prisma.product.count({ where: { sellerId: userId } }),
          prisma.product.count({
            where: { sellerId: userId, status: "ACTIVE" },
          }),
          prisma.product.count({
            where: {
              sellerId: userId,
              variants: { some: { stock: 0 } },
            },
          }),
          prisma.product.count({
            where: {
              sellerId: userId,
              variants: { some: { stock: { gt: 0, lte: 10 } } },
            },
          }),
        ]);

        return { total, active, outOfStock, lowStock };
      } catch (error: any) {
        console.error("Error fetching product stats:", error);
        throw new Error("Failed to fetch product stats");
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

        input.status === ProductStatus.ACTIVE
          ? (input.status = ProductStatus.ACTIVE)
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
        console.log(`🔍 [GQL mutation] addProduct: generating embedding for "${input.name}"`);
        let embedding: number[] | undefined;
        try {
          if (textToEmbed) {
            embedding = await generateEmbedding(textToEmbed);
            console.log("✅ Embedding generated successfully");
          } else {
            console.log("⚠️ No text to embed, skipping embedding generation");
          }
        } catch (e) {
          console.warn("❌ Embedding generation failed in resolver:", e);
        }

        // 4. Transaction
        const product = await prisma.$transaction(
          async (tx: any) => {
            const newProduct = await tx.product.create({
              data: {
                name: input.name,
                slug,
                description: input.description || "",
                status: input.status || "INACTIVE",
                categoryId: input.categoryId || null,
                brand: input.brand || "Generic",
                sellerId,

                specificationTable: input.specificationTable || null,
                specificationDisplayFormat: input.specificationDisplayFormat || "bullet",

                // A. Create Variants (One-to-Many)
                variants: {
                  create: input.variants.map((variant: any, idx: number) => ({
                    sku: variant.sku,
                    price: variant.price,
                    mrp: variant.mrp || variant.price,
                    stock: variant.stock,
                    attributes: variant.attributes || {}, // Store JSON attributes
                    isDefault: variant.isDefault ?? idx === 0, // Default to first if not set
                    specificationTable: variant.specificationTable || null,

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
              await tx.$executeRaw`UPDATE "products" SET embedding = ${JSON.stringify(embedding)}::vector WHERE id = ${newProduct.id}`;
            }

            return newProduct;
          },
          { timeout: 15000 }
        );

        if (product) console.log("product created");

        // 5. Cleanup Cache
        await Promise.all([
          delCache(getProductCacheKey(slug)), // Invalidate versioned detail cache
          delCache(`product:${slug}`), // Invalidate list internal cache
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
        if (input.specificationTable !== undefined)
          productData.specificationTable = input.specificationTable;
        if (input.specificationDisplayFormat !== undefined)
          productData.specificationDisplayFormat = input.specificationDisplayFormat;

        // 2.1 Embedding Update (if relevant fields changed)
        let updatedEmbedding: number[] | undefined;
        const nameToEmbed = input.name || existingProduct.name;
        const descriptionToEmbed = input.description !== undefined ? input.description : existingProduct.description;
        const brandToEmbed = input.brand !== undefined ? input.brand : existingProduct.brand;

        if (input.name || input.description !== undefined || input.brand !== undefined) {
          const textToEmbed = `${nameToEmbed} ${descriptionToEmbed || ""} ${brandToEmbed || ""}`.trim();
          console.log(`🔍 [GQL mutation] updateProduct: regenerating embedding for "${nameToEmbed}"`);
          try {
            if (textToEmbed) {
              updatedEmbedding = await generateEmbedding(textToEmbed);
              console.log("✅ New embedding generated successfully");
            }
          } catch (e) {
            console.warn("❌ Embedding regeneration failed in updateProduct:", e);
          }
        }

        await prisma.$transaction(
          async (tx: any) => {
            // A. Update Product Root
            if (Object.keys(productData).length > 0) {
              await tx.product.update({
                where: { id: input.id },
                data: productData,
              });
            }

            // Update embedding if generated
            if (updatedEmbedding) {
              await tx.$executeRaw`UPDATE "products" SET embedding = ${JSON.stringify(updatedEmbedding)}::vector WHERE id = ${input.id}`;
            }

            // B. SYNC VARIANTS (Robust Synchronization)
            if (input.variants) {
              const incomingVariants = input.variants;

              // 1. Fetch current variants to match by SKU if ID is missing
              const currentVariants = existingProduct.variants;

              const variantsToUpdate = [];
              const variantsToCreate = [];
              const usedCurrentVariantIds = new Set<string>();

              for (const incoming of incomingVariants) {
                let existingMatch = null;

                if (incoming.id) {
                  existingMatch = currentVariants.find(
                    (cv: any) => cv.id === incoming.id
                  );
                } else if (incoming.sku) {
                  // Fallback: match by SKU if no ID provided (common in some frontend flows)
                  existingMatch = currentVariants.find(
                    (cv: any) => cv.sku === incoming.sku
                  );
                }

                if (existingMatch) {
                  variantsToUpdate.push({
                    id: existingMatch.id,
                    data: incoming,
                  });
                  usedCurrentVariantIds.add(existingMatch.id);
                } else {
                  variantsToCreate.push(incoming);
                }
              }

              // 2. Delete variants not in the input AND not matched by SKU
              // Note: Only delete if they have no orders
              await tx.productVariant.deleteMany({
                where: {
                  productId: input.id,
                  id: { notIn: Array.from(usedCurrentVariantIds) },
                  orderItems: { none: {} },
                  SellerOrderItem: { none: {} },
                },
              });

              // 3. Perform Updates
              for (const updateItem of variantsToUpdate) {
                const { id, data: v } = updateItem;
                await tx.productVariant.update({
                  where: { id },
                  data: {
                    sku: v.sku,
                    price: v.price,
                    mrp: v.mrp || v.price,
                    stock: v.stock,
                    attributes: v.attributes || {},
                    isDefault: v.isDefault || false,
                    specificationTable: v.specificationTable || null,
                    specifications: {
                      deleteMany: {},
                      create: v.specifications?.map((s: any) => ({
                        key: s.key,
                        value: s.value,
                      })),
                    },
                  },
                });
              }

              // 4. Perform Creations
              for (const v of variantsToCreate) {
                await tx.productVariant.create({
                  data: {
                    productId: input.id,
                    sku: v.sku,
                    price: v.price,
                    mrp: v.mrp || v.price,
                    stock: v.stock,
                    attributes: v.attributes || {},
                    isDefault: v.isDefault || false,
                    specificationTable: v.specificationTable || null,
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
          { timeout: 15000 }
        );

        // Trigger notifications if restocking (0 → > 0)
        for (const v of input.variants || []) {
          const oldVariant = existingProduct.variants.find(ov => ov.sku === v.sku || (v.id && ov.id === v.id));
          if (oldVariant && oldVariant.stock === 0 && v.stock > 0) {
            console.log(`🔔 Product restocked via updateProduct! Triggering notifications for variant ${oldVariant.id}`);
            // We'll call the same logic as in updateVariantStock
            // For simplicity in this large file, I'll extract it if I can or just repeat it carefully.
            // Actually, let's keep it consistent.
            triggerNotifications(input.id, oldVariant.id, existingProduct.name, existingProduct.slug);
          }
        }

        return true;
      } catch (error: any) {
        console.error("Error updating product:", error);
        throw new Error(error.message || "Failed to update product");
      }
    },

    updateVariantStock: async (
      _: any,
      { variantId, stock }: { variantId: string; stock: number },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;

        if (!variantId) throw new Error("Variant ID is required");

        // 1. Authorization Check: Ensure the variant belongs to a product owned by the seller
        const variant = await prisma.productVariant.findFirst({
          where: {
            id: variantId,
            product: {
              sellerId,
            },
          },
          include: {
            product: true,
          },
        });

        if (!variant) {
          throw new Error("Variant not found or unauthorized");
        }

        // Store old stock value to check if we're restocking
        const oldStock = variant.stock;
        const wasOutOfStock = oldStock === 0;
        const isNowInStock = stock > 0;

        // 2. Update Stock
        await prisma.productVariant.update({
          where: { id: variantId },
          data: { stock },
        });

        // 3. Trigger notifications if restocking (0 → > 0)
        if (wasOutOfStock && isNowInStock) {
          triggerNotifications(variant.product.id, variantId, variant.product.name, variant.product.slug);
        }

        // 4. Cache Invalidation
        await Promise.all([
          delCache(`product:${variant.product.slug}`),
          delCache(getProductCacheKey(variant.product.slug)),
          delCache("products:all"),
          delCache(`products:seller:${sellerId}`),
        ]);

        return true;
      } catch (error: any) {
        console.error("Error updating variant stock:", error);
        throw new Error(error.message || "Failed to update stock");
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
          delCache(`product:${product.slug}`),
          delCache(getProductCacheKey(product.slug)),
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
