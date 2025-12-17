import { gql } from "@apollo/client";

export const GET_SELLER_QUESTIONS = gql`
  query GetSellerQuestions {
    getSellerQuestions {
      id
      productId
      content
      createdAt
      user {
        firstName
        lastName
      }
      product {
        name
        images {
            url
        }
      }
      answers {
        id
        content
        createdAt
        seller {
          sellerProfile {
            shopName
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_QUESTIONS = gql`
  query GetProductQuestions($productId: ID!) {
    getProductQuestions(productId: $productId) {
      id
      productId
      content
      createdAt
      user {
        firstName
        lastName
      }
      answers {
        id
        content
        createdAt
        seller {
          sellerProfile {
            shopName
          }
        }
      }
    }
  }
`;

export const REPLY_TO_QUESTION = gql`
  mutation ReplyToQuestion($questionId: ID!, $content: String!) {
    replyToQuestion(questionId: $questionId, content: $content) {
      id
      questionId
      content
      createdAt
      seller {
        sellerProfile {
            shopName
        }
      }
    }
  }
`;
