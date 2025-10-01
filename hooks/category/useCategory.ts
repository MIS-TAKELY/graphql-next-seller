import { GET_PRODUCT_CATEGORIES } from "@/client/product/product.queries";
import { useQuery } from "@apollo/client";

export const useCategory = () => {
  const {
    data: getCategoryData,
    loading: getCategoryLoading,
    error: getCategoryError,
  } = useQuery(GET_PRODUCT_CATEGORIES, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  });

  return {
    getCategoryData,
  };
};
