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
import { useProduct } from "@/hooks/product/useProduct";
import { useEffect, useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import { ICreateProductInput } from "@/types/pages/product";
import { toast } from "sonner";
import { GET_MY_PRODUCTS } from "@/client/product/product.queries";

interface InventoryTableRowProps {
  item: {
    id: string;
    name: string;
    variants?: { sku: string; stock: number; soldCount: number; price: number; mrp: number }[];
    status: string;
  };
}

export function InventoryTableRow({ item }: InventoryTableRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adjustment, setAdjustment] = useState<string | number>(0);
  const [error, setError] = useState<string | null>(null);

  const { handleUpdateHandler } = useProduct();

  const currentStock = item?.variants?.[0]?.stock || 0;
  const finalStock = currentStock + (Number(adjustment) || 0);

  useEffect(() => {
    if (finalStock < 0) {
      setError("Final stock cannot be negative");
    } else {
      setError(null);
    }
  }, [finalStock]);

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setAdjustment("");
    } else if (!isNaN(Number(value))) {
      setAdjustment(Number(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalStock < 0 || adjustment === "") {
      toast.error("Invalid stock value");
      return;
    }
    if (!item.variants?.[0]) {
      toast.error("No variant found for this product");
      return;
    }

    try {
      const productInput: ICreateProductInput & { id: string } = {
        id: item.id,
        name: item.name,
        variants: {
          sku: item.variants[0].sku,
          stock: finalStock,
          price: item.variants[0].price,
          mrp: item.variants[0].mrp,
          isDefault: true,
        },

      };

      await handleUpdateHandler(productInput, {
        refetchQueries: [{ query: GET_MY_PRODUCTS }],
      });
      toast.success("Stock updated successfully!");
      setIsOpen(false);
      setAdjustment(0);
    } catch (error: any) {
      console.error("Error updating stock:", error);
      toast.error(error.message || "Failed to update stock");
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell className="font-mono">{item?.variants?.[0]?.sku}</TableCell>
      <TableCell>
        {(item?.variants?.[0]?.stock || 0) +
          (item?.variants?.[0]?.soldCount || 0)}
      </TableCell>
      <TableCell>{item?.variants?.[0]?.soldCount}</TableCell>
      <TableCell>{item?.variants?.[0]?.stock}</TableCell>
      <TableCell>
        <Badge
          variant={
            item.status === "in_stock"
              ? "default"
              : item.status === "low_stock"
              ? "secondary"
              : "destructive"
          }
        >
          {item.status.replace("_", " ")}
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
                <Button
                  type="submit"
                  disabled={finalStock < 0 || adjustment === ""}
                >
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