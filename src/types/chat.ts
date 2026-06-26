export interface ChatSource {
  id: string;
  title: string;
  module: string | null;
  score: number;
  content?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export type EscalationStatus = "open" | "answered" | "closed";

export interface ChatMessage {
  id: string;
  role: "student" | "ai" | "mentor";
  content: string;
  confidence?: number | null;
  sources?: ChatSource[];
  needsHuman?: boolean;
  escalationStatus?: EscalationStatus | null;
  createdAt?: string;
  streaming?: boolean;
}

export interface ChatDoneEvent {
  messageId: string;
}

export interface ChatMetaEvent {
  conversationId: string;
  sources: ChatSource[];
  confidence: number;
  needsHuman: boolean;
}
