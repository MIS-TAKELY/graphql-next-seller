"use client";

import { DELETE_PRODUCT } from "@/client/product/product.mutations";
import { GET_PRODUCTS } from "@/client/product/product.queries";
import { ProductForm } from "@/components/product/ProductForm";
import { useProduct } from "@/hooks/product/useProduct";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditProductClient({ product, categories }: any) {
  const router = useRouter();
  const { handleUpdateHandler } = useProduct();

  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
  });

  const initialValues = transformProductToFormData(product);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct({ variables: { productId: product.id } });
      toast.success("Product deleted successfully.");
      router.push("/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  return (
    <ProductForm
      mode="edit"
      categoriesData={categories}
      initialValues={initialValues}
      onSubmit={handleUpdateHandler}
      onDelete={handleDelete}
      isDeleting={deleting}
      title="Edit Product"
      subtitle="Update product information and settings."
    />
  );
}
