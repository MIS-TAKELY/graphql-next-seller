// components/orders/OrderTable.tsx
'use client';
import { useState } from 'react';
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
import { SellerOrder, OrderFilters, OrderStatus } from '@/types/pages/order.types';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';


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
}

export function OrderTable({
  orders,
  showCheckbox = false,
  showTracking = false,
  customActions,
  filters,
  onShipmentSuccess,
  onConfirmationSuccess,
  selectedOrders = [],
  onSelectionChange,
}: OrderTableProps) {
  const { confirmSingleOrder, updateOrderStatus } = useOrder();

  const selectOrder = (orderId: string) => {
    const newSelected = selectedOrders.includes(orderId)
      ? selectedOrders.filter((id) => id !== orderId)
      : [...selectedOrders, orderId];
    onSelectionChange?.(newSelected);
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(orders.map((order) => order.id));
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (newStatus === OrderStatus.CONFIRMED) {
        await confirmSingleOrder(orderId);
        onConfirmationSuccess?.(orderId); // Trigger callback
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
    } catch (error) {
      // Error handling is managed by the hook
    }
  };

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
      return `NPR ${total.toFixed(2)}`;
    }
    if (typeof total === 'string') {
      const parsed = parseFloat(total);
      return isNaN(parsed) ? 'N/A' : `NPR ${parsed.toFixed(2)}`;
    }
    return 'N/A';
  };

  return (
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
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={cn(
                "transition-colors duration-200",
                selectedOrders.includes(order.id) && "bg-primary/5 hover:bg-primary/10"
              )}
            >
              {showCheckbox && (
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => selectOrder(order.id)}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium text-xs sm:text-sm">
                {order.order.orderNumber}
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  <div className="font-medium text-xs sm:text-sm truncate">
                    {order.order.buyer ? `${order.order.buyer.firstName} ${order.order.buyer.lastName}` : 'Unknown Customer'}
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
                    {order.items[0]?.variant?.product?.images?.[0] ? (
                      <Image
                        src={order.items[0].variant.product.images[0].url}
                        alt={order.items[0].variant.product.name}
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
                      {order.items[0]?.variant?.product?.name || 'Unknown Product'}
                    </span>
                    {order.items[0]?.variant?.attributes && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {Object.entries(order.items[0].variant.attributes).map(([key, value]) => {
                          if (key === 'comparePrice') return null;
                          return (
                            <span key={key} className="text-[10px] text-muted-foreground capitalize">
                              {key}: {value}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
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
                      onSuccess={() => onShipmentSuccess?.(order.id)}
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
                            onClick={() => handleStatusUpdate(order.id, OrderStatus.CONFIRMED)}
                            className="text-xs"
                          >
                            Confirm Order
                          </DropdownMenuItem>
                        )}
                        {order.status === OrderStatus.CONFIRMED && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, OrderStatus.PROCESSING)}
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
                            onClick={() => handleStatusUpdate(order.id, OrderStatus.DELIVERED)}
                            className="text-xs"
                          >
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                        {(order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) &&
                          order.items[0]?.variant?.product?.returnPolicy?.type !== 'NO_RETURN' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(order.id, OrderStatus.RETURNED)}
                              className="text-xs"
                            >
                              Process Return
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => toast.success('Printing invoice...')}
                          className="text-xs"
                        >
                          Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.success('Printing shipping label...')}
                          className="text-xs"
                        >
                          Print Shipping Label
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.success('Opening email client...')}
                          className="text-xs"
                        >
                          Contact Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}