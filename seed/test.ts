// import {
//   ADD_PRODUCT,
//   DELETE_PRODUCT,
// } from "@/client/product/product.mutations";
// import { GET_MY_PRODUCTS } from "@/client/product/product.queries";
// import { ICreateProductInput } from "@/types/pages/product";
// import { useMutation, useQuery } from "@apollo/client";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// export interface ProductImage {
//   url: string;
// }

// export interface ProductVariant {
//   price: number;
//   sku: string;
//   stock: number;
// }

// export interface Product {
//   category: string | null;
//   id: string;
//   images: ProductImage[];
//   name: string;
//   slug: string;
//   status: string;
//   variants: ProductVariant[];
// }

// export interface GetMyProductsData {
//   getMyProducts: Product[];
// }

// export const useProduct = () => {
//   const router = useRouter();

//   const {
//     data: productsData,
//     loading: productsDataLoading,
//     error: productsDataError,
//   } = useQuery(GET_MY_PRODUCTS, {
//     errorPolicy: "all",
//     notifyOnNetworkStatusChange: false,
//     fetchPolicy: "cache-first",
//   });

//   const [
//     deleteProduct,
//     { loading: deleteProductLoading, error: deleteProductError },
//   ] = useMutation(DELETE_PRODUCT, {
//     update: (cache, { data }, { variables }) => {
//       try {
//         // Extract productId from variables
//         const productId = variables?.productId;
//         if (!productId) {
//           console.log("No product ID available for cache update");
//           return;
//         }

//         console.log("input-->", variables);

//         // Check if we have a valid delete result (post-mutation or optimistic)
//         if (!data?.deleteProduct) return;

//         const existing: GetMyProductsData | null = cache.readQuery({
//           query: GET_MY_PRODUCTS,
//         });
//         console.log("existing (before delete)", existing);

//         // Filter out the product with matching ID
//         const updatedProducts = (existing?.getMyProducts || []).filter(
//           (p: any) => p.id !== productId
//         );

//         // Write back the filtered list
//         cache.writeQuery({
//           query: GET_MY_PRODUCTS,
//           data: {
//             getMyProducts: updatedProducts,
//           },
//         });
//       } catch (error: any) {
//         console.error("Error updating cache for delete:", error);
//       }
//     },
//     refetchQueries: [{ query: GET_MY_PRODUCTS }], // Optional: Refetch for confirmation
//     // awaitRefetchQueries: true, // Uncomment if you want to wait for refetch before proceeding
//   });

//   const [addProduct] = useMutation(ADD_PRODUCT, {
//     update: (cache, { data }, { variables }) => {
//       try {
//         // Extract the actual input from variables (under 'input')
//         const actualInput: ICreateProductInput = variables?.input;
//         if (!actualInput) {
//           console.warn("No product input available for cache update");
//           return;
//         }
//         // Check if we have a valid product returned (post-mutation)
//         if (!data?.addProduct) return;

//         const existing: GetMyProductsData | null = cache.readQuery({
//           query: GET_MY_PRODUCTS,
//         });
//         console.log("existing", existing);
//         console.log("actualInput-->", actualInput);

//         // Generate temp ID and slug
//         const tempId = Date.now();
//         const slug = actualInput.name
//           ? actualInput.name
//               .toLowerCase()
//               .replace(/\s+/g, "-")
//               .replace(/[^a-z0-9-]/g, "")
//           : "temp-product";

//         // Single variant per schema (not array)
//         const variant = actualInput.variants
//           ? {
//               __typename: "ProductVariant",
//               ...actualInput.variants, // Spread sku, price, etc.
//             }
//           : null;

//         const optimisticProduct = {
//           __typename: "Product",
//           id: tempId,
//           name: actualInput.name,
//           slug,
//           description: actualInput.description,
//           brand: actualInput.brand,
//           category: actualInput.categoryId
//             ? {
//                 __typename: "Category",
//                 id: actualInput.categoryId,
//                 parent: null,
//                 children: [],
//               }
//             : null,
//           images:
//             actualInput.images?.map((img, index: number) => ({
//               // __typename: "ProductImage",
//               // id: `temp-img-${index}`,
//               url: img.url,
//               altText: img.altText || null,
//               sortOrder: img.sortOrder ?? index,
//               mediaType: img.mediaType || "PRIMARY",
//             })) || [],
//           variants: variant ? [variant] : [], // Server likely returns array, even if input is single
//         };

//         console.log(
//           "updated cache-->",
//           ...(existing?.getMyProducts || []),
//           optimisticProduct
//         );

//         const productExists = existing?.getMyProducts?.some(
//           (p: any) => p.id === optimisticProduct.id
//         );

//         if (!productExists) {
//           cache.writeQuery({
//             query: GET_MY_PRODUCTS,
//             data: {
//               getMyProducts: [
//                 ...(existing?.getMyProducts || []),
//                 optimisticProduct,
//               ],
//             },
//           });
//         }
//       } catch (error: any) {
//         console.error("Error updating cache:", error);
//       }
//     },
//   });

//   const handleSubmitHandler = async (productInput: ICreateProductInput) => {
//     try {
//       router.push("/products");
//       toast.success("Product has been created successfully!");

//       console.log("Product input:", productInput);

//       if (!productInput.name) {
//         throw new Error("Product name is required");
//       }

//       if (!productInput.images || productInput.images.length === 0) {
//         throw new Error("At least one image is required");
//       }

//       if (!productInput.variants?.sku) {
//         throw new Error("Product variant SKU is required");
//       }

//       // Log the exact variables being sent
//       const mutationVariables = { input: productInput };
//       console.log("Mutation variables:", mutationVariables);

//       const addProductResponse = await addProduct({
//         variables: mutationVariables,
//         optimisticResponse: {
//           addProduct: true,
//         },
//       });

//       console.log("Mutation response:", addProductResponse);

//       if (addProductResponse.data?.addProduct) {
//         // router.push("/products");
//         //   toast.success("Product has been created successfully!");
//       }
//     } catch (error: any) {
//       console.error("Error creating product:", error);
//       toast.error(
//         error.message || "Failed to create product. Please try again."
//       );
//     }
//   };

//   const handleDelete = async (productId: string) => {
//     try {
//       toast.success("Product has been deleted successfully!");

//       console.log("Deleting product with ID:", productId);

//       if (!productId) {
//         throw new Error("Product ID is required");
//       }

//       const deleteVariables = { productId };
//       console.log("Delete variables:", deleteVariables);

//       const deleteResponse = await deleteProduct({
//         variables: deleteVariables,
//         optimisticResponse: {
//           deleteProduct: true, // Fake success for immediate removal
//         },
//       });

//       console.log("Delete response:", deleteResponse);

//       if (deleteResponse.data?.deleteProduct) {
//       }
//     } catch (error: any) {
//       console.error("Error deleting product:", error);
//       toast.error(
//         error.message || "Failed to delete product. Please try again."
//       );
//       // Apollo auto-rolls back the optimistic removal on error
//     }
//   };

//   return {
//     handleSubmitHandler,
//     handleDelete,
//     productsData,
//     productsDataLoading,
//     productsDataError,
//     deleteProductLoading,
//     deleteProductError,
//   };
// };
