// app/products/add/page.tsx
"use client";

import { Category } from "@/types/category.type";
import { ProductForm } from "../product/ProductForm";
import { useProduct } from "@/hooks/product/useProduct";

export default function AddProductPage({
  categoriesData,
}: {
  categoriesData: Category[];
}) {

  const{handleSubmitHandler}=useProduct()

  console.log("category",categoriesData)


  return (
    <ProductForm
      mode="add"
      categoriesData={categoriesData || []}
      onSubmit={handleSubmitHandler}
      // isSubmitting={creating}
      title="Add New Product"
      subtitle="Create a new product listing."
    />
  );
}
