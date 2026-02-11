import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/embedding";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { generateUniqueSlug } from "@/servers/utils/slugfy";
import { delCache, getCache, setCache } from "@/services/redis.services";
import { typesenseClient } from "@/lib/typesense";
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
        if (!input.name || !input.name.trim()) {
          throw new Error("Product name is required. Please provide a valid product name.");
        }
        if (!input.variants || input.variants.length === 0) {
          throw new Error("At least one product variant is required. Please add variant details.");
        }
        if (!input.images || input.images.length === 0) {
          throw new Error("At least one product image is required. Please upload product images.");
        }

        input.status === ProductStatus.ACTIVE
          ? (input.status = ProductStatus.ACTIVE)
          : (input.status = ProductStatus.DRAFT);

        // 2. Validate Variants Data
        input.variants.forEach((v: any, index: number) => {
          if (!v.sku || !v.sku.trim()) {
            throw new Error(`SKU is required for variant #${index + 1}. Please provide a unique SKU.`);
          }
          if (v.price == null || v.price <= 0) {
            throw new Error(`Valid price is required for variant #${index + 1}. Please enter a price greater than 0.`);
          }
          if (v.stock == null || v.stock < 0) {
            throw new Error(`Valid stock quantity is required for variant #${index + 1}. Please enter 0 or more.`);
          }
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

            // Save Embedding via raw SQL
            if (embedding) {
              await tx.$executeRaw`UPDATE "products" SET embedding = ${JSON.stringify(embedding)}::vector WHERE id = ${newProduct.id}`;
            }

            return newProduct;
          },
          { timeout: 15000 }
        );

        if (product) {
          console.log("product created");

          // 6. Index to Typesense (Non-blocking)
          (async () => {
            try {
              // Construct document matching Buyer's schema
              const defaultVariant = input.variants.find((v: any, i: number) => v.isDefault || i === 0);
              const price = defaultVariant ? Number(defaultVariant.price) : 0;
              const document: any = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description || '',
                brand: product.brand,
                categoryName: 'Uncategorized', // Placeholder, will fix below in fetch
                categoryId: product.categoryId || '',
                price: price,
                image: input.images[0]?.url || '',
                status: product.status,
                soldCount: 0,
                averageRating: 0,
                createdAt: Math.floor(product.createdAt.getTime() / 1000),
                facet_attributes: defaultVariant?.specifications?.map((s: any) => `${s.key}:${s.value}`) || [],
              };

              // Fetch category name if exists
              if (product.categoryId) {
                const cat = await prisma.category.findUnique({ where: { id: product.categoryId }, select: { name: true } });
                if (cat) document.categoryName = cat.name;
              }

              await typesenseClient.collections('products').documents().upsert(document);
              console.log("✅ Indexed to Typesense");
            } catch (error) {
              // Silently log or warning for background sync failures
              console.warn("⚠️ Background Typesense index failed (handled):", error instanceof Error ? error.message : "Timeout");
            }
          })();
        }

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

        // Check for Prisma unique constraint violations
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          console.log("P2002 Unique constraint error - target:", target, "type:", Array.isArray(target) ? 'array' : typeof target);

          // Convert target to string for checking (handles both array and string cases)
          const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');

          // SKU duplicate error
          if (targetStr.toLowerCase().includes('sku')) {
            throw new Error("This SKU is already in use. Please use a different SKU for this product.");
          }

          // Product name/slug duplicate error
          if (targetStr.toLowerCase().includes('slug') || targetStr.toLowerCase().includes('name')) {
            throw new Error("A product with a similar name already exists. Please use a different product name.");
          }

          // Generic unique constraint error
          throw new Error("This value is already in use. Please use a unique value.");
        }

        // Check for foreign key constraint violations
        if (error.code === 'P2003') {
          if (error.meta?.field_name?.includes('category')) {
            throw new Error("Invalid category selected. Please choose a valid category.");
          }
          throw new Error("Invalid reference. Please check your selections and try again.");
        }

        // Check for required field violations
        if (error.code === 'P2011' || error.code === 'P2012') {
          throw new Error("Required field is missing. Please fill in all required fields.");
        }

        // Pass through validation errors with their messages
        throw new Error(error.message || "Failed to create product. Please try again.");
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
              await tx.returnPolicy.deleteMany({ where: { productId: input.id } });
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
          { timeout: 20000 }
        );

        // 3. Typesense Sync (After Transaction - Non-blocking)
        (async () => {
          try {
            const freshProduct = await prisma.product.findUnique({
              where: { id: input.id },
              include: {
                category: true,
                variants: { include: { specifications: true } },
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                reviews: { select: { rating: true } }
              }
            });

            if (freshProduct && freshProduct.status === 'ACTIVE') {
              const defaultVariant = freshProduct.variants.find((v: any) => v.isDefault) || freshProduct.variants[0];
              const price = defaultVariant ? Number(defaultVariant.price) : 0;

              // Calculate derived fields
              const soldCount = freshProduct.variants.reduce((acc: number, v: any) => acc + (v.soldCount || 0), 0);
              const totalRating = freshProduct.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
              const averageRating = freshProduct.reviews.length > 0 ? totalRating / freshProduct.reviews.length : 0;

              const document = {
                id: freshProduct.id,
                name: freshProduct.name,
                slug: freshProduct.slug,
                description: freshProduct.description || '',
                brand: freshProduct.brand,
                categoryName: freshProduct.category?.name || 'Uncategorized',
                categoryId: freshProduct.categoryId || '',
                price: price,
                image: freshProduct.images[0]?.url || '',
                status: freshProduct.status,
                soldCount: soldCount,
                averageRating: averageRating,
                createdAt: Math.floor(freshProduct.createdAt.getTime() / 1000),
                facet_attributes: defaultVariant?.specifications.map((s: any) => `${s.key}:${s.value}`) || [],
              };

              await typesenseClient.collections('products').documents().upsert(document);
              console.log("✅ Updated Typesense index for product:", freshProduct.name);
            } else if (freshProduct && freshProduct.status !== 'ACTIVE') {
              // If product became inactive, remove from index
              await typesenseClient.collections('products').documents(freshProduct.id).delete().catch(() => { });
              console.log("⚠️ Removed inactive product from Typesense:", freshProduct.name);
            }
          } catch (error) {
            console.warn("⚠️ Background Typesense update failed (handled):", error instanceof Error ? error.message : "Timeout");
          }
        })();

        // 4. Cleanup Cache
        const slug = input.name ? await generateUniqueSlug(input.name) : existingProduct.slug;
        const keys = [
          `product:${slug}`,
          "products:all",
          `products:seller:${sellerId}`
        ];
        // Also clear old slug if name changed
        if (existingProduct.slug !== slug) {
          keys.push(`product:${existingProduct.slug}`);
          keys.push(getProductCacheKey(existingProduct.slug));
        }
        keys.push(getProductCacheKey(slug));

        await Promise.all(keys.map(key => delCache(key)));

        return true;
      } catch (error: any) {
        console.error("Error updating product:", error);

        // Check for Prisma unique constraint violations
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          console.log("P2002 Unique constraint error - target:", target, "type:", Array.isArray(target) ? 'array' : typeof target);

          // Convert target to string for checking (handles both array and string cases)
          const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');

          // SKU duplicate error
          if (targetStr.toLowerCase().includes('sku')) {
            throw new Error("This SKU is already in use. Please use a different SKU for this product.");
          }

          // Product name/slug duplicate error
          if (targetStr.toLowerCase().includes('slug') || targetStr.toLowerCase().includes('name')) {
            throw new Error("A product with a similar name already exists. Please use a different product name.");
          }

          // Generic unique constraint error
          throw new Error("This value is already in use. Please use a unique value.");
        }

        // Check for foreign key constraint violations
        if (error.code === 'P2003') {
          if (error.meta?.field_name?.includes('category')) {
            throw new Error("Invalid category selected. Please choose a valid category.");
          }
          throw new Error("Invalid reference. Please check your selections and try again.");
        }

        // Check for required field violations
        if (error.code === 'P2011' || error.code === 'P2012') {
          throw new Error("Required field is missing. Please fill in all required fields.");
        }

        // Pass through validation errors with their messages
        throw new Error(error.message || "Failed to update product. Please try again.");
      }
    },

    deleteProduct: async (
      _: any,
      { productId }: { productId: string },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;

        if (!productId) throw new Error("Product ID is required");

        // 1. Authorize & Fetch
        const product = await prisma.product.findFirst({
          where: { id: productId, sellerId },
          include: {
            variants: {
              include: {
                orderItems: { select: { id: true } },
                SellerOrderItem: { select: { id: true } },
              },
            },
            reviews: { select: { id: true } }
          },
        });

        if (!product) {
          throw new Error("Product not found or unauthorized");
        }

        // 2. Validate Safely
        const hasOrders = product.variants.some(
          (v) => v.orderItems.length > 0 || v.SellerOrderItem.length > 0
        );

        if (hasOrders) {
          throw new Error("Cannot delete product with existing orders. Archive it instead.");
        }

        console.log(`🗑️ Deleting product ${product.name} (${productId})`);

        // 3. Remove from Typesense (Non-blocking)
        (async () => {
          try {
            await typesenseClient.collections('products').documents(productId).delete();
            console.log("✅ Removed from Typesense");
          } catch (error: any) {
            if (error?.httpStatus !== 404) {
              console.warn("⚠️ Failed to remove from Typesense:", error);
            }
          }
        })();

        // 4. Database Deletion (Manual cascades for non-cascading relations)
        await prisma.$transaction(async (tx) => {
          // A. Delete Reviews explicitly if not cascading (Schema said Review->Product is regular relation)
          // But looking at schema: reviews Review[]
          // Review model: product Product @relation(fields: [productId], references: [id])
          // It does NOT have onDelete: Cascade. So we MUST delete manually.
          if (product.reviews.length > 0) {
            await tx.review.deleteMany({
              where: { productId }
            });
          }

          // B. Delete Product (Variants, Images, etc. should cascade)
          await tx.product.delete({
            where: { id: productId },
          });
        });

        // 5. Invalidate Cache
        const keys = [
          `product:${product.slug}`,
          getProductCacheKey(product.slug),
          "products:all",
          `products:seller:${sellerId}`
        ];
        await Promise.all(keys.map(k => delCache(k)));

        console.log("✅ Product deleted successfully");
        return true;

      } catch (error: any) {
        console.error("Error deleting product:", error);
        throw new Error(error.message || "Failed to delete product");
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
        if (stock < 0) throw new Error("Stock cannot be negative");

        // 1. Authorization: Ensure the variant belongs to a product owned by this seller
        const variant = await prisma.productVariant.findFirst({
          where: {
            id: variantId,
            product: { sellerId },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        if (!variant) {
          throw new Error("Variant not found or unauthorized");
        }

        const oldStock = variant.stock;

        // 2. Update stock
        const updatedVariant = await prisma.productVariant.update({
          where: { id: variantId },
          data: { stock },
        });

        // 3. Handle Restock Notifications (proactive async call)
        if (oldStock === 0 && stock > 0) {
          triggerNotifications(
            variant.product.id,
            variant.id,
            variant.product.name,
            variant.product.slug
          ).catch((e) => console.error("Notification trigger fail:", e));
        }

        // 4. Typesense Sync
        try {
          const freshProduct = await prisma.product.findUnique({
            where: { id: variant.productId },
            include: {
              category: true,
              variants: { include: { specifications: true } },
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              reviews: { select: { rating: true } },
            },
          });

          if (freshProduct && freshProduct.status === "ACTIVE") {
            const defaultVariant = freshProduct.variants.find((v: any) => v.isDefault) || freshProduct.variants[0];
            const price = defaultVariant ? Number(defaultVariant.price) : 0;
            const soldCount = freshProduct.variants.reduce((acc: number, v: any) => acc + (v.soldCount || 0), 0);
            const totalRating = freshProduct.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
            const averageRating = freshProduct.reviews.length > 0 ? totalRating / freshProduct.reviews.length : 0;

            const document = {
              id: freshProduct.id,
              name: freshProduct.name,
              slug: freshProduct.slug,
              description: freshProduct.description || "",
              brand: freshProduct.brand,
              categoryName: freshProduct.category?.name || "Uncategorized",
              categoryId: freshProduct.categoryId || "",
              price: price,
              image: freshProduct.images[0]?.url || "",
              status: freshProduct.status,
              soldCount: soldCount,
              averageRating: averageRating,
              createdAt: Math.floor(freshProduct.createdAt.getTime() / 1000),
              facet_attributes: defaultVariant?.specifications.map((s: any) => `${s.key}:${s.value}`) || [],
            };

            await typesenseClient.collections("products").documents().upsert(document);
          }
        } catch (error) {
          console.error("❌ Failed to update Typesense in updateVariantStock:", error);
        }

        // 5. Cache Invalidation
        const keys = [
          `product:${variant.product.slug}`,
          getProductCacheKey(variant.product.slug),
          "products:all",
          `products:seller:${sellerId}`,
        ];
        await Promise.all(keys.map((k) => delCache(k)));

        console.log(`✅ Stock updated for variant ${variantId}: ${oldStock} -> ${stock}`);
        return updatedVariant;
      } catch (error: any) {
        console.error("Error updating variant stock:", error);
        throw new Error(error.message || "Failed to update stock");
      }
    },
  },
};
