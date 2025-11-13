// components/orders/OrderDetailsDialog.tsx
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Mail, Printer, Package, Truck } from "lucide-react";
import { toast } from "sonner";
// import { SellerOrder } from "@/types/order";
// import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { SellerOrder } from "@/types/pages/order.types";

interface OrderDetailsDialogProps {
  order: SellerOrder;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

export function OrderDetailsDialog({ 
  order,
  onStatusUpdate 
}: OrderDetailsDialogProps) {
  
  const handleStatusUpdate = (newStatus: string) => {
    onStatusUpdate?.(order.id, newStatus);
    toast.success(`Order ${order.order.orderNumber} updated to ${newStatus}`);
  };

  // Extract shipping address from snapshot
  const shippingAddress = order.order.shippingSnapshot as {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  const formatAddress = () => {
    if (!shippingAddress) return "N/A";
    return [
      shippingAddress.line1,
      shippingAddress.line2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postalCode,
      shippingAddress.country
    ].filter(Boolean).join(", ");
  };

  const customerName = [
    order.order.buyer.firstName,
    order.order.buyer.lastName
  ].filter(Boolean).join(" ") || "N/A";

  const activeShipment = order.order.shipments?.[0];
  const latestPayment = order.order.payments?.[0];

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
            Complete order information and management options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Customer & Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  Customer Information
                </h4>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.order.buyer.email}
                  </p>
                  {order.order.buyer.phone && (
                    <p className="text-sm text-muted-foreground">
                      {order.order.buyer.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  Order Status
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={getStatusVariant(order.status)} className="text-xs">
                    {order.status}
                  </Badge>
                  {activeShipment && (
                    <Badge variant="outline" className="text-xs">
                      <Truck className="mr-1 h-3 w-3" />
                      {activeShipment.status}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  Order Date
                </h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), "PPP 'at' p")}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  Shipping Address
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatAddress()}
                </p>
              </div>

              {activeShipment?.trackingNumber && (
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">
                    Tracking Information
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {activeShipment.trackingNumber}
                    </p>
                    {activeShipment.carrier && (
                      <p className="text-xs text-muted-foreground">
                        Carrier: {activeShipment.carrier}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {latestPayment && (
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">
                    Payment Information
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium">{latestPayment.provider}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={getPaymentStatusVariant(latestPayment.status)} className="text-xs">
                        {latestPayment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-3 text-sm sm:text-base">
              Order Items ({order.items.length})
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Product</TableHead>
                    <TableHead className="text-xs sm:text-sm">SKU</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Qty</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Price</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {item?.variant?.product?.images?.[0] && (
                            <img 
                              src={item.variant.product.images[0].url} 
                              alt={item.variant.product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.variant.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.variant.product.brand}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-mono">
                        {item.variant.sku}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-right">
                        {item?.unitPrice}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-right font-medium">
                        {item.totalPrice}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-3 text-sm sm:text-base">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>{order.tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping Fee:</span>
                <span>{order.shippingFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission:</span>
                <span className="text-destructive">
                  -{order.commission}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total:</span>
                <span>{order.total}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {order.status === "PENDING" && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate("CONFIRMED")}
                className="text-xs"
              >
                <Package className="mr-1 h-3 w-3" />
                Confirm Order
              </Button>
            )}
            {order.status === "CONFIRMED" && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate("PROCESSING")}
                className="text-xs"
              >
                Start Processing
              </Button>
            )}
            {order.status === "PROCESSING" && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate("SHIPPED")}
                className="text-xs"
              >
                <Truck className="mr-1 h-3 w-3" />
                Mark as Shipped
              </Button>
            )}
            {order.status === "SHIPPED" && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate("DELIVERED")}
                className="text-xs"
              >
                Mark as Delivered
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Printing shipping label...")}
              className="text-xs"
            >
              <Printer className="mr-1 h-3 w-3" />
              Print Label
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Opening email client...")}
              className="text-xs"
            >
              <Mail className="mr-1 h-3 w-3" />
              Contact Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Printing invoice...")}
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

// Helper functions
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, any> = {
    PENDING: "outline",
    CONFIRMED: "secondary",
    PROCESSING: "default",
    SHIPPED: "default",
    DELIVERED: "secondary",
    CANCELLED: "destructive",
    RETURNED: "destructive",
  };
  return variants[status] || "default";
}

function getPaymentStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, any> = {
    PENDING: "outline",
    COMPLETED: "secondary",
    FAILED: "destructive",
    REFUNDED: "outline",
  };
  return variants[status] || "default";
}