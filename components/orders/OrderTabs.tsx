// components/orders/OrderTabs.tsx

'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SellerOrder, OrderFilters } from '@/types/pages/order.types';

interface OrderTabsProps {
  activeTab: string;
  orders: SellerOrder[];
  filters: OrderFilters;
  onTabChange: (tab: 'all' | 'new' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'returns') => void;
}

export function OrderTabs({ activeTab, orders, filters, onTabChange }: OrderTabsProps) {
  const filteredOrders = orders.filter((order) => {
    const customerName = `${order.order.buyer.firstName} ${order.order.buyer.lastName}`;
    const matchesSearch =
      customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.order.orderNumber.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus =
      filters.status === 'all' || order.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter((order) => order.status === status);
  };

  const tabs = [
    { value: 'all', label: `All (${filteredOrders.length})` },
    { value: 'new', label: `New (${getOrdersByStatus('PENDING').length})` },
    { value: 'confirmed', label: `Confirmed (${getOrdersByStatus('CONFIRMED').length})` },
    { value: 'processing', label: `Processing (${getOrdersByStatus('PROCESSING').length})` },
    { value: 'shipped', label: `Shipped (${getOrdersByStatus('SHIPPED').length})` },
    { value: 'delivered', label: `Delivered (${getOrdersByStatus('DELIVERED').length})` },
    { value: 'returns', label: `Returns (${getOrdersByStatus('RETURNED').length})` },
  ];

  return (
    <Tabs value={activeTab} className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-300">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-2 sm:px-3 transition-all duration-300"
            onClick={() => onTabChange(tab.value as any)}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">
              {tab.value === "all" ? "All" : tab.value === "new" ? "New" : tab.value === "confirmed" ? "Conf" : tab.value === "processing" ? "Proc" : tab.value === "shipped" ? "Ship" : tab.value === "delivered" ? "Del" : "Ret"}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}