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
import { SellerOrder, OrderFilters } from '@/types/pages/order.types';

interface OrderTableProps {
  orders: SellerOrder[];
  showCheckbox?: boolean;
  showTracking?: boolean;
  customActions?: any;
  filters?: OrderFilters;
  onShipmentSuccess?: (orderId: string) => void;
  onConfirmationSuccess?: (orderId: string) => void; // Added callback
}

export function OrderTable({
  orders,
  showCheckbox = false,
  showTracking = false,
  customActions,
  filters,
  onShipmentSuccess,
  onConfirmationSuccess,
}: OrderTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const { confirmSingleOrder, updateOrderStatus } = useOrder();

  const selectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.id));
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      if (newStatus === 'CONFIRMED') {
        await confirmSingleOrder(orderId);
        onConfirmationSuccess?.(orderId); // Trigger callback
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
    } catch (error) {
      // Error handling is managed by the hook
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
            <TableRow key={order.id}>
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
                    {`${order.order.buyer.firstName} ${order.order.buyer.lastName}`}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {order.order.buyer.email}
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
                {order.items.length}
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
                        {order.status === 'PENDING' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                            className="text-xs"
                          >
                            Confirm Order
                          </DropdownMenuItem>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                            className="text-xs"
                          >
                            Start Processing
                          </DropdownMenuItem>
                        )}
                        {order.status === 'PROCESSING' && (
                          <DropdownMenuItem asChild>
                            <CreateShipmentDialog
                              order={order}
                              onSuccess={() => onShipmentSuccess?.(order.id)}
                            >
                              <span className="text-xs">Create Shipment</span>
                            </CreateShipmentDialog>
                          </DropdownMenuItem>
                        )}
                        {order.status === 'SHIPPED' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                            className="text-xs"
                          >
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                        {(order.status === 'SHIPPED' || order.status === 'DELIVERED') &&
                          order.items[0]?.variant?.product?.returnPolicy?.type !== 'NO_RETURN' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(order.id, 'RETURNED')}
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