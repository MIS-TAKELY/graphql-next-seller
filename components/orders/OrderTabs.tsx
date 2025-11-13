"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { SellerOrder, OrderFilters } from "@/types/pages/order.types";

interface OrderTabsProps {
  activeTab: string;
  orders: SellerOrder[];
  filters: OrderFilters;
}

export function OrderTabs({ activeTab, orders, filters }: OrderTabsProps) {
  const router = useRouter();

  const filteredOrders = orders.filter((order) => {
    const customerName = `${order.order.buyer.firstName} ${order.order.buyer.lastName}`;
    const matchesSearch =
      customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.order.orderNumber.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus =
      filters.status === "all" || order.status === filters.status;
    const matchesPriority =
      filters.priority === "all" ||
      (order.priority === filters.priority); // Assuming priority is part of SellerOrder
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter((order) => order.status === status);
  };

  const tabs = [
    { value: "all", label: `All (${filteredOrders.length})`, href: "/orders" },
    {
      value: "new",
      label: `New (${getOrdersByStatus("PENDING").length})`,
      href: "/orders/new",
    },
    {
      value: "processing",
      label: `Processing (${getOrdersByStatus("PROCESSING").length})`,
      href: "/orders/processing",
    },
    {
      value: "shipped",
      label: `Shipped (${getOrdersByStatus("SHIPPED").length})`,
      href: "/orders/shipped",
    },
    {
      value: "delivered",
      label: `Delivered (${getOrdersByStatus("DELIVERED").length})`,
      href: "/orders/delivered",
    },
    {
      value: "returns",
      label: `Returns (${getOrdersByStatus("RETURNED").length})`,
      href: "/orders/returns",
    },
  ];

  return (
    <Tabs value={activeTab} className="space-y-3 sm:space-y-4">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 text-xs sm:text-sm">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-2"
            onClick={() => router.push(tab.href)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}