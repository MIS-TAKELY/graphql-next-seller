import { InventoryClient } from "@/components/product/InventoryClient";
import { Button } from "@/components/ui/button";

export default async function InventoryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <Button>Update Stock</Button>
      </div>

      <InventoryClient />
    </div>
  );
}