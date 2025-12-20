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
import { OrderStatus, SellerOrder, AddressSnapshot } from '@/types/pages/order.types';
import { Eye, Mail, Package, Printer, User, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { CreateShipmentDialog } from './CreateShipmentDialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getStatusVariant } from '@/lib/orders/utils';
import { Separator } from '@/components/ui/separator';

interface OrderDetailsDialogProps {
  order: SellerOrder;
  onShipmentSuccess?: (orderId: string) => void;
  onConfirmationSuccess?: (orderId: string) => void;
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
        onConfirmationSuccess?.(order.id);
      } else {
        await updateOrderStatus(order.id, newStatus);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatPrice = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null) return 'N/A';
    const value = typeof amount === 'number' ? amount : parseFloat(amount);
    return isNaN(value) ? 'N/A' : `NPR ${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseAddress = (address: any): AddressSnapshot | null => {
    if (!address) return null;
    if (typeof address === 'string') {
      try {
        return JSON.parse(address);
      } catch (e) {
        return null;
      }
    }
    return address;
  };

  const shippingAddress = parseAddress(order.order.shippingSnapshot);
  const billingAddress = parseAddress(order.order.billingSnapshot);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted transition-colors">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="sticky top-0 bg-background z-10 p-6 border-b">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  Order Details
                  <Badge variant="outline" className="font-mono text-xs">
                    #{order.order.orderNumber}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Placed on {formatDate(order.createdAt)}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(order.status)} className="capitalize px-3 py-1">
                  {order.status.toLowerCase()}
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-8">
          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <User className="h-4 w-4" /> Customer Information
              </h4>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 border">
                <p className="font-medium">
                  {order.order.buyer
                    ? `${order.order.buyer.firstName} ${order.order.buyer.lastName}`
                    : 'Anonymous'}
                </p>
                <p className="text-sm text-muted-foreground">{order.order.buyer?.email}</p>
                <p className="text-sm text-muted-foreground">{order.order.buyer?.phone}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <MapPin className="h-4 w-4" /> Shipping Address
              </h4>
              <div className="bg-muted/30 rounded-lg p-4 space-y-1 border text-sm">
                {shippingAddress ? (
                  <>
                    <p>{shippingAddress.line1}</p>
                    {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state}</p>
                    <p>{shippingAddress.country} - {shippingAddress.postalCode}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Phone: {shippingAddress.phone}</p>
                  </>
                ) : (
                  <p className="italic text-muted-foreground">Address not available</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <CreditCard className="h-4 w-4" /> Payment Details
              </h4>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 border text-sm">
                {order.order.payments?.[0] ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium capitalize">{order.order.payments[0].provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="text-[10px] h-4">
                        {order.order.payments[0].status}
                      </Badge>
                    </div>
                    {order.order.payments[0].transactionId && (
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-muted-foreground text-xs">Transaction ID:</span>
                        <span className="font-mono text-xs break-all bg-muted p-1 rounded">
                          {order.order.payments[0].transactionId}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="italic text-muted-foreground">Payment info not available</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
              <ShoppingBag className="h-4 w-4" /> Order Items ({order.items.length})
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium sm:w-16">Image</th>
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium text-center">Qty</th>
                    <th className="p-4 font-medium text-right">Unit Price</th>
                    <th className="p-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border relative">
                          {item.variant.product.images?.[0] ? (
                            <Image
                              src={item.variant.product.images[0].url}
                              alt={item.variant.product.images[0].altText || item.variant.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium leading-none">{item.variant.product.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            SKU: {item.variant.sku}
                          </p>
                          {item.variant.product.brand && (
                            <p className="text-xs text-muted-foreground">Brand: {item.variant.product.brand}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="p-4 text-right font-medium">{formatPrice(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex justify-end">
            <div className="w-full md:w-80 space-y-3 bg-muted/30 p-6 rounded-lg border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping Fee</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {Number(order.commission) > 0 && (
                <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                  <span className="flex items-center gap-1">Commission</span>
                  <span>-{formatPrice(order.commission)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Footer / Actions */}
          <div className="sticky bottom-0 bg-background pt-4 border-t mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {order.status === OrderStatus.PENDING && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(OrderStatus.CONFIRMED)}
                  className="shadow-sm"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Confirm Order
                </Button>
              )}
              {order.status === OrderStatus.CONFIRMED && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(OrderStatus.PROCESSING)}
                  className="shadow-sm"
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
                  className="shadow-sm"
                >
                  Mark as Delivered
                </Button>
              )}
              {(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.SHIPPED) &&
                order.items[0]?.variant?.product?.returnPolicy?.type !== 'NO_RETURN' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(OrderStatus.RETURNED)}
                    className="shadow-sm"
                  >
                    Process Return
                  </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Printing shipping labels...')}
                className="h-8 shadow-sm"
              >
                <Printer className="mr-2 h-3.5 w-3.5" />
                Labels
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Printing invoice...')}
                className="h-8 shadow-sm"
              >
                <Printer className="mr-2 h-3.5 w-3.5" />
                Invoice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Opening email client...')}
                className="h-8 shadow-sm"
              >
                <Mail className="mr-2 h-3.5 w-3.5" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}