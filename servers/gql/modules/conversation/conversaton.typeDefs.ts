// Updated servers/gql/conversationTypedefs.ts
import gql from "graphql-tag";

export const conversationTypedefs = gql`
  input CreateConversationInput {
    productId: ID!
    # buyerId and sellerId can be derived in resolver (buyer = current user, seller = product's seller)
  }

  type Conversation {
    id: ID!
    productId: ID!
    senderId: ID!
    recieverId: ID!
    title: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    product: Product!
    sender: User!
    reciever: User!
    messages: [Message!]!
    participants: [ConversationParticipant!]!
    lastMessage: Message
    unreadCount: Int!
  }

  type ConversationParticipant {
    id: ID!
    conversationId: ID!
    userId: ID!
    lastReadAt: DateTime
    user: User!
  }

  extend type Query {
    conversationByProduct(productId: ID!): Conversation
    conversations(recieverId: ID!): [Conversation!]!
  }

  extend type Mutation {
    createConversation(input: CreateConversationInput!): Conversation!
  }

  scalar DateTime
`;