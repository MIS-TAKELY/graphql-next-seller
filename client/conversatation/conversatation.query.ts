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
        avatarImageUrl
      }
      sender {
        id
        firstName
        lastName
        email
        avatarImageUrl
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
          roles {
            role
          }
        }
      }
      unreadCount
      updatedAt
    }
  }
`;
