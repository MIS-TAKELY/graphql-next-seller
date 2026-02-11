// hooks/product/useProduct.ts
import {
  ADD_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
} from "@/client/product/product.mutations";
import { GET_MY_PRODUCTS, GET_MY_PRODUCT_STATS, GET_PRODUCT_CATEGORIES } from "@/client/product/product.queries";
import { ProductStatus } from "@/types/common/enums";
import {
  GetMyProductsResponse,
  GetMyProductStatsResponse,
  GetProductCategoriesResponse,
  ICreateProductInput,
  Product,
} from "@/types/pages/product";
import type { ProductVariant } from "@/types/product/product.types";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const slugifyProductName = (value?: string, fallback = "temp-product") =>
  value
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") || fallback;

type OptimisticProductOptions = Partial<
  Pick<Product, "id" | "category" | "sellerId" | "status">
>;

// Helper to map API Input -> UI Product Type for Optimistic Updates
const buildOptimisticProduct = (
  input: ICreateProductInput,
  options: OptimisticProductOptions = {}
): Product => {
  const timestamp = Date.now();
  const productId = options.id ?? `temp-${timestamp}`;

  return {
    id: productId,
    createdAt: new Date(),
    updatedAt: new Date(),
    sellerId: options.sellerId ?? "temp-seller",
    name: input.name ?? "",
    slug: slugifyProductName(input.name),
    description: input.description ?? "",
    status: options.status ?? ProductStatus.INACTIVE,
    brand: input.brand ?? "",
    categoryId: input.categoryId,
    category: options.category ?? null,
    images: (input.images ?? []).map((img, index) => ({
      id: `${productId}-image-${index}`,
      productId,
      variantId: null,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder ?? index,
      mediaType: img.mediaType ?? "PRIMARY",
      fileType: img.fileType ?? "IMAGE",
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    // UPDATED: Handle Array of Variants
    variants: input.variants.map((v, index) => ({
      id: v.id || `${productId}-variant-${index}`,
      productId,
      sku: v.sku,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      soldCount: 0, // Default for new items
      attributes: v.attributes,
      isDefault: v.isDefault ?? index === 0,
      specifications: v.specifications?.map((spec, specIndex) => ({
        id: `${productId}-variant-${index}-spec-${specIndex}`,
        variantId: v.id || `${productId}-variant-${index}`,
        key: spec.key,
        value: spec.value,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    deliveryOptions: (input.deliveryOptions ?? []).map((option, index) => ({
      id: `${productId}-delivery-${index}`,
      productId,
      title: option.title,
      description: option.description,
      isDefault: option.isDefault ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    warranty: (input.warranty ?? []).map((item, index) => ({
      id: `${productId}-warranty-${index}`,
      productId,
      type: item.type,
      duration: item.duration,
      unit: item.unit,
      description: item.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    returnPolicy: (input.returnPolicy ?? []).map((policy, index) => ({
      id: `${productId}-return-${index}`,
      productId,
      type: policy.type,
      duration: policy.duration,
      unit: policy.unit,
      conditions: policy.conditions,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    productOffers: (input.productOffers ?? []).map((offer, index) => ({
      id: `${productId}-offer-${index}`,
      offerId: `${productId}-offer-${index}`,
      productId,
      offer: {
        id: `${productId}-offer-${index}`,
        title: offer.offer.title,
        description: offer.offer.description,
        type: offer.offer.type,
        value: offer.offer.value,
        startDate: offer.offer.startDate,
        endDate: offer.offer.endDate,
        isActive: offer.offer.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
};


export const useProduct = (variables?: {
  skip?: number;
  take?: number;
  searchTerm?: string;
  status?: string;
  categoryId?: string;
  skipQuery?: boolean;
}) => {
  const router = useRouter();

  const {
    data: productsData,
    loading: productsDataLoading,
    error: productsDataError,
    refetch: refetchProducts,
  } = useQuery<GetMyProductsResponse>(GET_MY_PRODUCTS, {
    variables,
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    skip: variables?.skipQuery,
  });

  // --- DELETE MUTATION ---
  // --- DELETE MUTATION ---
  const [deleteProduct] = useMutation<
    { deleteProduct: boolean },
    { productId: string }
  >(DELETE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      const productId = variables?.productId;
      if (!productId) return;

      cache.modify({
        fields: {
          getMyProducts(existingData = {}, { readField }) {
            if (!existingData.products) return existingData;

            const updatedProducts = existingData.products.filter(
              (productRef: any) => readField("id", productRef) !== productId
            );

            // Update totalCount if it exists
            const newTotalCount = existingData.totalCount
              ? existingData.totalCount - 1
              : existingData.totalCount;

            return {
              ...existingData,
              products: updatedProducts,
              totalCount: newTotalCount,
            };
          },
        },
      });

      // Evict the product from the cache to ensure it's gone from all queries
      cache.evict({ id: cache.identify({ __typename: "Product", id: productId }) });
      cache.gc();
    },
    optimisticResponse: (vars: { productId: string }) => ({
      deleteProduct: true,
    }),
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete product. Changes reverted.");
    },
  });

  // --- ADD MUTATION ---
  const [addProductMutation, { loading: isAdding }] = useMutation<
    { addProduct: boolean },
    { input: ICreateProductInput }
  >(ADD_PRODUCT, {
    refetchQueries: [{ query: GET_MY_PRODUCTS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success("Product saved successfully!");
      router.push("/products");
    },
    onError: (error) => {
      console.error("Add error:", error);
      // Let the caller handle the toast to avoid duplicates
    },
  });

  // --- UPDATE MUTATION ---
  const [updateProduct] = useMutation<
    { updateProduct: boolean },
    { input: ICreateProductInput & { id: string } }
  >(UPDATE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const actualInput = variables?.input;
        if (!actualInput?.id || !data?.updateProduct) return;

        // Use cache.modify to update any cached versions of getMyProducts
        cache.modify({
          fields: {
            getMyProducts(existingData, { readField }) {
              if (!existingData || !existingData.products) return existingData;

              const updatedProducts = existingData.products.map((productRef: any) => {
                const id = readField("id", productRef);
                if (id !== actualInput.id) return productRef;

                // Create the updated product data for the cache
                // Note: This is an optimistic update, so we use the input values
                const updatedProduct = {
                  ...productRef,
                  name: actualInput.name || readField("name", productRef),
                  description: actualInput.description || readField("description", productRef),
                  brand: actualInput.brand || readField("brand", productRef),
                  status: actualInput.status || readField("status", productRef),
                };

                return updatedProduct;
              });

              return {
                ...existingData,
                products: updatedProducts,
              };
            },
          },
        });
      } catch (error) {
        console.error("Error updating cache for update:", error);
      }
    },
    optimisticResponse: (vars: {
      input: ICreateProductInput & { id: string };
    }) => ({
      updateProduct: true,
    }),
    onCompleted: () => {
      toast.success("Product updated successfully!");
      router.push("/products");
    },
    onError: (error) => {
      console.error("Update error:", error);
      // Let the caller handle the toast
    },
  });

  // --- HANDLERS ---

  const handleSubmitHandler = async (productInput: ICreateProductInput) => {
    try {
      // Final validation
      if (!productInput.name?.trim())
        throw new Error("Product name is required");
      if (!productInput.images?.length)
        throw new Error("At least one image is required");
      if (!productInput.variants?.length)
        throw new Error("At least one variant is required");

      await addProductMutation({
        variables: { input: productInput },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Submit error:", error);
      throw new Error(errorMessage); // Let ProductForm catch and show toast
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      if (!productId) throw new Error("Product ID is required");
      toast.success("Deleting product...");
      await deleteProduct({ variables: { productId } });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete product. Please try again."
      );
    }
  };

  const handleUpdateHandler = async (
    productInput: ICreateProductInput,
    _status?: ProductStatus
  ) => {
    try {
      if (!productInput.id) throw new Error("Product ID is required");

      // UPDATED: Validation for Array of Variants
      if (productInput.variants && productInput.variants.length === 0) {
        throw new Error("Cannot update product with empty variants");
      }

      toast.success("Updating product...");
      await updateProduct({ variables: { input: productInput as ICreateProductInput & { id: string } } });
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product. Please try again."
      );
    }
  };

  return {
    handleSubmitHandler,
    handleDelete,
    productsData,
    productsDataLoading,
    productsDataError,
    handleUpdateHandler,
    refetchProducts,

    isAdding
  };
};

export const useProductStats = () => {
  const { data, loading, error, refetch } = useQuery<GetMyProductStatsResponse>(GET_MY_PRODUCT_STATS, {
    fetchPolicy: "cache-and-network",
  });

  return {
    stats: data?.getMyProductStats,
    isLoading: loading,
    error,
    refetch,
  };
};
