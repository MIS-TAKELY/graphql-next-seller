import { gql } from "@apollo/client";

export const ADD_PRODUCT = gql`
  mutation AddProduct($input: CreateProductInput!) {
    addProduct(input: $input)
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input)
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId)
  }
`;

export const UPDATE_VARIANT_STOCK = gql`
  mutation UpdateVariantStock($variantId: ID!, $stock: Int!) {
    updateVariantStock(variantId: $variantId, stock: $stock) {
      id
      stock
    }
  }
`;

