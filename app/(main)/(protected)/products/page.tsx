import { ProductsPageContent } from "@/components/product/ProductsPageContent";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_MY_PRODUCTS, GET_PRODUCT_CATEGORIES } from "@/client/product/product.queries";
import { GetMyProductsResponse, GetProductCategoriesResponse } from "@/types/pages/product";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 50;
  const skip = (page - 1) * pageSize;
  const searchTerm = typeof params.search === 'string' ? params.search : undefined;
  const status = typeof params.status === 'string' && params.status !== 'all' ? params.status : undefined;
  const categoryId = typeof params.categoryId === 'string' && params.categoryId !== 'all' ? params.categoryId : undefined;

  const client = await getServerApolloClient();

  // Fetch products and categories in parallel
  const [productsRes, categoriesRes] = await Promise.all([
    client.query<GetMyProductsResponse>({
      query: GET_MY_PRODUCTS,
      variables: {
        skip,
        take: pageSize,
        searchTerm,
        status,
        categoryId,
      },
      fetchPolicy: "no-cache",
    }),
    client.query<GetProductCategoriesResponse>({
      query: GET_PRODUCT_CATEGORIES,
      fetchPolicy: "cache-first",
    })
  ]);

  const products = JSON.parse(JSON.stringify(productsRes.data?.getMyProducts?.products || []));
  const totalCount = productsRes.data?.getMyProducts?.totalCount || 0;
  const categories = JSON.parse(JSON.stringify(categoriesRes.data?.categories || []));

  return (
    <ProductsPageContent
      initialProducts={products}
      totalCount={totalCount}
      categories={categories}
    />
  );
}
