// components/orders/BulkShipmentDialog.tsx
'use client';

import { useState } from 'react';
import { useOrder } from '@/hooks/order/useOrder';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface BulkShipmentDialogProps {
    orderIds: string[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function BulkShipmentDialog({
    orderIds,
    isOpen,
    onOpenChange,
    onSuccess,
}: BulkShipmentDialogProps) {
    const { bulkCreateShipments } = useOrder();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        trackingNumber: '',
        carrier: '',
    });

    const handleSubmit = async () => {
        if (!formData.trackingNumber.trim() || !formData.carrier.trim()) {
            toast.error('Please fill in all shipment details');
            return;
        }

        setIsLoading(true);
        try {
            await bulkCreateShipments(
                orderIds,
                formData.trackingNumber,
                formData.carrier
            );
            onOpenChange(false);
            setFormData({ trackingNumber: '', carrier: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Bulk shipment error:', error);
            // toast is already handled in the hook
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bulk Create Shipment</DialogTitle>
                    <DialogDescription>
                        Enter common shipment details for the {orderIds.length} selected orders.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="bulk-carrier" className="text-sm">
                            Carrier
                        </Label>
                        <Input
                            id="bulk-carrier"
                            value={formData.carrier}
                            onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                            placeholder="e.g., FedEx, UPS"
                            className="text-sm"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bulk-tracking" className="text-sm">
                            Tracking Number
                        </Label>
                        <Input
                            id="bulk-tracking"
                            value={formData.trackingNumber}
                            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                            placeholder="e.g., SHIP123456789"
                            className="text-sm"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="text-xs"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="text-xs">
                        {isLoading ? 'Processing...' : 'Mark as Shipped'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
