// app/products/[id]/edit/page.tsx

import {
  GET_PRODUCT,
  GET_PRODUCT_CATEGORIES,
  GET_PRODUCTS,
} from "@/client/product/product.queries"; // Assuming server-side GraphQL queries are available
import { ProductForm } from "@/components/product/ProductForm";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { transformProductToFormData } from "@/utils/product/transformProductData";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const client = await getServerApolloClient();

  const { data } = await client.query({
    query: GET_PRODUCTS,
  });

  console.log("data-->",data)

  return data.map((product: { id: string }) => ({
    id: product.id.toString(),
  }));
}

export const revalidate = 60; // Regenerate the page every 60 seconds

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const productData = await GET_PRODUCT({ productId: params.id }); // Assuming server-side query execution
  const categoryData = await GET_PRODUCT_CATEGORIES(); // Assuming server-side query execution

  const product = productData?.getProduct;
  if (!product) {
    notFound();
  }

  // Transform the product data to form format
  const initialValues = transformProductToFormData(product);

  return (
    <ProductForm
      mode="edit"
      categoriesData={categoryData?.categories || []}
      initialValues={initialValues}
      // productId={params.id} // Pass productId if needed for client-side mutations
      title="Edit Product"
      // isDeleting={deleting}
      onDelete={handleDelete}
      onSubmit={handleUpdateHandler}
      subtitle="Update product information and settings."
    />
  );
}
