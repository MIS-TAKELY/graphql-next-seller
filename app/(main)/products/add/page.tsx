import { GET_PRODUCT_CATEGORIES } from "@/client/product/product.queries";
import AddProductClient from "@/components/pages/AddProductClient";
import { getPublicServerApolloClient } from "@/lib/apollo/apollo-public-server-client";
import { Category } from "@/types/category.type";

// Remove or comment out the dynamic export to enable SSG
// export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  const client = await getPublicServerApolloClient();

  const categoryResponse = await client.query({
    query: GET_PRODUCT_CATEGORIES,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const categoriesData: Category[] = categoryResponse.data?.categories;
  console.log("category-->", categoriesData);

  return <AddProductClient categoriesData={categoriesData} />;
}
