// hooks/order/useOrder.ts

import {
  CONFIRM_ORDER,
  CREATE_SHIPMENT,
  UPDATE_SELLER_ORDER_STATUS,
  BULK_UPDATE_SELLER_ORDER_STATUS,
  BULK_CREATE_SHIPMENTS,
  CANCEL_SELLER_ORDER,
} from "@/client/order/order.mutation";
import { GET_SELLER_ORDER } from "@/client/order/order.query";
import {
  SellerOrder,
  GetSellerOrdersResponse,
  OrderStatus,
  ShipmentStatus,
  Shipment,
} from "@/types/pages/order.types";
import { OrderStatus as OrderStatusEnum, ShipmentStatus as ShipmentStatusEnum } from "@/types/common/enums";
import { useMutation, useQuery } from "@apollo/client";
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
  confirmOrder: SellerOrder;
}

interface BulkUpdateSellerOrderStatusResponse {
  bulkUpdateSellerOrderStatus: SellerOrder[];
}

interface BulkUpdateOrderStatusInput {
  sellerOrderIds: string[];
  status: OrderStatus;
}

interface BulkCreateShipmentsResponse {
  bulkCreateShipments: SellerOrder[];
}

interface BulkCreateShipmentsInput {
  orderIds: string[];
  trackingNumber: string;
  carrier: string;
}

export const useOrder = () => {
  const [confirmOrder] = useMutation<ConfirmOrderResponse, { input: ConfirmOrderInput }>(
    CONFIRM_ORDER,
    {
      refetchQueries: ["GetSellerOrders"],
      awaitRefetchQueries: true,
    }
  );

  const [updateSellerOrderStatus] = useMutation<
    UpdateSellerOrderStatusResponse,
    UpdateOrderStatusInput
  >(UPDATE_SELLER_ORDER_STATUS, {
    refetchQueries: ["GetSellerOrders"],
    awaitRefetchQueries: true,
  });

  const [bulkUpdateSellerOrderStatus] = useMutation<
    BulkUpdateSellerOrderStatusResponse,
    BulkUpdateOrderStatusInput
  >(BULK_UPDATE_SELLER_ORDER_STATUS, {
    refetchQueries: ["GetSellerOrders"],
    awaitRefetchQueries: true,
  });

  const [bulkCreateShipmentsMutation] = useMutation<
    BulkCreateShipmentsResponse,
    BulkCreateShipmentsInput
  >(BULK_CREATE_SHIPMENTS, {
    refetchQueries: ["GetSellerOrders"],
    awaitRefetchQueries: true,
  });

  const [cancelSellerOrderMutation] = useMutation(CANCEL_SELLER_ORDER, {
    refetchQueries: ["GetSellerOrders"],
    awaitRefetchQueries: true,
  });

  const { data, loading, error, refetch } = useQuery<GetSellerOrdersResponse>(
    GET_SELLER_ORDER,
    {
      notifyOnNetworkStatusChange: true,
    }
  );

  const sellerOrders = data?.getSellerOrders?.sellerOrders || [];

  const [createShipment] = useMutation<CreateShipmentResponse, ShipmentInput>(
    CREATE_SHIPMENT
  );

  // Confirm a single SellerOrder
  const confirmSingleOrder = async (orderId: string) => {
    try {
      const { data } = await confirmOrder({
        variables: { input: { sellerOrderId: orderId } },
        optimisticResponse: {
          confirmOrder: {
            id: orderId,
            status: OrderStatus.CONFIRMED,
            __typename: "SellerOrder",
          } as any,
        },
        update: (cache) => {
          cache.modify({
            id: cache.identify({ __typename: 'SellerOrder', id: orderId }),
            fields: {
              status() {
                return OrderStatusEnum.CONFIRMED;
              },
              updatedAt() {
                return new Date().toISOString();
              }
            },
          });
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
      const { data } = await bulkUpdateSellerOrderStatus({
        variables: { sellerOrderIds: orderIds, status },
        optimisticResponse: {
          bulkUpdateSellerOrderStatus: orderIds.map((id) => ({
            id,
            status,
            __typename: "SellerOrder",
            // Add other required fields for SellerOrder if any, or cast to any if confident
          })) as any,
        },
        update: (cache) => {
          orderIds.forEach((id) => {
            cache.modify({
              id: cache.identify({ __typename: "SellerOrder", id }),
              fields: {
                status() {
                  return status;
                },
              },
            });
          });
        },
      });

      toast.success(`${orderIds.length} orders updated to ${status}`);
      return data?.bulkUpdateSellerOrderStatus;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to perform bulk update";
      toast.error(message);
      console.error(error);
      throw error;
    }
  };

  // Bulk create shipments and update order statuses
  const bulkCreateShipments = async (
    orderIds: string[],
    trackingNumber: string,
    carrier: string
  ) => {
    if (orderIds.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    try {
      const { data } = await bulkCreateShipmentsMutation({
        variables: { orderIds, trackingNumber, carrier },
        optimisticResponse: {
          bulkCreateShipments: orderIds.map((id) => ({
            id,
            status: OrderStatusEnum.SHIPPED,
            __typename: "SellerOrder",
            // Note: full optimistic response for nested structure is complex, 
            // relying on cache.modify or refetch for consistency
          })) as any,
        },
        update: (cache) => {
          orderIds.forEach((id) => {
            cache.modify({
              id: cache.identify({ __typename: "SellerOrder", id }),
              fields: {
                status() {
                  return OrderStatusEnum.SHIPPED;
                },
                updatedAt() {
                  return new Date().toISOString();
                }
              },
            });
          });
        },
      });

      toast.success(`${orderIds.length} orders marked as shipped`);
      return data?.bulkCreateShipments;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to perform bulk shipment";
      toast.error(message);
      console.error(error);
      throw error;
    }
  };

  return {
    sellerOrders,
    loading,
    error,
    refetch,
    confirmSingleOrder,
    updateOrderStatus,
    createSingleShipment,
    bulkUpdateOrders,
    bulkCreateShipments,
    cancelOrder: async (sellerOrderId: string, reason?: string) => {
      try {
        const { data } = await cancelSellerOrderMutation({
          variables: { sellerOrderId, reason },
        });
        toast.success("Order cancelled successfully");
        return data?.cancelSellerOrder;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to cancel order";
        toast.error(message);
        throw error;
      }
    },
  };
};
