"use client";
import { useState } from "react";
import { SellerOrder, OrderFilters } from "@/types/pages/order.types";
import { OrderSearchFilter } from "@/components/orders/OrderSearchFilter";
import { BulkActions } from "@/components/orders/BulkActions";
import { OrderTabs } from "@/components/orders/OrderTabs";
import { OrderStatusTab } from "@/components/orders/OrderStatusTab";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";

interface OrderStatusPageProps {
  orders: SellerOrder[];
  status: OrderFilters["status"];
  tabValue: "all" | "new" | "processing" | "shipped" | "delivered" | "returns";
}

export default function OrderStatusPage({ orders, status, tabValue }: OrderStatusPageProps) {
  const [orderFilters, setOrderFilters] = useState<OrderFilters>({
    search: "",
    status: status,
    priority: "all", // Add priority to match OrderFilters type
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const handleFiltersChange = (partialFilters: Partial<OrderFilters>) => {
    setOrderFilters((prev) => ({ ...prev, ...partialFilters }));
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = `${order.order.buyer.firstName} ${order.order.buyer.lastName}`;
    const matchesSearch =
      customerName.toLowerCase().includes(orderFilters.search.toLowerCase()) ||
      order.order.orderNumber.toLowerCase().includes(orderFilters.search.toLowerCase());
    const matchesStatus = status === "all" || order.status === status;
    // Remove priority filtering since SellerOrder lacks priority field
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          {tabValue === "new"
            ? "New Orders"
            : tabValue === "returns"
            ? "Returns & Refunds"
            : `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Orders`}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Exporting orders...")}
            className="text-xs sm:text-sm"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm bg-transparent"
          >
            <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Filter
          </Button>
        </div>
      </div>
      <OrderSearchFilter filters={orderFilters} onFiltersChange={handleFiltersChange} />
      <BulkActions
        orders={orders}
        selectedOrders={selectedOrders}
        setSelectedOrders={setSelectedOrders}
      />
      <OrderTabs
        activeTab={tabValue}
        orders={orders}
        filters={orderFilters}
      />
      <OrderStatusTab
        status={status}
        orders={filteredOrders}
        tabValue={tabValue}
        filters={orderFilters}
      />
    </div>
  );
}