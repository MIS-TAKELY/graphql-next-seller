// components/orders/OrderSearchFilter.tsx

"use client";
import { useCallback, useState, useRef, useEffect } from "react";
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
import { debounce } from "@/lib/utils";

interface OrderSearchFilterProps {
  filters: OrderFilters;
  onFiltersChange: (filters: Partial<OrderFilters>) => void;
}

export function OrderSearchFilter({
  filters,
  onFiltersChange,
}: OrderSearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search - triggers after user stops typing
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFiltersChange({ search: value });
      setIsSearching(false);
    }, 500),
    [onFiltersChange]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    setIsSearching(true);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleStatusChange = useCallback((value: string) => {
    onFiltersChange({ status: value as OrderStatus | "all" });
  }, [onFiltersChange]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-8 text-sm"
          value={localSearch}
          onChange={handleSearchChange}
        />
        {isSearching && (
          <div className="absolute right-8 top-2.5">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
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
