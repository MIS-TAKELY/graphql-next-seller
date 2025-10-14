import gql from "graphql-tag";

export const GET_CONVERSATIONS = gql`
  query GetConversations($recieverId: ID!) {
    conversations(recieverId: $recieverId) {
      id
      title
      reciever {
        id
        firstName
        lastName
        email
      }
      product {
        id
        name
        slug
      }
      lastMessage {
        id
        content
        sentAt
        sender {
          id
          role
        }
      }
      unreadCount
      updatedAt
    }
  }
`;
