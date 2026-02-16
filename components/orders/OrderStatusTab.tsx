// components/orders/OrderStatusTab.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getStatusIcon } from '@/lib/orders/utils';
import { OrderFilters, SellerOrder, OrderStatus } from '@/types/pages/order.types';
import { toast } from 'sonner';
import { OrderTable } from './OrderTable';
import { CreateShipmentDialog } from './CreateShipmentDialog';
import { CancelOrderDialog } from './CancelOrderDialog';
import { useOrder } from '@/hooks/order/useOrder';

interface OrderStatusTabProps {
  status: string;
  orders: SellerOrder[];
  tabValue: string;
  filters: OrderFilters;
  onShipmentSuccess?: (orderId: string) => void;
  onOrderConfirmed?: (orderId: string) => void;
  onProcessingStarted?: (orderId: string) => void;
  onOrderDelivered?: (orderId: string) => void;
  selectedOrders: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function OrderStatusTab({
  status,
  orders,
  tabValue,
  filters,
  onShipmentSuccess,
  onOrderConfirmed,
  onProcessingStarted,
  onOrderDelivered,
  selectedOrders,
  onSelectionChange,
}: OrderStatusTabProps) {
  const { confirmSingleOrder, updateOrderStatus, cancelOrder, refetch } = useOrder();

  const getTitle = () => {
    switch (tabValue) {
      case 'new':
        return 'New Orders';
      case 'confirmed':
        return 'Confirmed Orders';
      case 'returns':
        return 'Returns';
      default:
        return `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Orders`;
    }
  };

  const getDescription = () => {
    switch (tabValue) {
      case 'new':
        return 'Orders pending confirmation by the seller.';
      case 'confirmed':
        return 'Orders confirmed by the seller, ready for processing.';
      case 'processing':
        return 'Orders being packed and prepared for shipment.';
      case 'shipped':
        return 'Orders that have been shipped and are in transit.';
      case 'delivered':
        return 'Orders successfully delivered to the customer.';
      case 'returns':
        return 'Orders with return requests.';
      default:
        return '';
    }
  };

  const customActions = (order: SellerOrder) => {
    switch (tabValue) {
      case 'new':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await confirmSingleOrder(order.id);
                  // Call the callback after successful confirmation
                  if (onOrderConfirmed) {
                    setTimeout(() => {
                      onOrderConfirmed(order.id);
                    }, 100);
                  }
                } catch (error) {
                  // Error handling is managed by the hook
                  console.error('Failed to confirm order:', error);
                }
              }}
              className="text-xs"
            >
              Confirm Order
            </Button>
            <CancelOrderDialog order={order} onCancelClick={cancelOrder} onSuccess={() => refetch()}>
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                Cancel
              </Button>
            </CancelOrderDialog>
          </div>
        );
      case 'confirmed':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await updateOrderStatus(order.id, OrderStatus.PROCESSING);
                  // Call the callback after successful status update
                  if (onProcessingStarted) {
                    setTimeout(() => {
                      onProcessingStarted(order.id);
                    }, 100);
                  }
                } catch (error) {
                  // Error handling is managed by the hook
                  console.error('Failed to start processing:', error);
                }
              }}
              className="text-xs"
            >
              Start Processing
            </Button>
            <CancelOrderDialog order={order} onCancelClick={cancelOrder} onSuccess={() => refetch()}>
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                Cancel
              </Button>
            </CancelOrderDialog>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2">
            <CreateShipmentDialog
              order={order}
              onSuccess={(orderId) => {
                if (onShipmentSuccess) {
                  setTimeout(() => {
                    onShipmentSuccess(orderId);
                  }, 100);
                }
              }}
            />
            <CancelOrderDialog order={order} onCancelClick={cancelOrder} onSuccess={() => refetch()}>
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                Cancel
              </Button>
            </CancelOrderDialog>
          </div>
        );
      case 'shipped':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await updateOrderStatus(order.id, OrderStatus.DELIVERED);
                // Call the callback after successful status update
                if (onOrderDelivered) {
                  setTimeout(() => {
                    onOrderDelivered(order.id);
                  }, 100);
                }
              } catch (error) {
                // Error handling is managed by the hook
                console.error('Failed to mark as delivered:', error);
              }
            }}
            className="text-xs"
          >
            Mark as Delivered
          </Button>
        );
      case 'delivered':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Contacting customer for feedback...')}
            className="text-xs"
          >
            Request Feedback
          </Button>
        );
      case 'returns':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await updateOrderStatus(order.id, OrderStatus.RETURNED);
              } catch (error) {
                // Error handling is managed by the hook
                console.error('Failed to process return:', error);
              }
            }}
            className="text-xs"
          >
            Process Return
          </Button>
        );
      default:
        return null;
    }
  };

  const { Icon, className } = getStatusIcon(status);

  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
      <CardHeader className="pb-3 sm:pb-4 transition-all duration-300">
        <CardTitle className="text-base sm:text-lg md:text-xl transition-all duration-300">{getTitle()}</CardTitle>
        <CardDescription className="text-xs sm:text-sm transition-all duration-300">
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="transition-all duration-300">
        {orders.length > 0 ? (
          <OrderTable
            orders={orders}
            showCheckbox={true}
            showTracking={tabValue === 'shipped'}
            customActions={customActions}
            filters={filters}
            onShipmentSuccess={onShipmentSuccess}
            selectedOrders={selectedOrders}
            onSelectionChange={onSelectionChange}
          />
        ) : (
          <div className="text-center py-6 sm:py-8">
            <Icon className={className} />
            <h3 className="mt-4 text-base sm:text-lg font-semibold">
              No {tabValue === 'new' ? 'new' : tabValue} orders
            </h3>
            <p className="text-sm text-muted-foreground">
              {tabValue === 'new'
                ? 'New orders will appear here when received.'
                : tabValue === 'confirmed'
                  ? 'Confirmed orders will appear here.'
                  : tabValue === 'returns'
                    ? 'Return requests will appear here.'
                    : `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)
                    } orders will appear here.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}