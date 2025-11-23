// components/pages/AddProductClient.tsx
"use client";

import { Category } from "@/types/category.type";
import { ProductForm } from "../product/ProductForm";
import { useProduct } from "@/hooks/product/useProduct";

export default function AddProductClient({
  categoriesData,
}: {
  categoriesData: Category[];
}) {
  const { handleSubmitHandler, isAdding } = useProduct();

  return (
    <ProductForm
      mode="add"
      categoriesData={categoriesData || []}
      onSubmit={handleSubmitHandler}
      isSubmitting={isAdding}
      title="Add New Product"
      subtitle="Create a new product listing with all the details"
    />
  );
}