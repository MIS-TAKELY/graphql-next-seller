// hooks/product/useProduct.ts
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ADD_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
} from "@/client/product/product.mutations";
import { GET_MY_PRODUCTS } from "@/client/product/product.queries";
import { ICreateProductInput, GetMyProductsResponse, Product } from "@/types/pages/product";

export const useProduct = () => {
  const router = useRouter();

  const {
    data: productsData,
    loading: productsDataLoading,
    error: productsDataError,
  } = useQuery<GetMyProductsResponse>(GET_MY_PRODUCTS, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
    fetchPolicy: "cache-first",
  });

  const [deleteProduct] = useMutation<{ deleteProduct: boolean }, { productId: string }>(
    DELETE_PRODUCT,
    {
      update: (cache, { data }, { variables }) => {
        try {
          const productId = variables?.productId;
          if (!productId) return;
          const existing = cache.readQuery<GetMyProductsResponse>({ query: GET_MY_PRODUCTS });
          if (!existing?.getMyProducts) return;
          const updatedProducts = existing.getMyProducts.products.filter((p) => p.id !== productId);
          cache.writeQuery({
            query: GET_MY_PRODUCTS,
            data: {
              getMyProducts: {
                __typename: "getMyProductsResponse",
                products: updatedProducts,
                percentChange: existing.getMyProducts.percentChange ?? 0,
              },
            },
          });
        } catch (error) {
          console.error("Error updating cache for delete:", error);
        }
      },
      optimisticResponse: () => ({
        deleteProduct: true,
      }),
      onError: () => {
        toast.error("Failed to delete product. Changes reverted.");
      },
    }
  );

  const [addProduct] = useMutation<{ addProduct: Product }, { input: ICreateProductInput }>(
    ADD_PRODUCT,
    {
      update: (cache, { data }, { variables }) => {
        try {
          const actualInput = variables?.input;
          if (!actualInput) return;
          const existing = cache.readQuery<GetMyProductsResponse>({ query: GET_MY_PRODUCTS });
          if (!existing?.getMyProducts) return;
          const tempId = "temp-" + Date.now();
          const slug = actualInput.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || "temp-product";
          const existingCategory = existing.getMyProducts.products.find(
            (p) => p.category?.id === actualInput.categoryId
          )?.category;
          const optimisticProduct: Product = {
            id: tempId,
            name: actualInput.name,
            slug,
            description: actualInput.description || "",
            brand: actualInput.brand || "",
            category: existingCategory || null,
            images: actualInput.images?.map((img, index) => ({
              __typename: "ProductImage",
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder ?? index,
              mediaType: img.mediaType || "PRIMARY",
              fileType: img.fileType,
            })) || [],
            variants: actualInput.variants ? [actualInput.variants] : [],
            status: "DRAFT",
          };
          cache.writeQuery({
            query: GET_MY_PRODUCTS,
            data: {
              getMyProducts: {
                __typename: "getMyProductsResponse",
                products: [...existing.getMyProducts.products, optimisticProduct],
                percentChange: existing.getMyProducts.percentChange ?? 0,
              },
            },
          });
        } catch (error) {
          console.error("Error updating cache for add:", error);
        }
      },
      optimisticResponse: (vars) => ({
        addProduct: {
          __typename: "Product",
          id: "temp-" + Date.now(),
          name: vars?.input?.name || "",
          slug: vars?.input?.name
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || "temp-product",
          description: vars?.input?.description || "",
          brand: vars?.input?.brand || "",
          category: null,
          images: vars?.input?.images?.map((img, index) => ({
            __typename: "ProductImage",
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder ?? index,
            mediaType: img.mediaType || "PRIMARY",
            fileType: img.fileType,
          })) || [],
          variants: vars?.input?.variants ? [vars.input.variants] : [],
          status: "DRAFT",
        },
      }),
      onError: () => {
        toast.error("Failed to create product. Please try again.");
        router.push("/products");
      },
    }
  );

  const [updateProduct] = useMutation<
    { updateProduct: Product },
    { input: ICreateProductInput & { id: string } }
  >(UPDATE_PRODUCT, {
    update: (cache, { data }, { variables }) => {
      try {
        const actualInput = variables?.input;
        if (!actualInput?.id) return;
        const existing = cache.readQuery<GetMyProductsResponse>({ query: GET_MY_PRODUCTS });
        if (!existing?.getMyProducts) return;
        const existingCategory = existing.getMyProducts.products.find(
          (p) => p.category?.id === actualInput.categoryId
        )?.category;
        const updatedProducts = existing.getMyProducts.products.map((p) => {
          if (p.id !== actualInput.id) return p;
          return {
            ...p,
            name: actualInput.name ?? p.name,
            description: actualInput.description ?? p.description,
            brand: actualInput.brand ?? p.brand,
            category: actualInput.categoryId ? existingCategory || p.category : p.category,
            images: actualInput.images?.map((img, index) => ({
              __typename: "ProductImage",
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder ?? index,
              mediaType: img.mediaType || "PRIMARY",
              fileType: img.fileType,
            })) || p.images,
            variants: actualInput.variants ? [actualInput.variants] : p.variants,
            status: actualInput.variants?.stock === 0 ? "DISCONTINUED" : "ACTIVE",
          };
        });
        cache.writeQuery({
          query: GET_MY_PRODUCTS,
          data: {
            getMyProducts: {
              __typename: "getMyProductsResponse",
              products: updatedProducts,
              percentChange: existing.getMyProducts.percentChange ?? 0,
            },
          },
        });
      } catch (error) {
        console.error("Error updating cache for update:", error);
      }
    },
    optimisticResponse: (vars) => ({
      updateProduct: {
        __typename: "Product",
        id: vars?.input?.id || "",
        name: vars?.input?.name || "",
        slug: vars?.input?.name
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || "",
        description: vars?.input?.description || "",
        brand: vars?.input?.brand || "",
        category: null,
        images: vars?.input?.images?.map((img, index) => ({
          __typename: "ProductImage",
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder ?? index,
          mediaType: img.mediaType || "PRIMARY",
          fileType: img.fileType,
        })) || [],
        variants: vars?.input?.variants ? [vars.input.variants] : [],
        status: vars?.input?.variants?.stock === 0 ? "DISCONTINUED" : "ACTIVE",
      },
    }),
    onError: () => {
      toast.error("Failed to update product. Changes reverted.");
      router.push("/products");
    },
  });

  const handleSubmitHandler = async (productInput: ICreateProductInput) => {
    try {
      if (!productInput.name) throw new Error("Product name is required");
      if (!productInput.images || productInput.images.length === 0)
        throw new Error("At least one image is required");
      if (!productInput.variants?.sku)
        throw new Error("Product variant SKU is required");
      toast.success("Creating product...");
      router.push("/products");
      await addProduct({ variables: { input: productInput } });
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create product. Please try again."
      );
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
        error instanceof Error ? error.message : "Failed to delete product. Please try again."
      );
    }
  };

  const handleUpdateHandler = async (productInput: ICreateProductInput & { id: string }) => {
    try {
      if (!productInput.id) throw new Error("Product ID is required");
      toast.success("Updating product...");
      router.push("/products");
      await updateProduct({ variables: { input: productInput } });
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update product. Please try again."
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
  };
};