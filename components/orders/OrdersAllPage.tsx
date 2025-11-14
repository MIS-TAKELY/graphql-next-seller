// components/orders/OrdersAllPage.tsx
"use client";

import { Button } from "@/components/ui/button";
import { OrderFilters, SellerOrder } from "@/types/pages/order.types";
import { Download, Filter } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { BulkActions } from "./BulkActions";
import { OrderSearchFilter } from "./OrderSearchFilter";
import { OrderStatusTab } from "./OrderStatusTab";
import { OrderTabs } from "./OrderTabs";

interface OrdersAllPageProps {
  orders: SellerOrder[];
  onRefetch?: () => void;
}

export function OrdersAllPage({ orders, onRefetch }: OrdersAllPageProps) {
  const [isPending, startTransition] = useTransition();
  const [orderFilters, setOrderFilters] = useState<OrderFilters>({
    search: "",
    status: "all",
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    | "all"
    | "new"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "returns"
  >("all");

  // Store the orders in state to manage updates
  const [currentOrders, setCurrentOrders] = useState<SellerOrder[]>(orders);

  // Update orders when prop changes
  useEffect(() => {
    setCurrentOrders(orders);
  }, [orders]);

  const handleFiltersChange = useCallback(
    (partialFilters: Partial<OrderFilters>) => {
      startTransition(() => {
        setOrderFilters((prevFilters) => ({
          ...prevFilters,
          ...partialFilters,
        }));
      });
    },
    []
  );

  // Handle order confirmation - auto-switch to confirmed tab
  const handleOrderConfirmed = useCallback((orderId: string) => {
    startTransition(() => {
      // Update the order status in local state immediately
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "CONFIRMED" } : order
        )
      );

      // Switch to confirmed tab
      setActiveTab("confirmed");

      // Clear selection if the confirmed order was selected
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));

      // Show success message
      toast.success("Order confirmed and moved to Confirmed tab");
    });
  }, []);

  // Handle processing started - auto-switch to processing tab
  const handleProcessingStarted = useCallback((orderId: string) => {
    startTransition(() => {
      // Update the order status in local state immediately
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "PROCESSING" } : order
        )
      );

      // Switch to processing tab
      setActiveTab("processing");

      // Clear selection if the order was selected
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));

      // Show success message
      toast.success("Order moved to Processing tab");
    });
  }, []);

  // Handle successful shipment creation - auto-switch to shipped tab
  const handleShipmentSuccess = useCallback((orderId: string) => {
    startTransition(() => {
      // Update the order status in local state immediately
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "SHIPPED" } : order
        )
      );

      // Switch to shipped tab
      setActiveTab("shipped");

      // Clear selection if the shipped order was selected
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));

      // Show success message
      toast.success("Shipment created and order moved to Shipped tab");
    });
  }, []);

  // Handle order delivered - auto-switch to delivered tab
  const handleOrderDelivered = useCallback((orderId: string) => {
    startTransition(() => {
      // Update the order status in local state immediately
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "DELIVERED" } : order
        )
      );

      // Switch to delivered tab
      setActiveTab("delivered");

      // Clear selection if the order was selected
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));

      // Show success message
      toast.success("Order marked as delivered");
    });
  }, []);

  const handleTabChange = useCallback(
    (
      tab:
        | "all"
        | "new"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "returns"
    ) => {
      startTransition(() => {
        setActiveTab(tab);
        // Clear selections when changing tabs
        setSelectedOrders([]);
      });
    },
    []
  );

  const statusMap: Record<
    string,
    { status: OrderFilters["status"]; tabValue: string }
  > = {
    all: { status: "all", tabValue: "all" },
    new: { status: "PENDING", tabValue: "new" },
    confirmed: { status: "CONFIRMED", tabValue: "confirmed" },
    processing: { status: "PROCESSING", tabValue: "processing" },
    shipped: { status: "SHIPPED", tabValue: "shipped" },
    delivered: { status: "DELIVERED", tabValue: "delivered" },
    returns: { status: "RETURNED", tabValue: "returns" },
  };

  const currentConfig = statusMap[activeTab] || statusMap.all;

  // Filter orders based on current tab and search
  const filteredOrders = currentOrders.filter((order) => {
    const customerName = `${order.order.buyer.firstName} ${order.order.buyer.lastName}`;
    const matchesSearch =
      customerName.toLowerCase().includes(orderFilters.search.toLowerCase()) ||
      order.order.orderNumber
        .toLowerCase()
        .includes(orderFilters.search.toLowerCase());

    const matchesStatus =
      currentConfig.status === "all" ||
      order.status.toUpperCase() === currentConfig.status;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    startTransition(() => {
      // Simulate export
      toast.success("Exporting orders...");
      // Add actual export logic here
    });
  };

  const handleFilterClick = () => {
    // You can open a filter dialog/drawer here
    toast.info("Filter options coming soon");
  };

  return (
    <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300">
          Orders
        </h2>
        <div className="flex items-center gap-2 transition-all duration-300">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isPending}
            className="text-xs sm:text-sm transition-all duration-300"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Exp</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFilterClick}
            disabled={isPending}
            className="text-xs sm:text-sm bg-transparent transition-all duration-300"
          >
            <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Filter</span>
            <span className="sm:hidden">Filt</span>
          </Button>
        </div>
      </div>

      <OrderSearchFilter
        filters={orderFilters}
        onFiltersChange={handleFiltersChange}
      />

      <BulkActions
        orders={currentOrders}
        selectedOrders={selectedOrders}
        setSelectedOrders={setSelectedOrders}
      />

      <OrderTabs
        activeTab={activeTab}
        orders={currentOrders}
        filters={orderFilters}
        onTabChange={handleTabChange}
      />

      <OrderStatusTab
        status={currentConfig.status}
        orders={filteredOrders}
        tabValue={currentConfig.tabValue}
        filters={orderFilters}
        onShipmentSuccess={handleShipmentSuccess}
        onOrderConfirmed={handleOrderConfirmed}
        onProcessingStarted={handleProcessingStarted}
        onOrderDelivered={handleOrderDelivered}
      />

      {/* Optional loading indicator for transitions */}
      {isPending && (
        <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg transition-all duration-300 ease-in-out z-50">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}
