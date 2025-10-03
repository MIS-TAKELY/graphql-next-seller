import { gql } from "@apollo/client";

export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories {
    categories {
      id
      name
      children {
        id
        name
        children {
          id
          name
        }
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      id
      name
      slug
      images {
        url
      }
      status
      variants {
        sku
        price
        stock
      }
      category {
        parent {
          name
          id
        }
      }
    }
  }
`;

export const GET_MY_PRODUCTS = gql`
  query getMyProducts {
    getMyProducts {
      id
      name
      slug
      images {
        url
      }
      status
      variants {
        sku
        price
        stock
      }
      category {
        parent {
          name
          id
        }
      }
    }
  }
`;
