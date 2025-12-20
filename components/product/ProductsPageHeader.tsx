"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface ProductsPageHeaderProps {
  title?: string;
  description?: string;
  addProductLink?: string;
}

export function ProductsPageHeader({
  title = "Products",
  description = "Manage your product inventory and listings",
  addProductLink = "/products/add",
  children,
}: ProductsPageHeaderProps & { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <Link href={addProductLink}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>
    </div>
  );
}
