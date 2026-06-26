import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

export interface ConversationRow {
  id: string;
  student_id: string;
  title: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: "student" | "ai" | "mentor";
  content: string;
  confidence: number | null;
  sources: string | null;
  needs_human: number;
  created_at: string;
}

export interface ChatSource {
  id: string;
  title: string;
  module: string | null;
  score: number;
  content?: string;
}

export function conversationTitle(message: string): string {
  const words = message.trim().split(/\s+/);
  const head = words.slice(0, 6).join(" ");
  return words.length > 6 ? `${head}…` : head;
}

export function createConversation(
  studentId: string,
  title: string
): ConversationRow {
  const id = randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO conversations (id, student_id, title) VALUES (?, ?, ?)`
  ).run(id, studentId, title);
  return {
    id,
    student_id: studentId,
    title,
    created_at: new Date().toISOString(),
  };
}

export function insertMessage(input: {
  conversationId: string;
  role: "student" | "ai" | "mentor";
  content: string;
  confidence?: number | null;
  sources?: ChatSource[] | null;
  needsHuman?: boolean;
}): MessageRow {
  const id = randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO messages (id, conversation_id, role, content, confidence, sources, needs_human)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.conversationId,
    input.role,
    input.content,
    input.confidence ?? null,
    input.sources ? JSON.stringify(input.sources) : null,
    input.needsHuman ? 1 : 0
  );

  const row = db
    .prepare(`SELECT * FROM messages WHERE id = ?`)
    .get(id) as MessageRow;
  return row;
}

export function listConversations(studentId: string): ConversationRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, student_id, title, created_at
       FROM conversations
       WHERE student_id = ?
       ORDER BY created_at DESC`
    )
    .all(studentId) as ConversationRow[];
}

export function getConversation(
  conversationId: string,
  studentId: string
): ConversationRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, student_id, title, created_at
       FROM conversations
       WHERE id = ? AND student_id = ?`
    )
    .get(conversationId, studentId) as ConversationRow | undefined;
  return row ?? null;
}

export function getMessages(conversationId: string): MessageRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, conversation_id, role, content, confidence, sources, needs_human, created_at
       FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC`
    )
    .all(conversationId) as MessageRow[];
}

export function parseMessageSources(sources: string | null): ChatSource[] {
  if (!sources) return [];
  try {
    return JSON.parse(sources) as ChatSource[];
  } catch {
    return [];
  }
}
