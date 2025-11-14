// components/orders/OrderSearchFilter.tsx

"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderFilters, OrderStatus } from "@/types/pages/order.types";
import { Search } from "lucide-react";

interface OrderSearchFilterProps {
  filters: OrderFilters;
  onFiltersChange: (filters: Partial<OrderFilters>) => void;
}

export function OrderSearchFilter({
  filters,
  onFiltersChange,
}: OrderSearchFilterProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value as OrderStatus | "all" });
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-8 text-sm"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />
      </div>
      <div className="flex space-x-2">
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[140px] text-xs sm:text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
