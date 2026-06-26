import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { insertMessage } from "@/lib/chat-db";
import { ingestDocument } from "@/lib/ingest";
import { createNotification } from "@/lib/notifications-db";

export type EscalationStatus = "open" | "answered" | "closed";

export interface EscalationRow {
  id: string;
  message_id: string | null;
  conversation_id: string | null;
  student_id: string;
  question: string;
  status: EscalationStatus;
  mentor_id: string | null;
  mentor_answer: string | null;
  created_at: string;
  answered_at: string | null;
}

export interface EscalationWithContext extends EscalationRow {
  student_name: string;
  student_email: string;
  ai_answer: string | null;
  conversation_title: string | null;
}

function rowToEscalation(row: Record<string, unknown>): EscalationRow {
  return {
    id: row.id as string,
    message_id: (row.message_id as string) ?? null,
    conversation_id: (row.conversation_id as string) ?? null,
    student_id: row.student_id as string,
    question: row.question as string,
    status: row.status as EscalationStatus,
    mentor_id: (row.mentor_id as string) ?? null,
    mentor_answer: (row.mentor_answer as string) ?? null,
    created_at: row.created_at as string,
    answered_at: (row.answered_at as string) ?? null,
  };
}

export function getEscalationByMessageId(
  messageId: string
): EscalationRow | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM escalations WHERE message_id = ? ORDER BY created_at DESC LIMIT 1`)
    .get(messageId) as Record<string, unknown> | undefined;
  return row ? rowToEscalation(row) : null;
}

export function getOpenEscalationForMessage(
  messageId: string
): EscalationRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM escalations WHERE message_id = ? AND status = 'open' LIMIT 1`
    )
    .get(messageId) as Record<string, unknown> | undefined;
  return row ? rowToEscalation(row) : null;
}

export function getEscalationById(id: string): EscalationRow | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM escalations WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToEscalation(row) : null;
}

export function findPrecedingStudentQuestion(
  conversationId: string,
  aiMessageId: string
): string | null {
  const db = getDb();
  const messages = db
    .prepare(
      `SELECT id, role, content FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC`
    )
    .all(conversationId) as Array<{ id: string; role: string; content: string }>;

  let lastStudent: string | null = null;
  for (const msg of messages) {
    if (msg.id === aiMessageId) break;
    if (msg.role === "student") lastStudent = msg.content;
  }
  return lastStudent;
}

export function createEscalation(input: {
  messageId: string;
  conversationId: string;
  studentId: string;
  question: string;
}): EscalationRow {
  const existing = getOpenEscalationForMessage(input.messageId);
  if (existing) return existing;

  const id = randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO escalations (id, message_id, conversation_id, student_id, question, status)
     VALUES (?, ?, ?, ?, ?, 'open')`
  ).run(id, input.messageId, input.conversationId, input.studentId, input.question);

  return getEscalationById(id)!;
}

export function listEscalations(
  status?: EscalationStatus
): EscalationWithContext[] {
  const db = getDb();
  let sql = `
    SELECT
      e.*,
      u.full_name AS student_name,
      u.email AS student_email,
      m.content AS ai_answer,
      c.title AS conversation_title
    FROM escalations e
    INNER JOIN users u ON u.id = e.student_id
    LEFT JOIN messages m ON m.id = e.message_id
    LEFT JOIN conversations c ON c.id = e.conversation_id
  `;
  const params: string[] = [];
  if (status) {
    sql += ` WHERE e.status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY e.created_at DESC`;

  return (db.prepare(sql).all(...params) as Array<Record<string, unknown>>).map(
    (row) => ({
      ...rowToEscalation(row),
      student_name: row.student_name as string,
      student_email: row.student_email as string,
      ai_answer: (row.ai_answer as string) ?? null,
      conversation_title: (row.conversation_title as string) ?? null,
    })
  );
}

function deriveModuleFromMessage(messageId: string): string | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT sources FROM messages WHERE id = ?`)
    .get(messageId) as { sources: string | null } | undefined;
  if (!row?.sources) return null;
  try {
    const sources = JSON.parse(row.sources) as Array<{ module?: string | null }>;
    return sources.find((s) => s.module)?.module ?? null;
  } catch {
    return null;
  }
}

export async function answerEscalation(input: {
  escalationId: string;
  mentorId: string;
  answer: string;
}): Promise<EscalationRow> {
  const escalation = getEscalationById(input.escalationId);
  if (!escalation) throw new Error("Not found");
  if (escalation.status !== "open") throw new Error("Escalation is not open");
  if (!escalation.conversation_id) throw new Error("Missing conversation");

  const db = getDb();
  const answeredAt = new Date().toISOString();

  const run = db.transaction(() => {
    db.prepare(
      `UPDATE escalations
       SET mentor_answer = ?, mentor_id = ?, status = 'answered', answered_at = ?
       WHERE id = ?`
    ).run(input.answer, input.mentorId, answeredAt, input.escalationId);

    insertMessage({
      conversationId: escalation.conversation_id!,
      role: "mentor",
      content: input.answer,
    });

    createNotification({
      userId: escalation.student_id,
      type: "escalation_answered",
      payload: {
        conversationId: escalation.conversation_id ?? undefined,
        escalationId: escalation.id,
      },
    });
  });

  run();

  const kbModule =
    (escalation.message_id
      ? deriveModuleFromMessage(escalation.message_id)
      : null) ?? "General";

  const title =
    escalation.question.length > 80
      ? `${escalation.question.slice(0, 77)}…`
      : escalation.question;

  await ingestDocument({
    title: `Mentor answer: ${title}`,
    source_type: "mentor_answer",
    module: kbModule,
    topic: "Mentor Q&A",
    content: `Question: ${escalation.question}\n\nAnswer: ${input.answer}`,
    uploadedBy: input.mentorId,
  });

  return getEscalationById(input.escalationId)!;
}

export function getEscalationStatusesByMessageIds(
  messageIds: string[]
): Record<string, EscalationStatus> {
  if (messageIds.length === 0) return {};
  const db = getDb();
  const placeholders = messageIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT message_id, status FROM escalations
       WHERE message_id IN (${placeholders})
       ORDER BY created_at DESC`
    )
    .all(...messageIds) as Array<{
    message_id: string | null;
    status: EscalationStatus;
  }>;

  const result: Record<string, EscalationStatus> = {};
  for (const row of rows) {
    if (row.message_id && !result[row.message_id]) {
      result[row.message_id] = row.status;
    }
  }
  return result;
}

export function verifyMessageOwnership(
  messageId: string,
  studentId: string
): { conversationId: string; messageRole: string } | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT m.conversation_id, m.role, c.student_id
       FROM messages m
       INNER JOIN conversations c ON c.id = m.conversation_id
       WHERE m.id = ?`
    )
    .get(messageId) as
    | { conversation_id: string; role: string; student_id: string }
    | undefined;

  if (!row || row.student_id !== studentId) return null;
  return { conversationId: row.conversation_id, messageRole: row.role };
}
