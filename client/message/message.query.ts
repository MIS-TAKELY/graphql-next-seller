import gql from "graphql-tag";

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      content
      type
      fileUrl
      isRead
      sentAt
      sender {
        id
        firstName
        lastName
        role
      }
    }
  }
`;