"use client";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { SellerOrder } from "@/types/pages/order.types";
// import { UPDATE_ORDER_STATUS } from "@/lib/graphql/queries/orders";

interface BulkActionsProps {
  orders: SellerOrder[];
  selectedOrders: string[];
  setSelectedOrders: React.Dispatch<React.SetStateAction<string[]>>;
}

export function BulkActions({ orders, selectedOrders, setSelectedOrders }: BulkActionsProps) {
  // const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

  // const handleBulkAction = async (action: string) => {
  //   if (selectedOrders.length === 0) {
  //     toast.error("Please select orders first");
  //     return;
  //   }

  //   switch (action) {
  //     case "mark_processing":
  //       await Promise.all(
  //         selectedOrders.map((orderId) =>
  //           updateOrderStatus({
  //             variables: { orderId, status: "PROCESSING" },
  //             optimisticResponse: {
  //               updateOrderStatus: {
  //                 id: orderId,
  //                 status: "PROCESSING",
  //                 __typename: "SellerOrder",
  //               },
  //             },
  //             update: (cache) => {
  //               cache.modify({
  //                 fields: {
  //                   getSellerOrders(existing = { sellerOrders: [] }) {
  //                     return {
  //                       ...existing,
  //                       sellerOrders: existing.sellerOrders.map((order: SellerOrder) =>
  //                         order.id === orderId ? { ...order, status: "PROCESSING" } : order
  //                       ),
  //                     };
  //                   },
  //                 },
  //               });
  //             },
  //           })
  //         )
  //       );
  //       toast.success(`${selectedOrders.length} orders marked as processing`);
  //       break;
  //     case "mark_shipped":
  //       await Promise.all(
  //         selectedOrders.map((orderId) =>
  //           updateOrderStatus({
  //             variables: { orderId, status: "SHIPPED" },
  //             optimisticResponse: {
  //               updateOrderStatus: {
  //                 id: orderId,
  //                 status: "SHIPPED",
  //                 __typename: "SellerOrder",
  //               },
  //             },
  //             update: (cache) => {
  //               cache.modify({
  //                 fields: {
  //                   getSellerOrders(existing = { sellerOrders: [] }) {
  //                     return {
  //                       ...existing,
  //                       sellerOrders: existing.sellerOrders.map((order: SellerOrder) =>
  //                         order.id === orderId ? { ...order, status: "SHIPPED" } : order
  //                       ),
  //                     };
  //                   },
  //                 },
  //               });
  //             },
  //           })
  //         )
  //       );
  //       toast.success(`${selectedOrders.length} orders marked as shipped`);
  //       break;
  //     case "print_labels":
  //       toast.success(`Printing labels for ${selectedOrders.length} orders`);
  //       break;
  //     case "export":
  //       toast.success(`Exporting ${selectedOrders.length} orders`);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const clearSelectedOrders = () => {
    setSelectedOrders([]);
  };

  if (selectedOrders.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {selectedOrders.length} order(s) selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              // onClick={() => handleBulkAction("mark_processing")}
              className="text-xs"
            >
              Mark Processing
            </Button>
            <Button
              size="sm"
              // onClick={() => handleBulkAction("mark_shipped")}
              className="text-xs"
            >
              Mark Shipped
            </Button>
            <Button
              size="sm"
              variant="outline"
              // onClick={() => handleBulkAction("print_labels")}
              className="text-xs"
            >
              <Printer className="mr-1 h-3 w-3" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              // onClick={() => handleBulkAction("export")}
              className="text-xs"
            >
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              // onClick={clearSelectedOrders}
              className="text-xs bg-transparent"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}