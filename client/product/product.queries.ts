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
      variants {
        sku
        price
        stock
        mrp
        stock
        attributes
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
    }
  }
`;

export const GET_INVENTORY = gql`
  query getMyProducts {
    getMyProducts {
      products {
        id
        name
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
