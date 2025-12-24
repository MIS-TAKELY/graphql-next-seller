// components/product/InventoryTableRow.tsx
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UPDATE_VARIANT_STOCK } from "@/client/product/product.mutations";
import { GET_INVENTORY } from "@/client/product/product.queries";
import { useMutation } from "@apollo/client";
import { InventoryProduct } from "@/types/pages/product";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TableCell, TableRow } from "../ui/table";

interface InventoryTableRowProps {
  item: InventoryProduct;
}

export function InventoryTableRow({ item }: InventoryTableRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adjustment, setAdjustment] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [updateStock, { loading: updating }] = useMutation(UPDATE_VARIANT_STOCK, {
    refetchQueries: [{ query: GET_INVENTORY }],
  });

  const variant = item.variants[0]; // Assume at least one variant exists
  const currentStock = variant?.stock ?? 0;
  const finalStock = currentStock + adjustment;

  useEffect(() => {
    if (finalStock < 0) {
      setError("Final stock cannot be negative");
    } else {
      setError(null);
    }
  }, [finalStock]);

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAdjustment(value === "" ? 0 : parseInt(value, 10));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (finalStock < 0) {
      toast.error("Final stock cannot be negative");
      return;
    }
    if (!variant) {
      toast.error("No variant found for this product");
      return;
    }
    try {
      await updateStock({
        variables: {
          variantId: variant.id,
          stock: finalStock,
        },
      });
      toast.success("Stock updated successfully!");
      setIsOpen(false);
      setAdjustment(0);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update stock"
      );
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell className="font-mono">{variant?.sku ?? "N/A"}</TableCell>
      <TableCell>{(variant?.stock ?? 0) + (variant?.soldCount ?? 0)}</TableCell>
      <TableCell>{variant?.soldCount ?? 0}</TableCell>
      <TableCell>{variant?.stock ?? 0}</TableCell>
      <TableCell>
        <Badge
          variant={
            variant.stock > 0
              ? "default"
              : variant.stock < 5
                ? "secondary"
                : "destructive"
          }
        >
          {variant.stock > 10
            ? "In Stock"
            : variant.stock > 0
              ? "Low Stock"
              : "Out of Stock"}
        </Badge>
      </TableCell>
      <TableCell>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setAdjustment(0);
              setError(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Update Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock for {item.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={currentStock}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="adjustment">
                  Add/Subtract Stock (e.g., +10 or -5)
                </Label>
                <Input
                  id="adjustment"
                  type="number"
                  value={adjustment}
                  onChange={handleAdjustmentChange}
                  placeholder="e.g., +10 or -5"
                  required
                  step="1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="finalStock">Final Stock</Label>
                <Input
                  id="finalStock"
                  type="number"
                  value={finalStock}
                  disabled
                  className="bg-gray-100"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={finalStock < 0}>
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
