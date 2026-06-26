import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  payload: string;
  read: number;
  created_at: string;
}

export interface NotificationPayload {
  conversationId?: string;
  escalationId?: string;
  [key: string]: unknown;
}

function rowToNotification(row: Record<string, unknown>): NotificationRow {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    type: row.type as string,
    payload: row.payload as string,
    read: row.read as number,
    created_at: row.created_at as string,
  };
}

export function createNotification(input: {
  userId: string;
  type: string;
  payload: NotificationPayload;
}): NotificationRow {
  const id = randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO notifications (id, user_id, type, payload) VALUES (?, ?, ?, ?)`
  ).run(id, input.userId, input.type, JSON.stringify(input.payload));

  return rowToNotification(
    db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(id) as Record<
      string,
      unknown
    >
  );
}

export function listNotifications(userId: string): NotificationRow[] {
  const db = getDb();
  return (
    db
      .prepare(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
      )
      .all(userId) as Array<Record<string, unknown>>
  ).map(rowToNotification);
}

export function countUnreadNotifications(userId: string): number {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0`
    )
    .get(userId) as { count: number };
  return row.count;
}

export function markNotificationRead(
  notificationId: string,
  userId: string
): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`
    )
    .run(notificationId, userId);
  return result.changes > 0;
}

export function parseNotificationPayload(
  payload: string
): NotificationPayload {
  try {
    return JSON.parse(payload) as NotificationPayload;
  } catch {
    return {};
  }
}
