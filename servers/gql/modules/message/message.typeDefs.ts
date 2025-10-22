// servers/gql/messageTypedefs.ts
import { gql } from "graphql-tag";

export const messageTypedefs = gql`
  enum MessageType {
    TEXT
    IMAGE
    VIDEO
    SYSTEM
  }

  enum FileType {
    IMAGE
    VIDEO
    DOCUMENT
  }

  scalar DateTime
  scalar Upload

  input SendMessageInput {
    conversationId: ID!
    content: String
    type: MessageType!
    attachments: [AttachmentInput]
    clientId: String
  }

  input AttachmentInput {
    url: String!
    type: FileType!
  }

  type Message {
    id: ID!
    conversationId: ID!
    recieverId: ID!
    content: String
    type: MessageType!
    fileUrl: String
    isRead: Boolean!
    sentAt: DateTime!
    attachments: [MessageAttachment!]!
    sender: User!
    clientId: String
  }

  type MessageAttachment {
    id: ID!
    url: String!
    type: FileType!
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): Message!
  }

  type Query {
    messages(conversationId: ID!, limit: Int = 20, offset: Int = 0): [Message!]!
  }
`;
  