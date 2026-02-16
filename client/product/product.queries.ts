import { gql } from "@apollo/client";

export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories {
    categories {
      id
      name
      parentId
      children {
        id
        name
        parentId
        children {
          id
          name
          parentId
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

export const GET_PRODUCT = gql`
  query GetProduct($productId: ID!) {
    getProduct(productId: $productId) {
      id
      name
      slug
      description
      category {
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
      brand
      deliveryCharge
      specificationDisplayFormat
      specificationTable
      variants {
        sku
        price
        stock
        mrp
        stock
        attributes
        specificationTable
        specifications {
          key
          value
        }
      }
      productOffers {
        productId
        offer {
          title
          description
          type
          value
          startDate
          endDate
        }
      }
      deliveryOptions {
        title
        description
        isDefault
      }
      warranty {
        type
        duration
        unit
        description
      }
      returnPolicy {
        type
        duration
        unit
        conditions
      }
      images {
        url
        altText
        mediaType
        fileType
        sortOrder
      }
      category {
        id
        name
        parent {
          id
          name
          parent {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_MY_PRODUCTS = gql`
  query getMyProducts($skip: Int, $take: Int, $searchTerm: String, $status: String, $categoryId: String) {
    getMyProducts(skip: $skip, take: $take, searchTerm: $searchTerm, status: $status, categoryId: $categoryId) {
      products {
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
          id
          name
          parent {
            id
            name
          }
        }
      }
      totalCount
      percentChange
    }
  }
`;

export const GET_MY_PRODUCT_STATS = gql`
  query GetMyProductStats {
    getMyProductStats {
      total
      active
      outOfStock
      lowStock
    }
  }
`;

export const GET_INVENTORY = gql`
  query getMyProducts {
    getMyProducts {
      products {
        id
        name
        slug
        images {
          url
        }
        variants {
          id
          sku
          stock
          soldCount
        }
        status
      }
    }
  }
`;
