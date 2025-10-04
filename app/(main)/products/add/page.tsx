import { GET_PRODUCT_CATEGORIES } from "@/client/product/product.queries";
import AddProductClient from "@/components/pages/AddProductClient";
import { getPublicServerApolloClient } from "@/lib/apollo/apollo-public-server-client";
import { Category } from "@/types/category.type";

export const dynamic = "force-dynamic"; // Add this: Fetches at runtime, skips build-time

export default async function AddProductPage() {
  const client = await getPublicServerApolloClient();

  const categoryResponse = await client.query({
    query: GET_PRODUCT_CATEGORIES,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const categoriesData: Category[] = categoryResponse.data?.categories;
  console.log("category-->", categoriesData); // Fixed typo: "categgory" -> "category"
  return <AddProductClient categoriesData={categoriesData} />;
}
