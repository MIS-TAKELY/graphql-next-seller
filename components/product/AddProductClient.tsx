import { ProductForm } from "@/components/product/ProductForm";
import { useProduct } from "@/hooks/product/useProduct";
import { Category } from "@/types/category.type";

export default function AddProductClient({
  categoriesData,
}: {
  categoriesData: Category[];
}) {
  const { handleSubmitHandler } = useProduct();

  return (
    <ProductForm
      mode="add"
      categoriesData={categoriesData}
      onSubmit={handleSubmitHandler}
      title="Add New Product"
      subtitle="Create a new product listing by following the steps below."
    //   isSubmitting={isSubmitting}
    />
  );
}
