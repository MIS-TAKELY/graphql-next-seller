// client/message/message.query.ts
import gql from "graphql-tag";

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!, $limit: Int = 50, $offset: Int = 0) {
    messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
      id
      content
      type
      fileUrl
      isRead
      clientId
      sentAt
      sender {
        id
        firstName
        lastName
        role
      }
      attachments {
        id
        url
        type
      }
    }
  }
`;