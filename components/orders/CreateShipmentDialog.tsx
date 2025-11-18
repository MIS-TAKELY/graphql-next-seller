// components/orders/CreateShipmentDialog.tsx

'use client';
import { useState, useEffect } from 'react';
import { useOrder } from '@/hooks/order/useOrder';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';
import { SellerOrder } from '@/types/pages/order.types';

interface CreateShipmentDialogProps {
  order: SellerOrder;
  children?: React.ReactNode;
  onSuccess?: (orderId: string) => void; // Updated to pass orderId
}

export function CreateShipmentDialog({
  order,
  children,
  onSuccess,
}: CreateShipmentDialogProps) {
  const { createSingleShipment, updateOrderStatus } = useOrder();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    carrier: '',
  });
  const [errors, setErrors] = useState({
    trackingNumber: '',
    carrier: '',
    orderId: '',
  });

  useEffect(() => {
    if (!order.buyerOrderId) {
      setErrors((prev) => ({
        ...prev,
        orderId: 'Order ID is missing or invalid',
      }));
      console.error('Missing buyerOrderId for order:', order.id);
    }
  }, [order.buyerOrderId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { trackingNumber: '', carrier: '', orderId: '' };

    if (!order.buyerOrderId) {
      newErrors.orderId = 'Order ID is missing or invalid';
      isValid = false;
    }
    if (!formData.trackingNumber.trim()) {
      newErrors.trackingNumber = 'Tracking number is required';
      isValid = false;
    }
    if (!formData.carrier.trim()) {
      newErrors.carrier = 'Carrier is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);
    try {
      await createSingleShipment({
        orderId: order.buyerOrderId,
        trackingNumber: formData.trackingNumber,
        carrier: formData.carrier,
        status: 'SHIPPED',
      });
      await updateOrderStatus(order.id, 'SHIPPED');
      toast.success(`Shipment created for order #${order.order.orderNumber}`);
      setIsOpen(false);
      setFormData({ trackingNumber: '', carrier: '' });
      setErrors({ trackingNumber: '', carrier: '', orderId: '' });
      if (onSuccess) onSuccess(order.id); // Pass orderId to parent
    } catch (error) {
      let message = 'Failed to create shipment';
      if (error instanceof Error) {
        if (error.message.includes('NOT_FOUND')) {
          message = 'Order not found';
        } else if (error.message.includes('FORBIDDEN')) {
          message = 'Unauthorized to create shipment';
        } else {
          message = error.message;
        }
      }
      toast.error(message);
      console.error('Shipment creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild disabled={!!errors.orderId}>
        {children || (
          <Button size="sm" className="text-xs" disabled={!!errors.orderId}>
            <Truck className="mr-1 h-3 w-3" />
            Create Shipment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>
            Enter the shipment details for order #{order.order.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="carrier" className="text-sm">
              Carrier
            </Label>
            <Input
              id="carrier"
              name="carrier"
              value={formData.carrier}
              onChange={handleInputChange}
              placeholder="e.g., FedEx, UPS"
              className="text-sm"
              disabled={isLoading}
            />
            {errors.carrier && (
              <p className="text-xs text-destructive">{errors.carrier}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trackingNumber" className="text-sm">
              Tracking Number
            </Label>
            <Input
              id="trackingNumber"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleInputChange}
              placeholder="e.g., 1Z9999W999999999"
              className="text-sm"
              disabled={isLoading}
            />
            {errors.trackingNumber && (
              <p className="text-xs text-destructive">{errors.trackingNumber}</p>
            )}
          </div>
          {errors.orderId && (
            <p className="text-xs text-destructive">{errors.orderId}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="text-xs">
            {isLoading ? 'Creating...' : 'Create Shipment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}