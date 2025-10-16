import gql from "graphql-tag";

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      type
      fileUrl
      isRead
      sentAt
      clientId
      sender {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;
