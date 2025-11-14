// components/orders/BulkActions.tsx

'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { SellerOrder } from '@/types/pages/order.types';
import { useOrder } from '@/hooks/order/useOrder';

interface BulkActionsProps {
  orders: SellerOrder[];
  selectedOrders: string[];
  setSelectedOrders: React.Dispatch<React.SetStateAction<string[]>>;
}

export function BulkActions({ orders, selectedOrders, setSelectedOrders }: BulkActionsProps) {
  const { bulkUpdateOrders, bulkCreateShipments } = useOrder();

  const handleBulkAction = async (action: string) => {
    try {
      switch (action) {
        case 'mark_processing':
          await bulkUpdateOrders(selectedOrders, 'PROCESSING');
          break;

        case 'mark_shipped':
          const trackingNumber = prompt('Enter tracking number for all orders:');
          const carrier = prompt('Enter carrier (e.g., FedEx):');
          if (!trackingNumber || !carrier) {
            toast.error('Tracking number and carrier are required');
            return;
          }
          await bulkCreateShipments(orders, selectedOrders, trackingNumber, carrier, 'SHIPPED');
          break;

        case 'print_labels':
          toast.success(`Printing labels for ${selectedOrders.length} orders`);
          break;

        case 'export':
          toast.success(`Exporting ${selectedOrders.length} orders`);
          break;

        default:
          break;
      }
    } catch (error) {
      // Error handling is already managed in the hook
    }
  };

  const clearSelectedOrders = () => {
    setSelectedOrders([]);
  };

  if (selectedOrders.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {selectedOrders.length} order(s) selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleBulkAction('mark_processing')}
              className="text-xs"
            >
              Mark Processing
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkAction('mark_shipped')}
              className="text-xs"
            >
              Mark Shipped
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('print_labels')}
              className="text-xs"
            >
              <Printer className="mr-1 h-3 w-3" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('export')}
              className="text-xs"
            >
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearSelectedOrders}
              className="text-xs bg-transparent"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}