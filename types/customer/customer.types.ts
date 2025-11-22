// types/customer/customer.types.ts
// Customer, message, and conversation types

import type { Role, MessageType, FileType } from "../common/enums";
import type { BaseEntity, Timestamps } from "../common/primitives";

// Re-export enums for convenience
export type { FileType, MessageType, Role };
// RoleType is already exported from ../common/enums

// User interface
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  roles?: Array<{
    role: Role;
  }>;
}

// Message attachment interface
export interface MessageAttachment extends BaseEntity {
  messageId: string;
  url: string;
  type: FileType;
}

// Message interface
export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  content?: string;
  type: MessageType;
  fileUrl?: string; // Legacy field, prefer attachments
  isRead: boolean;
  sentAt: string | Date;
  clientId?: string;
  sender: User;
  attachments?: MessageAttachment[];
}

// Product interface (minimal for conversation context)
export interface Product {
  id: string;
  name: string;
  slug: string;
}

// Conversation interface
export interface Conversation extends BaseEntity {
  productId: string;
  senderId: string;
  recieverId: string;
  title?: string;
  isActive: boolean;
  sender: User; // buyer who initiated
  reciever: User; // seller
  product: Product;
  lastMessage: Message;
  unreadCount?: number;
  updatedAt: string | Date;
}

// GraphQL response wrapper
export interface ConversationsResponse {
  conversations: Conversation[];
}
