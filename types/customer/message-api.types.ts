// types/customer/message-api.types.ts
// Message API input types

import type { MessageType, FileType } from "../common/enums";

export interface SendMessageInput {
  conversationId: string;
  content?: string;
  type: MessageType;
  attachments?: Array<{
    url: string;
    type: FileType;
  }>;
  clientId?: string;
}

