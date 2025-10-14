// src/types/conversation.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: "BUYER" | "SELLER"; // optional
}

export interface Message {
  id: string;
  content: string;
  sentAt: string; // ISO date string
  sender: User;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
}

export interface Conversation {
  id: string;
  title: string;
  unreadCount: number;
  updatedAt: string; // ISO date string
  reciever: User;
  product: Product;
  lastMessage: Message;
}

// Wrapper for GraphQL response
export interface ConversationsResponse {
  conversations: Conversation[];
}
