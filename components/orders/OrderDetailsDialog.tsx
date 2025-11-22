// components/orders/OrderDetailsDialog.tsx
'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useOrder } from '@/hooks/order/useOrder';
import { OrderStatus, SellerOrder } from '@/types/pages/order.types';
import { Eye, Mail, Package, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { CreateShipmentDialog } from './CreateShipmentDialog';

interface OrderDetailsDialogProps {
  order: SellerOrder;
  onShipmentSuccess?: (orderId: string) => void;
  onConfirmationSuccess?: (orderId: string) => void; // Added callback
}

export function OrderDetailsDialog({
  order,
  onShipmentSuccess,
  onConfirmationSuccess,
}: OrderDetailsDialogProps) {
  const { confirmSingleOrder, updateOrderStatus } = useOrder();

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      if (newStatus === OrderStatus.CONFIRMED) {
        await confirmSingleOrder(order.id);
        onConfirmationSuccess?.(order.id); // Trigger callback
      } else {
        await updateOrderStatus(order.id, newStatus);
      }
    } catch (error) {
      // Error handling is managed by the hook
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Order Details - #{order.order.orderNumber}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Seller order information and management options
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6">
          {/* ... (customer info, order items, etc., remain unchanged) */}
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {order.status === OrderStatus.PENDING && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(OrderStatus.CONFIRMED)}
                className="text-xs"
              >
                <Package className="mr-1 h-3 w-3" />
                Confirm Order
              </Button>
            )}
            {order.status === OrderStatus.CONFIRMED && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(OrderStatus.PROCESSING)}
                className="text-xs"
              >
                Start Processing
              </Button>
            )}
            {order.status === OrderStatus.PROCESSING && (
              <CreateShipmentDialog
                order={order}
                onSuccess={() => onShipmentSuccess?.(order.id)}
              />
            )}
            {order.status === OrderStatus.SHIPPED && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(OrderStatus.DELIVERED)}
                className="text-xs"
              >
                Mark as Delivered
              </Button>
            )}
            {(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.SHIPPED) &&
              order.items[0]?.variant?.product?.returnPolicy?.type !== 'NO_RETURN' && (
                // TODO: Add 'returnPolicy' to the 'Product' type in types/pages/order.types.ts
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate(OrderStatus.RETURNED)}
                  className="text-xs"
                >
                  Process Return
                </Button>
              )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Printing shipping label...')}
              className="text-xs"
            >
              <Printer className="mr-1 h-3 w-3" />
              Print Label
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Opening email client...')}
              className="text-xs"
            >
              <Mail className="mr-1 h-3 w-3" />
              Contact Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Printing invoice...')}
              className="text-xs"
            >
              <Printer className="mr-1 h-3 w-3" />
              Print Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}