"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { OrderTable } from "./OrderTable";
import { getStatusIcon } from "@/lib/orders/utils";
import { SellerOrder, OrderFilters } from "@/types/pages/order.types";

interface OrderStatusTabProps {
  status: string;
  orders: SellerOrder[];
  tabValue: string;
  filters: OrderFilters;
}

export function OrderStatusTab({
  status,
  orders,
  tabValue,
  filters,
}: OrderStatusTabProps) {
  const getTitle = () => {
    switch (tabValue) {
      case "new":
        return "New Orders";
      case "returns":
        return "Returns & Refunds";
      default:
        return `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Orders`;
    }
  };

  const getDescription = () => {
    switch (tabValue) {
      case "new":
        return "Orders that require immediate attention.";
      case "processing":
        return "Orders currently being prepared for shipment.";
      case "shipped":
        return "Orders that have been shipped and are in transit.";
      case "delivered":
        return "Orders that have been successfully delivered.";
      case "returns":
        return "Manage return requests and refund processing.";
      default:
        return "";
    }
  };

  const customActions = (order: SellerOrder) => {
    switch (tabValue) {
      case "new":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success(`Processing order ${order.order.orderNumber}...`)}
            className="text-xs"
          >
            Start Processing
          </Button>
        );
      case "processing":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(`Marking order ${order.order.orderNumber} as shipped...`)
            }
            className="text-xs"
          >
            Mark as Shipped
          </Button>
        );
      case "shipped":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(`Marking order ${order.order.orderNumber} as delivered...`)
            }
            className="text-xs"
          >
            Mark as Delivered
          </Button>
        );
      case "delivered":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Feedback request sent!")}
            className="text-xs"
          >
            Request Feedback
          </Button>
        );
      case "returns":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Processing return...")}
            className="text-xs"
          >
            Process Return
          </Button>
        );
      default:
        return null;
    }
  };

  const { Icon, className } = getStatusIcon(status);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{getTitle()}</CardTitle>
        <CardDescription className="text-sm">
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <OrderTable
            orders={orders}
            showCheckbox={tabValue === "all"}
            showTracking={tabValue === "shipped"}
            customActions={customActions}
            filters={filters}
          />
        ) : (
          <div className="text-center py-6 sm:py-8">
            <Icon className={className} />
            <h3 className="mt-4 text-base sm:text-lg font-semibold">
              No {tabValue === "new" ? "new" : tabValue} orders
            </h3>
            <p className="text-sm text-muted-foreground">
              {tabValue === "new"
                ? "New orders will appear here when received."
                : tabValue === "returns"
                ? "Return requests will appear here."
                : `${
                    tabValue.charAt(0).toUpperCase() + tabValue.slice(1)
                  } orders will appear here.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}