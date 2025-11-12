import {
  GET_PRODUCT,
  GET_PRODUCT_CATEGORIES,
} from "@/client/product/product.queries";
import EditProductClient from "@/components/product/EditProductClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";

export const revalidate = 60;

interface EditProductPageProps {
  params: Promise<{ id: string }>; // Updated: params is now a Promise
}

export default async function EditProductPage(props: EditProductPageProps) {
  const client = await getServerApolloClient(); // Switch to auth client
  const params = await props.params; // Await params
  const productId = params.id;

  let productData;
  let categoryData;

  try {
    const [productQuery, categoryQuery] = await Promise.all([
      client.query({
        query: GET_PRODUCT,
        variables: { productId },
        fetchPolicy:"no-cache"
      }),
      client.query({
        query: GET_PRODUCT_CATEGORIES,
      }),
    ]);

    productData = productQuery.data;
    categoryData = categoryQuery.data;
  } catch (error:any) {
    // Handle GraphQL errors (e.g., auth failure)
    console.error("Failed to fetch product data:", error);
    if (error.message.includes("Authentication required")) {
      // Optionally redirect to login: redirect('/login');
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please log in to edit products.
            </p>
          </div>
        </div>
      );
    }
    // Re-throw other errors or handle as needed
    throw error;
  }

  console.log("product data", productData); // Keep for debugging; remove in prod

  if (!productData?.getProduct) {
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

  return (
    <EditProductClient
      product={productData.getProduct}
      categories={categoryData?.categories || []}
    />
  );
}
