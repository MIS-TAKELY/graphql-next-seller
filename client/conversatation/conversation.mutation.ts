import gql from "graphql-tag";

export const MARK_AS_READ = gql`
  mutation MarkAsRead($conversationId: ID!) {
    markAsRead(conversationId: $conversationId)
  }
`;
