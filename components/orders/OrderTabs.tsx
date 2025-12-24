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
    const customerName = order.order.buyer ? `${order.order.buyer.firstName} ${order.order.buyer.lastName}` : 'Unknown Customer';
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
      <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar h-11 p-1 bg-muted/50 gap-1 transition-all duration-300">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-4 transition-all duration-300 whitespace-nowrap flex-shrink-0"
            onClick={() => onTabChange(tab.value as any)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}