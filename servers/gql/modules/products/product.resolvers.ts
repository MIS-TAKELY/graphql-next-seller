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

        // Validate required fields
        if (!input.name) {
          throw new Error("Product name is required");
        }
        if (!input.variants) {
          throw new Error("Product variant information is required");
        }
        if (!input.images || !input.images.length) {
          throw new Error("At least one product image is required");
        }

        // Validate variant data
        const variant = input.variants;
        if (!variant.sku) throw new Error("SKU is required");
        if (variant.price == null || isNaN(Number(variant.price)))
          throw new Error("Valid price is required");
        if (variant.stock == null || isNaN(Number(variant.stock)))
          throw new Error("Valid stock quantity is required");

        const sellerId = user.id;
        const slug = await generateUniqueSlug(input.name);

        console.log("input-->", input);

        // Use a transaction to ensure all related data is created together
        const product = await prisma.$transaction(
          async (tx) => {
            const textToEmbed = `${input.name} ${input.description || ""} ${
              input.brand || ""
            }`.trim();

            let embedding;

            if (textToEmbed) {
              try {
                embedding = await generateEmbedding(textToEmbed);
              } catch (err) {
                console.log(
                  "Failed to generate embedding for product:",
                  input.name
                );
                console.error(err);
              }
            }

            // Create the product with variant and images
            const newProduct = await tx.product.create({
              data: {
                name: input.name,
                slug,
                description: input.description || "",
                status: "INACTIVE",
                categoryId: input.categoryId || null,
                brand: input.brand || "Generic",
                sellerId,

                // Create variant
                variants: {
                  create: {
                    sku: variant.sku,
                    price: variant.price,
                    mrp: variant.mrp || variant.price,
                    stock: variant.stock,
                    attributes: variant.attributes || {},
                    isDefault: variant.isDefault !== false,
                    specifications:
                      variant.specifications?.length > 0
                        ? {
                            create: variant.specifications.map((spec: any) => ({
                              key: spec.key,
                              value: spec.value,
                            })),
                          }
                        : undefined,
                  },
                },

                // Create images
                images: {
                  create: input.images.map((img: any, index: number) => ({
                    url: img.url,
                    altText: img.altText || null,
                    sortOrder:
                      img.sortOrder !== undefined ? img.sortOrder : index,
                    mediaType: img.mediaType || "PRIMARY",
                    fileType: img.fileType,
                  })),
                },
              },
            });
            if (embedding) {
              await tx.$executeRaw`
    UPDATE "products"
    SET embedding = ${embedding}::vector
    WHERE id = ${newProduct.id}
  `;
            }
            // Create offers if provided
            if (input.productOffers?.length > 0) {
              for (const offerInput of input.productOffers) {
                const offer = await tx.offer.create({
                  data: {
                    title: offerInput.offer.title,
                    description: offerInput.offer.description || null,
                    type: offerInput.offer.type,
                    value: offerInput.offer.value,
                    startDate: new Date(offerInput.offer.startDate),
                    endDate: new Date(offerInput.offer.endDate),
                    bannerImage: offerInput.offer.bannerImage || null,
                    isActive: true,
                  },
                });

                await tx.productOffer.create({
                  data: {
                    productId: newProduct.id,
                    offerId: offer.id,
                  },
                });
              }
            }

            // Create delivery options if provided
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

            // Create warranty if provided
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

            // Create return policy if provided
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

            // Fetch the complete product with all relations
            return await tx.product.findUnique({
              where: { id: newProduct.id },
              // include: {
              //   variants: {
              //     include: {
              //       specifications: true,
              //     },
              //   },
              //   images: true,
              //   seller: true,
              //   category: true,
              //   productOffers: {
              //     include: {
              //       offer: true,
              //     },
              //   },
              //   deliveryOptions: true,
              //   warranty: true,
              //   returnPolicy: true,
              // },
            });
          },
          { timeout: 30000 } // Moved timeout here for the entire transaction
        );

        if (!product) throw new Error("Unable to create product");
        console.log("Product created successfully:", product);

        console.log("deleting cache");
        await Promise.all([
          delCache("product:all"),
          delCache(`products:seller:${sellerId}`),
        ]);
        return true;
      } catch (error: any) {
        console.error("Error while creating product:", error);
        throw new Error(`Failed to create product: ${error.message}`);
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
          delCache("product:all"),
          delCache(`products:seller:${sellerId}`),
        ]);
        return true;
      } catch (error: any) {
        console.error("Error deleting product:", error);
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    },

    updateProduct: async (
      _: any,
      { input }: { input: any },
      ctx: GraphQLContext
    ) => {
      try {
        // Validate user is a seller
        const user = requireSeller(ctx);
        const sellerId = user.id;

        // Validate input
        if (!input.id) {
          throw new Error("Product ID is required");
        }

        // Verify product exists and belongs to the seller
        const existingProduct = await prisma.product.findFirst({
          where: {
            id: input.id,
            sellerId,
          },
          include: {
            variants: true,
          },
        });

        if (!existingProduct) {
          throw new Error(
            "Product not found or you are not authorized to update it"
          );
        }

        // Prepare product update data (only include provided fields)
        const productData: any = {};
        if (input.name !== undefined) {
          productData.name = input.name;
          if (input.name !== existingProduct.name) {
            productData.slug = await generateUniqueSlug(input.name);
          }
        }
        if (input.description !== undefined) {
          productData.description = input.description;
        }
        if (input.status !== undefined) {
          productData.status = input.status;
        }
        if (input.categoryId !== undefined) {
          productData.categoryId = input.categoryId;
        }
        if (input.brand !== undefined) {
          productData.brand = input.brand;
        }

        // Use a transaction for atomic updates
        await prisma.$transaction(
          async (tx) => {
            // Update product table if there are fields to update
            if (Object.keys(productData).length > 0) {
              await tx.product.update({
                where: { id: input.id },
                data: productData,
              });
            }

            // Update variants if provided
            if (input.variants !== undefined) {
              let defaultVariant = await tx.productVariant.findFirst({
                where: {
                  productId: input.id,
                  isDefault: true,
                },
              });

              if (defaultVariant) {
                // Prepare variant update data (only include provided fields)
                const variantData: any = {};
                if (input.variants.sku !== undefined) {
                  variantData.sku = input.variants.sku;
                }
                if (input.variants.price !== undefined) {
                  if (
                    input.variants.price == null ||
                    isNaN(Number(input.variants.price))
                  ) {
                    throw new Error("Valid price is required for variant");
                  }
                  variantData.price = input.variants.price;
                  // Only update mrp if explicitly provided, otherwise keep price
                  variantData.mrp =
                    input.variants.mrp !== undefined
                      ? input.variants.mrp
                      : input.variants.price;
                }
                if (input.variants.stock !== undefined) {
                  if (
                    input.variants.stock == null ||
                    isNaN(Number(input.variants.stock))
                  ) {
                    throw new Error(
                      "Valid stock quantity is required for variant"
                    );
                  }
                  variantData.stock = input.variants.stock;
                }
                if (input.variants.attributes !== undefined) {
                  variantData.attributes = input.variants.attributes;
                }
                if (input.variants.isDefault !== undefined) {
                  variantData.isDefault = input.variants.isDefault;
                }

                // Update existing default variant if there are changes
                if (Object.keys(variantData).length > 0) {
                  await tx.productVariant.update({
                    where: { id: defaultVariant.id },
                    data: variantData,
                  });
                }

                // Update specifications if provided
                if (input.variants.specifications !== undefined) {
                  await tx.productSpecification.deleteMany({
                    where: { variantId: defaultVariant.id },
                  });
                  if (input.variants.specifications?.length > 0) {
                    await tx.productSpecification.createMany({
                      data: input.variants.specifications.map((spec: any) => ({
                        variantId: defaultVariant.id,
                        key: spec.key,
                        value: spec.value,
                      })),
                    });
                  }
                }
              } else if (input.variants !== undefined) {
                // Validate required fields for new variant
                if (!input.variants.sku) {
                  throw new Error("SKU is required for variant");
                }
                if (
                  input.variants.price == null ||
                  isNaN(Number(input.variants.price))
                ) {
                  throw new Error("Valid price is required for variant");
                }
                if (
                  input.variants.stock == null ||
                  isNaN(Number(input.variants.stock))
                ) {
                  throw new Error(
                    "Valid stock quantity is required for variant"
                  );
                }

                // Create a new default variant
                await tx.productVariant.create({
                  data: {
                    productId: input.id,
                    sku: input.variants.sku,
                    price: input.variants.price,
                    mrp:
                      input.variants.mrp !== undefined
                        ? input.variants.mrp
                        : input.variants.price,
                    stock: input.variants.stock,
                    attributes: input.variants.attributes || {},
                    isDefault: input.variants.isDefault !== false,
                    specifications:
                      input.variants.specifications?.length > 0
                        ? {
                            create: input.variants.specifications.map(
                              (spec: any) => ({
                                key: spec.key,
                                value: spec.value,
                              })
                            ),
                          }
                        : undefined,
                  },
                });
              }
            }

            // Update images if provided
            if (input.images !== undefined) {
              await tx.productImage.deleteMany({
                where: { productId: input.id },
              });
              if (input.images?.length > 0) {
                await tx.productImage.createMany({
                  data: input.images.map((img: any, index: number) => ({
                    productId: input.id,
                    url: img.url,
                    altText: img.altText || null,
                    sortOrder:
                      img.sortOrder !== undefined ? img.sortOrder : index,
                    mediaType: img.mediaType || "PRIMARY",
                    fileType: img.fileType,
                  })),
                });
              }
            }

            // Update product offers if provided
            if (input.productOffers !== undefined) {
              await tx.productOffer.deleteMany({
                where: { productId: input.id },
              });
              if (input.productOffers?.length > 0) {
                for (const offerInput of input.productOffers) {
                  const offer = await tx.offer.create({
                    data: {
                      title: offerInput.offer.title,
                      description: offerInput.offer.description || null,
                      type: offerInput.offer.type,
                      value: offerInput.offer.value,
                      startDate: new Date(offerInput.offer.startDate),
                      endDate: new Date(offerInput.offer.endDate),
                      bannerImage: offerInput.offer.bannerImage || null,
                      isActive: true,
                    },
                  });

                  await tx.productOffer.create({
                    data: {
                      productId: input.id,
                      offerId: offer.id,
                    },
                  });
                }
              }
            }

            // Update delivery options if provided
            if (input.deliveryOptions !== undefined) {
              await tx.deliveryOption.deleteMany({
                where: { productId: input.id },
              });
              if (input.deliveryOptions?.length > 0) {
                await tx.deliveryOption.createMany({
                  data: input.deliveryOptions.map((option: any) => ({
                    productId: input.id,
                    title: option.title,
                    description: option.description || null,
                    isDefault: option.isDefault || false,
                  })),
                });
              }
            }

            // Update warranty if provided
            if (input.warranty !== undefined) {
              await tx.warranty.deleteMany({
                where: { productId: input.id },
              });
              if (input.warranty?.length > 0) {
                await tx.warranty.createMany({
                  data: input.warranty.map((warranty: any) => ({
                    productId: input.id,
                    type: warranty.type,
                    duration: warranty.duration || null,
                    unit: warranty.unit || null,
                    description: warranty.description || null,
                  })),
                });
              }
            }

            // Update return policy if provided
            if (input.returnPolicy !== undefined) {
              await tx.returnPolicy.deleteMany({
                where: { productId: input.id },
              });
              if (input.returnPolicy?.length > 0) {
                await tx.returnPolicy.createMany({
                  data: input.returnPolicy.map((policy: any) => ({
                    productId: input.id,
                    type: policy.type,
                    duration: policy.duration || null,
                    unit: policy.unit || null,
                    conditions: policy.conditions || null,
                  })),
                });
              }
            }
          },
          { timeout: 30000 }
        );

        // Clear Redis caches
        await Promise.all([
          delCache(`product:${input.id}`),
          delCache("product:all"),
          delCache(`products:seller:${sellerId}`),
        ]);

        console.log("Product updated successfully:", input.id);
        return true;
      } catch (error: any) {
        console.error("Error while updating product:", error);
        throw new Error(`Failed to update product: ${error.message}`);
      }
    },
  },
};
