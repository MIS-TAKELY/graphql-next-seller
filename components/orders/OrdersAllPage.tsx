"use client";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { BulkActions } from "./BulkActions";
import { OrderSearchFilter } from "./OrderSearchFilter";
import { OrderStatusTab } from "./OrderStatusTab";
import { OrderTabs } from "./OrderTabs";
import { useState } from "react";
import { OrderFilters, SellerOrder } from "@/types/pages/order.types";

interface OrdersAllPageProps {
  orders: SellerOrder[];
}

export function OrdersAllPage({ orders }: OrdersAllPageProps) {
  const [orderFilters, setOrderFilters] = useState<OrderFilters>({
    search: "",
    status: "all",
    priority: "all",
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const handleFiltersChange = (partialFilters: Partial<OrderFilters>) => {
    setOrderFilters((prevFilters) => ({
      ...prevFilters,
      ...partialFilters,
    }));
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = `${order.order.buyer.firstName} ${order.order.buyer.lastName}`;
    const matchesSearch =
      customerName.toLowerCase().includes(orderFilters.search.toLowerCase()) ||
      order.order.orderNumber.toLowerCase().includes(orderFilters.search.toLowerCase());
    const matchesStatus =
      orderFilters.status === "all" || order.status === orderFilters.status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Orders
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
      <OrderSearchFilter
        filters={orderFilters}
        onFiltersChange={handleFiltersChange}
      />
      <BulkActions
        orders={orders}
        selectedOrders={selectedOrders}
        setSelectedOrders={setSelectedOrders}
      />
      <OrderTabs
        activeTab="all"
        orders={orders}
        filters={orderFilters}
      />
      <OrderStatusTab
        status="all"
        orders={filteredOrders}
        tabValue="all"
        filters={orderFilters}
      />
    </div>
  );
}