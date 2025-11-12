"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Product } from "@/types/pages/product";
import { ProductActionsMenu } from "./ProductActionsMenu";
import { StatusBadge } from "./StatusBadge";

interface ProductTableRowProps {
  product: Product;
  onDelete: (id: string) => void;
}

export function ProductTableRow({ product, onDelete }: ProductTableRowProps) {
  // console.log("product-->", product);
  return (
    <TableRow key={product?.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage
              src={product.images?.[0]?.url || "/placeholder.svg"}
              alt={product.name || "Product"}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <AvatarFallback className="rounded-md">
              {(product.name || "PR").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">
              {product.name || "Unnamed Product"}
            </div>
            <div className="text-sm text-muted-foreground sm:hidden">
              {product.variants?.[0]?.sku || "No SKU"}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell font-mono text-sm">
        {product.variants?.[0]?.sku || "No SKU"}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge
          variant="outline"
          className="max-w-[150px] truncate "
          title={product.category?.name || "No Category"} // Tooltip on hover
        >
          {product.category?.name || "No Category"}
        </Badge>
      </TableCell>

      <TableCell className="font-medium">
        ${product.variants?.[0]?.price || "0.00"}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span
          className={
            (product.variants?.[0]?.stock || 0) <= 10
              ? "text-orange-600 font-medium"
              : ""
          }
        >
          {product.variants?.[0]?.stock || "0"}
        </span>
      </TableCell>
      <TableCell>
        <StatusBadge status={product.status || "INACTIVE"} />
      </TableCell>
      <TableCell>
        <ProductActionsMenu productId={product.id} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}
