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
    <Tabs value={activeTab} className="space-y-3 sm:space-y-4">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 text-xs sm:text-sm">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-2"
            onClick={() => onTabChange(tab.value as any)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}