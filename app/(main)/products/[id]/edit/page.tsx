// app/products/[id]/edit/page.tsx
"use client";

import {
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
} from "@/client/product/product.mutations";
import {
  GET_PRODUCT,
  GET_PRODUCT_CATEGORIES,
  GET_PRODUCTS,
} from "@/client/product/product.queries";
import { ProductForm } from "@/components/product/ProductForm";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const { data: productData, loading: productLoading } = useQuery(GET_PRODUCT, {
    variables: { productId: params.id },
  });

  const { data: categoryData, loading: categoryLoading } = useQuery(
    GET_PRODUCT_CATEGORIES
  );

  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
  });

  if (productLoading || categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  const product = productData?.getProduct;
  console.log("Product to edit(initial data)",product)
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Transform the product data to form format
  const initialValues = transformProductToFormData(product);

  const handleUpdate = async (input: any) => {
    console.log("updating input-->",input)
    try {
      await updateProduct({
        variables: {
          input: {
            ...input,
            id: params.id,
          },
        },
      });
      toast.success("Product updated successfully!");
      // router.push("/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct({ variables: { productId: params.id } });
      toast.success("Product deleted successfully.");
      router.push("/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  return (
    <ProductForm
      mode="edit"
      categoriesData={categoryData?.categories || []}
      initialValues={initialValues}
      onSubmit={handleUpdate}
      onDelete={handleDelete}
      isSubmitting={updating}
      isDeleting={deleting}
      title="Edit Product"
      subtitle="Update product information and settings."
    />
  );
}
