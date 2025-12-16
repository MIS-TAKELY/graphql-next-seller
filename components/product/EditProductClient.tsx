"use client";

import { DELETE_PRODUCT } from "@/client/product/product.mutations";
import { GET_PRODUCTS } from "@/client/product/product.queries";
import { ProductForm } from "@/components/product/ProductForm";
import { useProduct } from "@/hooks/product/useProduct";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SellerFAQ from "./SellerFAQ";

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
    <div className="space-y-10 pb-10">
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

      <div className="border-t pt-10">
        <div className="max-w-4xl">
          <h2 className="text-xl font-bold mb-4">Customer Questions</h2>
          <p className="text-muted-foreground mb-6">Answer questions from customers about this product.</p>
          <SellerFAQ productId={product.id} />
        </div>
      </div>
    </div>
  );
}
