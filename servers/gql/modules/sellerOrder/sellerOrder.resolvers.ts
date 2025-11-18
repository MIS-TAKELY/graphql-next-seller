import { ApolloError } from "@apollo/client";
import { requireSeller } from "../../auth/auth";
import type { GraphQLContext as ResolverContext } from "../../context";
import type { ConfirmOrderInput, UpdateSellerOrderStatusInput } from "../../types";

export const sellerOrderResolver = {
  Query: {
    getSellerOrders: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;
        const prisma = ctx.prisma;

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

        // Fetch orders for seller

        //   id
        // status
        // createdAt
        // items {
        //   totalPrice
        //   unitPrice
        //   variant {
        //     price
        //   }
        // }
        const orders = await prisma.sellerOrder.findMany({
          where: { sellerId },
          include: {
            order: {
              include: {
                buyer: true,
                payments: true,
                
                items: {
                  include: {
                    variant: {
                      include: { product: { include: { images: true } } },
                    },
                  },
                },
                shipments: true,
              },
            },
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Count orders for current month
        const currentOrderCount = await prisma.sellerOrder.count({
          where: {
            sellerId,
            createdAt: {
              gte: currentMonthStart,
              lt: now,
            },
          },
        });

        // Count orders for previous month
        const prevOrderCount = await prisma.sellerOrder.count({
          where: {
            sellerId,
            createdAt: {
              gte: prevMonthStart,
              lt: prevMonthEnd,
            },
          },
        });

        // Calculate percentage change
        let percentChange = 0;
        if (prevOrderCount > 0) {
          percentChange =
            ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100;
        } else if (currentOrderCount > 0) {
          percentChange = 100;
        }

        // Return orders + percentage change
        return {
          sellerOrders: orders,
          currentOrderCount,
          previousOrderCount: prevOrderCount,
          percentChange: Number(percentChange.toFixed(2)),
        };
      } catch (error) {
        console.error("Error occurred while fetching orders -->", error);
        throw error;
      }
    },
    getActiveUsersForSeller: async (_: unknown, __: unknown, ctx: ResolverContext) => {
      try {
        const user = requireSeller(ctx);
        const sellerId = user.id;
        const prisma = ctx.prisma;

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

        // Helper function to get unique active users in a date range
        const getActiveUsers = async (start: Date, end: Date) => {
          const orders = await prisma.sellerOrder.findMany({
            where: {
              sellerId,
              createdAt: {
                gte: start,
                lt: end,
              },
            },
            select: { buyerOrderId: true },
          });

          const buyerIds = new Set<string>();

          for (const order of orders) {
            const buyerOrder = await prisma.order.findUnique({
              where: { id: order.buyerOrderId },
              select: { buyerId: true },
            });
            if (buyerOrder) buyerIds.add(buyerOrder.buyerId);
          }

          return buyerIds.size;
        };

        const currentActiveUsers = await getActiveUsers(currentMonthStart, now);
        const prevActiveUsers = await getActiveUsers(
          prevMonthStart,
          prevMonthEnd
        );

        // Calculate percentage change
        let percentChange = 0;
        if (prevActiveUsers > 0) {
          percentChange =
            ((currentActiveUsers - prevActiveUsers) / prevActiveUsers) * 100;
        } else if (currentActiveUsers > 0) {
          percentChange = 100;
        }

        return {
          currentActiveUsers,
          previousActiveUsers: prevActiveUsers,
          percentChange: Number(percentChange.toFixed(2)),
        };
      } catch (error) {
        console.error("Error calculating active users change:", error);
        throw error;
      }
    },
  },

  Mutation: {
    confirmOrder: async (
      _: unknown,
      { input }: { input: ConfirmOrderInput },
      context: ResolverContext
    ): Promise<boolean> => {
      const { sellerOrderId } = input;

      // Authorization check: Ensure user is authenticated and has SELLER role

      requireSeller(context);
      const prisma = context.prisma;

      // Fetch the SellerOrder with its parent Order
      const sellerOrder = await prisma.sellerOrder.findUnique({
        where: { id: sellerOrderId },
        include: {
          order: {
            include: {
              sellerOrders: true, // Fetch all SellerOrders for the parent Order
            },
          },
        },
      });

      if (!sellerOrder) {
        throw new ApolloError({
          errorMessage: "Seller order not found",
          extraInfo: { code: "NOT_FOUND" },
        });
      }

      // Check if SellerOrder is in PENDING status
      if (sellerOrder.status !== "PENDING") {
        throw new ApolloError({
          errorMessage: `Seller order is already in ${sellerOrder.status} status`,
          extraInfo: { code: "INVALID_STATE" },
        });
      }

      try {
        // Start a transaction to ensure atomic updates
        const [updatedSellerOrder] = await prisma.$transaction([
          // Update the SellerOrder to CONFIRMED (not PROCESSING)
          prisma.sellerOrder.update({
            where: { id: sellerOrderId },
            data: {
              status: "CONFIRMED",
              updatedAt: new Date(),
            },
            include: {
              order: {
                include: {
                  sellerOrders: true,
                },
              },
            },
          }),
        ]);

        // Check if all SellerOrders for the parent Order are CONFIRMED
        const allSellerOrdersConfirmed = updatedSellerOrder.order.sellerOrders.every(
          (so) => so.status === "CONFIRMED"
        );

        let updatedOrder = updatedSellerOrder.order;

        if (allSellerOrdersConfirmed && updatedOrder.status === "PENDING") {
          // Update the parent Order to CONFIRMED
          updatedOrder = await prisma.order.update({
            where: { id: sellerOrder.buyerOrderId },
            data: {
              status: "CONFIRMED",
              updatedAt: new Date(),
            },
            include: {
              sellerOrders: true,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error confirming order:", error);
        throw new ApolloError({
          errorMessage: "Failed to confirm order",
          extraInfo: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    // confirmOrder: async (
    //   _: any,
    //   { input }: { input: { sellerOrderId: string } },
    //   context: GraphQLContext
    // ) => {
    //   const { sellerOrderId } = input;

    //   // Authorization check: Ensure user is authenticated and has SELLER role
    //   requireSeller(context);
    //   const prisma = context.prisma;

    //   // Fetch the SellerOrder with its parent Order
    //   const sellerOrder = await prisma.sellerOrder.findUnique({
    //     where: { id: sellerOrderId },
    //     include: {
    //       order: {
    //         include: {
    //           sellerOrders: true, // Fetch all SellerOrders for the parent Order
    //         },
    //       },
    //     },
    //   });

    //   if (!sellerOrder) {
    //     throw new ApolloError({
    //       errorMessage: "Seller order not found",
    //       extraInfo: { code: "NOT_FOUND" },
    //     });
    //   }

    //   // Verify the authenticated user is the seller for this SellerOrder
    //   if (sellerOrder.sellerId !== context.user.id) {
    //     throw new ApolloError({
    //       errorMessage: "Unauthorized: You can only confirm your own orders",
    //       extraInfo: { code: "FORBIDDEN" },
    //     });
    //   }

    //   // Check if SellerOrder is in PENDING status
    //   if (sellerOrder.status !== "PENDING") {
    //     throw new ApolloError({
    //       errorMessage: `Seller order is already in ${sellerOrder.status} status`,
    //       extraInfo: { code: "INVALID_STATE" },
    //     });
    //   }

    //   try {
    //     // Start a transaction to ensure atomic updates
    //     const [updatedSellerOrder] = await prisma.$transaction([
    //       // Update the SellerOrder to CONFIRMED
    //       prisma.sellerOrder.update({
    //         where: { id: sellerOrderId },
    //         data: {
    //           status: "CONFIRMED",
    //           updatedAt: new Date(),
    //         },
    //         include: {
    //           order: true,
    //           seller: true,
    //           items: true,
    //         },
    //       }),
    //     ]);

    //     // Check if all SellerOrders for the parent Order are CONFIRMED
    //     const allSellerOrdersConfirmed = sellerOrder.order.sellerOrders.every(
    //       (so) =>
    //         so.id === sellerOrderId || // Skip the current SellerOrder (it’s updated)
    //         so.status === "CONFIRMED" // Check other SellerOrders
    //     );

    //     let updatedOrder = sellerOrder.order;

    //     if (allSellerOrdersConfirmed && updatedOrder.status === "PENDING") {
    //       // Update the parent Order to CONFIRMED
    //       updatedOrder = await prisma.order.update({
    //         where: { id: sellerOrder.buyerOrderId },
    //         data: {
    //           status: "CONFIRMED",
    //           updatedAt: new Date(),
    //         },
    //         include: {
    //           sellerOrders: true,
    //         },
    //       });
    //     }

    //     return {
    //       sellerOrder: {
    //         ...updatedSellerOrder,
    //         subtotal: parseFloat(updatedSellerOrder.subtotal),
    //         tax: parseFloat(updatedSellerOrder.tax),
    //         shippingFee: parseFloat(updatedSellerOrder.shippingFee),
    //         commission: parseFloat(updatedSellerOrder.commission),
    //         total: parseFloat(updatedSellerOrder.total),
    //       },
    //       order: {
    //         ...updatedOrder,
    //         subtotal: parseFloat(updatedOrder.subtotal),
    //         tax: parseFloat(updatedOrder.tax),
    //         shippingFee: parseFloat(updatedOrder.shippingFee),
    //         discount: parseFloat(updatedOrder.discount),
    //         total: parseFloat(updatedOrder.total),
    //       },
    //     };
    //   } catch (error) {
    //     console.error("Error confirming order:", error);
    //     throw new ApolloError({
    //       errorMessage: "Failed to confirm order",
    //       extraInfo: { code: "INTERNAL_SERVER_ERROR" },
    //     });
    //   }
    // },

    updateSellerOrderStatus: async (
      _: unknown,
      { sellerOrderId, status }: UpdateSellerOrderStatusInput,
      context: ResolverContext
    ) => {
      // Authorization check: Ensure user is authenticated and has SELLER role
      requireSeller(context);
      const prisma = context.prisma;

      // Validate status
      const validStatuses = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ];
      if (!validStatuses.includes(status)) {
        throw new ApolloError({
          errorMessage: `Invalid status: ${status}`,
          extraInfo: { code: "INVALID_INPUT" },
        });
      }

      // Fetch the SellerOrder
      const sellerOrder = await prisma.sellerOrder.findUnique({
        where: { id: sellerOrderId },
        include: {
          seller: true,
          items: true,
          order: true,
        },
      });

      if (!sellerOrder) {
        throw new ApolloError({
          errorMessage: "Seller order not found",
          extraInfo: { code: "NOT_FOUND" },
        });
      }

      // Verify the authenticated user is the seller for this SellerOrder
      if (sellerOrder.sellerId !== context.user?.id) {
        throw new ApolloError({
          errorMessage: "Unauthorized: You can only update your own orders",
          extraInfo: { code: "FORBIDDEN" },
        });
      }

      // Optional: Add status transition validation
      // Example: Can't move to SHIPPED if not CONFIRMED or PROCESSING
      type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
      
      const validTransitions: Record<OrderStatus, string[]> = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED", "RETURNED"],
        DELIVERED: ["RETURNED"],
        CANCELLED: [],
        RETURNED: [],
      };
      
      const currentStatus = sellerOrder.status as OrderStatus;
      if (!validTransitions[currentStatus]?.includes(status)) {
        throw new ApolloError({
          errorMessage: `Cannot transition from ${sellerOrder.status} to ${status}`,
          extraInfo: { code: "INVALID_STATE" },
        });
      }

      try {
        // Update the SellerOrder status                                                                              
        const updatedSellerOrder = await prisma.sellerOrder.update({
          where: { id: sellerOrderId },
          data: {
                                                                                                                                                                                                                                                    status,
            updatedAt: new Date(),
          },                                                                                                                                                                                                                                                                                                        
          include: {
            seller: true,
            items: true,
            order: true,                                                                                                                                                                                                  
          },
        });

        return {
          ...updatedSellerOrder,
          subtotal: updatedSellerOrder.subtotal.toNumber(),
          tax: updatedSellerOrder.tax.toNumber(),
          shippingFee: updatedSellerOrder.shippingFee.toNumber(),
          commission: updatedSellerOrder.commission.toNumber(),
          total: updatedSellerOrder.total.toNumber(),
        };
      } catch (error) {
        console.error("Error updating seller order status:", error);
        throw new ApolloError({
          errorMessage: "Failed to update seller order status",
          extraInfo: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    createShipment: async (
      _: unknown,                                                                                                                                                                                                                                                                                                                                                                                                               
      {
        orderId,
        trackingNumber,
        carrier,
      }: {
        orderId: string;
        trackingNumber: string;
        carrier: string;
      },
      context: ResolverContext
    ) => {
      // Authorization check: Ensure user is authenticated and has SELLER role
      requireSeller(context);
      const prisma = context.prisma;

      // Validate status
      const validShipmentStatuses = [
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RETURNED",
        "LOST",
      ];
      const status = "SHIPPED";
      if (!validShipmentStatuses.includes(status)) {
        throw new ApolloError({
          errorMessage: `Invalid shipment status: ${status}`,
          extraInfo: { code: "INVALID_INPUT" },
        });
      }

      // Fetch the Order and verify the seller has a SellerOrder
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          sellerOrders: true,
        },
      });

      if (!order) {
        throw new ApolloError({
          errorMessage: "Order not found",
          extraInfo: { code: "NOT_FOUND" },
        });
      }

      // Verify the authenticated user has a SellerOrder for this Order
      const sellerOrder = order.sellerOrders.find(
        (so) => so.sellerId === context.user?.id
      );
      if (!sellerOrder) {
        throw new ApolloError({
          errorMessage: "Unauthorized: You are not associated with this order",
          extraInfo: { code: "FORBIDDEN" },
        });
      }

      try {
        // Create the Shipment
        const shipment = await prisma.shipment.create({
          data: {
            orderId,
            trackingNumber,
            carrier,
            status,
            shippedAt: status === "SHIPPED" ? new Date() : null,
            estimatedDelivery: null, // Optionally calculate based on carrier
          },
        });

        return {
          ...shipment,
          shippedAt: shipment.shippedAt
            ? shipment.shippedAt.toISOString()
            : null,
          estimatedDelivery: shipment.estimatedDelivery
            ? shipment.estimatedDelivery.toISOString()
            : null,
        };
      } catch (error) {
        console.error("Error creating shipment:", error);
        throw new ApolloError({
          errorMessage: "Failed to create shipment",
          extraInfo: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
