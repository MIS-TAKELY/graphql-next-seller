// // hooks/product/useProduct.ts
// import {
//   ADD_PRODUCT,
//   DELETE_PRODUCT,
//   UPDATE_PRODUCT,
// } from "@/client/product/product.mutations";
// import { GET_MY_PRODUCTS } from "@/client/product/product.queries";
// import { ProductStatus } from "@/types/common/enums";
// import {
//   GetMyProductsResponse,
//   ICreateProductInput,
//   Product,
// } from "@/types/pages/product";
// import { useMutation, useQuery } from "@apollo/client";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// export const useProduct = () => {
//   const router = useRouter();

//   // Query products
//   const {
//     data: productsData,
//     loading: productsDataLoading,
//     error: productsDataError,
//     refetch: refetchProducts,
//   } = useQuery<GetMyProductsResponse>(GET_MY_PRODUCTS, {
//     errorPolicy: "all",
//     notifyOnNetworkStatusChange: true,
//     fetchPolicy: "cache-and-network",
//   });

//   // --- DELETE MUTATION ---
//   const [deleteProductMutation, { loading: isDeleting }] = useMutation<
//     { deleteProduct: boolean },
//     { productId: string }
//   >(DELETE_PRODUCT, {
//     refetchQueries: [{ query: GET_MY_PRODUCTS }],
//     awaitRefetchQueries: true,
//     onCompleted: () => {
//       toast.success("Product deleted successfully");
//       router.push("/products");
//     },
//     onError: (error) => {
//       console.error("Delete error:", error);
//       toast.error(error.message || "Failed to delete product");
//     },
//   });

//   // --- ADD MUTATION ---
//   const [addProductMutation, { loading: isAdding }] = useMutation<
//     { addProduct: Product },
//     { input: ICreateProductInput }
//   >(ADD_PRODUCT, {
//     refetchQueries: [{ query: GET_MY_PRODUCTS }],
//     awaitRefetchQueries: true,
//     onCompleted: (data) => {
//       const statusText =
//         data.addProduct.status === ProductStatus.DRAFT
//           ? "saved as draft"
//           : "published";
//       toast.success(`Product ${statusText} successfully!`);
//       router.push("/products");
//     },
//     onError: (error) => {
//       console.error("Add error:", error);
//       toast.error(error.message || "Failed to create product");
//     },
//   });

//   // --- UPDATE MUTATION ---
//   const [updateProductMutation, { loading: isUpdating }] = useMutation<
//     { updateProduct: Product },
//     { input: ICreateProductInput & { id: string } }
//   >(UPDATE_PRODUCT, {
//     refetchQueries: [{ query: GET_MY_PRODUCTS }],
//     awaitRefetchQueries: true,
//     onCompleted: (data) => {
//       const statusText =
//         data.updateProduct.status === ProductStatus.DRAFT
//           ? "saved as draft"
//           : "published";
//       toast.success(`Product updated and ${statusText} successfully!`);
//       router.push("/products");
//     },
//     onError: (error) => {
//       console.error("Update error:", error);
//       toast.error(error.message || "Failed to update product");
//     },
//   });

//   // --- HANDLER FUNCTIONS ---

//   const handleSubmitHandler = async (
//     productInput: ICreateProductInput,
//     status: ProductStatus
//   ) => {
//     try {
//       // Final validation before submission
//       if (!productInput.name?.trim()) {
//         throw new Error("Product name is required");
//       }
//       if (!productInput.images?.length) {
//         throw new Error("At least one product image is required");
//       }
//       if (!productInput.variants?.length) {
//         throw new Error("At least one product variant is required");
//       }

//       // Set the status based on button clicked
//       const inputWithStatus = {
//         ...productInput,
//         status,
//       };

//       await addProductMutation({ variables: { input: inputWithStatus } });
//     } catch (error: any) {
//       console.error("Submit handler error:", error);
//       throw error; // Let the form handle the error
//     }
//   };

//   const handleDelete = async (productId: string) => {
//     try {
//       if (!productId) {
//         throw new Error("Product ID is required");
//       }
      
//       const confirmed = window.confirm(
//         "Are you sure you want to delete this product? This action cannot be undone."
//       );
      
//       if (!confirmed) return;

//       await deleteProductMutation({ variables: { productId } });
//     } catch (error: any) {
//       console.error("Delete handler error:", error);
//       toast.error(error.message || "Failed to delete product");
//     }
//   };

//   const handleUpdateHandler = async (
//     productInput: ICreateProductInput & { id: string },
//     status: ProductStatus
//   ) => {
//     try {
//       if (!productInput.id) {
//         throw new Error("Product ID is required");
//       }
//       if (!productInput.variants?.length) {
//         throw new Error("At least one product variant is required");
//       }

//       const inputWithStatus = {
//         ...productInput,
//         status,
//       };

//       await updateProductMutation({ variables: { input: inputWithStatus } });
//     } catch (error: any) {
//       console.error("Update handler error:", error);
//       throw error;
//     }
//   };

//   return {
//     // Data
//     productsData,
//     productsDataLoading,
//     productsDataError,
    
//     // Handlers
//     handleSubmitHandler,
//     handleDelete,
//     handleUpdateHandler,
//     refetchProducts,
    
//     // Loading states
//     isDeleting,
//     isAdding,
//     isUpdating,
//   };
// };