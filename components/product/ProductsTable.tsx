"use client";

import { useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/pages/product";
import { ProductTableRow } from "./ProductTableRow";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginatedVirtualTable } from "@/components/ui/virtualized-table";

interface ProductsTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
  /** Enable virtualization for large lists (default: true if > 50 items) */
  enableVirtualization?: boolean;
  /** Infinite scroll: callback when user scrolls near bottom */
  onEndReached?: () => void;
  /** Infinite scroll: whether there are more items to load */
  hasNextPage?: boolean;
  /** Infinite scroll: whether more items are currently being loaded */
  isLoadingMore?: boolean;
}

export function ProductsTable({ 
  products, 
  onDelete, 
  isLoading, 
  enableVirtualization,
  onEndReached,
  hasNextPage,
  isLoadingMore,
}: ProductsTableProps) {
  // Enable virtualization automatically for large lists (> 50 items)
  const shouldVirtualize = useMemo(() => {
    if (enableVirtualization !== undefined) return enableVirtualization;
    return (products?.length || 0) > 50;
  }, [products?.length, enableVirtualization]);

  // Memoized row renderer for virtualization
  const renderProductRow = useCallback((product: Product) => (
    <ProductTableRow
      product={product}
      onDelete={onDelete}
    />
  ), [onDelete]);

  // Loading skeleton rows
  const loadingRows = useMemo(() => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-12 w-full" /></TableCell>
        <TableCell className="hidden sm:table-cell"><Skeleton className="h-8 w-full" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-8 w-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-full" /></TableCell>
        <TableCell className="hidden lg:table-cell"><Skeleton className="h-8 w-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-full" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  ), []);

  // Empty state
  const emptyComponent = useMemo(() => (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 h-[65px]">
        <p className="text-muted-foreground">No products found</p>
      </TableCell>
    </TableRow>
  ), []);

  if (isLoading) {
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden lg:table-cell">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRows}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Loading more indicator
  const loadingMoreComponent = useMemo(() => (
    <div className="flex items-center justify-center py-4">
      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ), []);

  // Use virtualized table for large lists
  if (shouldVirtualize && products?.length > 0) {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden lg:table-cell">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <PaginatedVirtualTable
          data={products}
          renderRow={renderProductRow}
          estimateSize={65}
          overscan={5}
          containerClassName="max-h-[600px]"
          emptyComponent={
            <Table>
              <TableBody>{emptyComponent}</TableBody>
            </Table>
          }
          onEndReached={onEndReached}
          hasNextPage={hasNextPage}
          isLoading={isLoadingMore}
          loadingComponent={loadingMoreComponent}
        />
      </div>
    );
  }

  // Regular table for small lists
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden lg:table-cell">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.length === 0 ? (
              emptyComponent
            ) : (
              products?.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
