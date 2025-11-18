// hooks/order/useOrder.ts

import {
  CONFIRM_ORDER,
  CREATE_SHIPMENT,
  UPDATE_SELLER_ORDER_STATUS,
} from "@/client/order/order.mutation";
import { GET_SELLER_ORDER } from "@/client/order/order.query";
import {
  SellerOrder,
  GetSellerOrdersResponse,
  OrderStatus,
  ShipmentStatus,
  Shipment,
} from "@/types/pages/order.types";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";

interface ShipmentInput {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
}

interface ConfirmOrderInput {
  sellerOrderId: string;
}

interface UpdateOrderStatusInput {
  sellerOrderId: string;
  status: OrderStatus;
}

interface CreateShipmentResponse {
  createShipment: Shipment;
}

interface UpdateSellerOrderStatusResponse {
  updateSellerOrderStatus: SellerOrder;
}

interface ConfirmOrderResponse {
  confirmOrder: boolean;
}

export const useOrder = () => {
  const [updateSellerOrderStatus] = useMutation<
    UpdateSellerOrderStatusResponse,
    UpdateOrderStatusInput
  >(UPDATE_SELLER_ORDER_STATUS, {
    refetchQueries: [{ query: GET_SELLER_ORDER }],
    awaitRefetchQueries: true,
  });

  const [createShipment] = useMutation<CreateShipmentResponse, ShipmentInput>(
    CREATE_SHIPMENT
  );

  const [confirmOrder] = useMutation<ConfirmOrderResponse, { input: ConfirmOrderInput }>(
    CONFIRM_ORDER,
    {
      refetchQueries: [{ query: GET_SELLER_ORDER }],
      awaitRefetchQueries: true,
    }
  );

  // Confirm a single SellerOrder
  const confirmSingleOrder = async (sellerOrderId: string) => {
    try {
      const { data } = await confirmOrder({
        variables: { input: { sellerOrderId } },
        optimisticResponse: {
          confirmOrder: true,
        },
        update: (cache) => {
          try {
            // Read the existing cache
            const existing = cache.readQuery<GetSellerOrdersResponse>({
              query: GET_SELLER_ORDER,
            });

            if (existing?.getSellerOrders?.sellerOrders) {
              // Write back to cache with updated status
              cache.writeQuery<GetSellerOrdersResponse>({
                query: GET_SELLER_ORDER,
                data: {
                  getSellerOrders: {
                    ...existing.getSellerOrders,
                    sellerOrders: existing.getSellerOrders.sellerOrders.map(
                      (order) =>
                        order.id === sellerOrderId
                          ? { ...order, status: "CONFIRMED" as const, updatedAt: new Date().toISOString() }
                          : order
                    ),
                  },
                },
              });
            }
          } catch (error) {
            console.error("Cache update error:", error);
          }
        },
      });

      toast.success(`Order confirmed successfully`);
      return data?.confirmOrder;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to confirm order";
      toast.error(message);
      console.error(error);
      throw error;
    }
  };

  // Update status for a single SellerOrder
  const updateOrderStatus = async (sellerOrderId: string, status: OrderStatus) => {
    try {
      const { data } = await updateSellerOrderStatus({
        variables: { sellerOrderId, status },
        optimisticResponse: {
          updateSellerOrderStatus: {
            id: sellerOrderId,
            status,
            __typename: "SellerOrder",
          } as unknown as SellerOrder,
        },
        update: (cache) => {
          try {
            const existing = cache.readQuery<GetSellerOrdersResponse>({
              query: GET_SELLER_ORDER,
            });

            if (existing?.getSellerOrders?.sellerOrders) {
              cache.writeQuery<GetSellerOrdersResponse>({
                query: GET_SELLER_ORDER,
                data: {
                  getSellerOrders: {
                    ...existing.getSellerOrders,
                    sellerOrders: existing.getSellerOrders.sellerOrders.map(
                      (order) =>
                        order.id === sellerOrderId
                          ? { ...order, status }
                          : order
                    ),
                  },
                },
              });
            }
          } catch (error) {
            console.error("Cache update error:", error);
          }
        },
      });

      toast.success(`Order updated to ${status}`);
      return data?.updateSellerOrderStatus;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update order status";
      toast.error(message);
      console.error(error);
      throw error;
    }
  };

  // Create a shipment for a single SellerOrder

  const createSingleShipment = async (input: ShipmentInput) => {
    const { orderId, trackingNumber, carrier, status } = input;
    if (!orderId) {
      const error = new Error("Order ID is required");
      toast.error(error.message);
      throw error;
    }

    try {
      const { data } = await createShipment({
        variables: { orderId, trackingNumber, carrier, status },
        update: (cache, { data }) => {
          const newShipment = data?.createShipment;
          if (newShipment) {
            cache.modify({
              fields: {
                getSellerOrders(
                  existing: any = { sellerOrders: [] }
                ) {
                  if (!existing || !existing.sellerOrders) {
                    return { sellerOrders: [] };
                  }
                  return {
                    ...existing,
                    sellerOrders: existing.sellerOrders.map((o: SellerOrder) =>
                      o.buyerOrderId === orderId
                        ? {
                            ...o,
                            order: {
                              ...o.order,
                              shipments: [...(o.order.shipments || []), newShipment],
                            },
                          }
                        : o
                    ),
                  };
                },
              },
            });
          }
        },
      });
      toast.success("Shipment created");
      return data?.createShipment;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create shipment";
      toast.error(message);
      console.error(error);
      throw error;
    }
  };

  // Bulk update order statuses
  const bulkUpdateOrders = async (orderIds: string[], status: OrderStatus) => {
    if (orderIds.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    try {
      await Promise.all(
        orderIds.map((orderId) =>
          updateSellerOrderStatus({
            variables: { sellerOrderId: orderId, status },
            optimisticResponse: {
              updateSellerOrderStatus: {
                id: orderId,
                status,
              } as unknown as SellerOrder,
            },
            update: (cache) => {
              cache.modify({
                fields: {
                  getSellerOrders(
                    existing: any = { sellerOrders: [] }
                  ) {
                    if (!existing || !existing.sellerOrders) {
                      return { sellerOrders: [] };
                    }
                    return {
                      ...existing,
                      sellerOrders: existing.sellerOrders.map((order: SellerOrder) =>
                        order.id === orderId ? { ...order, status } : order
                      ),
                    };
                  },
                },
              });
            },
          })
        )
      );
      toast.success(`${orderIds.length} orders updated to ${status}`);
    } catch (error) {
      toast.error("Failed to perform bulk update");
      console.error(error);
      throw error;
    }
  };

  // Bulk create shipments and update order statuses
  const bulkCreateShipments = async (
    orders: SellerOrder[],
    orderIds: string[],
    trackingNumber: string,
    carrier: string,
    status: OrderStatus
  ) => {
    if (orderIds.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    try {
      await Promise.all(
        orderIds.map((orderId) => {
          const order = orders.find((o) => o.id === orderId);
          if (!order) throw new Error(`Order ${orderId} not found`);

          return Promise.all([
            createShipment({
              variables: {
                orderId: order.buyerOrderId,
                trackingNumber,
                carrier,
                status: "SHIPPED" as const, // createShipment expects ShipmentStatus
              },
              update: (cache, { data }) => {
                const newShipment = data?.createShipment;
                if (newShipment) {
                  cache.modify({
                    fields: {
                      getSellerOrders(
                        existing: any = { sellerOrders: [] }
                      ) {
                        if (!existing || !existing.sellerOrders) {
                          return { sellerOrders: [] };
                        }
                        return {
                          ...existing,
                          sellerOrders: existing.sellerOrders.map((o: SellerOrder) =>
                            o.id === orderId
                              ? {
                                  ...o,
                                  order: {
                                    ...o.order,
                                    shipments: [...(o.order.shipments || []), newShipment],
                                  },
                                }
                              : o
                          ),
                        };
                      },
                    },
                  });
                }
              },
            }),
            updateSellerOrderStatus({
              variables: { sellerOrderId: orderId, status },
              optimisticResponse: {
                updateSellerOrderStatus: {
                  id: orderId,
                  status,
                } as unknown as SellerOrder,
              },
              update: (cache) => {
                cache.modify({
                  fields: {
                    getSellerOrders(
                      existing: any = { sellerOrders: [] }
                    ) {
                      if (!existing || !existing.sellerOrders) {
                        return { sellerOrders: [] };
                      }
                      return {
                        ...existing,
                        sellerOrders: existing.sellerOrders.map((order: SellerOrder) =>
                          order.id === orderId ? { ...order, status } : order
                        ),
                      };
                    },
                  },
                });
              },
            }),
          ]);
        })
      );
      toast.success(`${orderIds.length} orders marked as ${status}`);
    } catch (error) {
      toast.error("Failed to perform bulk shipment creation");
      console.error(error);
      throw error;
    }
  };

  return {
    confirmSingleOrder,
    updateOrderStatus,
    createSingleShipment,
    bulkUpdateOrders,
    bulkCreateShipments,
  };
};
