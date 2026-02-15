import { OrderStatusChangedPayload, realtime } from "@/lib/realtime";
import { ApolloError } from "@apollo/client";
import { requireSeller } from "../../auth/auth";
import type { GraphQLContext as ResolverContext } from "../../context";
import type {
  ConfirmOrderInput,
  UpdateSellerOrderStatusInput,
} from "../../types";
import { sendOrderStatusNotifications, sendReturnNotifications } from "@/services/orderNotificationService";

type SellerOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

const emitOrderStatusChanged = async (
  userIds: Array<string | null | undefined>,
  payload: OrderStatusChangedPayload
) => {
  const recipients = Array.from(
    new Set(userIds.filter((id): id is string => Boolean(id)))
  );

  await Promise.all(
    recipients.map(async (userId) => {
      try {
        await realtime
          .channel(`user:${userId}`)
          .emit("order.statusChanged", payload);
      } catch (error) {
        console.error("Failed to dispatch order status notification:", error);
      }
    })
  );
};

export const syncParentOrderStatus = async (orderId: string, prisma: any) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { sellerOrders: true }
  });

  if (!order) return;

  const sellerOrders = order.sellerOrders;
  const statuses = sellerOrders.map((so: any) => so.status);

  let newStatus = order.status;

  // 1. If ALL are DELIVERED -> DELIVERED
  if (statuses.every((s: string) => s === "DELIVERED")) {
    newStatus = "DELIVERED";
  }
  // 2. If ALL are CANCELLED -> CANCELLED
  else if (statuses.every((s: string) => s === "CANCELLED")) {
    newStatus = "CANCELLED";
  }
  // 3. If ALL are RETURNED -> RETURNED
  else if (statuses.every((s: string) => s === "RETURNED")) {
    newStatus = "RETURNED";
  }
  // 4. If ALL are (SHIPPED or DELIVERED) -> SHIPPED (if not all delivered)
  else if (statuses.every((s: string) => ["SHIPPED", "DELIVERED", "RETURNED"].includes(s))) {
    newStatus = "SHIPPED";
  }
  // 5. If ALL are (PROCESSING or SHIPPED or DELIVERED) -> PROCESSING
  else if (statuses.every((s: string) => ["PROCESSING", "SHIPPED", "DELIVERED", "RETURNED", "CONFIRMED"].includes(s))) {
    // If any is processing/shipped/delivered, the whole order is effectively processing
    newStatus = "PROCESSING";
  }
  // 6. If ALL are CONFIRMED (already handled but good to have)
  else if (statuses.every((s: string) => s === "CONFIRMED")) {
    newStatus = "CONFIRMED";
  }

  if (newStatus !== order.status) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus, updatedAt: new Date() }
    });
  }
};

export const sellerOrderResolver = {
  Query: {
    getSellerOrders: async (
      _: unknown,
      { limit }: { limit?: number },
      ctx: ResolverContext
    ) => {
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
        const orders = await prisma.sellerOrder.findMany({
          where: { sellerId },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
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
                        images: { orderBy: { sortOrder: 'asc' } },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        // console.log("orders--->", orders);
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
    getActiveUsersForSeller: async (
      _: unknown,
      __: unknown,
      ctx: ResolverContext
    ) => {
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
    getSellerDisputes: async (
      _: any,
      { limit, offset }: { limit: number; offset: number },
      ctx: ResolverContext
    ) => {
      const user = requireSeller(ctx);
      const [disputes, returns] = await Promise.all([
        ctx.prisma.orderDispute.findMany({
          where: {
            order: {
              sellerOrders: {
                some: {
                  sellerId: user.id,
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          include: {
            order: {
              include: {
                items: {
                  include: {
                    variant: {
                      include: {
                        product: {
                          include: {
                            images: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            user: true,
          },
        }),
        ctx.prisma.return.findMany({
          where: {
            items: {
              some: {
                orderItem: {
                  variant: {
                    product: {
                      sellerId: user.id
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
          include: {
            order: {
              include: {
                items: {
                  include: {
                    variant: {
                      include: {
                        product: {
                          include: {
                            images: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            user: true,
          },
        })
      ]);

      const mapReturnStatus = (status: string) => {
        switch (status) {
          case "REQUESTED": return "PENDING";
          case "APPROVED": return "APPROVED";
          case "REJECTED": return "REJECTED";
          case "ACCEPTED": return "RESOLVED";
          case "DENIED": return "REJECTED";
          default: return "PENDING";
        }
      };

      const mappedReturns = returns.map((r: any) => ({
        ...r,
        type: "RETURN",
        status: mapReturnStatus(r.status),
      }));

      const allDisputes = [...disputes, ...mappedReturns].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return allDisputes.slice(offset, offset + limit);
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
          seller: { select: { id: true } },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          order: {
            include: {
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
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
              seller: { select: { id: true } },
              items: {
                include: {
                  variant: {
                    include: {
                      product: {
                        select: { name: true }
                      }
                    }
                  }
                }
              },
              order: {
                include: {
                  buyer: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phoneNumber: true
                    }
                  },
                  sellerOrders: true,
                },
              },
            },
          }),
        ]);

        // Check if all SellerOrders for the parent Order are CONFIRMED
        const allSellerOrdersConfirmed =
          updatedSellerOrder.order.sellerOrders.every(
            (so: any) => so.status === "CONFIRMED"
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
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
            },
          });
        }

        await emitOrderStatusChanged(
          [
            updatedSellerOrder.seller?.id,
            updatedSellerOrder.order.buyer?.id,
          ],
          {
            sellerId: updatedSellerOrder.sellerId,
            sellerOrderId,
            buyerOrderId: updatedSellerOrder.buyerOrderId,
            status: updatedSellerOrder.status as SellerOrderStatus,
            total: updatedSellerOrder.total.toNumber(),
            updatedAt: updatedSellerOrder.updatedAt.toISOString(),
            previousStatus: sellerOrder.status as SellerOrderStatus,
          }
        );

        // Send email and WhatsApp notifications to buyer
        try {
          const buyer = updatedSellerOrder.order.buyer;
          if (buyer) {
            await sendOrderStatusNotifications({
              orderNumber: updatedSellerOrder.order.orderNumber || updatedSellerOrder.buyerOrderId,
              buyerName: buyer.name || "Customer",
              buyerEmail: buyer.email,
              buyerPhone: buyer.phoneNumber,
              items: updatedSellerOrder.items.map((item: any) => ({
                productName: item.variant?.product?.name || "Product",
                quantity: item.quantity,
                price: item.totalPrice.toNumber(),
              })),
              total: updatedSellerOrder.total.toNumber(),
              status: "CONFIRMED",
            });
          }
        } catch (notificationError) {
          console.error("Failed to send order confirmation notifications:", notificationError);
          // Don't fail the mutation if notifications fail
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
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          order: {
            include: {
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
              shipments: true,
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

      // Verify the authenticated user is the seller for this SellerOrder
      if (sellerOrder.sellerId !== context.user?.id) {
        throw new ApolloError({
          errorMessage: "Unauthorized: You can only update your own orders",
          extraInfo: { code: "FORBIDDEN" },
        });
      }

      // Optional: Add status transition validation
      // Example: Can't move to SHIPPED if not CONFIRMED or PROCESSING
      const validTransitions: Record<SellerOrderStatus, string[]> = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED", "RETURNED"],
        DELIVERED: ["RETURNED"],
        CANCELLED: [],
        RETURNED: [],
      };

      const currentStatus = sellerOrder.status as SellerOrderStatus;
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
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      select: { name: true }
                    }
                  }
                }
              }
            },
            order: {
              include: {
                buyer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true
                  }
                },
                shipments: true,
              },
            },
          },
        });

        await emitOrderStatusChanged(
          [
            updatedSellerOrder.seller?.id,
            updatedSellerOrder.order.buyer?.id,
          ],
          {
            sellerId: updatedSellerOrder.sellerId,
            sellerOrderId,
            buyerOrderId: updatedSellerOrder.buyerOrderId,
            status: updatedSellerOrder.status as SellerOrderStatus,
            total: updatedSellerOrder.total.toNumber(),
            updatedAt: updatedSellerOrder.updatedAt.toISOString(),
            previousStatus: sellerOrder.status as SellerOrderStatus,
          }
        );

        // Send email and WhatsApp notifications to buyer
        try {
          const buyer = updatedSellerOrder.order.buyer;
          if (buyer) {
            await sendOrderStatusNotifications({
              orderNumber: updatedSellerOrder.order.orderNumber || updatedSellerOrder.buyerOrderId,
              buyerName: buyer.name || "Customer",
              buyerEmail: buyer.email,
              buyerPhone: buyer.phoneNumber,
              items: updatedSellerOrder.items.map((item: any) => ({
                productName: item.variant?.product?.name || "Product",
                quantity: item.quantity,
                price: item.totalPrice.toNumber(),
              })),
              total: updatedSellerOrder.total.toNumber(),
              status: status,
              trackingNumber: status === "SHIPPED" ? (updatedSellerOrder.order.shipments?.[0]?.trackingNumber ?? undefined) : undefined,
              carrier: status === "SHIPPED" ? (updatedSellerOrder.order.shipments?.[0]?.carrier ?? undefined) : undefined,
            });
          }
        } catch (notificationError) {
          console.error("Failed to send order status notifications:", notificationError);
          // Don't fail the mutation if notifications fail
        }

        // Sync parent order status
        await syncParentOrderStatus(updatedSellerOrder.buyerOrderId, prisma);

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

    cancelSellerOrder: async (
      _: unknown,
      { sellerOrderId, reason }: { sellerOrderId: string; reason?: string },
      context: ResolverContext
    ) => {
      requireSeller(context);
      const prisma = context.prisma;

      const sellerOrder = await prisma.sellerOrder.findUnique({
        where: { id: sellerOrderId },
        include: { order: true },
      });

      if (!sellerOrder) {
        throw new ApolloError({
          errorMessage: "Seller order not found",
          extraInfo: { code: "NOT_FOUND" },
        });
      }

      if (sellerOrder.sellerId !== context.user?.id) {
        throw new ApolloError({
          errorMessage: "Unauthorized",
          extraInfo: { code: "FORBIDDEN" },
        });
      }

      // Check if order can be cancelled (e.g., not already shipped/delivered)
      const nonCancellableStatuses = ["SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"];
      if (nonCancellableStatuses.includes(sellerOrder.status)) {
        throw new ApolloError({
          errorMessage: `Cannot cancel order in ${sellerOrder.status} status`,
          extraInfo: { code: "INVALID_STATE" },
        });
      }

      const updatedSellerOrder = await prisma.sellerOrder.update({
        where: { id: sellerOrderId },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
        include: {
          items: {
            include: {
              variant: {
                include: { product: { select: { name: true } } }
              }
            }
          },
          order: {
            include: {
              buyer: true
            }
          }
        }
      });

      // Send notifications
      if (updatedSellerOrder.order.buyer) {
        sendOrderStatusNotifications({
          orderNumber: updatedSellerOrder.order.orderNumber || updatedSellerOrder.buyerOrderId,
          buyerName: updatedSellerOrder.order.buyer.name || "Customer",
          buyerEmail: updatedSellerOrder.order.buyer.email,
          buyerPhone: updatedSellerOrder.order.buyer.phoneNumber,
          items: updatedSellerOrder.items.map((item: any) => ({
            productName: item.variant?.product?.name || "Product",
            quantity: item.quantity,
            price: item.totalPrice.toNumber(),
          })),
          total: updatedSellerOrder.total.toNumber(),
          status: "CANCELLED",
        }).catch(err => console.error("Error sending cancellation notification:", err));
      }

      // Sync parent order status
      await syncParentOrderStatus(updatedSellerOrder.buyerOrderId, prisma);

      // Optional: Log cancellation reason or notify buyer

      return updatedSellerOrder;
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
        (so: any) => so.sellerId === context.user?.id
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

    bulkUpdateSellerOrderStatus: async (
      _: unknown,
      { sellerOrderIds, status }: { sellerOrderIds: string[]; status: string },
      context: ResolverContext
    ) => {
      requireSeller(context);
      const prisma = context.prisma;
      const sellerId = context.user?.id;

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

      const sellerOrders = await prisma.sellerOrder.findMany({
        where: {
          id: { in: sellerOrderIds },
          sellerId,
        },
        include: {
          seller: true,
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          order: {
            include: {
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true
                }
              },
              sellerOrders: true,
            },
          },
        },
      });

      if (sellerOrders.length !== sellerOrderIds.length) {
        throw new ApolloError({
          errorMessage: "One or more orders not found or unauthorized",
          extraInfo: { code: "NOT_FOUND" },
        });
      }

      const validTransitions: Record<SellerOrderStatus, string[]> = {
        PENDING: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED", "RETURNED"],
        DELIVERED: ["RETURNED"],
        CANCELLED: [],
        RETURNED: [],
      };

      for (const so of sellerOrders) {
        const currentStatus = so.status as SellerOrderStatus;
        if (!validTransitions[currentStatus]?.includes(status)) {
          throw new ApolloError({
            errorMessage: `Cannot transition order ${so.id} from ${so.status} to ${status}`,
            extraInfo: { code: "INVALID_STATE" },
          });
        }
      }

      try {
        await prisma.$transaction(async (tx: any) => {
          // Perform bulk update on seller orders
          await tx.sellerOrder.updateMany({
            where: { id: { in: sellerOrderIds } },
            data: {
              status: status as any,
              updatedAt: new Date(),
            },
          });

          // Sync status for all affected parent orders
          const uniqueBuyerOrderIds = [...new Set(sellerOrders.map((so: any) => so.buyerOrderId))];
          for (const buyerOrderId of (uniqueBuyerOrderIds as string[])) {
            await syncParentOrderStatus(buyerOrderId, tx);
          }
        }, {
          timeout: 15000 // Increase timeout to 15 seconds
        });

        // 2. Fetch updated orders outside transaction for return and notifications
        const results = await prisma.sellerOrder.findMany({
          where: { id: { in: sellerOrderIds } },
          include: {
            seller: { select: { id: true } },
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      select: { name: true }
                    }
                  }
                }
              }
            },
            order: {
              include: {
                buyer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true
                  }
                },
                sellerOrders: true,
              },
            },
          },
        });

        // Emit notifications outside transaction
        for (const updatedSO of results) {
          const previousOrder = sellerOrders.find((o: any) => o.id === updatedSO.id);
          const typedSO = updatedSO as any;
          await emitOrderStatusChanged(
            [
              typedSO.seller?.id,
              typedSO.order?.buyer?.id,
            ],
            {
              sellerId: typedSO.sellerId,
              sellerOrderId: typedSO.id,
              buyerOrderId: typedSO.buyerOrderId,
              status: typedSO.status as SellerOrderStatus,
              total: typedSO.total.toNumber(),
              updatedAt: typedSO.updatedAt.toISOString(),
              previousStatus: previousOrder?.status as SellerOrderStatus,
            }
          );

          // Send email and WhatsApp notifications to buyer
          try {
            const buyer = typedSO.order?.buyer;
            if (buyer) {
              console.log(`📧 Sending notification for order ${typedSO.id} to buyer:`, {
                email: buyer.email,
                name: buyer.name,
                phone: buyer.phoneNumber,
                hasItems: !!typedSO.items?.length
              });

              await sendOrderStatusNotifications({
                orderNumber: typedSO.order.orderNumber || typedSO.buyerOrderId,
                buyerName: buyer.name || "Customer",
                buyerEmail: buyer.email,
                buyerPhone: buyer.phoneNumber,
                items: typedSO.items?.map((item: any) => ({
                  productName: item.variant?.product?.name || "Product",
                  quantity: item.quantity,
                  price: item.totalPrice.toNumber(),
                })) || [],
                total: typedSO.total.toNumber(),
                status: status,
              });
            } else {
              console.warn(`⚠️ No buyer data found for order ${typedSO.id}`);
            }
          } catch (notificationError) {
            console.error(`Failed to send notifications for order ${typedSO.id}:`, notificationError);
            // Don't fail the bulk operation if notifications fail
          }
        }

        return results.map((o: any) => ({
          ...o,
          subtotal: o.subtotal.toNumber(),
          tax: o.tax.toNumber(),
          shippingFee: o.shippingFee.toNumber(),
          commission: o.commission.toNumber(),
          total: o.total.toNumber(),
        }));
      } catch (error) {
        console.error("Error in bulkUpdateSellerOrderStatus:", error);
        throw new ApolloError({
          errorMessage: "Failed to perform bulk status update",
          extraInfo: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    bulkCreateShipments: async (
      _: unknown,
      { orderIds, trackingNumber, carrier }: { orderIds: string[]; trackingNumber: string; carrier: string },
      context: ResolverContext
    ) => {
      requireSeller(context);
      const prisma = context.prisma;
      const sellerId = context.user?.id;

      // 1. Verify ownership and state
      const sellerOrders = await prisma.sellerOrder.findMany({
        where: {
          id: { in: orderIds },
          sellerId,
        },
        include: {
          seller: true,
          order: {
            include: {
              buyer: { select: { id: true } },
            },
          },
        },
      });

      if (sellerOrders.length !== orderIds.length) {
        throw new ApolloError({
          errorMessage: "One or more orders not found or unauthorized",
          extraInfo: { code: "NOT_FOUND" },
        });
      }

      // Verify status (should be confirmed or processing to be shippable)
      for (const so of sellerOrders) {
        if (so.status !== "CONFIRMED" && so.status !== "PROCESSING") {
          throw new ApolloError({
            errorMessage: `Order ${so.id} cannot be shipped from its current state: ${so.status}`,
            extraInfo: { code: "INVALID_STATE" },
          });
        }
      }

      try {
        await prisma.$transaction(async (tx: any) => {
          const uniqueBuyerOrderIds = [...new Set(sellerOrders.map((so: any) => so.buyerOrderId))];

          // 2. Create Shipment records for unique parent Orders
          for (const buyerOrderId of (uniqueBuyerOrderIds as string[])) {
            await tx.shipment.create({
              data: {
                orderId: buyerOrderId,
                trackingNumber,
                carrier,
                status: "SHIPPED",
              },
            });
          }

          // 3. Update parent Order statuses in bulk
          await tx.order.updateMany({
            where: { id: { in: (uniqueBuyerOrderIds as string[]) } },
            data: {
              status: "SHIPPED",
              updatedAt: new Date(),
            },
          });

          // 4. Update all SellerOrders to SHIPPED
          await tx.sellerOrder.updateMany({
            where: { id: { in: orderIds } },
            data: {
              status: "SHIPPED",
              updatedAt: new Date(),
            },
          });
        }, {
          timeout: 15000
        });

        // 4. Fetch final updated orders for return outside transaction
        const results = await prisma.sellerOrder.findMany({
          where: { id: { in: orderIds } },
          include: {
            seller: true,
            order: {
              include: {
                buyer: { select: { id: true } },
                shipments: true,
              },
            },
          },
        });

        // 5. Emit notifications
        for (const updatedSO of results) {
          const previousOrder = sellerOrders.find((o: any) => o.id === updatedSO.id);
          const typedSO = updatedSO as any;
          await emitOrderStatusChanged(
            [
              typedSO.seller?.id,
              typedSO.order?.buyer?.id,
            ],
            {
              sellerId: typedSO.sellerId,
              sellerOrderId: typedSO.id,
              buyerOrderId: typedSO.buyerOrderId,
              status: "SHIPPED",
              total: typedSO.total.toNumber(),
              updatedAt: typedSO.updatedAt.toISOString(),
              previousStatus: previousOrder?.status as SellerOrderStatus,
            }
          );
        }

        return results.map((o: any) => ({
          ...o,
          subtotal: o.subtotal.toNumber(),
          tax: o.tax.toNumber(),
          shippingFee: o.shippingFee.toNumber(),
          commission: o.commission.toNumber(),
          total: o.total.toNumber(),
        }));
      } catch (error) {
        console.error("Error in bulkCreateShipments:", error);
        throw new ApolloError({
          errorMessage: "Failed to perform bulk shipment creation",
          extraInfo: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    updateDisputeStatus: async (
      _: any,
      { disputeId, status }: { disputeId: string; status: any },
      ctx: ResolverContext
    ) => {
      const user = requireSeller(ctx);

      // Check if it's an OrderDispute
      const dispute = await ctx.prisma.orderDispute.findUnique({
        where: { id: disputeId },
        include: { order: { include: { sellerOrders: true } } },
      });

      if (dispute) {
        // Ensure the seller owns one of the sellerOrders in this order
        const isMyOrder = dispute.order.sellerOrders.some(
          (so: any) => so.sellerId === user.id
        );
        if (!isMyOrder) throw new Error("Unauthorized");

        const updatedDispute = await ctx.prisma.orderDispute.update({
          where: { id: disputeId },
          data: { status },
          include: {
            order: {
              include: {
                buyer: true,
                sellerOrders: {
                  where: { sellerId: user.id },
                  include: {
                    items: {
                      include: {
                        variant: {
                          include: { product: true }
                        }
                      }
                    }
                  }
                }
              }
            },
            user: true
          }
        });

        // If approved, update order status
        if (status === "APPROVED") {
          if (updatedDispute.type === "CANCEL") {
            await ctx.prisma.order.update({
              where: { id: updatedDispute.orderId },
              data: { status: "CANCELLED" },
            });
            // Also update seller orders
            await ctx.prisma.sellerOrder.updateMany({
              where: { buyerOrderId: updatedDispute.orderId, sellerId: user.id },
              data: { status: "CANCELLED" },
            });

            // Send Cancellation Notification
            if (updatedDispute.order.buyer) {
              const sellerOrder = updatedDispute.order.sellerOrders[0];
              if (sellerOrder) {
                sendOrderStatusNotifications({
                  orderNumber: updatedDispute.order.orderNumber || updatedDispute.orderId,
                  buyerName: updatedDispute.order.buyer.name || "Customer",
                  buyerEmail: updatedDispute.order.buyer.email,
                  buyerPhone: updatedDispute.order.buyer.phoneNumber,
                  items: sellerOrder.items.map((item: any) => ({
                    productName: item.variant?.product?.name || "Product",
                    quantity: item.quantity,
                    price: item.totalPrice.toNumber(),
                  })),
                  total: sellerOrder.total.toNumber(),
                  status: "CANCELLED",
                }).catch(err => console.error("Error sending dispute cancellation notification:", err));
              }
            }
          } else if (updatedDispute.type === "RETURN") {
            await ctx.prisma.order.update({
              where: { id: updatedDispute.orderId },
              data: { status: "RETURNED" },
            });
            await ctx.prisma.sellerOrder.updateMany({
              where: { buyerOrderId: updatedDispute.orderId, sellerId: user.id },
              data: { status: "RETURNED" },
            });

            // For returning via dispute, we don't have a direct "ReturnRequest" record always, 
            // but we can send a general notification or reuse return notification if possible.
            // Since ReturnDetails expects returnNumber, we'll use disputeId.
            if (updatedDispute.order.buyer) {
              const sellerOrder = updatedDispute.order.sellerOrders[0];
              if (sellerOrder) {
                sendReturnNotifications({
                  returnNumber: updatedDispute.id,
                  orderNumber: updatedDispute.order.orderNumber || updatedDispute.orderId,
                  buyerName: updatedDispute.order.buyer.name || "Customer",
                  buyerEmail: updatedDispute.order.buyer.email,
                  buyerPhone: updatedDispute.order.buyer.phoneNumber,
                  status: "APPROVED",
                  reason: updatedDispute.reason,
                  items: sellerOrder.items.map((item: any) => ({
                    productName: item.variant?.product?.name || "Product",
                    quantity: item.quantity
                  }))
                }).catch(err => console.error("Error sending dispute return notification:", err));
              }
            }
          }
        } else if (status === "REJECTED") {
          // Send Rejection Notification
          if (updatedDispute.order?.buyer) {
            const sellerOrder = updatedDispute.order.sellerOrders[0];
            const isReturn = updatedDispute.type === "RETURN";
            if (isReturn) {
              sendReturnNotifications({
                returnNumber: updatedDispute.id,
                orderNumber: updatedDispute.order.orderNumber || updatedDispute.orderId,
                buyerName: updatedDispute.order.buyer.name || "Customer",
                buyerEmail: updatedDispute.order.buyer.email,
                buyerPhone: updatedDispute.order.buyer.phoneNumber,
                status: "REJECTED",
                reason: updatedDispute.reason,
                items: sellerOrder ? sellerOrder.items.map((item: any) => ({
                  productName: item.variant?.product?.name || "Product",
                  quantity: item.quantity
                })) : []
              }).catch(err => console.error("Error sending dispute rejection notification:", err));
            } else {
              // Notification for rejected cancellation
              // We don't have a specific "Rejected Cancellation" template yet, 
              // but we can add one or use a general order update.
            }
          }
        }
        return updatedDispute;
      }

      // If not a dispute, check if it's a Return
      const returnReq = await ctx.prisma.return.findUnique({
        where: { id: disputeId },
        include: {
          items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } },
          order: { include: { buyer: true } },
          user: true
        }
      });

      if (returnReq) {
        // Access Control
        const isSeller = returnReq.items.some(i => i.orderItem.variant.product.sellerId === user.id);
        if (!isSeller) throw new Error("Unauthorized");

        const updatedReturn = await ctx.prisma.return.update({
          where: { id: disputeId },
          data: { status: status === "APPROVED" ? "APPROVED" : "REJECTED" },
          include: {
            order: { include: { buyer: true } },
            user: true,
            items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } }
          }
        });

        // Send Notification for Return Request
        if (updatedReturn.user && updatedReturn.order) {
          sendReturnNotifications({
            returnNumber: updatedReturn.id,
            orderNumber: updatedReturn.order.orderNumber || updatedReturn.orderId,
            buyerName: updatedReturn.user.name || "Customer",
            buyerEmail: updatedReturn.user.email,
            buyerPhone: updatedReturn.user.phoneNumber,
            status: updatedReturn.status,
            reason: updatedReturn.reason,
            items: updatedReturn.items.map(item => ({
              productName: item.orderItem.variant.product.name,
              quantity: item.quantity
            }))
          }).catch(err => console.error("Error sending return notification:", err));
        }

        // Map back to Dispute format for frontend
        return {
          ...updatedReturn,
          type: "RETURN",
          status: status // Use the status sent by frontend
        };
      }

      throw new Error("Dispute or Return not found");
    },
  },
};
