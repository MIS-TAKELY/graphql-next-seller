'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  Printer,
  Download,
  X,
  FileSpreadsheet
} from "lucide-react";
import { OrderStatus, SellerOrder } from "@/types/pages/order.types";
import { useOrder } from "@/hooks/order/useOrder";
import { toast } from "sonner";
import { BulkShipmentDialog } from "./BulkShipmentDialog";

interface BulkActionsProps {
  orders: SellerOrder[];
  selectedOrders: string[];
  onClearSelection: () => void;
}

export function BulkActions({ selectedOrders, onClearSelection, orders = [] }: BulkActionsProps) {
  const { bulkUpdateOrders } = useOrder();
  const [isVisible, setIsVisible] = useState(false);
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedOrders.length > 0) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedOrders.length]);

  const handleBulkAction = async (status: OrderStatus) => {
    try {
      await bulkUpdateOrders(selectedOrders, status);
      onClearSelection();
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const handleExportCSV = () => {
    if (selectedOrders.length === 0) return;

    const selectedOrderData = orders.filter(o => selectedOrders.includes(o.id));

    // Simple CSV generation
    const headers = ["Order Number", "Status", "Total", "Customer", "Date"];
    const rows = selectedOrderData.map(o => [
      o.order.orderNumber,
      o.status,
      o.total,
      o.order.buyer ? `${o.order.buyer.firstName} ${o.order.buyer.lastName}` : "Unknown",
      new Date(o.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedOrders.length} orders to CSV`);
  };

  // Safe checks with case insensitivity
  const isSelected = (id: string) => selectedOrders.includes(id);

  const hasStatus = (status: OrderStatus) => {
    return orders.some(o => isSelected(o.id) && o.status.toUpperCase() === status);
  };

  const hasPending = hasStatus(OrderStatus.PENDING);
  const hasConfirmed = hasStatus(OrderStatus.CONFIRMED);
  const hasProcessing = hasStatus(OrderStatus.PROCESSING);
  const hasShipped = hasStatus(OrderStatus.SHIPPED);

  // If not visible and no selection, don't even render the hidden bar
  if (!isVisible && selectedOrders.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-in-out transform",
          selectedOrders.length > 0 ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95"
        )}
      >
        <div className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center gap-4 min-w-[320px] max-w-[90vw] sm:max-w-none">
          <div className="flex items-center gap-3 pr-4 border-b sm:border-b-0 sm:border-r border-border/50 pb-3 sm:pb-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                {selectedOrders.length}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold whitespace-nowrap">Orders Selected</span>
                <button
                  onClick={onClearSelection}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Clear selection
                </button>
              </div>
            </div>
            <button
              onClick={onClearSelection}
              className="sm:hidden p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {hasPending && (
              <Button
                onClick={() => handleBulkAction(OrderStatus.CONFIRMED)}
                variant="default"
                size="sm"
                className="rounded-xl px-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm
              </Button>
            )}

            {hasConfirmed && (
              <Button
                onClick={() => handleBulkAction(OrderStatus.PROCESSING)}
                variant="secondary"
                size="sm"
                className="rounded-xl px-4"
              >
                <Package className="mr-2 h-4 w-4" />
                Process
              </Button>
            )}

            {hasProcessing && (
              <Button
                onClick={() => setIsShipmentDialogOpen(true)}
                variant="secondary"
                size="sm"
                className="rounded-xl px-4"
              >
                <Truck className="mr-2 h-4 w-4" />
                Ship
              </Button>
            )}

            {hasShipped && (
              <Button
                onClick={() => handleBulkAction(OrderStatus.DELIVERED)}
                variant="secondary"
                size="sm"
                className="rounded-xl px-4"
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Delivered
              </Button>
            )}

            <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />

            {(hasShipped || hasStatus(OrderStatus.DELIVERED) || hasStatus(OrderStatus.RETURNED)) && (
              <>
                <Button
                  onClick={() => toast.info("Print feature coming soon")}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-3 hover:bg-primary/5"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>

                <Button
                  onClick={handleExportCSV}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-3 hover:bg-primary/5"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                  Export
                </Button>
              </>
            )}
          </div>

          <button
            onClick={onClearSelection}
            className="hidden sm:block p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <BulkShipmentDialog
        orderIds={selectedOrders.filter(id => {
          const order = orders.find(o => o.id === id);
          return order?.status.toUpperCase() === OrderStatus.PROCESSING;
        })}
        isOpen={isShipmentDialogOpen}
        onOpenChange={setIsShipmentDialogOpen}
        onSuccess={() => {
          onClearSelection();
          toast.success("Bulk shipment processed");
        }}
      />
    </>
  );
}