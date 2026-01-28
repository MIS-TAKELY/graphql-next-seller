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
    // Optimistic UI update
    optimisticResponse: {
      updateVariantStock: true,
    },
    update: (cache, { data }) => {
      // Only update if mutation was successful (optimistic or real)
      if (data?.updateVariantStock) {
        try {
          const existingInventory = cache.readQuery<any>({
            query: GET_INVENTORY,
          });

          if (existingInventory?.getMyProducts?.products) {
            const updatedProducts = existingInventory.getMyProducts.products.map((p: any) => ({
              ...p,
              variants: p.variants.map((v: any) =>
                v.id === variant.id ? { ...v, stock: finalStock } : v
              ),
            }));

            cache.writeQuery({
              query: GET_INVENTORY,
              data: {
                getMyProducts: {
                  ...existingInventory.getMyProducts,
                  products: updatedProducts,
                },
              },
            });
          }
        } catch (err) {
          console.error("Cache update error:", err);
        }
      }
    },
    // We can keep refetchQueries as a fallback to ensure consistency with DB
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

    // Close dialog immediately for better "feel"
    setIsOpen(false);

    try {
      await updateStock({
        variables: {
          variantId: variant.id,
          stock: finalStock,
        },
      });
      toast.success("Stock updated successfully!");
      setAdjustment(0);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update stock"
      );
      // If it fails, the cache will be corrected by refetchQueries
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Stock for {item.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Stock Display */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                <Label className="text-sm text-muted-foreground">Current Stock</Label>
                <div className="text-3xl font-bold mt-1">{currentStock}</div>
              </div>

              {/* Quick Action Buttons */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Adjustments</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustment(adjustment + 10)}
                    className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300"
                  >
                    +10
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustment(adjustment + 50)}
                    className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300"
                  >
                    +50
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustment(adjustment + 100)}
                    className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300"
                  >
                    +100
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustment(adjustment - 10)}
                    className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
                  >
                    -10
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustment(adjustment - 50)}
                    className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
                  >
                    -50
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustment(adjustment - 100)}
                    className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
                  >
                    -100
                  </Button>
                </div>
              </div>

              {/* Manual Adjustment with Increment/Decrement */}
              <div className="space-y-2">
                <Label htmlFor="adjustment">Manual Adjustment</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setAdjustment(adjustment - 1)}
                    className="h-10 w-10 shrink-0"
                  >
                    <span className="text-lg">−</span>
                  </Button>
                  <Input
                    id="adjustment"
                    type="number"
                    value={adjustment}
                    onChange={handleAdjustmentChange}
                    placeholder="0"
                    className={`text-center text-lg font-semibold ${adjustment > 0
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 dark:text-green-100'
                      : adjustment < 0
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 dark:text-red-100'
                        : ''
                      }`}
                    step="1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setAdjustment(adjustment + 1)}
                    className="h-10 w-10 shrink-0"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>
                {adjustment !== 0 && (
                  <p className={`text-sm text-center ${adjustment > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {adjustment > 0 ? `Adding ${adjustment} units` : `Removing ${Math.abs(adjustment)} units`}
                  </p>
                )}
              </div>

              {/* Final Stock Preview */}
              <div className={`p-4 rounded-lg border-2 ${error
                ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
                : finalStock !== currentStock
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                <Label className="text-sm text-muted-foreground">Final Stock</Label>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold">{finalStock}</span>
                  {finalStock !== currentStock && !error && (
                    <span className={`text-sm font-medium ${adjustment > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ({adjustment > 0 ? '+' : ''}{adjustment})
                    </span>
                  )}
                </div>
                {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{error}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={finalStock < 0 || updating}
                  className="min-w-[100px]"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
