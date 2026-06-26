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

export interface ChatMessage {
  id: string;
  role: "student" | "ai" | "mentor";
  content: string;
  confidence?: number | null;
  sources?: ChatSource[];
  needsHuman?: boolean;
  createdAt?: string;
  streaming?: boolean;
}

export interface ChatMetaEvent {
  conversationId: string;
  sources: ChatSource[];
  confidence: number;
  needsHuman: boolean;
}
