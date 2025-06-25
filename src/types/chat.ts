export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';
export type UserRole = 'JAMAAH' | 'AGEN' | 'ADMIN' | 'SUPERADMIN';
export type ConversationType = 'PRIVATE' | 'GROUP';

export interface ChatUser {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
}

export interface BaseMessage {
  type: MessageType;
  content: string;
  createdAt: string;
}

export interface Message extends BaseMessage {
  id: string;
  roomId: string;
  senderId: string;
  attachmentUrl: string | null;
  readAt: string | null;
  updatedAt: string;
  sender: ChatUser;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  otherUser: ChatUser;
  lastMessage: BaseMessage | null;
  lastReadAt: string | null;
}

export interface MessagesResponse {
  status: string;
  data: {
    messages: Message[];
  };
}

export interface ConversationsResponse {
  status: string;
  data: {
    conversations: Conversation[];
  };
}

export interface SendMessageRequest {
  content: string;
  type: MessageType;
}

export interface SendMessageResponse {
  status: string;
  data: Message;
}