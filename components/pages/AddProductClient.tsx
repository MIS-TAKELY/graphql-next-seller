// components/pages/AddProductClient.tsx
"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCT_CATEGORIES } from "@/client/product/product.queries";
import { Category } from "@/types/category/category.types";
import { ProductForm } from "../product/ProductForm";
import { useProduct } from "@/hooks/product/useProduct";

export default function AddProductClient() {
  const { handleSubmitHandler, isAdding } = useProduct();

  const { data, loading } = useQuery(GET_PRODUCT_CATEGORIES, {
    fetchPolicy: "cache-first"
  });

  const categoriesData: Category[] = data?.categories || [];

  return (
    <ProductForm
      mode="add"
      categoriesData={categoriesData}
      onSubmit={handleSubmitHandler}
      isSubmitting={isAdding}
      title="Add New Product"
      subtitle="Create a new product listing with all the details"
    />
  );
}