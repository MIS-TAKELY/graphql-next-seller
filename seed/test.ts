// const createSingleShipment = async ({ orderId, trackingNumber, carrier, status }: ShipmentInput) => {
//     if (!orderId) {
//       const error = new Error('Order ID is required');
//       toast.error(error.message);
//       throw error;
//     }

//     try {
//       const { data } = await createShipment({
//         variables: { orderId, trackingNumber, carrier, status },
//         update: (cache, { data }) => {
//           const newShipment = data?.createShipment;
//           if (newShipment) {
//             cache.modify({
//               fields: {
//                 getSellerOrders(existing = { sellerOrders: [] }) {
//                   return {
//                     ...existing,
//                     sellerOrders: existing.sellerOrders.map((o: SellerOrder) =>
//                       o.buyerOrderId === orderId
//                         ? {
//                             ...o,
//                             order: {
//                               ...o.order,
//                               shipments: [...(o.order.shipments || []), newShipment],
//                             },
//                           }
//                         : o
//                     ),
//                   };
//                 },
//               },
//             });
//           }
//         },
//       });
//       return data.createShipment;
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to create shipment');
//       console.error('Create shipment error:', error);
//       throw error;
//     }
//   };

//   const updateOrderStatus = async (sellerOrderId: string, status: string) => {
//     try {
//       const { data } = await updateSellerOrderStatus({
//         variables: { sellerOrderId, status },
//         update: (cache, { data }) => {
//           const updatedOrder = data?.updateSellerOrderStatus;
//           if (updatedOrder) {
//             cache.modify({
//               fields: {
//                 getSellerOrders(existing = { sellerOrders: [] }) {
//                   return {
//                     ...existing,
//                     sellerOrders: existing.sellerOrders.map((o: SellerOrder) =>
//                       o.id === sellerOrderId
//                         ? { ...o, status: updatedOrder.status }
//                         : o
//                     ),
//                   };
//                 },
//               },
//             });
//           }
//         },
//       });
//       toast.success(`Order status updated to ${status}`);
//       return data.updateSellerOrderStatus;
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to update order status');
//       console.error('Update order status error:', error);
//       throw error;
//     }
//   };

//   const confirmSingleOrder = async (sellerOrderId: string) => {
//     try {
//       const { data } = await confirmOrder({
//         variables: { input: { sellerOrderId } },
//         update: (cache, { data }) => {
//           if (data?.confirmOrder) {
//             cache.modify({
//               fields: {
//                 getSellerOrders(existing = { sellerOrders: [] }) {
//                   return {
//                     ...existing,
//                     sellerOrders: existing.sellerOrders.map((order: SellerOrder) =>
//                       order.id === sellerOrderId
//                         ? { ...order, status: 'CONFIRMED', order: data.confirmOrder.order }
//                         : order
//                     ),
//                   };
//                 },
//               },
//             });
//           }
//         },
//       });
//       toast.success(`Order ${data?.confirmOrder.order.orderNumber} confirmed`);
//       return data.confirmOrder;
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to confirm order');
//       console.error('Confirm order error:', error);
//       throw error;
//     }
//   };