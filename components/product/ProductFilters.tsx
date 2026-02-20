"use client";

import { memo, useCallback, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/category.type";
import { Search, X } from "lucide-react";
import { StatusFilter } from "@/types/pages/product";
import { debounce } from "@/lib/utils";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  isCategoryLoading?: boolean;
}

export const ProductFilters = memo(function ProductFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  isCategoryLoading,
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search - triggers after user stops typing
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
      setIsSearching(false);
    }, 500),
    [onSearchChange]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    setIsSearching(true);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Cancel debounce and search immediately on Enter
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      setIsSearching(false);
      onSearchChange(localSearch);
    }
  }, [localSearch, onSearchChange]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    setIsSearching(false);
    onSearchChange("");
  }, [onSearchChange]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    onStatusChange(value as StatusFilter);
  }, [onStatusChange]);

  const handleCategoryChange = useCallback((value: string) => {
    onCategoryChange(value);
  }, [onCategoryChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={localSearch}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          className="pl-8 pr-8"
        />
        {isSearching && (
          <div className="absolute right-8 top-2.5">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          <SelectItem value="low_stock">Low Stock</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]" disabled={isCategoryLoading}>
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories?.map((category) => (
            <SelectItem value={category.id} key={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
