// components/orders/OrderTable.tsx
'use client';
import React, { useCallback, memo, useMemo } from 'react';
import { useOrder } from '@/hooks/order/useOrder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStatusVariant } from '@/lib/orders/utils';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { CreateShipmentDialog } from './CreateShipmentDialog';
import { CancelOrderDialog } from './CancelOrderDialog';
import { SellerOrder, OrderFilters, OrderStatus } from '@/types/pages/order.types';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaginatedVirtualTable } from '@/components/ui/virtualized-table';
import { Skeleton } from '@/components/ui/skeleton';


interface OrderTableProps {
  orders: SellerOrder[];
  showCheckbox?: boolean;
  showTracking?: boolean;
  customActions?: any;
  filters?: OrderFilters;
  onShipmentSuccess?: (orderId: string) => void;
  onConfirmationSuccess?: (orderId: string) => void;
  selectedOrders?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Enable virtualization for large lists (default: true if > 50 items) */
  enableVirtualization?: boolean;
  /** Show loading skeleton rows */
  isLoading?: boolean;
  /** Infinite scroll: callback when user scrolls near bottom */
  onEndReached?: () => void;
  /** Infinite scroll: whether there are more items to load */
  hasNextPage?: boolean;
  /** Infinite scroll: whether more items are currently being loaded */
  isLoadingMore?: boolean;
}

const formatDate = (dateString: string | Date) => {
  const dateValue = typeof dateString === 'string' ? dateString : dateString.toISOString();
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTotal = (total: SellerOrder['total']) => {
  if (typeof total === 'number') {
    return `रू ${total.toFixed(2)}`;
  }
  if (typeof total === 'string') {
    const parsed = parseFloat(total);
    return isNaN(parsed) ? 'N/A' : `रू ${parsed.toFixed(2)}`;
  }
  return 'N/A';
};

interface OrderTableRowProps {
  order: SellerOrder;
  isSelected: boolean;
  showCheckbox: boolean;
  showTracking: boolean;
  customActions: any;
  onSelectOrder: (orderId: string) => void;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onShipmentSuccess?: (orderId: string) => void;
  onConfirmationSuccess?: (orderId: string) => void;
  cancelOrder: (orderId: string, reason?: string) => Promise<any>;
}

const OrderTableRow = memo(function OrderTableRow({
  order,
  isSelected,
  showCheckbox,
  showTracking,
  customActions,
  onSelectOrder,
  onStatusUpdate,
  onShipmentSuccess,
  onConfirmationSuccess,
  cancelOrder
}: OrderTableRowProps) {
  // Memoize callbacks to prevent unnecessary re-renders
  const handleSelectOrder = useCallback(() => {
    onSelectOrder(order.id);
  }, [onSelectOrder, order.id]);

  const handleStatusUpdate = useCallback((status: OrderStatus) => {
    onStatusUpdate(order.id, status);
  }, [onStatusUpdate, order.id]);

  const handleShipmentSuccess = useCallback(() => {
    onShipmentSuccess?.(order.id);
  }, [onShipmentSuccess, order.id]);

  // Memoize customer name computation
  const customerName = useMemo(() => {
    const buyer = order.order.buyer;
    if (!buyer) return "Unknown Customer";
    if (buyer.firstName || buyer.lastName) {
      return `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim();
    }
    return buyer.name || "Unknown Customer";
  }, [order.order.buyer]);

  // Memoize first item
  const firstItem = order.items?.[0];
  const firstItemProduct = firstItem?.variant?.product;
  const firstItemImage = firstItemProduct?.images?.[0];

  return (
    <TableRow
      className={cn(
        "transition-colors duration-200",
        isSelected && "bg-primary/5 hover:bg-primary/10"
      )}
    >
      {showCheckbox && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectOrder}
          />
        </TableCell>
      )}
      <TableCell className="font-medium text-xs sm:text-sm">
        {order.order.orderNumber}
      </TableCell>
      <TableCell>
        <div className="min-w-0">
          <div className="font-medium text-xs sm:text-sm truncate">
            {customerName}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {order.order.buyer?.email ?? 'N/A'}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(order.status)} className="text-xs">
          {order.status}
        </Badge>
      </TableCell>
      <TableCell className="font-medium text-xs sm:text-sm">
        {formatTotal(order.total)}
      </TableCell>
      <TableCell className="hidden md:table-cell text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-muted border overflow-hidden flex-shrink-0 relative shadow-sm">
            {firstItemImage ? (
              <Image
                src={firstItemImage.url}
                alt={firstItemProduct?.name || 'Product'}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <Package className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate max-w-[150px] font-medium leading-tight">
              {firstItemProduct?.name || 'Unknown Product'}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
      </TableCell>
      {showTracking && (
        <TableCell className="hidden md:table-cell text-xs sm:text-sm">
          {order.order.shipments?.[0]?.trackingNumber ? (
            <span>{order.order.shipments[0].trackingNumber}</span>
          ) : (
            <CreateShipmentDialog
              order={order}
              onSuccess={handleShipmentSuccess}
              children={
                <Button variant="outline" size="sm" className="text-xs">
                  Generate Tracking
                </Button>
              }
            />
          )}
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center space-x-1">
          <OrderDetailsDialog
            order={order}
            onShipmentSuccess={onShipmentSuccess}
            onConfirmationSuccess={onConfirmationSuccess} // Pass callback
          />
          {customActions ? (
            customActions(order)
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {order.status === OrderStatus.PENDING && (
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(order.id, OrderStatus.CONFIRMED)}
                    className="text-xs"
                  >
                    Confirm Order
                  </DropdownMenuItem>
                )}
                {(order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PROCESSING) && (
                  <CancelOrderDialog
                    order={order}
                    onCancelClick={cancelOrder}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-xs text-destructive"
                    >
                      Cancel Order
                    </DropdownMenuItem>
                  </CancelOrderDialog>
                )}
                {order.status === OrderStatus.CONFIRMED && (
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(order.id, OrderStatus.PROCESSING)}
                    className="text-xs"
                  >
                    Start Processing
                  </DropdownMenuItem>
                )}
                {order.status === OrderStatus.PROCESSING && (
                  <DropdownMenuItem asChild>
                    <CreateShipmentDialog
                      order={order}
                      onSuccess={() => onShipmentSuccess?.(order.id)}
                    >
                      <span className="text-xs">Create Shipment</span>
                    </CreateShipmentDialog>
                  </DropdownMenuItem>
                )}
                {order.status === OrderStatus.SHIPPED && (
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(OrderStatus.DELIVERED)}
                    className="text-xs"
                  >
                    Mark as Delivered
                  </DropdownMenuItem>
                )}
                {(order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) &&
                  firstItemProduct?.returnPolicy?.type !== 'NO_RETURN' && (
                    <DropdownMenuItem
                      onClick={() => handleStatusUpdate(OrderStatus.RETURNED)}
                      className="text-xs"
                    >
                      Process Return
                    </DropdownMenuItem>
                  )}
                {(order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.RETURNED) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toast.success('Printing invoice...')}
                      className="text-xs cursor-pointer"
                    >
                      Print Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.success('Printing shipping label...')}
                      className="text-xs cursor-pointer"
                    >
                      Print Shipping Label
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => toast.success('Opening email client...')}
                  className="text-xs cursor-pointer"
                >
                  Contact Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

export const OrderTable = memo(function OrderTable({
  orders,
  showCheckbox = false,
  showTracking = false,
  customActions,
  filters,
  onShipmentSuccess,
  onConfirmationSuccess,
  selectedOrders = [],
  onSelectionChange,
  enableVirtualization,
  isLoading = false,
  onEndReached,
  hasNextPage,
  isLoadingMore,
}: OrderTableProps) {
  const { confirmSingleOrder, updateOrderStatus, cancelOrder } = useOrder();

  // Enable virtualization automatically for large lists (> 50 items)
  const shouldVirtualize = useMemo(() => {
    if (enableVirtualization !== undefined) return enableVirtualization;
    return (orders?.length || 0) > 50;
  }, [orders?.length, enableVirtualization]);

  // Loading skeleton rows
  const loadingRows = useMemo(() => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {showCheckbox && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell>
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell className="hidden md:table-cell">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-4 w-28" />
          </div>
        </TableCell>
        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
        {showTracking && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>}
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    ))
  ), [showCheckbox, showTracking]);

  // Empty state
  const emptyComponent = useMemo(() => (
    <TableRow>
      <TableCell colSpan={showCheckbox ? 9 : 8} className="text-center py-8 h-[80px]">
        <p className="text-muted-foreground">No orders found</p>
      </TableCell>
    </TableRow>
  ), [showCheckbox]);

  // Define callbacks before they are used in renderOrderRow
  const selectOrder = useCallback((orderId: string) => {
    const newSelected = selectedOrders.includes(orderId)
      ? selectedOrders.filter((id) => id !== orderId)
      : [...selectedOrders, orderId];
    onSelectionChange?.(newSelected);
  }, [selectedOrders, onSelectionChange]);

  const selectAllOrders = useCallback(() => {
    if (selectedOrders.length === orders.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(orders.map((order) => order.id));
    }
  }, [selectedOrders, orders, onSelectionChange]);

  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (newStatus === OrderStatus.CONFIRMED) {
        await confirmSingleOrder(orderId);
        onConfirmationSuccess?.(orderId);
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
    } catch (error) {
      // Error handling is managed by the hook
    }
  }, [confirmSingleOrder, updateOrderStatus, onConfirmationSuccess]);

  const handleCancelOrder = useCallback(async (orderId: string, reason?: string) => {
    return cancelOrder(orderId, reason);
  }, [cancelOrder]);

  // Memoized row renderer for virtualization (must be after selectOrder and handleStatusUpdate)
  const renderOrderRow = useCallback((order: SellerOrder) => (
    <OrderTableRow
      order={order}
      isSelected={selectedOrders.includes(order.id)}
      showCheckbox={showCheckbox}
      showTracking={showTracking}
      customActions={customActions}
      onSelectOrder={selectOrder}
      onStatusUpdate={handleStatusUpdate}
      onShipmentSuccess={onShipmentSuccess}
      onConfirmationSuccess={onConfirmationSuccess}
      cancelOrder={cancelOrder}
    />
  ), [selectedOrders, showCheckbox, showTracking, customActions, selectOrder, handleStatusUpdate, onShipmentSuccess, onConfirmationSuccess, cancelOrder]);

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {showCheckbox && (
                  <TableHead className="w-8 sm:w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
                <TableHead className="min-w-[100px] text-xs sm:text-sm">Order ID</TableHead>
                <TableHead className="min-w-[120px] text-xs sm:text-sm">Customer</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-xs sm:text-sm">Total</TableHead>
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">Items</TableHead>
                <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Date</TableHead>
                {showTracking && (
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Tracking</TableHead>
                )}
                <TableHead className="text-xs sm:text-sm">Actions</TableHead>
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
  if (shouldVirtualize && orders?.length > 0) {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckbox && (
                <TableHead className="w-8 sm:w-12">
                  <Checkbox
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onCheckedChange={selectAllOrders}
                  />
                </TableHead>
              )}
              <TableHead className="min-w-[100px] text-xs sm:text-sm">Order ID</TableHead>
              <TableHead className="min-w-[120px] text-xs sm:text-sm">Customer</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-xs sm:text-sm">Total</TableHead>
              <TableHead className="hidden md:table-cell text-xs sm:text-sm">Items</TableHead>
              <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Date</TableHead>
              {showTracking && (
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">Tracking</TableHead>
              )}
              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <PaginatedVirtualTable
          data={orders}
          renderRow={renderOrderRow}
          estimateSize={80}
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

  // Regular table for small lists or empty
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto transition-all duration-300 ease-in-out">
        <Table className="transition-all duration-300">
          <TableHeader>
            <TableRow>
              {showCheckbox && (
                <TableHead className="w-8 sm:w-12">
                  <Checkbox
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onCheckedChange={selectAllOrders}
                  />
                </TableHead>
              )}
              <TableHead className="min-w-[100px] text-xs sm:text-sm">Order ID</TableHead>
              <TableHead className="min-w-[120px] text-xs sm:text-sm">Customer</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-xs sm:text-sm">Total</TableHead>
              <TableHead className="hidden md:table-cell text-xs sm:text-sm">Items</TableHead>
              <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Date</TableHead>
              {showTracking && (
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">Tracking</TableHead>
              )}
              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.length === 0 ? (
              emptyComponent
            ) : (
              orders?.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  isSelected={selectedOrders.includes(order.id)}
                  showCheckbox={showCheckbox}
                  showTracking={showTracking}
                  customActions={customActions}
                  onSelectOrder={selectOrder}
                  onStatusUpdate={handleStatusUpdate}
                  onShipmentSuccess={onShipmentSuccess}
                  onConfirmationSuccess={onConfirmationSuccess}
                  cancelOrder={cancelOrder}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});