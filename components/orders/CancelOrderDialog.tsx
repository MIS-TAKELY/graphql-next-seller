"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SellerOrder } from "@/types/pages/order.types";
import { useState } from "react";

interface CancelOrderDialogProps {
    order: SellerOrder;
    onSuccess?: (orderId: string) => void;
    children?: React.ReactNode;
    onCancelClick?: (orderId: string, reason: string) => Promise<void>;
}

export function CancelOrderDialog({
    order,
    onSuccess,
    children,
    onCancelClick,
}: CancelOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!onCancelClick) return;

        setLoading(true);
        try {
            await onCancelClick(order.id, reason);
            setOpen(false);
            setReason("");
            onSuccess?.(order.id);
        } catch (error) {
            console.error("Failed to cancel order:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button variant="destructive">Cancel Order</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this order? This action cannot be
                        undone. Please provide a reason for the cancellation.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Reason for cancellation (e.g., Out of stock)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Keep Order
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading || !reason.trim()}
                    >
                        {loading ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
