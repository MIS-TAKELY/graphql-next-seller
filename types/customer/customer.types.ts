// types/customer/customer.types.ts

// User role types
export type Role = "BUYER" | "SELLER" | "ADMIN";

// User interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles?: [
    {
      role: Role;
    }
  ];
}

// Message types
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "SYSTEM";
export type FileType = "IMAGE" | "VIDEO" | "DOCUMENT";

// Message attachment interface
export interface MessageAttachment {
  id: string;
  url: string;
  type: FileType;
}

// Message interface
export interface Message {
  id: string;
  content?: string;
  type: MessageType;
  sentAt: string;
  isRead: boolean;
  sender: User;
  attachments?: MessageAttachment[];
  fileUrl?: string; // Legacy field, prefer attachments
  clientId?: string;
}

// Product interface (minimal for conversation context)
export interface Product {
  id: string;
  name: string;
  slug: string;
}

// Conversation interface
export interface Conversation {
  id: string;
  title: string;
  unreadCount: number;
  updatedAt: string;
  sender: User; // buyer who initiated
  reciever: User; // seller
  product: Product;
  lastMessage: Message;
}

// GraphQL response wrapper
export interface ConversationsResponse {
  conversations: Conversation[];
}
